import type { Lang } from './content'
import { useI18n } from './I18nProvider'
import { siteContent, type SiteContent } from './site'

/** Picks the active-language entry of a `{ es, en }` content map. */
export function useContent<T>(map: Record<Lang, T>): T {
  const { lang } = useI18n()
  return map[lang]
}

export function useSite(): SiteContent {
  return useContent(siteContent)
}
