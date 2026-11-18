import type { Payload } from 'payload'

import { capacityOf } from '@/lib/appointmentCapacity'
import { releaseSpotsAtomic } from '@/lib/atomicSpots'
import { addBookingHistory } from '@/lib/bookingHistory'
import { logActivityEvent } from '@/lib/manageBooking'
import { seatHoldsPlace, seatStatusAt } from '@/lib/seatCapacity'

/**
 * Closes one refund request once the money is back with the customer: request → completed (with the amount
 * that really went back), the seat → refunded, the place goes back on sale, history + activity entry.
 *
 * Used by the charge.refunded webhook (Stripe confirmed it) and by "Als erstattet markieren" in
 * Management → Requests (refund made outside Stripe, or Stripe's confirmation never arrived).
 * Never creates a Stornorechnung — that stays a separate founder button.
 * MongoDB Atlas M0: sequential writes only.
 */
export async function completeRefundRequest(
  payload: Payload,
  rr: { id: string | number; booking: unknown; seatIndex: number; requestedAmount?: number | null },
  p: { refundedCents: number; stripeRefundId?: string; by: string; via: 'stripe' | 'manual'; note?: string },
): Promise<void> {
  const tag = '[refund:complete]'
  await payload.update({
    collection: 'refund-requests',
    id: rr.id,
    data: {
      status: 'completed',
      completedAt: new Date().toISOString(),
      stripeRefundId: p.stripeRefundId ?? '',
      refundedAmount: p.refundedCents,
    },
    overrideAccess: true,
  })

  const bookingId = typeof rr.booking === 'object' && rr.booking !== null ? (rr.booking as { id: string | number }).id : (rr.booking as string)
  let booking
  try {
    booking = await payload.findByID({ collection: 'workshop-bookings', id: bookingId, overrideAccess: true })
  } catch {
    payload.logger.error(`${tag} refund-request ${rr.id} points at a missing booking ${bookingId} — skipping seat update`)
    return
  }

  const seats = [...(booking.seats ?? [])]
  // Only a seat that still holds a place on its date gives one back — a replay, or a seat that was already
  // moved / turned into a voucher, must not release a place twice (rule in src/lib/seatCapacity.ts).
  const releases = seatHoldsPlace(seatStatusAt(booking, rr.seatIndex))
  const seat = seats[rr.seatIndex]
  if (seat && releases) {
    seats[rr.seatIndex] = { ...seat, seatStatus: 'refunded' }
    await payload.update({ collection: 'workshop-bookings', id: booking.id, data: { seats }, overrideAccess: true })
  }

  if (releases && booking.appointmentId) {
    try {
      const appointment = await payload.findByID({
        collection: 'workshop-appointments',
        id: booking.appointmentId,
        depth: 1,
        overrideAccess: true,
      })
      await releaseSpotsAtomic(payload, booking.appointmentId, 1, capacityOf(appointment))
    } catch (err) {
      payload.logger.error(`${tag} Failed to restore capacity for refund-request ${rr.id}: ${err}`)
    }
  }

  const euro = `€${(p.refundedCents / 100).toFixed(2)}`
  const partial = rr.requestedAmount != null && p.refundedCents < rr.requestedAmount
  const how = p.via === 'stripe' ? 'über Stripe' : `von ${p.by} als erstattet markiert`
  await logActivityEvent(
    payload,
    'refund_completed',
    String(rr.id),
    `${booking.firstName ?? 'Gast'} ${booking.lastName ?? ''} — ${booking.workshopTitle}, ${euro} ${partial ? 'Teilerstattung' : 'Rückerstattung'} abgeschlossen (Platz ${rr.seatIndex + 1})`,
    p.via === 'manual' ? { actorName: p.by } : undefined,
  )
  await addBookingHistory(payload, String(booking.id), {
    type: 'refund_completed',
    summary: `Platz ${rr.seatIndex + 1}: ${partial ? 'Teilerstattung' : 'Erstattung'} ${how} abgeschlossen (${euro}${partial ? ` von €${((rr.requestedAmount ?? 0) / 100).toFixed(2)}` : ''})${p.note ? ` — ${p.note}` : ''}`,
    by: p.by,
  })
}
