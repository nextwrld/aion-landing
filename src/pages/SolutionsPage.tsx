import { HelpCircle } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useContent, useSite } from '../i18n/useContent'
import { solutionsContent } from '../i18n/pages/solutions'
import { PATHS } from '../site/routes'
import PageHero from '../components/site/PageHero'
import SectionHeading from '../components/site/SectionHeading'
import SegmentCards from '../components/site/SegmentCards'
import ModuleCards from '../components/site/ModuleCards'
import { ButtonLink } from '../components/site/Buttons'
import { SEGMENT_ICONS } from '../components/site/segmentIcons'
import Testimonials from '../components/site/Testimonials'
import CTABand from '../components/site/CTABand'
import CrossLinks from '../components/site/CrossLinks'

function SegmentMosaic() {
  const t = useContent(solutionsContent)
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[420px]" aria-hidden="true">
      {t.segments.map((seg, i) => {
        const Icon = SEGMENT_ICONS[seg.slug]
        return (
          <div
            key={seg.slug}
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-3 text-center shadow-card ${
              i % 4 === 0 ? 'gradient-cta text-white' : 'bg-white border border-border-custom text-deep-blue'
            } ${i % 3 === 1 ? 'translate-y-4' : ''}`}
          >
            <Icon className={`w-7 h-7 ${i % 4 === 0 ? 'text-white' : 'text-wellness'}`} strokeWidth={1.5} />
            <span className="font-inter text-[11px] font-semibold leading-tight">{seg.tag}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function SolutionsPage() {
  const t = useContent(solutionsContent)
  const s = useSite()
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref}>
      <PageHero
        id="solutions-page-heading"
        badge={t.index.hero.badge}
        title={t.index.hero.title}
        subtitle={t.index.hero.subtitle}
        breadcrumbs={[{ label: s.pages.solutions.label }]}
        visual={<SegmentMosaic />}
        actions={<ButtonLink to={PATHS.contact}>{t.index.hero.cta}</ButtonLink>}
      />

      <section aria-labelledby="segments-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="segments-heading" badge={t.index.gridHeading.badge} title={t.index.gridHeading.title} subtitle={t.index.gridHeading.subtitle} />
          <SegmentCards />
        </div>
      </section>

      <section aria-labelledby="shared-heading" className="bg-white py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="shared-heading" badge={t.index.shared.badge} title={t.index.shared.title} subtitle={t.index.shared.subtitle} />
          <ModuleCards />
          <div data-reveal className="mt-12 rounded-2xl bg-light-gray border border-border-custom p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-wellness-light flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-wellness" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-sora font-semibold text-lg text-deep-blue">{t.index.notListed.title}</h2>
                <p className="font-inter text-sm text-text-secondary mt-1 max-w-[520px]">{t.index.notListed.text}</p>
              </div>
            </div>
            <ButtonLink to={PATHS.contact} className="flex-shrink-0">{t.index.notListed.cta}</ButtonLink>
          </div>
        </div>
      </section>

      <Testimonials />
      <CTABand />
      <CrossLinks pages={['problems', 'benefits', 'howItWorks']} />
    </div>
  )
}
