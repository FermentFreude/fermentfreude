import { releaseSpotsAtomic } from '@/lib/atomicSpots'
import { logActivityEvent } from '@/lib/manageBooking'
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
    transaction && typeof transaction.cart === 'object' ? transaction.cart?.id : transaction?.cart

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

        await releaseSpotsAtomic(payload, booking.appointmentId, booking.guestCount ?? 1, maxCapacity)

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
  stripe,
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

  // ─── Seat-scoped reconciliation (refund/rebooking system, plan §8) ──────
  // If this PaymentIntent has ANY refund-requests row — pending or already
  // completed — it belongs to the new self-service system, and this event
  // is reconciling that, not the whole order. Deliberately NOT filtering by
  // status in this first query: Stripe delivers webhooks at-least-once, and
  // a redelivered event for an already-completed row must no-op here, not
  // fall through to the legacy whole-booking fallback below (which would
  // incorrectly mark the entire order/every seat as refunded on a replay —
  // a duplicate delivery is routine, not an edge case, and "ownership" of a
  // PaymentIntent by this system must not depend on reconciliation status).
  const allRequestsForPI = await payload.find({
    collection: 'refund-requests',
    where: { stripePaymentIntentId: { equals: paymentIntentId } },
    depth: 0,
    limit: 20,
    overrideAccess: true,
  })

  if (allRequestsForPI.totalDocs > 0) {
    const pendingRequests = allRequestsForPI.docs.filter((rr) =>
      ['requested', 'acknowledged', 'processing'].includes(rr.status),
    )

    if (pendingRequests.length === 0) {
      payload.logger.info(
        `[stripe:charge_refunded] All refund-requests for PI ${paymentIntentId} already reconciled — duplicate webhook delivery, no-op`,
      )
      return
    }

    // Disambiguate which row(s) this specific event is for when a
    // PaymentIntent has multiple pending requests (e.g. two seats in the
    // same order both refunded, possibly as separate Stripe refunds) by
    // matching the latest refund's exact amount. `charge.refunds` on the
    // webhook payload's embedded Charge object is NOT populated by Stripe
    // (confirmed live during Stage 10's real test-mode dry run — it comes
    // back `null` on every real charge.refunded event, not just sometimes),
    // so the list must be fetched fresh via the API. If that fetch fails,
    // fall back to reconciling every pending row for this PaymentIntent —
    // matches the precision the legacy path already had (no per-seat
    // disambiguation at all).
    let latestRefund: Stripe.Refund | undefined
    try {
      const refundsList = await stripe.refunds.list({ payment_intent: paymentIntentId, limit: 10 })
      latestRefund = refundsList.data.slice().sort((a, b) => b.created - a.created)[0]
    } catch (err) {
      payload.logger.error(
        `[stripe:charge_refunded] Failed to fetch refunds list for PI ${paymentIntentId}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    for (const rr of pendingRequests) {
      if (latestRefund && rr.requestedAmount !== latestRefund.amount) continue

      await payload.update({
        collection: 'refund-requests',
        id: rr.id,
        data: {
          status: 'completed',
          completedAt: new Date().toISOString(),
          stripeRefundId: latestRefund?.id ?? '',
        },
        overrideAccess: true,
      })

      const bookingId = typeof rr.booking === 'object' ? rr.booking.id : rr.booking
      let booking
      try {
        booking = await payload.findByID({
          collection: 'workshop-bookings',
          id: bookingId,
          overrideAccess: true,
        })
      } catch {
        payload.logger.error(
          `[stripe:charge_refunded] refund-request ${rr.id} points at a missing booking ${bookingId} — skipping seat update`,
        )
        continue
      }

      const seats = [...(booking.seats ?? [])]
      if (seats[rr.seatIndex]) {
        seats[rr.seatIndex] = { ...seats[rr.seatIndex], seatStatus: 'refunded' }
        await payload.update({
          collection: 'workshop-bookings',
          id: booking.id,
          data: { seats },
          overrideAccess: true,
        })
      }

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
          await releaseSpotsAtomic(payload, booking.appointmentId, 1, maxCapacity)
        } catch (err) {
          payload.logger.error(
            `[stripe:charge_refunded] Failed to restore capacity for refund-request ${rr.id}: ${err}`,
          )
        }
      }

      const requestedAmountCents = rr.requestedAmount ?? 0
      await logActivityEvent(
        payload,
        'refund_completed',
        String(rr.id),
        `${booking.firstName ?? 'Gast'} ${booking.lastName ?? ''} — ${booking.workshopTitle}, €${(requestedAmountCents / 100).toFixed(2)} Rückerstattung abgeschlossen (Platz ${rr.seatIndex + 1})`,
      )

      payload.logger.info(
        `[stripe:charge_refunded] Seat-scoped: reconciled refund-request ${rr.id} (seat ${rr.seatIndex} of booking ${booking.id})`,
      )
    }

    return
  }

  // ─── Legacy whole-order fallback ─────────────────────────────────────────
  // For refunds issued entirely outside this system (e.g. an ad-hoc admin
  // refund in Stripe with no refund-requests row behind it) — preserves the
  // pre-existing behavior exactly.
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
      cartId =
        typeof transaction.cart === 'object'
          ? transaction.cart?.id || undefined
          : transaction.cart || undefined
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

        await releaseSpotsAtomic(payload, booking.appointmentId, booking.guestCount ?? 1, maxCapacity)

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

/**
 * charge.succeeded OR payment_intent.succeeded
 *
 * When a payment succeeds, update order status from 'processing' to 'completed'
 * and confirm any pending workshop bookings.
 */
export async function handleChargeSucceeded({
  event,
  req,
}: {
  event: Stripe.Event
  req: PayloadRequest
  stripe: Stripe
}): Promise<void> {
  const obj = event.data.object as Stripe.Charge | Stripe.PaymentIntent
  const { payload } = req

  // Resolve PaymentIntent ID for both event types:
  //   - charge.succeeded         → object is Charge,        use .payment_intent
  //   - payment_intent.succeeded → object is PaymentIntent, use .id
  let paymentIntentId: string | undefined
  if (event.type === 'payment_intent.succeeded') {
    paymentIntentId = (obj as Stripe.PaymentIntent).id
  } else {
    const charge = obj as Stripe.Charge
    paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
  }

  if (!paymentIntentId) {
    payload.logger.warn(`[stripe:${event.type}] No payment_intent could be resolved — skipping`)
    return
  }

  payload.logger.info(`[stripe:${event.type}] ${obj.id} succeeded (PI: ${paymentIntentId})`)

  // Find the order by payment intent ID
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
      `[stripe:charge_succeeded] No order found for paymentIntent ${paymentIntentId}`,
    )
    return
  }

  const order = orders.docs[0]

  // Update order status to 'completed'
  await payload.update({
    collection: 'orders',
    id: order.id,
    data: { status: 'completed' as const },
    overrideAccess: true,
  })

  payload.logger.info(`[stripe:charge_succeeded] Order ${order.id} status set to completed`)

  // Confirm any pending workshop bookings
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
      cartId =
        typeof transaction.cart === 'object'
          ? transaction.cart?.id || undefined
          : transaction.cart || undefined
    } catch {
      // ignore
    }
  }

  if (!cartId) {
    payload.logger.info(`[stripe:charge_succeeded] No cart found for order ${order.id}`)
    return
  }

  const pendingBookings = await payload.find({
    collection: 'workshop-bookings',
    where: {
      and: [{ cartSlug: { equals: cartId } }, { status: { equals: 'pending' } }],
    },
    limit: 50,
    overrideAccess: true,
  })

  // Confirm each pending booking — sequentially (M0)
  for (const booking of pendingBookings.docs) {
    await payload.update({
      collection: 'workshop-bookings',
      id: booking.id,
      data: { status: 'confirmed' },
      overrideAccess: true,
    })

    payload.logger.info(`[stripe:charge_succeeded] Confirmed booking ${booking.id}`)
  }

  payload.logger.info(
    `[stripe:charge_succeeded] Confirmed ${pendingBookings.totalDocs} booking(s) for order ${order.id}`,
  )
}
