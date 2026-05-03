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

    const items: { product?: string | { title?: string } | null; quantity?: number }[] =
      doc.items ?? []

    const itemSummary = items
      .map((item) => {
        const title =
          typeof item.product === 'object' ? (item.product?.title ?? 'Product') : 'Product'
        return `${title} x${item.quantity ?? 1}`
      })
      .join(', ')

    // ─── Extract Workshop Details ───────────────────────────────
    // Look for workshop-bookings that match this order by checking the cart/transaction
    // For now, extract from items if any are workshop products
    let workshopDate = ''
    let workshopTime = ''
    let workshopLocation = ''
    let guestCount = 0
    let workshopPrice = ''

    // Cart-derived monetary breakdown
    let cartSubtotal: number | null = null
    let cartShipping: number | null = null

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

          // Find workshop bookings with this cart ID
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
            const booking = bookings.docs[0]
            workshopDate = booking.date || ''
            workshopTime = booking.time || ''
            guestCount = booking.guestCount || 0
            workshopPrice = booking.totalPrice ? `€${booking.totalPrice.toFixed(2)}` : ''

            // Get location from appointment
            if (booking.appointmentId) {
              try {
                const appointment = await req.payload.findByID({
                  collection: 'workshop-appointments',
                  id: booking.appointmentId,
                  depth: 1,
                  overrideAccess: true,
                })

                if (appointment && appointment.location) {
                  workshopLocation =
                    typeof appointment.location === 'object'
                      ? appointment.location?.name || ''
                      : appointment.location
                }
              } catch {
                // Ignore if appointment not found
              }
            }
          }
        }
      }
    } catch (err) {
      req.payload.logger.warn(
        `[Brevo] Could not fetch workshop details for order ${doc.id}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    // Payload ecommerce / Stripe store amounts in the smallest currency unit (cents).
    // Convert to euros for display.
    const fmtMoney = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`

    const orderTotalNum = typeof doc.amount === 'number' ? doc.amount : null
    const computedSubtotal =
      cartSubtotal ??
      (orderTotalNum !== null && cartShipping !== null ? orderTotalNum - cartShipping : null)

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

    const emailParams: Record<string, string> = {
      ORDER_ID: String(doc.id),
      ORDER_NUMBER: orderNumber,
      ORDER_TOTAL: orderTotalNum !== null ? fmtMoney(orderTotalNum) : '',
      TOTAL: orderTotalNum !== null ? fmtMoney(orderTotalNum) : '',
      SUBTOTAL: computedSubtotal !== null ? fmtMoney(computedSubtotal) : '',
      SHIPPING: cartShipping !== null ? fmtMoney(cartShipping) : '€0,00',
      SHIPPING_ADDRESS: shippingAddressStr,
      ORDER_ITEMS: itemSummary,
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
