import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

import {
  hydrateSeatDefaults,
  seatActionOptions,
  type AppointmentStatus,
  type PolicyEngineAppointment,
  type SeatAction,
} from '@/lib/policyEngine'
import type { BookingMagicLink, WorkshopAppointment, WorkshopBooking } from '@/payload-types'

export async function getPayloadClient(): Promise<Payload> {
  return getPayload({ config: await configPromise })
}

/**
 * Maps a WorkshopAppointment to the policy engine's AppointmentStatus,
 * reading WorkshopAppointments.cancellationStatus (plan §7).
 */
export function appointmentToPolicyStatus(
  appointment: WorkshopAppointment | null | undefined,
): AppointmentStatus {
  return appointment?.cancellationStatus === 'cancelled_by_organiser'
    ? 'CANCELLED_BY_ORGANISER'
    : 'SCHEDULED'
}

export type ResolvedMagicLink =
  | {
      ok: true
      magicLink: BookingMagicLink
      booking: WorkshopBooking
      appointment: WorkshopAppointment | null
    }
  | { ok: false; reason: 'not_found' | 'expired' }

/**
 * Resolves a manage-booking token to its booking + appointment. This is the
 * ONLY place a raw token is trusted — every API route and the page itself
 * calls through here, matching the downloadToken precedent
 * (orders/[orderId]/receipt): overrideAccess:true because the token IS the
 * credential, no login required.
 */
