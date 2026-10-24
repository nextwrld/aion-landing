import { useParams } from 'react-router'
import { AlertTriangle, Check, Clock } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useI18n } from '../i18n/I18nProvider'
import { useContent, useSite } from '../i18n/useContent'
import { getSegment, solutionsContent } from '../i18n/pages/solutions'
import { PATHS, isSegmentSlug, type SegmentSlug } from '../site/routes'
import PageHero from '../components/site/PageHero'
import SectionHeading from '../components/site/SectionHeading'
import SegmentCards from '../components/site/SegmentCards'
import ModuleCards from '../components/site/ModuleCards'
import Mockup from '../components/site/Mockups'
import FaqAccordion from '../components/site/FaqAccordion'
import { ButtonLink } from '../components/site/Buttons'
import Testimonials from '../components/site/Testimonials'
import CTABand from '../components/site/CTABand'
import NotFoundPage from './NotFoundPage'

function Segment({ slug }: { slug: SegmentSlug }) {
  const { lang } = useI18n()
  const labels = useContent(solutionsContent).segmentLabels
  const s = useSite()
  const seg = getSegment(lang, slug)
  const ref = useReveal<HTMLDivElement>([slug])

  return (
    <div ref={ref}>
      <PageHero
        id="segment-heading"
        badge={seg.hero.badge}
        title={seg.hero.title}
        subtitle={seg.hero.subtitle}
        breadcrumbs={[{ label: s.pages.solutions.label, to: PATHS.solutions }, { label: seg.name }]}
        visual={<Mockup kind={seg.modules[0]} />}
        actions={
          <>
            <ButtonLink to={PATHS.contact}>{labels.cta}</ButtonLink>
            <ButtonLink to={PATHS.benefits} variant="outline" arrow={false}>
              {labels.secondary}
            </ButtonLink>
          </>
        }
      />

      <section aria-labelledby="pains-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="pains-heading" title={labels.pains} />
          <div className="grid md:grid-cols-3 gap-6">
            {seg.pains.map((p, i) => (
              <div key={p.title} data-reveal data-reveal-delay={String(i * 0.1)} className="bg-white rounded-2xl border border-border-custom p-7 shadow-card">
                <span className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="font-sora font-semibold text-lg text-deep-blue mt-5">{p.title}</h3>
                <p className="font-inter text-sm text-text-secondary leading-relaxed mt-2">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="uses-heading" className="bg-white py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="uses-heading" title={labels.uses} />
          <div className="grid sm:grid-cols-2 gap-6">
            {seg.uses.map((u, i) => (
              <div key={u.title} data-reveal data-reveal-delay={String((i % 2) * 0.1)} className="flex gap-4 rounded-2xl border border-border-custom p-6 bg-wellness-light/30">
                <span className="w-9 h-9 rounded-full gradient-cta flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-sora font-semibold text-base text-deep-blue">{u.title}</h3>
                  <p className="font-inter text-sm text-text-secondary leading-relaxed mt-1.5">{u.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="segment-modules-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="segment-modules-heading" title={labels.modules} />
          <ModuleCards keys={seg.modules} />
          {seg.note && (
            <p data-reveal className="mt-8 flex items-center justify-center gap-2 font-inter text-sm text-amber-700 text-center">
              <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {seg.note}
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="segment-faq-heading" className="bg-white py-16 sm:py-20">
        <div className="section-container max-w-[800px]">
          <SectionHeading id="segment-faq-heading" title={labels.faq} />
          <div data-reveal>
            <FaqAccordion key={slug} items={seg.faq} />
          </div>
        </div>
      </section>

      <Testimonials limit={2} />
      <CTABand />

      <section aria-labelledby="other-segments-heading" className="bg-white py-16 sm:py-20">
        <div className="section-container">
          <h2 id="other-segments-heading" data-reveal className="font-sora font-semibold text-2xl text-deep-blue mb-8">
            {labels.otherSegments}
          </h2>
          <SegmentCards exclude={slug} compact />
        </div>
      </section>
    </div>
  )
}

export default function SegmentPage() {
  const { slug } = useParams()
  if (!isSegmentSlug(slug)) return <NotFoundPage />
  return <Segment key={slug} slug={slug} />
}
