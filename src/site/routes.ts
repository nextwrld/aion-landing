// Single source of truth for the site's URL structure.
export const SITE_URL = 'https://www.aionwellness.pro'

export const PATHS = {
  home: '/',
  problems: '/problemas',
  benefits: '/beneficios',
  howItWorks: '/como-funciona',
  faq: '/preguntas',
  solutions: '/soluciones',
  contact: '/contacto',
} as const

export type PageKey = keyof typeof PATHS

export const SEGMENT_SLUGS = [
  'gimnasios',
  'boxes-funcional',
  'estudios',
  'centros-deportivos',
  'instituciones-deportivas',
  'multisede',
] as const

export type SegmentSlug = (typeof SEGMENT_SLUGS)[number]

export function segmentPath(slug: SegmentSlug): string {
  return `${PATHS.solutions}/${slug}`
}

export function isSegmentSlug(value: string | undefined): value is SegmentSlug {
  return typeof value === 'string' && (SEGMENT_SLUGS as readonly string[]).includes(value)
}

/** Every path that gets a prerendered HTML file, in sitemap order. */
export const PRERENDER_PATHS: string[] = [
  PATHS.home,
  PATHS.solutions,
  ...SEGMENT_SLUGS.map(segmentPath),
  PATHS.problems,
  PATHS.benefits,
  PATHS.howItWorks,
  PATHS.faq,
  PATHS.contact,
]

export const NOT_FOUND_PATH = '/404'
