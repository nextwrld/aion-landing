## Exploration: SEO crawlability fixes for AION Wellness landing (NEX-26)

### Current State
The app is a **pure client-side-rendered (CSR) React 19 SPA** built with Vite 7, `react-router` 7 (`BrowserRouter` wrapping a single page in `src/main.tsx`), Tailwind 3.4, shadcn/ui, GSAP + ScrollTrigger, and Lenis. The production build command is `tsc -b && vite build` and emits a `dist/` folder. There is **no SSR, no SSG, no prerender, no `react-helmet`, and no SEO metadata management** anywhere in the stack.

`index.html` is 16 lines: a `<title>` (`AION Wellness - Plataforma de Gestion para Gimnasios`), Google Fonts preconnect, viewport, favicon, and an empty `<div id="root">`. There is **no `<meta name="description">`, no canonical, no Open Graph, no Twitter card, no `<meta name="robots">`, no JSON-LD**. `<html lang="es">` is hardcoded and later toggled by `I18nProvider` only after hydration.

The entire body is rendered by JS at runtime. When a crawler (e.g. the SEMrush bot with JS rendering disabled) fetches `/`, it receives only the bare `index.html`: a `<title>`, a `<div id="root"></div>`, and the module script tag. That single fact is the root cause of every content-level SEMrush finding (missing H1, missing meta description, low word count, low text-to-HTML ratio). The 200 status is correct — the problem is the empty payload, not the response code.

Worse, even a **JS-enabled** crawler sees the Hero in a broken initial state:
- `HeroSection.tsx` renders `<h1 ref={headlineRef} ... />` **with no JSX text children**. The headline is injected at runtime by GSAP (`headlineRef.current.innerHTML = ''` then per-character `<span style="opacity:0">`). Until the animation timeline fires, the H1 is empty.
- `subtitle`, `cta`, and `stats` containers render with `className="opacity-0"` and are revealed by `gsap.fromTo(..., { opacity: 1, ... })`. Without GSAP firing they stay invisible.
- The same `fromTo(opacity: 1)` pattern is used across other sections (`LeadFormSection`, etc.).

Static documents are missing: there is no `public/robots.txt`, `public/public/sitemap.xml`, or `public/llms.txt` — the 404s SEMrush reported are real. Internal linking is also not crawlable: `Navbar` nav items are `<button onClick={scrollTo}>` with no `href`, and `Footer` "links" are `<span className="cursor-default">` — neither produces anchors for crawlers.

Existing Spanish hero copy in `src/i18n/content.ts` is **out of sync** with the issue-approved copy: current `es.hero.title` is `AION Wellness: Tu socio integral para simplificar y controlar tu gimnasio.` and current `es.hero.subtitle` is `El software esencial diseñado para gimnasios pequeños y medianos que operan hoy con cuadernos y Excel. Resuelve el 80% de tu caos diario.` The issue asks for headline `Todo tu negocio fitness bajo control` and subtitle `Gestiona clientes, membresías, pagos, accesos y caja desde un solo lugar.` It also asks to avoid unverified statistics; the current hero carries unverified `200+`, `4.9/5`, `98%` stats and the body reuses the "80%" claim in `mvp.description`.

### Verified SEMrush issue mapping
| SEMrush finding | Repository root cause | Repo-solvable? |
|---|---|---|
| Missing H1 | SPA; H1 text only exists after GSAP injects spans into an empty `<h1>` | Yes |
| Missing meta description | `index.html` has no `<meta name="description">` | Yes |
| Low text-to-HTML ratio / low word count | Body is `<div id="root"></div>`; all content is JS-rendered | Yes (prerender) |
| Uncompressed page/resources | Uncompressed JPG/PNG in `public/assets`, no `loading="lazy"`, no compression headers | Partly (assets yes; HTTP compression is host/CDN) |
| `/llms.txt` 404 | File does not exist | Yes |
| `/robots.txt` 404 | File does not exist | Yes |
| `/sitemap.xml` 404 | File does not exist | Yes |
| `https://aionwellness.pro/` DNS resolution problem | Apex domain does not resolve; `www` works | **No — DNS/hosting config outside the repo** |

