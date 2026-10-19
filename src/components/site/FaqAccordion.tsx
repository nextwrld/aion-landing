import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export type QA = { q: string; a: string }

/** Accessible accordion matching the home FAQ styling. */
export default function FaqAccordion({ items, defaultOpen = null }: { items: QA[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen)
  const baseId = useId()
  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i
        const buttonId = `${baseId}-b${i}`
        const panelId = `${baseId}-p${i}`
        return (
          <div key={item.q} className="border-b border-border-custom">
            <h3>
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center justify-between py-5 text-left hover:bg-wellness/[0.03] transition-colors px-2 -mx-2 rounded-lg"
              >
                <span className="font-sora font-semibold text-base sm:text-lg text-deep-blue pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className="grid transition-all duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }}
            >
              <div className="overflow-hidden">
                <p className="font-inter text-base text-text-primary leading-relaxed pb-5 px-2">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
