import { describe, expect, it, vi } from "vitest";
import { createContactHandler } from "./contact/handler.js";
import { TurnstileVerifier } from "./contact/antibot.js";
import { BackendTrialSignupClient } from "./contact/trial-signup.js";
import { NoOpReporter } from "./contact/diagnostics.js";
import { createNoopLogger } from "./contact/logging.js";

const validBody = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+54 (11) 4567-8901",
  gymName: "Analytical Gym",
  country: "mx",
  members: "100_400",
  message: "Quiero probar.",
  turnstileToken: "tok",
};

type Overrides = {
  verifier?: unknown;
  limiter?: unknown;
  trial?: ReturnType<typeof vi.fn>;
  send?: ReturnType<typeof vi.fn>;
  body?: unknown;
};

async function call(o: Overrides = {}) {
  const send = o.send ?? vi.fn().mockResolvedValue({ kind: "accepted" });
  const trial = o.trial ?? vi.fn().mockResolvedValue({ kind: "accepted" });
  const deps = {
    delivery: { send },
    emailFrom: "from@example.com",
    emailTo: "to@example.com",
    verifier: o.verifier ?? { verify: vi.fn().mockResolvedValue({ kind: "valid" }) },
    limiter: o.limiter ?? { consume: vi.fn().mockResolvedValue({ kind: "allowed" }) },
    trialSignup: { request: trial },
    createLogger: () => createNoopLogger(),
    getOriginInfo: async () => ({ normalizedIp: "1.2.3.4", originKey: "k", fingerprint: "fp" }),
    reporter: new NoOpReporter(),
  } as unknown as Parameters<typeof createContactHandler>[0];
  const req = new Request("https://example.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(o.body ?? validBody),
  });
  const res = await createContactHandler(deps)(req);
  return { res, send, trial };
}

describe("contact handler — self-serve trial", () => {
  // The backend emails the prospect and the team (SMTP); the Worker sends no email here.
  it("creates the trial signup without sending email from the Worker", async () => {
    const { res, send, trial } = await call();
    expect(res.status).toBe(200);
    expect(trial).toHaveBeenCalledWith({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      gymName: "Analytical Gym",
      phone: "+54 (11) 4567-8901",
      country: "MX",
    });
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 500 when the backend fails", async () => {
    const { res, send } = await call({ trial: vi.fn().mockResolvedValue({ kind: "failed" }) });
    expect(res.status).toBe(500);
    expect(send).not.toHaveBeenCalled();
  });

  it("fails closed when the anti-bot check is unavailable", async () => {
    const verifier = { verify: vi.fn().mockResolvedValue({ kind: "unavailable", reason: "network" }) };
    const { res, trial, send } = await call({ verifier });
    expect(res.status).toBe(503);
    expect(trial).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("fails closed when the anti-bot check throws", async () => {
    const verifier = { verify: vi.fn().mockRejectedValue(new Error("boom")) };
    const { res, trial } = await call({ verifier });
    expect(res.status).toBe(503);
    expect(trial).not.toHaveBeenCalled();
  });

  it("fails closed when the rate limiter is unavailable", async () => {
    const limiter = { consume: vi.fn().mockResolvedValue({ kind: "unavailable", reason: "kv" }) };
    const { res, trial } = await call({ limiter });
    expect(res.status).toBe(503);
    expect(trial).not.toHaveBeenCalled();
  });

  it("blocks the honeypot before any outside call", async () => {
    const { res, trial, send } = await call({ body: { ...validBody, website: "x" } });
    expect(res.status).toBe(403);
    expect(trial).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});

function siteverify(result: Record<string, unknown>) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(result), { status: 200 }));
}

describe("TurnstileVerifier — action and hostname", () => {
  const opts = { secret: "s", expectedAction: "trial_signup", expectedHostnames: ["aion.example"] };

  it("accepts a matching action and hostname", async () => {
    const v = new TurnstileVerifier({ ...opts, fetchImpl: siteverify({ success: true, action: "trial_signup", hostname: "aion.example" }) });
    expect(await v.verify({ token: "t", remoteIp: null })).toEqual({ kind: "valid" });
  });

  it("rejects another action", async () => {
    const v = new TurnstileVerifier({ ...opts, fetchImpl: siteverify({ success: true, action: "login", hostname: "aion.example" }) });
    expect((await v.verify({ token: "t", remoteIp: null })).kind).toBe("invalid");
  });

  it("rejects another hostname", async () => {
    const v = new TurnstileVerifier({ ...opts, fetchImpl: siteverify({ success: true, action: "trial_signup", hostname: "evil.example" }) });
    expect((await v.verify({ token: "t", remoteIp: null })).kind).toBe("invalid");
  });

  it("is unavailable without a hostname allowlist", async () => {
    const v = new TurnstileVerifier({ ...opts, expectedHostnames: [], fetchImpl: siteverify({ success: true }) });
    expect((await v.verify({ token: "t", remoteIp: null })).kind).toBe("unavailable");
  });
});

describe("BackendTrialSignupClient", () => {
  it("posts the signup with the shared secret", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 202 }));
    const client = new BackendTrialSignupClient({ url: "https://api.example/v1/public/trial-signups", secret: "sh", fetchImpl });
    const out = await client.request({ fullName: "A", email: "a@b.c", gymName: "G", phone: "1", country: "US" });
    expect(out).toEqual({ kind: "accepted" });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.example/v1/public/trial-signups");
    expect(init.headers["X-Trial-Signup-Secret"]).toBe("sh");
    expect(JSON.parse(init.body)).toEqual({ full_name: "A", email: "a@b.c", gym_name: "G", phone: "1", country_code: "US" });
  });

  it("reports failure on a non-2xx answer or network error", async () => {
    const bad = new BackendTrialSignupClient({ url: "u", secret: "s", fetchImpl: vi.fn().mockResolvedValue(new Response("", { status: 404 })) });
    const down = new BackendTrialSignupClient({ url: "u", secret: "s", fetchImpl: vi.fn().mockRejectedValue(new Error("x")) });
    expect(await bad.request({ fullName: "A", email: "a@b.c", gymName: "G", phone: "1", country: "US" })).toEqual({ kind: "failed" });
    expect(await down.request({ fullName: "A", email: "a@b.c", gymName: "G", phone: "1", country: "US" })).toEqual({ kind: "failed" });
  });
});
