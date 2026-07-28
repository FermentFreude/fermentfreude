import { isObjectIdRef } from '@/utilities/isValidObjectId'

export type AppLocale = 'de' | 'en'

/** Payload localized text stored as { de, en } when locale flattening did not run. */
export function isLocalizedStringObject(
  value: unknown,
): value is { de?: string | null; en?: string | null } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  const keys = Object.keys(record)
  if (keys.length === 0) return false
  if (!keys.every((key) => key === 'de' || key === 'en')) return false
  return Object.values(record).every(
    (entry) => entry == null || typeof entry === 'string' || typeof entry === 'number',
  )
}

/** Resolve CMS text for the active locale; pass through plain strings unchanged. */
export function resolveLocalizedString(
  value: unknown,
  locale: AppLocale = 'de',
): string | null | undefined {
  if (value == null) return value as null | undefined
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (isLocalizedStringObject(value)) {
    return value[locale] ?? value.de ?? value.en ?? undefined
  }
  return undefined
}

/** Resolve text for client props when locale was already applied server-side, with fallback. */
export function resolveAnyLocalizedText(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return resolveLocalizedString(value, 'de') ?? resolveLocalizedString(value, 'en') ?? ''
}

/** Deep-resolve { de, en } objects inside workshop detail before client render. */
export function localizeWorkshopDetail(
  detail: Record<string, unknown> | null | undefined,
  locale: AppLocale,
): Record<string, unknown> | undefined {
  if (!detail) return undefined

  const visit = (value: unknown): unknown => {
    if (value == null) return value
    if (isObjectIdRef(value)) return value
    if (isLocalizedStringObject(value)) return resolveLocalizedString(value, locale)
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value
    }
    if (Array.isArray(value)) return value.map(visit)
    if (typeof value === 'object') {
      // Populated upload / relationship docs — do not recurse
      if ('url' in (value as Record<string, unknown>)) return value
      const next: Record<string, unknown> = {}
      for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
        next[key] = visit(entry)
      }
      return next
    }
    return value
  }

  return visit(detail) as Record<string, unknown>
}
