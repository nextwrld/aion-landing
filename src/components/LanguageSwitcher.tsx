import { useI18n } from '../i18n/I18nProvider'

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n()

  return (
    <div className="inline-flex items-center rounded-lg border border-border-custom p-1 bg-white/90">
      <button
        onClick={() => setLang('es')}
        className={`px-2.5 py-1 text-xs font-semibold rounded ${lang === 'es' ? 'bg-wellness text-white' : 'text-text-secondary'}`}
      >
        ES
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded ${lang === 'en' ? 'bg-wellness text-white' : 'text-text-secondary'}`}
      >
        EN
      </button>
    </div>
  )
}
