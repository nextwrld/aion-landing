# Tasks: proteger el formulario de contacto contra abuso y spam (NEX-48)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~850–1050 (additions + deletions) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Fases 1–2) → PR 2 (Fases 3–5) → PR 3 (Fases 6–8) |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

```text
Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High
```

Límites de PR autónomos (cada uno con start/finish/verificación/rollback propios):

- **PR 1 — Worker + entrega Postmark (Fases 1–2):** migra el endpoint y cambia el transporte de correo. Deja el flujo al menos tan protegido como hoy y es verificable con el camino feliz. Rollback: devolver la route al origen Express anterior conservado.
- **PR 2 — Protecciones backend (Fases 3–5):** rate limit + anti-bot + observabilidad, tras la interfaz `RateLimiter`/`AntiBotVerifier`. Kill-switches permiten desplegar con controles y revertir por config sin revertir código.
- **PR 3 — Front, i18n, config y validación (Fases 6–8):** widget Turnstile + honeypot + feedback + docs + cutover coordinado (el backend ya tolera token/honeypot ausente vía fail-open/disabled).

Las decisiones de diseño ya están tomadas en `design.md`; no se requiere decisión adicional antes del apply.

---

## Fase 1 — Endpoint Workers

**Validación de fase:** sin test runner (`config.yaml: runner none`, `strict_tdd: false`); se valida con `tsc -p tsconfig.worker.json` y `wrangler deploy --dry-run`.

- [x] 1.1 Crear `api/contact/schema.ts` con `contactRequestSchema` (Zod): `fullName`, `email`, `message` requeridos con `trim().min(1)`; `phone`, `gymName`, `members` opcionales con `default("")`; `website` (honeypot) y `turnstileToken` opcionales; descartar campos desconocidos. <!-- sdd-owner: implementation -->
- [x] 1.2 Crear `api/contact/logging.ts` con logger JSON (`timestamp`, `event`, `request_id`, `http_status`, `duration_ms` y campos por evento) y la lista de campos prohibidos (datos del lead, token, secret, IP en claro, body de Postmark, `error.message`). <!-- sdd-owner: implementation -->
- [x] 1.3 Crear `api/contact/origin.ts` para extraer/normalizar `CF-Connecting-IP`, derivar `originKey` con HMAC-SHA-256 usando `CONTACT_IP_HASH_KEY` y emitir `origin_fingerprint` truncado, sin exponer la IP en claro. <!-- sdd-owner: implementation -->
- [x] 1.4 Crear `api/contact/handler.ts` con `createContactHandler(deps)` recibiendo verifier/limiter/delivery/logger/origin por parámetro; implementar el contrato HTTP (405+`Allow: POST`, 400 `invalid_request`, 403 `verification_failed`, 429 `rate_limited`+`Retry-After`, 500 `delivery_failed`, 200 `success`) respondiendo una sola vez y sin fugar `error.message`. <!-- sdd-owner: implementation -->
- [x] 1.5 Reescribir `api/contact.ts` como `export default { fetch(request, env, ctx) }` con la interface `Env`, `createDependencies(env, ctx)` y route exclusiva `/api/contact` (404 para el resto de paths). <!-- sdd-owner: implementation -->
- [x] 1.6 Crear `tsconfig.worker.json` (types de Workers, `include: ["api"]`, separado del type-check DOM/Vite) y `worker-configuration.d.ts` con el binding `CONTACT_RATE_LIMIT_KV`. <!-- sdd-owner: implementation -->

## Fase 2 — Entrega de correo vía Postmark API

**Validación de fase:** `pnpm lint`; smoke local del camino feliz con Postmark sandbox y del timeout mediante dobles.

- [x] 2.1 Crear `api/contact/email-delivery.ts` con el tipo `EmailMessage` y la interfaz `EmailDelivery` (`{ kind: "accepted" }` / `{ kind: "failed"; category }`). <!-- sdd-owner: implementation -->
- [x] 2.2 Implementar `PostmarkEmailDelivery` con `fetch("https://api.postmarkapp.com/email")`, header `X-Postmark-Server-Token` desde `POSTMARK_SERVER_TOKEN`, y body `from`/`to`/`subject`/`html` + `MessageStream` desde `POSTMARK_MESSAGE_STREAM`. <!-- sdd-owner: implementation -->
- [x] 2.3 Implementar timeouts con `AbortController`: abortar a ~10 s si no llegan headers (`EMAIL_HEADERS_TIMEOUT_MS`) y a ~20 s total (`EMAIL_TOTAL_TIMEOUT_MS`). <!-- sdd-owner: implementation -->
- [x] 2.4 Mapear resultado: `2xx`→`accepted` (con `providerRequestId` opcional); timeout/red/no-`2xx`/config ausente→`failed` por categoría; sin reintento y sin devolver body ni mensaje del proveedor. <!-- sdd-owner: implementation -->
- [x] 2.5 Eliminar Nodemailer: borrar `api/_utils/email.ts`, quitar `nodemailer` y `@types/nodemailer` de `package.json` y regenerar `pnpm-lock.yaml`. <!-- sdd-owner: implementation -->

