/**
 * Rate limiting for POST /api/contact via Workers KV (NEX-48 Fase 3).
 * - Fixed window: windowStart = floor(now / windowSeconds) * windowSeconds
 * - Key: contact:rate:v1:{windowStart}:{originKey}
 * - Fail-open on missing binding / origin / KV error (→ unavailable)
 */

export type RateLimitDecision =
  | { kind: "allowed"; remaining: number; resetAt: number }
  | { kind: "limited"; resetAt: number }
  | { kind: "unavailable"; reason: "disabled" | "missing_binding" | "missing_origin" | "kv_error" | "configuration" | string };

export interface RateLimiter {
  consume(input: {
    originKey: string;
    limit: number;
    windowSeconds: number;
    now: number;
  }): Promise<RateLimitDecision>;
}

export type WorkersKvRateLimiterOptions = {
  kv?: KVNamespace;
  enabled?: boolean;
  limit?: number;
  windowSeconds?: number;
};

/**
 * Strict parsers for Env-driven configuration (Fase 3.3).
 * - CONTACT_RATE_LIMIT_ENABLED: "true" → true, "false" → false, otherwise fallback
 * - RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_SECONDS: positive integers, otherwise fallback
 */
export function parseRateLimitEnabled(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function parsePositiveInt(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined || value === "") return fallback;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return fallback;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export class WorkersKvRateLimiter implements RateLimiter {
  private kv: KVNamespace | undefined;
  private enabled: boolean;
  private defaultLimit: number;
  private defaultWindowSeconds: number;

  constructor(opts: WorkersKvRateLimiterOptions = {}) {
    this.kv = opts.kv;
    this.enabled = opts.enabled ?? true;
    this.defaultLimit = opts.limit ?? 5;
    this.defaultWindowSeconds = opts.windowSeconds ?? 900;
  }

  async consume(input: {
    originKey: string;
    limit: number;
    windowSeconds: number;
    now: number;
  }): Promise<RateLimitDecision> {
    if (!this.enabled) {
      return { kind: "unavailable", reason: "disabled" };
    }
    if (!input.originKey || input.originKey.trim() === "") {
      return { kind: "unavailable", reason: "missing_origin" };
    }
    if (!this.kv) {
      return { kind: "unavailable", reason: "missing_binding" };
    }

    const limit = input.limit > 0 ? input.limit : this.defaultLimit;
    const windowSeconds =
      input.windowSeconds > 0 ? input.windowSeconds : this.defaultWindowSeconds;
    const now = input.now;

    const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
    const resetAt = windowStart + windowSeconds;
    const expiration = windowStart + windowSeconds + 60;
    const key = `contact:rate:v1:${windowStart}:${input.originKey}`;

    try {
      const raw = (await this.kv.get(key, "json")) as
        | { count?: unknown }
        | null;

      let count = 0;
      if (raw !== null && typeof raw === "object") {
        const c = (raw as { count?: unknown }).count;
        if (typeof c === "number" && Number.isFinite(c) && c >= 0) {
          count = Math.floor(c);
        } else if (c !== undefined) {
          // Malformed count — treat as 0 and overwrite
          count = 0;
        }
      }

      if (count >= limit) {
        return { kind: "limited", resetAt };
      }

      const nextCount = count + 1;
      const payload = JSON.stringify({ count: nextCount });
      // Workers KV uses `expiration` as seconds since epoch
      await (this.kv as unknown as { put: (k: string, v: string, o: Record<string, unknown>) => Promise<void> }).put(
        key,
        payload,
        { expiration },
      );

      const remaining = Math.max(0, limit - nextCount);
      return { kind: "allowed", remaining, resetAt };
    } catch {
      return { kind: "unavailable", reason: "kv_error" };
    }
  }
}
