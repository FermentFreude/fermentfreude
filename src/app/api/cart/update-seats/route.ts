import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/cart/update-seats — Sprint 3
 *
 *  Updates the per-seat gift info on a pending workshop booking.
 *  Called from the cart drawer when the buyer fills in (or edits)
 *  recipient name / email / gift note for any seat in the booking.
 *
 *  Body: { bookingId: string, seats: SeatInput[] }
 *  Each seat: { isGift?: boolean, recipientName?: string,
 *               recipientEmail?: string, giftNote?: string }
 *
 *  - Only updates bookings with status='pending' (cart stage).
 *  - Sequential write only — never use Promise.all on Atlas M0.
 *  - Does NOT touch giftEmailSentAt — that is set by the
 *    confirmWorkshopBookings hook after Stripe success.
 * ═══════════════════════════════════════════════════════════════ */

type SeatInput = {
  isGift?: boolean
  recipientName?: string
  recipientEmail?: string
  giftNote?: string
}

function sanitizeSeats(raw: unknown): SeatInput[] {
  if (!Array.isArray(raw)) return []
  return (raw as unknown[])
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, seats } = body as { bookingId?: string; seats?: unknown }

    if (!bookingId || typeof bookingId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing bookingId.' },
        { status: 400 },
      )
    }

    const sanitized = sanitizeSeats(seats)

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
    } catch {
      return NextResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 },
      )
    }

    if (booking.status !== 'pending') {
      // Once Stripe has confirmed the booking, gift seats are locked.
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
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
