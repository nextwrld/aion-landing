export const ALLOWED_FIELDS = ['event_name','severity','runtime','request_id','public_error_code','status_class','route_template'] as const;
export type SafeDiagnosticPayload = { event_name:string; severity:string; runtime:string; request_id:string; public_error_code:string; status_class:string; route_template:string; };
export class SafeDiagnosticEvent {
  private readonly payload: SafeDiagnosticPayload;
  constructor(payload: SafeDiagnosticPayload) { this.payload = payload; }
  toDict(): SafeDiagnosticPayload { return { ...this.payload }; }
}
export function createSafeEvent(raw: Record<string, unknown>): SafeDiagnosticEvent {
  const c: Record<string,string> = {};
  for (const f of ALLOWED_FIELDS) { const v = raw[f]; c[f] = typeof v === 'string' ? v : v !== undefined && v !== null ? String(v) : ''; }
  return new SafeDiagnosticEvent(c as unknown as SafeDiagnosticPayload);
}
export interface Reporter { report(e: SafeDiagnosticEvent): void; }
export class NoOpReporter implements Reporter { report(_e: SafeDiagnosticEvent): void { void _e; } }
export class RecordingReporter implements Reporter { events: SafeDiagnosticEvent[]=[]; report(e: SafeDiagnosticEvent): void { this.events.push(e); } clear(): void { this.events=[]; } }
let cur: Reporter = new NoOpReporter();
export function getReporter(): Reporter { return cur; }
export function setReporter(r: Reporter): void { cur = r; }
