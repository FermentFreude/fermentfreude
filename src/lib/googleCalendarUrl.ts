/**
 * googleCalendarUrl — "Add to Google Calendar" link for a workshop booking.
 *
 * Opens Google Calendar in the browser with title, time (Europe/Vienna),
 * location and details pre-filled. Companion to generateBookingICS (which
 * produces the .ics file for Apple / Outlook / phone calendars).
 *
 * Workshop duration is 3 hours, matching the rest of the booking system.
 */

const VIENNA = 'Europe/Vienna'

/** Format a Date as Vienna local time "YYYYMMDDTHHMMSS" (Google pairs it with ctz=Europe/Vienna). */
function viennaStamp(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: VIENNA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  const hour = get('hour') === '24' ? '00' : get('hour')
  return `${get('year')}${get('month')}${get('day')}T${hour}${get('minute')}${get('second')}`
}

export function googleCalendarUrl(input: {
  title: string
  /** Appointment start (ISO string or Date) */
  start: string | Date
  durationHours?: number
  location?: string
  details?: string
}): string | null {
  const start = new Date(input.start)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + (input.durationHours ?? 3) * 60 * 60 * 1000)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${viennaStamp(start)}/${viennaStamp(end)}`,
    ctz: VIENNA,
  })
  if (input.location) params.set('location', input.location)
  if (input.details) params.set('details', input.details)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
