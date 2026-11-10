import { getStripe } from '@/lib/stripe'
import { fulfilVoucherPurchase } from '@/lib/voucherFulfilment'
import config from '@/payload.config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/voucher/confirm?session_id=cs_xxx
 *  GET /api/voucher/confirm?payment_intent=pi_xxx
 *
 *  Called from the success page after Stripe redirects back, or
 *  after inline PaymentElement confirmation.
 *  Verifies the payment, creates a generic Voucher record in
 *  Payload, and sends the voucher email via Brevo.
 *
 *  Idempotent: the voucher is created exactly once per payment —
 *  shared with the Stripe webhook (see src/lib/voucherFulfilment.ts),
 *  which creates it when the buyer never comes back to this page.
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')
    const paymentIntentId = request.nextUrl.searchParams.get('payment_intent')

    if (!sessionId && !paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Missing session_id or payment_intent parameter.' },
        { status: 400 },
      )
    }

    let meta: Record<string, string> = {}
    let _paymentStatus: string = ''
    let idempotencyKey: string = ''
    let amountCents: number | null = null

    if (sessionId) {
      // ─── Verify via Stripe Checkout Session ─────────────────────

      let session
      try {
        session = await getStripe().checkout.sessions.retrieve(sessionId)
      } catch (_err) {
        return NextResponse.json(
          { success: false, error: 'Invalid checkout session.' },
          { status: 400 },
        )
      }

      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { success: false, error: 'Payment has not been completed.' },
          { status: 402 },
        )
      }

      if (session.metadata?.type !== 'voucher_purchase') {
        return NextResponse.json(
          { success: false, error: 'This session is not a voucher purchase.' },
          { status: 400 },
        )
      }

      meta = session.metadata as Record<string, string>
      _paymentStatus = session.payment_status
      idempotencyKey = sessionId
      amountCents = typeof session.amount_total === 'number' ? session.amount_total : null
    } else {
      // ─── Verify via Stripe PaymentIntent ────────────────────────

      let paymentIntent
      try {
        paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId!)
      } catch (_err) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment intent.' },
          { status: 400 },
        )
      }

      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { success: false, error: 'Payment has not been completed.' },
          { status: 402 },
        )
      }

      if (paymentIntent.metadata?.type !== 'voucher_purchase') {
        return NextResponse.json(
          { success: false, error: 'This payment is not a voucher purchase.' },
          { status: 400 },
        )
      }

      meta = paymentIntent.metadata as Record<string, string>
      _paymentStatus = paymentIntent.status
      idempotencyKey = paymentIntentId!
      amountCents = typeof paymentIntent.amount === 'number' ? paymentIntent.amount : null
    }

    // ─── Create (or return) the voucher — exactly once per payment ──
    // The Stripe webhook runs the same function, so whichever arrives first
    // creates the voucher and the other gets the same result back.

    const payload = await getPayload({ config })

    const voucher = await fulfilVoucherPurchase(payload, {
      paymentKey: idempotencyKey,
      meta,
      amountCents,
      waitMs: 20_000,
    })

    return NextResponse.json({ success: true, voucher })
  } catch (error) {
    console.error('[voucher/confirm] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    )
  }
}
