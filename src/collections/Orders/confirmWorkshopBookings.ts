import { randomUUID } from 'crypto'

import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail, sendTransactionalEmail } from '@/lib/brevo'
import { generateBookingICS } from '@/lib/generateBookingICS'

/**
 * confirmWorkshopBookings — Orders afterChange hook.
 *
 * When an order is created (payment confirmed), find any pending
 * WorkshopBooking records that match the order's workshop items
 * and mark them as "confirmed".
 *
 * Workshop items are identified by their product having a slug
 * starting with "workshop-".
 *
 * Matching strategy (in priority order):
 *  1. workshopSlug + guestCount + customer email → exact match
 *  2. workshopSlug + guestCount → fallback (guest without email on booking)
 *  3. workshopSlug only → last resort
 *
 * MongoDB Atlas M0: sequential writes only — no Promise.all.
 */
export const confirmWorkshopBookings: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const { payload } = req
  const transactionRef = Array.isArray(doc.transactions) ? doc.transactions[0] : undefined
  const transactionId =
    transactionRef && typeof transactionRef === 'object' ? transactionRef.id : transactionRef
  let cartId: string | undefined

  if (transactionId) {
    try {
      const transaction = await payload.findByID({
        collection: 'transactions',
        id: transactionId,
        depth: 0,
        overrideAccess: true,
      })

      cartId =
        typeof transaction.cart === 'object'
          ? transaction.cart?.id || undefined
          : transaction.cart || undefined
    } catch {
      // Non-fatal: fall back to legacy matching below.
    }
  }

  const items: {
    product?: string | { id?: string; slug?: string } | null
    quantity?: number
  }[] = doc.items ?? []

  // Resolve customer fields — from order or fallback to user record
  const customerId = typeof doc.customer === 'object' ? doc.customer?.id : doc.customer
  let customerEmail: string | undefined = doc.customerEmail || undefined
  let customerFirstName: string | undefined
  let customerLastName: string | undefined
  let customerPhone: string | undefined = doc.customerPhone || undefined
  let customerDietSpecs: string | undefined = doc.customerDietSpecs || undefined

  if (customerId) {
    try {
      const user = await payload.findByID({
        collection: 'users',
        id: customerId,
        depth: 0,
        overrideAccess: true,
      })
      if (!customerEmail) customerEmail = user?.email || undefined
      // User.name is a single field — use it as firstName fallback only
      if (user?.name) customerFirstName = user.name
    } catch {
      // Non-fatal: booking still gets confirmed
    }
  }

  // Prefer checkout-supplied data over user record.
  const docAny = doc as unknown as Record<string, string | null | undefined>
  if (typeof docAny.customerFirstName === 'string' && docAny.customerFirstName.trim().length > 0) {
    customerFirstName = docAny.customerFirstName.trim()
  }
  if (typeof docAny.customerLastName === 'string' && docAny.customerLastName.trim().length > 0) {
    customerLastName = docAny.customerLastName.trim()
  }
  // Legacy fallback: old orders only have customerName (combined) — split on first space
  if (!customerFirstName && typeof doc.customerName === 'string' && doc.customerName.trim().length > 0) {
    const full = doc.customerName.trim()
    const spaceIdx = full.indexOf(' ')
    customerFirstName = spaceIdx > 0 ? full.slice(0, spaceIdx) : full
    if (spaceIdx > 0 && !customerLastName) customerLastName = full.slice(spaceIdx + 1)
  }
  if (typeof doc.customerPhone === 'string' && doc.customerPhone.trim().length > 0) {
    customerPhone = doc.customerPhone.trim()
  }
  if (typeof doc.customerDietSpecs === 'string' && doc.customerDietSpecs.trim().length > 0) {
    customerDietSpecs = doc.customerDietSpecs.trim()
  }

  for (const item of items) {
    const productRef = item?.product
    if (!productRef) continue

    let productSlug: string | null = null

    if (typeof productRef === 'string') {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: productRef,
          depth: 0,
          overrideAccess: true,
        })
        productSlug = (product as unknown as Record<string, unknown>)?.slug as string | null
      } catch {
        continue
      }
    } else if (typeof productRef === 'object') {
      productSlug = (productRef as Record<string, unknown>).slug as string | null
    }

    // Only process workshop products
    if (!productSlug || !productSlug.startsWith('workshop-')) continue

    const workshopSlug = productSlug.replace('workshop-', '')
    const guestCount = item.quantity ?? 1

    // ── Strategy 1: match by cart ID + workshop + guest count ──
    // Also matches already-confirmed bookings (status may be 'confirmed' if
    // the charge.succeeded webhook fired before this hook ran — race condition
    // on Stripe event ordering). orderId is always stamped here so the receipt
    // route can look up bookings by orderId reliably.
    let booking = null

    if (cartId) {
      const byCart = await payload.find({
        collection: 'workshop-bookings',
        where: {
          and: [
            { cartSlug: { equals: cartId } },
            { workshopSlug: { equals: workshopSlug } },
            { status: { in: ['pending', 'confirmed'] } },
            { guestCount: { equals: guestCount } },
          ],
        },
        sort: '-createdAt',
        limit: 1,
        overrideAccess: true,
      })
      if (byCart.totalDocs > 0) booking = byCart.docs[0]
    }

    // ── Strategy 2: match by workshopSlug + guestCount + email ──

    if (!booking && customerEmail) {
      const byEmail = await payload.find({
        collection: 'workshop-bookings',
        where: {
          and: [
            { workshopSlug: { equals: workshopSlug } },
            { status: { equals: 'pending' } },
            { guestCount: { equals: guestCount } },
            { email: { equals: customerEmail } },
          ],
        },
        sort: '-createdAt',
        limit: 1,
        overrideAccess: true,
      })
      if (byEmail.totalDocs > 0) booking = byEmail.docs[0]
    }

    // ── Strategy 3: match by workshopSlug + guestCount (no email on booking) ──
    if (!booking) {
      const byCount = await payload.find({
        collection: 'workshop-bookings',
        where: {
          and: [
            { workshopSlug: { equals: workshopSlug } },
            { status: { equals: 'pending' } },
            { guestCount: { equals: guestCount } },
            { email: { exists: false } },
          ],
        },
        sort: '-createdAt',
        limit: 1,
        overrideAccess: true,
      })
      if (byCount.totalDocs > 0) booking = byCount.docs[0]
    }

    // ── Strategy 4: last resort — any pending booking for this workshop ──
    if (!booking) {
      const bySlug = await payload.find({
        collection: 'workshop-bookings',
        where: {
          and: [{ workshopSlug: { equals: workshopSlug } }, { status: { equals: 'pending' } }],
        },
        sort: '-createdAt',
        limit: 1,
        overrideAccess: true,
      })
      if (bySlug.totalDocs > 0) booking = bySlug.docs[0]
    }

    if (!booking) {
      payload.logger.warn(
        `[confirmWorkshopBookings] No pending booking found for workshop "${workshopSlug}" (order ${doc.id})`,
      )
      continue
    }

    // Confirm the booking and attach customer info
    const downloadToken = randomUUID()
    const updateData: Record<string, unknown> = {
      status: 'confirmed',
      downloadToken,
      orderId: doc.id,
    }

    if (customerEmail && !booking.email) updateData.email = customerEmail
    if (customerFirstName && !booking.firstName) updateData.firstName = customerFirstName
    if (customerLastName && !booking.lastName) updateData.lastName = customerLastName
    if (customerPhone && !booking.phone) updateData.phone = customerPhone
    if (customerDietSpecs && !booking.notes) updateData.notes = customerDietSpecs

    try {
      await payload.update({
        collection: 'workshop-bookings',
        id: booking.id,
        data: updateData,
        overrideAccess: true,
      })

      payload.logger.info(
        `[confirmWorkshopBookings] Confirmed booking ${booking.id} for workshop "${workshopSlug}" via order ${doc.id}`,
      )
    } catch (error) {
      payload.logger.error(
        `[confirmWorkshopBookings] Failed to confirm booking ${booking.id}: ${error instanceof Error ? error.message : String(error)}`,
      )
      continue
    }

    // Send workshop booking confirmation email now that customer info is available
    const bookingEmail = (updateData.email as string) || booking.email
    if (bookingEmail) {
      // Resolve location AND the ISO date / Vienna time range from the
      // appointment in a single fetch. We need the ISO date for the .ics
      // attachment because `booking.date` is a German display string
      // (e.g. "4. Mai 2026") that the iCal builder can't parse.
      let workshopLocation = ''
      let icsDate = '' // YYYY-MM-DD in Europe/Vienna
      let icsTime = String(booking.time ?? '') // HH:MM[ – HH:MM] in Europe/Vienna
      if (booking.appointmentId) {
        try {
          const appointment = await payload.findByID({
            collection: 'workshop-appointments',
            id: booking.appointmentId,
            depth: 1,
            overrideAccess: true,
          })
          if (appointment) {
            const loc = (appointment as { location?: unknown }).location
            if (typeof loc === 'object' && loc !== null) {
              const l = loc as { name?: string; address?: string }
              workshopLocation = [l.name, l.address].filter(Boolean).join(', ')
            } else if (typeof loc === 'string') {
              workshopLocation = loc
            }

            const dateTimeRaw = (appointment as { dateTime?: unknown }).dateTime
            if (typeof dateTimeRaw === 'string' || dateTimeRaw instanceof Date) {
              const dt = new Date(dateTimeRaw as string | Date)
              if (!Number.isNaN(dt.getTime())) {
                // Build YYYY-MM-DD in Europe/Vienna using Intl parts.
                const dateParts = new Intl.DateTimeFormat('en-CA', {
                  timeZone: 'Europe/Vienna',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).formatToParts(dt)
                const y = dateParts.find((p) => p.type === 'year')?.value
                const m = dateParts.find((p) => p.type === 'month')?.value
                const d = dateParts.find((p) => p.type === 'day')?.value
                if (y && m && d) icsDate = `${y}-${m}-${d}`

                // Build "HH:MM – HH:MM" (Vienna) — workshop duration = 3 hours
                // to match the rest of the system (see getAllWorkshopAppointments
                // and get-workshop-appointments).
                const timeOpts: Intl.DateTimeFormatOptions = {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Europe/Vienna',
                  hour12: false,
                }
                const startStr = dt.toLocaleTimeString('de-DE', timeOpts)
                const endStr = new Date(dt.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString(
                  'de-DE',
                  timeOpts,
                )
                icsTime = `${startStr} – ${endStr}`
              }
            }
          }
        } catch {
          // ignore — location/ICS date are best-effort
        }
      }

      const formattedPrice =
        typeof booking.totalPrice === 'number'
          ? `€${booking.totalPrice.toFixed(2).replace('.', ',')}`
          : String(booking.totalPrice ?? '')

      // Resolve "What to bring" copy from the linked Workshop record
      let whatToBring = ''
      if (booking.workshopSlug) {
        try {
          const workshops = await payload.find({
            collection: 'workshops',
            where: { slug: { equals: booking.workshopSlug } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
          })
          const workshop = workshops.docs[0] as { whatToBring?: string } | undefined
          if (workshop?.whatToBring && typeof workshop.whatToBring === 'string') {
            whatToBring = workshop.whatToBring.trim().replace(/\r\n/g, '\n').replace(/\n/g, '<br>')
          }
        } catch {
          // ignore — what-to-bring is best-effort
        }
      }

      // Build .ics calendar attachment so recipients can add the workshop
      // to their calendar app with one tap. Hoisted out of the try below so
      // the per-seat gift loop further down can reuse the same attachment.
      let icsAttachment: { name: string; content: string } | null = null
      try {
        const ics = generateBookingICS({
          bookingId: String(booking.id),
          title: String(booking.workshopTitle ?? 'Workshop'),
          date: icsDate || String(booking.date ?? ''),
          time: icsTime,
          location: workshopLocation || undefined,
          url: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'}/account/orders`,
        })
        icsAttachment = {
          name: 'fermentfreude-workshop.ics',
          content: Buffer.from(ics, 'utf-8').toString('base64'),
        }
      } catch (icsError) {
        payload.logger.warn(
          `[confirmWorkshopBookings] Failed to build .ics for booking ${booking.id}: ${icsError instanceof Error ? icsError.message : String(icsError)}`,
        )
      }

      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'

      // Build per-seat array for the email tickets loop.
      // Each entry: NUMBER (1-based), NAME (attendee name if set, else empty string).
      type BrevoSeat = { NUMBER: string; NAME: string }
      const seatsArray: BrevoSeat[] = []
      const bookingSeats = (booking.seats as { recipientName?: string }[] | undefined) ?? []
      const totalSeats = typeof booking.guestCount === 'number' ? booking.guestCount : 1
      for (let i = 0; i < totalSeats; i++) {
        seatsArray.push({
          NUMBER: String(i + 1),
          NAME: bookingSeats[i]?.recipientName ?? '',
        })
      }

      // Tickets page URL uses the ORDER's downloadToken (not the booking receipt token)
      const orderDownloadToken =
        typeof (doc as { downloadToken?: unknown }).downloadToken === 'string'
          ? (doc as { downloadToken?: string }).downloadToken!
          : ''
      const ticketsUrl = orderDownloadToken
        ? `${SERVER_URL}/orders/${doc.id}/tickets?token=${orderDownloadToken}`
        : `${SERVER_URL}/account/orders`

      try {
        await sendTemplateEmail({
          to: [
            {
              email: bookingEmail,
              name: ((updateData.firstName as string) || booking.firstName) ?? undefined,
            },
          ],
          templateId: BREVO_TEMPLATES.WORKSHOP_BOOKING_CONFIRMATION,
          params: {
            WORKSHOP_TITLE: String(booking.workshopTitle ?? 'Workshop'),
            WORKSHOP_DATE: String(booking.date ?? ''),
            WORKSHOP_TIME: String(booking.time ?? ''),
            WORKSHOP_LOCATION: workshopLocation,
            GUEST_COUNT: String(booking.guestCount ?? 1),
            TOTAL_PRICE: formattedPrice,
            FIRST_NAME: (() => {
              const fromUpdate =
                typeof updateData.firstName === 'string' ? updateData.firstName.trim() : ''
              const fromBooking =
                typeof booking.firstName === 'string' ? booking.firstName.trim() : ''
              return fromUpdate || fromBooking || 'Gast'
            })(),
            CUSTOMER_PHONE: (() => {
              const fromUpdate = typeof updateData.phone === 'string' ? updateData.phone.trim() : ''
              const fromBooking = typeof booking.phone === 'string' ? booking.phone.trim() : ''
              return fromUpdate || fromBooking || 'Nicht angegeben'
            })(),
            CUSTOMER_DIET_SPECS: (() => {
              const fromUpdate = typeof updateData.notes === 'string' ? updateData.notes.trim() : ''
              const fromBooking = typeof booking.notes === 'string' ? booking.notes.trim() : ''
              return fromUpdate || fromBooking || 'Keine Angabe'
            })(),
            BOOKING_ID: String(booking.id),
            BOOKING_REF: String(booking.id).slice(-8).toUpperCase(),
            SEATS: seatsArray,
            TICKETS_URL: ticketsUrl,
            WHAT_TO_BRING: whatToBring,
            PRIVACY_URL: `${SERVER_URL}/datenschutz`,
            AGB_URL: `${SERVER_URL}/agb`,
          },
          attachments: icsAttachment ? [icsAttachment] : undefined,
        })
        payload.logger.info(
          `[confirmWorkshopBookings] Sent booking confirmation email to ${bookingEmail} for booking ${booking.id}`,
        )
      } catch (error) {
        payload.logger.error(
          `[confirmWorkshopBookings] Failed to send booking email for ${booking.id}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }

      // Send admin notification email
      try {
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'kontakt@fermentfreude.at'
        const adminName = (() => {
          const fromUpdate =
            typeof updateData.firstName === 'string' ? updateData.firstName.trim() : ''
          const fromBooking =
            typeof booking.firstName === 'string' ? booking.firstName.trim() : ''
          return fromUpdate || fromBooking || 'Unbekannt'
        })()
        const adminPhone = (() => {
          const fromUpdate = typeof updateData.phone === 'string' ? updateData.phone.trim() : ''
          const fromBooking = typeof booking.phone === 'string' ? booking.phone.trim() : ''
          return fromUpdate || fromBooking || 'Nicht angegeben'
        })()
        const adminDiet = (() => {
          const fromUpdate = typeof updateData.notes === 'string' ? updateData.notes.trim() : ''
          const fromBooking = typeof booking.notes === 'string' ? booking.notes.trim() : ''
          return fromUpdate || fromBooking || 'Keine Angabe'
        })()
        const bookingRef = String(booking.id).slice(-8).toUpperCase()
        const htmlContent = `
<h2 style="font-family:sans-serif;margin-bottom:16px">
  Neue Buchung: ${String(booking.workshopTitle ?? 'Workshop')}
</h2>
<table style="font-family:sans-serif;border-collapse:collapse;font-size:14px">
  <tr><td style="padding:4px 12px 4px 0;color:#555;white-space:nowrap">Workshop</td><td style="padding:4px 0"><strong>${String(booking.workshopTitle ?? '')}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Datum</td><td style="padding:4px 0">${String(booking.date ?? '')} · ${String(booking.time ?? '')}</td></tr>
  ${workshopLocation ? `<tr><td style="padding:4px 12px 4px 0;color:#555">Ort</td><td style="padding:4px 0">${workshopLocation}</td></tr>` : ''}
  <tr><td style="padding:4px 12px 4px 0;color:#555">Gäste</td><td style="padding:4px 0">${String(booking.guestCount ?? 1)}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Gesamtpreis</td><td style="padding:4px 0">${formattedPrice}</td></tr>
  <tr><td style="padding:16px 12px 4px 0;color:#555;border-top:1px solid #eee">Name</td><td style="padding:16px 0 4px;border-top:1px solid #eee">${adminName}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">E-Mail</td><td style="padding:4px 0"><a href="mailto:${bookingEmail}">${bookingEmail}</a></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Telefon</td><td style="padding:4px 0">${adminPhone}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Ernährungshinweise</td><td style="padding:4px 0">${adminDiet}</td></tr>
  <tr><td style="padding:16px 12px 4px 0;color:#555;border-top:1px solid #eee">Buchungs-ID</td><td style="padding:16px 0 4px;border-top:1px solid #eee;font-family:monospace">${bookingRef}</td></tr>
</table>`

        await sendTransactionalEmail({
          to: [{ email: adminEmail, name: 'FermentFreude Admin' }],
          subject: `Neue Buchung: ${String(booking.workshopTitle ?? 'Workshop')} · ${String(booking.date ?? '')}`,
          htmlContent,
        })
        payload.logger.info(
          `[confirmWorkshopBookings] Sent admin notification email for booking ${booking.id}`,
        )
      } catch (error) {
        payload.logger.error(
          `[confirmWorkshopBookings] Failed to send admin notification for ${booking.id}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }

      // ── Per-seat guest emails — DISABLED (founders' decision, May 2026) ──
      // The founders intentionally do NOT want any separate emails sent to
      // guests/recipients. All workshop confirmations, .ics calendar files
      // and invoices go to the buyer/payer only. The buyer forwards the
      // information to their guests themselves. (Vouchers are the dedicated
      // gift flow — recipients there only receive a confirmation when they
      // personally redeem the voucher and book a workshop with their own
      // email address.)
      //
      // We still persist optional guest names + notes per seat so the founders
      // see the attendee list in the admin. The block below is kept as a
      // commented-out reference in case this policy is revisited.
      //
      // for (const seat of seats) { … sendTemplateEmail to seat.recipientEmail … }
    }
  }

  return doc
}
