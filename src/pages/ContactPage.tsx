import { Mail, Send, PhoneCall, PlayCircle } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useContent, useSite } from '../i18n/useContent'
import { contactContent } from '../i18n/pages/contact'
import { CONTACT, whatsappUrl } from '../site/contact'
import PageHero from '../components/site/PageHero'
import SectionHeading from '../components/site/SectionHeading'
import { InstagramIcon, WhatsAppIcon } from '../components/site/BrandIcons'
import LeadFormSection from '../sections/LeadFormSection'
import CrossLinks from '../components/site/CrossLinks'

const STEP_ICONS = [Send, PhoneCall, PlayCircle]

export default function ContactPage() {
  const t = useContent(contactContent)
  const s = useSite()
  const ref = useReveal<HTMLDivElement>()
  const message = s.contactChannels.whatsappMessage

  const channels = [
    ...CONTACT.whatsapp.map((wa) => ({
      key: wa.number,
      icon: <WhatsAppIcon className="w-6 h-6" />,
      label: `${s.contactChannels.whatsappLabel} ${s.contactChannels.countries[wa.country]}`,
      value: wa.display,
      href: whatsappUrl(wa.number, message),
      cta: t.channels.whatsappCta,
      external: true,
    })),
    {
      key: 'instagram',
      icon: <InstagramIcon className="w-6 h-6" />,
      label: s.contactChannels.instagramLabel,
      value: CONTACT.instagram.handle,
      href: CONTACT.instagram.url,
      cta: t.channels.instagramCta,
      external: true,
    },
    {
      key: 'email',
      icon: <Mail className="w-6 h-6" strokeWidth={1.75} />,
      label: s.contactChannels.emailLabel,
      value: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      cta: t.channels.emailCta,
      external: false,
    },
  ]

  return (
    <div ref={ref}>
      <PageHero
        id="contact-page-heading"
        badge={t.hero.badge}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        breadcrumbs={[{ label: s.pages.contact.label }]}
        actions={
          <>
            {CONTACT.whatsapp.map((wa) => (
              <a
                key={wa.number}
                href={whatsappUrl(wa.number, message)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-inter text-[15px] font-semibold px-6 py-3.5 rounded-[10px] border-[1.5px] border-wellness text-wellness hover:bg-wellness-light transition-all duration-200"
              >
                <WhatsAppIcon className="w-5 h-5" />
                {s.contactChannels.whatsappLabel} {s.contactChannels.countries[wa.country]}
              </a>
            ))}
          </>
        }
      />

      <LeadFormSection />

      <section aria-labelledby="channels-heading" className="bg-white py-16 sm:py-20 lg:py-[100px]">
        <div className="section-container">
          <SectionHeading id="channels-heading" badge={t.channels.badge} title={t.channels.title} subtitle={t.channels.subtitle} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {channels.map((ch, i) => (
              <a
                key={ch.key}
                href={ch.href}
                {...(ch.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                data-reveal
                data-reveal-delay={String(i * 0.08)}
                className="group bg-white rounded-2xl border border-border-custom p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <span className="w-12 h-12 rounded-xl bg-wellness-light text-wellness flex items-center justify-center">{ch.icon}</span>
                <span className="font-inter text-xs font-semibold uppercase tracking-[0.06em] text-text-light mt-5">{ch.label}</span>
                <span className="font-sora font-semibold text-base text-deep-blue mt-1 break-all">{ch.value}</span>
                <span className="mt-4 font-inter text-sm font-semibold text-wellness group-hover:text-wellness-dark">{ch.cta} →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="next-steps-heading" className="bg-light-gray py-16 sm:py-20">
        <div className="section-container max-w-[960px]">
          <SectionHeading id="next-steps-heading" badge={t.nextSteps.badge} title={t.nextSteps.title} />
          <ol className="grid md:grid-cols-3 gap-6">
            {t.nextSteps.steps.map((step, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <li key={step.title} data-reveal data-reveal-delay={String(i * 0.1)} className="bg-white rounded-2xl border border-border-custom p-6 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full gradient-cta flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="font-inter text-xs font-semibold tracking-[0.08em] text-wellness">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-sora font-semibold text-base text-deep-blue mt-4">{step.title}</h3>
                  <p className="font-inter text-sm text-text-secondary leading-relaxed mt-1.5">{step.description}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <CrossLinks pages={['solutions', 'faq', 'howItWorks']} />
    </div>
  )
}
