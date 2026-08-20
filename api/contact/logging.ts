/**
 * JSON logger for contact protection flow.
 * Each line is a single JSON object with base fields:
 * timestamp, event, request_id, http_status, duration_ms
 * plus event-specific fields.
 *
 * Forbidden fields (MUST NOT appear in any log line):
 * - lead data: fullName, email, phone, gymName, members, message, website/honeypot
 * - token / secret: turnstileToken, TURNSTILE_SECRET_KEY, POSTMARK_SERVER_TOKEN, CONTACT_IP_HASH_KEY
 * - IP in clear: CF-Connecting-IP, remoteIp
 * - Postmark body
 * - error.message / stack
 */

export const FORBIDDEN_LOG_FIELDS = [
  "fullName",
  "email",
  "phone",
  "gymName",
  "members",
  "message",
  "website",
  "honeypot",
  "turnstileToken",
  "token",
  "secret",
  "TURNSTILE_SECRET_KEY",
  "POSTMARK_SERVER_TOKEN",
  "CONTACT_IP_HASH_KEY",
  "CF-Connecting-IP",
  "remoteIp",
  "ip",
  "postmarkBody",
  "html",
  "body",
  "error.message",
  "error_message",
  "stack",
] as const;

export type LogLevel = "info" | "warn" | "error";

export interface Logger {
  info(event: string, fields?: Record<string, unknown>): void;
  warn(event: string, fields?: Record<string, unknown>): void;
  error(event: string, fields?: Record<string, unknown>): void;
}

function emit(
  level: LogLevel,
  event: string,
  requestId: string,
  fields: Record<string, unknown> | undefined,
) {
  const base: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    event,
    request_id: requestId,
    ...fields,
  };
  const line = JSON.stringify(base);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function createJsonLogger(requestId: string): Logger {
  return {
    info: (event, fields) => emit("info", event, requestId, fields),
    warn: (event, fields) => emit("warn", event, requestId, fields),
    error: (event, fields) => emit("error", event, requestId, fields),
  };
}

/**
 * No-op logger for tests or when logging is disabled.
 */
export function createNoopLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
  };
}
