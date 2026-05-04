import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

/**
 * Send order confirmation email via Brevo after a new order is created.
 * Orders are only created after Stripe confirms payment, so
 * operation === 'create' means the payment succeeded.
 */
export const sendOrderConfirmationEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const customerId = typeof doc.customer === 'object' ? doc.customer?.id : doc.customer

  try {
    let recipientEmail: string | undefined
    let recipientName: string | undefined

    if (customerId) {
      const user = await req.payload.findByID({
        collection: 'users',
        id: customerId,
        depth: 0,
        overrideAccess: true,
      })
      recipientEmail = user?.email
      recipientName = user?.name || undefined
    } else if (doc.customerEmail) {
      recipientEmail = doc.customerEmail
    }

    if (
      !recipientName &&
      typeof doc.customerName === 'string' &&
      doc.customerName.trim().length > 0
    ) {
      recipientName = doc.customerName.trim()
    }

    if (!recipientEmail) return doc

    const items: {
      product?: string | { id?: string; title?: string } | null
      variant?: string | { id?: string; title?: string } | null
      quantity?: number
    }[] = doc.items ?? []

    const fmtEuro = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`

    // ─── Resolve product details for each line item (image, sku, price) ───
    type ResolvedItem = {
      title: string
      sku: string
      thumbUrl: string
      shortDesc: string
      qty: number
      unitCents: number | null
    }
    const resolvedItems: ResolvedItem[] = []
    for (const item of items) {
      const qty = item.quantity ?? 1
      let productDoc:
        | (Record<string, unknown> & { id?: string; title?: string })
        | undefined
      const productRef = item.product
      if (typeof productRef === 'string') {
        try {
          productDoc = (await req.payload.findByID({
            collection: 'products',
            id: productRef,
            depth: 2,
            overrideAccess: true,
          })) as unknown as Record<string, unknown> & { id?: string; title?: string }
        } catch {
          productDoc = undefined
        }
      } else if (productRef && typeof productRef === 'object') {
        productDoc = productRef as unknown as Record<string, unknown> & { id?: string; title?: string }
      }

      const title = (productDoc?.title as string | undefined) ?? 'Product'
      const shortDesc = (productDoc?.shortDescription as string | undefined) ?? ''
      const sku = (productDoc?.sku as string | undefined) ?? ''
      const unitCentsRaw = productDoc?.priceInEUR
      const unitCents = typeof unitCentsRaw === 'number' ? unitCentsRaw : null

      // Resolve thumbnail from first gallery image
      let thumbUrl = ''
      const gallery = productDoc?.gallery as
        | { image?: { url?: string } | string }[]
        | undefined
      if (Array.isArray(gallery) && gallery.length > 0) {
        const first = gallery[0]
        if (first && typeof first.image === 'object' && first.image?.url) {
          thumbUrl = first.image.url
        }
      }

      resolvedItems.push({ title, sku, thumbUrl, shortDesc, qty, unitCents })
    }

    // Plain-text comma string (legacy ORDER_ITEMS — kept for backwards compat)
    const itemSummary = resolvedItems
      .map((i) => `${i.title} x${i.qty}`)
      .join(', ')

    // Structured array for Brevo Liquid `{% for item in params.ITEMS %}` loop.
    // Brevo HTML-escapes string params, so pre-built HTML blobs render as
    // visible markup. Pass structured fields and let the template render rows.
    const itemsArray = resolvedItems.map((i) => {
      const lineCents = i.unitCents !== null ? i.unitCents * i.qty : null
      return {
        title: i.title,
        sku: i.sku,
        shortDesc: i.shortDesc,
        qty: i.qty,
        thumbUrl: i.thumbUrl,
        unitPrice: i.unitCents !== null ? fmtEuro(i.unitCents) : '',
        lineTotal: lineCents !== null ? fmtEuro(lineCents) : '',
      }
    })

    // ─── Extract Workshop Details ───────────────────────────────
    // Look for workshop-bookings that match this order by checking the cart/transaction
    // For now, extract from items if any are workshop products
    let workshopDate = ''
    let workshopTime = ''
    let workshopLocation = ''
    let guestCount = 0
    let workshopPrice = ''
    type BookingParam = {
      title: string
      dateTime: string
      location: string
      guests: number
      price: string
    }
    const bookingsArray: BookingParam[] = []

    // Cart-derived monetary breakdown
    let cartSubtotal: number | null = null
    let cartShipping: number | null = null
    let isPickup = false

    // Try to find workshop bookings associated with this order
    try {
      // Get transaction for this order to find cart ID
      const transactions = await req.payload.find({
        collection: 'transactions',
        where: {
          order: {
            equals: doc.id,
          },
        },
        limit: 1,
        overrideAccess: true,
      })

      if (transactions.totalDocs > 0) {
        const transaction = transactions.docs[0]
        const cartId =
          typeof transaction.cart === 'object' ? transaction.cart?.id : transaction.cart

        if (cartId) {
          // Pull cart for subtotal/shipping breakdown
          try {
            const cart = await req.payload.findByID({
              collection: 'carts',
              id: cartId,
              depth: 0,
              overrideAccess: true,
            })
            const c = cart as unknown as Record<string, unknown>
            if (typeof c?.subtotal === 'number') cartSubtotal = c.subtotal as number
            if (typeof c?.shipmentTotal === 'number') cartShipping = c.shipmentTotal as number
            else if (typeof c?.shipping === 'number') cartShipping = c.shipping as number
          } catch {
            // ignore — cart fields are best-effort
          }

          // Find ALL workshop bookings with this cart ID (A5 — was docs[0])
          const bookings = await req.payload.find({
            collection: 'workshop-bookings',
            where: {
              cartSlug: {
                equals: cartId,
              },
            },
            limit: 50,
            overrideAccess: true,
          })

          if (bookings.totalDocs > 0) {
            // Surface first booking through the legacy singular params
            const first = bookings.docs[0]
            workshopDate = first.date || ''
            workshopTime = first.time || ''
            guestCount = first.guestCount || 0
            workshopPrice = first.totalPrice ? `€${first.totalPrice.toFixed(2)}` : ''

            // Build per-booking structured array for Liquid loop (sequential — Mongo M0)
            for (const b of bookings.docs) {
              let locName = ''
              let locAddress = ''
              if (b.appointmentId) {
                try {
                  const appointment = await req.payload.findByID({
                    collection: 'workshop-appointments',
                    id: b.appointmentId,
                    depth: 1,
                    overrideAccess: true,
                  })
                  if (appointment && (appointment as { location?: unknown }).location) {
                    const loc = (appointment as { location?: unknown }).location
                    if (typeof loc === 'object' && loc !== null) {
                      const l = loc as { name?: string; address?: string }
                      locName = l.name ?? ''
                      locAddress = l.address ?? ''
                    } else if (typeof loc === 'string') {
                      locName = loc
                    }
                  }
                } catch {
                  // ignore — location is best-effort
                }
              }
              if (!workshopLocation && locName) workshopLocation = locName

              const linePrice =
                typeof b.totalPrice === 'number'
                  ? `€${b.totalPrice.toFixed(2).replace('.', ',')}`
                  : ''
              const dateTimeParts = [String(b.date ?? ''), String(b.time ?? '')].filter(
                (s) => s.trim() !== '',
              )
              const locationStr = locName
                ? locAddress
                  ? `${locName}, ${locAddress}`
                  : locName
                : ''
              bookingsArray.push({
                title: String(b.workshopTitle ?? 'Workshop'),
                dateTime: dateTimeParts.join(' · '),
                location: locationStr,
                guests: typeof b.guestCount === 'number' ? b.guestCount : 1,
                price: linePrice,
              })
            }

            // Pickup detection: any workshop booking implies on-site pickup
            isPickup = true
          }
        }
      }
    } catch (err) {
      req.payload.logger.warn(
        `[Brevo] Could not fetch workshop details for order ${doc.id}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    // Pickup also true if no shipping address and no shipping cost
    const addrHasContent = !!(
      doc.shippingAddress &&
      (doc.shippingAddress.addressLine1 || doc.shippingAddress.postalCode)
    )
    if (!addrHasContent && (cartShipping === null || cartShipping === 0)) {
      isPickup = true
    }

    // Payload ecommerce / Stripe store amounts in the smallest currency unit (cents).
    // Convert to euros for display.
    const fmtMoney = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`

    const orderTotalNum = typeof doc.amount === 'number' ? doc.amount : null
    const computedSubtotal =
      cartSubtotal ??
      (orderTotalNum !== null && cartShipping !== null ? orderTotalNum - cartShipping : null)

    // SHIPPING param: for pickup orders show "Abholung — {locationName}",
    // otherwise the formatted shipping cost (or €0,00 fallback).
    let shippingDisplay: string
    if (isPickup) {
      // Resolve a default pickup location from the WorkshopLocations global if booking didn't set one
      let pickupLabel = workshopLocation
      if (!pickupLabel) {
        try {
          const locations = await req.payload.find({
            collection: 'workshop-locations',
            limit: 1,
            overrideAccess: true,
          })
          const loc = locations.docs[0] as { name?: string } | undefined
          if (loc?.name) pickupLabel = loc.name
        } catch {
          // ignore
        }
      }
      shippingDisplay = pickupLabel ? `Abholung — ${pickupLabel}` : 'Abholung'
    } else {
      shippingDisplay = cartShipping !== null ? fmtMoney(cartShipping) : '€0,00'
    }

    // Format shipping address (best effort)
    let shippingAddressStr = ''
    const addr = doc.shippingAddress as Record<string, string | null | undefined> | undefined
    if (addr) {
      const lines = [
        [addr.firstName, addr.lastName].filter(Boolean).join(' '),
        addr.company,
        addr.addressLine1,
        addr.addressLine2,
        [addr.postalCode, addr.city].filter(Boolean).join(' '),
        addr.country,
      ].filter((l) => l && String(l).trim())
      shippingAddressStr = lines.join('\n')
    }

    const orderNumber = String(doc.id).slice(-8).toUpperCase()

    const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'

    const emailParams: Record<
      string,
      string | number | Array<Record<string, string | number>>
    > = {
      ORDER_ID: String(doc.id),
      ORDER_NUMBER: orderNumber,
      ORDER_TOTAL: orderTotalNum !== null ? fmtMoney(orderTotalNum) : '',
      TOTAL: orderTotalNum !== null ? fmtMoney(orderTotalNum) : '',
      SUBTOTAL: computedSubtotal !== null ? fmtMoney(computedSubtotal) : '',
      SHIPPING: shippingDisplay,
      SHIPPING_ADDRESS: shippingAddressStr,
      ORDER_ITEMS: itemSummary,
      // Structured arrays — Brevo Liquid `{% for item in params.ITEMS %}`
      ITEMS: itemsArray,
      WORKSHOP_BOOKINGS: bookingsArray,
      CUSTOMER_NAME: recipientName || recipientEmail,
      FIRST_NAME: recipientName?.split(' ')[0] || recipientName || recipientEmail,
      ORDER_DATE: new Date().toLocaleDateString('de-DE'),
      ORDER_URL: `${siteUrl}/account/orders`,
      SHOP_URL: `${siteUrl}/workshops`,
      PRIVACY_URL: `${siteUrl}/datenschutz`,
      AGB_URL: `${siteUrl}/agb`,
    }

    // Add workshop details if found
    if (workshopDate) {
      emailParams.WORKSHOP_DATE = workshopDate
    }
    if (workshopTime) {
      emailParams.WORKSHOP_TIME = workshopTime
    }
    if (workshopLocation) {
      emailParams.WORKSHOP_LOCATION = workshopLocation
    }
    if (guestCount > 0) {
      emailParams.GUEST_COUNT = String(guestCount)
    }
    if (workshopPrice) {
      emailParams.TOTAL_PRICE = workshopPrice
    }

    await sendTemplateEmail({
      to: [{ email: recipientEmail, name: recipientName }],
      templateId: BREVO_TEMPLATES.ORDER_CONFIRMATION,
      params: emailParams,
    })
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Order confirmation email failed for order ${doc.id}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
