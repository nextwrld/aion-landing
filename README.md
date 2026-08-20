# AION Landing

Sitio comercial bilingüe de AION. Presenta la propuesta de valor, explica el flujo operativo y recibe solicitudes de demostración.

## Stack

- React 19 y TypeScript
- Vite 7
- Tailwind CSS 3.4 (shadcn/ui)
- GSAP + ScrollTrigger, Lenis smooth scroll
- Prerender estático con hidratación en cliente
- Cloudflare Workers (`api/contact.ts`) + Postmark HTTPS API para contacto
- Anti-bot: honeypot + Cloudflare Turnstile (sin cookies)
- Rate limiting: Workers KV (5 / 15 min por IP normalizada)

## Desarrollo

```sh
corepack pnpm install --frozen-lockfile
cp .env.example .env          # vars públicas Vite (VITE_TURNSTILE_ENABLED / VITE_TURNSTILE_SITE_KEY)
cp .dev.vars.example .dev.vars # secrets locales del Worker (no commitear)
corepack pnpm dev
# Worker local (requiere wrangler + .dev.vars + KV preview):
npx wrangler dev --local
```

Env vars públicas de build (Vite, prefijo `VITE_`): ver `.env.example`. Se inyectan en build vía `import.meta.env` (ver `vite.config.ts` — Vite expone automáticamente toda var `VITE_*` al browser). Secretos nunca usan prefijo `VITE_` y van en `.dev.vars` / `wrangler secret put`.

## Validación

```sh
corepack pnpm lint                          # ESLint 9
corepack pnpm build                         # tsc -b + vite build + prerender
npx tsc -p tsconfig.worker.json --noEmit   # type-check Worker (api/ con @cloudflare/workers-types)
npx wrangler deploy --dry-run               # valida bundle + bindings sin desplegar
```

La landing no dispone todavía de una suite automatizada de pruebas (config `strict_tdd: false`, `runner: none`). La matriz del handler se valida con dobles/smoke local (ver docs de contacto).

## Contacto — `POST /api/contact` (Cloudflare Workers)

`api/contact.ts` es un Worker ES Module (`export default { fetch }`). Ruta exclusiva `/api/contact` (404 fuera de ella), 405 con `Allow: POST`, 400 `invalid_request`, 403 `verification_failed` (honeypot / Turnstile), 429 `rate_limited` + `Retry-After`, 500 `delivery_failed`, 200 `success`. Respuestas nunca fugan `error.message`, body de Postmark, token, secret ni IP en claro.

Flujo: validate method/JSON/schema → honeypot (`website.trim()!==""`→403 inmediato) → Turnstile siteverify (invalid→403, 5xx/timeout→`contact.antibot.skip` fail-open) → KV rate limit (`limited`→429, `unavailable`→`contact.rate_limit.skip` fail-open) → Postmark `POST https://api.postmarkapp.com/email` con `AbortController` 10s headers / 20s total (sin retry) → 200 o 500 genérico. Logs JSON: `contact.submit` (delivered), `contact.blocked`, `contact.rate_limited`, `contact.smtp_failure` (transport=https_api + categoría), `contact.antibot.skip`, `contact.rate_limit.skip` con `request_id` y sin PII.

Vars no secretas en `wrangler.toml` [vars]; secrets via `wrangler secret put`. Sin `nodejs_compat`.

## Deployment — Runbook

### Pre-requisitos (una vez)

```sh
# 1. KV namespaces (preview y producción separados)
wrangler kv namespace create CONTACT_RATE_LIMIT_KV
wrangler kv namespace create CONTACT_RATE_LIMIT_KV --preview
# Copiar id / preview_id a wrangler.toml [[kv_namespaces]] (reemplazar REPLACE_WITH_*)

# 2. Turnstile
# Dashboard Cloudflare → Turnstile → Create widget → dominios permitidos (landing prod + preview)
# Guardar Site Key (pública → VITE_TURNSTILE_SITE_KEY) y Secret Key (→ wrangler secret)

# 3. Postmark
# Postmark → Message Streams → verificar sender (EMAIL_FROM), copiar Server Token

# 4. Hash key para origin fingerprint
openssl rand -hex 32  # → CONTACT_IP_HASH_KEY (cambiarlo invalida ventanas KV activas)
```

### Secrets (prod / preview)

Nunca en `wrangler.toml` / `.env` / `.dev.vars.example`:

```sh
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put POSTMARK_SERVER_TOKEN
wrangler secret put CONTACT_IP_HASH_KEY
# Opcional para preview: wrangler secret put <NAME> --env preview
```

Local: `.dev.vars` (gitignored) con los mismos nombres (ver `.dev.vars.example`).

### Deploy

```sh
pnpm lint && pnpm build && npx tsc -p tsconfig.worker.json --noEmit
npx wrangler deploy --dry-run   # verificar bundle y bindings
npx wrangler deploy             # publica Worker (primero en preview/canary, luego prod)
# o versionado:
npx wrangler versions upload
npx wrangler versions deploy <version-id> --preview  # canary
```

Workflow recomendado: preview → matriz + smoke → cutover prod manteniendo el origen Express anterior disponible durante ventana de observación.

## Kill-switches (sin revert de código)

Cambiar vars en `wrangler.toml` [vars] (o Dashboard → Workers → Settings → Variables) y redeployar. Crean nueva versión y quedan auditadas.

| Control | Var | Off | Efecto |
|---|---|---|---|
| Anti-bot (Turnstile) | `CONTACT_ANTIBOT_ENABLED` | `false` | Omite siteverify, tolera token ausente; honeypot sigue activo |
| Rate limiting | `CONTACT_RATE_LIMIT_ENABLED` | `false` | No consulta KV, no hay 429 |
| Límite | `RATE_LIMIT_MAX=5` `RATE_LIMIT_WINDOW_SECONDS=900` | — | Operativo: usar flag explícito, no valores 0 ambiguos |

