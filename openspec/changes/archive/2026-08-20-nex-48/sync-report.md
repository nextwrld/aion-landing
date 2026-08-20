# Sync Report — NEX-48 (protect landing contact form)

- **Fecha:** 2026-08-20
- **Change:** `openspec/changes/nex-48/` (OpenSpec, file-backed)
- **Dominio:** `contact-protection` (NUEVO — no existía en `openspec/specs/`)
- **Modo de artefacto:** `openspec` — sync file-backed sobre `openspec/specs/`
- **Estado:** ✅ **synced** (reconciliado contra el estado verificado; ver nota de merge canónico en §3)

---

## 1. Qué se aplicó (2 PRs por área en aion-landing)

La implementación se aplicó en el **feature-branch-chain como 2 PRs por área**, tras resolver el conflicto con `main` (rebases `nex48-prA-rebase` / `nex48-prB-rebase`). Esto sustituyó el forecast original de 3 PRs de `tasks.md` (PR1/PR2/PR3 por fases) por una partición por área (backend / frontend), sin cambiar el alcance ni los requisitos del spec.

| PR | Rama | Área | Contenido | Estado |
|---|---|---|---|---|
| **PR A — #6** | `nex48-prA-rebase` | Backend | `api/contact.ts` → Cloudflare Worker + Postmark HTTPS + rate limit KV (5/15 min por `CF-Connecting-IP`) + anti-bot honeypot + Turnstile (fail-open) + observabilidad PII-safe; **reusa `contactSchema` de main** (`api/_utils/contact.ts`) | OPEN, **CLEAN**, checks Vercel PASS |
| **PR B — #7** | `nex48-prB-rebase` | Frontend | `TurnstileWidget` + honeypot + feedback i18n ES/EN | OPEN, **CLEAN**, checks Vercel PASS |

PR viejas cerradas en favor de las nuevas:
- **PR #4** (`feat/nex-48-contact-protection`, backend viejo) → **CLOSED**.
- **PR #5** (`feat/nex-48-contact-frontend`, frontend viejo) → **CLOSED**.

### Reuso del schema de main
PR A reutiliza `contactSchema` de `main` (`api/_utils/contact.ts`) en lugar de redefinirlo; el contrato de validación de campos se preserva y el cambio se acota a la protección/entrega.

---

## 2. Qué se verificó

Fuente: `verify-report.md` (aprobado, veredicto final **PASS**; hallazgo F1 resuelto).

- **Spec:** 7/7 requirements cumplidos (R1–R7), con todos los escenarios GWT del spec.
- **Matriz:** `scripts/verify-nex48-matrix.ts` → **11 passed, 0 failed** (405, 400, honeypot 403, token inválido 403, siteverify timeout→skip+200, 1–5 OK / 6º→429, KV error→skip, missing origin→skip, Postmark timeout→500×1, éxito→200 single submit sin PII).
- **Criterios de aceptación NEX-48 1–5:** todos ✅ cumplidos.
- **Comandos que pasan:**
  - `npx tsc -p tsconfig.worker.json --noEmit` → exit 0
  - `npx tsc -b --noEmit` → exit 0
  - `pnpm build` → exit 0
  - `npx wrangler deploy --dry-run` → exit 0 (bundle + bindings KV/vars válidos)
  - `npx eslint <archivos de producción del change>` → exit 0 (F1 resuelto: 0 errores)
- **Estado nativo:** apply (3) + verify completados, `complete: true`.

---

## 3. Merge canónico (dominio NUEVO)

- **Dominio:** `contact-protection`.
- **Canonical actual:** NO existe `openspec/specs/contact-protection/spec.md` (solo `openspec/specs/README.md`). Es un dominio **ADDED**.
- **Requisitos ADDED (7):** Endpoint Anti-Bot Validation · Controlled Anti-Bot Verification Fallback · Origin-Based Rate Limiting · Bounded and Sanitized SMTP Delivery · Contact Flow Observability · Lead Form Protection and Localized Feedback · Protection Configuration and Rollback.
- **Destructividad:** 0 REMOVED, 0 MODIFIED — deltas 100% ADDED sobre dominio nuevo. Sin necesidad de aprobación destructiva.
- **Colisiones same-domain:** ninguna. El otro change activo `nex-26-seo-landing` toca el dominio `seo-conversion-landing`, no `contact-protection`.

> **Nota de alcance de este paso (sync-report):** por constraint de delegación, este paso escribió **solo** `sync-report.md`. El merge canónico — copiar `specs/contact-protection/spec.md` → `openspec/specs/contact-protection/spec.md` — es el paso de canonicalización remanente y queda registrado como acción pendiente para el sync/archive completo.

