import type { CollectionAfterChangeHook } from 'payload'

/**
 * redeemVoucherOnOrderComplete — Orders afterChange hook.
 *
 * Marks a voucher as redeemed when it was applied as a PARTIAL discount at
 * checkout (cart total exceeded the voucher value, so the customer paid the
 * remainder via Stripe — see /api/voucher/initiate-discounted-payment).
 *
 * Runs at Order-create time rather than off a Stripe webhook: by the time
 * @payloadcms/plugin-ecommerce's confirmOrder creates the Order, it has
 * already verified paymentIntent.status === 'succeeded' with Stripe, so this
 * hook only ever fires for a genuinely paid order — no webhook race/replay
 * to guard against.
 *
 * (A voucher that fully covers the cart never reaches Stripe at all — it's
 * redeemed synchronously in /api/voucher/place-order instead.)
 */
export const redeemVoucherOnOrderComplete: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const { payload } = req
  const transactionRef = Array.isArray(doc.transactions) ? doc.transactions[0] : undefined
  const transactionId =
    transactionRef && typeof transactionRef === 'object' ? transactionRef.id : transactionRef
  if (!transactionId) return doc

  let voucherCode: string | undefined
  try {
    const transaction = await payload.findByID({
      collection: 'transactions',
      id: transactionId,
      depth: 0,
      overrideAccess: true,
    })
    voucherCode =
      typeof transaction.voucherCode === 'string' && transaction.voucherCode.trim()
        ? transaction.voucherCode.trim()
        : undefined
  } catch {
    return doc
  }

  if (!voucherCode) return doc

  try {
    const result = await payload.find({
      collection: 'vouchers',
      where: { code: { equals: voucherCode } },
      limit: 1,
      overrideAccess: true,
    })
    const voucher = result.docs[0]
    // Guard against double redemption if this hook is ever invoked twice for
    // the same order (Payload doesn't do this today, but the guard is cheap).
    if (!voucher || voucher.status === 'redeemed' || voucher.redeemed) return doc

    const items: { product?: string | { id?: string; title?: string } | null }[] = doc.items ?? []
    const productTitles: string[] = []
    for (const item of items) {
      if (item.product && typeof item.product === 'object' && item.product.title) {
        productTitles.push(item.product.title)
        continue
      }
      const productId = typeof item.product === 'object' ? item.product?.id : item.product
      if (!productId) continue
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: productId,
          depth: 0,
          overrideAccess: true,
        })
        if (product?.title) productTitles.push(product.title)
      } catch {
        // ignore — title is cosmetic
      }
    }

    await payload.update({
      collection: 'vouchers',
      id: voucher.id,
      data: {
        status: 'redeemed',
        redeemed: true,
        redeemedOn: new Date().toISOString(),
        redeemedForWorkshop: productTitles.join(', ') || undefined,
        notes: `Order: ${doc.id} (partial redemption — voucher applied as discount, remainder paid via Stripe)`,
      },
      overrideAccess: true,
    })

    payload.logger.info(
      `[redeemVoucherOnOrderComplete] Voucher ${voucherCode} redeemed for order ${doc.id}`,
    )
  } catch (err) {
    payload.logger.error(
      `[redeemVoucherOnOrderComplete] Failed to redeem voucher ${voucherCode} for order ${doc.id}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return doc
}