## Fase 3 — Rate limiting

**Validación de fase:** smoke con KV real/local para 1–5 intentos permitidos y el 6º→429; caso KV ausente→`rate_limit.skip` (manual, sin runner).

- [x] 3.1 Crear `api/contact/rate-limiter.ts` con la interfaz `RateLimiter` y el tipo `RateLimitDecision` (`allowed`/`limited`/`unavailable`). <!-- sdd-owner: implementation -->
- [x] 3.2 Implementar `WorkersKvRateLimiter` con ventana fija: `windowStart = floor(now/900)*900`, clave `contact:rate:v1:{windowStart}:{originKey}`, leer `{count}`; `count >= limit`→`limited`, si no escribir `count+1` con expiración `windowStart + 900 + 60`. <!-- sdd-owner: implementation -->
- [x] 3.3 Convertir errores KV/binding ausente/origen ausente a `unavailable`; parsear estrictamente `CONTACT_RATE_LIMIT_ENABLED`, `RATE_LIMIT_MAX` y `RATE_LIMIT_WINDOW_SECONDS`. <!-- sdd-owner: implementation -->
- [x] 3.4 Integrar en `handler.ts` antes de la entrega: `limited`→429 `rate_limited` sin correo; `unavailable`→emitir `contact.rate_limit.skip` y continuar fail-open. <!-- sdd-owner: implementation -->

## Fase 4 — Anti-bot

**Validación de fase:** smoke de honeypot poblado, token ausente/inválido y `siteverify` en timeout→`antibot.skip` (manual).

