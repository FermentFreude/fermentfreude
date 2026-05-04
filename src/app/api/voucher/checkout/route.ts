import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/voucher/checkout — Create Stripe Payment Intent
 *
 *  Creates a Stripe Payment Intent for a generic workshop
 *  experience gift voucher. Returns a clientSecret so the
 *  in-app checkout page can render Stripe Elements inline.
 *
 *  The voucher record is created AFTER successful payment
 *  (in /api/voucher/confirm).
 * ═══════════════════════════════════════════════════════════════ */

interface CheckoutBody {
  amount: number
  deliveryMethod: 'email' | 'pickup'
  purchaserName: string
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

    if (
      !body.purchaserName ||
      typeof body.purchaserName !== 'string' ||
      body.purchaserName.trim().length < 2
    ) {
      return NextResponse.json(
        { success: false, error: 'Purchaser name is required.' },
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

    // ─── Create Stripe Payment Intent ─────────────────────────────

    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount * 100,
      currency: 'eur',
      receipt_email: body.purchaserEmail,
      metadata: {
        type: 'voucher_purchase',
        amount: String(body.amount),
        deliveryMethod: body.deliveryMethod,
        purchaserName: body.purchaserName.trim().slice(0, 250),
        purchaserEmail: body.purchaserEmail,
        recipientEmail: body.recipientEmail || '',
      },
    })

    if (!paymentIntent.client_secret) {
      return NextResponse.json(
        { success: false, error: 'Failed to create payment intent.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('[voucher/checkout] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
