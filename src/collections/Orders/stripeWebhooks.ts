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

  const transactionResults = await payload.find({
    collection: 'transactions',
    where: {
      'stripe.paymentIntentID': { equals: paymentIntent.id },
    },
    limit: 1,
    overrideAccess: true,
  })

  const transaction = transactionResults.docs[0]
  const cartId =
    transaction && typeof transaction.cart === 'object'
      ? transaction.cart?.id
      : transaction?.cart

  if (!cartId) {
    payload.logger.warn(
      `[stripe:payment_failed] No transaction/cart found for paymentIntent ${paymentIntent.id}`,
    )
    return
  }

  const pendingBookings = await payload.find({
    collection: 'workshop-bookings',
    where: {
      and: [{ status: { equals: 'pending' } }, { cartSlug: { equals: cartId } }],
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

  const transactionRef = Array.isArray(order.transactions) ? order.transactions[0] : undefined
  const transactionId =
    transactionRef && typeof transactionRef === 'object' ? transactionRef.id : transactionRef
  let cartId: string | undefined

  if (transactionId) {
    try {
      const transaction = await payload.findByID({
        collection: 'transactions',
        id: transactionId,
        depth: 0,
        overrideAccess: true,
      })
      cartId = typeof transaction.cart === 'object' ? transaction.cart?.id || undefined : transaction.cart || undefined
    } catch {
      // ignore; handled below
    }
  }

  if (!cartId) {
    payload.logger.warn(`[stripe:charge_refunded] No cart found for order ${order.id}`)
    return
  }

  const confirmedBookings = await payload.find({
    collection: 'workshop-bookings',
    where: {
      and: [{ cartSlug: { equals: cartId } }, { status: { equals: 'confirmed' } }],
    },
    sort: '-createdAt',
    limit: 50,
    overrideAccess: true,
  })

  for (const booking of confirmedBookings.docs) {
    await payload.update({
      collection: 'workshop-bookings',
      id: booking.id,
      data: { status: 'refunded' },
      overrideAccess: true,
    })

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

  payload.logger.info(`[stripe:charge_refunded] Order ${order.id} status set to refunded`)
}
