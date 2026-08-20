import { contactSchema, renderContactEmail } from "../_utils/contact.js";
import type { Logger } from "./logging";
import { createJsonLogger } from "./logging";
import type { EmailDelivery, EmailMessage } from "./email-delivery";
import { getOriginInfo } from "./origin";
import type { RateLimiter } from "./rate-limiter";
import type { AntiBotVerifier } from "./antibot";

// Re-export contracts for consumers that import from handler (backward compat with PR1)
export type { RateLimiter, RateLimitDecision } from "./rate-limiter";
export type { AntiBotVerifier, AntiBotDecision } from "./antibot";

export type HandlerDeps = {
  delivery: EmailDelivery;
  emailFrom: string;
  emailTo: string;
  verifier?: AntiBotVerifier | null;
  limiter?: RateLimiter | null;
  rateLimit?: { limit: number; windowSeconds: number };
  // logger factory or instance
  createLogger?: (requestId: string) => Logger;
  logger?: Logger;
  // origin helper
  getOriginInfo?: (req: Request) => Promise<{ normalizedIp: string | null; originKey: string | null; fingerprint: string | null }>;
  hashKey?: string;
};

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

function generateRequestId(req: Request): string {
  const cfRay = req.headers.get("cf-ray");
  if (cfRay) return cfRay;
  const reqId = req.headers.get("x-request-id");
  if (reqId) return reqId;
  // crypto.randomUUID is available in Workers
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export function createContactHandler(deps: HandlerDeps) {
  const delivery = deps.delivery;
  const emailFrom = deps.emailFrom;
  const emailTo = deps.emailTo;

  return async function handle(request: Request): Promise<Response> {
    const start = Date.now();
    const requestId = generateRequestId(request);
    const logger: Logger =
      deps.createLogger?.(requestId) ??
      deps.logger ??
      createJsonLogger(requestId);

    const getOrigin = deps.getOriginInfo ?? ((req: Request) => getOriginInfo(req, deps.hashKey));

    const duration = () => Date.now() - start;

    // Method check — single response, with Allow header
    if (request.method !== "POST") {
      logger.warn("contact.blocked", {
        reason: "method_not_allowed",
        http_status: 405,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse({ success: false, code: "method_not_allowed" }, 405, {
        Allow: "POST",
      });
    }

    // Parse JSON body — 400 on invalid JSON / wrong content-type
    let rawBody: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        logger.info("contact.blocked", {
          reason: "invalid_request",
          http_status: 400,
          duration_ms: duration(),
          request_id: requestId,
        });
        return jsonResponse({ success: false, code: "invalid_request" }, 400);
      }
      rawBody = JSON.parse(text);
    } catch {
      logger.info("contact.blocked", {
        reason: "invalid_request",
        http_status: 400,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse({ success: false, code: "invalid_request" }, 400);
    }

    // Extract honeypot + turnstile before strict validation (contactSchema is strictObject)
    let websiteRaw: unknown;
    let turnstileToken: string | undefined;
    if (rawBody !== null && typeof rawBody === "object" && !Array.isArray(rawBody)) {
      const rec = rawBody as Record<string, unknown>;
      websiteRaw = rec.website;
      const tok = rec.turnstileToken;
      if (typeof tok === "string") turnstileToken = tok;
      else if (tok !== undefined && tok !== null) turnstileToken = String(tok);
    }

    // Validate contact fields via reused contactSchema (REUSE decision, no duplicate schema)
    // Strip antibot fields so strictObject does not reject them
    let contactPayload: unknown = rawBody;
    if (rawBody !== null && typeof rawBody === "object" && !Array.isArray(rawBody)) {
      const copy = { ...(rawBody as Record<string, unknown>) };
      delete copy.website;
      delete copy.turnstileToken;
      contactPayload = copy;
    }
    const parsed = contactSchema.safeParse(contactPayload);
    if (!parsed.success) {
      logger.info("contact.blocked", {
        reason: "invalid_request",
        http_status: 400,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse({ success: false, code: "invalid_request" }, 400);
    }

    const data = parsed.data;

    // Honeypot check — must happen before any external calls
    // Trim check as per design: website.trim() !== "" -> blocked
    const honeypot = typeof websiteRaw === "string" ? websiteRaw.trim() : "";
    if (honeypot !== "") {
      const origin = await getOrigin(request);
      logger.info("contact.blocked", {
        reason: "honeypot",
        origin_fingerprint: origin.fingerprint ?? undefined,
        http_status: 403,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse({ success: false, code: "verification_failed" }, 403);
    }

    // Anti-bot verifier (PR2: TurnstileVerifier / NoOp)
    // Honeypot above already returned 403 without invoking verifier/KV/mail.
    if (deps.verifier) {
      try {
        const origin = await getOrigin(request);
        const decision = await deps.verifier.verify({
          token: turnstileToken,
          remoteIp: origin.normalizedIp,
        });
        if (decision.kind === "invalid") {
          logger.info("contact.blocked", {
            reason: decision.reason === "missing_token" ? "turnstile_missing" : "turnstile_invalid",
            origin_fingerprint: origin.fingerprint ?? undefined,
            http_status: 403,
            duration_ms: duration(),
            request_id: requestId,
          });
          return jsonResponse({ success: false, code: "verification_failed" }, 403);
        }
        if (decision.kind === "unavailable") {
          logger.warn("contact.antibot.skip", {
            reason: decision.reason,
            origin_fingerprint: origin.fingerprint ?? undefined,
            http_status: 200,
            duration_ms: duration(),
            request_id: requestId,
          });
          // fail-open: continue to rate limit / delivery
        }
      } catch {
        // Verifier threw — treat as unavailable (fail-open) and continue
        logger.warn("contact.antibot.skip", {
          reason: "verifier_error",
          origin_fingerprint: undefined,
          http_status: 200,
          duration_ms: duration(),
          request_id: requestId,
        });
      }
    }

    // Rate limiter (PR2: WorkersKvRateLimiter)
    if (deps.limiter) {
      try {
        const origin = await getOrigin(request);
        if (!origin.originKey) {
          logger.warn("contact.rate_limit.skip", {
            reason: "missing_origin",
            origin_fingerprint: origin.fingerprint ?? undefined,
            http_status: 200,
            duration_ms: duration(),
            request_id: requestId,
          });
        } else {
          const limit = deps.rateLimit?.limit ?? 5;
          const windowSeconds = deps.rateLimit?.windowSeconds ?? 900;
          const decision = await deps.limiter.consume({
            originKey: origin.originKey,
            limit,
            windowSeconds,
            now: Math.floor(Date.now() / 1000),
          });
          if (decision.kind === "limited") {
            const retryAfter = Math.max(1, decision.resetAt - Math.floor(Date.now() / 1000));
            logger.warn("contact.rate_limited", {
              reason: "limit_exhausted",
              origin_fingerprint: origin.fingerprint ?? undefined,
              reset_at: decision.resetAt,
              http_status: 429,
              duration_ms: duration(),
              request_id: requestId,
            });
            return jsonResponse(
              { success: false, code: "rate_limited" },
              429,
              { "Retry-After": String(retryAfter) },
            );
          }
          if (decision.kind === "unavailable") {
            logger.warn("contact.rate_limit.skip", {
              reason: decision.reason,
              origin_fingerprint: origin.fingerprint ?? undefined,
              http_status: 200,
              duration_ms: duration(),
              request_id: requestId,
            });
          }
        }
      } catch {
        logger.warn("contact.rate_limit.skip", {
          reason: "limiter_error",
          origin_fingerprint: undefined,
          http_status: 200,
          duration_ms: duration(),
          request_id: requestId,
        });
      }
    }

    // Build email and deliver exactly once — reuse renderContactEmail (already escapes HTML)
    const subject = `Solicitud de DEMO AION WELLNESS y contacto: ${data.fullName}`;
    const emailHtml = renderContactEmail(data);

    const message: EmailMessage = {
      from: emailFrom,
      to: emailTo,
      subject,
      html: emailHtml,
    };

    try {
      const result = await delivery.send(message);
      if (result.kind === "accepted") {
        const origin = await getOrigin(request);
        logger.info("contact.submit", {
          outcome: "delivered",
          origin_fingerprint: origin.fingerprint ?? undefined,
          provider_request_id: result.providerRequestId ?? undefined,
          http_status: 200,
          duration_ms: duration(),
          request_id: requestId,
        });
        return jsonResponse({ success: true }, 200);
      }

      // Delivery failed — map to 500 without leaking provider body or error.message
      const origin = await getOrigin(request);
      logger.error("contact.smtp_failure", {
        transport: "https_api",
        category: result.category,
        origin_fingerprint: origin.fingerprint ?? undefined,
        http_status: 500,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse({ success: false, code: "delivery_failed" }, 500);
    } catch {
      // Unexpected throw from delivery — never leak internal message, respond once
      const origin = await getOrigin(request);
      logger.error("contact.smtp_failure", {
        transport: "https_api",
        category: "network",
        origin_fingerprint: origin.fingerprint ?? undefined,
        http_status: 500,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse({ success: false, code: "delivery_failed" }, 500);
    }
  };
}
