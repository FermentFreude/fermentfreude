import crypto from 'crypto'

import { NextRequest, NextResponse } from 'next/server'

import { getAdminRecipients } from '@/lib/adminNotification'
import { releaseSpotsAtomic, reserveSpotsAtomic } from '@/lib/atomicSpots'
import { BREVO_TEMPLATES, sendTemplateEmail, sendTransactionalEmail } from '@/lib/brevo'
import { cancelReasonLabel, loadFreshForMutation, logActivityEvent, updateSeat } from '@/lib/manageBooking'
import { getServerSideURL } from '@/utilities/getURL'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/manage-booking/[token]/rebook-now
 *  body: { seatIndex: number, reason: string, newAppointmentId: string }
 *
 *  REBOOK_NOW — moves this ONE seat to a new date. Booking-level fields
 *  (date/time/appointmentId) are shared across every seat in a booking,
 *  so a single seat changing date means creating a NEW WorkshopBooking
 *  (guestCount:1) rather than editing the original — the original seat
 *  becomes 'rebooked' with rebookedToBookingId pointing at it (plan
 *  §4.1, BR-024 traceability). No new charge (plan §9's Brevo copy is
 *  explicit about this) — the new booking is created 'confirmed'
 *  directly, the same mechanism already used for phone/manual bookings.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let body: { seatIndex?: unknown; reason?: unknown; newAppointmentId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const seatIndex = typeof body.seatIndex === 'number' ? body.seatIndex : NaN
  const reason = typeof body.reason === 'string' ? body.reason : 'other'
  const newAppointmentId = typeof body.newAppointmentId === 'string' ? body.newAppointmentId : ''

  if (!Number.isInteger(seatIndex) || seatIndex < 0) {
    return NextResponse.json({ success: false, error: 'Invalid seatIndex' }, { status: 400 })
  }
  if (!newAppointmentId) {
    return NextResponse.json({ success: false, error: 'newAppointmentId is required' }, { status: 400 })
  }

  const loaded = await loadFreshForMutation(token, seatIndex)
  if (loaded.error) {
    const status = loaded.error === 'expired' ? 410 : 404
    return NextResponse.json({ success: false, error: loaded.error }, { status })
  }

  const { payload, booking, bundle } = loaded

  // REBOOK_NOW (self-service, AGB §4.6) and SELECT_REPLACEMENT_WORKSHOP
  // (organiser-cancellation, plan §7) share this endpoint — the policy
  // engine never returns both at once for the same seat (they're on
  // mutually exclusive branches), so exactly one of these is ever true.
  // Computed here (before the crash-recovery check below) because the
  // resume path needs isSelfServiceRebook too.
  const isReplacement = bundle.options.includes('SELECT_REPLACEMENT_WORKSHOP')
  const isSelfServiceRebook = bundle.options.includes('REBOOK_NOW')

  // ─── Crash recovery ────────────────────────────────────────────────
  // A prior request for this exact seat may have already reserved a spot
  // and created the new booking, then been interrupted before the original
  // seat got marked 'rebooked' (dropped connection, server restart, etc.).
  // Without this check, a naive retry would still see the seat as 'active'
  // and create a SECOND new booking, leaving the customer holding two.
  // Detect that exact orphan (a workshop-bookings doc whose seat traces
  // back to this booking + seatIndex) and resume instead of reprocessing.
  const orphanResult = await payload.find({
    collection: 'workshop-bookings',
    where: {
      and: [
        { 'seats.rebookedFromBookingId': { equals: String(booking.id) } },
        { 'seats.rebookedFromSeatIndex': { equals: seatIndex } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  if (orphanResult.docs.length > 0) {
    const resumeBooking = orphanResult.docs[0]
    const originalSeat = booking.seats?.[seatIndex]
    const alreadyResolved =
      originalSeat?.seatStatus !== 'active' &&
      originalSeat?.rebookedToBookingId === String(resumeBooking.id)

    const existingLinks = await payload.find({
      collection: 'booking-magic-links',
      where: { bookingId: { equals: String(resumeBooking.id) } },
      limit: 1,
      overrideAccess: true,
    })
    let resumeToken = existingLinks.docs[0]?.token
    if (!resumeToken) {
      resumeToken = crypto.randomUUID()
      await payload.create({
        collection: 'booking-magic-links',
        data: {
          token: resumeToken,
          bookingId: resumeBooking.id,
          scope: 'self-service',
          issuedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })
    }
    const resumeManageUrl = `${getServerSideURL().replace(/\/$/, '')}/manage-booking/${resumeToken}`

    if (!alreadyResolved) {
      // The true crash window: new booking exists, original seat was never
      // marked resolved. Finish the deferred steps now — don't touch
      // capacity or create another booking, that part already happened.
      const now = new Date().toISOString()
      await updateSeat(payload, booking, seatIndex, {
        seatStatus: 'rebooked',
        selfRebookingUsed: originalSeat?.selfRebookingUsed ?? isSelfServiceRebook,
        cancelledAt: originalSeat?.cancelledAt ?? now,
        cancelledReason: originalSeat?.cancelledReason ?? reason,
        rebookedToBookingId: String(resumeBooking.id),
      })
      await logActivityEvent(
        payload,
        'booking_rebooked',
        String(booking.id),
        `${booking.firstName ?? 'Gast'} ${booking.lastName ?? ''} — von ${booking.workshopTitle} (${booking.date}) auf ${resumeBooking.date} umgebucht (nach unterbrochener Anfrage fortgesetzt)`.trim(),
      )
      if (booking.email) {
        await sendTemplateEmail({
          to: [{ email: booking.email, name: booking.firstName ?? undefined }],
          templateId: BREVO_TEMPLATES.CUSTOMER_REBOOKED,
          params: {
            FIRST_NAME: booking.firstName || 'Gast',
            WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
            OLD_WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
            NEW_WORKSHOP_TITLE: String(resumeBooking.workshopTitle ?? ''),
            OLD_DATE: String(booking.date ?? ''),
            OLD_TIME: String(booking.time ?? ''),
            NEW_DATE: String(resumeBooking.date ?? ''),
            NEW_TIME: String(resumeBooking.time ?? ''),
            MANAGE_URL: resumeManageUrl,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      newBookingId: resumeBooking.id,
      manageUrl: resumeManageUrl,
      resumed: true,
    })
  }

  if (!isReplacement && !isSelfServiceRebook) {
    return NextResponse.json(
      { success: false, error: 'action_not_allowed', message: 'Rebooking is no longer available for this seat.' },
      { status: 409 },
    )
  }

  if (newAppointmentId === booking.appointmentId) {
    return NextResponse.json(
      { success: false, error: 'same_appointment', message: 'Please pick a different date.' },
      { status: 400 },
    )
  }

  let newAppointment
  try {
    newAppointment = await payload.findByID({
      collection: 'workshop-appointments',
      id: newAppointmentId,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Target appointment not found' }, { status: 404 })
  }

  const newWorkshop = typeof newAppointment.workshop === 'object' ? newAppointment.workshop : null
  if (!newWorkshop) {
    return NextResponse.json({ success: false, error: 'Target workshop not found' }, { status: 404 })
  }
  // Self-service rebooking stays within the same workshop (AGB §4.6).
  // Organiser-cancellation replacement can be any regular workshop (plan
  // §7: "rebook to any available regular workshop") — the customer's
  // original workshop/date is gone, restricting them to it would be wrong.
  if (isSelfServiceRebook && newWorkshop.slug !== booking.workshopSlug) {
    return NextResponse.json(
      { success: false, error: 'workshop_mismatch', message: 'The selected date is not for this workshop.' },
      { status: 400 },
    )
  }

  if (!newAppointment.isPublished || new Date(newAppointment.dateTime) < new Date()) {
    return NextResponse.json(
      { success: false, error: 'unavailable', message: 'This date is no longer available.' },
      { status: 410 },
    )
  }

  const reserveResult = await reserveSpotsAtomic(payload, newAppointmentId, 1)
  if (!reserveResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'sold_out',
        message: 'This date just sold out — please pick another.',
      },
      { status: 409 },
    )
  }

  const dateDisplay = new Date(newAppointment.dateTime).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Vienna',
  })
  const timeDisplay = new Date(newAppointment.dateTime).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Vienna',
  })

  const pricePerPerson = typeof booking.pricePerPerson === 'number' ? booking.pricePerPerson : 0

  // For a same-workshop self-service rebook these are identical to the
  // original booking's; for an organiser-cancellation replacement onto a
  // DIFFERENT workshop, the new booking must describe the workshop it's
  // actually for, not the one that got cancelled.
  const newWorkshopSlug = isReplacement ? (newWorkshop.slug ?? booking.workshopSlug) : booking.workshopSlug
  const newWorkshopTitle = isReplacement ? (newWorkshop.title ?? booking.workshopTitle) : booking.workshopTitle

  let newBooking
  try {
    newBooking = await payload.create({
      collection: 'workshop-bookings',
      data: {
        status: 'confirmed',
        workshopSlug: newWorkshopSlug,
        workshopTitle: newWorkshopTitle,
        appointmentId: newAppointmentId,
        date: dateDisplay,
        time: timeDisplay,
        guestCount: 1,
        pricePerPerson,
        totalPrice: pricePerPerson,
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        phone: booking.phone,
        seats: [
          {
            recipientName: booking.seats?.[seatIndex]?.recipientName ?? '',
            seatStatus: 'active',
            selfRebookingUsed: false,
            rebookedFromBookingId: String(booking.id),
            rebookedFromSeatIndex: seatIndex,
          },
        ],
      },
      overrideAccess: true,
    })
  } catch (err) {
    // Roll back the reservation — without this, a failed booking-create
    // still leaves the spot permanently decremented with nothing to show
    // for it, silently shrinking capacity on the target date.
    const rollbackMaxCapacity = newWorkshop.maxCapacityPerSlot ?? 12
    await releaseSpotsAtomic(payload, newAppointmentId, 1, rollbackMaxCapacity).catch(() => {})
    payload.logger.error(
      `[manage-booking] Failed to create rebooked booking for original ${booking.id}: ${err instanceof Error ? err.message : String(err)}`,
    )
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 })
  }

  // New magic link so the customer can manage THIS new booking too.
  const newToken = crypto.randomUUID()
  await payload.create({
    collection: 'booking-magic-links',
    data: {
      token: newToken,
      bookingId: newBooking.id,
      scope: 'self-service',
      issuedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  const now = new Date().toISOString()
  await updateSeat(payload, booking, seatIndex, {
    seatStatus: 'rebooked',
    // Only the self-service AGB §4.6 right gets marked "used" — organiser
    // cancellation is a separate entitlement (plan §2/§7) that isn't gated
    // by, or counted against, this flag at all.
    selfRebookingUsed: isSelfServiceRebook,
    cancelledAt: now,
    cancelledReason: reason,
    rebookedToBookingId: String(newBooking.id),
  })

  await logActivityEvent(
    payload,
    'booking_rebooked',
    String(booking.id),
    `${booking.firstName ?? 'Gast'} ${booking.lastName ?? ''} — von ${booking.workshopTitle} (${booking.date}) auf ${dateDisplay} umgebucht`.trim(),
  )

  const manageUrl = `${getServerSideURL().replace(/\/$/, '')}/manage-booking/${newToken}`

  // ─── Customer confirmation email (best-effort) ───────────────────
  if (booking.email) {
    await sendTemplateEmail({
      to: [{ email: booking.email, name: booking.firstName ?? undefined }],
      templateId: BREVO_TEMPLATES.CUSTOMER_REBOOKED,
      params: {
        FIRST_NAME: booking.firstName || 'Gast',
        // Same value for a same-workshop rebook; genuinely different for an
        // organiser-cancellation replacement onto another workshop — always
        // sending both means the template doesn't need two variants.
        WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
        OLD_WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
        NEW_WORKSHOP_TITLE: newWorkshopTitle,
        OLD_DATE: String(booking.date ?? ''),
        OLD_TIME: String(booking.time ?? ''),
        NEW_DATE: dateDisplay,
        NEW_TIME: timeDisplay,
        MANAGE_URL: manageUrl,
      },
    })
  }

  // ─── Admin alert (best-effort) ─────────────────────────────────────
  try {
    const htmlContent = `
<h2 style="font-family:sans-serif;margin-bottom:16px">Umbuchung: ${String(booking.workshopTitle ?? '')}</h2>
<table style="font-family:sans-serif;border-collapse:collapse;font-size:14px">
  <tr><td style="padding:4px 12px 4px 0;color:#555">Kund:in</td><td style="padding:4px 0">${booking.firstName ?? ''} ${booking.lastName ?? ''} ${booking.email ? `&lt;${booking.email}&gt;` : ''}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Von</td><td style="padding:4px 0">${booking.date} ${booking.time}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Auf</td><td style="padding:4px 0">${dateDisplay} ${timeDisplay}</td></tr>
  <tr><td style="padding:16px 12px 4px 0;color:#555;border-top:1px solid #eee">Neue Buchungs-ID</td><td style="padding:16px 0 4px;border-top:1px solid #eee;font-family:monospace">${newBooking.id}</td></tr>
</table>`
    await sendTransactionalEmail({
      to: getAdminRecipients(),
      subject: `Umbuchung: ${String(booking.workshopTitle ?? '')} → ${dateDisplay}`,
      htmlContent,
    })
  } catch (err) {
    payload.logger.error(
      `[manage-booking] Failed to send admin alert for rebook-now on booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return NextResponse.json({ success: true, newBookingId: newBooking.id, manageUrl })
}
