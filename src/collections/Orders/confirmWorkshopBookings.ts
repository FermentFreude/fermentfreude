import { randomUUID } from 'crypto'

import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
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

  // Resolve customer email — from user record or guest checkout field
  const customerId = typeof doc.customer === 'object' ? doc.customer?.id : doc.customer
  let customerEmail: string | undefined = doc.customerEmail || undefined
  let customerName: string | undefined

  if (customerId) {
    try {
      const user = await payload.findByID({
        collection: 'users',
        id: customerId,
        depth: 0,
        overrideAccess: true,
      })
      if (!customerEmail) customerEmail = user?.email || undefined
      customerName = user?.name || undefined
    } catch {
      // Non-fatal: booking still gets confirmed
    }
  }

  // Prefer the name supplied by the buyer at checkout (guest flow). For
  // logged-in users, fall back to the user.name resolved above.
  if (typeof doc.customerName === 'string' && doc.customerName.trim().length > 0) {
    customerName = doc.customerName.trim()
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
    let booking = null

    if (cartId) {
      const byCart = await payload.find({
        collection: 'workshop-bookings',
        where: {
          and: [
            { cartSlug: { equals: cartId } },
            { workshopSlug: { equals: workshopSlug } },
            { status: { equals: 'pending' } },
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

    if (customerEmail) {
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
    }

    if (customerEmail && !booking.email) {
      updateData.email = customerEmail
    }
    if (customerName && !booking.firstName) {
      updateData.firstName = customerName
    }

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
      // Resolve location from the appointment (best effort) — include full address
      let workshopLocation = ''
      if (booking.appointmentId) {
        try {
          const appointment = await payload.findByID({
            collection: 'workshop-appointments',
            id: booking.appointmentId,
            depth: 1,
            overrideAccess: true,
          })
          if (appointment && (appointment as { location?: unknown }).location) {
            const loc = (appointment as { location?: unknown }).location
            if (typeof loc === 'object' && loc !== null) {
              const l = loc as { name?: string; address?: string }
              workshopLocation = [l.name, l.address].filter(Boolean).join(', ')
            } else if (typeof loc === 'string') {
              workshopLocation = loc
            }
          }
        } catch {
          // ignore — location is best-effort
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
          date: String(booking.date ?? ''),
          time: String(booking.time ?? ''),
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
            FIRST_NAME: String(
              (updateData.firstName as string) || booking.firstName || bookingEmail,
            ),
            BOOKING_ID: String(booking.id),
            BOOKING_REF: String(booking.id).slice(-8).toUpperCase(),
            BOOKING_URL: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'}/account/orders`,
            RECEIPT_URL: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'}/api/bookings/${booking.id}/receipt?token=${downloadToken}`,
            WHAT_TO_BRING: whatToBring,
            PRIVACY_URL: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'}/datenschutz`,
            AGB_URL: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'}/agb`,
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

      // ── Sprint 3 — per-seat gift notifications ──
      // For every seat marked isGift with a recipient email, send the gift
      // template (no price). Skips silently if the gift template ID hasn't
      // been configured via BREVO_TEMPLATE_WORKSHOP_GIFT_NOTIFICATION yet.
      const seats = Array.isArray((booking as { seats?: unknown }).seats)
        ? (
            booking as {
              seats: Array<{
                id?: string
                isGift?: boolean | null
                recipientName?: string | null
                recipientEmail?: string | null
                giftNote?: string | null
                giftEmailSentAt?: string | null
              }>
            }
          ).seats
        : []

      const giftTemplateId = BREVO_TEMPLATES.WORKSHOP_GIFT_NOTIFICATION

      for (const seat of seats) {
        if (!seat?.isGift) continue
        if (!seat.recipientEmail) continue
        if (seat.giftEmailSentAt) continue // already sent — idempotent

        if (!giftTemplateId) {
          payload.logger.warn(
            `[confirmWorkshopBookings] Skipping gift email for seat ${seat.id ?? '?'} on booking ${booking.id} — BREVO_TEMPLATE_WORKSHOP_GIFT_NOTIFICATION not set.`,
          )
          continue
        }

        try {
          await sendTemplateEmail({
            to: [
              {
                email: seat.recipientEmail,
                name: seat.recipientName ?? undefined,
              },
            ],
            templateId: giftTemplateId,
            params: {
              WORKSHOP_TITLE: String(booking.workshopTitle ?? 'Workshop'),
              WORKSHOP_DATE: String(booking.date ?? ''),
              WORKSHOP_TIME: String(booking.time ?? ''),
              WORKSHOP_LOCATION: workshopLocation,
              RECIPIENT_NAME: String(seat.recipientName ?? ''),
              SENDER_NAME: String((updateData.firstName as string) || booking.firstName || ''),
              GIFT_NOTE: String(seat.giftNote ?? ''),
              WHAT_TO_BRING: whatToBring,
              PRIVACY_URL: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'}/datenschutz`,
              AGB_URL: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'}/agb`,
            },
            attachments: icsAttachment ? [icsAttachment] : undefined,
          })

          // Mark sent so we don't double-send on any later hook re-run.
          if (seat.id) {
            try {
              const updatedSeats = seats.map((s) =>
                s.id === seat.id ? { ...s, giftEmailSentAt: new Date().toISOString() } : s,
              )
              await payload.update({
                collection: 'workshop-bookings',
                id: booking.id,
                data: { seats: updatedSeats },
                overrideAccess: true,
              })
            } catch (markErr) {
              payload.logger.warn(
                `[confirmWorkshopBookings] Sent gift email but failed to mark seat ${seat.id}: ${markErr instanceof Error ? markErr.message : String(markErr)}`,
              )
            }
          }

          payload.logger.info(
            `[confirmWorkshopBookings] Sent gift notification to ${seat.recipientEmail} for booking ${booking.id} seat ${seat.id ?? '?'}`,
          )
        } catch (error) {
          payload.logger.error(
            `[confirmWorkshopBookings] Failed to send gift email for booking ${booking.id} seat ${seat.id ?? '?'}: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      }
    }
  }

  return doc
}
