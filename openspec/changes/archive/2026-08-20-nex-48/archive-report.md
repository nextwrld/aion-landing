# Archive Report — NEX-48 (protect landing contact form)

- **Fecha de archive:** 2026-08-20
- **Change:** `openspec/changes/nex-48/` (OpenSpec, file-backed)
- **Destino de archive:** `openspec/changes/archive/2026-08-20-nex-48/`
- **Estado de archive:** ✅ **archived** (PASS)
- **Modo de artefacto:** `openspec` — sync file-backed completado (canonical merge), luego move del change a archive.

---

## 1. Artefactos leídos

- `proposal.md` — alcance y decisiones del owner (migración a Cloudflare Workers, anti-bot, rate limit, timeouts, respuestas sanitizadas, observabilidad, front/i18n).
- `specs/contact-protection/spec.md` — 7 requirements (R1–R7) con escenarios GWT.
- `design.md` — decisión opción B (Postmark HTTPS en lugar de SMTP literal), KV eventual consistency, rollback.
- `tasks.md` — implementación 1.1–8.7 **todas `[x]`**; 2 tareas `[ ]` de propiedad del parent (bounded review + gate de ciclo de vida), **no de implementación**.
- `apply-progress.md` — progreso de la cadena de PRs (originalmente 3 PRs por fases).
- `verify-report.md` — **PASS condicional**, F1 resuelto, sin FAIL/BLOCKED/CRITICAL pendientes.
- `sync-report.md` — **synced**; merge canónico completado; dominio nuevo (100% ADDED).
- `openspec/config.yaml` — `schema: spec-driven`, `strict_tdd: false`, runner `none`; `rules.archive` aplicado (sin deltas destructivos; i18n content.ts sin merge por overwrite).

## 2. Qué se entregó

Entrega final en **2 PRs por área** en aion-landing (tras resolver conflicto con `main` vía rebases `nex48-prA-rebase` / `nex48-prB-rebase`), que sustituyó el forecast original de 3 PRs de `apply-progress`/`tasks.md` por una partición por área sin cambiar alcance ni requisitos:

| PR | Área | Contenido | Estado |
|---|---|---|---|
| **PR #6** | Backend | `api/contact.ts` → Cloudflare Worker + Postmark HTTPS + rate limit KV (5/15 min por `CF-Connecting-IP`) + anti-bot honeypot + Turnstile (fail-open) + observabilidad PII-safe; **reusa `contactSchema` de main** (`api/_utils/contact.ts`) | OPEN, CLEAN, checks Vercel PASS |
| **PR #7** | Frontend | `TurnstileWidget` + honeypot + feedback i18n ES/EN | OPEN, CLEAN, checks Vercel PASS |

- PRs viejas **#4 / #5** (backend/frontend pre-rebase) → **CLOSED** en favor de #6/#7 (conflicto de head).

## 3. Verificación

Fuente: `verify-report.md` (PASS; hallazgo F1 resuelto).

- **Spec:** 7/7 requirements cumplidos (R1–R7), todos los escenarios GWT.
- **Matriz:** `scripts/verify-nex48-matrix.ts` → **11 passed, 0 failed** (405, 400, honeypot 403, token inválido 403, siteverify timeout→skip+200, 1–5 OK / 6º→429, KV error→skip, missing origin→skip, Postmark timeout→500×1, éxito→200 single submit sin PII).
- **Criterios de aceptación NEX-48 1–5:** todos ✅.
- **Comandos:** `tsc -p tsconfig.worker.json --noEmit`, `tsc -b --noEmit`, `pnpm build`, `wrangler deploy --dry-run`, `eslint` → todos exit 0.
- **F1 resuelto:** 7 errores eslint del script de matriz corregidos → 0 errores, matriz 11/11.

## 4. Sync + merge canónico

