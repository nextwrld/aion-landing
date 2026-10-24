import { Route, Routes } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LenisProvider } from './hooks/useLenis'
import { I18nProvider } from './i18n/I18nProvider'
import Layout from './components/site/Layout'
import Home from './pages/Home'
import ProblemsPage from './pages/ProblemsPage'
import BenefitsPage from './pages/BenefitsPage'
import HowItWorksPage from './pages/HowItWorksPage'
import FaqPage from './pages/FaqPage'
import SolutionsPage from './pages/SolutionsPage'
import SegmentPage from './pages/SegmentPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import { PATHS } from './site/routes'

gsap.registerPlugin(ScrollTrigger)

/** Router-agnostic app: wrap in BrowserRouter (client) or StaticRouter (prerender). */
function App() {
  return (
    <I18nProvider>
      <LenisProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path={PATHS.problems} element={<ProblemsPage />} />
            <Route path={PATHS.benefits} element={<BenefitsPage />} />
            <Route path={PATHS.howItWorks} element={<HowItWorksPage />} />
            <Route path={PATHS.faq} element={<FaqPage />} />
            <Route path={PATHS.solutions} element={<SolutionsPage />} />
            <Route path={`${PATHS.solutions}/:slug`} element={<SegmentPage />} />
            <Route path={PATHS.contact} element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </LenisProvider>
    </I18nProvider>
  )
}

export default App
