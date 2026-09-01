export type AppLocale = 'de' | 'en'

/** Normalize cookie/header locale to supported app locales. */
export function normalizeAppLocale(locale: string | undefined | null): AppLocale {
  return locale === 'en' ? 'en' : 'de'
}

/**
 * Fetch CMS content for one locale only — never inherit the other locale when a field is empty.
 * Prevents EN pages showing German copy (and DE pages showing English) via Payload fallback.
 */
export function strictLocaleQuery(locale: AppLocale) {
  return {
    locale,
    fallbackLocale: false as const,
  }
}
