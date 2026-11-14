import type { Payload } from 'payload'

import { capacityOf } from '@/lib/appointmentCapacity'
import { seatsHoldingPlace } from '@/lib/seatCapacity'

/**
 * Real free seats of a date = capacity − confirmed seats that still hold a place − unpaid
 * checkout holds. This is the number the website's counter must show.
 */
export async function expectedFreeSeats(payload: Payload, appointmentId: string): Promise<{ expected: number; recentHold: boolean; appointment: Awaited<ReturnType<Payload['findByID']>> }> {
  const appointment = await payload.findByID({ collection: 'workshop-appointments', id: appointmentId, depth: 1, overrideAccess: true })
  const bookings = await payload.find({
    collection: 'workshop-bookings',
    where: { appointmentId: { equals: appointmentId } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  const held = bookings.docs.filter((b) => b.status === 'confirmed').reduce((sum, b) => sum + seatsHoldingPlace(b), 0)
  const pending = bookings.docs.filter((b) => b.status === 'pending').reduce((sum, b) => sum + Math.max(Number(b.guestCount) || 1, 1), 0)
  const recentHold = bookings.docs.some((b) => b.status === 'pending' && Date.now() - new Date(String(b.updatedAt)).getTime() < 60_000)
  return { expected: Math.max(capacityOf(appointment as never) - held - pending, 0), recentHold, appointment }
}

/**
 * "Zähler angleichen": set the counter to the real number. Only moves the counter, never a
 * booking. Safeguards: upcoming dates only; the counter must still be the number the person
 * saw (compare-and-set); refused while a checkout hold was touched in the last minute; the
 * change is written into the date's internal notes (who, from → to).
 */
export async function alignCounterCore(
  payload: Payload,
  params: { appointmentId: string; seen: number },
  by: string,
): Promise<{ ok: true; from: number; to: number } | { ok: false; error: string }> {
  const { expected, recentHold, appointment } = await expectedFreeSeats(payload, params.appointmentId)
  const appt = appointment as unknown as { dateTime?: string; notes?: string | null }
  if (new Date(String(appt.dateTime)).getTime() < Date.now()) return { ok: false, error: 'Dieser Termin liegt in der Vergangenheit.' }
  if (recentHold) return { ok: false, error: 'Gerade ist jemand mitten im Checkout für diesen Termin. Bitte in einer Minute noch einmal versuchen.' }

  const model = payload.db.collections['workshop-appointments']
  const result = await model.updateOne({ _id: params.appointmentId, availableSpots: params.seen }, { $set: { availableSpots: expected } })
  if (result.matchedCount === 0) return { ok: false, error: 'Die Zahl hat sich inzwischen geändert (jemand hat gebucht). Bitte Seite neu laden und noch einmal prüfen.' }

  const stamp = new Date().toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })
  const prev = typeof appt.notes === 'string' && appt.notes.trim() ? `${appt.notes.trim()}\n` : ''
  await model.updateOne({ _id: params.appointmentId }, { $set: { notes: `${prev}[${stamp}] Freie Plätze von ${params.seen} auf ${expected} angeglichen (${by}).` } })
  return { ok: true, from: params.seen, to: expected }
}
