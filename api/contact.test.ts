import { afterEach, describe, expect, it, vi } from "vitest";
import { escapeHtml } from "./_utils/contact.js";
import { createContactHandler } from "./contact/handler.js";
import { NoOpReporter, RecordingReporter, createSafeEvent } from "./contact/diagnostics.js";
import { createNoopLogger } from "./contact/logging.js";

const validBody = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+54 (11) 4567-8901",
  gymName: "Analytical Gym",
  members: "100_400",
  message: "I would like a demo.",
};

async function request(
  body: unknown = validBody,
  options: { method?: string; headers?: Record<string, string> } = {},
  send = vi.fn().mockResolvedValue({ kind: "accepted" } as unknown),
) {
  const headers = options.headers ?? { "content-type": "application/json; charset=utf-8" };
  const method = options.method ?? "POST";
  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD" && body !== undefined) (init as Record<string, unknown>).body = JSON.stringify(body);
  const req = new Request("https://example.com/api/contact", init);
  const deps = {
    delivery: { send: send as unknown as (msg: unknown) => Promise<unknown> },
    emailFrom: "from@example.com",
    emailTo: "to@example.com",
    verifier: null,
    limiter: null,
    createLogger: () => createNoopLogger(),
    getOriginInfo: async () => ({ normalizedIp: null, originKey: "test", fingerprint: "fp" }),
    reporter: new NoOpReporter(),
  } as unknown as Parameters<typeof createContactHandler>[0];
  const handler = createContactHandler(deps);
  const res = await handler(req);
  let parsed: unknown = null;
  try { parsed = await res.clone().json(); } catch { parsed = null; }
  const state = { status: res.status, body: parsed, headers: res.headers, raw: res };
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

    expect(state.status).toBe(200);
    expect((state.body as Record<string, unknown>).success).toBe(true);
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

  it("returns a generic 500 and logs one redacted event on provider failure", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const send = vi.fn().mockRejectedValue(
      new Error("SMTP 535 password=secret ada@example.com provider response"),
    );
    const { state } = await request(validBody, {}, send);

    expect(state.status).toBe(500);
    expect((state.body as Record<string, unknown>).error).toEqual(expect.objectContaining({ code: "delivery_failed" }));
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/secret|ada@example\.com|SMTP|535|provider response/);
  });
});

describe("contact handler — NEX-57 correlation", () => {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  it("accepts canonical UUID and returns matching header and body", async () => {
    const rid = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
    const req = new Request("https://example.com/api/contact", { method: "POST", headers: { "content-type": "application/json", "X-Request-ID": rid }, body: JSON.stringify(validBody) });
    const deps = { delivery: { send: vi.fn().mockResolvedValue({ kind: "accepted" }) }, emailFrom: "a", emailTo: "b", verifier: null, limiter: null, createLogger: () => createNoopLogger(), getOriginInfo: async () => ({ normalizedIp: null, originKey: "k", fingerprint: "fp" }), reporter: new NoOpReporter() } as unknown as Parameters<typeof createContactHandler>[0];
    const res = await createContactHandler(deps)(req);
    expect(res.headers.get("X-Request-ID")).toBe(rid);
    expect(res.headers.get("Access-Control-Expose-Headers")).toBe("X-Request-ID");
    const body = await res.clone().json() as Record<string, unknown>;
    expect((body as Record<string, unknown>).request_id).toBe(rid);
  });
  it("replaces absent/malformed/non-canonical/oversized IDs", async () => {
    const badIds = ["", "not-a-uuid", "A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D", "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d-extra", "x".repeat(100)];
    for (const bad of badIds) {
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (bad) headers["X-Request-ID"] = bad;
      const req = new Request("https://example.com/api/contact", { method: "POST", headers, body: JSON.stringify(validBody) });
      const deps = { delivery: { send: vi.fn().mockResolvedValue({ kind: "accepted" }) }, emailFrom: "a", emailTo: "b", verifier: null, limiter: null, createLogger: () => createNoopLogger(), getOriginInfo: async () => ({ normalizedIp: null, originKey: "k", fingerprint: "fp" }), reporter: new NoOpReporter() } as unknown as Parameters<typeof createContactHandler>[0];
      const res = await createContactHandler(deps)(req);
      const hid = res.headers.get("X-Request-ID") ?? "";
      expect(hid).toMatch(UUID_RE);
      expect(hid).toBe(hid.toLowerCase());
      if (bad) expect(hid).not.toBe(bad);
      const body = await res.clone().json() as Record<string, unknown>;
      const bid = (body.request_id as string) ?? (body.error as Record<string, unknown>)?.request_id;
      expect(bid).toBe(hid);
      if (bad) expect(JSON.stringify(body)).not.toContain(bad);
    }
  });
  it("expected 4xx produces zero reports and matching IDs", async () => {
    const rec = new RecordingReporter();
    const req = new Request("https://example.com/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...validBody, email: "bad" }) });
    const deps = { delivery: { send: vi.fn() }, emailFrom: "a", emailTo: "b", verifier: null, limiter: null, createLogger: () => createNoopLogger(), getOriginInfo: async () => ({ normalizedIp: null, originKey: "k", fingerprint: "fp" }), reporter: rec } as unknown as Parameters<typeof createContactHandler>[0];
    const res = await createContactHandler(deps)(req);
    expect(res.status).toBe(400);
    expect(rec.events.length).toBe(0);
    const hid = res.headers.get("X-Request-ID") ?? "";
    expect(hid).toMatch(UUID_RE);
    const body = await res.clone().json() as Record<string, unknown>;
    expect((body.error as Record<string, unknown>).request_id).toBe(hid);
  });
  it("unexpected failure reports exactly one allowlisted event", async () => {
    const rec = new RecordingReporter();
    const send = vi.fn().mockRejectedValue(new Error("secret 192.168.1.1 https://evil.com"));
    const req = new Request("https://example.com/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(validBody) });
    const deps = { delivery: { send }, emailFrom: "a", emailTo: "b", verifier: null, limiter: null, createLogger: () => createNoopLogger(), getOriginInfo: async () => ({ normalizedIp: null, originKey: "k", fingerprint: "fp" }), reporter: rec } as unknown as Parameters<typeof createContactHandler>[0];
    const res = await createContactHandler(deps)(req);
    expect(res.status).toBe(500);
    expect(rec.events.length).toBe(1);
    const ev = rec.events[0].toDict();
    expect(ev.runtime).toBe("landing-worker");
    expect(Object.keys(ev).sort()).toEqual(["event_name","public_error_code","request_id","route_template","runtime","severity","status_class"].sort());
    expect(JSON.stringify(ev)).not.toMatch(/secret|192\.168|evil/i);
    const hid = res.headers.get("X-Request-ID") ?? "";
    expect(ev.request_id).toBe(hid);
  });
  it("NoOpReporter and allowlist-only", async () => {
    const ev = createSafeEvent({ event_name: "test", severity: "error", runtime: "landing-worker", request_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", public_error_code: "x", status_class: "5xx", route_template: "/api/contact", token: "secret", extra: "drop" } as Record<string, unknown>);
    const dict = ev.toDict();
    expect(Object.keys(dict).length).toBe(7);
    expect((dict as unknown as Record<string, unknown>).token).toBeUndefined();
  });
});

describe("escapeHtml", () => {
  it("encodes ampersand, angle brackets, quotes, and apostrophes", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