export async function resolveMagicLink(token: string): Promise<ResolvedMagicLink> {
  const payload = await getPayloadClient()

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { ok: false, reason: 'not_found' }
  }

  const links = await payload.find({
    collection: 'booking-magic-links',
    where: { token: { equals: token } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const magicLink = links.docs[0]
  if (!magicLink) return { ok: false, reason: 'not_found' }

  if (magicLink.expiresAt && new Date(magicLink.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: 'expired' }
  }

  const bookingId =
    typeof magicLink.bookingId === 'object' && magicLink.bookingId !== null
      ? magicLink.bookingId.id
      : magicLink.bookingId

  if (!bookingId) return { ok: false, reason: 'not_found' }

  let booking: WorkshopBooking
  try {
    booking = await payload.findByID({
      collection: 'workshop-bookings',
      id: String(bookingId),
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    return { ok: false, reason: 'not_found' }
  }

  let appointment: WorkshopAppointment | null = null
  if (booking.appointmentId) {
    try {
      appointment = await payload.findByID({
        collection: 'workshop-appointments',
        id: booking.appointmentId,
        depth: 1,
        overrideAccess: true,
      })
    } catch {
      appointment = null
    }
  }

  return { ok: true, magicLink, booking, appointment }
}

export interface SeatBundle {
  index: number
  recipientName: string
  seatStatus: string
  selfRebookingUsed: boolean
  options: SeatAction[]
}

/**
 * Builds the per-seat action bundle for every seat on a booking, re-running
 * the policy engine fresh against `now` — never cache/trust a previous
 * result across a request boundary. If `appointment` is null (deleted/
 * missing), every seat gets zero options rather than throwing — a booking
 * with no resolvable appointment has nothing safe to offer.
 */
export function getAllSeatBundles(
  booking: WorkshopBooking,
  appointment: WorkshopAppointment | null,
  now: Date = new Date(),
): SeatBundle[] {
  const rawSeats = booking.seats ?? []
  const guestCount = typeof booking.guestCount === 'number' ? booking.guestCount : rawSeats.length || 1

  // guestCount is the source of truth for "how many seats exist" — seats[]
  // only has entries where a guest name/note was filled in at checkout, so
  // it can be shorter than guestCount. Missing entries hydrate to defaults.
  const count = Math.max(guestCount, rawSeats.length)
  const bundles: SeatBundle[] = []

  for (let i = 0; i < count; i++) {
    const rawSeat = rawSeats[i] ?? {}
    const seat = hydrateSeatDefaults(rawSeat)

    let options: SeatAction[] = []
    if (appointment) {
      const policyAppointment: PolicyEngineAppointment = {
        dateTime: appointment.dateTime,
        status: appointmentToPolicyStatus(appointment),
      }
      options = seatActionOptions(seat, policyAppointment, now)
    }

    bundles.push({
      index: i,
      recipientName: rawSeat.recipientName ?? '',
      seatStatus: seat.seatStatus,
      selfRebookingUsed: seat.selfRebookingUsed,
      options,
    })
  }

  return bundles
}

export function getSeatBundle(
  booking: WorkshopBooking,
  appointment: WorkshopAppointment | null,
  seatIndex: number,
  now: Date = new Date(),
): SeatBundle | null {
  const bundles = getAllSeatBundles(booking, appointment, now)
  return bundles[seatIndex] ?? null
}

export type MutationLoadResult =
  | {
      error: 'not_found' | 'expired' | 'seat_not_found'
    }
  | {
      error: undefined
      payload: Payload
      booking: WorkshopBooking
      appointment: WorkshopAppointment | null
      magicLink: BookingMagicLink
      bundle: SeatBundle
    }

/**
 * Re-resolves the token and re-runs the policy engine immediately before a
 * mutation writes anything — never reuse a bundle computed earlier in the
 * request (e.g. from an initial GET). Time keeps moving between page load
 * and the click that submits an action, and this is the one place that
 * check is authoritative, not the UI.
 */
export async function loadFreshForMutation(
  token: string,
  seatIndex: number,
): Promise<MutationLoadResult> {
  const resolved = await resolveMagicLink(token)
  if (!resolved.ok) return { error: resolved.reason }

  const { booking, appointment, magicLink } = resolved
  const bundle = getSeatBundle(booking, appointment, seatIndex)
  if (!bundle) return { error: 'seat_not_found' }

  const payload = await getPayloadClient()
  return { error: undefined, payload, booking, appointment, magicLink, bundle }
}

/**
 * Persists a seat-level field update on a WorkshopBooking's seats[] array.
 * Payload array fields are replaced wholesale on update, so this reads the
 * current array, patches one entry, and writes the whole array back —
 * never a partial/indexed update.
 */
export async function updateSeat(
  payload: Payload,
  booking: WorkshopBooking,
  seatIndex: number,
  patch: Record<string, unknown>,
): Promise<WorkshopBooking> {
  const guestCount =
    typeof booking.guestCount === 'number' ? booking.guestCount : (booking.seats?.length ?? 1)
  const seats = Array.from({ length: Math.max(guestCount, booking.seats?.length ?? 0) }, (_, i) => ({
    ...(booking.seats?.[i] ?? {}),
  }))
  seats[seatIndex] = { ...seats[seatIndex], ...patch }

  return payload.update({
    collection: 'workshop-bookings',
    id: booking.id,
    data: { seats },
    overrideAccess: true,
  })
}

export type ActivityEventType =
  | 'order_placed'
  | 'voucher_purchased'
  | 'voucher_redeemed'
  | 'booking_rebooked'
  | 'booking_cancelled_no_refund'
  | 'refund_requested'
  | 'refund_completed'
  | 'appointment_cancelled_by_organiser'

/** Best-effort — a failed activity-log write must never fail the mutation it's logging. */
export async function logActivityEvent(
  payload: Payload,
  type: ActivityEventType,
  refId: string,
  summary: string,
): Promise<void> {
  try {
    await payload.create({
      collection: 'activity-events',
      data: { type, refId, summary },
      overrideAccess: true,
    })
  } catch (err) {
    payload.logger.error(
      `[activity-events] Failed to log ${type} for ${refId}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

const CANCEL_REASON_LABELS: Record<string, string> = {
  cannot_attend: 'Kann nicht teilnehmen',
  personal_health: 'Gesundheitliche Gründe',
  wrong_workshop: 'Falscher Workshop gebucht',
  workshop_cancelled: 'Workshop wurde abgesagt',
  other: 'Sonstiges',
}

export function cancelReasonLabel(reason: string | undefined | null): string {
  return (reason && CANCEL_REASON_LABELS[reason]) || 'Nicht angegeben'
}
