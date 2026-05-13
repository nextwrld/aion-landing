import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { content, type Lang } from './content'

type I18nContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  c: (typeof content)[Lang]
}

const STORAGE_KEY = 'aion.lang'

const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLang(): Lang {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  if (saved === 'es' || saved === 'en') return saved
  return 'es'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  const setLang = (next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
  }

  const value = useMemo(() => ({ lang, setLang, c: content[lang] }), [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
