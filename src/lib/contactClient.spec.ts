import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitContact } from './contactClient';
const valid={fullName:"Ada Lovelace",email:"ada@example.com",phone:"+54 (11) 4567-8901",gymName:"Analytical Gym",members:"100_400",message:"Hello"};
const re=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
beforeEach(()=>vi.restoreAllMocks()); afterEach(()=>vi.restoreAllMocks());
describe("contactClient",()=>{
  it("sends canonical lowercase UUID in X-Request-ID", async()=>{
    const spy=vi.fn().mockResolvedValue(new Response(JSON.stringify({success:true}),{status:200,headers:{"X-Request-ID":"aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"}})); vi.stubGlobal("fetch",spy);
    await submitContact(valid as never);
    const h=spy.mock.calls[0][1]?.headers as Record<string,string>|Headers;
    const id=h instanceof Headers?h.get("X-Request-ID"):(h as Record<string,string>)["X-Request-ID"];
    expect(id).toMatch(re); expect(id).toBe(id?.toLowerCase());
  });
  it("generates fresh distinct IDs per attempt", async()=>{
    const ids:string[]=[]; const spy=vi.fn().mockImplementation((_u:string,init?:RequestInit)=>{ const h=init?.headers as Record<string,string>|Headers; const v=h instanceof Headers?h.get("X-Request-ID"):(h as Record<string,string>)["X-Request-ID"]; ids.push(v as string); return Promise.resolve(new Response(JSON.stringify({success:true}),{status:200,headers:{"X-Request-ID":v as string}})); }); vi.stubGlobal("fetch",spy);
    await submitContact(valid as never); await submitContact(valid as never); await submitContact(valid as never);
    expect(new Set(ids).size).toBe(3); ids.forEach(id=>expect(id).toMatch(re));
  });
  it("retains response requestId on typed failure", async()=>{
    const rid="bbbbbbbb-cccc-4ddd-8eee-ffffffffffff"; const spy=vi.fn().mockResolvedValue(new Response(JSON.stringify({error:{code:"invalid_request",message:"Invalid request",request_id:rid}}),{status:400,headers:{"X-Request-ID":rid}})); vi.stubGlobal("fetch",spy);
    await expect(submitContact(valid as never)).rejects.toMatchObject({requestId:rid,status:400});
  });
  it("prefers header and validates body, falls back to body", async()=>{
    const hid="cccccccc-dddd-4eee-8fff-111111111111"; const bid="dddddddd-eeee-4fff-8aaa-222222222222";
    const s1=vi.fn().mockResolvedValue(new Response(JSON.stringify({error:{code:"x",message:"x",request_id:bid}}),{status:400,headers:{"X-Request-ID":hid}})); vi.stubGlobal("fetch",s1);
    await expect(submitContact(valid as never)).rejects.toMatchObject({requestId:hid});
    const s2=vi.fn().mockResolvedValue(new Response(JSON.stringify({error:{code:"x",message:"x",request_id:bid}}),{status:400,headers:{}})); vi.stubGlobal("fetch",s2);
    await expect(submitContact(valid as never)).rejects.toMatchObject({requestId:bid});
    const s3=vi.fn().mockResolvedValue(new Response(JSON.stringify({error:{code:"x",message:"x",request_id:"NOT-UUID"}}),{status:400,headers:{}})); vi.stubGlobal("fetch",s3);
    await expect(submitContact(valid as never)).rejects.toMatchObject({requestId:undefined});
  });
});