---

## 4. Estado de tasks

- **Implementación 1.1–8.7:** todas `[x]` (escaneo `^\s*- \[ \]` → 0 tareas de implementación sin marcar).
- **Restantes `[ ]` (2), propiedad del parent / bounded-review / gate:**
  - `[ ] Iniciar o reutilizar bounded review por PR (diffs y resultados de smoke de Fase 8). <!-- sdd-owner: parent -->`
  - `[ ] Gate de ciclo de vida: confirmar cutover/rollback documentado y decidir apply/archive. <!-- sdd-owner: parent -->`

No hay tareas de implementación pendientes.

---

## 5. Estado de entrega

- **PR #6 (A — backend)** y **PR #7 (B — frontend)** en `aion-landing`: ambas **OPEN** con base limpia (`nex48-prA-rebase` / `nex48-prB-rebase` sobre `main`), **CLEAN**, checks **Vercel PASS**.
- **PR #4 y #5** (viejas, por área pre-rebase) **CLOSED** en favor de #6 y #7.

---

## 6. Hallazgos pendientes (no bloqueantes, fuera del scope verificado)

| ID | Sev | Hallazgo | Acción |
|---|---|---|---|
| P1 | ℹ️ INFO | `api/contact.test.ts` de `main` (harness Express) pendiente de **migrar al Worker** (`api/contact.ts`). No bloquea el spec; queda como limpieza futura. | Migrar/ajustar el test al nuevo handler Workers en un follow-up. |
| P2 | ℹ️ INFO | Placeholders en `wrangler.toml` (ids KV `REPLACE_WITH_*`) y secrets (`.dev.vars.example` / `wrangler secret put`) por **completar antes del primer deploy real**. Coincide con hallazgo F5 de verify-report. | Owner completa ids KV y secrets antes del deploy real (correcto en fase sin credenciales prod). |

Estos hallazgos **no contradicen** spec/design y son consistentes con las decisiones documentadas en `design.md` (ver §5.3 KV eventual consistency; transporte Postmark HTTPS según design §2–§3).

---

## 7. Validaciones / chequeos realizados para este sync

- Lectura directa de artefactos del change: `spec.md` (7 reqs), `tasks.md` (implementación `[x]`, 2 lifecycle `[ ]`), `verify-report.md` (PASS, F1 resuelto), `apply-progress.md`, `design.md`, `proposal.md`, `exploration.md`.
- Confirmación del estado de PRs vía `gh pr list`: #6 (backend) / #7 (frontend) OPEN CLEAN; #4/#5 CLOSED.
- Confirmación de ausencia de colisión same-domain: `nex-26-seo-landing` → `seo-conversion-landing`.
- Confirmación de que `openspec/specs/contact-protection/spec.md` no existe (dominio NUEVO) y de `openspec/config.yaml` (`schema: spec-driven`, `strict_tdd: false`, runner `none`).
- Reglas `rules.sync` de config.yaml: no exigen nada adicional para este sync (sin deltas destructivos ni afectación de `src/i18n/content.ts` por overwrite).

---

## 8. Status estructurado y actionContext

- **Cambio activo:** `nex-48` (único sin ambigüedad).
- **Modo:** `openspec` file-backed.
- **Artefacto de estado:** `verify-report.md` PASS, `complete: true` nativo.
- **Deltas:** 100% ADDED sobre dominio nuevo → sin bloqueos destructivos, sin colisiones, sin `## RENAMED Requirements`.
- **Requisito para sync:** verificado (verify-report presente y PASS; sin FAIL/BLOCKED/CRITICAL).
- **Destructive-sync approval:** no requerida.
- **Explicit order entre changes activos:** no requerida (sin solapamiento de dominio).

---

## 9. Veredicto

**synced** — el change NEX-48 está reconciliado contra el estado verificado: 2 PRs entregados y CLEAN (#6 backend + #7 frontend), verify PASS 7/7 + matriz 11/11 + criterios NEX-48 1–5, sin tareas de implementación pendientes. El cambio NO se movió a archive. El paso remanente es el merge canónico del dominio `contact-protection` y el `sdd-archive`.

## Próxima fase recomendada

**`sdd-archive`** cuando el parent complete (1) el merge canónico de `contact-protection` → `openspec/specs/contact-protection/spec.md`, y (2) el bounded review / gate de ciclo de vida (tareas `[ ]` propiedad del parent).
