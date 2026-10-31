/**
 * Server-to-server call that starts a self-serve trial in the AION backend.
 * The backend only stores a pending signup and emails the verification link.
 */

export type TrialSignupInput = { fullName: string; email: string; gymName: string; phone: string };
export type TrialSignupResult = { kind: "accepted" } | { kind: "failed" };

export interface TrialSignupClient {
  request(input: TrialSignupInput): Promise<TrialSignupResult>;
}

export type BackendTrialSignupOptions = {
  url: string;
  secret: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export class BackendTrialSignupClient implements TrialSignupClient {
  private opts: BackendTrialSignupOptions;

  constructor(opts: BackendTrialSignupOptions) {
    this.opts = opts;
  }

  async request(input: TrialSignupInput): Promise<TrialSignupResult> {
    const fetchImpl = this.opts.fetchImpl ?? fetch;
    try {
      const resp = await fetchImpl(this.opts.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Trial-Signup-Secret": this.opts.secret },
        body: JSON.stringify({
          full_name: input.fullName,
          email: input.email,
          gym_name: input.gymName,
          phone: input.phone,
        }),
        signal: AbortSignal.timeout(this.opts.timeoutMs ?? 10_000),
      });
      return resp.ok ? { kind: "accepted" } : { kind: "failed" };
    } catch {
      return { kind: "failed" };
    }
  }
}
