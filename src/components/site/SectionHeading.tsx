type Props = {
  id?: string
  badge?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  as?: 'h2' | 'h3'
  className?: string
}

export default function SectionHeading({ id, badge, title, subtitle, align = 'center', as = 'h2', className = '' }: Props) {
  const Heading = as
  const centered = align === 'center'
  return (
    <div data-reveal className={`${centered ? 'text-center mx-auto' : ''} max-w-[680px] mb-10 lg:mb-14 ${className}`}>
      {badge && (
        <span className="inline-block font-inter text-xs font-semibold tracking-[0.08em] uppercase text-wellness mb-3">
          {badge}
        </span>
      )}
      <Heading
        id={id}
        className="font-sora font-semibold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.25] tracking-[-0.01em] text-deep-blue text-balance"
      >
        {title}
      </Heading>
      {subtitle && (
        <p className={`font-inter text-base text-text-secondary mt-4 leading-relaxed ${centered ? 'max-w-[560px] mx-auto' : 'max-w-[560px]'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
