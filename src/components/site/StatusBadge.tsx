import { Clock, Check } from 'lucide-react'
import { useSite } from '../../i18n/useContent'

export default function StatusBadge({ status }: { status: 'available' | 'comingSoon' }) {
  const s = useSite()
  const soon = status === 'comingSoon'
  const Icon = soon ? Clock : Check
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-inter text-xs font-semibold ${
        soon ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-wellness-light text-wellness-dark'
      }`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {soon ? s.status.comingSoon : s.status.available}
    </span>
  )
}
