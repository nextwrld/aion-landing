import Logo from '../components/Logo';
import { useI18n } from '../i18n/I18nProvider';

export default function Footer() {
  const { c } = useI18n()

  return (
    <footer className="bg-deep-blue py-16">
      <div className="section-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          <div>
            <Logo variant="light" />
            <p className="font-inter text-sm text-[#64748B] mt-4 leading-relaxed max-w-[280px]">{c.footer.description}</p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-[#64748B] hover:text-white transition-colors duration-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="5" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="text-[#64748B] hover:text-white transition-colors duration-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className="text-[#64748B] hover:text-white transition-colors duration-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-sora font-semibold text-sm text-white mb-4">{c.footer.productTitle}</h4>
            <ul className="flex flex-col gap-3">
              {c.footer.productLinks.map((link) => (
                <li key={link}>
                  <span className="font-inter text-sm text-[#94A3B8] hover:text-white transition-colors duration-200 cursor-default">{link}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sora font-semibold text-sm text-white mb-4">{c.footer.supportTitle}</h4>
            <ul className="flex flex-col gap-3">
              {c.footer.supportLinks.map((link) => (
                <li key={link}>
                  <span className="font-inter text-sm text-[#94A3B8] hover:text-white transition-colors duration-200 cursor-default">{link}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter text-sm text-[#64748B]">{c.footer.rights}</p>
          <p className="font-inter text-sm text-[#64748B]">{c.footer.version}</p>
        </div>
      </div>
    </footer>
  );
}
