# Tasks: SEO and Conversion Landing

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 520–700 authored additions/deletions, including the 481-line bilingual dictionary rewrite, metadata, validation script, config, and assets |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 content/semantics; PR 2 prerender/SEO resources; PR 3 assets/validation/verification |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Truthful bilingual conversion content and semantic UI | PR 1 | `npm run lint && npx tsc -b` | `npm run dev`; verify Spanish/English toggle and CTA | `src/i18n/content.ts`, sections, Navbar/Logo |
| 2 | Spanish prerender, hydration, metadata, crawl files | PR 2 | `npm run build && npm run validate:dist` | `npm run preview -- --host 127.0.0.1`; fetch `/`, robots, sitemap, llms | prerender, entry, Vite/package, `index.html`, public crawl files |
| 3 | Optimized assets and full verification | PR 3 | `npm run lint && npx tsc -b && npm run build && npm run validate:dist` | Preview smoke: narrow viewport, disabled animation, image/CTA/form checks | public image variants and validation script |

## Phase 1: Content and Semantic Foundation

- [x] 1.1 Rewrite `src/i18n/content.ts` in Spanish/English with exact approved hero, positioning, CTA, support text, benefits, Venezuelan `cédula`, and problem copy; remove jargon, guarantees, statistics, and unverified claims without changing lead payload strings/behavior.
- [x] 1.2 Update `src/sections/*.tsx`, `Navbar.tsx`, `Logo.tsx`, and `LeadFormSection.tsx` with one visible H1, landmarks, labelled sections, real anchors, `<a href="#demo">`, labelled controls, FAQ ARIA state, and unchanged `/api/contact` submission.
- [x] 1.3 Make GSAP/Lenis progressive: render readable declarative defaults, animate only hydrated nodes, clean up styles, and keep all content/controls operable when animation is absent.

## Phase 2: Prerender and Discovery

- [x] 2.1 Create `src/prerender.tsx`; update `src/main.tsx` and `I18nProvider.tsx` for deterministic Spanish `renderToString`/`hydrateRoot`, then restore `aion.lang` and toggle locale in an effect; remove unused `BrowserRouter`.
- [x] 2.2 Update `index.html`, `vite.config.ts`, `package.json`, and `package-lock.json` with the project-owned build-time prerender (initially `vite-prerender-plugin`, then replaced by `scripts/prerender.mjs` to fix a `npm run build` process-lifetime issue — see `design.md` PR 2 deviation and `apply-progress.md`), canonical host, index/follow, matching OG/Twitter tags, and allowlisted truthful WebSite/SoftwareApplication JSON-LD.
- [x] 2.3 Add non-empty canonical `public/robots.txt`, `sitemap.xml`, and `llms.txt`; document apex DNS and HTTP gzip/brotli as operations follow-ups only, with no repository implementation.
- [x] 2.4 Resolve PR 1 review follow-ups: align bilingual navbar hrefs with `#problemas`, `#beneficios`, and `#preguntas`, and preserve accessible FAQ state without disabling expansion transitions.

## Phase 3: Assets and Verification

- [ ] 3.1 Add `public/og-aion.jpg` (1200×630) and WebP/AVIF variants for existing imagery; update image components for dimensions, `srcset`/`sizes`, eager above-fold logo, lazy below-fold assets, async decoding, and meaningful/empty alt text.
- [ ] 3.2 Create `scripts/validate-dist.mjs` static checks for one visible H1, exact Spanish support copy, landmarks/anchors/CTA, metadata, allowlisted JSON-LD, asset references, and consistent non-empty crawl resources.
- [ ] 3.3 Run lint, typecheck, build, validate-dist, and preview smoke checks for Spanish prerender, English toggle, no-animation readability, responsive accessibility, CTA focus/scroll, and unchanged form success/failure; record operations follow-ups and confirm `api/contact.ts` is untouched.
- [ ] 3.4 Resolve the PR 2 review follow-up: retain same-tab language selection in memory when localStorage is unavailable while preserving deterministic Spanish SSR and cross-tab synchronization.
