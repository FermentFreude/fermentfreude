/**
 * Display date for a workshop appointment in the site language.
 * German: "13. Dezember 2026" · English: "13 December 2026" (always Vienna time).
 * Falls back to the pre-formatted German string when no ISO date is available.
 */
export function formatWorkshopDate(
  iso: string | null | undefined,
  locale: string | null | undefined,
  fallback: string,
): string {
  if (!iso) return fallback
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return fallback
  return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Vienna',
  })
}
