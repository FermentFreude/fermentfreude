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
      }
    : {
        codeRequired: 'Gutschein-Code ist erforderlich.',
        invalid: 'Ungültiger Gutschein-Code.',
        alreadyRedeemed: 'Dieser Gutschein wurde bereits eingelöst.',
        emptyCart: 'Der Warenkorb ist leer.',
        failed: 'Bestellung fehlgeschlagen. Bitte versuche es erneut.',
      }
  try {
    const body = await request.json()
    const { voucherCode, customerEmail, customerName, userId, cartItems: clientCartItems } = body

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

    // 4b. Explicitly confirm workshop bookings and stamp orderId.
    // confirmWorkshopBookings (afterChange hook) runs above but may miss bookings
    // when there is no Stripe transaction (= no cartId) and the booking email
    // differs from the checkout email. We run a targeted confirmation here as a
    // reliable fallback. Sequential writes only (Atlas M0 — no Promise.all).
    for (const { workshopSlug, guestCount } of workshopItems) {
      try {
        // Primary: match by email + workshopSlug + guestCount
        let bookingResult = customerEmail
          ? await payload.find({
              collection: 'workshop-bookings',
              where: {
                and: [
                  { workshopSlug: { equals: workshopSlug } },
                  { status: { equals: 'pending' } },
                  { guestCount: { equals: guestCount } },
                  { email: { equals: customerEmail } },
                ],
              },
              sort: '-createdAt',
              limit: 1,
              overrideAccess: true,
            })
          : null

        // Fallback: any pending booking for this workshop + guest count
        if (!bookingResult?.totalDocs) {
          bookingResult = await payload.find({
            collection: 'workshop-bookings',
            where: {
              and: [
                { workshopSlug: { equals: workshopSlug } },
                { status: { equals: 'pending' } },
                { guestCount: { equals: guestCount } },
              ],
            },
            sort: '-createdAt',
            limit: 1,
            overrideAccess: true,
          })
        }

        // Last resort: any pending booking for this workshop
        if (!bookingResult?.totalDocs) {
          bookingResult = await payload.find({
            collection: 'workshop-bookings',
            where: {
              and: [
                { workshopSlug: { equals: workshopSlug } },
                { status: { equals: 'pending' } },
              ],
            },
            sort: '-createdAt',
            limit: 1,
            overrideAccess: true,
          })
        }

        if (bookingResult?.totalDocs && bookingResult.docs[0]) {
          const booking = bookingResult.docs[0]
          const updateData: Record<string, unknown> = {
            status: 'confirmed',
            orderId: String(order.id),
          }
          // Copy customer info if not already on the booking
          if (!booking.email && customerEmail) updateData.email = customerEmail
          if (!booking.firstName && typeof customerName === 'string' && customerName.trim()) {
            const parts = customerName.trim().split(/\s+/)
            updateData.firstName = parts[0]
            if (!booking.lastName && parts.length > 1) updateData.lastName = parts.slice(1).join(' ')
          }
          await payload.update({
            collection: 'workshop-bookings',
            id: booking.id,
            data: updateData,
            overrideAccess: true,
          })
        }
      } catch (bookingErr) {
        console.error('[place-order] Failed to confirm booking for', workshopSlug, bookingErr)
        // Non-fatal: order is still valid, tickets page will use fallback lookup
      }
    }

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
