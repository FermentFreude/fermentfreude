import type { PayloadRequest } from 'payload'
import type Stripe from 'stripe'

/**
 * Custom Stripe webhook handlers for the ecommerce plugin.
 *
 * These run inside the plugin's existing webhook endpoint at
 * /api/payments/stripe/webhooks — no separate route needed.
 *
 * MongoDB Atlas M0: sequential writes only — no Promise.all.
 */

/**
 * payment_intent.payment_failed
 *
 * When a payment fails, release reserved workshop spots and
 * cancel the pending booking records.
 */
export async function handlePaymentFailed({
  event,
  req,
}: {
  event: Stripe.Event
  req: PayloadRequest
  stripe: Stripe
}): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const { payload } = req

  payload.logger.info(
    `[stripe:payment_failed] PaymentIntent ${paymentIntent.id} failed — releasing workshop spots`,
  )

  // The payment intent metadata may contain cart info.
  // However, the most reliable approach is to find pending bookings
  // created around the same time and cancel them.
  // We look for pending bookings created in the last 2 hours
  // that haven't been confirmed yet.

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  const pendingBookings = await payload.find({
    collection: 'workshop-bookings',
    where: {
      and: [{ status: { equals: 'pending' } }, { createdAt: { greater_than: twoHoursAgo } }],
    },
    limit: 50,
    overrideAccess: true,
  })

  if (pendingBookings.totalDocs === 0) {
    payload.logger.info('[stripe:payment_failed] No pending bookings to release')
    return
  }

  // Cancel each pending booking and restore spots — sequentially (M0)
  for (const booking of pendingBookings.docs) {
    // Only cancel bookings that are still pending
    if (booking.status !== 'pending') continue

    // Restore spots on the appointment
    if (booking.appointmentId) {
      try {
        const appointment = await payload.findByID({
          collection: 'workshop-appointments',
          id: booking.appointmentId,
          depth: 1,
          overrideAccess: true,
        })

        const maxCapacity =
          typeof appointment.workshop === 'object'
            ? (appointment.workshop?.maxCapacityPerSlot ?? 12)
            : 12

        const restoredSpots = Math.min(
          appointment.availableSpots + (booking.guestCount ?? 1),
          maxCapacity,
        )

        await payload.update({
          collection: 'workshop-appointments',
          id: booking.appointmentId,
          data: { availableSpots: restoredSpots },
          overrideAccess: true,
        })

        payload.logger.info(
          `[stripe:payment_failed] Restored ${booking.guestCount} spot(s) on appointment ${booking.appointmentId}`,
        )
      } catch (err) {
        payload.logger.error(
          `[stripe:payment_failed] Failed to restore spots for appointment ${booking.appointmentId}: ${err}`,
        )
      }
    }

    // Cancel the booking
    await payload.update({
      collection: 'workshop-bookings',
      id: booking.id,
      data: { status: 'cancelled' },
      overrideAccess: true,
    })

    payload.logger.info(`[stripe:payment_failed] Cancelled booking ${booking.id}`)
  }
}

/**
 * charge.refunded
 *
 * When a charge is refunded in the Stripe Dashboard, sync the
 * order status to 'refunded' in Payload.
 */
export async function handleChargeRefunded({
  event,
  req,
}: {
  event: Stripe.Event
  req: PayloadRequest
  stripe: Stripe
}): Promise<void> {
  const charge = event.data.object as Stripe.Charge
  const { payload } = req

  const paymentIntentId =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id

  if (!paymentIntentId) {
    payload.logger.warn('[stripe:charge_refunded] No payment_intent on charge — skipping')
    return
  }

  payload.logger.info(
    `[stripe:charge_refunded] Charge ${charge.id} refunded (PI: ${paymentIntentId})`,
  )

  // Find the order by its transaction reference (payment intent ID stored in transactions)
  const orders = await payload.find({
    collection: 'orders',
    where: {
      'transactions.stripePaymentIntentID': { equals: paymentIntentId },
    },
    limit: 1,
    overrideAccess: true,
  })

  if (orders.totalDocs === 0) {
    payload.logger.warn(
      `[stripe:charge_refunded] No order found for paymentIntent ${paymentIntentId}`,
    )
    return
  }

  const order = orders.docs[0]

  // Update order status to 'refunded'
  await payload.update({
    collection: 'orders',
    id: order.id,
    data: { status: 'refunded' as const },
    overrideAccess: true,
  })

  // Also cancel any confirmed workshop bookings for this order
  const items: {
    product?: string | { id?: string; slug?: string } | null
  }[] = order.items ?? []

  for (const item of items) {
    const productRef = item?.product
    if (!productRef) continue

    let productSlug: string | null = null

    if (typeof productRef === 'string') {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: productRef,
          depth: 0,
          overrideAccess: true,
        })
        productSlug = (product as unknown as Record<string, unknown>)?.slug as string | null
      } catch {
        continue
      }
    } else if (typeof productRef === 'object') {
      productSlug = (productRef as Record<string, unknown>).slug as string | null
    }

    if (!productSlug || !productSlug.startsWith('workshop-')) continue

    const workshopSlug = productSlug.replace('workshop-', '')

    // Find confirmed bookings for this workshop and set to refunded
    const confirmedBookings = await payload.find({
      collection: 'workshop-bookings',
      where: {
        and: [{ workshopSlug: { equals: workshopSlug } }, { status: { equals: 'confirmed' } }],
      },
      sort: '-createdAt',
      limit: 1,
      overrideAccess: true,
    })

    if (confirmedBookings.totalDocs > 0) {
      const booking = confirmedBookings.docs[0]

      await payload.update({
        collection: 'workshop-bookings',
        id: booking.id,
        data: { status: 'refunded' },
        overrideAccess: true,
      })

      // Restore spots on the appointment
      if (booking.appointmentId) {
        try {
          const appointment = await payload.findByID({
            collection: 'workshop-appointments',
            id: booking.appointmentId,
            depth: 1,
            overrideAccess: true,
          })

          const maxCapacity =
            typeof appointment.workshop === 'object'
              ? (appointment.workshop?.maxCapacityPerSlot ?? 12)
              : 12

          const restoredSpots = Math.min(
            appointment.availableSpots + (booking.guestCount ?? 1),
            maxCapacity,
          )

          await payload.update({
            collection: 'workshop-appointments',
            id: booking.appointmentId,
            data: { availableSpots: restoredSpots },
            overrideAccess: true,
          })

          payload.logger.info(
            `[stripe:charge_refunded] Restored ${booking.guestCount} spot(s) for refunded booking ${booking.id}`,
          )
        } catch (err) {
          payload.logger.error(`[stripe:charge_refunded] Failed to restore spots: ${err}`)
        }
      }
    }
  }

  payload.logger.info(`[stripe:charge_refunded] Order ${order.id} status set to refunded`)
}
