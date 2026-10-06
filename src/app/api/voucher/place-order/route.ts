import { ensureCartWorkshopHolds, PAYMENT_HOLD_MINUTES } from '@/lib/workshopHolds'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/voucher/place-order
 *
 *  Creates an order paid entirely by a voucher (no Stripe).
 *  - Validates the voucher
 *  - Gets the user's cart
 *  - Creates an order with the cart items
 *  - Redeems the voucher
 *  - Clears the cart
 *  Returns the orderID for redirect.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  // Detect locale from Accept-Language header (default: de)
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const locale: 'de' | 'en' = acceptLanguage.toLowerCase().includes('en') && !acceptLanguage.toLowerCase().startsWith('de') ? 'en' : 'de'
  const ERR = locale === 'en'
    ? {
        codeRequired: 'Voucher code is required.',
        invalid: 'Invalid voucher code.',
        alreadyRedeemed: 'This voucher has already been redeemed.',
        emptyCart: 'Your cart is empty.',
        failed: 'Order failed. Please try again.',
        seatsGone:
          'A workshop date in your cart is no longer available. Please reload the page and choose another date.',
        reload: 'Please reload the page and try again.',
      }
    : {
        codeRequired: 'Gutschein-Code ist erforderlich.',
        invalid: 'Ungültiger Gutschein-Code.',
        alreadyRedeemed: 'Dieser Gutschein wurde bereits eingelöst.',
        emptyCart: 'Der Warenkorb ist leer.',
        failed: 'Bestellung fehlgeschlagen. Bitte versuche es erneut.',
        seatsGone:
          'Ein Workshop-Termin in deinem Warenkorb ist nicht mehr verfügbar. Bitte lade die Seite neu und wähle einen anderen Termin.',
        reload: 'Bitte lade die Seite neu und versuche es erneut.',
      }
  try {
    const body = await request.json()
    const {
      voucherCode,
      customerEmail,
      customerName,
      userId,
      cartId: clientCartId,
      cartItems: clientCartItems,
    } = body

    if (!voucherCode || typeof voucherCode !== 'string') {
      return NextResponse.json(
        { success: false, error: ERR.codeRequired },
        { status: 400 },
      )
    }

    const sanitizedCode = voucherCode.trim().toUpperCase()

    const config = await configPromise
    const payload = await getPayload({ config })

    // 1. Validate voucher
    const vouchers = await payload.find({
      collection: 'vouchers',
      where: {
        code: { equals: sanitizedCode },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (!vouchers.docs.length) {
      return NextResponse.json(
        { success: false, error: ERR.invalid },
        { status: 400 },
      )
    }

    const voucher = vouchers.docs[0]

    if (voucher.status !== 'active' || voucher.redeemed) {
      return NextResponse.json(
        { success: false, error: ERR.alreadyRedeemed },
        { status: 400 },
      )
    }

    // 2. Get the user's cart
    let cartItems: { product: string; variant?: string | null; quantity: number }[] = []
    let cartId: string | null = null

    // The basket itself is the authority when the browser tells us which one
    // it is (guests included) — its items carry the appointment of every
    // workshop line, which the booking confirmation needs.
    if (typeof clientCartId === 'string' && clientCartId.trim()) {
      try {
        const cart = await payload.findByID({
          collection: 'carts',
          id: clientCartId.trim(),
          depth: 0,
          overrideAccess: true,
        })
        if (cart.status !== 'purchased' && cart.items?.length) {
          cartId = cart.id
          cartItems = cart.items
            .filter((item) => item.product)
            .map((item) => ({
              product:
                typeof item.product === 'object' && item.product !== null
                  ? item.product.id
                  : String(item.product),
              variant:
                item.variant && typeof item.variant === 'object'
                  ? item.variant.id
                  : (item.variant ?? null),
              quantity: item.quantity ?? 1,
            }))
        }
      } catch {
        // Unknown cart — fall back to the lookups below
      }
    }

    if (!cartItems.length && userId) {
      const carts = await payload.find({
        collection: 'carts',
        where: {
          customer: { equals: userId },
        },
        limit: 1,
        depth: 1,
        overrideAccess: true,
      })

      if (carts.docs.length && carts.docs[0].items?.length) {
        const cart = carts.docs[0]
        cartId = cart.id
        cartItems = (cart.items ?? [])
          .filter((item) => item.product)
          .map((item) => ({
            product: typeof item.product === 'object' && item.product !== null ? item.product.id : String(item.product),
            variant:
              item.variant && typeof item.variant === 'object'
                ? item.variant.id
                : (item.variant ?? null),
            quantity: item.quantity ?? 1,
          }))
      }
    }

    // Fallback to client-provided cart items (covers guests and carts not yet synced to DB)
    if (!cartItems.length && Array.isArray(clientCartItems) && clientCartItems.length) {
      cartItems = clientCartItems
        .filter((item: unknown) => {
          if (typeof item !== 'object' || item === null) return false
          const i = item as Record<string, unknown>
          return typeof i.product === 'string' && i.product.length > 0
        })
        .map((item: Record<string, unknown>) => ({
          product: item.product as string,
          variant: typeof item.variant === 'string' ? item.variant : null,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
        }))
    }

    if (!cartItems.length) {
      return NextResponse.json(
        { success: false, error: ERR.emptyCart },
        { status: 400 },
      )
    }

    // 3. Build workshop title from cart items + collect slugs for booking confirmation
    const productTitles: string[] = []
    const workshopItems: { workshopSlug: string; guestCount: number }[] = []
    for (const item of cartItems) {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: item.product,
          depth: 0,
          overrideAccess: true,
        })
        if (product?.title) productTitles.push(product.title)
        const slug = (product as unknown as { slug?: string })?.slug ?? ''
        if (slug.startsWith('workshop-')) {
          workshopItems.push({ workshopSlug: slug.replace(/^workshop-/, ''), guestCount: item.quantity ?? 1 })
        }
      } catch {
        // ignore
      }
    }
    const workshopTitle = productTitles.join(', ') || 'Workshop'

    // 3b. Final check at the door — the workshop seats must still be held
    // (re-held if the hold ran out but seats are free). Without the basket
    // we can't tell which dates these are, so we can't book them safely.
    if (workshopItems.length > 0) {
      if (!cartId) {
        return NextResponse.json({ success: false, error: ERR.reload }, { status: 400 })
      }
      const { lines } = await ensureCartWorkshopHolds(payload, cartId, {
        holdMinutes: PAYMENT_HOLD_MINUTES,
      })
      if (lines.some((line) => line.status !== 'held')) {
        return NextResponse.json(
          { success: false, error: ERR.seatsGone, code: 'WORKSHOP_UNAVAILABLE' },
          { status: 409 },
        )
      }
    }

    // 4. Create order
    const order = await payload.create({
      collection: 'orders',
      data: {
        items: cartItems.map((item) => ({
          product: item.product,
          variant: item.variant ?? undefined,
          quantity: item.quantity,
        })),
        customer: userId || undefined,
        customerEmail: customerEmail || undefined,
        customerName:
          typeof customerName === 'string' && customerName.trim().length >= 2
            ? customerName.trim().slice(0, 250)
            : undefined,
        status: 'completed',
        amount: 0,
        currency: 'EUR',
      },
      // Read by sendOrderConfirmationEmail's admin notification so a €0,00
      // order reads as "paid with voucher FF-GIFT-XXXX" instead of a mistake.
      // cartId: lets confirmWorkshopBookings confirm exactly this basket's
      // bookings — a voucher order has no Stripe transaction to find it by.
      context: { paidByVoucher: sanitizedCode, cartId },
      overrideAccess: true,
    })

    // Workshop bookings are confirmed (and their confirmation emails sent)
    // by the confirmWorkshopBookings hook during the create above, using the
    // cartId in context. The old fallback here matched "any pending booking
    // for this workshop" and could confirm another customer's basket.

    // 5. Redeem the voucher
    await payload.update({
      collection: 'vouchers',
      id: voucher.id,
      data: {
        status: 'redeemed',
        redeemed: true,
        redeemedOn: new Date().toISOString(),
        redeemedForWorkshop: workshopTitle,
        notes: `Order: ${order.id}`,
      },
      overrideAccess: true,
    })

    // 6. Clear the cart
    if (cartId) {
      await payload.update({
        collection: 'carts',
        id: cartId,
        data: {
          items: [],
          subtotal: 0,
        },
        overrideAccess: true,
      })
    }

    return NextResponse.json({
      success: true,
      orderID: order.id,
    })
  } catch (err) {
    console.error('[place-order] Error:', err)
    return NextResponse.json(
      { success: false, error: ERR.failed },
      { status: 500 },
    )
  }
}
