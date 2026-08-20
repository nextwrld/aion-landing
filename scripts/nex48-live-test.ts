// Prueba funcional REAL del Worker handler de NEX-48.
// Invoca api/contact.ts fetch(request, env, ctx) con:
//  - KV stub funcional (Map) para rate limiting
//  - interceptación de globalThis.fetch para simular el 2xx de Postmark
import assert from "node:assert";

function makeKv() {
  const store = new Map();
  return {
    async get(k, mode) {
      const v = store.get(k);
      if (v === undefined) return null;
      if (mode === "json") {
        try { return JSON.parse(v); } catch { return null; }
      }
      return v;
    },
    async put(k, v) { store.set(k, v); return undefined; },
    _store: store,
  };
}

let POSTMARK_HITS = 0;
// Interceptar fetch: si es a postmarkapp => 2xx fake; sino => fetch original (no usado)
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input.url);
  if (url.includes("postmarkapp.com")) {
    if (init && init.signal) {
      // AbortController timeout sincronía: no se aborta en éxito
    }
    POSTMARK_HITS++;
    return new Response(JSON.stringify({ MessageID: `fake-${POSTMARK_HITS}` }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  return originalFetch(input, init);
};

async function main() {
  const kv = makeKv();
  const worker = (await import("../api/contact.ts")).default;

  const env = {
    CONTACT_RATE_LIMIT_KV: kv,
    CONTACT_ANTIBOT_ENABLED: "false",
    CONTACT_RATE_LIMIT_ENABLED: "true",
    RATE_LIMIT_MAX: "5",
    RATE_LIMIT_WINDOW_SECONDS: "900",
    CONTACT_IP_HASH_KEY: "test-secret-key",
    POSTMARK_SERVER_TOKEN: "fake-token",
    POSTMARK_MESSAGE_STREAM: "outbound",
    EMAIL_FROM: "noreply@test.local",
    EMAIL_TO: "sales@test.local",
    EMAIL_HEADERS_TIMEOUT_MS: "5000",
    EMAIL_TOTAL_TIMEOUT_MS: "10000",
  };
  const ctx = { waitUntil() {} };

  const validBody = {
    fullName: "Test User",
    email: "test@example.com",
    phone: "+34 612 345 678",
    gymName: "Gym Test",
    members: "100_400",
    message: "Hola, quiero una demo",
  };

  let pass = 0;
  const results = [];

  async function req(path, body, ip = "203.0.113.7") {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    return worker.fetch(
      new Request(`http://fake.local${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", "cf-connecting-ip": ip },
        body: payload,
      }),
      env,
      ctx,
    );
  }
  const r = (n, c, d) => { results.push(`${c ? "✅" : "❌"} ${n}${c ? "" : " :: " + d}`); if (c) pass++; };

  // 1. 405 fuera de POST
  const r405 = await worker.fetch(new Request("http://fake.local/api/contact", { method: "GET" }), env, ctx);
  r("405 fuera de POST", r405.status === 405, `got ${r405.status}`);
  r("Allow: POST", r405.headers.get("allow") === "POST", r405.headers.get("allow"));

  // 2. 404 fuera de /api/contact
  const r404 = await worker.fetch(new Request("http://fake.local/other", { method: "POST" }), env, ctx);
  r("404 fuera de ruta", r404.status === 404, `got ${r404.status}`);

  // 3. 400 payload incompleto (falta fullName)
  const bad = { ...validBody }; delete bad.fullName;
  const r400 = await req("/api/contact", bad);
  r("400 payload incompleto", r400.status === 400, `got ${r400.status}`);

  // 4. Honeypot poblado => 403, NO envía correo
  const beforeHp = POSTMARK_HITS;
  const hp = await req("/api/contact", { ...validBody, website: "http://spam" });
  r("honeypot 403", hp.status === 403, `got ${hp.status}`);
  r("honeypot NO envía correo", POSTMARK_HITS === beforeHp, `hits ${POSTMARK_HITS}`);

  // 5-9. Rate limit: 5 válidas => 200, 6ta => 429
  const ok = [];
  for (let i = 0; i < 5; i++) { ok.push((await req("/api/contact", { ...validBody, email: `u${i}@test.com` })).status); }
  r("5 válidas => 200", ok.every((s) => s === 200), ok.join(","));
  const r429 = await req("/api/contact", validBody);
  r("6ta => 429", r429.status === 429, `got ${r429.status}`);
  r("429 con Retry-After", !!r429.headers.get("retry-after"), "no retry-after");

  // 10. Otra IP no limitada
  const rOther = await req("/api/contact", validBody, "198.51.100.9");
  r("otra IP no limitada", rOther.status === 200, `got ${rOther.status}`);

  // 11. Éxito real envió a Postmark (check hits)
  const beforeOk = POSTMARK_HITS;
  await req("/api/contact", { ...validBody, email: "final@test.com" }, "192.0.2.44");
  r("exito envia a Postmark", POSTMARK_HITS > beforeOk, `hits ${POSTMARK_HITS}`);

  console.log(`\n=== RESULTADOS (handler real sobre HTTP) ===`);
  console.log(results.join("\n"));
  console.log(`\n${pass}/11 checks reales pasaron. Envíos Postmark simulados: ${POSTMARK_HITS}`);
  if (pass !== 11) throw new Error(`Fallaron ${11 - pass} checks`);
  console.log("✅ PRUEBA FUNCIONAL REAL: OK");
}

main().catch((e) => { console.error(e); process.exit(1); });
