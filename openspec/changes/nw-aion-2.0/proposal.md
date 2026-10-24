# Proposal: AION 2.0, de landing a sitio web completo (NW-AION-2.0)

Estado: borrador para aprobación del owner.
Rama: `NW-AION-2.0`.
Referencias analizadas: Glofox (/solutions/manage-my-business/) y monday.com (/s/crm-for-gym).

## Intención

Pasar de una landing de una sola página a un sitio informativo multipágina que explique AION
con más profundidad, posicione mejor en buscadores y hable a más segmentos: gimnasios,
centros deportivos, estudios e instituciones. El objetivo de conversión no cambia: la
solicitud de demostración.

## Alcance

### Dentro
- Home (`/`) se mantiene igual en contenido y diseño. Solo cambian los enlaces del navbar y
  footer para apuntar a las páginas nuevas.
- Seis páginas nuevas, bilingües ES/EN, con el mismo sistema visual (tokens Tailwind,
  componentes, GSAP/Lenis, ilustraciones actuales):
  1. `/problemas`
  2. `/beneficios`
  3. `/como-funciona`
  4. `/preguntas`
  5. `/soluciones` (índice) y `/soluciones/<segmento>`
  6. `/contacto`
- Enrutado con `react-router` (ya instalado y sin uso) y prerender de todas las rutas.
- SEO por página: title, description, canonical, Open Graph, JSON-LD y `sitemap.xml`.

### Fuera
- Rediseño visual o cambio de marca.
- Cambios al Worker `/api/contact` (se reutiliza tal cual).
- Precios, blog, portal de clientes o login real.
- Métricas, testimonios o logos de clientes inventados. Solo se usarán si el owner los
  aporta y son verificables (criterio heredado de NEX-26).

## Patrones tomados de las referencias

| Patrón | Glofox | monday | Uso en AION |
|---|---|---|---|
| Hero con H1, valor y CTA visible | Sí | Sí | En cada página |
| Bloques por módulo con captura alternada | Sí | Apilados | Beneficios y Cómo funciona |
| Barra de resultados numéricos | Sí | Una cifra | Solo con datos reales; si no, usar beneficios cualitativos |
| Testimonio con resultado | Uno | No | Pendiente de material real |
| Cards "otras formas en que te ayudamos" | Sí | Industrias | Enlaces cruzados al final de cada página |
| FAQ orientada a búsquedas | Sí | Sí | Página Preguntas y FAQ corta por página |
| CTA de demo repetido y banda final | ~8 veces | 3 veces | Tras cada bloque largo y banda final común |
| Menú por tipo de negocio | 9 tipos | Industrias | Menú Soluciones por segmento |
| Microcopy que reduce fricción | "Sin tarjeta" | — | "Sin compromiso" ya existente |

## Mapa del sitio y navegación

Navbar: Soluciones (desplegable por segmento) · Problemas · Beneficios · Cómo funciona ·
Preguntas · Contacto · botón "Solicitar demo".
Footer: columnas Producto, Soluciones, Empresa/Soporte, con enlaces a todas las páginas.

## Contenido propuesto por página

### 1. Problemas (`/problemas`)
- Hero: "Los problemas que frenan a tu gimnasio".
- Un bloque por problema, ampliando los tres actuales a seis: información dispersa,
  renovaciones perdidas, pagos no registrados, cierre de caja opaco, control de acceso
  manual, poca visibilidad a distancia.
- Cada bloque con: situación típica, costo para el negocio y cómo lo resuelve AION, con
  enlace al beneficio relacionado.
- Autodiagnóstico tipo checklist ("¿Te pasa esto?") que lleva al formulario de demo.
- Banda CTA.

### 2. Beneficios (`/beneficios`)
- Hero con los tres pilares actuales: Todo centralizado, Control a distancia, Operación
  más ordenada.
- Bloques alternados imagen/texto por módulo: Miembros, Membresías, Pagos, Control de
  acceso, Caja, Reportes. Cada uno con tres viñetas y CTA.
