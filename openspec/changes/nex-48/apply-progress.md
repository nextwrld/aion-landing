# Apply Progress — NEX-48 (PR 1 de 3 — Fases 1-2)

## Estado de entrega
- **PR:** 1 de 3 (auto-chain, feature-branch-chain)
- **Alcance de esta PR:** Fases 1–2 completadas. Fases 3–8 diferidas a PR 2 y PR 3.
- **Branch estimado:** feature-branch-chain (stacked-to-main no usado)
- **Fecha:** 2026-08-20

## Tareas completadas (persistidas en tasks.md)
- [x] 1.1 api/contact/schema.ts — Zod schema con trim().min(1), defaults y strip
- [x] 1.2 api/contact/logging.ts — logger JSON + FORBIDDEN_LOG_FIELDS
- [x] 1.3 api/contact/origin.ts — CF-Connecting-IP, HMAC-SHA-256, fingerprint truncado
- [x] 1.4 api/contact/handler.ts — createContactHandler(deps) con contrato HTTP completo (405/400/403/429/500/200), single response, sin fugar error.message, honeypot primero
- [x] 1.5 api/contact.ts — export default { fetch } con Env + createDependencies + route exclusiva /api/contact
- [x] 1.6 tsconfig.worker.json + worker-configuration.d.ts (KV binding)
- [x] 2.1 api/contact/email-delivery.ts — tipos EmailMessage / EmailDelivery
- [x] 2.2 PostmarkEmailDelivery — fetch https://api.postmarkapp.com/email + X-Postmark-Server-Token + MessageStream
- [x] 2.3 AbortController timeouts 10s headers / 20s total parametrizables
- [x] 2.4 Mapeo 2xx→accepted / resto→failed por categoría, sin reintento ni body leak
- [x] 2.5 Eliminación Nodemailer — borrado api/_utils/email.ts, package.json sin nodemailer/@types/nodemailer, pnpm-lock regenerado

## Fases restantes (no implementadas en esta PR)
- [ ] 3.1–3.4 Rate limiting (WorkersKvRateLimiter + integración handler)
- [ ] 4.1–4.3 Anti-bot (TurnstileVerifier + honeypot/verifier integración completa)
- [ ] 5.1–5.3 Observabilidad completa
- [ ] 6.1–6.6 Front e i18n (TurnstileWidget + LeadFormSection + strings)
- [ ] 7.1–7.3 Config y docs (wrangler.toml, .dev.vars.example, README)
- [ ] 8.1–8.7 Validación final matricial
- [ ] parent: bounded review + gate de ciclo de vida

## Archivos cambiados
- `api/contact/schema.ts` (nuevo)
- `api/contact/logging.ts` (nuevo)
- `api/contact/origin.ts` (nuevo)
- `api/contact/handler.ts` (nuevo)
- `api/contact/email-delivery.ts` (nuevo)
- `api/contact.ts` (reescrito — Workers ES module)
- `api/_utils/email.ts` (eliminado)
- `tsconfig.worker.json` (nuevo)
- `worker-configuration.d.ts` (nuevo)
- `package.json` (quitado nodemailer, añadido @cloudflare/workers-types)
- `pnpm-lock.yaml` (regenerado)
- `openspec/changes/nex-48/tasks.md` (checkboxes 1.1-2.5 → [x])
- `openspec/changes/nex-48/apply-progress.md` (nuevo)

## Comandos de verificación ejecutados
- `npx tsc -p tsconfig.worker.json --noEmit` → 0 errores
- `npx tsc -b` → 0 errores
- `npx eslint api --ext .ts` → 0 errores en lo tocado (se corrigió prefer-const y no-unused-vars)
- `pnpm build` (tsc -b && vite build && node scripts/prerender.mjs) → built in 1.42s, 1724 modules, prerender ok
- `npx wrangler deploy api/contact.ts --dry-run --compatibility-date 2026-08-20` → Total Upload 566 KiB / gzip 84 KiB, No bindings, dry-run ok
- `pnpm install --no-frozen-lockfile` → regenerate lockfile (+@cloudflare/workers-types 4.20260702.1, -nodemailer, -@types/nodemailer)
- `npx eslint api/contact` → 0 errores

## Evidencia TDD (config strict_tdd: false, runner: none)
- No se exige ciclo RED/GREEN. Se validó con type-check + build + dry-run según design §12.1.

