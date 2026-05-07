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
  /** YYYY-MM-DD (ISO date). */
  date: string
  /** Free-form time string, e.g. "18:00–21:00" or "18:00". */
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

/** Format a JS Date to a floating local-time iCal value (YYYYMMDDTHHMMSS). */
function formatLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
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
  const start = new Date(year, month, day, startH, startM, 0)

  let end: Date
  if (range?.endH !== undefined) {
    end = new Date(year, month, day, range.endH, range.endM ?? 0, 0)
    // If end appears to wrap past midnight (e.g. 18:00-01:00), bump to next day.
    if (end.getTime() <= start.getTime()) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000)
    }
  } else {
    // Default workshop duration: 3 hours.
    end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
  }

  const descriptionParts: string[] = []
  if (input.description) descriptionParts.push(input.description)
  if (input.url) descriptionParts.push(input.url)

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeText(input.bookingId)}@fermentfreude.at`,
    `DTSTAMP:${formatUTC(new Date())}`,
    `DTSTART:${formatLocal(start)}`,
    `DTEND:${formatLocal(end)}`,
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
