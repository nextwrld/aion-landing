# Proposal: proteger el formulario de contacto contra abuso y spam (NEX-48)

Estado: borrador para aprobación del owner.
Input: `openspec/changes/nex-48/exploration.md` (análisis técnico y estado actual verificado).

## Problema

`POST /api/contact` es un endpoint público sin control de frecuencia, sin anti-bot y sin
timeouts explícitos en el transporte SMTP (Nodemailer). Consecuencias verificadas:

- Un atacante puede bombardear el endpoint y consumir cuota/coste SMTP sin límite.
- `sendMail` puede quedar colgado indefinidamente (sin `connectionTimeout`/`greetingTimeout`/
  `socketTimeout`), reteniendo el worker/instancia.
- El `500` actual filtra `error.message` con detalles internos del proveedor SMTP.
- No existe ninguna señal observable que distinga spam de conversión legítima.

## Resultado esperado

Rechazar el abuso automatizado y los reenvíos repetidos **sin degradar la conversión
legítima**: los leads reales siguen llegando al correo de ventas, con fricción invisible
para humanos, errores acotados ante fallos SMTP, respuestas sin fugas internas y logging
estructurado que permita calibrar umbrales y medir spam vs. conversión.

## Alcance

### In-scope

1. **Migración del endpoint a Cloudflare Workers** (decisión del owner): reescribir el
   handler Express-style `(req, res)` de `api/contact.ts` como módulo ES de Worker
   (`export default { fetch(Request, Env) }`, `Request`/`Response` estándar).
2. **Anti-bot**: campo honeypot oculto en el formulario + Cloudflare Turnstile
   (widget en el front, verificación server-side vía `siteverify`). Sin cookies.
3. **Rate limiting distribuido**:Workers KV detrás de una interfaz `RateLimiter`;
   default propuesto ~5 intentos / 15 min por IP normalizada (`CF-Connecting-IP`).
4. **Timeouts SMTP**: `connectionTimeout`/`greetingTimeout` ~10 s, `socketTimeout` ~20 s;
   sin reintento dentro del request.
5. **Respuestas sanitizadas**: errores genéricos al cliente; nunca `error.message` del SMTP.
6. **Observabilidad**: logging estructurado (JSON) de `contact.submit`, `contact.blocked`
   (honeypot/turnstile), `contact.rate_limited`, `contact.smtp_failure`.
7. **Front**: `LeadFormSection.tsx` integra honeypot + widget Turnstile y maneja los
   nuevos estados de error; strings nuevos sincronizados en `src/i18n/content.ts`.
8. **Config de deployment**: `wrangler.toml` (binding KV + secrets/vars) y actualización
   de `.env.example`/README con las nuevas variables y el runbook de fallback.

### Out-of-scope

- Escapado de HTML en el cuerpo del correo (HTML injection): hallazgo colateral reportado,
  se tratará en un change separado.
- Deduplicación de la config SMTP (`api/_utils/email.ts` vs. inline): deriva reportada;
  la reescritura del handler puede absorberla incidentalmente, pero no es objetivo.
- Validación server-side de longitud/formato de campos: refinamiento posterior.
- Cola/reintento asíncrono de correos fallidos (ver pregunta P5).
- Workflows de seguridad del repo (osv-scanner/gitleaks): ortogonal a NEX-48.
- Banner/consentimiento de cookies: no se introducen cookies (honeypot + Turnstile).

## Decisiones resueltas (explore + owner)

| # | Decisión | Resolución |
|---|----------|------------|
| 1 | Runtime del endpoint | **Cloudflare Workers** (owner). Implica adaptar el handler y confirmar/crear `wrangler.toml` con binding KV y vars (el checkout no declara ninguno hoy). |
| 2 | Anti-bot | **Honeypot + Cloudflare Turnstile**; sin cookies y proporcional al riesgo. Fallback **fail-open controlado** si `siteverify` no responde (aceptar + rate limit + log). |
| 3 | Rate limiting | **Workers KV** (distribuido) tras interfaz `RateLimiter`; ~**5 intentos / 15 min por IP** normalizada vía `CF-Connecting-IP`. |
| 4 | Timeouts SMTP | `connectionTimeout`/`greetingTimeout` **~10 s**, `socketTimeout` **~20 s**; **sin reintento** en el request. |
| 5 | Observabilidad | Logging estructurado de `submit` / `blocked` / `rate_limited` / `smtp_failure`. |

