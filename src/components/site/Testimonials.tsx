import { Quote } from 'lucide-react'
import { useSite } from '../../i18n/useContent'
import SectionHeading from './SectionHeading'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function Testimonials({ limit, className = 'bg-light-gray' }: { limit?: number; className?: string }) {
  const s = useSite()
  const items = typeof limit === 'number' ? s.testimonials.items.slice(0, limit) : s.testimonials.items
  return (
    <section aria-labelledby="testimonials-heading" className={`${className} py-16 sm:py-20 lg:py-[100px]`}>
      <div className="section-container">
        <SectionHeading id="testimonials-heading" badge={s.testimonials.badge} title={s.testimonials.title} />
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((t, i) => (
            <figure
              key={t.name}
              data-reveal
              data-reveal-delay={String((i % 2) * 0.1)}
              className="bg-white rounded-2xl border border-border-custom p-7 shadow-card flex flex-col"
            >
              <Quote className="w-7 h-7 text-wellness/40" aria-hidden="true" />
              <blockquote className="font-inter text-base text-text-primary leading-relaxed mt-3 flex-1">“{t.quote}”</blockquote>
              <figcaption className="flex items-center gap-3 mt-6">
                <span className="w-11 h-11 rounded-full bg-wellness-light text-wellness-dark font-sora font-semibold text-sm flex items-center justify-center" aria-hidden="true">
                  {initials(t.name)}
                </span>
                <span>
                  <span className="block font-sora font-semibold text-sm text-deep-blue">{t.name}</span>
                  <span className="block font-inter text-xs text-text-secondary">
                    {t.role} · {t.place}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="font-inter text-xs text-text-light text-center mt-6">{s.testimonials.disclaimer}</p>
      </div>
    </section>
  )
}
