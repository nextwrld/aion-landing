// Per-route SEO metadata. Used by the client (document.title on navigation)
// and by the build-time prerender (full <head> tags per HTML file).
import type { Lang } from '../i18n/content'
import { siteContent } from '../i18n/site'
import { faqContent } from '../i18n/pages/faq'
import { howItWorksContent } from '../i18n/pages/howItWorks'
import { getSegment } from '../i18n/pages/solutions'
import {
  NOT_FOUND_PATH,
  PATHS,
  PRERENDER_PATHS,
  SITE_URL,
  isSegmentSlug,
  segmentPath,
  type PageKey,
} from './routes'

type QA = { q: string; a: string }

export type PageMeta = {
  path: string
  title: string
  description: string
  breadcrumbs: { name: string; path: string }[]
  faq?: QA[]
  noindex?: boolean
}

const PAGE_BY_PATH = Object.fromEntries(
  (Object.entries(PATHS) as [PageKey, string][]).map(([key, path]) => [path, key]),
) as Record<string, PageKey>

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname || '/'
}

export function getPageMeta(rawPath: string, lang: Lang): PageMeta {
  const path = normalizePath(rawPath)
  const s = siteContent[lang]
  const home = { name: s.pages.home.label, path: PATHS.home }

  const key = PAGE_BY_PATH[path]
  if (key) {
    const page = s.pages[key]
    const meta: PageMeta = {
      path,
      title: page.title,
      description: page.metaDescription,
      breadcrumbs: key === 'home' ? [] : [home, { name: page.label, path }],
    }
    if (key === 'faq') meta.faq = faqContent[lang].categories.flatMap((c) => c.items)
    if (key === 'howItWorks') meta.faq = howItWorksContent[lang].faq.items
    return meta
  }

  const segmentMatch = path.match(/^\/soluciones\/([^/]+)$/)
  if (segmentMatch && isSegmentSlug(segmentMatch[1])) {
    const seg = getSegment(lang, segmentMatch[1])
    return {
      path,
      title: seg.metaTitle,
      description: seg.metaDescription,
      breadcrumbs: [
        home,
        { name: s.pages.solutions.label, path: PATHS.solutions },
        { name: seg.name, path: segmentPath(seg.slug) },
      ],
      faq: seg.faq,
    }
  }

  return {
    path: NOT_FOUND_PATH,
    title: s.notFound.metaTitle,
    description: s.notFound.text,
    breadcrumbs: [],
    noindex: true,
  }
}

export function absoluteUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function jsonLd(data: unknown): string {
  // Escape "<" so content can never close the script tag.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

/** Full set of SEO tags for one route, rendered in Spanish (the prerender language). */
export function buildHeadTags(rawPath: string): string {
  const meta = getPageMeta(rawPath, 'es')
  const url = absoluteUrl(meta.path)
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const image = `${SITE_URL}/assets/front-desk.jpg`

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    meta.noindex ? '<meta name="robots" content="noindex, follow" />' : '<meta name="robots" content="index, follow" />',
  ]
  if (!meta.noindex) tags.push(`<link rel="canonical" href="${url}" />`)
  tags.push(
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="AION Wellness" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:locale" content="es_VE" />',
    '<meta property="og:locale:alternate" content="en_US" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  )

  if (meta.breadcrumbs.length > 0) {
    tags.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: meta.breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: absoluteUrl(b.path),
        })),
      }),
    )
  }
  if (meta.faq && meta.faq.length > 0) {
    tags.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: meta.faq.map((qa) => ({
          '@type': 'Question',
          name: qa.q,
          acceptedAnswer: { '@type': 'Answer', text: qa.a },
        })),
      }),
    )
  }
  return tags.join('\n    ')
}

export function buildSitemap(): string {
  const urls = PRERENDER_PATHS.map((p) => `  <url>\n    <loc>${absoluteUrl(p)}</loc>\n  </url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
