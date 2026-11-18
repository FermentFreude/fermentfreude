import type { Payload } from 'payload'

import { capacityOf } from '@/lib/appointmentCapacity'
import { reserveSpotsAtomic } from '@/lib/atomicSpots'

/**
 * "Ausnahme": put one more person on a date that is full (or has fewer free seats than needed).
 *
 * It is done the honest way: the date's own capacity is raised by exactly the missing seats
 * (8 → 9), which also raises the free-spots counter by the same amount (the appointment hooks do
 * that), and then the seats are reserved like for any other booking. So the dashboard, the website
 * counter and the seat check all stay consistent, and the exception is visible as the date's
 * capacity. Not network-callable on its own: used by the dashboard's add-person action.
 */

export type CapacityRaise = { from: number; to: number; ownBefore: number | null }

export async function reserveSeatsAllowingException(
  payload: Payload,
  appointment: { id: string | number; capacity?: number | null; workshop?: unknown },
  guestCount: number,
  allowException: boolean,
): Promise<{ ok: true; raised: CapacityRaise | null; capacityNow: number } | { ok: false; available: number }> {
  const id = String(appointment.id)
  const first = await reserveSpotsAtomic(payload, id, guestCount)
  const capacity = capacityOf(appointment as never)
  if (first.success) return { ok: true, raised: null, capacityNow: capacity }
  const free = first.availableSpots ?? 0
  if (!allowException) return { ok: false, available: free }

  const extra = guestCount - free
  const ownBefore = typeof appointment.capacity === 'number' && appointment.capacity >= 1 ? appointment.capacity : null
  await payload.update({
    collection: 'workshop-appointments',
    id,
    data: { capacity: capacity + extra } as never, // the appointment hook raises the free-spots counter by `extra`
    overrideAccess: true,
    context: { skipAutoTranslate: true },
  })
  const second = await reserveSpotsAtomic(payload, id, guestCount)
  if (!second.success) {
    await revertCapacityException(payload, id, { from: capacity, to: capacity + extra, ownBefore })
    return { ok: false, available: second.availableSpots ?? 0 }
  }
  return { ok: true, raised: { from: capacity, to: capacity + extra, ownBefore }, capacityNow: capacity + extra }
}

/** Undo the capacity raise (the booking could not be created after all). Best-effort. */
export async function revertCapacityException(payload: Payload, appointmentId: string, raised: CapacityRaise): Promise<void> {
  try {
    await payload.update({
      collection: 'workshop-appointments',
      id: appointmentId,
      data: { capacity: raised.ownBefore } as never,
      overrideAccess: true,
      context: { skipAutoTranslate: true },
    })
  } catch (err) {
    payload.logger.error(`[seatException] Could not undo the capacity raise on ${appointmentId}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/** Write the exception into the date's internal notes (who, from → to). */
export async function noteCapacityException(payload: Payload, appointmentId: string, raised: CapacityRaise, who: string, person: string): Promise<void> {
  try {
    const appt = await payload.findByID({ collection: 'workshop-appointments', id: appointmentId, depth: 0, overrideAccess: true })
    const stamp = new Date().toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })
    const prev = typeof appt.notes === 'string' && appt.notes.trim() ? `${appt.notes.trim()}\n` : ''
    await payload.db.collections['workshop-appointments'].updateOne(
      { _id: appointmentId },
      { $set: { notes: `${prev}[${stamp}] Ausnahme: Kapazität von ${raised.from} auf ${raised.to} erhöht, damit ${person} noch dazukommt (${who}).` } },
    )
  } catch {
    /* the note is a convenience, never a reason to fail */
  }
}
