import type { ReactNode } from 'react'
import Breadcrumbs, { type Crumb } from './Breadcrumbs'

type Props = {
  id: string
  badge: string
  title: string
  subtitle: string
  breadcrumbs: Crumb[]
  actions?: ReactNode
  visual?: ReactNode
}

/** Top section shared by every inner page. Mirrors the home hero styling. */
export default function PageHero({ id, badge, title, subtitle, breadcrumbs, actions, visual }: Props) {
  return (
    <section
      aria-labelledby={id}
      className="relative pt-[112px] pb-16 sm:pb-20 lg:pb-24 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(34,197,94,0.08) 0%, transparent 60%)' }}
    >
      <div className="section-container">
        <Breadcrumbs items={breadcrumbs} />
        <div className={`grid gap-12 items-center ${visual ? 'lg:grid-cols-[55%_45%]' : ''}`}>
          <div className={visual ? '' : 'max-w-[760px]'}>
            <span data-reveal className="inline-block font-inter text-xs font-semibold tracking-[0.08em] uppercase text-wellness mb-4">
              {badge}
            </span>
            <h1
              id={id}
              data-reveal
              className="font-sora font-bold text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.12] tracking-[-0.02em] text-deep-blue text-balance"
            >
              {title}
            </h1>
            <p data-reveal data-reveal-delay="0.1" className="font-inter text-base sm:text-lg text-text-secondary mt-5 max-w-[560px] leading-relaxed">
              {subtitle}
            </p>
            {actions && (
              <div data-reveal data-reveal-delay="0.2" className="mt-8 flex flex-col sm:flex-row gap-3">
                {actions}
              </div>
            )}
          </div>
          {visual && (
            <div data-reveal data-reveal-delay="0.2" className="flex justify-center lg:justify-end">
              {visual}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
