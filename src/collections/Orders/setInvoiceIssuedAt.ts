import type { CollectionAfterChangeHook } from 'payload'

/**
 * Freeze the invoice issuance date on the order.
 *
 * The PDF receipt is generated on demand whenever the customer downloads it,
 * but the date printed on the document must never change after the order was
 * paid. We therefore stamp `invoiceIssuedAt` exactly once — on order creation —
 * and refuse to overwrite it.
 *
 * Sequential write only (Atlas M0 has no transactions).
 */
export const setInvoiceIssuedAt: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const existing = (doc as { invoiceIssuedAt?: string | null }).invoiceIssuedAt
  if (existing) return doc

  try {
    await req.payload.update({
      collection: 'orders',
      id: doc.id,
      data: { invoiceIssuedAt: new Date().toISOString() } as Record<string, unknown>,
      overrideAccess: true,
    })
  } catch (err) {
    req.payload.logger.warn(
      `[setInvoiceIssuedAt] Could not set invoiceIssuedAt for order ${doc.id}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return doc
}
