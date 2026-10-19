import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useSite } from '../../i18n/useContent'
import { PATHS, type PageKey } from '../../site/routes'

/** "Keep exploring" cards linking to other pages of the site. */
export default function CrossLinks({ pages }: { pages: PageKey[] }) {
  const s = useSite()
  return (
    <section aria-labelledby="crosslinks-heading" className="bg-white py-16 sm:py-20">
      <div className="section-container">
        <h2 id="crosslinks-heading" data-reveal className="font-sora font-semibold text-2xl text-deep-blue mb-8">
          {s.crossLinks.title}
        </h2>
        <div className={`grid gap-5 sm:grid-cols-2 ${pages.length > 2 ? 'lg:grid-cols-3' : ''}`}>
          {pages.map((key, i) => (
            <Link
              key={key}
              to={PATHS[key]}
              data-reveal
              data-reveal-delay={String(i * 0.08)}
              className="group bg-light-gray rounded-2xl border border-border-custom p-6 hover:bg-white hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <span className="font-sora font-semibold text-lg text-deep-blue">{s.pages[key].label}</span>
              <span className="font-inter text-sm text-text-secondary mt-2 leading-relaxed flex-1">{s.pages[key].description}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 font-inter text-sm font-semibold text-wellness">
                {s.crossLinks.more}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
