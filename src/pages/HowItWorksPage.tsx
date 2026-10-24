import { CalendarCheck, Settings, UserPlus, GraduationCap, Rocket, Monitor, Cloud, Users, Globe } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useContent, useSite } from '../i18n/useContent'
import { howItWorksContent } from '../i18n/pages/howItWorks'
import { PATHS } from '../site/routes'
import PageHero from '../components/site/PageHero'
import SectionHeading from '../components/site/SectionHeading'
import FeatureRow from '../components/site/FeatureRow'
import Mockup from '../components/site/Mockups'
import FaqAccordion from '../components/site/FaqAccordion'
import { ButtonLink } from '../components/site/Buttons'
import CTABand from '../components/site/CTABand'
import CrossLinks from '../components/site/CrossLinks'

const ONBOARDING_ICONS = [CalendarCheck, Settings, UserPlus, GraduationCap, Rocket]
const REQUIREMENT_ICONS = [Monitor, Cloud, Users, Globe]

export default function HowItWorksPage() {
  const t = useContent(howItWorksContent)
  const s = useSite()
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref}>
      <PageHero
        id="how-page-heading"
        badge={t.hero.badge}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        breadcrumbs={[{ label: s.pages.howItWorks.label }]}
        visual={<Mockup kind="access" />}
        actions={
          <>
            <ButtonLink to={PATHS.contact}>{t.hero.cta}</ButtonLink>
            <ButtonLink to={PATHS.faq} variant="outline" arrow={false}>
              {t.hero.secondary}
            </ButtonLink>
          </>
        }
      />

      <section aria-labelledby="onboarding-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="onboarding-heading" badge={t.onboarding.badge} title={t.onboarding.title} subtitle={t.onboarding.subtitle} />
          <div className="relative">
          <div className="hidden lg:block absolute top-7 left-[10%] right-[10%] h-0.5 bg-border-custom" aria-hidden="true" />
          <ol className="relative grid gap-6 lg:grid-cols-5">
            {t.onboarding.steps.map((step, i) => {
              const Icon = ONBOARDING_ICONS[i]
              return (
                <li key={step.title} data-reveal data-reveal-delay={String(i * 0.08)} className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:text-center">
                  <span className="relative z-10 w-14 h-14 rounded-full bg-white border-2 border-wellness flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-5 h-5 text-wellness" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="font-inter text-xs font-semibold tracking-[0.08em] text-wellness">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="font-sora font-semibold text-base text-deep-blue mt-1">{step.title}</h3>
                    <p className="font-inter text-sm text-text-secondary leading-relaxed mt-1.5 lg:max-w-[200px] lg:mx-auto">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="flow-heading" className="bg-white py-16 sm:py-20 lg:py-[120px]">
        <div className="section-container">
          <SectionHeading id="flow-heading" badge={t.flow.badge} title={t.flow.title} subtitle={t.flow.subtitle} />
          <div className="flex flex-col gap-20 lg:gap-28">
            {t.flow.steps.map((step, i) => (
              <FeatureRow
                key={step.title}
                id={`paso-${i + 1}`}
                badge={`${t.flow.stepLabel} ${i + 1}`}
                title={step.title}
                description={step.description}
                bullets={step.bullets}
                reverse={i % 2 === 1}
                visual={<Mockup kind={step.mock} />}
              />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="requirements-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="requirements-heading" badge={t.requirements.badge} title={t.requirements.title} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.requirements.items.map((item, i) => {
              const Icon = REQUIREMENT_ICONS[i]
              return (
                <div key={item.title} data-reveal data-reveal-delay={String(i * 0.08)} className="bg-white rounded-2xl border border-border-custom p-6 shadow-card">
                  <span className="w-12 h-12 rounded-xl bg-wellness-light flex items-center justify-center">
                    <Icon className="w-6 h-6 text-wellness" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="font-sora font-semibold text-base text-deep-blue mt-5">{item.title}</h3>
                  <p className="font-inter text-sm text-text-secondary leading-relaxed mt-2">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="how-faq-heading" className="bg-white py-16 sm:py-20">
        <div className="section-container max-w-[800px]">
          <SectionHeading id="how-faq-heading" title={t.faq.title} />
          <div data-reveal>
            <FaqAccordion items={t.faq.items} />
          </div>
        </div>
      </section>

      <CTABand />
      <CrossLinks pages={['benefits', 'faq', 'contact']} />
    </div>
  )
}
