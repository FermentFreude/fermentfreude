import { stripe } from '@/lib/stripe'
import { getServerSideURL } from '@/utilities/getURL'
import { NextRequest, NextResponse } from 'next/server'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/voucher/checkout — Create Stripe Checkout Session
 *
 *  Creates a Stripe Checkout Session for a generic workshop
 *  experience gift voucher. No specific workshop is tied to the
 *  purchase — the recipient chooses when they redeem at checkout.
 *
 *  The voucher record is created AFTER successful payment
 *  (in /api/voucher/confirm).
 * ═══════════════════════════════════════════════════════════════ */

interface CheckoutBody {
  amount: number
  deliveryMethod: 'email' | 'pickup'
  purchaserEmail: string
  recipientEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json()

    // ─── Input Validation ───────────────────────────────────────

    if (!body.amount || typeof body.amount !== 'number' || body.amount < 1 || body.amount > 9999) {
      return NextResponse.json(
        { success: false, error: 'Invalid voucher amount.' },
        { status: 400 },
      )
    }

    if (!body.purchaserEmail || typeof body.purchaserEmail !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Purchaser email is required.' },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.purchaserEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchaser email format.' },
        { status: 400 },
      )
    }

    if (!['email', 'pickup'].includes(body.deliveryMethod)) {
      return NextResponse.json(
        { success: false, error: 'Invalid delivery method.' },
        { status: 400 },
      )
    }

    if (body.recipientEmail && !emailRegex.test(body.recipientEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recipient email format.' },
        { status: 400 },
      )
    }

    // ─── Create Stripe Checkout Session ──────────────────────────

    const baseUrl = getServerSideURL()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: body.purchaserEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'FermentFreude Geschenkgutschein',
              description: `Workshop-Erlebnis Gutschein \u00FCber \u20AC${body.amount} \u2014 einl\u00F6sbar f\u00FCr jeden Workshop`,
            },
            unit_amount: body.amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'voucher_purchase',
        amount: String(body.amount),
        deliveryMethod: body.deliveryMethod,
        purchaserEmail: body.purchaserEmail,
        recipientEmail: body.recipientEmail || '',
      },
      success_url: `${baseUrl}/voucher/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/workshops/voucher`,
    })

    if (!session.url) {
      return NextResponse.json(
        { success: false, error: 'Failed to create checkout session.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      sessionUrl: session.url,
    })
  } catch (error) {
    console.error('[voucher/checkout] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
