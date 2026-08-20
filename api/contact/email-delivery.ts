/**
 * Postmark HTTPS delivery adapter.
 * Replaces Nodemailer SMTP transport for Workers runtime.
 * Uses fetch with AbortController timeouts and maps results to sanitized categories.
 */

export type EmailMessage = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export type EmailDeliveryResult =
  | { kind: "accepted"; providerRequestId?: string }
  | { kind: "failed"; category: "timeout" | "network" | "provider" | "configuration" };

export interface EmailDelivery {
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}

export type PostmarkEmailDeliveryOptions = {
  serverToken?: string;
  messageStream?: string;
  headersTimeoutMs?: number;
  totalTimeoutMs?: number;
  fetchImpl?: typeof fetch;
};

const POSTMARK_URL = "https://api.postmarkapp.com/email";
const DEFAULT_HEADERS_TIMEOUT_MS = 10_000;
const DEFAULT_TOTAL_TIMEOUT_MS = 20_000;

export class PostmarkEmailDelivery implements EmailDelivery {
  private serverToken: string | undefined;
  private messageStream: string;
  private headersTimeoutMs: number;
  private totalTimeoutMs: number;
  private fetchImpl: typeof fetch;

  constructor(opts: PostmarkEmailDeliveryOptions = {}) {
    this.serverToken = opts.serverToken;
    this.messageStream = opts.messageStream ?? "outbound";
    this.headersTimeoutMs = opts.headersTimeoutMs ?? DEFAULT_HEADERS_TIMEOUT_MS;
    this.totalTimeoutMs = opts.totalTimeoutMs ?? DEFAULT_TOTAL_TIMEOUT_MS;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async send(message: EmailMessage): Promise<EmailDeliveryResult> {
    if (!this.serverToken) {
      return { kind: "failed", category: "configuration" };
    }
    if (!message.from || !message.to) {
      return { kind: "failed", category: "configuration" };
    }

    const controller = new AbortController();
    let headersTimer: ReturnType<typeof setTimeout> | undefined;

    const abort = (reason: string) => {
      try {
        // DOMException with TimeoutError is more precise when available
        const err =
          typeof DOMException !== "undefined"
            ? new DOMException(reason, "TimeoutError")
            : new Error(reason);
        controller.abort(err);
      } catch {
        controller.abort();
      }
    };

    headersTimer = setTimeout(() => abort("headers timeout"), this.headersTimeoutMs);
    const totalTimer = setTimeout(() => abort("total timeout"), this.totalTimeoutMs);

    try {
      const body = JSON.stringify({
        From: message.from,
        To: message.to,
        Subject: message.subject,
        HtmlBody: message.html,
        MessageStream: this.messageStream,
      });

      const response = await this.fetchImpl(POSTMARK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Postmark-Server-Token": this.serverToken,
        },
        body,
        signal: controller.signal,
      });

      // Headers arrived -> clear headers timer, keep total timer until body consumed
      if (headersTimer) clearTimeout(headersTimer);
      headersTimer = undefined;

      if (response.ok) {
        // Try to extract provider id without leaking body on failure paths
        let providerRequestId: string | undefined;
        try {
          const data = (await response.json()) as Record<string, unknown>;
          const id = data["MessageID"] ?? data["messageId"] ?? data["MessageId"];
          if (typeof id === "string") providerRequestId = id;
          else if (typeof id === "number") providerRequestId = String(id);
        } catch {
          // ignore parse errors on success - still accepted
        }
        return { kind: "accepted", providerRequestId };
      }

      // Non-2xx -> provider error (do NOT return body)
      return { kind: "failed", category: "provider" };
    } catch (err: unknown) {
      // Classify abort vs network
      const name =
        err instanceof DOMException
          ? err.name
          : err instanceof Error
            ? err.name
            : "";
      const message = err instanceof Error ? err.message : String(err);
      if (
        name === "TimeoutError" ||
        name === "AbortError" ||
        message.toLowerCase().includes("timeout") ||
        message.toLowerCase().includes("abort")
      ) {
        return { kind: "failed", category: "timeout" };
      }
      return { kind: "failed", category: "network" };
    } finally {
      if (headersTimer) clearTimeout(headersTimer);
      if (totalTimer) clearTimeout(totalTimer);
    }
  }
}