`TURNSTILE_SECRET_KEY` ausente con `CONTACT_ANTIBOT_ENABLED=true` → fail-open (`contact.antibot.skip` reason=configuration) — smoke test debe fallar aun sin rechazar requests.

## Smoke Tests

### Preview / preprod (antes de cutover prod)

- [ ] `pnpm lint && pnpm build && tsc -p tsconfig.worker.json && wrangler deploy --dry-run` → 0 errores
- [ ] Strings ES/EN: `c.leadForm.rateLimited` y `verificationError` existen en ambos idiomas
- [ ] Honeypot `website` offscreen, `tabIndex=-1`, `autoComplete=off`, `aria-hidden`, sin `display:none`, sin `.lf-field`, vacío por defecto y no tabulable
- [ ] Submit con Turnstile activo permanece deshabilitado hasta token; expiración/error limpia token; cada submit (200/403/429/500) resetea widget/token
- [ ] Turnstile desactivado (`VITE_TURNSTILE_ENABLED=false` o siteKey vacío) permite enviar sin token
- [ ] Handler: 405 fuera de POST, 400 JSON inválido, 403 honeypot poblado (sin llamar Turnstile/KV/correo), 403 token inválido, siteverify timeout→skip+rate-limit, 1–5 pasan 6º→429 con `Retry-After`, otra IP ventana independiente, KV error→skip, Postmark timeout→500 una sola vez, éxito→200 + un único `contact.submit`
- [ ] Logs sanitizados: ningún campo lead / token / secret / IP en claro / body Postmark / error.message
- [ ] Preview usa claves de prueba/sandbox y KV preview separado

### Producción controlada (checklist si no se puede ejecutar deploy real en PR)

- [ ] `POST /api/contact` → 200 `{"success":true}`
- [ ] Correo recibido en `EMAIL_TO` desde `EMAIL_FROM` (MessageStream outbound)
- [ ] Logs: único `contact.submit outcome=delivered`, sin PII, con `request_id`
- [ ] Headers de respuesta sin `Set-Cookie` de aplicación (Turnstile no introduce cookies de app)
- [ ] Monitorizar proporción `submit` vs `blocked/rate_limited/smtp_failure` y skips las primeras horas

## Rollback

1. **Falsos positivos**: desactivar primero `CONTACT_RATE_LIMIT_ENABLED=false`; si persiste, `CONTACT_ANTIBOT_ENABLED=false`. Verificar envío real y logs. No requiere revert de front (backend tolera payload con token/honeypot extra).
2. **Regresión del Worker**: `wrangler versions list` → `wrangler versions deploy <prev-version-id>` o `wrangler rollback` (según versión de wrangler). Siempre versionado; no editar en caliente sin redeploy.
3. **Origen Express anterior (NEX-48 cutover inicial)**: la versión previa al change es handler Express `(req,res)` y NO puede ejecutarse como Worker. Antes del primer cutover, conservar deployment/origen serverless anterior (Vercel/Node) y documentar su route. Rollback inicial = devolver `/api/contact` a ese origen o redeployar allí `api/contact.ts` anterior. `wrangler rollback` solo restaura Workers; no convierte el handler Express.
4. **Front**: honeypot/Turnstile/i18n son aditivos. Si se revierte backend al Express anterior sin anti-bot, tolera campos extra (`website`, `turnstileToken`); o revertir también el front para no dejar widget como requisito.

Condiciones que disparan rollback: pico anómalo de `blocked/rate_limited`, `antibot.skip`/`rate_limit.skip` persistente, aumento de `smtp_failure`, o fallo del smoke de entrega real.

## Observabilidad

Logs: un JSON por línea via `console.log/warn/error`. Eventos: `contact.submit` (info, delivered), `contact.blocked` (info, reason=honeypot|turnstile_missing|turnstile_invalid), `contact.rate_limited` (warn, limit_exhausted+reset_at), `contact.smtp_failure` (error, transport=https_api+categoría), `contact.antibot.skip` / `contact.rate_limit.skip` (warn/info, reason). Métricas derivables: `submit` (conversión técnica), spam bloqueado (`blocked+rate_limited`), tasa protección (`bloqueados/(submit+blocked+rate_limited+smtp_failure)`), salud entrega (`smtp_failure/(submit+smtp_failure)`), degradación cinturones (`antibot.skip`, `rate_limit.skip`).

Campos prohibidos en logs: nombre, email, teléfono, gimnasio, miembros, mensaje, honeypot, token Turnstile, IP en claro, secrets, HTML/body Postmark, `error.message`. `providerRequestId` solo en éxito si no contiene PII.

## Estado comercial

Operativo:

- Contenido en español e inglés (strings sincronizados; nuevas claves `rateLimited`/`verificationError` en ambos idiomas).
- Navegación responsive.
- Secciones de valor, beneficios, flujo, FAQ y roadmap.
- Formulario de solicitud de demo con envío Postmark, honeypot invisible y Turnstile sin cookies.

Parcial o pendiente:

- Los recursos descargables no realizan una entrega real.
- El enlace móvil de inicio de sesión dirige a la sección demo.
- No existe integración con un CRM.
- La importación desde Excel mencionada en la FAQ no está implementada en el producto.
- No hay analítica de conversión ni telemetría de errores (más allá de logs estructurados del Worker).
- Escapado HTML en cuerpo del correo: fuera de scope NEX-48 (hallazgo reportado).

Las capacidades comerciales deben mantenerse alineadas con `../docs/product/capability-matrix.md` en el superproyecto.
