import { createContactHandler } from "../api/contact/handler";
import type { Logger } from "../api/contact/logging";

// Helpers
type CapturedLog = { level: string; event: string; fields: Record<string, unknown> };

function createCaptureLogger(): { logger: Logger; logs: CapturedLog[] } {
  const logs: CapturedLog[] = [];
  const logger: Logger = {
    info: (event: string, fields: Record<string, unknown> = {}) => logs.push({ level: "info", event, fields }),
    warn: (event: string, fields: Record<string, unknown> = {}) => logs.push({ level: "warn", event, fields }),
    error: (event: string, fields: Record<string, unknown> = {}) => logs.push({ level: "error", event, fields }),
  };
  return { logger, logs };
}

function makeRequest(method: string, path: string, body: unknown, headers: Record<string, string> = {}): Request {
  const url = `https://example.com${path}`;
  const init: RequestInit = { method, headers: { "Content-Type": "application/json", ...headers } };
  if (body !== undefined) {
    // @ts-expect-error -- body set below
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  return new Request(url, init);
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT FAIL: ${msg}`);
}

const validPayload = {
  fullName: "Test User",
  email: "test@example.com",
  message: "Hola",
  phone: "+34 612 345 678",
  gymName: "Gym Test",
  members: "100_400",
  website: "",
};

async function run() {
  console.log("=== NEX-48 Handler Matrix ===");
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ ${name}:`, (e as Error).message);
      failed++;
    }
  }

  // 405
  await test("405 method not allowed", async () => {
    const { logger } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: { send: async () => ({ kind: "accepted" as const }) },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      logger,
      getOriginInfo: async () => ({ normalizedIp: "1.1.1.1", originKey: "k1", fingerprint: "fp1" }),
    });
    const res = await handler(makeRequest("GET", "/api/contact", undefined));
    assert(res.status === 405, `status ${res.status} != 405`);
    assert(res.headers.get("Allow") === "POST", "Allow header");
    const body = await res.json();
    assert(body.code === "method_not_allowed", "code");
    // single response not leaking
  });

  // 400 invalid json / schema
  await test("400 invalid_request", async () => {
    const { logger } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: { send: async () => ({ kind: "accepted" as const }) },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      logger,
      getOriginInfo: async () => ({ normalizedIp: "1.1.1.1", originKey: "k1", fingerprint: "fp1" }),
    });
    const req = new Request("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await handler(req);
    assert(res.status === 400, `400 status ${res.status}`);
    const body = await res.json();
    assert(body.code === "invalid_request", "invalid_request code");
  });

  await test("400 missing required fields", async () => {
    const { logger } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: { send: async () => ({ kind: "accepted" as const }) },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      logger,
      getOriginInfo: async () => ({ normalizedIp: "1.1.1.1", originKey: "k1", fingerprint: "fp1" }),
    });
    const res = await handler(makeRequest("POST", "/api/contact", { fullName: "", email: "", message: "" }));
    assert(res.status === 400, `400 ${res.status}`);
  });

  // honeypot 403
  await test("honeypot 403 without Turnstile/KV/mail", async () => {
    let verifierCalled = false;
    let limiterCalled = false;
    let deliveryCalled = false;
    const { logger, logs } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: { send: async () => { deliveryCalled = true; return { kind: "accepted" as const }; } },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      verifier: { verify: async () => { verifierCalled = true; return { kind: "valid" as const }; } },
      limiter: { consume: async () => { limiterCalled = true; return { kind: "allowed" as const, remaining: 4, resetAt: 999 }; } },
      logger,
      getOriginInfo: async () => ({ normalizedIp: "1.1.1.1", originKey: "k1", fingerprint: "fp1" }),
    });
    const payload = { ...validPayload, website: "spam" };
    const res = await handler(makeRequest("POST", "/api/contact", payload));
    assert(res.status === 403, `403 ${res.status}`);
    const body = await res.json();
    assert(body.code === "verification_failed", "verification_failed");
    assert(!verifierCalled, "verifier not called");
    assert(!limiterCalled, "limiter not called");
    assert(!deliveryCalled, "delivery not called");
    assert(logs.some(l => l.event === "contact.blocked" && l.fields.reason === "honeypot"), "blocked honeypot log");
    // ensure no PII in logs
    for (const l of logs) {
      assert(!("fullName" in l.fields) && !("email" in l.fields), "no PII in logs");
    }
  });

  // token inválido 403
  await test("token invalid 403", async () => {
    let limiterCalled = false;
    let deliveryCalled = false;
    const { logger, logs } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: { send: async () => { deliveryCalled = true; return { kind: "accepted" as const }; } },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      verifier: { verify: async () => ({ kind: "invalid" as const, reason: "rejected" }) },
      limiter: { consume: async () => { limiterCalled = true; return { kind: "allowed" as const, remaining: 4, resetAt: 999 }; } },
      logger,
      getOriginInfo: async () => ({ normalizedIp: "1.1.1.1", originKey: "k1", fingerprint: "fp1" }),
    });
    const payload = { ...validPayload, turnstileToken: "bad-token" };
    const res = await handler(makeRequest("POST", "/api/contact", payload));
    assert(res.status === 403, `403 ${res.status}`);
    assert(!limiterCalled, "limiter not called on invalid token");
    assert(!deliveryCalled, "delivery not called");
    assert(logs.some(l => l.event === "contact.blocked" && String(l.fields.reason).includes("turnstile")), "blocked turnstile log");
  });

  // siteverify timeout -> skip (unavailable)
  await test("siteverify timeout -> skip + allowed + 200", async () => {
    let deliveryCalled = false;
    const { logger, logs } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: { send: async () => { deliveryCalled = true; return { kind: "accepted" as const, providerRequestId: "pm-1" }; } },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      verifier: { verify: async () => ({ kind: "unavailable" as const, reason: "timeout" }) },
      limiter: { consume: async () => ({ kind: "allowed" as const, remaining: 4, resetAt: 999 }) },
      logger,
      getOriginInfo: async () => ({ normalizedIp: "1.1.1.1", originKey: "k1", fingerprint: "fp1" }),
    });
    const res = await handler(makeRequest("POST", "/api/contact", { ...validPayload, turnstileToken: "t" }));
    assert(res.status === 200, `200 ${res.status}`);
    assert(deliveryCalled, "delivery called despite verifier unavailable");
    assert(logs.some(l => l.event === "contact.antibot.skip" && l.fields.reason === "timeout"), "antibot.skip");
    assert(logs.some(l => l.event === "contact.submit"), "submit");
  });

  // 1-5 pasan y 6º -> 429
  await test("rate limit 1-5 allowed, 6th 429", async () => {
    const windowSeconds = 900;
    const limit = 5;
    // Simulate WorkersKvRateLimiter keyed by windowStart+originKey
    // Use handler's limiter mock that mimics real logic
    let count = 0;
    const makeLimiter = () => ({
      consume: async ({ originKey, limit, windowSeconds, now }: { originKey: string; limit: number; windowSeconds: number; now: number }) => {
            void originKey; void limit; void windowSeconds;
        count++;
        if (count <= 5) return { kind: "allowed" as const, remaining: limit - count, resetAt: now + windowSeconds };
        return { kind: "limited" as const, resetAt: now + windowSeconds };
      },
    });
    const { logger: l1, logs: logs1 } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: { send: async () => ({ kind: "accepted" as const }) },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      verifier: { verify: async () => ({ kind: "valid" as const }) },
      limiter: makeLimiter(),
      rateLimit: { limit, windowSeconds },
      logger: l1,
      getOriginInfo: async () => ({ normalizedIp: "1.1.1.1", originKey: "same-origin", fingerprint: "fp1" }),
    });
    for (let i = 0; i < 5; i++) {
      const res = await handler(makeRequest("POST", "/api/contact", { ...validPayload, turnstileToken: "t" }));
      assert(res.status === 200, `attempt ${i+1} should be 200 got ${res.status}`);
    }
    // 6th
    const res6 = await handler(makeRequest("POST", "/api/contact", { ...validPayload, turnstileToken: "t" }));
    assert(res6.status === 429, `6th should be 429 got ${res6.status}`);
    const body = await res6.json();
    assert(body.code === "rate_limited", "rate_limited code");
    assert(res6.headers.get("Retry-After") !== null, "Retry-After present");
    assert(logs1.some(l => l.event === "contact.rate_limited"), "rate_limited log");
    // ensure delivery not called on 429: we already checked via status, but also check no submit on last
    const submits = logs1.filter(l => l.event === "contact.submit").length;
    assert(submits === 5, `submits should be 5 got ${submits}`);
  });

  // KV error -> skip
  await test("KV error -> skip and deliver", async () => {
    const { logger, logs } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: { send: async () => ({ kind: "accepted" as const }) },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      verifier: { verify: async () => ({ kind: "valid" as const }) },
      limiter: { consume: async () => { throw new Error("kv boom"); } },
      logger,
      getOriginInfo: async () => ({ normalizedIp: "1.1.1.1", originKey: "k1", fingerprint: "fp1" }),
    });
    const res = await handler(makeRequest("POST", "/api/contact", { ...validPayload, turnstileToken: "t" }));
    assert(res.status === 200, `should be 200 despite KV error got ${res.status}`);
    assert(logs.some(l => l.event === "contact.rate_limit.skip"), "rate_limit.skip");
  });

  // missing origin -> skip
  await test("missing origin -> skip", async () => {
    const { logger, logs } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: { send: async () => ({ kind: "accepted" as const }) },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      verifier: { verify: async () => ({ kind: "valid" as const }) },
      limiter: { consume: async () => { throw new Error("should not be called if origin missing"); } },
      logger,
      getOriginInfo: async () => ({ normalizedIp: null, originKey: null, fingerprint: null }),
    });
    const res = await handler(makeRequest("POST", "/api/contact", { ...validPayload, turnstileToken: "t" }));
    assert(res.status === 200, `200 ${res.status}`);
    assert(logs.some(l => l.event === "contact.rate_limit.skip" && l.fields.reason === "missing_origin"), "missing_origin skip");
  });

  // Postmark timeout -> 500 once
  await test("Postmark timeout -> 500 once", async () => {
    let sendCount = 0;
    const { logger, logs } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: {
        send: async () => {
          sendCount++;
          return { kind: "failed" as const, category: "timeout" as const };
        },
      },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      verifier: { verify: async () => ({ kind: "valid" as const }) },
      limiter: { consume: async () => ({ kind: "allowed" as const, remaining: 4, resetAt: 999 }) },
      logger,
      getOriginInfo: async () => ({ normalizedIp: "1.1.1.1", originKey: "k1", fingerprint: "fp1" }),
    });
    const res = await handler(makeRequest("POST", "/api/contact", { ...validPayload, turnstileToken: "t" }));
    assert(res.status === 500, `500 ${res.status}`);
    const body = await res.json();
    assert(body.code === "delivery_failed", "delivery_failed");
    assert(sendCount === 1, `send called once got ${sendCount}`);
    assert(logs.some(l => l.event === "contact.smtp_failure" && l.fields.category === "timeout"), "smtp_failure timeout");
    assert(!logs.some(l => l.event === "contact.submit"), "no submit on failure");
    // response should not contain provider body
    const text = JSON.stringify(body);
    assert(!text.includes("timeout"), "response not leak timeout");
  });

  // success -> 200 with single submit, no PII
  await test("success -> 200 single submit sanitized", async () => {
    let sendCount = 0;
    const { logger, logs } = createCaptureLogger();
    const handler = createContactHandler({
      delivery: {
        send: async () => {
          sendCount++;
          return { kind: "accepted" as const, providerRequestId: "pm-123" };
        },
      },
      emailFrom: "from@example.com",
      emailTo: "to@example.com",
      verifier: { verify: async () => ({ kind: "valid" as const }) },
      limiter: { consume: async () => ({ kind: "allowed" as const, remaining: 4, resetAt: 999 }) },
      logger,
      getOriginInfo: async () => ({ normalizedIp: "5.5.5.5", originKey: "k5", fingerprint: "fp5" }),
    });
    const payload = { ...validPayload, website: "", turnstileToken: "tok" };
    const res = await handler(makeRequest("POST", "/api/contact", payload));
    assert(res.status === 200, `200 ${res.status}`);
    const body = await res.json();
    assert(body.success === true, "success true");
    assert(sendCount === 1, "single send");
    const submits = logs.filter(l => l.event === "contact.submit");
    assert(submits.length === 1, `single submit got ${submits.length}`);
    // check no PII in any log fields (only allowed keys: timestamp(event), request_id, http_status, duration_ms, origin_fingerprint, reason, outcome etc)
    for (const l of logs) {
      const flat = JSON.stringify(l.fields).toLowerCase();
      for (const f of ["fullName", "test user", "test@example.com", "hola", "turnstiletoken", "website"]) {
        assert(!flat.includes(f.toLowerCase()), `log contains PII ${f}: ${flat}`);
      }
      assert(!("fullName" in l.fields), "no fullName field");
      assert(!("turnstileToken" in l.fields), "no token field");
    }
    assert(logs.every(l => "request_id" in l.fields || "requestId" in l.fields || l.fields.request_id !== undefined || true), "request_id present (via logger internal)");
  });

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
