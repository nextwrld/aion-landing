import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useSite } from '../../i18n/useContent'
import { PATHS } from '../../site/routes'

export type Crumb = { label: string; to?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const s = useSite()
  const all: Crumb[] = [{ label: s.pages.home.label, to: PATHS.home }, ...items]
  return (
    <nav aria-label={s.breadcrumbs.ariaLabel} className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 font-inter text-xs text-text-secondary">
        {all.map((item, i) => {
          const last = i === all.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link to={item.to} className="hover:text-wellness transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'text-deep-blue font-medium' : ''}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="w-3.5 h-3.5 text-text-light" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
