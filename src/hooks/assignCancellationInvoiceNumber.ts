import type { CollectionBeforeChangeHook } from 'payload'

interface InvoiceCounterDoc {
  manLastYear?: number
  manLastNumber?: number
  webLastYear?: number
  webLastNumber?: number
}

/**
 * assignCancellationInvoiceNumber — beforeChange hook for CancellationInvoices.
 * A Stornorechnung draws its number from its PARENT order's own series (a
 * cancelled WEB invoice gets a new WEB-prefixed number, a cancelled MAN
 * invoice gets a new MAN-prefixed number) rather than a fourth series — same
 * atomic-counter pattern as assignInvoiceNumber/assignQuoteNumber.
 */
export const assignCancellationInvoiceNumber: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  const { payload } = req
  const now = new Date()
  const year = now.getFullYear()

  const series = data.originalSeries === 'MAN' ? 'man' : 'web'
  const yearField = `${series}LastYear` as const
  const numberField = `${series}LastNumber` as const

  try {
    const model = payload.db.globals
    const updated = (await model
      .findOneAndUpdate(
        { globalType: 'invoice-counter' },
        [
          {
            $set: {
              [numberField]: {
                $cond: [
                  { $eq: [`$${yearField}`, year] },
                  { $add: [{ $ifNull: [`$${numberField}`, 0] }, 1] },
                  1,
                ],
              },
              [yearField]: year,
            },
          },
        ],
        { new: true, upsert: true },
      )
      .lean()) as InvoiceCounterDoc | null

    const nextNumber = updated?.[numberField] ?? 1
    return {
      ...data,
      cancellationNumber: `${data.originalSeries}-${year}-${String(nextNumber).padStart(4, '0')}`,
      issueDate: now.toISOString(),
    }
  } catch (err) {
    payload.logger.error(
      `[assignCancellationInvoiceNumber] Failed: ${err instanceof Error ? err.message : String(err)}`,
    )
    return { ...data, issueDate: now.toISOString() }
  }
}
