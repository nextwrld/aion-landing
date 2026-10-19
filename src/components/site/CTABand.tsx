import { useSite } from '../../i18n/useContent'
import { CONTACT, whatsappUrl } from '../../site/contact'
import { PATHS } from '../../site/routes'
import { ButtonLink } from './Buttons'
import { WhatsAppIcon } from './BrandIcons'

/** Closing conversion band used at the bottom of every inner page. */
export default function CTABand() {
  const s = useSite()
  const wa = CONTACT.whatsapp[0]
  return (
    <section aria-labelledby="cta-band-heading" className="gradient-cta py-16 sm:py-20">
      <div data-reveal className="section-container text-center">
        <h2 id="cta-band-heading" className="font-sora font-semibold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.25] tracking-[-0.01em] text-white text-balance max-w-[720px] mx-auto">
          {s.ctaBand.title}
        </h2>
        <p className="font-inter text-base text-white/85 mt-4 max-w-[560px] mx-auto leading-relaxed">{s.ctaBand.subtitle}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <ButtonLink to={PATHS.contact} variant="white">
            {s.ctaBand.primary}
          </ButtonLink>
          <a
            href={whatsappUrl(wa.number, s.contactChannels.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-inter text-[15px] font-semibold px-7 py-3.5 rounded-[10px] border-[1.5px] border-white/70 text-white hover:bg-white/10 hover:border-white transition-all duration-200"
          >
            <WhatsAppIcon className="w-5 h-5" />
            {s.ctaBand.secondary}
          </a>
        </div>
      </div>
    </section>
  )
}