- **sync-report.md:** ✅ **synced** (reconciliado contra el estado verificado).
- **Dominio:** `contact-protection` — **NUEVO** (no existía en `openspec/specs/` antes del merge).
- **Canonical:** `openspec/specs/contact-protection/spec.md` creado por el merge canónico; **idéntico** al change spec (7 requirements). Se deja en su lugar; archive mueve solo el change.
- **Requisitos ADDED (7):** Endpoint Anti-Bot Validation · Controlled Anti-Bot Verification Fallback · Origin-Based Rate Limiting · Bounded and Sanitized SMTP Delivery · Contact Flow Observability · Lead Form Protection and Localized Feedback · Protection Configuration and Rollback.

## 5. Deltas / destructividad

- **ADDED:** 7 · **MODIFIED:** 0 · **REMOVED:** 0 · **RENAMED:** 0.
- Delta **100% ADDED** sobre dominio nuevo → **sin merge destructivo, sin aprobación destructiva requerida, sin blocker de archive** (tal como instruyó el parent: no inventar approbaciones ni deltas destructivos).
- **Colisiones same-domain:** ninguna. El otro change activo `nex-26-seo-landing` toca el dominio `seo-conversion-landing`, no `contact-protection`.

## 6. Tareas / gate de implementación

- Re-leído `tasks.md` antes del move: los marcadores de implementación `1.1–8.7` están todos `[x]`.
- **Sin tareas de implementación sin marcar** (`^\s*- \[ \]` en tareas de implementación → 0).
- **`[ ]` restantes (2), propiedad del parent — NO bloquean archive:**
  - `[ ] Iniciar o reutilizar bounded review por PR (diffs y resultados de smoke de Fase 8). <!-- sdd-owner: parent -->`
  - `[ ] Gate de ciclo de vida: confirmar cutover/rollback documentado y decidir apply/archive. <!-- sdd-owner: parent -->`

## 7. Hallazgos no bloqueantes post-deploy (fuera de scope verificado)

| ID | Sev | Hallazgo | Acción |
|---|---|---|---|
| P1 | ℹ️ INFO | `api/contact.test.ts` de `main` (harness Express) pendiente de migrar al Worker (`api/contact.ts`). | Migrar/ajustar el test al nuevo handler Workers en un follow-up. |
| P2 | ℹ️ INFO | Placeholders en `wrangler.toml` (ids KV `REPLACE_WITH_*`) y secrets (`.dev.vars.example` / `wrangler secret put`) por completar antes del primer deploy real. | Owner completa ids KV y secrets antes del deploy real (correcto en fase sin credenciales prod). |

Estos hallazgos **no contradicen** spec/design y no bloquean el archive.

## 8. Status estructurado y actionContext

- **Cambio activo:** `nex-48` (único, sin ambigüedad).
- **Modo / actionContext.mode:** `openspec` file-backed (workspace-planning con store autoritativo en `landing/openspec`).
- **Artefacto de estado:** `verify-report.md` PASS + `sync-report.md` synced + `complete: true` nativo.
- **Deltas:** 100% ADDED sobre dominio nuevo → sin bloqueos destructivos, sin colisiones, sin RENAMED.
- **Final Task Completion Gate:** superado (sin tareas de implementación `[ ]`; solo tareas `[ ]` de propiedad del parent).
- **Destructive-sync / archive approval:** no requerida (dominio ADDED).

## 9. Veredicto

**Archived (PASS).** El change NEX-48 está entregado (2 PRs #6/#7 CLEAN), verificado (7/7 + matriz 11/11 + criterios 1–5 + F1 resuelto), sincronizado y mergeado al canonical `openspec/specs/contact-protection/spec.md` (dominio nuevo, 100% ADDED). El change se movió a `openspec/changes/archive/2026-08-20-nex-48/`. El canonical permanece en `openspec/specs/contact-protection/spec.md`. Han quedado pendientes de seguimiento: bounded review / gate (parent) y los hallazgos no bloqueantes P1/P2.

## Próxima fase recomendada

**seguimiento del parent:** completar bounded review por PR y gate de ciclo de vida; y en un follow-up, migrar `api/contact.test.ts` al Worker (P1) y completar ids KV / secrets previos al primer deploy real (P2).
