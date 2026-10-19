import { useMemo, useState } from 'react'
import { Search, MessageCircle } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useContent, useSite } from '../i18n/useContent'
import { faqContent } from '../i18n/pages/faq'
import { PATHS } from '../site/routes'
import PageHero from '../components/site/PageHero'
import FaqAccordion from '../components/site/FaqAccordion'
import { ButtonLink } from '../components/site/Buttons'
import CTABand from '../components/site/CTABand'
import CrossLinks from '../components/site/CrossLinks'

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export default function FaqPage() {
  const t = useContent(faqContent)
  const s = useSite()
  const ref = useReveal<HTMLDivElement>()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = normalize(query)
    return t.categories
      .filter((c) => category === 'all' || c.id === category)
      .map((c) => ({
        ...c,
        items: q ? c.items.filter((it) => normalize(`${it.q} ${it.a}`).includes(q)) : c.items,
      }))
      .filter((c) => c.items.length > 0)
  }, [t, query, category])

  const total = filtered.reduce((n, c) => n + c.items.length, 0)

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full font-inter text-sm font-medium border transition-colors ${
      active ? 'bg-deep-blue text-white border-deep-blue' : 'bg-white text-text-secondary border-border-custom hover:border-wellness hover:text-wellness'
    }`

  return (
    <div ref={ref}>
      <PageHero
        id="faq-page-heading"
        badge={t.hero.badge}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        breadcrumbs={[{ label: s.pages.faq.label }]}
      />

      <section aria-label={t.search.label} className="bg-white pb-16 sm:pb-20 lg:pb-[100px]">
        <div className="section-container max-w-[880px]">
          <div data-reveal className="flex flex-col gap-4">
            <label htmlFor="faq-search" className="sr-only">{t.search.label}</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" aria-hidden="true" />
              <input
                id="faq-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search.placeholder}
                className="w-full pl-12 pr-4 py-4 border-[1.5px] border-border-custom rounded-xl font-inter text-sm outline-none transition-all focus:border-wellness focus:ring-[3px] focus:ring-wellness/10"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.hero.badge}>
              <button type="button" className={chip(category === 'all')} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
                {t.search.all}
              </button>
              {t.categories.map((c) => (
                <button key={c.id} type="button" className={chip(category === c.id)} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
                  {c.title}
                </button>
              ))}
            </div>
            <p className="font-inter text-xs text-text-light" aria-live="polite">{t.search.results(total)}</p>
          </div>

          <div className="mt-8 flex flex-col gap-12">
            {filtered.length === 0 && (
              <p className="font-inter text-base text-text-secondary text-center py-10">{t.search.empty}</p>
            )}
            {filtered.map((c) => (
              <section key={`${c.id}-${query}`} id={c.id} aria-labelledby={`faq-cat-${c.id}`} className="scroll-mt-28">
                <h2 id={`faq-cat-${c.id}`} className="font-sora font-semibold text-xl text-deep-blue mb-2">{c.title}</h2>
                <FaqAccordion items={c.items} defaultOpen={query ? 0 : null} />
              </section>
            ))}
          </div>

          <div data-reveal className="mt-14 rounded-2xl bg-light-gray border border-border-custom p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-wellness-light flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-wellness" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-sora font-semibold text-lg text-deep-blue">{t.stillQuestions.title}</h2>
                <p className="font-inter text-sm text-text-secondary mt-1">{t.stillQuestions.text}</p>
              </div>
            </div>
            <ButtonLink to={PATHS.contact} className="flex-shrink-0">{t.stillQuestions.cta}</ButtonLink>
          </div>
        </div>
      </section>

      <CTABand />
      <CrossLinks pages={['howItWorks', 'solutions', 'benefits']} />
    </div>
  )
}
