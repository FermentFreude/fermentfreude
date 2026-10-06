import { cancelPendingBooking, removeGuestsFromPendingBooking } from '@/lib/workshopHolds'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/cart/release-spots
 *
 *  Gives a basket's held seats back when the customer removes a
 *  workshop (DeleteItemButton, checkout) or when adding it to the
 *  cart failed half-way (add-to-cart-utils rollback).
 *
 *  Seats are only ever given back for a booking that is still
 *  `pending`, and only once — the number of seats comes from the
 *  booking on the server, never from the browser. A two-week-old
 *  basket whose hold already expired therefore releases nothing:
 *  those seats went back on sale when the hold ran out. (Trusting the
 *  browser's count here is exactly how phantom free seats appeared.)
 *
 *  Body (any combination):
 *    cartId + appointmentId  → every pending booking in that basket for
 *                              that date (appointmentId may be the full
 *                              ID or the cart line's 6-char `a` suffix)
 *    bookingId               → that booking, if still pending
 *    bookingId + releaseGuests → only that many guests of the booking
 *                              (rolling back an "add one more guest")
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const cartId = typeof body.cartId === 'string' ? body.cartId.trim() : ''
    const appointmentId = typeof body.appointmentId === 'string' ? body.appointmentId.trim() : ''
    const bookingId = typeof body.bookingId === 'string' ? body.bookingId.trim() : ''
    const releaseGuests =
      typeof body.releaseGuests === 'number' && body.releaseGuests >= 1 && body.releaseGuests <= 12
        ? Math.floor(body.releaseGuests)
        : null

    if (!bookingId && !(cartId && appointmentId)) {
      return NextResponse.json(
        { success: false, error: 'bookingId, or cartId + appointmentId, is required.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })
    let released = 0

    if (bookingId && releaseGuests !== null) {
      released += await removeGuestsFromPendingBooking(payload, bookingId, releaseGuests)
    } else {
      const ids = new Set<string>()
      if (bookingId) ids.add(bookingId)
      if (cartId && appointmentId) {
        const inCart = await payload.find({
          collection: 'workshop-bookings',
          where: {
            and: [{ cartSlug: { equals: cartId } }, { status: { equals: 'pending' } }],
          },
          depth: 0,
          limit: 50,
          overrideAccess: true,
        })
        for (const b of inCart.docs) {
          if (typeof b.appointmentId === 'string' && b.appointmentId.endsWith(appointmentId)) {
            ids.add(String(b.id))
          }
        }
      }
      for (const id of ids) {
        released += await cancelPendingBooking(payload, id)
      }
    }

    return NextResponse.json({ success: true, released })
  } catch (error) {
    console.error('[release-spots]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
