import type { Payload } from 'payload'

/**
 * `payload.db.collections[slug]` is a generically-typed Mongoose model (it
 * has no per-collection field types — Payload's schema is dynamic), so
 * `.lean()` results need an explicit shape for the one field we read here.
 */
interface AppointmentSpotsDoc {
  availableSpots?: number
}

/**
 * Atomic capacity operations for WorkshopAppointments.availableSpots.
 *
 * Replaces the read-then-write pattern (findByID → compute → update) used
 * throughout the booking flow, which is race-condition-prone under concurrent
 * requests — two customers booking the last spot at the same instant can both
 * read availableSpots=1, both compute 0, and both succeed, overselling by one.
 *
 * Single-document atomic ops work fine on Atlas M0 without multi-document
 * transactions — this isn't blocked by the no-transactions constraint (see
 * CLAUDE.md). We reach past the Payload Local API into the underlying
 * Mongoose model (`payload.db.collections[slug]`) because Payload's own
 * `update()` always does read-then-write internally.
 */

export interface ReserveSpotsResult {
  success: boolean
  /** Only set when success=false — the actual current value, for a clear error message. */
  availableSpots?: number
}

/**
 * Atomically decrement availableSpots by `seatsNeeded`, but only if enough
 * spots remain — guards against overselling under concurrent requests.
 */
export async function reserveSpotsAtomic(
  payload: Payload,
  appointmentId: string,
  seatsNeeded: number,
): Promise<ReserveSpotsResult> {
  const model = payload.db.collections['workshop-appointments']
  const result = await model.updateOne(
    { _id: appointmentId, availableSpots: { $gte: seatsNeeded } },
    { $inc: { availableSpots: -seatsNeeded } },
  )

  if (result.matchedCount === 0) {
    // Either the appointment doesn't exist, or availableSpots < seatsNeeded.
    // Re-fetch to report the real current value (best-effort — appointment
    // may since have been deleted, in which case we fall back to 0).
    const current = (await model.findOne({ _id: appointmentId }).lean()) as AppointmentSpotsDoc | null
    return {
      success: false,
      availableSpots: typeof current?.availableSpots === 'number' ? current.availableSpots : 0,
    }
  }

  return { success: true }
}

/**
 * Atomically increment availableSpots by `seatsToRestore`, capped at
 * `maxCapacity` so a restore can never push a slot above its configured max.
 * Capping atomically (via aggregation pipeline update) avoids the same
 * lost-update race in the other direction — e.g. a fast payment-failed retry
 * racing a manual admin edit.
 */
export async function releaseSpotsAtomic(
  payload: Payload,
  appointmentId: string,
  seatsToRestore: number,
  maxCapacity: number,
): Promise<{ availableSpots: number | null }> {
  const model = payload.db.collections['workshop-appointments']
  // Pipeline update ($set with $min) — computes the new value server-side in
  // one atomic op instead of read → clamp in JS → write, so a fast retry
  // (e.g. a duplicate payment-failed webhook delivery) can never push spots
  // above maxCapacity via a stale read.
  const updated = (await model
    .findOneAndUpdate(
      { _id: appointmentId },
      [
        {
          $set: {
            availableSpots: {
              $min: [{ $add: ['$availableSpots', seatsToRestore] }, maxCapacity],
            },
          },
        },
      ],
      { new: true },
    )
    .lean()) as AppointmentSpotsDoc | null

  return {
    availableSpots: typeof updated?.availableSpots === 'number' ? updated.availableSpots : null,
  }
}
