import { contactSchema, renderContactEmail } from "../_utils/contact.js";
import type { Logger } from "./logging";
import { createJsonLogger } from "./logging";
import type { EmailDelivery, EmailMessage } from "./email-delivery";
import { getOriginInfo } from "./origin";
import type { RateLimiter } from "./rate-limiter";
import type { AntiBotVerifier } from "./antibot";
import { createSafeEvent, getReporter } from "./diagnostics.js";
import type { Reporter } from "./diagnostics.js";

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
  reporter?: Reporter;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function isCanonicalUuid(value: string): boolean {
  return value.length === 36 && UUID_RE.test(value) && value === value.toLowerCase();
}

function generateRequestId(): string {
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

function getEffectiveRequestId(request: Request): string {
  const raw = (request.headers.get("X-Request-ID") ?? request.headers.get("x-request-id") ?? "").trim();
  if (raw.length === 36 && isCanonicalUuid(raw)) return raw;
  return generateRequestId();
}

function jsonResponse(body: unknown, status: number, requestId: string, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "X-Request-ID": requestId, "Access-Control-Expose-Headers": "X-Request-ID", ...extraHeaders },
  });
}

function errorBody(code: string, requestId: string): unknown {
  const messages: Record<string, string> = {
    method_not_allowed: "Method not allowed",
    invalid_request: "Invalid request",
    verification_failed: "Verification failed",
    rate_limited: "Too many requests",
    delivery_failed: "Unable to send message. Please try again later.",
  };
  return { error: { code, message: messages[code] ?? "Request failed", request_id: requestId } };
}

function statusClass(status: number): string {
  if (status >= 500) return "5xx";
  if (status >= 400) return "4xx";
  if (status >= 300) return "3xx";
  return "2xx";
}

function reportOnce(reporter: Reporter, requestId: string, code: string, status: number): void {
  reporter.report(
    createSafeEvent({
      event_name: "landing.worker.unexpected_failure",
      severity: "error",
      runtime: "landing-worker",
      request_id: requestId,
      public_error_code: code,
      status_class: statusClass(status),
      route_template: "/api/contact",
    }),
  );
}

export function createContactHandler(deps: HandlerDeps) {
  const delivery = deps.delivery;
  const emailFrom = deps.emailFrom;
  const emailTo = deps.emailTo;
  const reporter: Reporter = deps.reporter ?? getReporter();

  return async function handle(request: Request): Promise<Response> {
    const start = Date.now();
    const requestId = getEffectiveRequestId(request);
    const logger: Logger =
      deps.createLogger?.(requestId) ?? deps.logger ?? createJsonLogger(requestId);
    const getOrigin = deps.getOriginInfo ?? ((req: Request) => getOriginInfo(req, deps.hashKey));
    const duration = () => Date.now() - start;

    if (request.method !== "POST") {
      logger.warn("contact.blocked", {
        reason: "method_not_allowed",
        http_status: 405,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse(errorBody("method_not_allowed", requestId), 405, requestId, { Allow: "POST" });
    }

    const contentType = request.headers.get("content-type");
    if (contentType === null || !/^application\/json(?:\s*;\s*charset=[^;\s]+)?$/i.test(contentType)) {
      logger.info("contact.blocked", {
        reason: "invalid_request",
        http_status: 415,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse(errorBody("invalid_request", requestId), 415, requestId);
    }

    const declaredLength = request.headers.get("content-length");
    if (declaredLength !== null) {
      const n = Number(declaredLength);
      if (!Number.isSafeInteger(n) || n < 0) {
        logger.info("contact.blocked", {
          reason: "invalid_request",
          http_status: 400,
          duration_ms: duration(),
          request_id: requestId,
        });
        return jsonResponse(errorBody("invalid_request", requestId), 400, requestId);
      }
      if (n > 16 * 1024) {
        logger.info("contact.blocked", {
          reason: "invalid_request",
          http_status: 413,
          duration_ms: duration(),
          request_id: requestId,
        });
        return jsonResponse(errorBody("invalid_request", requestId), 413, requestId);
      }
    }

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
        return jsonResponse(errorBody("invalid_request", requestId), 400, requestId);
      }
      if (new TextEncoder().encode(text).length > 16 * 1024) {
        logger.info("contact.blocked", {
          reason: "invalid_request",
          http_status: 413,
          duration_ms: duration(),
          request_id: requestId,
        });
        return jsonResponse(errorBody("invalid_request", requestId), 413, requestId);
      }
      rawBody = JSON.parse(text);
      if (new TextEncoder().encode(JSON.stringify(rawBody)).length > 16 * 1024) {
        logger.info("contact.blocked", {
          reason: "invalid_request",
          http_status: 413,
          duration_ms: duration(),
          request_id: requestId,
        });
        return jsonResponse(errorBody("invalid_request", requestId), 413, requestId);
      }
    } catch {
      logger.info("contact.blocked", {
        reason: "invalid_request",
        http_status: 400,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse(errorBody("invalid_request", requestId), 400, requestId);
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
      return jsonResponse(errorBody("invalid_request", requestId), 400, requestId);
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
      return jsonResponse(errorBody("verification_failed", requestId), 403, requestId);
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
          return jsonResponse(errorBody("verification_failed", requestId), 403, requestId);
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
            return jsonResponse(errorBody("rate_limited", requestId), 429, requestId, { "Retry-After": String(retryAfter) });
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
      const result = (await delivery.send(message)) as unknown as {
        kind?: string;
        category?: string;
        providerRequestId?: string;
      };
      const isAccepted =
        result && typeof result === "object" && "kind" in result
          ? (result as { kind: string }).kind === "accepted"
          : true;
      if (isAccepted) {
        const origin = await getOrigin(request);
        logger.info("contact.submit", {
          outcome: "delivered",
          origin_fingerprint: origin.fingerprint ?? undefined,
          provider_request_id: (result as { providerRequestId?: string })?.providerRequestId ?? undefined,
          http_status: 200,
          duration_ms: duration(),
          request_id: requestId,
        });
        return jsonResponse({ success: true, request_id: requestId }, 200, requestId);
      }
      reportOnce(reporter, requestId, "delivery_failed", 500);
      const origin = await getOrigin(request);
      logger.error("contact.smtp_failure", {
        transport: "https_api",
        category: (result as { category?: string }).category,
        origin_fingerprint: origin.fingerprint ?? undefined,
        http_status: 500,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse(errorBody("delivery_failed", requestId), 500, requestId);
    } catch {
      reportOnce(reporter, requestId, "delivery_failed", 500);
      const origin = await getOrigin(request);
      logger.error("contact.smtp_failure", {
        transport: "https_api",
        category: "network",
        origin_fingerprint: origin.fingerprint ?? undefined,
        http_status: 500,
        duration_ms: duration(),
        request_id: requestId,
      });
      return jsonResponse(errorBody("delivery_failed", requestId), 500, requestId);
    }
  };
}
