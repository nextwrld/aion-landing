# Verify Report — NEX-48 (protect landing contact form)

- **Fecha:** 2026-08-20
- **Spec verificado contra:** `openspec/changes/nex-48/specs/contact-protection/spec.md` (aprobado)
- **Alcance:** implementación completa aplicada en 3 PRs (auto-chain, feature-branch-chain): Fases 1–2 / 3–5 / 6–8
- **Config:** `strict_tdd: false`, runner `none` → validación estática + smoke + matriz con dobles; `coverage_threshold: 0`
- **Veredicto global:** ✅ **PASS condicional** — los 7 requirements del spec se cumplen; 1 hallazgo WARNING (lint en script de verificación nuevo) y hallazgos INFO (ver §5). Ninguna tarea de implementación sin checkbox.

---

## 1. Veredicto por Requirement del spec

### R1 — Endpoint Anti-Bot Validation → ✅ CUMPLIDO (NEX-48 criterio 1)

| MUST del spec | Evidencia |
|---|---|
| Honeypot poblado → `400`/`403` genérico, sin SMTP | `api/contact/handler.ts:127-137` — `website.trim() !== ""` → 403 `{code:"verification_failed"}` antes de verifier/KV/delivery. Matriz caso 4: ✅ con asserts `!verifierCalled && !limiterCalled && !deliveryCalled`. |
| Turnstile verificado server-side antes del envío | `api/contact/antibot.ts` (`TurnstileVerifier.verify` POST a `siteverify`) integrado en `handler.ts:141-157`. |
| Token ausente/inválido → `400`/`403` genérico | `antibot.ts`: `missing_token`→invalid, `success:false`→`rejected`(invalid) → `handler.ts:157` 403. Matriz caso 5: ✅. |
| Sin cookies de aplicación | grep `cookie` en `api/` → NONE. Front no introduce cookies (proposal §exclusiones). |

Escenarios GWT:
- *Legitimate submission passes* → matriz caso 11 (200, delivery llamada) ✅
- *Filled honeypot is blocked* → matriz caso 4 (403 sin Turnstile/KV/mail) ✅
- *Invalid Turnstile token is blocked* → matriz caso 5 (403, sin limiter/delivery) ✅

### R2 — Controlled Anti-Bot Verification Fallback → ✅ CUMPLIDO (NEX-48 criterio 5)

| MUST | Evidencia |
|---|---|
| Fail-open si `siteverify` no puede completar | `antibot.ts`: 5xx→`provider`, timeout→`timeout`, red→`network`, ilegible→`provider`, secret ausente→`configuration`; todas `unavailable`. `handler.ts:159-172` continúa a rate limit/delivery. |
| Continuar por rate limiting y entrega normal | `handler.ts` no retorna tras `unavailable`; matriz caso 6: ✅ `delivery called despite verifier unavailable`. |
| Log `contact.antibot.skip` | `handler.ts:160,171`; matriz caso 6 assert `contact.antibot.skip reason=timeout` ✅. |
| No rechazar solo por verificador caído | matriz caso 6 → 200 ✅. |

Escenario GWT *Turnstile verifier is unavailable* → matriz caso 6 ✅ (200 + skip + delivery).

### R3 — Origin-Based Rate Limiting → ✅ CUMPLIDO (NEX-48 criterio 2)

| MUST | Evidencia |
|---|---|
| 5 intentos / ventana de 15 min por `CF-Connecting-IP` normalizado | `api/contact.ts:60-67` defaults `limit=5`, `windowSeconds=900`; `rate-limiter.ts` ventana fija `floor(now/900)*900`. |
| Estado compartido en Workers KV vía boundary `RateLimiter` | `rate-limiter.ts` interfaz `RateLimiter` + `WorkersKvRateLimiter` (binding `CONTACT_RATE_LIMIT_KV`, wrangler.toml). |
| Solo IP normalizada como clave | `origin.ts` extrae únicamente `CF-Connecting-IP` (nunca `X-Forwarded-For`, comentado `origin.ts:3`), deriva `originKey` HMAC-SHA-256 con `CONTACT_IP_HASH_KEY`; clave `contact:rate:v1:{windowStart}:{originKey}`. |
| `429` sin intento de SMTP al agotar | `handler.ts:201-217` — 429 `{code:"rate_limited"}` + `Retry-After`, retorno antes de delivery. |