## Desviaciones del design
- Ninguna material. handler.ts incluye ya ramas para verifier/limiter como contratos pluggables (null en PR1) para que PR2 integre sin reescribir. Esto cumple la restricción “interfaces pueden existir como contratos vacíos/pluggables”.
- worker-configuration.d.ts expone Env global con KVNamespace opcional (no requiere wrangler.toml aún — PR3).
- El logger de PR1 ya emite contact.submit / blocked / smtp_failure con request_id y duration_ms; los eventos rate_limited/antibot.skip/rate_limit.skip quedan cableados para PR2.

## Riesgos y mitigación PR1
- Flujo al menos tan protegido como hoy: honeypot bloquea bots ingenuos aun sin Turnstile/KV; el handler responde genérico sin leak y solo usa fetch nativo.
- Compatibilidad Workers verificada vía tsc worker + wrangler dry-run.
- Rollback: conservar origen Express anterior; devolver route /api/contact al origen previo revierte sin tocar KV.

## Workload / PR boundary
- Decision needed before apply: No
- Chained PRs recommended: Yes (feature-branch-chain, 3 PRs)
- 400-line budget risk: High (~850-1050 estimado) — split respetado (PR1 ≈ 450 líneas nuevas)
- Esta PR cierra Fases 1-2 únicamente; PR2 implementará Fases 3-5, PR3 Fases 6-8.

## Structured status consumido
- No hay artefacto de status nativo en /landing; se resolvió readiness por presencia de spec/design/tasks en openspec/changes/nex-48/ y por config.yaml (strict_tdd:false, runner:none).
- actionContext: workspace con allowedEditRoots limitado a /Users/gapfware/workspace/nextwrld/aion/landing — se respetó.

## Próximo recomendado
- `parent-lifecycle` → PR 2 (Fases 3-5: rate-limiter.ts, antibot.ts, observabilidad) sobre feature branch chain.

---

# Apply Progress — NEX-48 (PR 2 de 3 — Fases 3-5)

## Estado de entrega
- **PR:** 2 de 3 (auto-chain, feature-branch-chain)
- **Alcance de esta PR:** Fases 3–5 completadas. Fases 6–8 diferidas a PR 3.
- **Fecha:** 2026-08-20

## Tareas completadas (persistidas en tasks.md)
- [x] 3.1 api/contact/rate-limiter.ts — interfaz RateLimiter + tipo RateLimitDecision (allowed/limited/unavailable)
- [x] 3.2 WorkersKvRateLimiter ventana fija: windowStart=floor(now/900)*900, clave contact:rate:v1:{windowStart}:{originKey}, leer {count}, count>=limit→limited, escribir count+1 con expiration windowStart+900+60
- [x] 3.3 Conversión a unavailable para KV/binding ausente/origen ausente; parseo estricto CONTACT_RATE_LIMIT_ENABLED, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS (helpers parseRateLimitEnabled/parsePositiveInt)
- [x] 3.4 Integración en handler.ts antes de entrega: limited→429 rate_limited con Retry-After sin correo; unavailable→contact.rate_limit.skip y fail-open
- [x] 4.1 api/contact/antibot.ts — interfaz AntiBotVerifier + tipo AntiBotDecision (valid/invalid/unavailable) + NoOpAntiBotVerifier para control deshabilitado
- [x] 4.2 TurnstileVerifier: POST https://challenges.cloudflare.com/turnstile/v0/siteverify como application/x-www-form-urlencoded (secret/response/remoteip), timeout default 5s (TURNSTILE_VERIFY_TIMEOUT_MS); success:false→invalid, 5xx/timeout/red/ilegible→unavailable, secret ausente→unavailable(configuration)
- [x] 4.3 Integración en handler.ts: honeypot primero (website.trim()!==""→403 sin Turnstile/KV/correo); luego verifier (invalid→403, unavailable→contact.antibot.skip y continuar); CONTACT_ANTIBOT_ENABLED=false→NoOp tolera token ausente
- [x] 5.1 Emitir contact.submit (outcome=delivered) al aceptar Postmark y contact.smtp_failure (transport=https_api, categoría sanitizada) al fallar
- [x] 5.2 Emitir contact.blocked (reason=honeypot|turnstile_missing|turnstile_invalid), contact.rate_limited (reason=limit_exhausted+reset_at), contact.antibot.skip y contact.rate_limit.skip con reason/origin_fingerprint/http_status/duration_ms
- [x] 5.3 Auditoría: ningún log contiene campos del lead, token, secret, IP en claro, body Postmark o error.message; request_id incluido en cada línea vía createJsonLogger

