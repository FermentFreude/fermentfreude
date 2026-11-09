import { completeCartPayment } from '@/lib/cartFulfilment'
import { getStripe } from '@/lib/stripe'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { createLocalReq, getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/checkout/complete-payment  { paymentIntentID }
 *
 *  Fallback for the confirm step after a cart payment. The checkout
 *  normally confirms through the ecommerce plugin, which needs the
 *  browser's cart. When the Stripe webhook has already created the order
 *  (and marked the cart purchased), or the cart didn't load, that step
 *  fails although the customer has paid. This route completes — or
 *  finds — the order from the payment alone, so a paying customer always
 *  lands on their confirmation instead of an error.
 *
 *  Only acts on a PaymentIntent Stripe reports as succeeded and that
 *  belongs to one of our checkout transactions — exactly what the
 *  webhook would do anyway.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const paymentIntentID =
      body && typeof body.paymentIntentID === 'string' ? body.paymentIntentID.trim() : ''
    if (!paymentIntentID.startsWith('pi_')) {
      return NextResponse.json({ success: false, error: 'Invalid payment.' }, { status: 400 })
    }

    let paymentIntent
    try {
      paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentID)
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid payment.' }, { status: 400 })
    }
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: 'Payment has not been completed.' },
        { status: 402 },
      )
    }

    const payload = await getPayload({ config: configPromise })
    const req = await createLocalReq({}, payload)
    const { user } = await payload.auth({ headers: request.headers })
    if (user) req.user = user

    const result = await completeCartPayment(req, paymentIntent, { waitMs: 20_000 })
    if (!result) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, orderID: result.orderID })
  } catch (error) {
    console.error('[checkout/complete-payment] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    )
  }
}
