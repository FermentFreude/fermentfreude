import { NextResponse } from 'next/server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()

    if (!rawBody.trim()) {
      return NextResponse.json(
        { success: false, error: 'Request body is required.' },
        { status: 400 },
      )
    }

    let body: { bookingId?: string; cartId?: string }

    try {
      body = JSON.parse(rawBody) as { bookingId?: string; cartId?: string }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Request body must be valid JSON.' },
        { status: 400 },
      )
    }

    const bookingId = typeof body.bookingId === 'string' ? body.bookingId.trim() : ''
    const cartId = typeof body.cartId === 'string' ? body.cartId.trim() : ''

    if (!bookingId || !cartId) {
      return NextResponse.json(
        { success: false, error: 'bookingId and cartId are required.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'workshop-bookings',
      id: bookingId,
      data: { cartSlug: cartId },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[link-booking]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to link booking to cart.' },
      { status: 500 },
    )
  }
}