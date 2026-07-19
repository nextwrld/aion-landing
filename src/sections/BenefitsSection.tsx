import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, CreditCard, Activity, Receipt } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

gsap.registerPlugin(ScrollTrigger);

const ICONS = [Users, CreditCard, Activity, Receipt]

export default function BenefitsSection() {
  const { c } = useI18n()
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.bnf-headline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo('.bnf-card', { opacity: 0, y: 50, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)', scrollTrigger: { trigger: '.bnf-grid', start: 'top 85%' } });
      gsap.fromTo('.bnf-accent', { scaleX: 0 }, { scaleX: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.3, scrollTrigger: { trigger: '.bnf-grid', start: 'top 85%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="beneficios" aria-labelledby="benefits-heading" className="bg-white py-16 sm:py-20 lg:py-[120px]">
      <div className="section-container">
        <div className="bnf-headline text-center mb-12 lg:mb-16">
          <h2 id="benefits-heading" className="font-sora font-semibold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.25] tracking-[-0.01em] text-deep-blue">{c.benefits.title}</h2>
          <p className="font-inter text-base text-text-secondary mt-4 max-w-[520px] mx-auto leading-relaxed">{c.benefits.subtitle}</p>
        </div>

        <div className="bnf-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {c.benefits.items.map((benefit, i) => {
            const Icon = ICONS[i]
            return (
              <div key={i} className="bnf-card bg-white rounded-2xl border border-border-custom p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-wellness-light flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-wellness" strokeWidth={1.5} />
                </div>
                <h3 className="font-sora font-semibold text-lg text-deep-blue mb-3">{benefit.title}</h3>
                <p className="font-inter text-sm text-text-secondary leading-relaxed">{benefit.description}</p>
                <div className="bnf-accent absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-wellness rounded-full origin-center" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
