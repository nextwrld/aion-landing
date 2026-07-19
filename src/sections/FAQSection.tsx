import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

gsap.registerPlugin(ScrollTrigger);

export default function FAQSection() {
  const { c } = useI18n()
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-headline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo('.faq-item', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '.faq-list', start: 'top 85%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const toggleItem = (index: number) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section ref={sectionRef} id="preguntas" aria-labelledby="faq-heading" className="bg-white py-16 sm:py-20 lg:py-[120px]">
      <div className="section-container max-w-[800px]">
        <h2 id="faq-heading" className="faq-headline font-sora font-semibold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.25] tracking-[-0.01em] text-deep-blue text-center mb-12">{c.faq.title}</h2>

        <div className="faq-list">
          {c.faq.items.map((faq, i) => (
            <div key={i} className="faq-item border-b border-border-custom">
              <button id={`faq-button-${i}`} onClick={() => toggleItem(i)} aria-expanded={openIndex === i} aria-controls={`faq-panel-${i}`} className="w-full flex items-center justify-between py-5 text-left group hover:bg-wellness/[0.03] transition-colors px-2 -mx-2 rounded-lg">
                <span className="font-sora font-semibold text-base sm:text-lg text-deep-blue pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-button-${i}`} hidden={openIndex !== i} className="overflow-hidden transition-all duration-350 ease-in-out" style={{ maxHeight: openIndex === i ? '300px' : '0', opacity: openIndex === i ? 1 : 0 }}>
                <p className="font-inter text-base text-text-primary leading-relaxed pb-5 px-2">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