Escenarios GWT:
- *Repeated submission exceeds the limit* → matriz caso 7 (1–5 → 200; 6º → 429) ✅
- *Shared IP is limited as one origin* → cumplido por construcción: la clave es exclusivamente el hash de la IP normalizada (todos los clientes tras la misma IP comparten contador). ✅

Nota (no bloqueante): el read→write sobre KV no es transaccional (consistencia eventual); documentado en design.md §5.3 como decisión aceptada. El spec exige estado KV compartido, no atomicidad.

### R4 — Bounded and Sanitized SMTP Delivery → ✅ CUMPLIDO (equivalente documentado) (NEX-48 criterio 3)

| MUST | Evidencia |
|---|---|
| Acotar esperas de conexión/saludo (~10 s) e inactividad (~20 s) | `email-delivery.ts:31-33,73-74` — `EMAIL_HEADERS_TIMEOUT_MS` 10 000 ms (abort si no llegan headers) y `EMAIL_TOTAL_TIMEOUT_MS` 20 000 ms (total). |
| Sin reintento dentro del mismo request | `handler.ts:268-303` invoca `delivery.send(message)` exactamente una vez; fallo → 500 inmediato. Matriz caso 10: “Postmark timeout → 500 once” ✅. |
| Error genérico sin mensaje del proveedor | 500 `{success:false, code:"delivery_failed"}` (`handler.ts:291,303`); `email-delivery.ts:115` devuelve solo categoría (`provider`/`timeout`/`network`/`configuration`), nunca body ni `error.message`. |

⚠️ **Desvío de letra (aprobado en design):** el spec habla de fases SMTP literales (conexión/saludo/socket); la implementación entrega vía **Postmark HTTPS API** (decisión design.md §2, opción B: `fetch` nativo sin `nodejs_compat`; §3: “los timeouts ya no corresponden literalmente a fases SMTP”). Las garantías funcionales del requirement (acotado, sin reintento, sin fuga) se preservan íntegras. Se recomienda nota de reconciliación en archive o enmienda de wording del spec (SMTP → “email delivery”). Ver hallazgo F2.

Escenarios GWT: *SMTP delivery times out* → matriz caso 10 ✅; *SMTP provider returns an error* → cubierto por mapping no-2xx→`provider`→500 genérico (`email-delivery.ts:113-115`) ✅.

### R5 — Contact Flow Observability → ✅ CUMPLIDO (NEX-48 criterio 4)

| MUST | Evidencia |
|---|---|
| Eventos `contact.submit`, `contact.blocked`, `contact.rate_limited`, `contact.smtp_failure` | `handler.ts:270` (submit, `outcome=delivered`), `handler.ts` blocked (honeypot/turnstile_missing/turnstile_invalid/invalid_request/method_not_allowed), `:204` (rate_limited, `reason=limit_exhausted` + `reset_at`), `:283,295` (smtp_failure, `transport=https_api` + categoría sanitizada). |
| Reason machine-readable sin contenido del lead | Auditoría de todos los call-sites del logger: solo `timestamp/event/request_id/reason/origin_fingerprint/http_status/duration_ms/outcome/category/transport/reset_at/provider_request_id`. `logging.ts:15-41` lista `FORBIDDEN_LOG_FIELDS`. Matriz caso 11 assert “no PII in logs” ✅. |

Escenarios GWT: *blocked by honeypot* → matriz caso 4 assert `contact.blocked reason=honeypot` ✅; *SMTP delivery fails* → matriz caso 10 emite `contact.smtp_failure` ✅.

Nota INFO (F6): `FORBIDDEN_LOG_FIELDS` es lista documental, no se aplica en runtime; los call-sites actuales cumplen. No viola ningún MUST.

### R6 — Lead Form Protection and Localized Feedback → ✅ CUMPLIDO (NEX-48 criterios 1, 2, 5)

