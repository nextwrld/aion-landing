# SEO Conversion Landing Specification

## Purpose

Define crawlable, truthful conversion behavior for AION's Venezuelan audience.

## Requirements

### Requirement: Static landing document

Without JavaScript, the built document MUST expose one visible H1 `Todo tu negocio fitness bajo control`, meaningful body copy, semantic landmarks, section anchors, and the conversion CTA.

#### Scenario: JavaScript is disabled

- GIVEN the built root loads without JavaScript
- WHEN its HTML is read
- THEN the H1, body, landmarks, anchors, and CTA are present and readable

### Requirement: Approved Spanish conversion content

Spanish content MUST use subtitle `Gestiona clientes, membresías, pagos, accesos y caja desde un solo lugar.`, positioning `AION es el sistema que ayuda a ordenar, controlar y hacer crecer tu negocio de fitness y bienestar.`, CTA `Agendar una demostración gratuita`, support text `Conoce cómo funcionaría AION en tu gimnasio. Sin compromiso.`, and benefits `Todo centralizado`, `Control a distancia`, and `Operación más ordenada`. It MUST address scattered information, unregistered payments, missed renewals, cash closing, access control, remote visibility, and reception dependency; use Venezuelan terms such as `cédula`; and exclude keyword stuffing, opaque jargon, fabricated statistics, guarantees, and unverified claims.

#### Scenario: Spanish content review

- GIVEN Spanish is selected
- WHEN visible copy is inspected
- THEN the exact approved copy, including `Conoce cómo funcionaría AION en tu gimnasio. Sin compromiso.`, and problems appear without prohibited or unsupported claims

### Requirement: Lead-form conversion boundary

The CTA MUST reach the existing lead form. Submission, validation, transport, SMTP, and failure behavior MUST remain unchanged.

#### Scenario: Contact backend is unavailable

- GIVEN a visitor follows the CTA and submits the form
- WHEN the contact backend is unavailable
- THEN existing error behavior occurs without a new fallback or submission path

### Requirement: Discovery metadata

The root MUST expose without JavaScript a relevant meta description, canonical `https://www.aionwellness.pro/`, index/follow directives, Open Graph and Twitter card metadata, and truthful JSON-LD using that host.

#### Scenario: Social crawler fetches the root

- GIVEN a social crawler disables JavaScript
- WHEN it fetches the root
- THEN canonical, robots, social, description, and valid truthful JSON-LD metadata are present

### Requirement: Root crawl resources

The build MUST emit non-empty `robots.txt`, `sitemap.xml`, and `llms.txt` at the distribution root. All MUST use `https://www.aionwellness.pro/`; robots MUST permit the landing and reference the sitemap, while sitemap and LLM content MUST contain only public URLs and truthful claims.

#### Scenario: Crawl resources are audited

- GIVEN a production build
- WHEN all three resources are parsed
- THEN their host, sitemap reference, URLs, and summary are consistent

### Requirement: Progressive animation

Animation MUST enhance readable defaults and MUST NOT reveal or construct essential content or controls.

#### Scenario: Animation does not run

- GIVEN animation does not initialize
- WHEN the landing renders
- THEN essential content and controls remain visible and operable

### Requirement: Responsive accessible images

Images MUST use optimized resources and intrinsic dimensions without harming legibility. Below-fold images SHOULD defer; the likely LCP image MUST remain promptly discoverable. Informative images MUST have meaningful alternatives and decorative images MUST be ignored by assistive technology.

#### Scenario: Narrow viewport

- GIVEN a narrow viewport
- WHEN images and content render
- THEN essential content remains unobscured and the LCP image remains appropriate and accessible

### Requirement: Equivalent English experience

The language toggle MUST work. English MUST convey equivalent positioning, problems, benefits, CTA intent, support limits, and claim constraints without contradicting Spanish.

#### Scenario: Language is toggled

- GIVEN Spanish is visible
- WHEN English is selected
- THEN content switches while anchors, CTA destination, and truthfulness remain equivalent

### Requirement: Operational boundary

Repository behavior MUST NOT configure apex DNS or HTTP gzip/brotli; these SHALL remain operational responsibilities.

#### Scenario: Repository scope is verified

- GIVEN the capability is reviewed
- WHEN DNS resolution and HTTP compression are assessed
- THEN their absence does not fail this specification and they remain operations follow-ups