### Affected Areas
- `index.html` — add meta description, canonical, OG/Twitter, JSON-LD, `lang`, preconnect already present.
- `public/robots.txt` (new) — allow crawling, point to sitemap.
- `public/sitemap.xml` (new) — list the single landing URL (and section anchors).
- `public/llms.txt` (new) — product summary for LLM crawlers, using the issue-approved positioning.
- `public/assets/*` — compress JPG/PNG, consider WebP/AVIF + `loading="lazy"` + explicit `width`/`height` on `<img>`.
- `src/sections/HeroSection.tsx` — render headline as real JSX text inside `<h1>` (GSAP char-split as enhancement on top of visible text), remove `opacity-0` initial inline styles on subtitle/CTA/stats so SSR/prerendered HTML is visible by default.
- `src/i18n/content.ts` — update `es.hero.title`/`es.hero.subtitle` to issue-approved copy; provide `en` parallel; decide whether to drop unverified stats block (issue asks to avoid unverified statistics) — flagged for proposal.
- `src/components/Navbar.tsx` — convert nav `<button onClick>` to `<a href="#section">` so internal links are crawlable.
- `src/sections/Footer.tsx` — convert placeholder `<span>` to real `<a>` (or remove if no target).
- `vite.config.ts` — add build-time prerender plugin so `dist/index.html` ships with the rendered DOM baked in.
- `package.json` — add the chosen prerender dependency as `devDependency` and a verify-friendly build.
- `openspec/config.yaml` — `verify` notes already state there is no test runner; verification will be against `dist/`.

### Approaches

1. **Build-time prerender (SSG) of the existing SPA + visible-by-default Hero** — Restructure Hero so the H1 text and subtitle live in JSX (GSAP enhances, not injects), remove `opacity-0` initial states, then add a Vite prerender plugin (`@prerenderer/rollup-plugin` / `vite-plugin-prerender`) so `vite build` writes a fully-rendered `dist/index.html`.
   - Pros: single source of truth (content stays in `content.ts`), crawlers get real HTML with no JS, fixes H1 + word count + text-to-HTML ratio in one move, no hidden duplication.
   - Cons: new build dependency, must verify it composes with GSAP/Lenis/`BrowserRouter` and the `inspectAttr` plugin already in `vite.config.ts`; prerendered snapshot must capture visible-by-default state (animation must not hide initial content).
   - Effort: Medium.

2. **Hand-authored `<noscript>` / static fallback HTML in `index.html`** — Duplicate the hero copy and key paragraphs into the HTML file as a no-JS fallback.
   - Pros: no build dependency, fast.
   - Cons: two copies of every string → drift, "hidden duplication" exactly the anti-pattern this brief rejects, and modern crawlers that disable JS but still parse `<noscript>` give it low weight; maintenance hazard. **Rejected per brief.**
   - Effort: Low (but wrong).

3. **Migrate to React Router 7 SSG / framework mode** — Move the build to `react-router`'s SSG pipeline since `react-router 7` is already a dependency.
   - Pros: first-party, well-supported, future-proof.
   - Cons: substantial migration of entry points and Vite config; far exceeds the 400-line review budget; risks destabilizing the working contact flow and animations.
   - Effort: High. **Out of scope for NEX-26; track separately.**

4. **Minimal metadata + static docs only (no prerender)** — Add meta tags, robots/sitemap/llms.txt, fix internal anchors, but leave SPA rendering as-is.
   - Pros: tiny diff, definitely under budget.
   - Cons: does NOT fix missing H1, low word count, or low text-to-HTML ratio, because the body is still empty without JS. Would close only ~4 of the 8 SEMrush findings. Insufficient alone.
   - Effort: Low. Useful only as a fallback slice.

### Recommendation
Combine **Approach 1 (prerender + visible-by-default Hero)** with the metadata/static-documents work from Approach 4. Concretely, in one bounded change:

1. Add `<meta name="description">`, canonical, OG/Twitter, JSON-LD (Organization + WebSite), and keep `<html lang="es">` in `index.html` — static, present without JS.
2. Add `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` (llms.txt uses the issue-approved headline/subtitle/positioning, no unverified stats).
3. Restructure `HeroSection.tsx`: put `c.hero.title` as real text in `<h1>`, keep GSAP char-split as a visual enhancement layered on visible text (use `gsap.set` only after mount, or split-from-text without setting `opacity:0` on the source). Drop `opacity-0` initial classes on subtitle/CTA/stats and animate from a non-hidden state (e.g. `y: 20` with `opacity` untouched, or set initial hidden state imperatively after mount so SSR HTML is visible).
4. Update `src/i18n/content.ts` `es.hero.title` → `Todo tu negocio fitness bajo control`, `es.hero.subtitle` → `Gestiona clientes, responsables, membresías, pagos, accesos y caja desde un solo lugar.` Wait — the approved subtitle is exactly: `Gestiona clientes, membresías, pagos, accesos y caja desde un solo lugar.` Provide an `en` parallel. Decide on the unverified hero stats (`200+`, `4.9/5`, `98%`): per the issue's "avoid unverified statistics" guidance, the honest move is to **drop the stats row** or replace it with benefit bullets (no fabricated numbers). Mark the disposition as a proposal-time decision.
5. Convert `Navbar` nav buttons to `<a href="#section">` and `Footer` placeholder spans to real `<a href>` (even if `#` for now, but ideally pointing to the section anchors that already exist: `#soluciones`, `#funciones`, `#precios`, `#demo`, `#acceso`, `#flujo`).
6. Compress `public/assets` JPG/PNG and add `loading="lazy"` + `width`/`height` to `<img>` in `HeroSection`, `PainPointsSection`, `FrontDeskSection`, `ResourcesSection`.
7. Add a Vite prerender plugin to `vite.config.ts` (preferred: `@prerenderer/rollup-plugin` with a `/` route) so `dist/index.html` ships rendered.