- [x] 4.1 Crear `api/contact/antibot.ts` con la interfaz `AntiBotVerifier`, el tipo `AntiBotDecision` (`valid`/`invalid`/`unavailable`) y la implementación no-op para control deshabilitado. <!-- sdd-owner: implementation -->
- [x] 4.2 Implementar `TurnstileVerifier`: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` como `application/x-www-form-urlencoded` (`secret`/`response`/`remoteip`), timeout corto default 5 s (`TURNSTILE_VERIFY_TIMEOUT_MS`); clasificar `success:false`→`invalid`, `5xx`/timeout/red/ilegible→`unavailable`, secret ausente→`unavailable(configuration)`. <!-- sdd-owner: implementation -->
- [x] 4.3 Integrar en `handler.ts`: honeypot primero (`website.trim() !== ""`→403 sin Turnstile/KV/correo); luego verifier (`invalid`→403, `unavailable`→log `contact.antibot.skip` y continuar); `CONTACT_ANTIBOT_ENABLED=false`→no-op que tolera token ausente. <!-- sdd-owner: implementation -->

## Fase 5 — Observabilidad

**Validación de fase:** revisar en preview los 5 eventos (`submit`/`blocked`/`rate_limited`/`smtp_failure`) más los 2 skips y confirmar campos sanitizados.

- [x] 5.1 Emitir `contact.submit` (`outcome=delivered`) al aceptar Postmark y `contact.smtp_failure` (`transport=https_api`, categoría sanitizada) al fallar. <!-- sdd-owner: implementation -->
- [x] 5.2 Emitir `contact.blocked` (`reason=honeypot|turnstile_missing|turnstile_invalid`), `contact.rate_limited`, `contact.antibot.skip` y `contact.rate_limit.skip` con `reason`/`origin_fingerprint`/`http_status`/`duration_ms`. <!-- sdd-owner: implementation -->
- [x] 5.3 Auditar que ningún log contenga campos del lead, token, secret, IP en claro, body de Postmark o `error.message`; incluir `request_id` en cada línea emitida. <!-- sdd-owner: implementation -->

## Fase 6 — Front e i18n

**Validación de fase:** `pnpm lint` + `pnpm build`; prueba manual de estados 403/429/500 y del widget.

- [x] 6.1 Crear `src/components/TurnstileWidget.tsx` encapsulando carga del script, render del widget, callback de token, notificación de expiración/error y `reset()`. <!-- sdd-owner: implementation -->
- [x] 6.2 Añadir `VITE_TURNSTILE_ENABLED` y `VITE_TURNSTILE_SITE_KEY` como config pública de build y documentarlas en `.env.example` (sin secretos). <!-- sdd-owner: implementation -->
- [x] 6.3 Modificar `src/sections/LeadFormSection.tsx`: campo honeypot `website` (offscreen, `tabIndex={-1}`, `autoComplete="off"`, oculto a lectores de pantalla, sin `display:none`, sin `.lf-field`) y añadirlo al payload. <!-- sdd-owner: implementation -->
- [x] 6.4 Integrar el widget en `LeadFormSection.tsx`: enviar `turnstileToken`, deshabilitar submit hasta disponer de token cuando Turnstile está activo, y resetear widget/token tras cada intento. <!-- sdd-owner: implementation -->
- [x] 6.5 Mapear respuestas en `LeadFormSection.tsx`: `429`/`code=rate_limited`→`rateLimited`; `403`/`code=verification_failed`→`verificationError`; resto→`error`. <!-- sdd-owner: implementation -->
- [x] 6.6 Añadir `rateLimited` y `verificationError` en español e inglés en `src/i18n/content.ts` (sincronización obligatoria ES/EN). <!-- sdd-owner: implementation -->

## Fase 7 — Config y docs

**Validación de fase:** revisión de que ningún secret quede en archivos versionados.

- [x] 7.1 Crear `wrangler.toml` con `name`, `main = "api/contact.ts"`, `compatibility_date`, `[[kv_namespaces]]` binding `CONTACT_RATE_LIMIT_KV` (ids de preview/prod) y `[vars]` no secretas; sin `nodejs_compat`. <!-- sdd-owner: implementation -->
- [x] 7.2 Crear `.dev.vars.example` con placeholders (`TURNSTILE_SECRET_KEY`, `POSTMARK_SERVER_TOKEN`, `CONTACT_IP_HASH_KEY`) y confirmar `.dev.vars` en `.gitignore`. <!-- sdd-owner: implementation -->
- [x] 7.3 Actualizar `README.md` con runbook de deployment, secrets (`wrangler secret put`), kill-switches, smoke test y procedimiento de rollback (incluido devolver la route al origen Express anterior). <!-- sdd-owner: implementation -->

## Fase 8 — Validación final

**Validación de fase:** sin runner automatizado; son comprobaciones estáticas y smoke manuales que cierran el change.

- [x] 8.1 Ejecutar `pnpm lint` y corregir hasta cero errores. <!-- sdd-owner: implementation -->
- [x] 8.2 Ejecutar `pnpm build` (tsc -b + vite build + prerender) y corregir hasta cero errores. <!-- sdd-owner: implementation -->
- [x] 8.3 Ejecutar `tsc -p tsconfig.worker.json` y corregir hasta cero errores. <!-- sdd-owner: implementation -->
- [x] 8.4 Ejecutar `wrangler deploy --dry-run` y confirmar bundle y bindings válidos. <!-- sdd-owner: implementation -->
- [x] 8.5 Ejecutar la matriz del handler (dobles/smoke local): 405, 400, honeypot 403, token inválido 403, `siteverify` timeout→skip, 1–5 pasan y 6º→429, KV error→skip, Postmark timeout→500 una sola vez, éxito→200 con un único `contact.submit`, sin PII en logs. <!-- sdd-owner: implementation -->
- [x] 8.6 Ejecutar smoke frontend/preprod: strings ES/EN, honeypot inaccesible y vacío, submit espera token, reset del widget, mapeo 403/429/500, Turnstile desactivado permite enviar sin token, preview con claves de prueba y KV separado. <!-- sdd-owner: implementation -->
- [x] 8.7 Ejecutar smoke de producción controlado: `200`, correo recibido, logs sanitizados y ausencia de cookies de aplicación. <!-- sdd-owner: implementation -->

---

## Revisión acotada y gate (post-apply)

- [ ] Iniciar o reutilizar bounded review por PR (diffs y resultados de smoke de Fase 8). <!-- sdd-owner: parent -->
- [ ] Gate de ciclo de vida: confirmar cutover/rollback documentado y decidir apply/archive. <!-- sdd-owner: parent -->