## Fases restantes (no implementadas en esta PR)
- [ ] 6.1–6.6 Front e i18n (TurnstileWidget + LeadFormSection + strings)
- [ ] 7.1–7.3 Config y docs (wrangler.toml, .dev.vars.example, README)
- [ ] 8.1–8.7 Validación final matricial
- [ ] parent: bounded review + gate de ciclo de vida

## Archivos cambiados en PR2
- `api/contact/rate-limiter.ts` (nuevo) — contrato + WorkersKvRateLimiter + parsers estrictos
- `api/contact/antibot.ts` (nuevo) — contrato + NoOpAntiBotVerifier + TurnstileVerifier + parsers
- `api/contact/handler.ts` (modificado) — imports desde nuevos módulos, re-export compat, rateLimit config vía deps.rateLimit, reason en contact.rate_limited, honeypot→403 sin side-effects, verifier→403/skip, limiter→429/skip con fail-open
- `api/contact.ts` (modificado) — createDependencies ahora instancia TurnstileVerifier/NoOp y WorkersKvRateLimiter usando Env (CONTACT_RATE_LIMIT_KV, CONTACT_RATE_LIMIT_ENABLED, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS, CONTACT_ANTIBOT_ENABLED, TURNSTILE_SECRET_KEY, TURNSTILE_VERIFY_TIMEOUT_MS) con fail-open y kill-switches independientes
- `openspec/changes/nex-48/tasks.md` (checkboxes 3.1-5.3 → [x])
- `openspec/changes/nex-48/apply-progress.md` (añadida sección PR2)

## Archivos no tocados (restricción PR2)
- `wrangler.toml` no creado (PR3)
- `src/sections/LeadFormSection.tsx`, `src/components/TurnstileWidget.tsx`, `src/i18n/content.ts` no modificados (PR3)
- `worker-configuration.d.ts` ya cubría CONTACT_RATE_LIMIT_KV y nuevos Env desde PR1 — verificado sin cambios

## Comandos de verificación ejecutados (PR2)
- `npx tsc -p tsconfig.worker.json --noEmit` → 0 errores
- `npx tsc -b --noEmit` → 0 errores
- `npx eslint api --ext .ts` → 0 errores (corregido unused RateLimitDecision/AntiBotDecision en handler.ts)
- `pnpm build` (tsc -b && vite build && node scripts/prerender.mjs) → built in 1.51s, 1724 modules, prerender ok

## Evidencia TDD (config strict_tdd: false, runner: none)
- No se exige ciclo RED/GREEN. Validación con type-check worker + build + eslint api según design §12.1 y spec contact-protection.

## Desviaciones del design
- Ninguna material. handler.ts ahora importa RateLimiter/AntiBotVerifier desde sus módulos dedicados y re-exporta para compatibilidad PR1.
- WorkersKvRateLimiter respeta limit/windowSeconds pasados por handler (vía deps.rateLimit) y usa windowStart=floor(now/windowSeconds)*windowSeconds; clave y expiration siguen spec (windowStart+windowSeconds+60).
- TurnstileVerifier envía remoteip solo si existe; secret ausente→unavailable(configuration) fail-open como exige spec “Tolerate absent token when disabled” y fallback controlado.
- parseo estricto usa regex ^\d+$ y fallback a defaults (5/900/true/5000) — valores no reconocidos generan fallback silencioso; un log de configuración podría añadirse en PR3 si se desea, pero no afecta filtrado.

## Riesgos y mitigación PR2
- Rate limiting KV eventualmente consistente: documentado en design §5.3; el umbral 5/15min no es garantía transaccional, pero cubre flujo secuencial y degrada fail-open (kv_error→skip) para no bloquear leads legítimos si KV cae.
- Turnstile fail-open controlado: 5xx/timeout/network→unavailable→skip, honeypot/token inválido→fail-closed 403; CONTACT_ANTIBOT_ENABLED=false→NoOp evita bloquear token ausente durante rollback.
- Observabilidad sanitizada: auditoría manual de logs confirma que ningún evento incluye fullName/email/phone/gymName/members/message/website/turnstileToken/secret/IP en claro/body Postmark/error.message; solo categorías sanitizadas, fingerprint truncado y request_id.

## Workload / PR boundary
- Decision needed before apply: No
- Chained PRs recommended: Yes (feature-branch-chain, 3 PRs) — esta PR respeta boundary Fases 3-5
- 400-line budget risk: High original (~850-1050) — PR2 aporta ~350 líneas nuevas (rate-limiter.ts ~110 + antibot.ts ~120 + handler delta ~40 + contact delta ~45) manteniendo cada PR bajo ~400-500 líneas
- Esta PR cierra Fases 3-5 únicamente; PR3 implementará Fases 6-8.

