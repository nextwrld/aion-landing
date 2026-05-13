import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, User, Building2, Mail, Phone, Loader2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

gsap.registerPlugin(ScrollTrigger);

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function LeadFormSection() {
  const { c } = useI18n()
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState<FormState>('idle');
  const [formData, setFormData] = useState({ nombre: '', gimnasio: '', email: '', telefono: '', miembros: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.lf-left', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.lf-right', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.15, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.lf-field', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.3, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
      gsap.fromTo('.lf-check', { scale: 0 }, { scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(2)', delay: 0.4, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim()) e.nombre = c.leadForm.required;
    if (!formData.gimnasio.trim()) e.gimnasio = c.leadForm.required;
    if (!formData.email.trim()) e.email = c.leadForm.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = c.leadForm.invalidEmail;
    if (!formData.telefono.trim()) e.telefono = c.leadForm.required;
    if (!formData.miembros) e.miembros = c.leadForm.selectOption;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  return (
    <section ref={sectionRef} id="demo" className="gradient-cta py-16 sm:py-20 lg:py-[100px]">
      <div className="section-container">
        <div className="grid lg:grid-cols-[45%_55%] gap-10 lg:gap-16 items-center">
          <div className="lf-left text-center lg:text-left">
            <h2 className="font-sora font-semibold text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.25] tracking-[-0.01em] text-white">{c.leadForm.title}</h2>
            <p className="font-inter text-base text-white/85 mt-4 leading-relaxed">{c.leadForm.subtitle}</p>
            <div className="mt-8 flex flex-col gap-4">{c.leadForm.benefits.map((benefit, i) => <div key={i} className="flex items-center gap-3 justify-center lg:justify-start"><div className="lf-check w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-wellness" strokeWidth={3} /></div><span className="font-inter text-base text-white">{benefit}</span></div>)}</div>
          </div>

          <div className="lf-right"><div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-form-card">
            {formState === 'success' ? (
              <div className="text-center py-8"><div className="w-16 h-16 rounded-full bg-wellness-light flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-wellness" strokeWidth={2.5} /></div><h3 className="font-sora font-semibold text-xl text-deep-blue mb-2">{c.leadForm.successTitle}</h3><p className="font-inter text-sm text-text-secondary">{c.leadForm.successSubtitle}</p></div>
            ) : (
              <>
                <h3 className="font-sora font-semibold text-xl text-deep-blue mb-6">{c.leadForm.formTitle}</h3>
                {formState === 'error' && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px]"><p className="font-inter text-sm text-red-600">{c.leadForm.error}</p></div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="lf-field relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" /><input type="text" placeholder={c.leadForm.placeholders.nombre} value={formData.nombre} onChange={(e) => handleChange('nombre', e.target.value)} className={`w-full pl-10 pr-4 py-3.5 border-[1.5px] rounded-[10px] font-inter text-sm outline-none transition-all focus:border-wellness focus:ring-[3px] focus:ring-wellness/10 ${errors.nombre ? 'border-red-400' : 'border-border-custom'}`} />{errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}</div>
                  <div className="lf-field relative"><Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" /><input type="text" placeholder={c.leadForm.placeholders.gimnasio} value={formData.gimnasio} onChange={(e) => handleChange('gimnasio', e.target.value)} className={`w-full pl-10 pr-4 py-3.5 border-[1.5px] rounded-[10px] font-inter text-sm outline-none transition-all focus:border-wellness focus:ring-[3px] focus:ring-wellness/10 ${errors.gimnasio ? 'border-red-400' : 'border-border-custom'}`} />{errors.gimnasio && <p className="text-xs text-red-500 mt-1">{errors.gimnasio}</p>}</div>
                  <div className="lf-field relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" /><input type="email" placeholder={c.leadForm.placeholders.email} value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className={`w-full pl-10 pr-4 py-3.5 border-[1.5px] rounded-[10px] font-inter text-sm outline-none transition-all focus:border-wellness focus:ring-[3px] focus:ring-wellness/10 ${errors.email ? 'border-red-400' : 'border-border-custom'}`} />{errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}</div>
                  <div className="lf-field relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" /><input type="tel" placeholder={c.leadForm.placeholders.telefono} value={formData.telefono} onChange={(e) => handleChange('telefono', e.target.value)} className={`w-full pl-10 pr-4 py-3.5 border-[1.5px] rounded-[10px] font-inter text-sm outline-none transition-all focus:border-wellness focus:ring-[3px] focus:ring-wellness/10 ${errors.telefono ? 'border-red-400' : 'border-border-custom'}`} />{errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}</div>
                  <div className="lf-field"><select value={formData.miembros} onChange={(e) => handleChange('miembros', e.target.value)} className={`w-full px-4 py-3.5 border-[1.5px] rounded-[10px] font-inter text-sm outline-none transition-all focus:border-wellness focus:ring-[3px] focus:ring-wellness/10 appearance-none bg-white ${errors.miembros ? 'border-red-400' : 'border-border-custom'} ${!formData.miembros ? 'text-text-light' : 'text-text-primary'}`}><option value="">{c.leadForm.placeholders.miembros}</option>{c.leadForm.membersOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select>{errors.miembros && <p className="text-xs text-red-500 mt-1">{errors.miembros}</p>}</div>

                  <button type="submit" disabled={formState === 'submitting'} className="lf-field w-full bg-deep-blue text-white font-inter text-[15px] font-semibold py-4 rounded-[10px] shadow-[0_4px_12px_rgba(15,23,42,0.2)] hover:bg-[#1E293B] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,23,42,0.3)] active:translate-y-0 transition-all duration-200 disabled:opacity-80 flex items-center justify-center gap-2 mt-2">{formState === 'submitting' ? <><Loader2 className="w-5 h-5 animate-spin" />{c.leadForm.sending}</> : c.leadForm.submit}</button>
                  <p className="text-center font-inter text-xs text-text-secondary mt-1">{c.leadForm.privacy}</p>
                </form>
              </>
            )}
          </div></div>
        </div>
      </div>
    </section>
  );
}
