import type { CollectionBeforeValidateHook } from 'payload'

/**
 * preventDuplicatePayment — Transactions beforeValidate hook.
 *
 * Refuses to create a new payment-initiation Transaction for a cart that
 * already has a succeeded one. This is the single choke point for BOTH
 * payment-initiation paths in this app — @payloadcms/plugin-ecommerce's own
 * /api/payments/stripe/initiate AND /api/voucher/initiate-discounted-payment
 * — since both create a Transaction via payload.create() as their first
 * durable step, before ever touching Stripe. Enforcing it here means
 * neither path (nor any future one) has to remember to add this check
 * individually.
 *
 * Real incident this closes: a cart whose first checkout genuinely
 * succeeded (Stripe charged, Order created) wasn't reliably marked
 * purchased afterward, leaving it re-checkoutable — a second, entirely
 * real, second charge went through against the same cart, 5 minutes later.
 * See markCartPurchased.ts for the paired fix that makes the cart's own
 * status reliable; this check looks directly at whether a transaction for
 * this cart has already succeeded, independent of that field, so it still
 * holds even if the cart's status is ever wrong or stale.
 */
export const preventDuplicatePayment: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !data) return data

  const cartRef = data.cart as string | { id?: string } | undefined
  const cartId = typeof cartRef === 'object' && cartRef !== null ? cartRef.id : cartRef
  if (!cartId) return data

  const existing = await req.payload.find({
    collection: 'transactions',
    where: {
      and: [{ cart: { equals: cartId } }, { status: { equals: 'succeeded' } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0) {
    throw new Error('This cart has already been paid for.')
  }

  return data
}