## Decisiones pendientes (a resolver antes del spec)

Se detallan en la sección **Proposal question round** al final de este documento:
umbrales exactos y clave del rate limit, aceptabilidad de pérdida de envíos fallidos
(sin reintento asíncrono), UX de rechazo, nota de privacidad por Turnstile.
La confirmación fina del `wrangler.toml` (binding KV, secrets) se resolverá en `design.md`.

## Criterios de aceptación (mapeados a los 5 de la tarea NEX-48)

| # NEX-48 | Criterio | Cómo lo cumple este change |
|----------|----------|----------------------------|
| 1 | Las sumisiones automatizadas/bots se rechazan sin fricción para usuarios reales | Honeypot oculto siempre activo + Turnstile invisible/flexible; verificación server-side; rechazo con `400/403` genérico. |
| 2 | Los reenvíos repetidos desde un mismo origen quedan limitados | Rate limit KV ~5/15 min por `CF-Connecting-IP`; respuesta `429` con mensaje i18n. |
| 3 | El flujo SMTP queda acotado: sin cuelgues indefinidos ni amplificación | Timeouts 10 s/10 s/20 s; sin reintento en request; `500` genérico sin detalles internos. |
| 4 | Existe observabilidad para distinguir spam de conversión y calibrar umbrales | Logs estructurados `submit/blocked/rate_limited/smtp_failure` con motivo del bloqueo y clave normalizada. |
| 5 | La conversión legítima no se degrada | Anti-bot sin fricción ni cookies; fail-open ante caída del verificador; umbrales conservadores; mensajes de error claros en el formulario. |

## Impacto (lead-form / SMTP / i18n)

| Área | Estado | Descripción |
|------|--------|-------------|
| `api/contact.ts` | Reescrito | Handler Workers; rate limit + anti-bot + timeouts + errores genéricos + logging. |
| `wrangler.toml` (nuevo), `.env.example`, README | Nuevo/modificado | Binding KV, secrets Turnstile/SMTP, runbook de fallback. |
| `src/sections/LeadFormSection.tsx` | Modificado | Campo honeypot, widget Turnstile, manejo de `429`/bloqueo en `formState`. |
| `src/i18n/content.ts` | Modificado | Strings de error nuevos (rate limit, verificación) en ambos idiomas — sincronización obligatoria según reglas del config. |
| Flujo SMTP | Endurecido | Timeouts explícitos, sin reintentos, respuestas sin fuga; el camino feliz de envío no cambia de formato. |

## Riesgos

| Riesgo | Prob. | Mitigación |
|--------|-------|------------|
| **Nodemailer en runtime Workers**: `net`/`tls` no nativos; requiere flag `nodejs_compat` (soporte parcial) o alternativa de envío | Alta | Validar en el `design.md` como primera decisión: Nodemailer + `nodejs_compat` vs. envío por API HTTPS del proveedor; el resto del diseño es independiente de esta elección. |
| IPs compartidas (CGNAT/móvil, frecuente en VE) bloquean usuarios legítimos | Media | Umbrales conservadores, clave normalizada del borde, métricas `rate_limited` para ajustar; pregunta P2 abierta. |
| Turnstile degrada conversión o falla como tercero | Baja | Widget invisible; fail-open controlado con log y métrica de skips. |
| KV no disponible | Baja | Política de degradación fail-open con log definida en design (interfaz `RateLimiter` lo permite). |
| Handler nuevo rompe el flujo actual durante el despliegue | Media | Despliegue versionado en Workers con rollback rápido (ver abajo); smoke test del camino feliz antes de promover. |

## Rollback considerations

