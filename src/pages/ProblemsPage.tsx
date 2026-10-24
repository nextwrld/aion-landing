import { useState } from 'react'
import { Link } from 'react-router'
import { Files, CalendarX, Wallet, Calculator, DoorOpen, EyeOff, ArrowRight, Check, AlertTriangle, TrendingDown, Sparkles } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useContent, useSite } from '../i18n/useContent'
import { problemsContent } from '../i18n/pages/problems'
import { PATHS } from '../site/routes'
import PageHero from '../components/site/PageHero'
import SectionHeading from '../components/site/SectionHeading'
import { ButtonLink } from '../components/site/Buttons'
import Testimonials from '../components/site/Testimonials'
import CTABand from '../components/site/CTABand'
import CrossLinks from '../components/site/CrossLinks'

const ICONS = [Files, CalendarX, Wallet, Calculator, DoorOpen, EyeOff]
const IMAGES = ['/assets/illust-notebook.png', '/assets/illust-excel.png', '/assets/illust-phone.png']

function HeroCollage({ alts }: { alts: string[] }) {
  return (
    <div className="relative w-full max-w-[440px] h-[300px] sm:h-[340px]">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute bg-white rounded-2xl border border-border-custom shadow-card p-5 flex items-center justify-center ${
            ['left-0 top-6 w-[52%] rotate-[-4deg] animate-float', 'right-0 top-0 w-[48%] rotate-[3deg] animate-float-small', 'left-[22%] bottom-0 w-[50%] rotate-[1deg] animate-float'][i]
          }`}
        >
          <img src={src} alt={alts[i]} className="h-[110px] sm:h-[130px] w-auto object-contain" />
        </div>
      ))}
    </div>
  )
}

function Checklist() {
  const t = useContent(problemsContent).checklist
  const [checked, setChecked] = useState<boolean[]>(() => t.items.map(() => false))
  const count = checked.filter(Boolean).length
  const message = count === 0 ? t.results.none : count < 2 ? t.results.few : t.results.many

  return (
    <section aria-labelledby="checklist-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[100px]">
      <div className="section-container max-w-[880px]">
        <SectionHeading id="checklist-heading" badge={t.badge} title={t.title} subtitle={t.subtitle} />
        <div data-reveal className="bg-white rounded-2xl border border-border-custom shadow-card p-6 sm:p-8">
          <ul className="grid sm:grid-cols-2 gap-3">
            {t.items.map((item, i) => (
              <li key={item}>
                <label
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                    checked[i] ? 'border-wellness bg-wellness-light/60' : 'border-border-custom hover:bg-light-gray'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked[i]}
                    onChange={() => setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                  />
                  <span
                    className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-wellness/40 ${
                      checked[i] ? 'bg-wellness border-wellness' : 'border-border-custom bg-white'
                    }`}
                    aria-hidden="true"
                  >
                    {checked[i] && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="font-inter text-sm text-text-primary leading-relaxed">{item}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-border-custom flex flex-col sm:flex-row sm:items-center gap-4 justify-between" aria-live="polite">
            <div>
              <div className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-text-light">{t.counter(count, t.items.length)}</div>
              <p className="font-sora font-semibold text-base text-deep-blue mt-1">{message}</p>
            </div>
            {count > 0 && (
              <ButtonLink to={PATHS.contact} className="flex-shrink-0">
                {t.cta}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ProblemsPage() {
  const t = useContent(problemsContent)
  const s = useSite()
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref}>
      <PageHero
        id="problems-heading"
        badge={t.hero.badge}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        breadcrumbs={[{ label: s.pages.problems.label }]}
        visual={<HeroCollage alts={t.hero.imageAlts} />}
        actions={
          <>
            <ButtonLink to={PATHS.contact}>{t.hero.cta}</ButtonLink>
            <ButtonLink to={PATHS.benefits} variant="outline" arrow={false}>
              {t.hero.secondary}
            </ButtonLink>
          </>
        }
      />

      <section aria-labelledby="problem-list-heading" className="bg-white py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="problem-list-heading" badge={t.listHeading.badge} title={t.listHeading.title} subtitle={t.listHeading.subtitle} />
          <div className="grid lg:grid-cols-2 gap-6">
            {t.problems.map((p, i) => {
              const Icon = ICONS[i]
              return (
                <article
                  key={p.id}
                  id={p.id}
                  data-reveal
                  data-reveal-delay={String((i % 2) * 0.1)}
                  className="scroll-mt-28 bg-white rounded-2xl border border-border-custom p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-red-500" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <div>
                      <span className="font-inter text-xs font-semibold text-text-light">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="font-sora font-semibold text-xl text-deep-blue leading-tight">{p.title}</h3>
                    </div>
                  </div>
                  <dl className="mt-6 flex flex-col gap-4 flex-1">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <dt className="font-inter text-xs font-semibold uppercase tracking-[0.06em] text-text-light">{t.labels.situation}</dt>
                        <dd className="font-inter text-sm text-text-primary leading-relaxed mt-1">{p.situation}</dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <TrendingDown className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <dt className="font-inter text-xs font-semibold uppercase tracking-[0.06em] text-text-light">{t.labels.cost}</dt>
                        <dd className="font-inter text-sm text-text-primary leading-relaxed mt-1">{p.cost}</dd>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-xl bg-wellness-light/60 p-4">
                      <Sparkles className="w-4 h-4 text-wellness mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <dt className="font-inter text-xs font-semibold uppercase tracking-[0.06em] text-wellness-dark">{t.labels.solution}</dt>
                        <dd className="font-inter text-sm text-text-primary leading-relaxed mt-1">{p.solution}</dd>
                      </div>
                    </div>
                  </dl>
                  <Link to={PATHS[p.link]} className="mt-5 inline-flex items-center gap-1.5 font-inter text-sm font-semibold text-wellness hover:text-wellness-dark group self-start">
                    {s.pages[p.link].label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <Checklist />
      <Testimonials limit={2} className="bg-white" />
      <CTABand />
      <CrossLinks pages={['benefits', 'howItWorks', 'solutions']} />
    </div>
  )
}
