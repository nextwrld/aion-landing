import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nProvider";

export default function Navbar() {
  const { c } = useI18n();
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { threshold: 0.3 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-300 ${
          scrolled
            ? "bg-white border-b border-border-custom shadow-sm"
            : "bg-white md:bg-transparent"
        }`}
        style={{ height: 72 }}
      >
        <div className="section-container h-full flex items-center justify-between relative">
          <Logo variant="dark" className="min-w-0 pr-3 md:pr-16 max-w-full" />

          <div className="hidden md:flex items-center gap-8">
            {c.navbar.links.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={`relative font-inter text-sm font-medium transition-colors duration-200 hover:text-wellness ${
                  activeSection === link.href
                    ? "text-wellness"
                    : "text-text-secondary"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-wellness transition-transform duration-250 origin-left ${
                    activeSection === link.href
                      ? "scale-x-100 w-full"
                      : "scale-x-0 w-full"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => scrollTo("#demo")}
              className="font-inter text-sm font-medium text-text-secondary hover:text-wellness transition-colors"
            ></button>
            <button
              onClick={() => scrollTo("#demo")}
              className="gradient-cta text-white font-inter text-sm font-semibold px-5 py-2.5 rounded-[10px] shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              {c.navbar.demo}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

          <button
            className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-md bg-white shadow-md border border-border-custom flex items-center justify-center z-[130]"
            style={{ willChange: 'transform' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
          {mobileOpen ? (
            <X className="w-6 h-6 text-deep-blue" />
          ) : (
            <Menu className="w-6 h-6 text-deep-blue" />
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[140] md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-xl p-6 flex flex-col">
            <button
              className="self-end p-2 mb-6"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-6 h-6 text-deep-blue" />
            </button>
            <div className="mb-4">
              <LanguageSwitcher />
            </div>
            <div className="flex flex-col gap-4">
              {c.navbar.links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-left font-inter text-base font-medium text-text-primary hover:text-wellness transition-colors py-2"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <button
                onClick={() => scrollTo("#demo")}
                className="font-inter text-sm font-medium text-text-secondary hover:text-wellness transition-colors text-left py-2"
              >
                {c.navbar.login}
              </button>
              <button
                onClick={() => scrollTo("#demo")}
                className="gradient-cta text-white font-inter text-sm font-semibold px-5 py-3 rounded-[10px] shadow-btn flex items-center justify-center gap-2"
              >
                {c.navbar.demo}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
