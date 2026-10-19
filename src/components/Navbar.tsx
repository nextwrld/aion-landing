import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import { useSite, useContent } from '../i18n/useContent'
import { solutionsContent } from '../i18n/pages/solutions'
import { PATHS, segmentPath, type PageKey } from '../site/routes'

const LINKS: PageKey[] = ['problems', 'benefits', 'howItWorks', 'faq', 'contact']

const linkClass = (active: boolean) =>
  `relative font-inter text-sm font-medium transition-colors duration-200 hover:text-wellness ${active ? 'text-wellness' : 'text-text-secondary'}`

export default function Navbar() {
  const s = useSite()
  const solutions = useContent(solutionsContent)
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setMobileOpen(false)
    setSolutionsOpen(false)
  }

  useEffect(() => {
    if (!solutionsOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSolutionsOpen(false)
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setSolutionsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [solutionsOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const openSolutions = () => {
    window.clearTimeout(closeTimer.current)
    setSolutionsOpen(true)
  }
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setSolutionsOpen(false), 150)
  }

  const solutionsActive = pathname.startsWith(PATHS.solutions)

  return (
    <header className="fixed top-0 left-0 right-0 z-[120]">
      <nav
        aria-label={s.nav.ariaLabel}
        className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-300 ${
          scrolled || mobileOpen ? 'bg-white border-b border-border-custom shadow-sm' : 'bg-white xl:bg-transparent'
        }`}
        style={{ height: 72 }}
      >
        <div className="section-container h-full flex items-center justify-between relative">
          <Link to={PATHS.home} className="min-w-0 pr-14 xl:pr-6 max-w-full" aria-label={s.nav.homeAria}>
            <Logo variant="dark" className="min-w-0" />
          </Link>

          <div className="hidden xl:flex items-center gap-7">
            <div ref={dropdownRef} className="relative" onMouseEnter={openSolutions} onMouseLeave={scheduleClose}>
              <button
                type="button"
                className={`${linkClass(solutionsActive)} inline-flex items-center gap-1`}
                aria-expanded={solutionsOpen}
                aria-controls="solutions-menu"
                onClick={() => setSolutionsOpen((v) => !v)}
              >
                {s.pages.solutions.label}
                <ChevronDown className={`w-4 h-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {solutionsOpen && (
                <div id="solutions-menu" className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[560px]">
                  <div className="bg-white rounded-2xl border border-border-custom shadow-floating p-3">
                    <p className="px-3 pt-2 pb-3 font-inter text-xs font-semibold tracking-[0.08em] uppercase text-text-light">
                      {s.nav.solutionsMenu}
                    </p>
                    <ul className="grid grid-cols-2 gap-1">
                      {solutions.segments.map((seg) => (
                        <li key={seg.slug}>
                          <NavLink
                            to={segmentPath(seg.slug)}
                            className={({ isActive }) =>
                              `block rounded-xl px-3 py-2.5 transition-colors hover:bg-light-gray ${isActive ? 'bg-wellness-light' : ''}`
                            }
                          >
                            <span className="block font-sora font-semibold text-sm text-deep-blue">{seg.name}</span>
                            <span className="block font-inter text-xs text-text-secondary mt-0.5 leading-snug">{seg.examples}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={PATHS.solutions}
                      className="mt-2 flex items-center justify-between rounded-xl px-3 py-2.5 bg-light-gray font-inter text-sm font-semibold text-wellness hover:bg-wellness-light transition-colors"
                    >
                      {s.nav.allSolutions}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {LINKS.map((key) => (
              <NavLink key={key} to={PATHS[key]} className={({ isActive }) => linkClass(isActive)}>
                {({ isActive }) => (
                  <>
                    {s.pages[key].label}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 w-full bg-wellness transition-transform duration-200 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to={PATHS.contact}
              className="gradient-cta text-white font-inter text-sm font-semibold px-5 py-2.5 rounded-[10px] shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              {s.nav.demo}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="xl:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-md bg-white shadow-md border border-border-custom flex items-center justify-center z-[130]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? s.nav.closeMenu : s.nav.openMenu}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="w-6 h-6 text-deep-blue" /> : <Menu className="w-6 h-6 text-deep-blue" />}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-[140] xl:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-0 w-[320px] max-w-[88vw] bg-white shadow-xl p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <LanguageSwitcher />
              <button type="button" className="p-2" onClick={() => setMobileOpen(false)} aria-label={s.nav.closeMenu}>
                <X className="w-6 h-6 text-deep-blue" />
              </button>
            </div>
            <nav aria-label={s.nav.mobileAriaLabel} className="flex flex-col">
              <NavLink to={PATHS.solutions} end className={({ isActive }) => `font-inter text-base font-semibold py-2 ${isActive ? 'text-wellness' : 'text-deep-blue'}`}>
                {s.pages.solutions.label}
              </NavLink>
              <ul className="ml-3 pl-3 border-l border-border-custom mb-2">
                {solutions.segments.map((seg) => (
                  <li key={seg.slug}>
                    <NavLink
                      to={segmentPath(seg.slug)}
                      className={({ isActive }) => `block font-inter text-sm py-1.5 ${isActive ? 'text-wellness font-medium' : 'text-text-secondary'}`}
                    >
                      {seg.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
              {LINKS.map((key) => (
                <NavLink
                  key={key}
                  to={PATHS[key]}
                  className={({ isActive }) => `font-inter text-base font-medium py-2 transition-colors ${isActive ? 'text-wellness' : 'text-text-primary hover:text-wellness'}`}
                >
                  {s.pages[key].label}
                </NavLink>
              ))}
            </nav>
            <Link
              to={PATHS.contact}
              className="mt-8 gradient-cta text-white font-inter text-sm font-semibold px-5 py-3 rounded-[10px] shadow-btn flex items-center justify-center gap-2"
            >
              {s.nav.demo}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
