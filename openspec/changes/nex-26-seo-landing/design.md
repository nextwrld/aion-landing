# Design: SEO and Conversion Landing

## Technical Approach

Keep the single-page React 19/Vite 7 application and prerender `/` as Spanish HTML during `npm run build`. React rendering is project-owned through `react-dom/server`, avoiding browser automation, abandoned Puppeteer plugins, duplicated `<noscript>` content, or a framework migration. The existing client hydrates that same tree and retains i18n, GSAP/Lenis, and `/api/contact` behavior.

> **PR 2 design deviation (documented after PR 1 was already committed).** The original design called for `vite-prerender-plugin` 0.5.13 wired into the Vite build via `vitePrerenderPlugin({ prerenderScript: 'src/prerender.tsx' })`. That plugin works, but its implementation does not let `npm run build` exit naturally: it loads the prerender entry through `import('file://…/prerender-entry.js')`, monkey-patches `globalThis.fetch` with a local-fs implementation, and never restores either, so the Node process keeps open handles after the prerender step and hangs indefinitely. Force-killing the process produces a correct `dist/` tree but violates the `npm run build` exit-0 contract required for CI. We replaced the plugin with a project-owned build script — `scripts/prerender.mjs` — that runs in a separate Node process after `vite build`, uses Vite's programmatic SSR build API to produce a server bundle, dynamically `import()`s the bundle with a normal path (no `file://`), injects the rendered HTML into `dist/index.html`, and cleans up its temp directory. The build now exits with code 0 in ~4 s with no leaked processes.

## Architecture Decisions

| Decision | Alternatives / tradeoff | Choice and rationale |
|---|---|---|
| Static rendering | `vite-prerender-plugin` is the obvious Vite 5–8-compatible framework-neutral choice, but its `file://` import + monkey-patched `globalThis.fetch` keep the Node process alive after prerender. Vike would replace the build pipeline; rolling our own in-process Vite plugin would re-introduce the same handle-leak class of bugs. | **Project-owned `scripts/prerender.mjs`** that runs as a separate Node process after `vite build`. It uses Vite's programmatic `build({ ssr: … })` API to produce a server bundle, `import()`s the bundle with a normal path, injects the rendered Spanish HTML into `dist/index.html`, and `rmSync`s the temp directory. Each step completes and the process exits with code 0. |
| Hydration and locale | Reading stored English during the first client render would mismatch Spanish static HTML. | Remove the unused `BrowserRouter`, use `hydrateRoot`, render `es` deterministically, then restore `aion.lang` after hydration via `useSyncExternalStore(getClientSnapshot, getServerSnapshot)` (the React-19-recommended pattern for "read an external value on mount, re-read when it changes"). `/` is Spanish because the specified audience and canonical page target Venezuela; the runtime toggle remains bilingual and updates `<html lang>`. |
| Animation | Static `opacity-0` and DOM-built H1 make content depend on GSAP. | Render H1/copy/CTA declaratively and visibly. GSAP only animates already-rendered nodes after hydration; cleanup restores readable styles. Lenis remains client-effect-only. |
| Metadata | Organization, address, offers, ratings, and social profiles are not verified. | Keep metadata static in `index.html`; emit only truthful `WebSite` and `SoftwareApplication` JSON-LD without invented business data. |
| PR 1 follow-up — FAQ `hidden` | The HTML `hidden` attribute is `display: none` and bypasses the CSS `maxHeight`/`opacity` expansion/collapse transition. | Use `inert={openIndex !== i}` instead. The panel is still removed from the accessibility tree and focus order when closed, but the `maxHeight`/`opacity` transition now runs cleanly on both directions. |

## Data Flow

    content.es → React renderToString → scripts/prerender.mjs → dist/index.html
                                                              └─ cleanup → exit 0
         └────→ hydrateRoot → stored locale/toggle (useSyncExternalStore) → GSAP + Lenis enhancement
    CTA href="#demo" → existing form → POST /api/contact (unchanged)

## File Changes