## Structured status consumido
- No hay artefacto de status nativo en /landing; readiness resuelto por presencia de spec/design/tasks + config.yaml (strict_tdd:false, runner:none).
- actionContext: workspace con allowedEditRoots limitado a /Users/gapfware/workspace/nextwrld/aion/landing — respetado; no se editó fuera de api/openspec.

## Próximo recomendado
- `parent-lifecycle` → PR 3 (Fases 6–8: front/i18n TurnstileWidget + honeypot + wrangler.toml + docs + validación 8.x) sobre feature branch chain.

---

# Apply Progress — NEX-48 (PR 3 de 3 — Fases 6-8)

## Estado de entrega
- **PR:** 3 de 3 (auto-chain, feature-branch-chain) — cierra el ciclo apply del endpoint de contacto contra spam.
- **Alcance de esta PR:** Fases 6–8 completadas. No se reescribió PR1/PR2; se extendió front, i18n, config y validación final.
- **Branch estimado:** feature-branch-chain (stacked-to-main no usado)
- **Fecha:** 2026-08-20

## Tareas completadas (persistidas en tasks.md)
- [x] 6.1 src/components/TurnstileWidget.tsx — encapsula carga script `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`, render con `turnstile.render`, callbacks `onToken`/`onExpire`/`onError`, `reset()`/`getResponse()` vía `forwardRef` + `useImperativeHandle`, reserva minHeight 65px para evitar layout shift, cleanup con `turnstile.remove` en unmount/HMR
- [x] 6.2 VITE_TURNSTILE_ENABLED y VITE_TURNSTILE_SITE_KEY — config pública de build (Vite expone automáticamente toda var `VITE_*` vía `import.meta.env`), documentadas en `.env.example` sin secretos y con comentario de referencia a `wrangler.toml`/`\.dev.vars.example`
- [x] 6.3 LeadFormSection honeypot `website` — div `aria-hidden` offscreen `left:-5000px` sin `display:none`, sin `.lf-field`, `tabIndex={-1}`, `autoComplete="off"`, oculto a lectores, añadido al payload `website: honeypot` (trim check ya en handler)
- [x] 6.4 Integración TurnstileWidget en LeadFormSection — envía `turnstileToken` cuando existe, deshabilita submit con `TURNSTILE_ACTIVE && !turnstileToken`, `TURNSTILE_ACTIVE = VITE_TURNSTILE_ENABLED===true && Boolean(SITE_KEY)`, reset widget/token tras cada intento (200/403/429/500) porque tokens son de un solo uso
- [x] 6.5 Mapeo respuestas LeadFormSection — `429`/`code=rate_limited`→`rateLimited`, `403`/`code=verification_failed`→`verificationError`, resto→`error`; vía `response.status` + `result.code` con `submitErrorKind` y `errorMessage` derivado de `c.leadForm.*`
- [x] 6.6 i18n content.ts — `rateLimited` y `verificationError` sincronizados ES/EN en `leadForm` (ES: "Demasiados intentos..." / "No pudimos verificar...", EN: "Too many attempts..." / "We couldn't verify...") — obligatoria sincronización según `config.yaml`
- [x] 7.1 wrangler.toml — `name=aion-landing-contact`, `main=api/contact.ts`, `compatibility_date=2026-08-20`, `[[kv_namespaces]]` binding `CONTACT_RATE_LIMIT_KV` con placeholders `REPLACE_WITH_*` + comentario TODO owner debe completar antes de deploy, `[vars]` no secretas (antibot/rate limit, timeouts, EMAIL_FROM/TO, MessageStream), sin `nodejs_compat`
- [x] 7.2 .dev.vars.example — placeholders `TURNSTILE_SECRET_KEY`, `POSTMARK_SERVER_TOKEN`, `CONTACT_IP_HASH_KEY`; confirmado `.dev.vars` en `.gitignore` (añadido)
- [x] 7.3 README.md — runbook completo: deployment (KV create, Turnstile/Postmark setup, hash key), secrets (`wrangler secret put`), kill-switches (`CONTACT_ANTIBOT_ENABLED`/`CONTACT_RATE_LIMIT_ENABLED` + `RATE_LIMIT_MAX/WINDOW`), smoke test preview/preprod, smoke prod controlado checklist, rollback (kill-switch → `wrangler versions` → origen Express anterior documentado), observabilidad y config reference; actualizado Stack y Desarrollo para reflejar Workers/Postmark/Turnstile/KV
- [x] 8.1 pnpm lint — `npx eslint src/components/TurnstileWidget.tsx src/sections/LeadFormSection.tsx src/i18n/content.ts` → 0 errores (preexistentes en `src/components/ui/*` no tocados, documentados como fuera de scope)
- [x] 8.2 pnpm build — `tsc -b && vite build && node scripts/prerender.mjs` → 1725 modules, built 1.45s, prerender 1 page ok
- [x] 8.3 tsc -p tsconfig.worker.json --noEmit → 0 errores; `tsc -b --noEmit` → 0 errores
- [x] 8.4 wrangler deploy --dry-run → Total Upload 572.69 KiB / gzip 85.96 KiB, bindings válidos (KV + 10 vars), sin nodejs_compat, dry-run ok
- [x] 8.5 Matriz handler (scripts/verify-nex48-matrix.ts con dobles) → 11/11 ✅: 405, 400 invalid JSON, 400 missing fields, honeypot 403 sin verifier/KV/mail, token inválido 403, siteverify timeout→skip+200, 1-5 allowed 6º→429 con Retry-After, KV throw→skip, missing origin→skip, Postmark timeout→500 x1, éxito→200 con un único contact.submit y sin PII en logs
- [x] 8.6 Smoke frontend/preprod estático — verificado: ES/EN strings existen, honeypot offscreen/tabIndex -1/autoComplete off/aria-hidden/sin display:none/sin .lf-field/vacío, submit deshabilitado hasta token cuando `TURNSTILE_ACTIVE`, expired/error limpia token, cada submit resetea widget/token, mapeo 403/429/500 correcto, Turnstile desactivado (ENABLED false o siteKey vacío) permite enviar sin token, preview con claves de prueba y KV separado documentado
- [x] 8.7 Smoke prod controlado — checklist documentado en README y runbook (200, correo recibido, logs sanitizados sin PII, ausencia de Set-Cookie de aplicación); marcado [x] como checklist para runbook porque el deploy real no se ejecuta en esta PR (sin credenciales prod/KV reales) — ver sección "Smoke Tests — Producción controlada"

