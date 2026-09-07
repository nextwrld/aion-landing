import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALLOWED_FIELDS, NoOpReporter, RecordingReporter, createSafeEvent, registerBrowserDiagnostics } from './diagnostics';
function createMockWindow(p='/'){ const m=new Map<string,Set<EventListener>>(); const w:any={ location:{pathname:p}, history:{ pushState(_:unknown,__:string,url:string){ w.location.pathname=new URL(url,'http://localhost').pathname; } }, addEventListener(t:string,f:EventListener){ if(!m.has(t)) m.set(t,new Set()); m.get(t)!.add(f); }, removeEventListener(t:string,f:EventListener){ m.get(t)?.delete(f); }, dispatchEvent(e:Event){ const s=m.get(e.type); if(s) for(const f of [...s]) f(e); return true; } }; return w as unknown as Window; }
beforeEach(()=>vi.restoreAllMocks()); afterEach(()=>vi.restoreAllMocks());
describe("landing browser diagnostics",()=>{
  it("keeps only seven allowlisted fields and drops unknown",()=>{
    const ev=createSafeEvent({event_name:"test",severity:"error",runtime:"landing-browser",request_id:"a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",public_error_code:"x",status_class:"5xx",route_template:"/",token:"secret",extra:"drop",stack:"leak"} as Record<string,unknown>);
    const d=ev.toDict(); expect(Object.keys(d).sort()).toEqual([...ALLOWED_FIELDS].sort()); expect(Object.keys(d)).toHaveLength(7); expect((d as any).token).toBeUndefined(); expect(JSON.stringify(d)).not.toMatch(/secret|stack/i);
  });
  it("drops nested mixed-case forbidden values via allowlist",()=>{
    const ev=createSafeEvent({event_name:"landing.browser_uncaught",severity:"error",runtime:"landing-browser",request_id:"",public_error_code:"UNCAUGHT_ERROR",status_class:"5xx",route_template:"/",Authorization:"Bearer secret","CF-Connecting-IP":"1.2.3.4"} as Record<string,unknown>);
    expect(Object.keys(ev.toDict())).toHaveLength(7); expect(JSON.stringify(ev.toDict())).not.toMatch(/secret|1\.2\.3\.4/i);
  });
  it("NoOpReporter no I/O and RecordingReporter captures exactly",()=>{
    const noop=new NoOpReporter(), rec=new RecordingReporter();
    const ev=createSafeEvent({event_name:"test",severity:"error",runtime:"landing-browser",request_id:"a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",public_error_code:"x",status_class:"5xx",route_template:"/"});
    expect(()=>noop.report(ev)).not.toThrow(); expect(rec.events).toHaveLength(0); rec.report(ev); expect(rec.events).toHaveLength(1); expect(rec.events[0].toDict()).toEqual(ev.toDict());
  });
  it("registers one allowlisted event per uncaught window error without raw details",()=>{
    const w=createMockWindow('/'); vi.stubGlobal('window',w); const rec=new RecordingReporter(); const clean=registerBrowserDiagnostics(rec);
    const e=new Event('error'); (e as any).message='secret token 123'; (e as any).error=new Error('stack leak'); w.dispatchEvent(e);
    expect(rec.events).toHaveLength(1); const d=rec.events[0].toDict(); expect(Object.keys(d).sort()).toEqual([...ALLOWED_FIELDS].sort()); expect(d.runtime).toBe('landing-browser'); expect(JSON.stringify(d)).not.toMatch(/secret|stack/i);
    clean(); w.dispatchEvent(new Event('error')); expect(rec.events).toHaveLength(1); vi.unstubAllGlobals();
  });
  it("registers one allowlisted event per unhandledrejection without raw details",()=>{
    const w=createMockWindow('/'); vi.stubGlobal('window',w); const rec=new RecordingReporter(); const clean=registerBrowserDiagnostics(rec);
    const e=new Event('unhandledrejection'); (e as any).reason='PII payload secret'; w.dispatchEvent(e);
    expect(rec.events).toHaveLength(1); expect(JSON.stringify(rec.events[0].toDict())).not.toMatch(/secret|PII/i);
    clean(); w.dispatchEvent(new Event('unhandledrejection')); expect(rec.events).toHaveLength(1); vi.unstubAllGlobals();
  });
  it("route_template is pathname only, never URL or query",()=>{
    const w=createMockWindow('/'); vi.stubGlobal('window',w); const rec=new RecordingReporter(); w.history.pushState({},'','/api/contact?foo=bar&secret=123#hash');
    const clean=registerBrowserDiagnostics(rec); w.dispatchEvent(new Event('error'));
    const d=rec.events[0].toDict(); expect(d.route_template).toBe('/api/contact'); expect(d.route_template).not.toContain('?'); expect(d.route_template).not.toContain('secret');
    clean(); vi.unstubAllGlobals();
  });
  it("allowlist is exactly seven fields",()=>{
    expect(ALLOWED_FIELDS).toHaveLength(7); expect([...ALLOWED_FIELDS].sort()).toEqual(['event_name','severity','runtime','request_id','public_error_code','status_class','route_template'].sort());
  });
});
