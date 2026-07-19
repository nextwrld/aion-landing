import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

gsap.registerPlugin(ScrollTrigger);

export default function ResourcesSection() {
  const { c } = useI18n()
  const sectionRef = useRef<HTMLElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.res-headline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
      gsap.fromTo('.res-card-1', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: '.res-grid', start: 'top 85%' } });
      gsap.fromTo('.res-card-2', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.15, scrollTrigger: { trigger: '.res-grid', start: 'top 85%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const openModal = (title: string) => { setModalTitle(title); setModalOpen(true); };

  return (
    <section ref={sectionRef} id="recursos" aria-labelledby="resources-heading" className="bg-light-gray py-16 sm:py-20 lg:py-[120px]">
      <div className="section-container">
        <div className="res-headline text-center mb-12 lg:mb-16">
          <h2 id="resources-heading" className="font-sora font-semibold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.25] tracking-[-0.01em] text-deep-blue">{c.resources.title}</h2>
          <p className="font-inter text-base text-text-secondary mt-4 max-w-[480px] mx-auto leading-relaxed">{c.resources.subtitle}</p>
        </div>

        <div className="res-grid grid md:grid-cols-2 gap-8">
          {c.resources.items.map((res, i) => (
            <div key={i} className={`res-card-${i + 1} bg-white rounded-2xl shadow-floating hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row`}>
              <div className="sm:w-[40%] overflow-hidden flex-shrink-0"><img src={res.image} alt={res.title} className="w-full h-[160px] sm:h-full object-cover hover:scale-[1.03] transition-transform duration-500" /></div>
              <div className="p-6 sm:p-8 flex flex-col justify-center flex-1">
                <span className="inline-block self-start px-3 py-1 bg-light-gray rounded-full text-xs font-inter font-medium text-text-secondary mb-3">{res.tag}</span>
                <h3 className="font-sora font-semibold text-lg text-deep-blue mb-3 leading-snug">{res.title}</h3>
                <p className="font-inter text-sm text-text-secondary leading-relaxed mb-5">{res.description}</p>
                <button onClick={() => openModal(res.title)} className="inline-flex items-center gap-2 self-start border-[1.5px] border-wellness text-wellness font-inter text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-wellness-light hover:border-wellness-dark transition-all duration-200">{c.resources.download}<ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-1 hover:bg-light-gray rounded-lg transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
            <h3 className="font-sora font-semibold text-xl text-deep-blue mb-2">{modalTitle}</h3>
            <p className="font-inter text-sm text-text-secondary mb-6">{c.resources.modalSubtitle}</p>
            <input type="email" placeholder={c.resources.modalInput} className="w-full px-4 py-3 border-[1.5px] border-border-custom rounded-[10px] font-inter text-sm focus:border-wellness focus:ring-[3px] focus:ring-wellness/10 outline-none transition-all mb-4" />
            <button onClick={() => setModalOpen(false)} className="w-full gradient-cta text-white font-inter text-sm font-semibold py-3 rounded-[10px] hover:shadow-btn-hover transition-all">{c.resources.modalButton}</button>
          </div>
        </div>
      )}
    </section>
  );
}
