import type { CollectionBeforeChangeHook } from 'payload'

/**
 * On Order create, if `customerName` was not supplied directly, attempt to
 * copy it from the linked transaction. The checkout flow attaches the
 * buyer-supplied name to the transaction (via `/api/checkout/attach-customer-name`)
 * before the plugin's confirmOrder endpoint creates the Order.
 *
 * Logged-in users keep `customerName` empty here — downstream hooks fall back
 * to `users.name`.
 */
export const copyCustomerNameFromTransaction: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data
  if (data.customerName) return data

  const txRef = Array.isArray(data.transactions) ? data.transactions[0] : undefined
  const txId = typeof txRef === 'object' && txRef !== null ? txRef.id : txRef
  if (!txId) return data

  try {
    const tx = await req.payload.findByID({
      collection: 'transactions',
      id: String(txId),
      depth: 0,
      overrideAccess: true,
    })
    const name = (tx as unknown as { customerName?: string | null })?.customerName
    if (typeof name === 'string' && name.trim().length > 0) {
      data.customerName = name.trim()
    }
  } catch {
    // Non-fatal: order still gets created, emails fall back to email local-part.
  }

  return data
}
