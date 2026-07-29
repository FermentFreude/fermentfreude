import crypto from 'crypto'

import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
import { logActivityEvent } from '@/lib/manageBooking'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * handleOrganiserCancellation — WorkshopAppointments afterChange hook.
 *
 * Fires once, the moment cancellationStatus transitions INTO
 * 'cancelled_by_organiser' (never on any other edit to an already-cancelled
 * appointment, and never on the way back out — un-cancelling is not a
 * supported flow, see plan §7). For every confirmed booking on this
 * appointment:
 *  - every still-`active` seat flips to `organiser_cancelled_pending`
 *    (seats that already resolved some other way — e.g. already refunded
 *    through the self-service flow before the organiser also cancelled —
 *    are left alone, matching "one seat = one independent lifecycle")
 *  - mints a fresh booking-magic-links row, scope: 'organiser-cancellation'
 *  - sends the ORGANISER_CANCELLED email with that link
 *
 * No automatic rebooking, no automatic voucher (BR-050/052) — the customer
 * chooses via the magic link, same as every other branch in this system.
 * No admin email for this — they just did it themselves (plan §9).
 *
 * MongoDB Atlas M0: sequential writes only — no Promise.all.
 */
export const handleOrganiserCancellation: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== 'update') return doc
  if (doc.cancellationStatus !== 'cancelled_by_organiser') return doc
  if (previousDoc?.cancellationStatus === 'cancelled_by_organiser') return doc

  const { payload } = req
  const appointmentId = String(doc.id)

  const bookings = await payload.find({
    collection: 'workshop-bookings',
    where: {
      and: [{ appointmentId: { equals: appointmentId } }, { status: { equals: 'confirmed' } }],
    },
    limit: 200,
    overrideAccess: true,
  })

  const SERVER_URL = getServerSideURL().replace(/\/$/, '')
  let affectedBookingCount = 0

  for (const booking of bookings.docs) {
    const seats = [...(booking.seats ?? [])]
    const guestCount =
      typeof booking.guestCount === 'number' ? booking.guestCount : seats.length || 1
    const seatCount = Math.max(guestCount, seats.length)

    let anyAffected = false
    for (let i = 0; i < seatCount; i++) {
      const seat = seats[i] ?? {}
      const currentStatus = seat.seatStatus ?? 'active'
      if (currentStatus === 'active') {
        seats[i] = { ...seat, seatStatus: 'organiser_cancelled_pending' }
        anyAffected = true
      }
    }
    if (!anyAffected) continue
    affectedBookingCount++

    try {
      await payload.update({
        collection: 'workshop-bookings',
        id: booking.id,
        data: { seats },
        overrideAccess: true,
      })
    } catch (err) {
      payload.logger.error(
        `[handleOrganiserCancellation] Failed to update seats on booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`,
      )
      continue
    }

    const token = crypto.randomUUID()
    try {
      await payload.create({
        collection: 'booking-magic-links',
        data: {
          token,
          bookingId: booking.id,
          scope: 'organiser-cancellation',
          issuedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })
    } catch (err) {
      payload.logger.error(
        `[handleOrganiserCancellation] Failed to create magic link for booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`,
      )
      continue
    }

    if (booking.email) {
      await sendTemplateEmail({
        to: [{ email: booking.email, name: booking.firstName ?? undefined }],
        templateId: BREVO_TEMPLATES.ORGANISER_CANCELLED,
        params: {
          FIRST_NAME: booking.firstName || 'Gast',
          WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
          WORKSHOP_DATE: String(booking.date ?? ''),
          WORKSHOP_TIME: String(booking.time ?? ''),
          REASON:
            typeof doc.cancellationReason === 'string' && doc.cancellationReason.trim()
              ? doc.cancellationReason.trim()
              : 'Der Termin musste leider abgesagt werden.',
          MANAGE_BOOKING_URL: `${SERVER_URL}/manage-booking/${token}`,
        },
      })
    }
  }

  const dateDisplay = (() => {
    try {
      return new Date(doc.dateTime as string).toLocaleDateString('de-DE')
    } catch {
      return String(doc.dateTime ?? '')
    }
  })()

  await logActivityEvent(
    payload,
    'appointment_cancelled_by_organiser',
    appointmentId,
    `Termin ${dateDisplay} abgesagt — ${affectedBookingCount} Buchung(en) betroffen`,
  )

  return doc
}
