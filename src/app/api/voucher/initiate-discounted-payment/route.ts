import { getStripe } from '@/lib/stripe'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/voucher/initiate-discounted-payment
 *
 *  Creates a Stripe PaymentIntent for the cart total MINUS a voucher's
 *  value, for the case where the voucher only PARTIALLY covers the cart
 *  (a voucher that fully covers the cart never reaches Stripe — see
 *  /api/voucher/place-order instead).
 *
 *  This exists because @payloadcms/plugin-ecommerce's own
 *  /api/payments/stripe/initiate always charges the raw cart.subtotal —
 *  it has no concept of a voucher/coupon — so a partial voucher applied
 *  at checkout previously showed a discount in the UI while Stripe still
 *  charged the full amount. This route replaces that call for the
 *  partial-voucher case only; everything downstream (Stripe Elements,
 *  the plugin's own confirmOrder, Order creation) is unchanged, because
 *  this route creates a matching Transaction row exactly like the
 *  plugin's initiatePayment does, so confirmOrder finds it by
 *  paymentIntentID same as any other order.
 *
 *  The voucher itself is NOT redeemed here — only once the Order is
 *  actually created (payment confirmed) via the redeemVoucherOnOrderComplete
 *  afterChange hook on Orders, keyed off the voucherCode stashed on the
 *  Transaction below.
 * ═══════════════════════════════════════════════════════════════ */

// Stripe's minimum charge for EUR is €0.50. A remainder below that can't be
// charged online — surface a clear error instead of a raw Stripe API failure.
const STRIPE_MIN_CHARGE_CENTS = 50

interface CartItem {
  product?: string | { id?: string } | null
  variant?: string | { id?: string } | null
  quantity: number
  [key: string]: unknown
}

export async function POST(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const locale: 'de' | 'en' =
    acceptLanguage.toLowerCase().includes('en') && !acceptLanguage.toLowerCase().startsWith('de')
      ? 'en'
      : 'de'
  const ERR =
    locale === 'en'
      ? {
          codeRequired: 'Voucher code is required.',
          cartRequired: 'Cart ID is required.',
          invalid: 'Invalid voucher code.',
          alreadyRedeemed: 'This voucher has already been redeemed.',
          expired: 'This voucher has expired.',
          emailRequired: 'A valid customer email is required.',
          cartNotFound: 'Cart not found or empty.',
          alreadyPaid: 'This cart has already been paid for.',
          coversAll: 'This voucher fully covers your cart — no online payment is needed.',
          tooSmall:
            'The remaining amount after the voucher is too small to charge online. Please contact us.',
          failed: 'Could not start payment. Please try again.',
        }
      : {
          codeRequired: 'Gutschein-Code ist erforderlich.',
          cartRequired: 'Warenkorb-ID ist erforderlich.',
          invalid: 'Ungültiger Gutschein-Code.',
          alreadyRedeemed: 'Dieser Gutschein wurde bereits eingelöst.',
          expired: 'Dieser Gutschein ist abgelaufen.',
          emailRequired: 'Eine gültige E-Mail-Adresse ist erforderlich.',
          cartNotFound: 'Warenkorb nicht gefunden oder leer.',
          alreadyPaid: 'Dieser Warenkorb wurde bereits bezahlt.',
          coversAll: 'Dieser Gutschein deckt deinen Warenkorb bereits vollständig ab.',
          tooSmall:
            'Der Restbetrag nach Abzug des Gutscheins ist zu gering für eine Online-Zahlung. Bitte kontaktiere uns.',
          failed: 'Zahlung konnte nicht gestartet werden. Bitte versuche es erneut.',
        }

  try {
    const body = await request.json()
    const {
      voucherCode,
      cartID,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerName,
      billingAddress,
      shippingAddress,
      pickupLocation,
      pickupDate,
      pickupTime,
      pickupAddress,
      userId,
    } = body ?? {}

    if (!voucherCode || typeof voucherCode !== 'string') {
      return NextResponse.json({ success: false, error: ERR.codeRequired }, { status: 400 })
    }
    if (!cartID || typeof cartID !== 'string') {
      return NextResponse.json({ success: false, error: ERR.cartRequired }, { status: 400 })
    }
    if (!customerEmail || typeof customerEmail !== 'string') {
      return NextResponse.json({ success: false, error: ERR.emailRequired }, { status: 400 })
    }

    const sanitizedCode = voucherCode.trim().toUpperCase()

    const config = await configPromise
    const payload = await getPayload({ config })

    // 1. Validate voucher
    const vouchers = await payload.find({
      collection: 'vouchers',
      where: { code: { equals: sanitizedCode } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const voucher = vouchers.docs[0]
    if (!voucher) {
      return NextResponse.json({ success: false, error: ERR.invalid }, { status: 404 })
    }
    if (voucher.status === 'redeemed' || voucher.redeemed) {
      return NextResponse.json({ success: false, error: ERR.alreadyRedeemed }, { status: 410 })
    }
    if (voucher.status === 'expired') {
      return NextResponse.json({ success: false, error: ERR.expired }, { status: 410 })
    }

    // 2. Load the cart — subtotal is trusted server-side, same as the
    // plugin's own initiatePayment (kept in sync on every cart write by
    // beforeChangeCart).
    const cart = await payload.findByID({
      collection: 'carts',
      id: cartID,
      depth: 2,
      overrideAccess: true,
    })

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return NextResponse.json({ success: false, error: ERR.cartNotFound }, { status: 404 })
    }

    // 2b. Refuse a second payment for a cart that's already been paid for.
    // The Transactions beforeValidate hook (preventDuplicatePayment.ts) is
    // the universal safety net for this — it also covers the plugin's own
    // /api/payments/stripe/initiate — but checking it here too avoids a
    // wasted Stripe API call and lets us return a clear, localized message
    // instead of the hook's generic one.
    if (cart.status === 'purchased') {
      return NextResponse.json({ success: false, error: ERR.alreadyPaid }, { status: 409 })
    }

    // 3. Compute the discounted amount
    const subtotal = cart.subtotal ?? 0
    const discountCents = Math.round((voucher.value ?? 0) * 100)
    const discountedAmount = Math.max(0, subtotal - discountCents)

    if (discountedAmount === 0) {
      return NextResponse.json({ success: false, error: ERR.coversAll }, { status: 400 })
    }
    if (discountedAmount < STRIPE_MIN_CHARGE_CENTS) {
      return NextResponse.json({ success: false, error: ERR.tooSmall }, { status: 400 })
    }

    // 4. Flatten cart items the same way the plugin's Stripe adapter does —
    // matters for confirmOrder, which uses this same shape verbatim as the
    // resulting Order's `items`.
    const flattenedCart = (cart.items as CartItem[]).map((item) => {
      const productID =
        typeof item.product === 'object' && item.product !== null ? item.product.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object' && item.variant !== null
          ? item.variant.id
          : item.variant
        : undefined
      const { product: _product, variant: _variant, ...customProperties } = item
      return {
        ...customProperties,
        product: productID,
        quantity: item.quantity,
        ...(variantID ? { variant: variantID } : {}),
      }
    })

    // 5. Create the Stripe PaymentIntent for the discounted amount
    const stripe = getStripe()
    let customer = (await stripe.customers.list({ email: customerEmail })).data[0]
    if (!customer?.id) {
      customer = await stripe.customers.create({ email: customerEmail })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: discountedAmount,
      automatic_payment_methods: { enabled: true },
      currency: 'eur',
      customer: customer.id,
      metadata: {
        cartID: cart.id,
        cartItemsSnapshot: JSON.stringify(flattenedCart),
        voucherCode: voucher.code,
        // Only set when present — matching the plugin's own initiatePayment,
        // which serializes `data.shippingAddress` directly (undefined when
        // absent, so Stripe drops the key). Writing the literal string
        // "null" here would make confirmOrder's `metadata.shippingAddress ?
        // JSON.parse(...) : undefined` take the parse branch and pass a real
        // `null` into payload.create — Payload's own beforeValidate then
        // crashes descending into the shippingAddress group's children with
        // a null siblingDoc ("Cannot read properties of null (reading
        // 'title')"), since the group's undefined-only fallback never fires
        // for an explicit null.
        ...(shippingAddress ? { shippingAddress: JSON.stringify(shippingAddress) } : {}),
      },
    })

    // 6. Create the matching Transaction row so the plugin's own confirmOrder
    // endpoint (unchanged) finds it by paymentIntentID exactly like a normal
    // Stripe order.
    await payload.create({
      collection: 'transactions',
      data: {
        ...(userId ? { customer: userId } : { customerEmail }),
        amount: paymentIntent.amount,
        billingAddress: billingAddress ?? undefined,
        cart: cart.id,
        currency: (paymentIntent.currency ?? 'eur').toUpperCase() as 'EUR',
        items: flattenedCart,
        paymentMethod: 'stripe',
        status: 'pending',
        stripe: { customerID: customer.id, paymentIntentID: paymentIntent.id },
        customerFirstName: typeof customerFirstName === 'string' ? customerFirstName : undefined,
        customerLastName: typeof customerLastName === 'string' ? customerLastName : undefined,
        customerName: typeof customerName === 'string' ? customerName : undefined,
        // Note: the Transactions schema (src/plugins/index.ts) has no
        // customerPhone/customerDietSpecs fields — same as the plugin's own
        // initiatePayment, those never reach the Transaction for any order
        // today. Not introduced or fixed here; out of scope for the voucher
        // discount fix.
        pickupLocation: typeof pickupLocation === 'string' ? pickupLocation : undefined,
        pickupDate: typeof pickupDate === 'string' ? pickupDate : undefined,
        pickupTime: typeof pickupTime === 'string' ? pickupTime : undefined,
        pickupAddress: typeof pickupAddress === 'string' ? pickupAddress : undefined,
        voucherCode: voucher.code,
        voucherDiscountAmount: discountCents,
      },
      overrideAccess: true,
    })

    payload.logger.info(
      `[voucher/initiate-discounted-payment] PI ${paymentIntent.id} created for cart ${cart.id}: subtotal ${subtotal} - voucher ${voucher.code} (${discountCents}) = ${discountedAmount}`,
    )

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret || '',
      message: 'Payment initiated successfully',
      paymentIntentID: paymentIntent.id,
    })
  } catch (error) {
    console.error('[voucher/initiate-discounted-payment] Error:', error)
    return NextResponse.json({ success: false, error: ERR.failed }, { status: 500 })
  }
}
