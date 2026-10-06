import { ensureCartWorkshopHolds } from '@/lib/workshopHolds'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/cart/check-workshops
 *
 *  The "final check at the door" — re-checks every workshop in a
 *  basket against the real seat count, however old the basket is.
 *  Called by checkout when it opens, when the customer clicks pay,
 *  and right before Stripe confirms the payment.
 *
 *  Body: { cartId: string, bookingIds?: string[] }
 *  (bookingIds = what this browser remembers — only used to adopt a
 *  booking that never got linked to the cart; see ensureCartWorkshopHolds)
 *
 *  Response: { success, allHeld, lines: CartWorkshopLine[] }
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { cartId?: unknown; bookingIds?: unknown }
    const cartId = typeof body.cartId === 'string' ? body.cartId.trim() : ''
    if (!cartId) {
      return NextResponse.json({ success: false, error: 'cartId is required.' }, { status: 400 })
    }
    const bookingIds = Array.isArray(body.bookingIds)
      ? body.bookingIds.filter((id): id is string => typeof id === 'string').slice(0, 20)
      : []

    const payload = await getPayload({ config: configPromise })
    const { cartFound, lines } = await ensureCartWorkshopHolds(payload, cartId, {
      adoptBookingIds: bookingIds,
    })
    if (!cartFound) {
      return NextResponse.json({ success: false, error: 'Cart not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      allHeld: lines.every((line) => line.status === 'held'),
      lines,
    })
  } catch (error) {
    console.error('[check-workshops]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
