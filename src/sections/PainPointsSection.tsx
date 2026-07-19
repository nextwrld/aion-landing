import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useI18n } from '../i18n/I18nProvider';

gsap.registerPlugin(ScrollTrigger);

export default function PainPointsSection() {
  const { c } = useI18n()
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pp-headline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo('.pp-card', { opacity: 0, y: 50, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)', scrollTrigger: { trigger: '.pp-grid', start: 'top 85%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="problemas" aria-labelledby="painpoints-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[120px]">
      <div className="section-container">
        <div className="pp-headline text-center mb-12 lg:mb-16">
          <h2 id="painpoints-heading" className="font-sora font-semibold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.25] tracking-[-0.01em] text-deep-blue max-w-[640px] mx-auto">{c.painPoints.title}</h2>
          <p className="font-inter text-base text-text-secondary mt-4 max-w-[560px] mx-auto leading-relaxed">{c.painPoints.subtitle}</p>
        </div>

        <div className="pp-grid grid md:grid-cols-3 gap-6">
          {c.painPoints.items.map((point, i) => (
            <div key={i} className="pp-card bg-white rounded-2xl border border-border-custom p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center group">
              <div className="flex justify-center mb-6 group-hover:-translate-y-1.5 transition-transform duration-300">
                <img src={point.image} alt={point.title} className="h-[120px] w-auto object-contain" />
              </div>
              <h3 className="font-sora font-semibold text-lg text-deep-blue mb-3">{point.title}</h3>
              <p className="font-inter text-sm text-text-secondary leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