| File | Action | Description |
|---|---|---|
| `src/prerender.tsx` | Create | Exports `prerender()` that calls React 19 `renderToString(<App />)`. SSR-safe (no DOM/window access). |
| `scripts/prerender.mjs` | Create | Project-owned build-time script. Runs after `vite build`; builds a server bundle via Vite's SSR API, `import()`s it, injects the rendered HTML into `dist/index.html`, removes its temp directory, exits with code 0 (non-zero on any failure). Replaces `vite-prerender-plugin`. |
| `scripts/validate-dist.mjs` | Create (PR 3) | Validate built HTML, JSON-LD, and crawl files without a test framework. |
| `src/main.tsx`, `src/i18n/I18nProvider.tsx` | Modify | `hydrateRoot` + `useSyncExternalStore` for SSR-safe locale persistence; remove unused `BrowserRouter`. |
| `src/i18n/content.ts` | Modify | Add equivalent approved Spanish/English positioning, problems, benefits, CTA, and exact support text. Bilingual navbar hrefs aligned to the renamed section IDs. |
| `src/sections/FAQSection.tsx` | Modify | `inert={openIndex !== i}` replaces `hidden={openIndex !== i}` so expansion/collapse CSS transitions run cleanly. |
| `src/components/Navbar.tsx`, `src/components/Logo.tsx`, `src/sections/*.tsx` | Modify | Semantic links/landmarks, accessible controls/images, visible defaults, and conversion copy; preserve form transport. |
| `index.html`, `package.json`, `package-lock.json` | Modify | Outlet, metadata, project-owned `build` script (`tsc -b && vite build && node scripts/prerender.mjs`). `vite-prerender-plugin` removed from `package.json` and lockfile. |
| `public/{robots.txt,sitemap.xml,llms.txt}` | Create | Canonical crawl resources. `og-aion.jpg` is PR 3. |
| `public/assets/*.{webp,avif}` | Create (PR 3) | Responsive optimized variants of existing imagery. |

## Interfaces / Contracts

Navigation uses `<header><nav aria-label="Principal">` with real `href="#..."` anchors, one `<main>`, labelled `<section>` elements, `<footer>`, and `<a href="#demo">` CTAs that work without JavaScript. FAQ buttons expose `aria-expanded`/`aria-controls`; FAQ panels use `inert` (not `hidden`) so the CSS `maxHeight`/`opacity` transition runs cleanly on both expand and collapse. Form controls retain the same payload and endpoint while receiving programmatic labels.

Static head contract: canonical `https://www.aionwellness.pro/`; `robots=index,follow`; Open Graph `website` with `es_VE`/`en_US`; Twitter `summary_large_image`; matching title, description, URL, and `/assets/front-desk.jpg` (existing image; PR 3 may replace with a purpose-built 1200×630 `og-aion.jpg`). JSON-LD is exactly a graph of `WebSite` (`name`, `url`, `inLanguage`) and `SoftwareApplication` (`name`, `url`, `applicationCategory: BusinessApplication`, `operatingSystem: Web`, truthful description, `inLanguage`), with no `Organization`, `Offer`, rating, address, or profiles.

The hero has no raster image, so its H1/dashboard remain promptly discoverable LCP candidates. The above-fold logo is optimized, eager, and dimensioned. Existing illustrations/front-desk photography gain intrinsic dimensions and AVIF/WebP `srcset`/`sizes`; all below-fold images use `loading="lazy"` and `decoding="async"`, with meaningful alt text or empty alt for decoration.

## Testing Strategy

| Layer | Approach |
|---|---|
| Static contract | `npm run build` (must exit with code 0 under a finite timeout with no `pkill`/`kill -9`); `npm run validate:dist` (PR 3); assert one visible H1, exact support copy, landmarks/anchors/CTA, metadata, parseable allowlisted JSON-LD, asset references, and consistent non-empty crawl files in `dist/`. |
| Quality | Run `npm run lint` (per-file on every changed TS/TSX), `npx tsc -b`, and `npm run build` twice from a clean `dist/` to prove determinism and cleanup. |
| Smoke | `npx vite preview --host 127.0.0.1 --port 4173`; `curl` `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`; inspect Spanish initial render, English toggle (code-reviewed; no headless browser available in this env), animations-disabled readability, CTA focus/scroll, and unchanged form success/failure behavior. Stop the preview with `kill` (not `kill -9`) and confirm no leaked processes. |

## Threat Matrix

- `scripts/prerender.mjs` is a new build-time entry point that reads `dist/index.html` and writes the rendered HTML back. It fails closed: any error in the SSR build, the import, the render, or the file write exits with non-zero, cleans up the temp directory via `rmSync` in a `catch`, and leaves `dist/` untouched.
- The script does not execute arbitrary code from `dist/`; it only writes the rendered HTML string into the `<div id="root">` placeholder.
- No browser automation, VCS/PR automation, or executable classification is added.

## Migration / Rollout

No data migration or feature flag. Target under 400 authored changed lines by updating existing structures rather than adding sections. Roll back `scripts/prerender.mjs` and the `build` script to restore CSR. Apex DNS and HTTP gzip/brotli are external operations follow-ups, not repository work.

## Open Questions

None.
