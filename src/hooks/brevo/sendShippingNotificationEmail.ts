import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

/**
 * Send shipping notification email via Brevo when order status changes to 'shipped'.
 *
 * For PRODUCTS ONLY: "Order ready for pickup in 2 hours at our store"
 * For WORKSHOPS: Standard tracking email (no physical shipping)
 *
 * Email template parameters:
 * - FIRST_NAME: Customer first name
 * - ORDER_NUMBER: Order ID
 * - TRACKING_NUMBER: Tracking number (if available) / Pickup location
 * - CARRIER: Shipping carrier name (if available) / "Store Pickup"
 * - ESTIMATED_DELIVERY: Estimated delivery date / Pickup time
 * - TRACKING_URL: Link to track shipment / Store location link
 */
export const sendShippingNotificationEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // Only send on update when status changes to 'shipped'
  if (operation !== 'update') return doc

  // Check if status was just updated to 'shipped'
  const currentStatus = doc.status
  if (currentStatus !== 'shipped') return doc

  const customerId = typeof doc.customer === 'object' ? doc.customer?.id : doc.customer

  try {
    let recipientEmail: string | undefined
    let recipientName: string | undefined
    let recipientFirstName: string | undefined

    if (customerId) {
      const user = await req.payload.findByID({
        collection: 'users',
        id: customerId,
        depth: 0,
        overrideAccess: true,
      })
      recipientEmail = user?.email
      recipientName = user?.name || undefined
      recipientFirstName = recipientName?.split(' ')[0] || recipientName || recipientEmail
    } else if (doc.customerEmail) {
      recipientEmail = doc.customerEmail
      recipientFirstName = recipientEmail
    }

    if (!recipientEmail) return doc

    // Check if order contains only products (no workshops)
    const items =
      (doc.items as
        | Array<{
            product?:
              | string
              | { productType?: string | null; slug?: string | null }
              | null
          }>
        | undefined) || []
    const hasWorkshops = items.some((item) => {
      if (typeof item.product === 'object' && item.product) {
        const p = item.product as { productType?: string | null; slug?: string | null }
        return (
          p.productType === 'workshop' ||
          (typeof p.slug === 'string' && p.slug.startsWith('workshop-'))
        )
      }
      return false
    })

    // ═════════════════════════════════════════════════════════════════
    // PRODUCTS ONLY: Store Pickup (2 hours)
    // ═════════════════════════════════════════════════════════════════
    if (!hasWorkshops) {
      const pickupTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
      const pickupTimeFormatted = pickupTime.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      })

      await sendTemplateEmail({
        to: [{ email: recipientEmail, name: recipientName || undefined }],
        templateId: BREVO_TEMPLATES.SHIPPING_NOTIFICATION,
        params: {
          FIRST_NAME: recipientFirstName || 'Valued Customer',
          ORDER_NUMBER: String(doc.id),
          TRACKING_NUMBER: 'Store Pickup',
          CARRIER: 'Ready for Pickup',
          ESTIMATED_DELIVERY: `Ab ${pickupTimeFormatted} Uhr`,
          TRACKING_URL: `${process.env.NEXT_PUBLIC_SERVER_URL}/store-location`,
        },
      })

      req.payload.logger.info(
        `[Brevo] Store pickup notification sent for order ${doc.id} to ${recipientEmail}`,
      )
    } else {
      // ═════════════════════════════════════════════════════════════════
      // WORKSHOPS: Standard tracking (if needed in future)
      // ═════════════════════════════════════════════════════════════════
      const trackingNumber = (doc.trackingNumber as string | undefined) || ''
      const carrier = (doc.shippingCarrier as string | undefined) || 'DHL'
      let trackingUrl = ''

      if (trackingNumber) {
        if (carrier.toLowerCase().includes('dhl')) {
          trackingUrl = `https://tracking.dhl.com/?shipmentid=${trackingNumber}`
        } else if (carrier.toLowerCase().includes('fedex')) {
          trackingUrl = `https://tracking.fedex.com/tracking?tracknumbers=${trackingNumber}`
        } else if (carrier.toLowerCase().includes('ups')) {
          trackingUrl = `https://www.ups.com/track?tracknum=${trackingNumber}`
        } else {
          trackingUrl = `https://www.fermentfreude.com/track?order=${doc.id}`
        }
      }

      // Calculate estimated delivery (add 5 business days)
      const shippedDate = new Date(doc.updatedAt || new Date())
      const estimatedDelivery = new Date(shippedDate.getTime() + 5 * 24 * 60 * 60 * 1000)

      await sendTemplateEmail({
        to: [{ email: recipientEmail, name: recipientName || undefined }],
        templateId: BREVO_TEMPLATES.SHIPPING_NOTIFICATION,
        params: {
          FIRST_NAME: recipientFirstName || 'Valued Customer',
          ORDER_NUMBER: String(doc.id),
          TRACKING_NUMBER: trackingNumber || 'N/A',
          CARRIER: carrier,
          ESTIMATED_DELIVERY: estimatedDelivery.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          TRACKING_URL: trackingUrl || `https://www.fermentfreude.com/track?order=${doc.id}`,
        },
      })

      req.payload.logger.info(
        `[Brevo] Shipping notification sent for order ${doc.id} to ${recipientEmail}`,
      )
    }
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Shipping notification failed for order ${doc.id}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
