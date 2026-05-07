/**
 * generateBookingICS — minimal RFC 5545 iCalendar (.ics) builder.
 *
 * Produces a single-event VCALENDAR file suitable for attaching to workshop
 * booking confirmation emails. Recipients can open the attachment to add the
 * workshop to Apple Calendar, Google Calendar, Outlook, etc.
 *
 * Inputs are deliberately permissive: `date` is an ISO-ish date (YYYY-MM-DD)
 * and `time` may be a free-form string ("18:00", "18:00-21:00", "18:00 – 21:00",
 * "6 PM"). When an end time cannot be parsed, we default to a 3-hour duration.
 *
 * No external dependencies. Returns a UTF-8 string with CRLF line endings.
 */

export type BookingICSInput = {
  /** Stable identifier — used as VEVENT UID (booking id). */
  bookingId: string
  /** Workshop title displayed as the event SUMMARY. */
  title: string
  /**
   * Date in ISO `YYYY-MM-DD` format (Vienna local calendar date).
   * Other formats fall back to `new Date(input.date)` parsing — pass ISO
   * for reliable results.
   */
  date: string
  /**
   * Free-form Vienna-local time string, e.g. "18:00 – 21:00" or "18:00".
   * The numeric tokens are emitted verbatim with `TZID=Europe/Vienna`.
   */
  time: string
  /** Optional venue/address used as LOCATION. */
  location?: string
  /** Optional descriptive text appended to the event DESCRIPTION. */
  description?: string
  /** Optional URL added as a separate URL property. */
  url?: string
}

const PRODID = '-//FermentFreude//Workshop Booking//EN'

/** Escape a value per RFC 5545 §3.3.11 (TEXT). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n')
}

/**
 * Format literal Y/M/D/H/M/S parts to a local-time iCal value (YYYYMMDDTHHMMSS).
 * The values are emitted verbatim — no Date object is constructed, so this is
 * safe to use with TZID and is independent of the server's local timezone.
 */
function formatParts(parts: {
  year: number
  month: number // 1-12
  day: number
  hour: number
  minute: number
  second: number
}): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${parts.year}${pad(parts.month)}${pad(parts.day)}` +
    `T${pad(parts.hour)}${pad(parts.minute)}${pad(parts.second)}`
  )
}

/** Format to a UTC iCal value (YYYYMMDDTHHMMSSZ). Used for DTSTAMP. */
function formatUTC(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

/**
 * Extract one or two HH:MM time tokens from a free-form string.
 * Recognises "HH:MM" and "HH" (assumes :00). Returns null if nothing matches.
 */
function parseTimeRange(
  time: string,
): { startH: number; startM: number; endH?: number; endM?: number } | null {
  if (!time) return null
  const matches = time.match(/(\d{1,2})(?::(\d{2}))?/g)
  if (!matches || matches.length === 0) return null

  const parse = (token: string): { h: number; m: number } | null => {
    const m = token.match(/^(\d{1,2})(?::(\d{2}))?$/)
    if (!m) return null
    const h = Number(m[1])
    const min = m[2] ? Number(m[2]) : 0
    if (h < 0 || h > 23 || min < 0 || min > 59) return null
    return { h, m: min }
  }

  const first = parse(matches[0]!)
  if (!first) return null
  const second = matches[1] ? parse(matches[1]) : null

  return {
    startH: first.h,
    startM: first.m,
    endH: second?.h,
    endM: second?.m,
  }
}

/** Wrap output lines to 75 octets per RFC 5545 §3.1 (folded with CRLF + space). */
function foldLine(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  let remaining = line
  parts.push(remaining.slice(0, 75))
  remaining = remaining.slice(75)
  while (remaining.length > 0) {
    parts.push(' ' + remaining.slice(0, 74))
    remaining = remaining.slice(74)
  }
  return parts.join('\r\n')
}

export function generateBookingICS(input: BookingICSInput): string {
  // Parse date — expect YYYY-MM-DD; tolerate other formats by passing to Date.
  const dateMatch = input.date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  let year: number
  let month: number
  let day: number

  if (dateMatch) {
    year = Number(dateMatch[1])
    month = Number(dateMatch[2]) - 1
    day = Number(dateMatch[3])
  } else {
    const parsed = new Date(input.date)
    if (Number.isNaN(parsed.getTime())) {
      // Fallback: emit an all-day event for "today" — unlikely in practice
      // because booking.date is always a populated ISO date in this codebase.
      const now = new Date()
      year = now.getFullYear()
      month = now.getMonth()
      day = now.getDate()
    } else {
      year = parsed.getFullYear()
      month = parsed.getMonth()
      day = parsed.getDate()
    }
  }

  const range = parseTimeRange(input.time)
  const startH = range?.startH ?? 18
  const startM = range?.startM ?? 0

  let endH: number
  let endM: number
  let endDay = day
  let endMonth = month // 0-based
  let endYear = year
  if (range?.endH !== undefined) {
    endH = range.endH
    endM = range.endM ?? 0
    // If end appears to wrap past midnight (e.g. 18:00-01:00), bump to next day.
    if (endH * 60 + endM <= startH * 60 + startM) {
      const next = new Date(Date.UTC(year, month, day + 1))
      endYear = next.getUTCFullYear()
      endMonth = next.getUTCMonth()
      endDay = next.getUTCDate()
    }
  } else {
    // Default workshop duration: 3 hours.
    endH = (startH + 3) % 24
    endM = startM
    if (startH + 3 >= 24) {
      const next = new Date(Date.UTC(year, month, day + 1))
      endYear = next.getUTCFullYear()
      endMonth = next.getUTCMonth()
      endDay = next.getUTCDate()
    }
  }

  const startStr = formatParts({
    year,
    month: month + 1,
    day,
    hour: startH,
    minute: startM,
    second: 0,
  })
  const endStr = formatParts({
    year: endYear,
    month: endMonth + 1,
    day: endDay,
    hour: endH,
    minute: endM,
    second: 0,
  })

  const descriptionParts: string[] = []
  if (input.description) descriptionParts.push(input.description)
  if (input.url) descriptionParts.push(input.url)

  // Minimal VTIMEZONE block for Europe/Vienna covering CET (UTC+1) / CEST (UTC+2)
  // DST transitions per EU rules. Required by RFC 5545 §3.6.5 when DTSTART uses
  // a TZID. Apple Calendar, Google Calendar, Outlook all honour this.
  const VTIMEZONE_VIENNA = [
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Vienna',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
  ]

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...VTIMEZONE_VIENNA,
    'BEGIN:VEVENT',
    `UID:${escapeText(input.bookingId)}@fermentfreude.at`,
    `DTSTAMP:${formatUTC(new Date())}`,
    `DTSTART;TZID=Europe/Vienna:${startStr}`,
    `DTEND;TZID=Europe/Vienna:${endStr}`,
    `SUMMARY:${escapeText(input.title)}`,
  ]
  if (input.location) lines.push(`LOCATION:${escapeText(input.location)}`)
  if (descriptionParts.length > 0) {
    lines.push(`DESCRIPTION:${escapeText(descriptionParts.join('\n'))}`)
  }
  if (input.url) lines.push(`URL:${input.url}`)
  lines.push('STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR')

  return lines.map(foldLine).join('\r\n') + '\r\n'
}
