import { randomUUID } from 'crypto'

import type { Payload } from 'payload'

import { fmtDate, fmtTime } from '@/components/admin/roster/fetchRosterData'
import { releaseSpotsAtomic, reserveSpotsAtomic } from '@/lib/atomicSpots'
import { addBookingHistory, emailOutcome } from '@/lib/bookingHistory'
import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
import { seatHoldsPlace, seatsHoldingPlace, seatStatusAt } from '@/lib/seatCapacity'
import { getServerSideURL } from '@/utilities/getURL'
import { capacityOf } from '@/lib/appointmentCapacity'

/**
 * Core of "move only some seats" (see moveWorkshopSeats in the roster actions). Move only SOME of a booking's seats to another date (e.g. one person of a
 * group of 5). Same mechanism as a customer's own rebooking: the chosen seats
 * get their own NEW booking on the new date (linked back to this one), and
 * here they become "rebooked". Moving every remaining seat is just the
 * normal whole-booking move.
 *
 * Order of steps keeps a seat from ever being lost: reserve the new places
 * first → create the new booking → mark the old seats → release the old
 * places. Sequential writes only (MongoDB Atlas M0).
 */
export async function moveSeatsCore(
  payload: Payload,
  params: {
  bookingId: string
  seatIndexes: number[]
  newAppointmentId: string
  notifyCustomer: boolean
  },
  by: string,
): Promise<{ id: string; newBookingId: string; emailSent: boolean | null; whole: boolean }> {

  const booking = await payload.findByID({ collection: 'workshop-bookings', id: params.bookingId, depth: 0, overrideAccess: true })
  if (!booking.appointmentId) throw new Error('Diese Buchung hat keinen zugeordneten Termin.')
  if (booking.appointmentId === params.newAppointmentId) throw new Error('Das ist bereits der aktuelle Termin.')

  const total = Math.max(booking.guestCount ?? 1, booking.seats?.length ?? 0)
  const picked = [...new Set(params.seatIndexes)].filter((i) => Number.isInteger(i) && i >= 0 && i < total).sort((a, b) => a - b)
  if (picked.length === 0) throw new Error('Bitte mindestens eine Person auswählen.')
  for (const i of picked) {
    if (!seatHoldsPlace(seatStatusAt(booking, i))) throw new Error(`Platz ${i + 1} ist schon umgebucht oder storniert.`)
  }
  // Everything that is left on this date moves → plain whole-booking move.
  if (picked.length === seatsHoldingPlace(booking)) {
    return { id: params.bookingId, newBookingId: params.bookingId, emailSent: null, whole: true }
  }

  const newAppointment = await payload.findByID({ collection: 'workshop-appointments', id: params.newAppointmentId, depth: 1, overrideAccess: true })
  const workshop = newAppointment.workshop
  if (typeof workshop !== 'object' || workshop === null) throw new Error('Workshop-Daten konnten nicht geladen werden.')
  const maxCapacity = capacityOf(newAppointment)
  const n = picked.length

  const reserve = await reserveSpotsAtomic(payload, params.newAppointmentId, n)
  if (!reserve.success) throw new Error(`Am neuen Termin sind nur noch ${reserve.availableSpots ?? 0} Platz/Plätze frei.`)

  const dateTimeStr = String(newAppointment.dateTime ?? '')
  const newDate = dateTimeStr ? fmtDate(dateTimeStr) : ''
  const newTime = dateTimeStr ? `${fmtTime(dateTimeStr)} Uhr` : ''
  const buyer = [booking.firstName, booking.lastName].filter(Boolean).join(' ').trim() || booking.email || 'Gast'
  const price = booking.orderId || typeof workshop.basePrice !== 'number' ? (booking.pricePerPerson ?? 0) : workshop.basePrice

  let newBooking
  try {
    newBooking = await payload.create({
      collection: 'workshop-bookings',
      data: {
        status: 'confirmed',
        appointmentId: params.newAppointmentId,
        workshopTitle: workshop.title,
        workshopSlug: workshop.slug,
        date: newDate,
        time: newTime,
        firstName: booking.firstName ?? '',
        lastName: booking.lastName ?? '',
        ...(booking.email ? { email: booking.email } : {}),
        ...(booking.phone ? { phone: booking.phone } : {}),
        guestCount: n,
        pricePerPerson: price,
        totalPrice: price * n,
        // The buyer's own note travels with the buyer's seat.
        ...(picked.includes(0) && booking.notes ? { notes: booking.notes } : {}),
        ...((booking as { manualInfo?: unknown }).manualInfo ? { manualInfo: (booking as { manualInfo?: unknown }).manualInfo } : {}),
        seats: picked.map((i) => {
          const old = booking.seats?.[i]
          return {
            recipientName: old?.recipientName || (i === 0 ? buyer : `Begleitung von ${buyer}`),
            email: old?.email ?? undefined,
            giftNote: old?.giftNote ?? '',
            seatStatus: 'active' as const,
            selfRebookingUsed: false,
            rebookedFromBookingId: String(booking.id),
            rebookedFromSeatIndex: i,
          }
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      overrideAccess: true,
      context: { skipAutoTranslate: true },
    })
  } catch (err) {
    await releaseSpotsAtomic(payload, params.newAppointmentId, n, maxCapacity)
    throw err
  }
  const newId = String(newBooking.id)
  const label = picked.map((i) => i + 1).join(', ')
  await addBookingHistory(payload, newId, {
    type: 'created_rebooking',
    summary: `Vom Team verschoben von ${booking.date} · ${booking.time} (Buchung ${booking.id}, Platz ${label})`,
    by,
  })

  // Mark all chosen seats in ONE write — a seat-by-seat update would overwrite its own earlier changes.
  const now = new Date().toISOString()
  const seats = Array.from({ length: total }, (_, i) => ({ ...(booking.seats?.[i] ?? {}) }))
  for (const i of picked) {
    seats[i] = {
      ...seats[i],
      seatStatus: 'rebooked',
      cancelledAt: now,
      cancelledReason: 'other',
      rebookedToBookingId: newId,
    }
  }
  try {
    await payload.update({
      collection: 'workshop-bookings',
      id: params.bookingId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { seats } as any,
      overrideAccess: true,
      context: { skipAutoTranslate: true },
    })
  } catch (err) {
    throw new Error(
      `Die neue Buchung (${newId}) wurde angelegt, aber die alten Plätze konnten nicht umgestellt werden. Bitte im Admin prüfen. ${err instanceof Error ? err.message : ''}`,
    )
  }

  try {
    const oldAppointment = await payload.findByID({ collection: 'workshop-appointments', id: booking.appointmentId, depth: 1, overrideAccess: true })
    const oldMax = capacityOf(oldAppointment)
    await releaseSpotsAtomic(payload, booking.appointmentId, n, oldMax)
  } catch (err) {
    payload.logger.error(`[moveWorkshopSeats] Seats moved from ${params.bookingId}, but releasing the old places failed: ${err instanceof Error ? err.message : err}`)
  }

  let emailSent: boolean | null = null
  const base = getServerSideURL().replace(/\/$/, '')
  if (params.notifyCustomer && booking.email) {
    let manageUrl = `${base}/account/orders`
    try {
      const link = await payload.create({
        collection: 'booking-magic-links',
        data: { token: randomUUID(), bookingId: newId, scope: 'self-service', issuedAt: new Date().toISOString() },
        overrideAccess: true,
      })
      manageUrl = `${base}/manage-booking/${link.token}`
    } catch {
      /* the email still works with the account link */
    }
    const r = await sendTemplateEmail({
      to: [{ email: booking.email, name: booking.firstName ?? undefined }],
      templateId: BREVO_TEMPLATES.CUSTOMER_REBOOKED,
      params: {
        FIRST_NAME: booking.firstName || 'Gast',
        WORKSHOP_TITLE: String(workshop.title ?? ''),
        OLD_WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
        NEW_WORKSHOP_TITLE: String(workshop.title ?? ''),
        OLD_DATE: String(booking.date ?? ''),
        OLD_TIME: String(booking.time ?? ''),
        NEW_DATE: newDate,
        NEW_TIME: newTime,
        MANAGE_URL: manageUrl,
      },
    })
    emailSent = r.success
  }
  await addBookingHistory(payload, params.bookingId, {
    type: 'moved',
    summary: `Platz ${label} verschoben auf ${newDate} · ${newTime} (neue Buchung ${newId}) · ${
      params.notifyCustomer ? emailOutcome(booking.email, emailSent) : 'ohne E-Mail (bewusst nicht benachrichtigt)'
    }`,
    by,
  })
  return { id: params.bookingId, newBookingId: newId, emailSent, whole: false }
}

