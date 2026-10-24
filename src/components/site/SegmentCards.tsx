import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useContent } from '../../i18n/useContent'
import { solutionsContent } from '../../i18n/pages/solutions'
import { segmentPath, type SegmentSlug } from '../../site/routes'
import { SEGMENT_ICONS } from './segmentIcons'

/** Grid of solution cards, optionally excluding the current segment. */
export default function SegmentCards({ exclude, compact = false }: { exclude?: SegmentSlug; compact?: boolean }) {
  const t = useContent(solutionsContent)
  const segments = t.segments.filter((seg) => seg.slug !== exclude)
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {segments.map((seg, i) => {
        const Icon = SEGMENT_ICONS[seg.slug]
        return (
          <Link
            key={seg.slug}
            to={segmentPath(seg.slug)}
            data-reveal
            data-reveal-delay={String((i % 3) * 0.08)}
            className="group bg-white rounded-2xl border border-border-custom p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <span className="w-12 h-12 rounded-xl bg-wellness-light flex items-center justify-center">
              <Icon className="w-6 h-6 text-wellness" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3 className="font-sora font-semibold text-lg text-deep-blue mt-5">{seg.name}</h3>
            {!compact && <p className="font-inter text-xs text-text-light mt-1">{seg.examples}</p>}
            <p className="font-inter text-sm text-text-secondary leading-relaxed mt-3 flex-1">{seg.short}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 font-inter text-sm font-semibold text-wellness">
              {t.index.viewSolution}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </span>
          </Link>
        )
      })}
    </div>
  )
}