| MUST | Evidencia |
|---|---|
| Envía honeypot vacío + token Turnstile | `LeadFormSection.tsx` payload: `website: honeypot` + `turnstileToken` si existe. |
| Widget sin cookies de aplicación | `TurnstileWidget.tsx` carga `api.js?render=explicit` y renderiza; ninguna cookie propia. |
| Honeypot accesible a bots, no a usuarios/AT | `LeadFormSection.tsx:157-178`: `position:absolute; left:-5000px`, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`, **sin `display:none`**, sin clase `.lf-field` (no entra en animación GSAP). |
| `429`/anti-bot como no-éxito con feedback diferenciado | `LeadFormSection.tsx`: `status===429||code==='rate_limited'`→`rateLimited`; `status===403||code==='verification_failed'`→`verificationError`; resto→`error`; `setFormState('error')` (sale del success). Reset de widget/token tras cada intento (tokens de un solo uso). Submit deshabilitado hasta tener token cuando `TURNSTILE_ACTIVE` (`:121`). |
| Strings nuevos en todos los idiomas | `src/i18n/content.ts:208-211` (ES: “Demasiados intentos…”, “No pudimos verificar…”) y `:445-447` (EN: “Too many attempts…”, “We couldn't verify…”) — sincronizados ES/EN ✅. |

Escenarios GWT: *form receives 429* y *form receives anti-bot rejection* → verificados por inspección del mapping + estados (no hay runner e2e; runner `none` en config). ✅

### R7 — Protection Configuration and Rollback → ✅ CUMPLIDO (soporta NEX-48 criterio 5)

| MUST | Evidencia |
|---|---|
| Turnstile y rate limit desactivables de forma independiente sin revert | `api/contact.ts:50-57` (`CONTACT_ANTIBOT_ENABLED=false` → `NoOpAntiBotVerifier`); `rate-limiter.ts:75` (`enabled=false` → `unavailable:disabled` → handler fail-open, nunca 429). Kill-switches independientes en `wrangler.toml [vars]`. |
| Turnstile deshabilitado tolera token ausente | `NoOpAntiBotVerifier.verify()` → `unavailable/disabled` → `contact.antibot.skip` y continúa (`handler.ts:159-166`). |
| Rate limit deshabilitado no produce 429 | `handler.ts:218-222` trata `unavailable` como skip y continúa. |
| Docs de controles + procedimiento de restauración | README.md: “Kill-switches” (líneas 95-105) y “Rollback” (128-135): kill-switch → `wrangler versions deploy <prev>` / `wrangler rollback` → **devolver route `/api/contact` al origen Express anterior** (línea 132, con advertencia de que `wrangler rollback` no convierte el handler Express). |

Escenario GWT *Turnstile is disabled for rollback* → cumplido vía NoOp + fail-open (token ausente no rechaza). ✅

---

## 2. Comandos ejecutados en esta sesión verify (salidas reales)

| # | Comando | Resultado |
|---|---|---|
| 1 | `npx tsc -p tsconfig.worker.json --noEmit` | ✅ exit 0, sin errores |
| 2 | `npx tsc -b --noEmit` | ✅ exit 0, sin errores |
| 3 | `pnpm build` (`tsc -b && vite build && node scripts/prerender.mjs`) | ✅ exit 0 — 1725 módulos, built 1.41s, prerender 1 page `/` |
| 4 | `npx wrangler deploy --dry-run` | ✅ exit 0 — Total Upload 572.69 KiB / gzip 85.96 KiB; bindings: KV `CONTACT_RATE_LIMIT_KV` + 11 vars; sin `nodejs_compat` |
| 5 | `npx tsx scripts/verify-nex48-matrix.ts` | ✅ exit 0 — **11 passed, 0 failed** (405; 400 JSON; 400 fields; honeypot 403 sin side-effects; token inválido 403; siteverify timeout→skip+200; 1–5 ok 6º→429 con Retry-After; KV error→skip; missing origin→skip; Postmark timeout→500 x1; éxito→200 single submit sin PII) |
| 6 | `npx eslint src/components/TurnstileWidget.tsx src/sections/LeadFormSection.tsx src/i18n/content.ts api/contact.ts "api/contact/**/*.ts"` | ✅ exit 0 — 0 errores en archivos de producción del change |
| 7 | `npx eslint scripts/verify-nex48-matrix.ts` | ❌ exit 1 — **7 errores** (ver hallazgo F1) |
| 8 | `npx eslint .` (global) | 21 errores = 14 preexistentes ajenos al change (`src/components/ui/*`, hooks, `I18nProvider.tsx`, `vite-env.d.ts` — no modificados por NEX-48) + 7 del script nuevo (F1). Los errores preexistentes se documentan como fuera de scope. |

Auditorías estáticas adicionales: grep `cookie`/`X-Forwarded-For`/`nodemailer`/`error.message` en `api/` → sin fugas ni residuos (nodemailer eliminado de `package.json` y lockfile; `api/_utils/email.ts` borrado).

---

## 3. Criterios de aceptación NEX-48 (1–5)

| # | Criterio (proposal.md) | Estado | Cómo se verifica |
|---|---|---|---|
| 1 | Sumisiones automatizadas se rechazan sin fricción para usuarios reales | ✅ | Honeypot siempre activo + Turnstile server-side; 403 genérico (R1). Matriz casos 4-5. |
| 2 | Reenvíos repetidos desde un mismo origen quedan limitados | ✅ | KV 5/15 min por `CF-Connecting-IP` normalizado; 429 + i18n `rateLimited` (R3, R6). Matriz caso 7. |
| 3 | Flujo de entrega acotado: sin cuelgues ni amplificación | ✅ | Timeouts 10 s headers / 20 s total; sin reintento; 500 genérico (R4). Matriz caso 10. (Transporte Postmark HTTPS según design §2.) |
| 4 | Observabilidad para distinguir spam de conversión | ✅ | `submit/blocked/rate_limited/smtp_failure` + skips con reason machine-readable y fingerprint truncado (R5). |
| 5 | Conversión legítima no se degrada | ✅ | Sin cookies; fail-open verificador/caída KV; kill-switches independientes; feedback ES/EN diferenciado; rollback documentado (R2, R6, R7). |

---

## 4. Completitud de tareas (checkboxes)

- Tareas de implementación 1.1–8.7: **todas `[x]`**. Escaneo `^\s*- \[ \]` en `tasks.md` → 0 tareas de implementación sin marcar.
- Líneas `[ ]` restantes (2) son pasos de ciclo de vida **propiedad del parent**, no implementación:
  - `- [ ] Iniciar o reutilizar bounded review por PR (diffs y resultados de smoke de Fase 8). <!-- sdd-owner: parent -->`
  - `- [ ] Gate de ciclo de vida: confirmar cutover/rollback documentado y decidir apply/archive. <!-- sdd-owner: parent -->`
  El bounded review/gate queda pendiente por decisión del orchestrator (fuera de esta fase verify).

## 5. Hallazgos / Desvíos

| ID | Sev | Archivo:línea | Descripción | Qué tocar (no corregido en verify) |
|---|---|---|---|---|
| F1 | ⚠️ WARNING | `scripts/verify-nex48-matrix.ts:21,59,183,190(×3),314` | 7 errores ESLint en el script de matriz **nuevo** del change (`ban-ts-comment` en `@ts-ignore`; `no-unused-vars` en `logs`, `kv`, `_k/_l/_w`, `forbidden`). El claim 8.1 “lint a cero en lo tocado” no lo cubrió porque solo se lintaron front y `api/`. Rompe `pnpm lint` global además de los 14 preexistentes. | Fix trivial: `@ts-ignore`→`@ts-expect-error`, eliminar/prefijar vars no usadas; re-ejecutar eslint. No bloquea spec, pero debería resolverse antes de archive. |
| F2 | ℹ️ INFO (desvío aprobado) | spec.md “Bounded and Sanitized SMTP Delivery” vs `email-delivery.ts` | El spec usa terminología SMTP literal; la entrega es Postmark HTTPS (design.md §2-§3, opción B, aprobada). Garantías (acotado 10/20 s, sin reintento, sin fuga) preservadas. | En archive: nota de reconciliación, o enmienda de wording del spec. |
| F3 | ℹ️ INFO | `vite.config.ts` | apply-progress PR3 lo declara “sin cambios”, pero el diff elimina el newline final del archivo. Cosmético, sin impacto. | Nada (o restaurar newline si se quiere diff limpio). |
| F4 | ℹ️ INFO | apply-progress.md (PR3) | Conteos inexactos: dice 15 errores lint preexistentes (son 14) y 10 vars en dry-run (son 11). | Corrección documental opcional. |
| F5 | ℹ️ INFO | `wrangler.toml:15-18` | KV ids `REPLACE_WITH_*` placeholders: el dry-run pasa, pero un deploy real fallará hasta sustituirlos. Correcto en esta fase (sin credenciales prod); TODO documentado en archivo y README. | Owner completa ids antes del primer deploy real. |
| F6 | ℹ️ INFO | `api/contact/logging.ts:15` | `FORBIDDEN_LOG_FIELDS` es lista documental, sin enforcement runtime. Call-sites actuales cumplen (auditado). | Opcional: sanitizer defensivo futuro. |
| F7 | ℹ️ INFO | estado git del repo | Las 3 “PRs” constan en apply-progress, pero el trabajo figura como cambios sin commitear en el working tree (HEAD `e273d6c` previo al change); no se observan ramas/commits por PR. Los límites PR1/PR2/PR3 se verifican solo vía apply-progress. | Parent confirma el merge/commits de la cadena en el gate. |

### Ausencia de PII/secretos y de fuga de `error.message` (auditoría explícita)

- `logging.ts`: lista de campos prohibidos documentada; `emit()` solo serializa campos provistos por el caller — ningún caller pasa lead/token/secret/IP/body (auditado línea a línea en `handler.ts` y `contact.ts`).
- `handler.ts`: respuestas HTTP fijas `{success, code}` (405/400/403/429/500/200); ningún path incluye `error.message`, stack, ni detalle de proveedor (`handler.ts:281,291,303`).
- `email-delivery.ts`: no-2xx → `{kind:"failed", category:"provider"}` sin body (`:113-115`); timeout/red → categoría; el body de Postmark solo se parsea en éxito para extraer `MessageID` (permitido por design §6, sin PII).
- `origin.ts`: IP solo en memoria para HMAC + `remoteip` a Turnstile; en logs únicamente fingerprint truncado de 12 chars del hash.

### i18n y honeypot (verificación explícita)

- `rateLimited`/`verificationError` presentes y sincronizados en ES (`content.ts:208-211`) y EN (`content.ts:445-447`).
- Honeypot: offscreen `left:-5000px`, sin `display:none`, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`, sin `.lf-field`.

---

## 6. Strict TDD / Review Workload

- **Strict TDD:** inactivo (`strict_tdd: false`, runner `none`) → no se exige tabla TDD Cycle Evidence. La matriz `scripts/verify-nex48-matrix.ts` actúa como harness de validación; sus asserts son sustantivos (status codes, headers, call-counts de dobles, eventos de log, ausencia de PII) — sin tautologías ni tests humo detectadas.
- **Review Workload Forecast:** chained PRs recomendado (3 PRs, `feature-branch-chain`, auto-chain) → respetado: PR1 Fases 1-2 (~450 líneas), PR2 Fases 3-5 (~350), PR3 Fases 6-8 (~450 prod, script aparte). Sin scope creep en tareas; ver F7 sobre la evidencia de ramas.

## 7. Veredicto final

**PASS condicional.** Los 7 requirements y todos los escenarios GWT del spec se cumplen (validación estática + build + dry-run + matriz 11/11). Criterios NEX-48 1–5 cumplidos. Único item a resolver antes de archive: **F1** (7 errores eslint en `scripts/verify-nex48-matrix.ts`, fix trivial). El resto son hallazgos INFO. Bounded review y gate quedan pendientes del parent según tareas `[ ]` de ciclo de vida.


### F1 — RESUELTO (2026-08-20)
^nLos 7 errores eslint del script de matriz se corrigieron; 0 errores y matriz 11/11.
