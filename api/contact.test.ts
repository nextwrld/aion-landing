import { afterEach, describe, expect, it, vi } from "vitest";
import { escapeHtml } from "./_utils/contact.js";
import { createContactHandler } from "./contact.js";

const validBody = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+54 (11) 4567-8901",
  gymName: "Analytical Gym",
  members: "100_400",
  message: "I would like a demo.",
};

function response() {
  const state = { status: 0, body: undefined as unknown };
  const res = {
    status(code: number) {
      state.status = code;
      return res;
    },
    json(body: unknown) {
      state.body = body;
      return res;
    },
  };
  return { res, state };
}

async function request(
  body: unknown = validBody,
  options: { method?: string; headers?: Record<string, string> } = {},
  send = vi.fn().mockResolvedValue({}),
) {
  const { res, state } = response();
  await createContactHandler(send)(
    {
      method: options.method ?? "POST",
      headers: options.headers ?? { "content-type": "application/json; charset=utf-8" },
      body,
    },
    res,
  );
  return { send, state };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("contact handler", () => {
  it("sends a trimmed, normalized, localized contact email", async () => {
    const { send, state } = await request({
      ...validBody,
      fullName: "  Ada Lovelace  ",
      phone: "  +54 (11) 4567-8901  ",
      message: "First line\r\nSecond line",
    });

    expect(state).toEqual({
      status: 200,
      body: { success: true, message: "Email sent successfully" },
    });
    expect(send).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Solicitud de DEMO AION WELLNESS y contacto: Ada Lovelace",
        html: expect.stringContaining("First line\nSecond line"),
      }),
    );
    expect(send.mock.calls[0][0].html).toContain("100 - 400");
  });

  it("rejects the wrong method", async () => {
    const { send, state } = await request(validBody, { method: "GET" });
    expect(state.status).toBe(405);
    expect(send).not.toHaveBeenCalled();
  });

  it.each([undefined, "text/plain", "application/json-patch+json", "application/json; boundary=x"])(
    "rejects unsupported content type %s",
    async (contentType) => {
      const headers: Record<string, string> =
        contentType === undefined ? {} : { "content-type": contentType };
      const { state } = await request(validBody, { headers });
      expect(state.status).toBe(415);
    },
  );

  it.each([null, [], "body", 42])("rejects non-object body %#", async (body) => {
    const { state } = await request(body);
    expect(state.status).toBe(400);
  });

  it.each(Object.keys(validBody))("requires %s", async (field) => {
    const body: Record<string, unknown> = { ...validBody };
    delete body[field];
    const { state } = await request(body);
    expect(state.status).toBe(400);
  });

  it.each(Object.keys(validBody))("requires %s to be a string", async (field) => {
    const { state } = await request({ ...validBody, [field]: 123 });
    expect(state.status).toBe(400);
  });

  it("rejects unknown fields", async () => {
    const { state } = await request({ ...validBody, campaign: "private" });
    expect(state.status).toBe(400);
  });

  it.each([
    ["fullName", 101],
    ["email", 255],
    ["phone", 33],
    ["gymName", 121],
    ["message", 2001],
  ])("rejects %s over its %i character limit", async (field, length) => {
    const { state } = await request({ ...validBody, [field]: "a".repeat(length as number) });
    expect(state.status).toBe(400);
  });

  it.each(["not-an-email", "a@b", "a b@example.com"])("rejects bad email %s", async (email) => {
    const { state } = await request({ ...validBody, email });
    expect(state.status).toBe(400);
  });

  it.each(["123456", "1234567890123456", "+1 234 ABC 890", "123/456/7890"])(
    "rejects bad phone %s",
    async (phone) => {
      const { state } = await request({ ...validBody, phone });
      expect(state.status).toBe(400);
    },
  );

  it.each(["translated label", "small", ""])("rejects unstable member value %s", async (members) => {
    const { state } = await request({ ...validBody, members });
    expect(state.status).toBe(400);
  });

  it("rejects a body over the declared size policy", async () => {
    const { state } = await request(validBody, {
      headers: { "content-type": "application/json", "content-length": "16385" },
    });
    expect(state.status).toBe(413);
  });

  it("rejects a body over the post-parse serialized size policy", async () => {
    const { state } = await request({ ...validBody, padding: "x".repeat(16 * 1024) });
    expect(state.status).toBe(413);
  });

  it("escapes every HTML metacharacter in dynamic values", async () => {
    const injection = `<img src=x onerror="alert('x')"> &`;
    const { send, state } = await request({
      ...validBody,
      fullName: injection,
      gymName: injection,
      message: injection,
    });
    const html = send.mock.calls[0][0].html as string;

    expect(state.status).toBe(200);
    expect(html).not.toContain(injection);
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt; &amp;");
  });

  it.each(["Ada\r\nBcc: victim@example.com", "Ada\nInjected", "Ada\u0007Bell"])(
    "rejects subject-derived control injection",
    async (fullName) => {
      const { send, state } = await request({ ...validBody, fullName });
      expect(state.status).toBe(400);
      expect(send).not.toHaveBeenCalled();
    },
  );

  it("returns a generic 502 and logs one redacted event on provider failure", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const send = vi.fn().mockRejectedValue(
      new Error("SMTP 535 password=secret ada@example.com provider response"),
    );
    const { state } = await request(validBody, {}, send);

    expect(state).toEqual({
      status: 502,
      body: { error: "Unable to send message. Please try again later." },
    });
    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith({ event: "contact_email_provider_failure" });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/secret|ada@example\.com|SMTP|535|provider response/);
  });
});

describe("escapeHtml", () => {
  it("encodes ampersand, angle brackets, quotes, and apostrophes", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
