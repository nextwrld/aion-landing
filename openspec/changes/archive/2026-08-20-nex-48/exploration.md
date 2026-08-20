# Exploration: proteger el formulario de contacto contra abuso y spam (NEX-48)

Estado: lista para proposal (con decisiones pendientes abiertas, ver sección final).

## Contexto y objetivo

El `POST /api/contact` de la landing es un endpoint serverless público que acepta datos del
formulario de solicitud de demo y envía un correo SMTP vía Nodemailer. Hoy no tiene ningún
control de frecuencia, automatización, anti-bot ni timeout explícito, por lo que un atacante
puede: (a) bombardear el endpoint y consumir cuota SMTP / provocar coste por mensaje, y
(b) dejar el `sendMail` colgado indefinidamente (Nodemailer sin timeouts de conexión/red).

Objetivo: rechazar abuso básico sin degradar la conversión legítima (criterios de aceptación
1–5 de la tarea NEX-48).

## Estado actual verificado (código)

### Endpoint — `api/contact.ts`
- Handler serverless (firma `handler(req, res)`), solo `POST`; el resto responde `405`.
- Valida campos mínimos `fullName`, `email`, `message` (solo presencia, sin longitud/formato).
- **No** tiene timeouts en el transporter Nodemailer: `createTransport({ ...smtpOptions })`
  sin `connectionTimeout`/`greetingTimeout`/`socketTimeout`. `sendMail` puede quedarse colgado
  indefinidamente, manteniendo la inestancia/worker ocupado.
- Arma el HTML del correo con **interpolación sin escapar** `${fullName}`, `${message}`, etc.
  → riesgo de HTML injection en el correo (hallazgo colateral, fuera del scope NEX-48 pero
  relevante de reportar).
- En `catch` devuelve `500` con `error.message` (fuga de detalles internos del proveedor SMTP;
  el README ya lo marca como pendiente).
- No hay rate limiting, no hay anti-bot, no hay observabilidad (solo `console.log`/`console.error`
  en la copia de `_utils/email.ts`, que contact.ts **no usa**).

### Helper SMTP duplicado — `api/_utils/email.ts`
- Exporta `sendEmail` con la MISMA config SMTP (`EMAIL_SERVER_HOST/PORT/USER/PASSWORD`, `EMAIL_FROM`).
- `api/contact.ts` **no importa** esta utilidad; reimplementa `sendEmail` inline.
  → configuración SMTP duplicada en dos sitios (riesgo de deriva). La utilidad `_utils/email.ts`
  está actualmente sin uso por `contact.ts`.

### Frontend — `src/sections/LeadFormSection.tsx`
- `submitLeadForm(data)` hace `fetch('/api/contact', { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })`.
- Payload mapea `fullName/email/phone/gymName/members/message`. Validación solo cliente
  (`validate()` en React); no hay token anti-bot, ni campo honeypot, ni timestamps.
- `formState` en `idle|submitting|success|error`; en error muestra `c.leadForm.error`.
- i18n en `src/i18n/content.ts` (dictionary de `I18nProvider`).

### Variables de entorno (`.env.example`, contenido verificado por grep)
- `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT` (default 465), `EMAIL_SERVER_USER`,
  `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM`. No hay variables de rate-limiting/anti-bot hoy.

## Deployment / runtime de la API — GAP a confirmar

- **No hay `wrangler.toml`** en el checkout. `find` por vercel/netlify/cloudflare/wrangler/firebase
  devuelve nada. El README solo dice "Endpoint serverless y Nodemailer".
- El CI raíz (`sealion/.github/workflows/integration.yml`) ejecuta para landing solo
  `pnpm install / lint / build` — **no despliega la API** ni define el runtime.
- Consecuencia: **el runtime del endpoint no está confirmado en el código del repo.** Esto es
  crítico para elegir la estrategia anti-bot y de rate limiting. Se debe resolver en la fase de
  proposal con el owner de deployment:
  - Si es **Cloudflare Workers**: viable Turnstile + `workerd`/`Request` (pero el handler actual
    tiene firma Express `(req,res)`), o Workers KV para rate limit.
  - Si es **Vercel serverless (Node)**: el handler `(req,res)` encaja; rate limit in-process
    (no fiable multi-instancia) vs. opciones externas; Turnstile viable vía verificador server-side.
  - Si es **hosting Node clásico**: rate limit in-process o en DB (p.ej. la DB del backend).
  Este gap se marca como decisión pendiente #1 y documento que el diseño debe ser runtime-agnostic.

