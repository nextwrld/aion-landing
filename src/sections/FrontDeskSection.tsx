import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

gsap.registerPlugin(ScrollTrigger);

export default function FrontDeskSection() {
  const { c } = useI18n()
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.fd-image', { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.fd-text', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: 0.15, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.fd-feature', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.4, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollToHowItWorks = () => document.getElementById('flujo')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section ref={sectionRef} id="acceso" className="bg-white py-16 sm:py-20 lg:py-[120px]">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="fd-image">
            <div className="relative rounded-xl overflow-hidden shadow-lg" style={{ transform: 'rotate(-1deg)' }}>
              <img src="/assets/front-desk.jpg" alt={c.frontDesk.imageAlt} className="w-full h-[300px] sm:h-[380px] lg:h-[480px] object-cover" />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-wellness-light flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
                <div><div className="font-sora font-semibold text-sm text-deep-blue">{c.frontDesk.accessAllowed}</div><div className="font-inter text-xs text-text-secondary">{c.frontDesk.realTimeValidation}</div></div>
              </div>
            </div>
          </div>

          <div className="fd-text">
            <span className="font-inter text-xs font-semibold tracking-[0.08em] uppercase text-wellness">{c.frontDesk.badge}</span>
            <h2 className="font-sora font-semibold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.25] tracking-[-0.01em] text-deep-blue mt-3">{c.frontDesk.title}</h2>
            <p className="font-inter text-base text-text-primary mt-5 max-w-[460px] leading-relaxed">{c.frontDesk.description}</p>

            <div className="mt-6 flex flex-col gap-3">
              {c.frontDesk.features.map((feature, i) => (
                <div key={i} className="fd-feature flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-wellness-light flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-wellness" strokeWidth={2.5} /></div><span className="font-inter text-sm text-text-primary">{feature}</span></div>
              ))}
            </div>

            <button onClick={scrollToHowItWorks} className="mt-7 inline-flex items-center gap-2 border-[1.5px] border-wellness text-wellness font-inter text-sm font-semibold px-6 py-3 rounded-[10px] hover:bg-wellness-light hover:border-wellness-dark transition-all duration-200">
              {c.frontDesk.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
