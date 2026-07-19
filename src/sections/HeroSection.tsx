import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMouseTilt } from '../hooks/useMouseTilt';
import { useI18n } from '../i18n/I18nProvider';

function DashboardMockup() {
  const { c } = useI18n()
  const tiltRef = useMouseTilt();

  return (
    <div ref={tiltRef} className="relative" style={{ transformStyle: 'preserve-3d' }}>
      <div className="animate-float bg-white rounded-xl shadow-dashboard overflow-hidden w-full max-w-[520px] mx-auto">
        <div className="px-5 py-4 border-b border-border-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 15V9M20 15V9M8 12H16M12 8V16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/></svg></div>
            <span className="font-sora font-semibold text-sm text-deep-blue">{c.hero.mockup.summary}</span>
          </div>
          <div className="h-1 w-8 bg-wellness rounded-full" />
        </div>

        <div className="grid grid-cols-4 gap-3 p-4">
          {c.hero.mockup.statLabels.map((label, i) => (
            <div key={label} className="text-center">
              <div className={`font-sora font-bold text-lg ${['text-wellness','text-energy','text-deep-blue','text-wellness-dark'][i]}`}>{['1,248','103','$45,680','—'][i]}</div>
              <div className="text-[10px] text-text-secondary font-inter mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          <div className="bg-light-gray rounded-lg p-3">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-inter font-medium text-text-primary">{c.hero.mockup.attendance}</span><span className="text-[10px] text-text-light">{c.hero.mockup.last7days}</span></div>
            <svg viewBox="0 0 200 60" className="w-full h-[50px]"><defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity="0.2"/><stop offset="100%" stopColor="#22C55E" stopOpacity="0"/></linearGradient></defs><path d="M0,50 Q20,45 40,40 T80,30 T120,25 T160,20 T200,15" fill="none" stroke="#22C55E" strokeWidth="2"/><path d="M0,50 Q20,45 40,40 T80,30 T120,25 T160,20 T200,15 V60 H0 Z" fill="url(#chartGrad)"/><circle cx="160" cy="20" r="3" fill="#22C55E"/></svg>
          </div>

          <div className="bg-light-gray rounded-lg p-3">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-inter font-medium text-text-primary">{c.hero.mockup.memberships}</span></div>
            <div className="flex items-center gap-3"><svg viewBox="0 0 60 60" className="w-[50px] h-[50px]"><circle cx="30" cy="30" r="24" fill="none" stroke="#E2E8F0" strokeWidth="6"/><circle cx="30" cy="30" r="24" fill="none" stroke="#22C55E" strokeWidth="6" strokeDasharray={`${0.65 * 150.8} ${150.8}`} strokeLinecap="round" transform="rotate(-90 30 30)"/><circle cx="30" cy="30" r="24" fill="none" stroke="#10B981" strokeWidth="6" strokeDasharray={`${0.25 * 150.8} ${150.8}`} strokeDashoffset={-0.65 * 150.8} strokeLinecap="round" transform="rotate(-90 30 30)"/></svg>
              <div className="flex flex-col gap-1">{c.hero.mockup.donut.map((d, i)=><div key={d} className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${['bg-wellness','bg-energy','bg-border-custom'][i]}`}/><span className="text-[10px] text-text-secondary">{d}</span></div>)}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-around py-3 border-t border-border-custom">
          {[
            'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
            'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4',
            'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
            'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6M16 3v4M8 3v4m-4 4h16',
            'M13 10V3L4 14h7v7l9-11h-7z',
          ].map((icon, i) => (<div key={i} className="flex flex-col items-center gap-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={i < 3 ? '#22C55E' : '#94A3B8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg><span className="text-[9px] text-text-light font-inter">{c.hero.mockup.bottom[i]}</span></div>))}
        </div>
      </div>

      <div className="animate-float-small absolute -top-4 -left-8 bg-white rounded-lg shadow-floating px-4 py-3 hidden sm:flex items-center gap-2 max-w-[200px]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <span className="text-xs text-text-light font-inter">{c.hero.mockup.search}</span>
        <div className="ml-auto flex gap-0.5"><kbd className="text-[9px] bg-light-gray px-1 rounded text-text-light">Ctrl</kbd><kbd className="text-[9px] bg-light-gray px-1 rounded text-text-light">K</kbd></div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const { c } = useI18n()
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const positioningRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    if (headlineRef.current) tl.fromTo(headlineRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    tl.fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    if (positioningRef.current) tl.fromTo(positioningRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    tl.fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    if (supportRef.current) tl.fromTo(supportRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    return () => { tl.kill(); };
  }, [c.hero.title]);

  return (
    <section ref={sectionRef} id="inicio" aria-labelledby="hero-heading" className="relative min-h-[90vh] flex items-center pt-[72px] pb-20 overflow-hidden" style={{ background: 'radial-gradient(ellipse at 65% 50%, rgba(34,197,94,0.06) 0%, transparent 60%)' }}>
      <div className="section-container w-full"><div className="grid lg:grid-cols-[55%_45%] gap-12 items-center">
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <span className="inline-block font-inter text-xs font-semibold tracking-[0.08em] uppercase text-wellness mb-4">{c.hero.badge}</span>
          <h1 id="hero-heading" ref={headlineRef} className="font-sora font-bold text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.12] tracking-[-0.02em] text-deep-blue max-w-[560px] mx-auto lg:mx-0" style={{ textWrap: 'balance' }}>{c.hero.title}</h1>
          <div ref={subRef}><p className="font-inter text-base text-text-secondary mt-5 max-w-[480px] mx-auto lg:mx-0 leading-relaxed">{c.hero.subtitle}</p></div>
          <p ref={positioningRef} className="font-inter text-sm text-text-secondary mt-3 max-w-[480px] mx-auto lg:mx-0 leading-relaxed">{c.hero.positioning}</p>
          <div ref={ctaRef} className="mt-8"><a href="#demo" className="gradient-cta text-white font-inter text-[15px] font-semibold px-7 py-3.5 rounded-[10px] shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 inline-flex items-center gap-2 group">{c.hero.cta}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a></div>
          <p ref={supportRef} className="font-inter text-sm text-text-light mt-4 max-w-[480px] mx-auto lg:mx-0 leading-relaxed">{c.hero.support}</p>
        </div>
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end"><DashboardMockup /></div>
      </div></div>
    </section>
  );
}
