import { describe, expect, it } from 'vitest'
import { PRERENDER_PATHS, SEGMENT_SLUGS, NOT_FOUND_PATH } from './routes'
import { buildHeadTags, buildSitemap, getPageMeta, normalizePath } from './seo'
import { solutionsContent } from '../i18n/pages/solutions'
import { faqContent } from '../i18n/pages/faq'

describe('site routes and SEO', () => {
  it('gives every prerendered path a title and description in both languages', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const path of PRERENDER_PATHS) {
        const meta = getPageMeta(path, lang)
        expect(meta.path).toBe(path)
        expect(meta.title.length).toBeGreaterThan(10)
        expect(meta.description.length).toBeGreaterThan(40)
        expect(meta.noindex).toBeFalsy()
      }
    }
  })

  it('uses a unique title per page', () => {
    const titles = PRERENDER_PATHS.map((p) => getPageMeta(p, 'es').title)
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('has content for every segment slug in both languages', () => {
    for (const lang of ['es', 'en'] as const) {
      expect(solutionsContent[lang].segments.map((s) => s.slug)).toEqual([...SEGMENT_SLUGS])
    }
  })

  it('keeps the FAQ structure identical across languages', () => {
    const count = (lang: 'es' | 'en') => faqContent[lang].categories.map((c) => c.items.length)
    expect(count('en')).toEqual(count('es'))
  })

  it('treats unknown paths as not found and noindex', () => {
    const meta = getPageMeta('/soluciones/no-existe', 'es')
    expect(meta.path).toBe(NOT_FOUND_PATH)
    expect(buildHeadTags('/no-existe')).toContain('noindex')
    expect(buildHeadTags('/no-existe')).not.toContain('rel="canonical"')
  })

  it('normalizes trailing slashes', () => {
    expect(normalizePath('/problemas/')).toBe('/problemas')
    expect(normalizePath('/')).toBe('/')
    expect(getPageMeta('/preguntas/', 'es').path).toBe('/preguntas')
  })

  it('emits canonical, breadcrumb and FAQ structured data for a segment', () => {
    const head = buildHeadTags('/soluciones/gimnasios')
    expect(head).toContain('<link rel="canonical" href="https://www.aionwellness.pro/soluciones/gimnasios" />')
    expect(head).toContain('"@type":"BreadcrumbList"')
    expect(head).toContain('"@type":"FAQPage"')
    expect(head).not.toMatch(/<\/script>[^\n]*<\/script>/)
  })

  it('lists every prerendered path in the sitemap', () => {
    const xml = buildSitemap()
    for (const path of PRERENDER_PATHS) {
      expect(xml).toContain(`<loc>https://www.aionwellness.pro${path === '/' ? '/' : path}</loc>`)
    }
    expect(xml).not.toContain('404')
  })
})
