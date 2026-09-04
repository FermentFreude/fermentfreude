import { reserveSpotsAtomic } from '@/lib/atomicSpots'
import type { WorkshopAppointment, WorkshopBooking } from '@/payload-types'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

type SeatInput = {
  isGift?: boolean
  recipientName?: string
  recipientEmail?: string
  giftNote?: string
}

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/cart/add-workshop — Production Endpoint
 *
 *  Validates appointment availability server-side, prevents race
 *  conditions, and adds workshop booking to cart with full metadata.
 *
 *  Skipped (as requested): Stripe payment, email notifications.
 *  Everything else: Production-ready validation and error handling.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      appointmentId,
      workshopSlug,
      guestCount: rawGuestCount,
      seats: rawSeats,
      cartId: rawCartId,
    } = body
    const cartId = typeof rawCartId === 'string' && rawCartId.trim() ? rawCartId.trim() : null

    // ─── Sprint 3 — sanitize optional per-seat gift info ────────
    const sanitizedSeats: SeatInput[] = Array.isArray(rawSeats)
      ? (rawSeats as unknown[])
          .map((s) => {
            if (!s || typeof s !== 'object') return null
            const seat = s as Record<string, unknown>
            return {
              isGift: Boolean(seat.isGift),
              recipientName:
                typeof seat.recipientName === 'string'
                  ? seat.recipientName.trim().slice(0, 250)
                  : undefined,
              recipientEmail:
                typeof seat.recipientEmail === 'string'
                  ? seat.recipientEmail.trim().slice(0, 250)
                  : undefined,
              giftNote: typeof seat.giftNote === 'string' ? seat.giftNote.slice(0, 500) : undefined,
            } as SeatInput
          })
          .filter((s): s is SeatInput => s !== null)
      : []

    // Debug logging
    console.log('[add-workshop] Request received:', {
      appointmentId,
      workshopSlug,
      rawGuestCount,
      guestCountType: typeof rawGuestCount,
    })

    // ─── Input Validation ───────────────────────────────────────

    if (!appointmentId || typeof appointmentId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid appointmentId',
          message: 'Appointment ID is required and must be a string.',
        },
        { status: 400 },
      )
    }

    if (!workshopSlug || typeof workshopSlug !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid workshopSlug',
          message: 'Workshop slug is required and must be a string.',
        },
        { status: 400 },
      )
    }

    // Parse guestCount as number (handle string or number from request)
    const guestCount =
      typeof rawGuestCount === 'string' ? parseInt(rawGuestCount, 10) : rawGuestCount

    if (typeof guestCount !== 'number' || isNaN(guestCount) || guestCount < 1 || guestCount > 12) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid guest count',
          message: 'Guest count must be a number between 1 and 12.',
        },
        { status: 400 },
      )
    }

    // ─── Fetch Appointment & Workshop (Server-Side Validation) ─

    const config = await configPromise
    const payload = await getPayload({ config })

    let appointment: WorkshopAppointment
    try {
      appointment = await payload.findByID({
        collection: 'workshop-appointments',
        id: appointmentId,
        depth: 2, // Populate workshop and location
      })
    } catch (error) {
      console.error('Error fetching appointment:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Appointment not found',
          message: 'The requested workshop appointment does not exist.',
        },
        { status: 404 },
      )
    }

    // ─── Business Logic Validation ──────────────────────────────

    // Check if appointment is published
    if (!appointment.isPublished) {
      return NextResponse.json(
        {
          success: false,
          error: 'Appointment unavailable',
          message: 'This workshop appointment is no longer available for booking.',
        },
        { status: 410 }, // 410 Gone
      )
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(appointment.dateTime)
    const now = new Date()
    if (appointmentDate < now) {
      return NextResponse.json(
        {
          success: false,
          error: 'Past appointment',
          message: 'Cannot book an appointment that has already passed.',
        },
        { status: 410 },
      )
    }

    // Check availability (CRITICAL: Server-side check prevents race conditions)
    if (guestCount > appointment.availableSpots) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not enough spots',
          message: `Only ${appointment.availableSpots} spot${appointment.availableSpots === 1 ? '' : 's'} available, but you requested ${guestCount}.`,
          availableSpots: appointment.availableSpots,
          requestedGuests: guestCount,
        },
        { status: 409 }, // 409 Conflict
      )
    }

    // Validate workshop relation is populated
    const workshop = typeof appointment.workshop === 'object' ? appointment.workshop : null
    if (!workshop) {
      console.error('Workshop relation not populated for appointment:', appointmentId)
      return NextResponse.json(
        {
          success: false,
          error: 'Data integrity error',
          message: 'Workshop information is missing. Please contact support.',
        },
        { status: 500 },
      )
    }

    // Validate slug matches (extra security check)
    if (workshop.slug !== workshopSlug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workshop mismatch',
          message: 'The appointment does not match the requested workshop.',
        },
        { status: 400 },
      )
    }

    // ─── Calculate Price ────────────────────────────────────────

    const pricePerPerson = workshop.basePrice ?? 99 // Default to €99
    const totalPrice = pricePerPerson * guestCount

    // ─── Format Date/Time for Display ───────────────────────────

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Vienna',
    }
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Vienna',
    }

    const dateDisplay = appointmentDate.toLocaleDateString('de-DE', dateOptions)
    const timeDisplay = appointmentDate.toLocaleTimeString('de-DE', timeOptions)

    // ─── Resolve Location (populated via depth: 2) ──────────────
    const locationDoc =
      typeof appointment.location === 'object' && appointment.location !== null
        ? appointment.location
        : null
    const locationName = locationDoc?.name ?? null
    const locationAddress = locationDoc?.address ?? null

    // ─── Fetch Actual Product by Slug ───────────────────────────
    // The placeholder products were seeded with slug "workshop-* "
    // We need the actual database ID to add to cart

    const productSlug = `workshop-${workshopSlug}`
    let product
    try {
      product = await payload.find({
        collection: 'products',
        where: {
          slug: {
            equals: productSlug,
          },
        },
        limit: 1,
      })
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: `Workshop product "${productSlug}" is not available for booking. Please contact support.`,
        },
        { status: 404 },
      )
    }

    if (!product || !product.docs || product.docs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: `Workshop product "${productSlug}" is not available for booking. Please contact support.`,
        },
        { status: 404 },
      )
    }

    const foundProduct = product.docs[0]
    if (!foundProduct.id) {
      console.error('Product has no ID:', foundProduct)
      return NextResponse.json(
        {
          success: false,
          error: 'Data integrity error',
          message: 'Workshop product is missing ID. Please contact support.',
        },
        { status: 500 },
      )
    }

    const actualProductId = foundProduct.id

    // ─── Find an existing pending booking for this exact appointment,
    // already in this cart ─────────────────────────────────────────────
    // If the customer re-books the same appointment (e.g. adding a second
    // guest after already adding one), merge into that booking instead of
    // creating a second, separate one. Two separate documents for one cart
    // line used to mean only the first ever got matched and confirmed after
    // payment — the second sat "pending" forever: unconfirmed, unemailed,
    // and missing from the invoice. See confirmWorkshopBookings.ts.
    let existingBooking: WorkshopBooking | null = null
    if (cartId) {
      const existing = await payload.find({
        collection: 'workshop-bookings',
        where: {
          and: [
            { cartSlug: { equals: cartId } },
            { appointmentId: { equals: appointmentId } },
            { status: { equals: 'pending' } },
          ],
        },
        limit: 1,
        overrideAccess: true,
      })
      existingBooking = existing.docs[0] ?? null
    }

    // ─── Decrement Available Spots (atomic) ─────────────────────
    // Spots are reserved immediately to prevent overbooking. The check above
    // (guestCount > appointment.availableSpots) is a fast-path UX check only —
    // this atomic $inc-with-guard is the actual authority, since two requests
    // can both pass the check above for the last spot before either writes.
    // Restored via POST /api/cart/release-spots if payment fails or cart is abandoned.
    // Always the newly-requested guestCount, whether merging into an
    // existing booking or creating a new one — spot reservation tracks new
    // consumption only, never a cumulative total.
    const reserveResult = await reserveSpotsAtomic(payload, appointmentId, guestCount)
    if (!reserveResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not enough spots',
          message: `Only ${reserveResult.availableSpots} spot${reserveResult.availableSpots === 1 ? '' : 's'} available, but you requested ${guestCount}.`,
          availableSpots: reserveResult.availableSpots,
          requestedGuests: guestCount,
        },
        { status: 409 },
      )
    }

    // ─── Create or merge into the Pending Booking Record ─────────
    // pending → confirmed via Stripe webhook, or cancelled via release-spots.
    let bookingId: string | null = null
    let cumulativeGuestCount = guestCount
    let cumulativeTotalPrice = totalPrice
    try {
      if (existingBooking) {
        cumulativeGuestCount = (existingBooking.guestCount ?? 0) + guestCount
        cumulativeTotalPrice = pricePerPerson * cumulativeGuestCount
        const mergedSeats = [...(existingBooking.seats ?? []), ...sanitizedSeats]
        const updated = await payload.update({
          collection: 'workshop-bookings',
          id: existingBooking.id,
          data: {
            guestCount: cumulativeGuestCount,
            totalPrice: cumulativeTotalPrice,
            ...(mergedSeats.length > 0 ? { seats: mergedSeats } : {}),
          },
          overrideAccess: true,
        })
        bookingId = String(updated.id)
      } else {
        const booking = await payload.create({
          collection: 'workshop-bookings',
          data: {
            status: 'pending',
            workshopSlug,
            appointmentId,
            workshopTitle: String(workshop.title ?? 'Workshop'),
            date: dateDisplay,
            time: timeDisplay,
            guestCount,
            pricePerPerson,
            totalPrice,
            // Set immediately when already known (a re-add to a cart that
            // already exists) rather than relying solely on the separate
            // /api/cart/link-booking call after addItem — that call can
            // fail silently and previously was the only way cartSlug ever
            // got set, which is exactly what the merge lookup above needs.
            ...(cartId ? { cartSlug: cartId } : {}),
            ...(sanitizedSeats.length > 0 ? { seats: sanitizedSeats } : {}),
          },
          overrideAccess: true,
        })
        bookingId = String(booking.id)
      }
    } catch (err) {
      // Non-fatal: spots are still decremented, cart add proceeds.
      // Stripe webhook will not find a booking to confirm — investigate in logs.
      console.error('[add-workshop] Failed to create/update WorkshopBooking record:', err)
    }

    return NextResponse.json(
      {
        success: true,
        message: `${guestCount} spot${guestCount === 1 ? '' : 's'} validated for ${workshop.title}`,
        bookingId,
        // Tells the client whether `bookingId` is a pre-existing booking we
        // just merged this request's guests into, vs. a brand-new one. If
        // this specific request later fails to make it into the cart, the
        // client must roll back ONLY the guests it just tried to add — not
        // cancel a shared booking that also covers guests added earlier.
        wasMerged: Boolean(existingBooking),
        cartItem: {
          productId: actualProductId, // ✅ Real database ID
          metadata: {
            type: 'workshop-booking',
            appointmentId,
            workshopTitle: workshop.title,
            workshopSlug,
            date: dateDisplay,
            time: timeDisplay,
            // Cumulative totals for the booking record (localStorage
            // bookkeeping / DeleteItemButton spot release needs the full
            // amount, not just this request's delta).
            guestCount: cumulativeGuestCount,
            pricePerPerson,
            totalPrice: cumulativeTotalPrice,
            locationName,
            locationAddress,
          },
        },
        appointment: {
          id: appointment.id,
          dateTime: appointment.dateTime,
          availableSpots: appointment.availableSpots - guestCount,
        },
        workshop: {
          id: workshop.id,
          title: workshop.title,
          slug: workshop.slug,
          basePrice: pricePerPerson,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error in /api/cart/add-workshop:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 },
    )
  }
}
