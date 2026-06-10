import type { CollectionBeforeChangeHook } from 'payload'

/**
 * assignInvoiceNumber — beforeChange hook for Orders and Vouchers.
 *
 * On create: reads the InvoiceCounter global, increments it, and writes
 * a sequential FF-YYYY-NNNN invoice number onto the document.
 * Resets the counter to 0001 each new calendar year.
 *
 * Sequential writes only (M0) — no Promise.all.
 */
export const assignInvoiceNumber: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  const { payload } = req
  const year = new Date().getFullYear()

  try {
    const counter = (await payload.findGlobal({
      slug: 'invoice-counter' as never,
      depth: 0,
      overrideAccess: true,
    })) as unknown as { lastYear?: number; lastNumber?: number }

    const lastYear = counter?.lastYear ?? 0
    const lastNumber = counter?.lastNumber ?? 0

    const nextNumber = lastYear === year ? lastNumber + 1 : 1
    const invoiceNumber = `FF-${year}-${String(nextNumber).padStart(4, '0')}`

    await payload.updateGlobal({
      slug: 'invoice-counter' as never,
      data: { lastYear: year as unknown as undefined, lastNumber: nextNumber as unknown as undefined },
      overrideAccess: true,
    })

    return { ...data, invoiceNumber }
  } catch (err) {
    payload.logger.error(
      `[assignInvoiceNumber] Failed to assign invoice number: ${err instanceof Error ? err.message : String(err)}`,
    )
    // Non-fatal — order still saves, just without a sequential number
    return data
  }
}
