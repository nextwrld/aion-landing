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
function getRouteTemplate(): string { if(typeof window==='undefined') return '/'; const p=window.location.pathname||'/'; return p.startsWith('/api/contact')?'/api/contact':'/'; }
function buildUncaught(): SafeDiagnosticEvent { return createSafeEvent({event_name:'landing.browser_uncaught',severity:'error',runtime:'landing-browser',request_id:'',public_error_code:'UNCAUGHT_ERROR',status_class:'5xx',route_template:getRouteTemplate()}); }
export function registerBrowserDiagnostics(reporter: Reporter=getReporter()): () => void {
  const onError = (): void => {
    try {
      reporter.report(buildUncaught());
    } catch {
      /* reporter failed while handling an error; nothing left to do */
    }
  };
  const onRej = (): void => {
    try {
      reporter.report(buildUncaught());
    } catch {
      /* reporter failed while handling a rejection; nothing left to do */
    }
  };
  if(typeof window!=='undefined' && typeof (window as unknown as {addEventListener?: unknown}).addEventListener==='function'){
    (window as unknown as {addEventListener:(a:string,b:EventListener)=>void}).addEventListener('error', onError as EventListener);
    (window as unknown as {addEventListener:(a:string,b:EventListener)=>void}).addEventListener('unhandledrejection', onRej as unknown as EventListener);
  }
  return ()=>{
    if(typeof window!=='undefined' && typeof (window as unknown as {removeEventListener?: unknown}).removeEventListener==='function'){
      (window as unknown as {removeEventListener:(a:string,b:EventListener)=>void}).removeEventListener('error', onError as EventListener);
      (window as unknown as {removeEventListener:(a:string,b:EventListener)=>void}).removeEventListener('unhandledrejection', onRej as unknown as EventListener);
    }
  };
}
