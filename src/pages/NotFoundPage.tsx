import { useSite } from '../i18n/useContent'
import { PATHS } from '../site/routes'
import { ButtonLink } from '../components/site/Buttons'

export default function NotFoundPage() {
  const s = useSite()
  return (
    <section aria-labelledby="not-found-heading" className="min-h-[70vh] flex items-center pt-[72px]">
      <div className="section-container text-center py-20">
        <p className="font-sora font-bold text-[72px] leading-none gradient-cta-text">404</p>
        <h1 id="not-found-heading" className="font-sora font-semibold text-[28px] sm:text-[32px] text-deep-blue mt-4">
          {s.notFound.title}
        </h1>
        <p className="font-inter text-base text-text-secondary mt-3 max-w-[420px] mx-auto">{s.notFound.text}</p>
        <div className="mt-8">
          <ButtonLink to={PATHS.home}>{s.notFound.cta}</ButtonLink>
        </div>
      </div>
    </section>
  )
}