## Security config previa (verificación del punto del orquestador)

- En el árbol actual (`main`) **no existe** `.github/workflows/security.yml`, ni osv-scanner,
  ni gitleaks. Solo `origin/main` está en `packed-refs` (no hay trees locales de
  `feature/nex-46|49|50` para inspeccionar). La PR "aion-landing#3" (osv/gitleaks) referida por
  la tarea **no aparece en este checkout**; debe confirmarse en GitHub si está mergeada a `main`.
  Este hallazgo es reportado, no bloquea NEX-48 (la seguridad del repo es ortogonal al cambio).

## Opciones técnicas analizadas

### Anti-bot (decisión pendiente #2)
1. **Cloudflare Turnstile** — widget sin CAPTCHA, invisible/caja explícita; verificación
   server-side con `siteverify`; sin cookies y privacidad-friendly (cumple mejor la decisión de
   privacidad/cookies). Coste: nuevo endpoint de verificacion + dependencia JS en el front.
   Depende del runtime (si el endpoint no corre en Cloudflare, sigue siendo utilizable vía
   llamada HTTPS a `siteverify`).
2. **Honeypot** — campo oculto en el form que un humano no rellena; el server lo descarta y
   rechaza. Cero coste, cero fricción, sin cookies, sin dependencias. Buen "primer cinturón"
   contra bots ingenuos. No bloquea bots que rellenan todo/scrapers.
3. **CAPTCHA tradicional (reCAPTCHA)** — más fricción y más tracking de cookies; no recomendado
   para no degradar conversión legítima y por privacidad. Solo como fallback si Turnstile no aplica.
4. **Combinación recomendada**: **honeypot (barato, siempre activo) + Turnstile (proporcional)**
   con degradación a "fail-open" controlado (ver fallback). Si el runtime no permite Turnstile,
   honeypot + rate limit in-process es el plan mínimo viable. Proporcionalidad al riesgo: honeypot
   cubre automatización simple; Turnstile eleva la barrera para spam dirigido.

### Rate limiting (decisión pendiente #3)
- Clave natural: **IP de origen** (del header `CF-Connecting-IP`, `X-Forwarded-For`, o `req.socket`).
  Ventana y límites propuestos (a validar en proposal): p.ej. **5 intentos / 15 min por IP**
  (o "3 intentos / 10 min" para spam estricto); límite global opcional para proteger el SMTP.
- Mecanismos según runtime:
  - **In-process Map con expiración** — simple, cero infra; válido en instancia única/desarrollo;
    no fiable multi-instancia (se puede duplicar el límite por réplica). Adecuado como mínimo.
  - **KV (Workers KV / similar)** — distribuido, correcto en multi-instancia; requiere binding.
  - **DB (postgres del backend)** — distribuido y durable, pero añade dependencia de red a un
    endpoint antes stateless; más coste operativo.
  - Recomendación: abstraer detrás de una interfaz `RateLimiter` con impl in-process por defecto
    y opción KV/DB configurable, de modo que el diseño sea runtime-agnostic.

### Timeout / reintentos / fallback SMTP (decisión pendiente #4)
- Nodemailer soporta `connectionTimeout`, `greetingTimeout`, `socketTimeout` (default 2 min para
  conexión; `socketTimeout` por defecto espera indefinidamente hasta respuesta). Proponer
  `connectionTimeout` ~10s, `greetingTimeout` ~10s, `socketTimeout` ~15–30s.
- Reintentos: **NO reintentar** sobre SMTP fallido en el request (evita amplificar spam); en su
  lugar responder error controlado y loggear. Un queue/retry asíncrono queda fuera de scope.
- Fallback del **proveedor anti-bot**: si Turnstile `siteverify` no responde/falla (red),
  decisión fail-open (aceptar y aplicar rate limit) vs. fail-closed (rechazar). Recomendación
  para no degradar conversión legítima: **fail-open controlado** con log, perfilado por la
  métrica de fallos de verificación. Documentar ambos.

### Observabilidad / métricas (criterio 4)
- Registrar/rechazo: contadores de `contact.submit.*`/`contact.blocked.*` y
  `contact.smtp.failure`, `contact.antibot.skip`, `contact.rate_limited`. Como no hay telemetría,
  proponer logging estructurado (JSON) mínimo + opcionalmente métricas derivadas del log.
  Relación spam vs. conversión: contar submits legítimos vs. bloqueados para calibrar umbrales.

