import { useI18n } from '../i18n/I18nProvider'

interface LogoProps {
  variant?: 'dark' | 'light';
  className?: string;
}

export default function Logo({ variant = 'dark', className = '' }: LogoProps) {
  const { c } = useI18n()
  const textColor = variant === 'dark' ? '#0F172A' : '#FFFFFF';
  const taglineColor = variant === 'dark' ? '#22C55E' : '#94A3B8';

  return (
    <div className={`flex items-center gap-2 ${className}`} role="img" aria-label="AION Wellness">
      <img src="/assets/logo.svg" alt="" aria-hidden="true" className="h-9 w-auto flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="font-sora font-bold text-base sm:text-lg leading-tight tracking-tight truncate" style={{ color: textColor }}>
          AION Wellness
        </span>
        <span className="hidden sm:block text-[8px] font-inter font-semibold tracking-[0.15em] uppercase leading-tight" style={{ color: taglineColor }}>
          {c.logo.tagline}
        </span>
      </div>
    </div>
  );
}
