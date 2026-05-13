import type { CollectionBeforeChangeHook } from 'payload'

/**
 * On Order create, if customer fields were not supplied directly, attempt to
 * copy them from the linked transaction. The checkout flow attaches the
 * buyer-supplied contact information to the transaction (via `/api/checkout/attach-customer-name`)
 * before the plugin's confirmOrder endpoint creates the Order.
 *
 * Logged-in users keep these fields empty here — downstream hooks fall back
 * to user data or defaults.
 */
export const copyCustomerNameFromTransaction: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

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
    
    // Copy customer name if not already set
    if (!data.customerName) {
      const name = (tx as unknown as { customerName?: string | null })?.customerName
      if (typeof name === 'string' && name.trim().length > 0) {
        data.customerName = name.trim()
      }
    }
    
    // Copy customer phone if not already set
    if (!data.customerPhone) {
      const phone = (tx as unknown as { customerPhone?: string | null })?.customerPhone
      if (typeof phone === 'string' && phone.trim().length > 0) {
        data.customerPhone = phone.trim()
      }
    }
    
    // Copy customer diet specs if not already set
    if (!data.customerDietSpecs) {
      const dietSpecs = (tx as unknown as { customerDietSpecs?: string | null })?.customerDietSpecs
      if (typeof dietSpecs === 'string' && dietSpecs.trim().length > 0) {
        data.customerDietSpecs = dietSpecs.trim()
      }
    }
  } catch {
    // Non-fatal: order still gets created, emails fall back to email local-part.
  }

  return data
}
