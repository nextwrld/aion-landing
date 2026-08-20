import { createContactHandler } from "./contact/handler";
import { PostmarkEmailDelivery } from "./contact/email-delivery";
import { createJsonLogger } from "./contact/logging";
import { getOriginInfo } from "./contact/origin";
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
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") {
      return new Response(JSON.stringify({ success: false, code: "not_found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const deps = createDependencies(env, ctx);
    const handler = createContactHandler(deps);
    return handler(request);
  },
};
