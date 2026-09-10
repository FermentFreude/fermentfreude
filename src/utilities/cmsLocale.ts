import { strictLocaleQuery, type AppLocale } from '@/utilities/payloadLocaleQuery'

export type { AppLocale }

/**
 * Fetch this locale only. Do not inherit the other language.
 * Same as `strictLocaleQuery` — kept for shop-block call sites.
 */
export const cmsLocaleQuery = strictLocaleQuery

export function cmsText(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed || fallback
}

export function cmsTextLocalized(
  value: string | null | undefined,
  locale: AppLocale,
  en: string,
  de: string,
): string {
  return cmsText(value, locale === 'de' ? de : en)
}
