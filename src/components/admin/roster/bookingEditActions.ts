'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { addSeats, cancelSeat, editBookingDetails, releaseSeats, type ReleaseReason } from '@/lib/bookingEdit'
import type { ManualChannel } from '@/lib/manualBooking'

import { refreshPublicAvailability } from './publicAvailability'
import { adminDisplayName, requireAdminUser } from './requireAdmin'

/** Edit a booking after it was added: phone, price, source, number of seats. */

type Result = { ok: true } | { ok: false; error: string }

async function run(fn: (by: string, payload: Awaited<ReturnType<typeof getPayload>>) => Promise<void>): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    await fn(adminDisplayName(user), payload)
    refreshPublicAvailability()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message === 'Unauthorized' ? 'Keine Berechtigung.' : e instanceof Error ? e.message : 'Unbekannter Fehler.' }
  }
}

export async function updateBookingDetails(params: { bookingId: string; phone?: string; pricePerPerson?: number; channel?: ManualChannel | '' }): Promise<Result> {
  return run((by, payload) => editBookingDetails(payload, params.bookingId, params, by))
}

export async function addBookingSeats(params: { bookingId: string; count: number }): Promise<Result> {
  return run((by, payload) => addSeats(payload, params.bookingId, params.count, by))
}

export async function cancelBookingSeat(params: { bookingId: string; seatIndex: number }): Promise<Result> {
  return run((by, payload) => cancelSeat(payload, params.bookingId, params.seatIndex, by))
}

export async function releaseBookingSeats(params: { bookingId: string; seatIndexes: number[]; reason: ReleaseReason; note?: string }): Promise<Result> {
  return run(async (by, payload) => {
    await releaseSeats(payload, params, by)
  })
}
