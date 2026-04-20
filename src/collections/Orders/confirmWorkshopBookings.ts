import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

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
        typeof transaction.cart === 'object' ? transaction.cart?.id || undefined : transaction.cart || undefined
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
    const updateData: Record<string, unknown> = {
      status: 'confirmed',
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
            GUEST_COUNT: String(booking.guestCount ?? 1),
            TOTAL_PRICE: String(booking.totalPrice ?? ''),
            CUSTOMER_NAME: String(
              (updateData.firstName as string) || booking.firstName || bookingEmail,
            ),
            BOOKING_ID: String(booking.id),
          },
        })
        payload.logger.info(
          `[confirmWorkshopBookings] Sent booking confirmation email to ${bookingEmail} for booking ${booking.id}`,
        )
      } catch (error) {
        payload.logger.error(
          `[confirmWorkshopBookings] Failed to send booking email for ${booking.id}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }

  return doc
}
