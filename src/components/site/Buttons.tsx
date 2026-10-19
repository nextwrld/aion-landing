import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

type Variant = 'primary' | 'outline' | 'white' | 'ghost-light'

const VARIANTS: Record<Variant, string> = {
  primary:
    'gradient-cta text-white shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0',
  outline:
    'border-[1.5px] border-wellness text-wellness hover:bg-wellness-light hover:border-wellness-dark',
  white:
    'bg-white text-deep-blue shadow-[0_4px_12px_rgba(15,23,42,0.15)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,23,42,0.2)]',
  'ghost-light': 'border-[1.5px] border-white/70 text-white hover:bg-white/10 hover:border-white',
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-inter text-[15px] font-semibold px-7 py-3.5 rounded-[10px] transition-all duration-200 group'

type Props = {
  to: string
  children: ReactNode
  variant?: Variant
  arrow?: boolean
  className?: string
  external?: boolean
}

export function ButtonLink({ to, children, variant = 'primary', arrow = true, className = '', external = false }: Props) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`
  const content = (
    <>
      {children}
      {arrow && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />}
    </>
  )
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    )
  }
  return (
    <Link to={to} className={classes}>
      {content}
    </Link>
  )
}
