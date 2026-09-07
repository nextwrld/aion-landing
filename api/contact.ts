import { createContactHandler } from "./contact/handler";
import { PostmarkEmailDelivery } from "./contact/email-delivery";
import { createJsonLogger } from "./contact/logging";
import { getOriginInfo } from "./contact/origin";
import { getReporter } from "./contact/diagnostics.js";
import {
  WorkersKvRateLimiter,
  parseRateLimitEnabled,
  parsePositiveInt,
} from "./contact/rate-limiter";
import {
  NoOpAntiBotVerifier,
  TurnstileVerifier,
  parseAntibotEnabled,
  parseVerifyTimeoutMs,
} from "./contact/antibot";

export interface Env {
  CONTACT_RATE_LIMIT_KV?: KVNamespace;
  CONTACT_ANTIBOT_ENABLED?: string;
  CONTACT_RATE_LIMIT_ENABLED?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW_SECONDS?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_IP_HASH_KEY?: string;
  POSTMARK_SERVER_TOKEN?: string;
  POSTMARK_MESSAGE_STREAM?: string;
  EMAIL_FROM?: string;
  EMAIL_TO?: string;
  EMAIL_HEADERS_TIMEOUT_MS?: string;
  EMAIL_TOTAL_TIMEOUT_MS?: string;
  TURNSTILE_VERIFY_TIMEOUT_MS?: string;
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function createDependencies(env: Env, _ctx: ExecutionContext) {
  void _ctx;
  const headersTimeoutMs = parseNumber(env.EMAIL_HEADERS_TIMEOUT_MS, 10_000);
  const totalTimeoutMs = parseNumber(env.EMAIL_TOTAL_TIMEOUT_MS, 20_000);

  const delivery = new PostmarkEmailDelivery({
    serverToken: env.POSTMARK_SERVER_TOKEN,
    messageStream: env.POSTMARK_MESSAGE_STREAM ?? "outbound",
    headersTimeoutMs,
    totalTimeoutMs,
  });

  // Fase 4 — Anti-bot verifier wiring (kill-switch CONTACT_ANTIBOT_ENABLED)
  const antibotEnabled = parseAntibotEnabled(env.CONTACT_ANTIBOT_ENABLED, true);
  const verifyTimeoutMs = parseVerifyTimeoutMs(env.TURNSTILE_VERIFY_TIMEOUT_MS, 5_000);
  const verifier = antibotEnabled
    ? new TurnstileVerifier({
        secret: env.TURNSTILE_SECRET_KEY,
        timeoutMs: verifyTimeoutMs,
      })
    : new NoOpAntiBotVerifier();

  // Fase 3 — Rate limiter wiring (kill-switch CONTACT_RATE_LIMIT_ENABLED)
  const rateLimitEnabled = parseRateLimitEnabled(env.CONTACT_RATE_LIMIT_ENABLED, true);
  const rateLimitMax = parsePositiveInt(env.RATE_LIMIT_MAX, 5);
  const rateLimitWindowSeconds = parsePositiveInt(env.RATE_LIMIT_WINDOW_SECONDS, 900);
  const limiter = new WorkersKvRateLimiter({
    kv: env.CONTACT_RATE_LIMIT_KV,
    enabled: rateLimitEnabled,
    limit: rateLimitMax,
    windowSeconds: rateLimitWindowSeconds,
  });

  return {
    delivery,
    emailFrom: env.EMAIL_FROM ?? "",
    emailTo: env.EMAIL_TO ?? env.EMAIL_FROM ?? "contact@nextwrld.com",
    verifier,
    limiter,
    rateLimit: { limit: rateLimitMax, windowSeconds: rateLimitWindowSeconds },
    createLogger: (requestId: string) => createJsonLogger(requestId),
    getOriginInfo: (req: Request) => getOriginInfo(req, env.CONTACT_IP_HASH_KEY),
    hashKey: env.CONTACT_IP_HASH_KEY,
    reporter: getReporter(),
  };
}

function getRequestIdForFetch(request: Request): string {
  const raw = (request.headers.get("X-Request-ID") ?? request.headers.get("x-request-id") ?? "").trim();
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  if (raw.length === 36 && uuidRe.test(raw) && raw === raw.toLowerCase()) return raw;
  try {
    return crypto.randomUUID().toLowerCase();
  } catch {
    const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") {
      const requestId = getRequestIdForFetch(request);
      return new Response(
        JSON.stringify({ error: { code: "not_found", message: "Not found", request_id: requestId } }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
            "Access-Control-Expose-Headers": "X-Request-ID",
          },
        },
      );
    }
    const deps = createDependencies(env, ctx);
    const handler = createContactHandler(deps);
    return handler(request);
  },
};
