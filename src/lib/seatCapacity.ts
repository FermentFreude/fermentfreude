import type { Payload } from 'payload'

import { releaseSpotsAtomic } from '@/lib/atomicSpots'

/* ═══════════════════════════════════════════════════════════════
 *  Which seats of a booking still take up a place on its date.
 *
 *  A booking's guestCount never shrinks — when one seat is rebooked,
 *  cancelled or refunded, only that seat's seatStatus changes. So every
 *  "how many people are on this date" count must look at the seats, not
 *  at guestCount. Missing seat entries count as active (older/manual
 *  bookings without a full seats array).
 *
 *  Still on the date:   active, refund_requested (place kept until the
 *                       refund completes), rebooking_pending,
 *                       organiser_cancelled_pending, no_show
 *  Gone from the date:  rebooked, voucher_issued, cancelled_no_refund,
 *                       refunded
 * ═══════════════════════════════════════════════════════════════ */

const LEFT_THE_DATE = new Set(['rebooked', 'voucher_issued', 'cancelled_no_refund', 'refunded'])

type SeatLike = { seatStatus?: string | null } | null | undefined
type BookingLike = { guestCount?: number | null; seats?: SeatLike[] | null }

export function seatStatusAt(booking: BookingLike, index: number): string {
  return booking.seats?.[index]?.seatStatus || 'active'
}

export function seatHoldsPlace(status: string | null | undefined): boolean {
  return !LEFT_THE_DATE.has(status || 'active')
}

/** Number of seats on this booking that still occupy a place on its date. */
export function seatsHoldingPlace(booking: BookingLike): number {
  const count = Math.max(Number(booking.guestCount) || 1, 1)
  let holding = 0
  for (let i = 0; i < count; i++) if (seatHoldsPlace(seatStatusAt(booking, i))) holding++
  return holding
}

/**
 * Give one seat back to an appointment after a customer left it (rebooked,
 * took a voucher, cancelled). Best-effort: the customer's action already
 * succeeded, so a failure here is logged, not thrown.
 */
export async function releaseSeatFromAppointment(
  payload: Payload,
  appointmentId: string | null | undefined,
  logContext: string,
): Promise<void> {
  if (!appointmentId) return
  try {
    const appointment = await payload.findByID({
      collection: 'workshop-appointments',
      id: appointmentId,
      depth: 1,
      overrideAccess: true,
    })
    const workshop = appointment.workshop
    const maxCapacity =
      typeof workshop === 'object' && workshop !== null ? Number(workshop.maxCapacityPerSlot ?? 12) : 12
    await releaseSpotsAtomic(payload, appointmentId, 1, maxCapacity)
  } catch (err) {
    payload.logger.error(
      `[${logContext}] Seat left appointment ${appointmentId} but giving the place back failed: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
