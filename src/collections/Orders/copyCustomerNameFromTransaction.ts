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
    
    // Copy customer first/last name if not already set
    const txAny = tx as unknown as Record<string, string | null | undefined>
    if (!data.customerFirstName) {
      const v = txAny.customerFirstName
      if (typeof v === 'string' && v.trim().length > 0) data.customerFirstName = v.trim()
    }
    if (!data.customerLastName) {
      const v = txAny.customerLastName
      if (typeof v === 'string' && v.trim().length > 0) data.customerLastName = v.trim()
    }
    // Keep legacy customerName in sync
    if (!data.customerName) {
      const name = txAny.customerName
      if (typeof name === 'string' && name.trim().length > 0) {
        data.customerName = name.trim()
      }
    }

    // Copy customer email if not already set — covers the case where a browser
    // session persisted (user thought they logged out) so the plugin set
    // `customer` instead of `customerEmail` on the Order. The transaction has
    // the form-entered email from attach-customer-name, which is authoritative.
    if (!data.customerEmail) {
      const email = txAny.customerEmail
      if (typeof email === 'string' && email.trim().length > 0) data.customerEmail = email.trim()
    }

    if (!data.customerPhone) {
      const phone = txAny.customerPhone
      if (typeof phone === 'string' && phone.trim().length > 0) data.customerPhone = phone.trim()
    }

    // Copy customer diet specs if not already set
    if (!data.customerDietSpecs) {
      const dietSpecs = txAny.customerDietSpecs
      if (typeof dietSpecs === 'string' && dietSpecs.trim().length > 0) {
        data.customerDietSpecs = dietSpecs.trim()
      }
    }

    // Copy pickup fields if not already set
    const pickupFields = ['pickupDate', 'pickupTime', 'pickupLocation', 'pickupAddress'] as const
    for (const field of pickupFields) {
      if (!data[field]) {
        const v = txAny[field]
        if (typeof v === 'string' && v.trim().length > 0) data[field] = v.trim()
      }
    }

    // Default pickupStatus to 'pending' for new pickup orders
    if (!data.pickupStatus && data.pickupDate) {
      data.pickupStatus = 'pending'
    }
  } catch {
    // Non-fatal: order still gets created, emails fall back to email local-part.
  }

  return data
}
