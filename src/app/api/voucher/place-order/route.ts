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
  try {
    const body = await request.json()
    const { voucherCode, customerEmail, customerName, userId } = body

    if (!voucherCode || typeof voucherCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Voucher code is required.' },
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
        { success: false, error: 'Ungültiger Gutschein-Code.' },
        { status: 400 },
      )
    }

    const voucher = vouchers.docs[0]

    if (voucher.status !== 'active' || voucher.redeemed) {
      return NextResponse.json(
        { success: false, error: 'Dieser Gutschein wurde bereits eingelöst.' },
        { status: 400 },
      )
    }

    // 2. Get the user's cart
    let cartItems: { product: string; variant?: string | null; quantity: number }[] = []
    let cartId: string | null = null

    if (userId) {
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

    if (!cartItems.length) {
      return NextResponse.json(
        { success: false, error: 'Der Warenkorb ist leer.' },
        { status: 400 },
      )
    }

    // 3. Build workshop title from cart items for the voucher record
    const productTitles: string[] = []
    for (const item of cartItems) {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: item.product,
          depth: 0,
          overrideAccess: true,
        })
        if (product?.title) productTitles.push(product.title)
      } catch {
        // ignore
      }
    }
    const workshopTitle = productTitles.join(', ') || 'Workshop'

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
      overrideAccess: true,
    })

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
      { success: false, error: 'Bestellung fehlgeschlagen. Bitte versuche es erneut.' },
      { status: 500 },
    )
  }
}
