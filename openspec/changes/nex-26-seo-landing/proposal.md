# Proposal: SEO and Conversion Landing

## Intent

Reposition AION for Venezuelan fitness and wellness operators while preserving its visual identity. Core positioning: `AION es el sistema que ayuda a ordenar, controlar y hacer crecer tu negocio de fitness y bienestar.`

## Scope

### In Scope
- Use hero `Todo tu negocio fitness bajo control` / `Gestiona clientes, membresías, pagos, accesos y caja desde un solo lugar.` and CTA `Agendar una demostración gratuita`, with the approved no-commitment support text.
- Communicate control, order, growth, and peace of mind in professional Venezuelan language such as `cédula`.
- Address scattered information, unregistered payments, missed renewals, cash closing, access control, remote visibility, and reception dependency.
- Guide visitors to the lead form; communicate personalized onboarding, easy implementation, and direct support without guarantees.
- Add prerendered HTML, visible H1 content, metadata, canonical, social tags, JSON-LD, semantic anchors/landmarks, crawl files, and pragmatic image optimization.

### Out of Scope
- Broad visual redesign or changes to lead-form/SMTP behavior.
- Hidden/duplicated SEO copy, keyword stuffing, or unverifiable claims.
- Apex-domain DNS and hosting gzip/brotli configuration; track both as operations follow-ups.

## Capabilities

### New Capabilities
- `seo-conversion-landing`: Conversion content and crawlable SEO for AION's Venezuelan audience.

### Modified Capabilities
None; no existing OpenSpec capabilities are registered.

## Approach

Keep the React/Tailwind presentation and treat animations as progressive enhancement. Centralize bilingual copy, replace statistics with `Todo centralizado`, `Control a distancia`, and `Operación más ordenada`, add semantic/static SEO resources, and prerender `/`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/i18n/content.ts`, `src/sections/`, `src/components/` | Modified | Copy, CTA, semantics, images |
| `index.html`, `public/` | Modified/New | Metadata, structured data, crawler files, assets |
| `vite.config.ts`, `package.json` | Modified | Prerendering |
| `api/contact.ts` | Unchanged | Existing lead submission and SMTP flow preserved |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Prerender captures hidden animation state | Medium | Render visible defaults; animate only after hydration; inspect built HTML |
| Copy weakens layout | Medium | Preserve components; validate responsiveness |

## Rollback Plan

Revert landing, SEO files, assets, and prerender configuration to restore the CSR build. The contact endpoint requires no rollback.

## Dependencies

- Vite prerender tooling.
- Operations follow-ups for apex DNS and HTTP compression.

## Success Criteria

- [ ] Built HTML contains visible approved copy, anchors, metadata, canonical, social tags, and JSON-LD.
- [ ] `robots.txt`, `sitemap.xml`, and `llms.txt` are emitted and consistent with the canonical URL.
- [ ] The CTA reaches the unchanged lead form; copy avoids prohibited jargon and fabricated claims.
- [ ] Build/lint pass; animations enhance visible content; changes stay within 400 lines where practical.
