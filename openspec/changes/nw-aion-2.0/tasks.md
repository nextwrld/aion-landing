# Tasks: NW-AION-2.0

## Decisiones del owner (2026-10-19)
- Segmentos: gimnasios, boxes y funcional, estudios, centros deportivos y clubes, instituciones (con enfoque deportivo), cadenas y varias sedes.
- Funciones disponibles: registro y cobro, control de acceso (manual por ID del cliente), monitoreo de membresías, reportes, varias sedes.
- Próximamente: módulo para entrenadores, acceso por reconocimiento facial.
- Testimonios: inventados como ejemplo. Se publican marcados como "ejemplos ilustrativos".
- Contacto: WhatsApp Venezuela +58 424-4587200, WhatsApp Argentina +54 9 11 7367-8601, Instagram @nextwrld.tech.
- Formulario: no se agrega el campo "Tipo de negocio". El Worker no cambia.

## Fase 1. Base
- [x] Rutas con react-router y layout común (navbar, footer, scroll, meta por página)
- [x] Prerender multirruta con head SEO por ruta, 404.html y sitemap generado
- [x] `base: '/'` en Vite para rutas anidadas
- [x] Navbar con menú Soluciones y footer con enlaces y contactos reales

## Fase 2. Componentes
- [x] PageHero, SectionHeading, FeatureRow, CTABand, CrossLinks, Breadcrumbs, Testimonials, FaqAccordion, StatusBadge
- [x] Mockups de interfaz: búsqueda, membresías, cobro, acceso, caja, reportes, sedes

## Fase 3. Páginas
- [x] Problemas (seis problemas y autodiagnóstico)
- [x] Beneficios (módulos, roles, antes/después, próximamente)
- [x] Cómo funciona (puesta en marcha, flujo diario, requisitos, FAQ)
- [x] Preguntas (categorías, buscador, FAQPage)
- [x] Soluciones (índice y seis segmentos)
- [x] Contacto (formulario existente, canales, próximos pasos)

## Fase 4. Cierre
- [x] Contenido ES/EN completo
- [x] Tests de rutas y SEO
- [x] Lint, build y revisión visual en escritorio y móvil sin errores de hidratación
- [ ] Revisión del owner del copy y de los testimonios de ejemplo
- [ ] Confirmar que el hosting sirve `/<ruta>/index.html` y `404.html`
- [ ] Corregir la respuesta de Excel en la FAQ del Home (fuera de alcance: el Home queda sin cambios)