- **Kill-switch por configuración**: el anti-bot y el rate limit se controlan por
  vars/secrets (p. ej. ausencia de `TURNSTILE_SECRET_KEY` desactiva verificación;
  `RATE_LIMIT_MAX=0` o flag equivalente desactiva el límite). Permite apagar protecciones
  sin revertir código.
- **Versión anterior del Worker**: mantener la versión de despliegue previa identificada;
  `wrangler rollback`/redeploy restaura el comportamiento anterior. Nota: la versión previa
  usa handler Express-style, así que el rollback exige restaurar también ese despliegue, no
  solo config — documentar en el runbook.
- **Cambios de front aditivos**: honeypot/Turnstile/i18n se revierten con revert del commit
  sin tocar el backend (el endpoint tolera payload sin token/campo honeypot si se desactiva).
- **Timeouts SMTP**: endurecimiento puro; no requieren rollback.
- **Señal de decisión**: tras el despliegue, monitorizar proporción
  `submit` vs. `blocked/rate_limited` y `smtp_failure`; un pico de bloqueos sobre tráfico
  legítimo dispara el rollback del cinturón correspondiente (primero rate limit, luego Turnstile).

## Proposal question round

Preguntas de producto para afinar el proposal antes del spec. El objetivo es aflorar reglas
de negocio, implicaciones y tradeoffs; se pueden responder, saltar, corregir o pedir una
segunda ronda. Si no hay respuesta, aplican los defaults indicados.

- **P1 — Umbral exacto del rate limit.** El default es ~5 intentos / 15 min por IP.
  ¿Es aceptable para ventas (p. ej. un lead que reintenta tras un error de red dentro de la
  ventana quedaría bloqueado) o se prefiere más laxo/estricto? *Default: 5/15 min.*
- **P2 — Clave del rate limit.** IP única puede bloquear a varios usuarios legítimos detrás
  de IPs compartidas (redes de gimnasios, operadoras móviles con CGNAT). ¿Se acepta solo IP,
  o se añade una segunda dimensión (p. ej. email destino del envío)? *Default: solo IP
  normalizada, con métricas para revisar.*
- **P3 — Fallo del proveedor anti-bot.** Si Turnstile no responde (caída del tercero),
  ¿fail-open (aceptar el envío apoyado en rate limit, sin perder leads) o fail-closed
  (rechazar, cero spam pero se pierden leads reales)? *Default: fail-open controlado con log.*
- **P4 — UX del rechazo.** ¿Mostrar mensajes específicos (`demasiados intentos, inténtalo
  más tarde` / `verifica que no eres un robot`) o un único error genérico que no revele las
  protecciones? *Default: mensajes diferenciados para rate limit y verificación.*
- **P5 — Envíos fallidos.** Con SMTP caído o timeout y sin reintento en request, el envío se
  pierde hasta que el usuario reintenta manualmente. ¿Aceptable para este slice, o debe
  quedar registrado como requisito de producto una cola/reintento asíncrono a futuro?
  *Default: aceptable ahora; cola asíncrona fuera de scope.*
- **P6 — Privacidad.** Turnstile no usa cookies, pero un tercero procesa la petición de
  verificación. ¿Requiere actualización de la nota de privacidad del formulario?
  *Default: sin cambio; confirmar con el owner.*

Supuestos vigentes mientras no haya respuesta: umbrales 5/15 min por IP normalizada;
fail-open en verificación; mensajes diferenciados; sin reintento asíncrono; sin cambio en
nota de privacidad; `wrangler.toml` con KV binding y secrets a definir en `design.md`.

---

## Decisiones del owner (2026-08-20, confirmadas)

- **P3 (fallback anti-bot)**: se confirma **fail-open controlado** — si Turnstile `siteverify` no responde, aceptar el envío apoyado en rate limit y registrar un log `contact.antibot.skip`. Nunca rechazar por caída del verificador.
- Se mantienen los demás defaults del proposal: umbral 5/15 min por IP normalizada (`CF-Connecting-IP`); clave solo-IP; mensajes diferenciados; sin reintento asíncrono (cola fuera de scope); sin cambio en nota de privacidad.
- Runtime confirmado: **Cloudflare Workers** (decisión previa).