### Privacidad / cookies (decisión pendiente #5)
- Preferir **Turnstile sin cookies** y honeypot (sin cookies) → sin banner adicional. Si se
  introdujera reCAPTCHA habría que documentar el tratamiento de cookies/consentimiento (no
  recomendado).

## Hallazgos colaterales (fuera de scope, reportar)
- No escapado de HTML del usuario en el cuerpo/`subject` del correo → HTML injection.
- `500` filtra `error.message` (detalles internos SMTP).
- Config SMTP duplicada entre `api/contact.ts` y `api/_utils/email.ts` (deriva).
- Sin validación de longitud/formato server-side.

## Impacto en flujo lead-form / SMTP
El cambio toca el endpoint (rechazo temprano de spam) y el front (`LeadFormSection.tsx`:
token Turnstile + campo honeypot + manejo de respuesta en caso de bloqueo). Puede añadir un
mensaje de error i18n distinto (p.ej. "demasiados intentos / verifique que no es un bot");
deben sincronizarse `src/i18n/content.ts` (regla del config.yaml).

## Riesgos y mitigaciones
- **Degradar conversión legítima** (fricción anti-bot, falsos rechazos): usar honeypot invisible +
  Turnstile invisible/flexible; umbrales conservadores; fail-open en fallback de verificación.
- **Runtime no confirmado** (mayor riesgo): diseñar runtime-agnostic (interfaz rate limiter +
  verificador pluggable) y resolver el runtime en proposal antes de fijar KV/bindings.
- **Fuga de detalles internos**: no filtrar `error.message` al cliente.
- **Rate limit por IP y proxys/CDN**: normalizar a la IP real del borde (CF-Connecting-IP).
- **Sin suite de tests** (config.yaml: runner none): verificación manual + lint + build; considerar
  tests unitarios puros (p.ej. la lógica de rate limit y el barrel de validación) como opcionales.

## Decisiones pendientes para resolution en proposal

**Decisión #1 (runtime) RESUELTA por el owner: Cloudflare Workers.**
- Implica: Turnstile nativo (siteverify) + Workers KV para rate limit distribuido (ó in-process si no se desea KV), y adaptar el handler actual Express `(req,res)` al modelo de Workers (Request/Response, módulo ES export default).
- Pendiente a confirmar en proposal/design: si el checkout tiene/necesita `wrangler.toml` con binding de KV y vars de entorno (el checkout actual no declara wrangler.toml).

1. **Protección anti-bot**: Turnstile / honeypot / combinación. Recomendación: honeypot + Turnstile.
3. **Límites/ventana/clave de rate limiting**: proponer 5 intentos / 15 min por IP (ajustar), si
   además límite global, y si la clave es IP únicamente o IP+form-hash.
4. **Fallback si el proveedor anti-bot no disponible**: fail-open vs. fail-closed (recomendado
   fail-open controlado + log).
5. **Privacidad/cookies**: confirmar que no se introducen cookies (honeypot+Turnstile) y si hace
   falta actualizar la nota privacidad del form.
6. **Timeouts/reintentos/fallback SMTP**: valores concretos y política de no-reintento en request.

## Artefactos planificados del change `openspec/changes/nex-48/`
- `proposal.md` — intención, alcance, decisiones resueltas, rollback considerations (regla
  config.yaml), impacto en lead-form/SMTP.
- `specs/contact-protection/spec.md` — capabilities nuevas (p.ej. `contact-protection`):
  escenarios Given/When/Then, keywords RFC 2119 (MUST/SHOULD/MAY) escopetados al endpoint y a
  `LeadFormSection.tsx`.
- `design.md` — arquitectura con rationale: interfaz `RateLimiter` (in-process/KV), verificador
  anti-bot pluggable, timeouts Nodemailer, manejo de fallback, diagrama de flujo del request.
- `tasks.md` — por fases con numeración jerárquica: (1) endpoint (rate limit + anti-bot +
  timeouts + respuestas sin fuga), (2) front (honeypot + token + i18n), (3) config/docs
  (`.env.example`, README runbook, fallback documentado).
- Nota: NO crear aún nada salvo este `exploration.md`; el contenido de proposal/spec se resolverá
  tras aceptar este artefacto.

## Recomendación de siguiente paso
Resolver primero el **runtime** (decisión #1) con el owner, porque condiciona KV vs. in-process y
la facilidad de Turnstile. Con eso decidido, avanzar a `proposal.md` fijando las decisiones #2–#6
con los defaults recomendados (honeypot+Turnstile; 5/15min por IP; fail-open controlado; timeouts
connection/greeting ~10s y socket ~20s).
