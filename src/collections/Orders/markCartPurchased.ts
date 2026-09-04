import type { CollectionAfterChangeHook } from 'payload'

/**
 * markCartPurchased — Orders afterChange hook.
 *
 * Marks the cart behind this order as purchased SYNCHRONOUSLY, as part of
 * order creation itself. @payloadcms/plugin-ecommerce's own confirmOrder.js
 * also marks the cart, but only in a SEPARATE payload.update() call made
 * AFTER payload.create() for the Order has already returned — by which
 * point every Order afterChange hook has already run. If anything throws in
 * between payload.create() and that later call, the Order — and the real
 * Stripe charge behind it — already exists, but the cart is left looking
 * untouched and re-checkoutable.
 *
 * Confirmed in real data: a cart whose first checkout genuinely succeeded
 * (Stripe charged, Order created) sat with no purchasedAt for 5 minutes —
 * long enough for a second, entirely real, second charge against the exact
 * same cart and items. Running this inside the Order's own afterChange
 * chain closes that window: the cart is marked the moment the paid Order
 * exists, with no separate step that can fail independently.
 *
 * Pairs with preventDuplicatePayment.ts (Transactions beforeValidate),
 * which refuses to start a new payment for a cart already marked purchased
 * here.
 */
export const markCartPurchased: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const { payload } = req
  const transactionRef = Array.isArray(doc.transactions) ? doc.transactions[0] : undefined
  const transactionId =
    transactionRef && typeof transactionRef === 'object' ? transactionRef.id : transactionRef
  if (!transactionId) return doc

  try {
    const transaction = await payload.findByID({
      collection: 'transactions',
      id: String(transactionId),
      depth: 0,
      overrideAccess: true,
    })
    const cartId = typeof transaction.cart === 'object' ? transaction.cart?.id : transaction.cart
    if (!cartId) return doc

    // Re-fetch the cart to re-include its current `items` in the update.
    // Carts' own beforeChange hook (@payloadcms/plugin-ecommerce) recomputes
    // `subtotal` from `data.items` on every write and — critically — zeroes
    // it out when `items` isn't part of the update payload at all. Omitting
    // items here would silently wipe subtotal as a side effect (breaking,
    // among other things, sendOrderConfirmationEmail's cart-derived price
    // breakdown, which reads it after this hook runs).
    const cart = await payload.findByID({
      collection: 'carts',
      id: String(cartId),
      depth: 0,
      overrideAccess: true,
    })

    await payload.update({
      collection: 'carts',
      id: String(cartId),
      data: {
        items: cart.items ?? [],
        status: 'purchased',
        purchasedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    payload.logger.info(`[markCartPurchased] Cart ${cartId} marked purchased for order ${doc.id}`)
  } catch (err) {
    payload.logger.error(
      `[markCartPurchased] Failed to mark cart purchased for order ${doc.id}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return doc
}
