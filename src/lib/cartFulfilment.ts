import { fulfilOnce } from '@/lib/paymentFulfilment'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { PayloadRequest } from 'payload'
import type Stripe from 'stripe'

/* ═══════════════════════════════════════════════════════════════
 *  Cart purchase (shop products, workshop bookings) → Order
 *
 *  The plugin's Stripe confirmOrder creates the Order — and through the
 *  Orders hooks the confirmed workshop seats, stock decrement, voucher
 *  redemption and confirmation email. Out of the box only the browser
 *  calls it, when the customer comes back to /checkout/confirm-order.
 *  A customer who pays in the Klarna / PayPal / bank app and never comes
 *  back would have paid without getting an order, and their held seats
 *  would be released and sold again.
 *
 *  So the plugin's confirmOrder is wrapped (exactlyOnceConfirmOrder) and
 *  the Stripe webhook calls the same wrapper. Both go through fulfilOnce:
 *  whichever arrives first creates the order, the other gets that order.
 * ═══════════════════════════════════════════════════════════════ */

type ConfirmOrder = PaymentAdapter['confirmOrder']
type ConfirmOrderArgs = Parameters<ConfirmOrder>[0]
type ConfirmOrderResult = Awaited<ReturnType<ConfirmOrder>>

let pluginConfirmOrder: ConfirmOrder | null = null

/** Registers the plugin's confirmOrder and returns the exactly-once version used in its place. */
export function exactlyOnceConfirmOrder(original: ConfirmOrder): ConfirmOrder {
  pluginConfirmOrder = original
  return (args) => confirmCartPayment(args, 20_000)
}

const idOf = (value: unknown): string | null =>
  typeof value === 'string'
    ? value
    : typeof value === 'object' && value !== null && 'id' in value
      ? String((value as { id: unknown }).id)
      : null

async function findTransaction(req: PayloadRequest, paymentIntentID: string) {
  const { docs } = await req.payload.find({
    collection: 'transactions',
    where: { 'stripe.paymentIntentID': { equals: paymentIntentID } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return docs[0] ?? null
}

async function confirmCartPayment(
  args: ConfirmOrderArgs,
  waitMs: number,
): Promise<ConfirmOrderResult> {
  const { req } = args
  const paymentIntentID = args.data.paymentIntentID
  if (typeof paymentIntentID !== 'string' || !paymentIntentID) {
    throw new Error('PaymentIntent ID is required')
  }
  const confirm = pluginConfirmOrder
  if (!confirm) throw new Error('Stripe confirmOrder is not registered')

  const findExisting = async (): Promise<ConfirmOrderResult | null> => {
    const transaction = await findTransaction(req, paymentIntentID)
    const orderID = idOf(transaction?.order)
    if (!transaction || !orderID) return null
    const order = await req.payload.findByID({
      collection: 'orders',
      id: orderID,
      depth: 0,
      overrideAccess: true,
      req,
    })
    // Guest orders carry an access token the confirm page needs to show them
    const { accessToken } = order as { accessToken?: string | null }
    return {
      message: 'Order already confirmed',
      orderID: order.id,
      transactionID: transaction.id,
      ...(accessToken ? { accessToken } : {}),
    }
  }

  return fulfilOnce(req.payload, paymentIntentID, {
    findExisting,
    waitMs,
    fulfil: async () => confirm(args),
  })
}

/**
 * Completes a succeeded cart payment on the server — no browser cart
 * needed. Used by the Stripe webhook (the customer never came back) and
 * by /api/checkout/complete-payment (the browser came back but its own
 * confirm step failed, e.g. because the webhook already emptied the cart).
 * Returns null when the payment isn't a cart checkout of ours.
 */
export async function completeCartPayment(
  req: PayloadRequest,
  paymentIntent: Stripe.PaymentIntent,
  { waitMs }: { waitMs: number },
): Promise<ConfirmOrderResult | null> {
  const transaction = await findTransaction(req, paymentIntent.id)
  if (!transaction) return null

  // A logged-in buyer's order belongs to their account, as it would when
  // the browser confirms it (the plugin links the order to req.user).
  if (!req.user) {
    let customerID = idOf(transaction.customer)
    if (!customerID) {
      const cartID = idOf(transaction.cart) ?? paymentIntent.metadata?.cartID ?? null
      if (cartID) {
        const cart = await req.payload
          .findByID({ collection: 'carts', id: cartID, depth: 0, overrideAccess: true, req })
          .catch(() => null)
        customerID = idOf(cart?.customer)
      }
    }
    if (customerID) {
      const user = await req.payload
        .findByID({ collection: 'users', id: customerID, depth: 0, overrideAccess: true, req })
        .catch(() => null)
      if (user) req.user = { ...user, collection: 'users' }
    }
  }

  return confirmCartPayment(
    {
      data: {
        paymentIntentID: paymentIntent.id,
        customerEmail: transaction.customerEmail || paymentIntent.receipt_email || undefined,
      },
      req,
      cartsSlug: 'carts',
      ordersSlug: 'orders',
      transactionsSlug: 'transactions',
    },
    waitMs,
  )
}
