import type { AppointmentRow } from './types'

/**
 * Compares the free-seat counter the booking page uses with what the bookings say.
 * Returns null when they agree (or cannot be compared), otherwise both numbers.
 * Pending (unpaid) bookings hold seats too, so they are part of the expected value.
 */
export function seatMismatch(a: AppointmentRow): { shown: number; expected: number } | null {
  if (a.isPast || a.counterFree == null) return null
  const expected = a.capacity - a.totalBooked - (a.pendingSeats ?? 0)
  return a.counterFree === expected ? null : { shown: a.counterFree, expected }
}

export function seatMismatchText(m: { shown: number; expected: number }): string {
  return `Die Buchungsseite zeigt ${m.shown} freie Plätze, laut Buchungen sollten es ${m.expected} sein.`
}
