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

    // ─── Extract Pickup Details (Physical Products) ─────────────────
    // Check if this order contains pickup information
    let pickupDate = ''
    let pickupTime = ''
    let pickupLocation = ''
    let pickupAddress = ''

    try {
      // Get transaction for this order to find additional data
      const transactions = await req.payload.find({
        collection: 'transactions',
        where: {
          order: {
            equals: doc.id,
          },
        },
        limit: 1,
        depth: 1,
        overrideAccess: true,
      })

      if (transactions.totalDocs > 0) {
        const transaction = transactions.docs[0]
        
        // Extract pickup info from transaction data if available
        if (transaction.data) {
          const transactionData = typeof transaction.data === 'string' 
            ? JSON.parse(transaction.data) 
            : transaction.data
          
          pickupDate = transactionData?.pickupDate || ''
          pickupTime = transactionData?.pickupTime || ''
          pickupLocation = transactionData?.pickupLocation || ''
          pickupAddress = transactionData?.pickupAddress || ''
        }
      }
    } catch (err) {
      req.payload.logger.warn(
        `[Brevo] Could not fetch pickup details for order ${doc.id}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    // ─── Extract Workshop Details ───────────────────────────────
    // Look for workshop-bookings that match this order by checking the cart/transaction
    // For now, extract from items if any are workshop products
    let workshopDate = ''
    let workshopTime = ''
    let workshopLocation = ''
    let guestCount = 0
    let workshopPrice = ''

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
        const cartId = typeof transaction.cart === 'object' ? transaction.cart?.id : transaction.cart

        if (cartId) {
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
            workshopPrice = booking.totalPrice
              ? `€${(booking.totalPrice).toFixed(2)}`
              : ''

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
                  workshopLocation = typeof appointment.location === 'object' 
                    ? (appointment.location?.name || '')
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

    const emailParams: Record<string, string> = {
      ORDER_ID: String(doc.id),
      ORDER_TOTAL: String(doc.total ?? ''),
      ORDER_ITEMS: itemSummary,
      CUSTOMER_NAME: recipientName || recipientEmail,
      ORDER_DATE: new Date().toLocaleDateString('de-DE'),
    }

    // Add pickup details if found (physical products)
    if (pickupDate) {
      emailParams.PICKUP_DATE = pickupDate
    }
    if (pickupTime) {
      emailParams.PICKUP_TIME = pickupTime
    }
    if (pickupLocation) {
      emailParams.PICKUP_LOCATION = pickupLocation
    }
    if (pickupAddress) {
      emailParams.PICKUP_ADDRESS = pickupAddress
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
