import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { sanitizeSeatInputs } from '@/lib/workshopSeats'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/cart/update-seats — Sprint 3
 *
 *  Updates the per-seat guest details on a pending workshop booking.
 *  Called from the cart/checkout when the buyer fills in (or edits)
 *  a guest's name / email / dietary notes.
 *
 *  Body: { bookingId: string, seats: SeatInput[] }
 *  Each seat: { recipientName?: string, email?: string, giftNote?: string }
 *
 *  - Only updates bookings with status='pending' (cart stage).
 *  - Sequential write only — never use Promise.all on Atlas M0.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, seats } = body as { bookingId?: string; seats?: unknown }

    if (!bookingId || typeof bookingId !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing bookingId.' }, { status: 400 })
    }

    const sanitized = sanitizeSeatInputs(seats)

    const config = await configPromise
    const payload = await getPayload({ config })

    let booking
    try {
      booking = await payload.findByID({
        collection: 'workshop-bookings',
        id: bookingId,
        depth: 0,
        overrideAccess: true,
      })
    } catch (err) {
      console.error('[update-seats] findByID failed for bookingId', bookingId, err)
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 })
    }

    if (booking.status !== 'pending') {
      // Once Stripe has confirmed the booking, seats are edited from the admin dashboard.
      return NextResponse.json(
        { success: false, error: 'Booking already confirmed; seats can no longer be edited.' },
        { status: 409 },
      )
    }

    await payload.update({
      collection: 'workshop-bookings',
      id: bookingId,
      data: {
        seats: sanitized.length > 0 ? sanitized : undefined,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[update-seats] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
