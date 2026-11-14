import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'

import { FALLBACK_CAPACITY, workshopCapacity } from '@/lib/appointmentCapacity'

/**
 * Keeps the "free spots" counter of a date in step with its capacity.
 *
 * Capacity of a date = its own "Kapazität für diesen Termin" if filled in,
 * otherwise the workshop's standard capacity. Free spots = capacity − booked.
 * So when a founder changes the capacity of a date, the counter moves by the
 * same amount — and a capacity below the seats already booked is refused.
 */

type Doc = { id?: string | number; capacity?: number | null; availableSpots?: number | null; workshop?: unknown }

async function workshopCapacityFor(req: Parameters<CollectionBeforeChangeHook>[0]['req'], workshop: unknown): Promise<number> {
  if (workshop && typeof workshop === 'object') return workshopCapacity(workshop) ?? FALLBACK_CAPACITY
  if (workshop === undefined || workshop === null || workshop === '') return FALLBACK_CAPACITY
  try {
    const w = await req.payload.findByID({ collection: 'workshops', id: String(workshop), depth: 0, overrideAccess: true })
    return workshopCapacity(w) ?? FALLBACK_CAPACITY
  } catch {
    return FALLBACK_CAPACITY
  }
}

const own = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : null
}

export const syncAppointmentCapacity: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  const next = data as Doc
  const prev = (originalDoc ?? {}) as Doc

  const workshopId = next.workshop ?? prev.workshop
  const standard = await workshopCapacityFor(req, workshopId)
  const newCap = own(next.capacity !== undefined ? next.capacity : prev.capacity) ?? standard

  if (operation === 'create') {
    // A new date has no bookings yet: all of its capacity is free (scripts that need an exact value can opt out).
    if (!req.context?.keepAvailableSpots) next.availableSpots = newCap
    return data
  }

  const prevStandard = await workshopCapacityFor(req, prev.workshop)
  const oldCap = own(prev.capacity) ?? prevStandard
  const manual = next.availableSpots !== undefined && next.availableSpots !== prev.availableSpots
  if (newCap !== oldCap && !manual) {
    const current = Number(prev.availableSpots ?? oldCap)
    const updated = current + (newCap - oldCap)
    if (updated < 0) {
      const booked = oldCap - current
      throw new Error(`Für diesen Termin sind schon ${booked} Plätze belegt. Die Kapazität kann nicht unter ${booked} liegen.`)
    }
    next.availableSpots = updated
  }
  if (next.availableSpots !== undefined && next.availableSpots !== null && Number(next.availableSpots) > newCap) {
    throw new Error(`Freie Plätze (${next.availableSpots}) können nicht höher sein als die Kapazität dieses Termins (${newCap}).`)
  }
  return data
}

/** The public pages cache the free-seat numbers; refresh them when a date changes here. */
export const refreshAvailabilityCache: CollectionAfterChangeHook = ({ doc }) => {
  try {
    revalidateTag('workshop-appointments')
  } catch {
    /* not inside a Next.js request (scripts) */
  }
  return doc
}

/**
 * Workshops: when the STANDARD capacity changes, every future date that has no
 * capacity of its own follows it (its free-spots counter moves by the same amount).
 */
export const validateStandardCapacity: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (operation !== 'update' || !originalDoc) return data
  const oldCap = own((originalDoc as { maxCapacityPerSlot?: number }).maxCapacityPerSlot)
  const newCap = own((data as { maxCapacityPerSlot?: number }).maxCapacityPerSlot)
  if (oldCap === null || newCap === null || newCap >= oldCap) return data
  const delta = newCap - oldCap
  const future = await req.payload.find({
    collection: 'workshop-appointments',
    where: { and: [{ workshop: { equals: String(originalDoc.id) } }, { dateTime: { greater_than: new Date().toISOString() } }] },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  for (const a of future.docs as unknown as Doc[]) {
    if (own(a.capacity) !== null) continue
    if (Number(a.availableSpots ?? oldCap) + delta < 0) {
      const booked = oldCap - Number(a.availableSpots ?? oldCap)
      throw new Error(`Ein kommender Termin hat schon ${booked} gebuchte Plätze. Die Standard-Kapazität kann nicht unter ${booked} gesenkt werden. Stelle für diesen Termin eine eigene Kapazität ein oder buche Plätze um.`)
    }
  }
  return data
}

export const followStandardCapacity: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || !previousDoc) return doc
  const oldCap = own((previousDoc as { maxCapacityPerSlot?: number }).maxCapacityPerSlot)
  const newCap = own((doc as { maxCapacityPerSlot?: number }).maxCapacityPerSlot)
  if (oldCap === null || newCap === null || oldCap === newCap) return doc
  const delta = newCap - oldCap
  const future = await req.payload.find({
    collection: 'workshop-appointments',
    where: { and: [{ workshop: { equals: String(doc.id) } }, { dateTime: { greater_than: new Date().toISOString() } }] },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  const model = req.payload.db.collections['workshop-appointments']
  for (const a of future.docs as unknown as Doc[]) {
    if (own(a.capacity) !== null) continue // this date has its own capacity
    // One atomic update per date (sequential — MongoDB Atlas M0), never below 0.
    await model.updateOne({ _id: a.id }, [{ $set: { availableSpots: { $max: [0, { $add: ['$availableSpots', delta] }] } } }])
  }
  try {
    revalidateTag('workshop-appointments')
  } catch {
    /* not inside a Next.js request */
  }
  return doc
}