This fits the review budget: estimated diff ≈ 150–200 lines across the files above (metadata + static docs ≈ 50, Hero restructure ≈ 30, content.ts copy ≈ 20, anchors ≈ 40, vite.config + plugin ≈ 10, image attributes ≈ 30, plus binary asset replacements that don't count as text lines).

**Fits the 400-line budget in one PR** provided the prerender plugin integrates cleanly. If the prerender step destabilizes the build (GSAP/Lenis/`inspectAttr` interactions), **slice**: ship Steps 1–2 + 4–6 first (metadata, static docs, visible Hero fallback via SSR-safe initial state, anchors, images) in PR #1, and follow with a **chained PR #2** that adds the prerender plugin. Per the project's `chained_pr_strategy: ask-always`, ask the user before splitting.

### Risks
- **Prerender × GSAP/Lenis interaction** — a static snapshot may capture mid-animation or hidden states; mitigated by making content visible-by-default in JSX before adding the plugin, and by running prerender with a wait-for selector.
- **BrowserRouter on a static host** — prerendering `/` is fine, but the redirect/SPA fallback must be configured at the host (out of repo scope). Document it for ops.
- **Apex DNS (`aionwellness.pro`)** — **not repo-solvable**; must be fixed at the DNS/host (A/ALIAS or `www` redirect). NEX-26 can document the required config but cannot implement it.
- **Unverified stats stalemate** — dropping the `200+`/`4.9/5`/`98%` row is a visible change beyond pure SEO; the issue's positioning copy request implies the hero is being repositioned, so removing the unverified claims is consistent with "avoid unverified statistics" — but confirm with the requester before deleting the stats block.
- **Image compression claims** — SEMrush "uncompressed resources" may also reference HTTP (gzip/brotli) compression, which is a host/CDN setting; repo-side asset compression fixes the payload size but not header-level compression. Document the split.
- **No test runner** — verification is manual against `dist/`; risk of regression in the GSAP timeline or the contact form (`/api/contact`) is not caught automatically.

### Verification criteria (no test runner; `build_command: npm run build`)
After `npm run build`, against `dist/`:
- `dist/index.html` contains `<meta name="description">` with a non-empty value.
- `dist/index.html` contains `<h1>` with the approved headline text visible in static HTML (no JS).
- `dist/index.html` contains JSON-LD `Organization`/`WebSite` and `lang="es"`.
- `dist/index.html` body includes ≥ 300 words of visible section text (sanity check against "low word count"/"low text-to-HTML ratio").
- `dist/robots.txt`, `dist/sitemap.xml`, `dist/llms.txt` exist and are non-empty; `robots.txt` references the sitemap.
- `dist/index.html` navbar/footer contain real `<a href="#">`/`<a href="#section">` anchors (no button-only nav).
- `dist/assets/*` image sizes are smaller than their `public/assets` sources (run `ls -la` comparison).
- `curl`-style fetch of the built `dist/index.html` with JS not executed still shows H1 + subtitle + meta description.
- Manual `npm run lint` and `tsc -b` remain green.
- The contact flow (`POST /api/contact`) is unchanged in behavior; smoke-test the lead form on `vite preview`.

### Ready for Proposal
**Yes.** The orchestrator should tell the user:
- The change is repo-solvable **except** the apex DNS issue (`aionwellness.pro`), which is a hosting/DNS config task to be tracked separately.
- Awaiting one decision before spec: **drop the unverified hero stats row** (`200+`, `4.9/5`, `98%`) or keep it? Recommended: drop, per the issue's "avoid unverified statistics" guidance.
- Awaiting one decision before spec: ship as **one PR** (if the prerender plugin integrates cleanly) or **two chained PRs** (metadata/static-docs/visible-hero/anchors/images first, then prerender plugin)? Per `chained_pr_strategy: ask-always`, ask before splitting; default to one PR and split only if the build breaks.