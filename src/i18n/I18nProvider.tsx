import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { content, type Lang } from './content'

type I18nContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  c: (typeof content)[Lang]
}

const STORAGE_KEY = 'aion.lang'

const I18nContext = createContext<I18nContextValue | null>(null)

// Server snapshot always returns 'es' to match the deterministic Spanish
// markup emitted by the prerender.
const getServerSnapshot = (): Lang => 'es'

// Client snapshot reads from localStorage. Used after hydration.
const getClientSnapshot = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'es' || saved === 'en') return saved
  } catch {
    // localStorage may be unavailable; fall through to default.
  }
  return 'es'
}

// In-process subscribers for same-tab `setLang` notifications. The same
// set is also notified on `storage` events so cross-tab changes reach
// every active subscriber. Safe to construct on the server (no DOM).
type Listener = () => void
const listeners: Set<Listener> = new Set()

function notify() {
  for (const l of listeners) l()
}

// The browser fires `storage` on every other tab when the key changes.
// Register the listener exactly once at module load so that N React
// subscribers produce 1 cross-tab notification per event (not N).
let storageRegistered = false
function ensureStorageListener() {
  if (storageRegistered) return
  if (typeof window === 'undefined') return
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) notify()
  })
  storageRegistered = true
}

const subscribe = (cb: Listener): (() => void) => {
  listeners.add(cb)
  ensureStorageListener()
  return () => {
    listeners.delete(cb)
    // The storage listener is module-scoped; leave it registered for
    // the lifetime of the page. Re-registering on each subscribe would
    // multiply cross-tab notifications.
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage failures
    }
    document.documentElement.lang = next
    // Same-tab subscribers must be notified explicitly because the
    // browser's `storage` event does not fire in the originating tab.
    notify()
  }, [])

  // Keep <html lang> in sync with the resolved locale after hydration.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, c: content[lang] }), [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
