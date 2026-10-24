import { Link } from 'react-router'
import Logo from '../components/Logo'
import { useSite, useContent } from '../i18n/useContent'
import { solutionsContent } from '../i18n/pages/solutions'
import { CONTACT, whatsappUrl } from '../site/contact'
import { PATHS, segmentPath, type PageKey } from '../site/routes'
import { InstagramIcon, WhatsAppIcon } from '../components/site/BrandIcons'

const PRODUCT_LINKS: PageKey[] = ['problems', 'benefits', 'howItWorks', 'faq']

const linkCls = 'font-inter text-sm text-[#94A3B8] hover:text-white transition-colors duration-200'

export default function Footer() {
  const s = useSite()
  const solutions = useContent(solutionsContent)

  return (
    <footer className="bg-deep-blue py-16">
      <div className="section-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] gap-10 lg:gap-12">
          <div>
            <Logo variant="light" />
            <p className="font-inter text-sm text-[#64748B] mt-4 leading-relaxed max-w-[280px]">{s.footer.description}</p>
            <div className="flex items-center gap-4 mt-6">
              <a href={CONTACT.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.contactChannels.instagramLabel} ${CONTACT.instagram.handle}`} className="text-[#64748B] hover:text-white transition-colors duration-200">
                <InstagramIcon className="w-[18px] h-[18px]" />
              </a>
              <a href={whatsappUrl(CONTACT.whatsapp[0].number, s.contactChannels.whatsappMessage)} target="_blank" rel="noopener noreferrer" aria-label={s.contactChannels.whatsappLabel} className="text-[#64748B] hover:text-white transition-colors duration-200">
                <WhatsAppIcon className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>

          <div>
            <h2 className="font-sora font-semibold text-sm text-white mb-4">{s.footer.productTitle}</h2>
            <ul className="flex flex-col gap-3">
              {PRODUCT_LINKS.map((key) => (
                <li key={key}>
                  <Link to={PATHS[key]} className={linkCls}>{s.pages[key].label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-sora font-semibold text-sm text-white mb-4">{s.footer.solutionsTitle}</h2>
            <ul className="flex flex-col gap-3">
              {solutions.segments.map((seg) => (
                <li key={seg.slug}>
                  <Link to={segmentPath(seg.slug)} className={linkCls}>{seg.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-sora font-semibold text-sm text-white mb-4">{s.footer.contactTitle}</h2>
            <ul className="flex flex-col gap-3">
              {CONTACT.whatsapp.map((wa) => (
                <li key={wa.number}>
                  <a href={whatsappUrl(wa.number, s.contactChannels.whatsappMessage)} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    {s.contactChannels.whatsappLabel} {s.contactChannels.countries[wa.country]}: {wa.display}
                  </a>
                </li>
              ))}
              <li>
                <a href={CONTACT.instagram.url} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {s.contactChannels.instagramLabel}: {CONTACT.instagram.handle}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className={linkCls}>{CONTACT.email}</a>
              </li>
              <li>
                <Link to={PATHS.contact} className={linkCls}>{s.pages.contact.label}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter text-sm text-[#64748B]">{s.footer.rights}</p>
          <p className="font-inter text-sm text-[#64748B]">{s.footer.version}</p>
        </div>
      </div>
    </footer>
  )
}
