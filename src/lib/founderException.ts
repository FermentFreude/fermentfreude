import type { Payload } from 'payload'

import { logActivityEvent } from '@/lib/manageBooking'
import { DEFAULT_POLICY_CONFIG, diffHours } from '@/lib/policyEngine'

/**
 * Exceptions: something a founder did that the customer's own booking link would not allow
 * (moved with less than 14 days to go, a seat given as a rebooking, a full date opened up).
 * Listed in Management → Requests → Exceptions, so every special arrangement is in one place.
 * Best-effort, like every activity entry: it never undoes the action it describes.
 */
export async function logFounderException(
  payload: Payload,
  p: { bookingId: string; summary: string; actorName: string; actorId?: string | number },
): Promise<void> {
  await logActivityEvent(payload, 'founder_exception', p.bookingId, p.summary, {
    actorName: p.actorName,
    // The founder who did it already knows — it is only "new" for the others.
    readBy: p.actorId !== undefined ? [p.actorId] : [],
  })
}

/** A move the customer could not have made through their link: under 14 days to go, or the date has passed. */
export function isOutsideSelfServiceWindow(dateTime: string | Date | null | undefined, now: Date = new Date()): boolean {
  if (!dateTime) return false
  return diffHours(dateTime, now) < DEFAULT_POLICY_CONFIG.rebookThresholdHours
}

/** "13 Tage vorher" / "nach dem Termin" — how late the exception was made. */
export function lateness(dateTime: string | Date, now: Date = new Date()): string {
  const days = Math.floor(diffHours(dateTime, now) / 24)
  if (days < 0) return 'nach dem Termin'
  if (days === 0) return 'am selben Tag'
  return `${days} ${days === 1 ? 'Tag' : 'Tage'} vorher`
}
