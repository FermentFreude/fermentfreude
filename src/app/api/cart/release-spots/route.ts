import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/cart/release-spots
 *
 *  Restores available spots on a workshop appointment and cancels
 *  the associated pending booking record.
 *
 *  Called in three situations:
 *   1. User removes workshop item from cart (DeleteItemButton)
 *   2. Stripe payment fails (webhook handler)
 *   3. Not called for tab-close — that is handled by lazy cleanup
 *      in getWorkshopAppointments (stale pending bookings > 60 min)
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, guestCount, bookingId } = body

    // ─── Input Validation ──────────────────────────────────────

    if (!appointmentId || typeof appointmentId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid appointmentId' },
        { status: 400 },
      )
    }

    if (typeof guestCount !== 'number' || guestCount < 1 || guestCount > 12) {
      return NextResponse.json(
        { success: false, error: 'Invalid guestCount — must be between 1 and 12' },
        { status: 400 },
      )
    }

    const config = await configPromise
    const payload = await getPayload({ config })

    // ─── Fetch Appointment ─────────────────────────────────────

    let appointment
    try {
      appointment = await payload.findByID({
        collection: 'workshop-appointments',
        id: appointmentId,
        depth: 1, // Populate workshop to read maxCapacityPerSlot
      })
    } catch {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 },
      )
    }

    // ─── Restore Spots (capped at maxCapacity) ─────────────────

    const maxCapacity =
      typeof appointment.workshop === 'object'
        ? (appointment.workshop?.maxCapacityPerSlot ?? 12)
        : 12

    const restoredSpots = Math.min(appointment.availableSpots + guestCount, maxCapacity)

    await payload.update({
      collection: 'workshop-appointments',
      id: appointmentId,
      data: { availableSpots: restoredSpots },
      overrideAccess: true,
    })

    // ─── Cancel Pending Booking Record ─────────────────────────
    // Non-fatal: if bookingId is missing or already cancelled, skip.

    if (bookingId && typeof bookingId === 'string') {
      try {
        await payload.update({
          collection: 'workshop-bookings',
          id: bookingId,
          data: { status: 'cancelled' },
          overrideAccess: true,
        })
      } catch {
        // Booking may not exist yet (e.g. creation failed silently) — ignore
      }
    }

    return NextResponse.json(
      {
        success: true,
        restoredSpots: guestCount,
        newAvailableSpots: restoredSpots,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[release-spots]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
