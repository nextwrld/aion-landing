import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

gsap.registerPlugin(ScrollTrigger);

export default function MVPSection() {
  const { c } = useI18n()
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.mvp-box', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo('.mvp-border-accent', { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power2.out', delay: 0.2, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo('.mvp-tag', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.4, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white py-16 sm:py-20">
      <div className="section-container max-w-[800px]">
        <div className="mvp-box relative bg-white rounded-2xl border border-border-custom shadow-card p-8 sm:p-10 lg:p-12">
          <div className="mvp-border-accent absolute left-0 top-4 bottom-4 w-0.5 bg-deep-blue rounded-full origin-top" />
          <span className="font-inter text-xs font-semibold tracking-[0.08em] uppercase text-wellness">{c.mvp.badge}</span>
          <h3 className="font-sora font-semibold text-xl text-deep-blue mt-3">{c.mvp.title}</h3>
          <p className="font-inter text-base text-text-primary mt-3 leading-relaxed">{c.mvp.description}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            {c.mvp.roadmap.map((item, i) => (
              <span key={i} className="mvp-tag inline-flex items-center gap-1.5 px-3 py-1.5 bg-light-gray rounded-full text-sm font-inter text-text-secondary">
                <Clock className="w-3.5 h-3.5" />{item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