- Beneficios por rol: dueño, administrador, recepción.
- Tabla "Antes y después de AION" (cuaderno/Excel frente a AION).
- Enlace al roadmap (portales, automatizaciones, app móvil) marcado como "Próximamente".

### 3. Cómo funciona (`/como-funciona`)
- Flujo diario de cinco pasos actual, ampliado con detalle y captura por paso.
- Puesta en marcha: demo, configuración inicial, carga de miembros, capacitación, soporte.
- Requisitos: computadora o tablet con internet, sin servidores.
- Seguridad y respaldo de datos, solo con afirmaciones que el producto cumpla hoy.

### 4. Preguntas (`/preguntas`)
- FAQ completa agrupada por categorías: Producto, Implementación, Pagos y caja, Seguridad
  y datos, Soporte, Planes y demo.
- Buscador o filtro por categoría.
- JSON-LD `FAQPage` para resultados enriquecidos.
- Corregir la respuesta de migración desde Excel, que hoy promete una importación que no
  existe.

### 5. Soluciones (`/soluciones` y subpáginas)
Índice con una card por segmento y una subpágina por segmento con la misma plantilla:
dolores específicos, cómo lo usa ese negocio, módulos más relevantes, FAQ corta y CTA.

Segmentos propuestos:
- Gimnasios independientes
- Boxes de CrossFit y entrenamiento funcional
- Estudios de yoga, pilates y baile
- Centros deportivos y clubes (canchas, academias, artes marciales)
- Instituciones: universidades, colegios, empresas con gimnasio y centros municipales
- Cadenas o varias sedes (solo si el producto lo soporta hoy)

### 6. Contacto (`/contacto`)
- Formulario de demo actual reutilizado (misma protección Turnstile, honeypot, rate limit).
- Campo nuevo opcional "Tipo de negocio" con los segmentos de Soluciones.
- Canales directos: correo, WhatsApp, horario de atención.
- "Qué pasa después de enviar": tres pasos hasta la demo.

## Enfoque técnico

- `react-router` con rutas en `src/pages/`. Las secciones actuales se reutilizan como
  bloques dentro de las páginas nuevas.
- Componentes compartidos nuevos: `PageHero`, `FeatureRow` (alternado), `CTABand`,
  `CrossLinks`, `Breadcrumbs`, `SEOHead`.
- Contenido en `src/i18n/` dividido por página para no inflar `content.ts`.
- `scripts/prerender.mjs` ampliado para generar un HTML por ruta.
- Navbar con enlaces de ruta; las anclas internas siguen funcionando en Home.
- Hosting: confirmar que el host estático reescribe rutas a sus HTML prerenderizados.

## Plan por fases

| Fase | Entregable |
|---|---|
| 1. Base | Router, layout común, prerender multirruta, navbar y footer nuevos, SEO por página |
| 2. Componentes | PageHero, FeatureRow, CTABand, CrossLinks, Breadcrumbs |
| 3. Páginas núcleo | Problemas, Beneficios, Cómo funciona, Preguntas |
| 4. Soluciones | Índice y subpáginas por segmento |
| 5. Contacto | Página con formulario y campo de tipo de negocio |
| 6. Cierre | Traducción EN completa, sitemap, lint, build, revisión visual móvil y escritorio |

## Riesgos

- Prometer funciones que el producto no tiene. Mitigación: validar cada afirmación contra
  la matriz de capacidades del superproyecto.
- Prueba social vacía. Mitigación: no publicar cifras ni testimonios sin fuente.
- Rutas que fallan en el host al recargar. Mitigación: prerender por ruta y prueba en preview.

## Decisiones pendientes del owner

1. Qué segmentos de Soluciones se publican en esta versión.
2. Qué funciones existen hoy y cuáles van como "Próximamente" (ej. varias sedes, reportes).
3. Si hay testimonios, cifras o logos de clientes reales que se puedan usar.
4. Datos de contacto públicos: WhatsApp, horario, redes sociales.
5. Si se agrega el campo "Tipo de negocio" al formulario (implica un cambio menor en el
   esquema del Worker).
