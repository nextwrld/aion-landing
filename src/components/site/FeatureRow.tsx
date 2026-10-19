import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

type Props = {
  id?: string
  badge?: string
  title: string
  description: string
  bullets: string[]
  visual: ReactNode
  reverse?: boolean
  footer?: ReactNode
}

/** Alternating text/visual block, the main building block of inner pages. */
export default function FeatureRow({ id, badge, title, description, bullets, visual, reverse = false, footer }: Props) {
  return (
    <div id={id} className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center scroll-mt-28">
      <div data-reveal className={reverse ? 'lg:order-2' : ''}>
        {badge && <span className="font-inter text-xs font-semibold tracking-[0.08em] uppercase text-wellness">{badge}</span>}
        <h3 className="font-sora font-semibold text-2xl sm:text-[28px] leading-[1.25] tracking-[-0.01em] text-deep-blue mt-3 text-balance">{title}</h3>
        <p className="font-inter text-base text-text-secondary mt-4 leading-relaxed max-w-[520px]">{description}</p>
        <ul className="mt-6 flex flex-col gap-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="w-5 h-5 mt-0.5 rounded-full bg-wellness-light flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-wellness" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="font-inter text-sm text-text-primary leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
      <div data-reveal data-reveal-delay="0.1" className={reverse ? 'lg:order-1' : ''}>
        {visual}
      </div>
    </div>
  )
}
