import type { CollectionBeforeChangeHook } from 'payload'

interface InvoiceCounterDoc {
  angLastYear?: number
  angLastNumber?: number
}

/**
 * assignQuoteNumber — beforeChange hook for Quotes.
 * Same atomic-counter pattern as assignInvoiceNumber, drawing from the ANG
 * series on the shared InvoiceCounter global. Also freezes issueDate and
 * defaults validUntil to +14 days (matches the Angebotsbedingungen
 * boilerplate printed on the PDF) when not explicitly set.
 */
export const assignQuoteNumber: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const { payload } = req
  const now = new Date()
  const year = now.getFullYear()

  if (!data.validUntil) {
    const validUntil = new Date(now)
    validUntil.setDate(validUntil.getDate() + 14)
    data.validUntil = validUntil.toISOString()
  }

  try {
    const model = payload.db.globals
    const updated = (await model
      .findOneAndUpdate(
        { globalType: 'invoice-counter' },
        [
          {
            $set: {
              angLastNumber: {
                $cond: [
                  { $eq: ['$angLastYear', year] },
                  { $add: [{ $ifNull: ['$angLastNumber', 0] }, 1] },
                  1,
                ],
              },
              angLastYear: year,
            },
          },
        ],
        { new: true, upsert: true },
      )
      .lean()) as InvoiceCounterDoc | null

    const nextNumber = updated?.angLastNumber ?? 1
    return {
      ...data,
      quoteNumber: `ANG-${year}-${String(nextNumber).padStart(4, '0')}`,
      issueDate: now.toISOString(),
    }
  } catch (err) {
    payload.logger.error(
      `[assignQuoteNumber] Failed to assign quote number: ${err instanceof Error ? err.message : String(err)}`,
    )
    return { ...data, issueDate: now.toISOString() }
  }
}
