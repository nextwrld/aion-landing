import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../Navbar'
import Footer from '../../sections/Footer'
import BackToTop from '../BackToTop'
import { useI18n } from '../../i18n/I18nProvider'
import { getLenis } from '../../hooks/useLenis'
import { absoluteUrl, getPageMeta } from '../../site/seo'

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/** Shared chrome for every route: navbar, footer, scroll reset and per-page meta. */
export default function Layout() {
  const { pathname, hash } = useLocation()
  const { lang } = useI18n()

  // Reset scroll on page change, or scroll to the anchor when the URL has
  // a hash (e.g. /beneficios#modulo-access), then let GSAP recompute
  // trigger positions for the new layout.
  useEffect(() => {
    const lenis = getLenis()
    let anchorTimer: number | undefined
    if (hash) {
      anchorTimer = window.setTimeout(() => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (!el) return
        if (lenis) lenis.scrollTo(el, { offset: -96 })
        else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    } else if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => {
      window.clearTimeout(anchorTimer)
      window.clearTimeout(refreshTimer)
    }
  }, [pathname, hash])

  useEffect(() => {
    const meta = getPageMeta(pathname, lang)
    document.title = meta.title
    setMeta('meta[name="description"]', 'content', meta.description)
    setMeta('meta[property="og:title"]', 'content', meta.title)
    setMeta('meta[property="og:description"]', 'content', meta.description)
    setMeta('meta[property="og:url"]', 'content', absoluteUrl(meta.path))
    setMeta('link[rel="canonical"]', 'href', absoluteUrl(meta.path))
  }, [pathname, lang])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
