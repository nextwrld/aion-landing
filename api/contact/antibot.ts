/**
 * Anti-bot verification for POST /api/contact (NEX-48 Fase 4).
 * - Honeypot is handled in handler.ts before verifier
 * - TurnstileVerifier posts to Cloudflare siteverify with short timeout
 * - NoOp verifier for CONTACT_ANTIBOT_ENABLED=false (tolerates missing token, fail-open)
 */

export type AntiBotDecision =
  | { kind: "valid" }
  | { kind: "invalid"; reason: "missing_token" | "rejected" | string }
  | { kind: "unavailable"; reason: "disabled" | "configuration" | "timeout" | "network" | "provider" | string };

export interface AntiBotVerifier {
  verify(input: { token?: string; remoteIp: string | null }): Promise<AntiBotDecision>;
}

export function parseAntibotEnabled(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function parseVerifyTimeoutMs(
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

export class NoOpAntiBotVerifier implements AntiBotVerifier {
  async verify(): Promise<AntiBotDecision> {
    return { kind: "unavailable", reason: "disabled" };
  }
}

export type TurnstileVerifierOptions = {
  secret?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const DEFAULT_VERIFY_TIMEOUT_MS = 5_000;

export class TurnstileVerifier implements AntiBotVerifier {
  private secret: string | undefined;
  private timeoutMs: number;
  private fetchImpl: typeof fetch;

  constructor(opts: TurnstileVerifierOptions = {}) {
    this.secret = opts.secret;
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_VERIFY_TIMEOUT_MS;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async verify(input: { token?: string; remoteIp: string | null }): Promise<AntiBotDecision> {
    if (!this.secret || this.secret.trim() === "") {
      return { kind: "unavailable", reason: "configuration" };
    }

    const token = input.token?.trim() ?? "";
    if (token === "") {
      return { kind: "invalid", reason: "missing_token" };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      try {
        const err =
          typeof DOMException !== "undefined"
            ? new DOMException("turnstile verify timeout", "TimeoutError")
            : new Error("turnstile verify timeout");
        controller.abort(err);
      } catch {
        controller.abort();
      }
    }, this.timeoutMs);

    try {
      const body = new URLSearchParams();
      body.set("secret", this.secret);
      body.set("response", token);
      if (input.remoteIp) body.set("remoteip", input.remoteIp);

      const resp = await this.fetchImpl(TURNSTILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: controller.signal,
      });

      if (resp.status >= 500) {
        return { kind: "unavailable", reason: "provider" };
      }

      let data: unknown;
      try {
        data = await resp.json();
      } catch {
        return { kind: "unavailable", reason: "provider" };
      }

      if (
        data !== null &&
        typeof data === "object" &&
        (data as Record<string, unknown>).success === true
      ) {
        return { kind: "valid" };
      }

      if (
        data !== null &&
        typeof data === "object" &&
        (data as Record<string, unknown>).success === false
      ) {
        return { kind: "invalid", reason: "rejected" };
      }

      return { kind: "unavailable", reason: "provider" };
    } catch (err: unknown) {
      const name =
        err instanceof DOMException
          ? err.name
          : err instanceof Error
            ? err.name
            : "";
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (
        name === "TimeoutError" ||
        name === "AbortError" ||
        msg.includes("timeout") ||
        msg.includes("abort")
      ) {
        return { kind: "unavailable", reason: "timeout" };
      }
      return { kind: "unavailable", reason: "network" };
    } finally {
      clearTimeout(timer);
    }
  }
}
