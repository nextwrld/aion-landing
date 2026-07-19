import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, IdCard, CreditCard, ShieldCheck, Printer } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

gsap.registerPlugin(ScrollTrigger);

const ICONS = [Search, IdCard, CreditCard, ShieldCheck, Printer]

export default function HowItWorksSection() {
  const { c } = useI18n()
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (lineRef.current) {
        gsap.fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });
      }
      gsap.fromTo('.hiw-step', { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.hiw-steps', start: 'top 80%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="flujo" aria-labelledby="how-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[120px]">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <h2 id="how-heading" className="font-sora font-semibold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.25] tracking-[-0.01em] text-deep-blue">{c.howItWorks.title}</h2>
          <p className="font-inter text-base text-text-secondary mt-4 max-w-[480px] mx-auto leading-relaxed">{c.howItWorks.subtitle}</p>
        </div>

        <div className="hiw-steps relative hidden md:block">
          <div ref={lineRef} className="absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-border-custom origin-left" />
          <div className="grid grid-cols-5 gap-4 relative">
            {c.howItWorks.steps.map((step, i) => {
              const Icon = ICONS[i]
              return (
                <div key={i} className="hiw-step text-center relative">
                  <div className="text-xs font-inter font-semibold tracking-[0.08em] text-wellness mb-3">{String(i + 1).padStart(2, '0')}</div>
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-wellness flex items-center justify-center mx-auto mb-4 relative z-10 hover:border-[3px] hover:scale-110 transition-all duration-200 cursor-default shadow-sm"><Icon className="w-5 h-5 text-wellness" strokeWidth={1.5} /></div>
                  <h4 className="font-sora font-semibold text-base text-deep-blue mb-2">{step.title}</h4>
                  <p className="font-inter text-sm text-text-secondary leading-relaxed max-w-[180px] mx-auto">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="md:hidden flex flex-col gap-6 relative">
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border-custom" />
          {c.howItWorks.steps.map((step, i) => {
            const Icon = ICONS[i]
            return (
              <div key={i} className="hiw-step flex items-start gap-4 relative">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-wellness flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm"><Icon className="w-5 h-5 text-wellness" strokeWidth={1.5} /></div>
                <div className="pt-1">
                  <div className="text-xs font-inter font-semibold tracking-[0.08em] text-wellness mb-1">{String(i + 1).padStart(2, '0')}</div>
                  <h4 className="font-sora font-semibold text-base text-deep-blue mb-1">{step.title}</h4>
                  <p className="font-inter text-sm text-text-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