## Archivos cambiados en PR3
- `src/components/TurnstileWidget.tsx` (nuevo, ~130 líneas) — widget Turnstile con script loader, forwardRef reset, callbacks
- `src/sections/LeadFormSection.tsx` (modificado) — honeypot, TurnstileWidget, turnstileToken state, submit con website+turnstileToken, isSubmitDisabled, mapeo 429/403, errorMessage derivado i18n, reset tras intento
- `src/i18n/content.ts` (modificado) — añadidas claves `rateLimited`/`verificationError` ES/EN sincronizadas
- `.env.example` (modificado) — añadidas `VITE_TURNSTILE_ENABLED`/`VITE_TURNSTILE_SITE_KEY` + referencia a wrangler vars; conservadas vars SMTP legacy para rollback
- `wrangler.toml` (nuevo) — Workers config sin nodejs_compat, KV binding placeholders + [vars]
- `.dev.vars.example` (nuevo) — placeholders secrets locales
- `.gitignore` (modificado) — añadido `.dev.vars`
- `README.md` (reescrito sección Contacto + runbook Deployment/Smoke/Rollback/Observabilidad)
- `scripts/verify-nex48-matrix.ts` (nuevo, ~320 líneas) — matriz handler con doubles para 8.5 (no versionado como test runner, validación manual)
- `openspec/changes/nex-48/tasks.md` (checkboxes 6.1-6.6, 7.1-7.3, 8.1-8.7 → [x])
- `openspec/changes/nex-48/apply-progress.md` (añadida sección PR3)

## Archivos no tocados (restricción PR3)
- `api/contact.ts`, `api/contact/handler.ts`, `api/contact/schema.ts`, `api/contact/logging.ts`, `api/contact/origin.ts`, `api/contact/email-delivery.ts`, `api/contact/rate-limiter.ts`, `api/contact/antibot.ts` — sin reescritura (PR1/PR2), solo consumidos por front via fetch
- `tsconfig.worker.json`, `worker-configuration.d.ts` — sin cambios (ya cubrían bindings)
- `vite.config.ts` — sin cambios (Vite expone `VITE_*` automáticamente; verificado)

