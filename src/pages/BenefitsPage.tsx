import { Layers, Smartphone, ClipboardCheck, Crown, Briefcase, ConciergeBell, Check, X, Dumbbell, ScanFace, Clock } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useContent, useSite } from '../i18n/useContent'
import { benefitsContent } from '../i18n/pages/benefits'
import { PATHS } from '../site/routes'
import PageHero from '../components/site/PageHero'
import SectionHeading from '../components/site/SectionHeading'
import FeatureRow from '../components/site/FeatureRow'
import Mockup from '../components/site/Mockups'
import StatusBadge from '../components/site/StatusBadge'
import { ButtonLink } from '../components/site/Buttons'
import Testimonials from '../components/site/Testimonials'
import CTABand from '../components/site/CTABand'
import CrossLinks from '../components/site/CrossLinks'

const PILLAR_ICONS = [Layers, Smartphone, ClipboardCheck]
const ROLE_ICONS = [Crown, Briefcase, ConciergeBell]
const SOON_ICONS = [Dumbbell, ScanFace]

export default function BenefitsPage() {
  const t = useContent(benefitsContent)
  const s = useSite()
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref}>
      <PageHero
        id="benefits-page-heading"
        badge={t.hero.badge}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        breadcrumbs={[{ label: s.pages.benefits.label }]}
        visual={<Mockup kind="reports" />}
        actions={
          <>
            <ButtonLink to={PATHS.contact}>{t.hero.cta}</ButtonLink>
            <ButtonLink to={PATHS.howItWorks} variant="outline" arrow={false}>
              {t.hero.secondary}
            </ButtonLink>
          </>
        }
      />

      <section aria-label={t.hero.badge} className="bg-light-gray py-14 sm:py-16">
        <div className="section-container grid md:grid-cols-3 gap-6">
          {t.pillars.map((p, i) => {
            const Icon = PILLAR_ICONS[i]
            return (
              <div key={p.title} data-reveal data-reveal-delay={String(i * 0.1)} className="bg-white rounded-2xl border border-border-custom p-7 shadow-card">
                <span className="w-12 h-12 rounded-xl bg-wellness-light flex items-center justify-center">
                  <Icon className="w-6 h-6 text-wellness" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h2 className="font-sora font-semibold text-lg text-deep-blue mt-5">{p.title}</h2>
                <p className="font-inter text-sm text-text-secondary leading-relaxed mt-2">{p.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="modules-heading" className="bg-white py-16 sm:py-20 lg:py-[120px]">
        <div className="section-container">
          <SectionHeading id="modules-heading" badge={t.modulesHeading.badge} title={t.modulesHeading.title} subtitle={t.modulesHeading.subtitle} />
          <div className="flex flex-col gap-20 lg:gap-28">
            {t.modules.map((m, i) => (
              <FeatureRow
                key={m.key}
                id={`modulo-${m.key}`}
                badge={m.badge}
                title={m.title}
                description={m.description}
                bullets={m.bullets}
                reverse={i % 2 === 1}
                visual={<Mockup kind={m.key} />}
                footer={
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status="available" />
                    {m.note && (
                      <span className="inline-flex items-center gap-1.5 font-inter text-xs text-amber-700">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {m.note}
                      </span>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="roles-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="roles-heading" badge={t.roles.badge} title={t.roles.title} />
          <div className="grid md:grid-cols-3 gap-6">
            {t.roles.items.map((r, i) => {
              const Icon = ROLE_ICONS[i]
              return (
                <div key={r.role} data-reveal data-reveal-delay={String(i * 0.1)} className="bg-white rounded-2xl border border-border-custom p-7 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-full gradient-cta flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <h3 className="font-sora font-semibold text-lg text-deep-blue">{r.role}</h3>
                  </div>
                  <ul className="mt-5 flex flex-col gap-3">
                    {r.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-wellness mt-0.5 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                        <span className="font-inter text-sm text-text-primary leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="comparison-heading" className="bg-white py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container max-w-[960px]">
          <SectionHeading id="comparison-heading" badge={t.comparison.badge} title={t.comparison.title} />
          <div data-reveal className="hidden sm:block rounded-2xl border border-border-custom shadow-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-light-gray">
                <tr>
                  {t.comparison.columns.map((col, i) => (
                    <th key={col} scope="col" className={`font-sora font-semibold text-sm px-6 py-4 ${i === 2 ? 'text-wellness-dark' : 'text-text-secondary'}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {t.comparison.rows.map(([topic, before, after]) => (
                  <tr key={topic}>
                    <th scope="row" className="font-inter text-sm font-semibold text-deep-blue px-6 py-4 align-top w-[24%]">
                      {topic}
                    </th>
                    <td className="font-inter text-sm text-text-secondary px-6 py-4 align-top">
                      <span className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        {before}
                      </span>
                    </td>
                    <td className="font-inter text-sm text-text-primary px-6 py-4 align-top bg-wellness-light/30">
                      <span className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-wellness mt-0.5 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                        {after}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="sm:hidden flex flex-col gap-4">
            {t.comparison.rows.map(([topic, before, after]) => (
              <li key={topic} data-reveal className="rounded-2xl border border-border-custom shadow-card overflow-hidden">
                <div className="bg-light-gray px-5 py-3 font-sora font-semibold text-sm text-deep-blue">{topic}</div>
                <div className="px-5 py-3 flex items-start gap-2 font-inter text-sm text-text-secondary">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" aria-label={t.comparison.columns[1]} />
                  {before}
                </div>
                <div className="px-5 py-3 flex items-start gap-2 font-inter text-sm text-text-primary bg-wellness-light/30">
                  <Check className="w-4 h-4 text-wellness mt-0.5 flex-shrink-0" strokeWidth={2.5} aria-label={t.comparison.columns[2]} />
                  {after}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="soon-heading" className="bg-light-gray py-16 sm:py-20">
        <div className="section-container max-w-[960px]">
          <SectionHeading id="soon-heading" badge={t.comingSoon.badge} title={t.comingSoon.title} subtitle={t.comingSoon.subtitle} />
          <div className="grid md:grid-cols-2 gap-6">
            {t.comingSoon.items.map((item, i) => {
              const Icon = SOON_ICONS[i]
              return (
                <div key={item.title} data-reveal data-reveal-delay={String(i * 0.1)} className="bg-white rounded-2xl border border-dashed border-amber-300 p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-amber-600" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <StatusBadge status="comingSoon" />
                  </div>
                  <h3 className="font-sora font-semibold text-lg text-deep-blue mt-5">{item.title}</h3>
                  <p className="font-inter text-sm text-text-secondary leading-relaxed mt-2">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Testimonials className="bg-white" />
      <CTABand />
      <CrossLinks pages={['howItWorks', 'solutions', 'faq']} />
    </div>
  )
}
