import { Link } from 'react-router'
import { CreditCard, IdCard, Users, BarChart3, Building2, ArrowRight } from 'lucide-react'
import { useContent } from '../../i18n/useContent'
import { benefitsContent, type ModuleKey } from '../../i18n/pages/benefits'
import { PATHS } from '../../site/routes'

const MODULE_ICONS: Record<ModuleKey, typeof CreditCard> = {
  billing: CreditCard,
  access: IdCard,
  memberships: Users,
  reports: BarChart3,
  branches: Building2,
}

/** Compact cards for product modules, each linking to its block on the Benefits page. */
export default function ModuleCards({ keys }: { keys?: ModuleKey[] }) {
  const t = useContent(benefitsContent)
  const modules = keys ? keys.map((k) => t.modules.find((m) => m.key === k)!).filter(Boolean) : t.modules
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {modules.map((m, i) => {
        const Icon = MODULE_ICONS[m.key]
        return (
          <Link
            key={m.key}
            to={`${PATHS.benefits}#modulo-${m.key}`}
            data-reveal
            data-reveal-delay={String((i % 3) * 0.08)}
            className="group bg-white rounded-2xl border border-border-custom p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg gradient-cta flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="font-inter text-xs font-semibold tracking-[0.06em] uppercase text-wellness">{m.badge}</span>
            </div>
            <h3 className="font-sora font-semibold text-base text-deep-blue mt-4 leading-snug">{m.title}</h3>
            <ArrowRight className="w-4 h-4 text-wellness mt-3 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        )
      })}
    </div>
  )
}