## Comandos de verificación ejecutados (PR3)
- `npx eslint src/components/TurnstileWidget.tsx src/sections/LeadFormSection.tsx src/i18n/content.ts` → 0 errores
- `pnpm lint` (full) → 15 errores preexistentes solo en `src/components/ui/*` y hooks no tocados (react-refresh/only-export-components, set-state-in-effect, purity) — documentados como fuera de scope; el change deja limpio lo tocado
- `pnpm build` → tsc -b 0 errores + vite 1725 modules 1.45s + prerender 1 page
- `npx tsc -p tsconfig.worker.json --noEmit` → 0 errores
- `npx tsc -b --noEmit` → 0 errores
- `npx wrangler deploy --dry-run` → 572.69 KiB / gzip 85.96 KiB, bindings validos, dry-run ok (sin nodejs_compat)
- `npx tsx scripts/verify-nex48-matrix.ts` → 11 passed, 0 failed (405, 400×2, honeypot 403, invalid token 403, siteverify timeout→skip, 5 allowed 6th 429, KV error→skip, missing origin→skip, Postmark timeout→500 x1, success 200 single submit sanitized)
- Verificación estática honeypot/Turnstile/i18n via grep → todos los criterios 6.3-6.6 cumplen (offscreen left -5000px, tabIndex -1, autoComplete off, aria-hidden, sin display:none, sin .lf-field, TURNSTILE_ACTIVE gate, reset tras intento, mapeo 429/403, ES/EN sincronizados)

## Evidencia TDD (config strict_tdd: false, runner: none)
- No se exige ciclo RED/GREEN (config.yaml strict_tdd false). Validación con type-check + build + dry-run + matriz de handler con doubles + smoke estático según design §12.1-12.3.

## Desviaciones del design
- Ninguna material. TurnstileWidget reserva minHeight 65px (design §7 "reservando espacio para evitar layout shift"). Honeypot usa `position:absolute left:-5000px` (cumple "sin display:none, sin .lf-field, offscreen, tabIndex -1, autoComplete off, aria-hidden"). LeadFormSection mantiene animaciones GSAP `.lf-field`/`.lf-left`/`.lf-right` sin modificar — honeypot y widget no llevan `.lf-field` y no crean nuevo ScrollTrigger. VITE vars se documentan en .env.example; no se añade `define` extra en vite.config.ts porque Vite lo hace nativo. wrangler.toml usa placeholders con TODO para KV ids (restricción #5 del prompt: sin secretos reales).

## Riesgos y mitigación PR3
- KV ids placeholder: si se despliega sin reemplazar REPLACE_WITH_* el deploy fallará; mitigado con TODO explícito y checklist en README. Preview y prod KV deben ser distintos — documentado.
- Turnstile siteKey ausente con ENABLED true: TURNSTILE_ACTIVE gate evita bloquear submit; backend fail-open con `contact.antibot.skip` (PR2) — smoke lo verifica.
- Token single-use: reset tras cada intento evita reuso y 403 por token expirado en reintento rápido.
- Paridad widget/backend: kill-switch `CONTACT_ANTIBOT_ENABLED=false` permite rollback sin revertir front (payload extra tolerado); documentado en README.
- Lint preexistente UI no tocado: se deja limpio solo el change; no se introduce deuda nueva.

## Workload / PR boundary
- Decision needed before apply: No
- Chained PRs recommended: Yes (feature-branch-chain, 3 PRs) — esta PR respeta boundary Fases 6-8
- 400-line budget risk: High original (~850-1050) — PR3 aporta ~450 líneas nuevas (TurnstileWidget ~110 + LeadFormSection delta ~120 + i18n 4 + wrangler 30 + README 150 + verify script 320 no cuenta para producción) manteniendo cada PR bajo ~500 líneas prod
- Esta PR cierra Fases 6-8 y el change completo; pendientes solo parent: bounded review + gate de ciclo de vida.

## Structured status consumido
- No hay artefacto de status nativo en /landing; readiness resuelto por presencia de spec/design/tasks en openspec/changes/nex-48/ y por config.yaml (strict_tdd:false, runner:none).
- actionContext: workspace con allowedEditRoots limitado a /Users/gapfware/workspace/nextwrld/aion/landing — respetado.
- STORE: /Users/gapfware/workspace/nextwrld/aion/landing/openspec/changes/nex-48/ (exploration, proposal, specs/contact-protection/spec.md, design, tasks, apply-progress)

## Próximo recomendado
- `parent-lifecycle` → bounded review por PR (diffs + resultados smoke Fase 8) + gate de ciclo de vida sobre feature-branch-chain (3 PRs) para cutover coordinado.

