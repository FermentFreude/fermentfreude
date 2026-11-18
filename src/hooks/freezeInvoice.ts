import type { CollectionAfterChangeHook } from 'payload'

import { freezeInvoiceNow } from '@/lib/buildOrderReceiptData'

/**
 * Orders afterChange: when an order is created, freeze the lines of its invoice.
 * Runs after the workshop bookings were confirmed (so they are linked to the order)
 * and the voucher was redeemed. From then on the invoice shows exactly these lines,
 * whatever happens to the bookings later (move, release, price change).
 * Never blocks the order: a problem here is only logged.
 */
export const freezeInvoiceOnIssue: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  if (!(doc as { invoiceNumber?: string | null }).invoiceNumber) return doc
  await freezeInvoiceNow(req.payload, String(doc.id))
  return doc
}
