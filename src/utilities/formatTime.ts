type TimeLocale = 'de' | 'en' | string | null | undefined

type ParsedTime = {
  hour: number
  minute: string
}

const TIME_RANGE_SEPARATOR = /\s*[–-]\s*/

const parseTime = (value: string): ParsedTime | null => {
  const normalized = value.trim().replace(/\s*Uhr$/i, '')
  const twelveHourMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)

  if (twelveHourMatch) {
    const rawHour = Number(twelveHourMatch[1])
    const minute = twelveHourMatch[2] ?? '00'
    const period = twelveHourMatch[3].toUpperCase()
    const hour = period === 'PM' ? (rawHour % 12) + 12 : rawHour % 12

    return { hour, minute }
  }

  const twentyFourHourMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?$/)

  if (!twentyFourHourMatch) return null

  return {
    hour: Number(twentyFourHourMatch[1]),
    minute: twentyFourHourMatch[2] ?? '00',
  }
}

export const formatTimeForLocale = (value: string | null | undefined, locale: TimeLocale): string => {
  if (!value) return ''

  const trimmed = value.trim()
  const rangeParts = trimmed.split(TIME_RANGE_SEPARATOR)

  if (rangeParts.length > 1) {
    return rangeParts.map((part) => formatTimeForLocale(part, locale)).join(' – ')
  }

  const parsed = parseTime(trimmed)
  if (!parsed) return trimmed

  if (locale === 'de') {
    return parsed.minute === '00'
      ? `${parsed.hour} Uhr`
      : `${parsed.hour}:${parsed.minute.padStart(2, '0')} Uhr`
  }

  const period = parsed.hour >= 12 ? 'PM' : 'AM'
  const displayHour = parsed.hour % 12 || 12
  return `${displayHour}:${parsed.minute.padStart(2, '0')} ${period}`
}
