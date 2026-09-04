import type { CollectionBeforeChangeHook } from 'payload'

interface InvoiceCounterDoc {
  lastYear?: number
  lastNumber?: number
  angLastYear?: number
  angLastNumber?: number
  manLastYear?: number
  manLastNumber?: number
  webLastYear?: number
  webLastNumber?: number
}

type Series = 'legacy' | 'ang' | 'man' | 'web'

const SERIES_PREFIX: Record<Series, string> = {
  legacy: 'FF',
  ang: 'ANG',
  man: 'MAN',
  web: 'WEB',
}

/**
 * assignInvoiceNumber — beforeChange hook for Orders and Vouchers.
 *
 * On create: atomically increments the correct series counter on the
 * InvoiceCounter global and writes the resulting number onto the document.
 * Resets each series to 0001 on its own first document of a new calendar
 * year.
 *
 * Vouchers always draw from the legacy FF-YYYY-NNNN series (unchanged
 * behaviour). Orders draw from the WEB series by default, or the MAN series
 * when `data.paymentMethod === 'manual'` (admin-created order).
 *
 * Uses a single atomic Mongo pipeline update (via payload.db.globals) rather
 * than Payload's findGlobal -> compute -> updateGlobal, which is a
 * read-then-write race: two concurrent order creates could previously read
 * the same lastNumber and both write n+1, issuing duplicate invoice numbers.
 * Single-document atomic ops are fine on Atlas M0 without transactions (see
 * atomicSpots.ts for the same pattern applied to workshop capacity).
 */
export const assignInvoiceNumber: CollectionBeforeChangeHook = async ({
  data,
  operation,
  collection,
  req,
}) => {
  if (operation !== 'create') return data
  if (req?.context?.skipVoucherEmail) return data

  const { payload } = req
  const year = new Date().getFullYear()

  const series: Series =
    collection.slug === 'vouchers'
      ? 'legacy'
      : (data as { paymentMethod?: string })?.paymentMethod === 'manual'
        ? 'man'
        : 'web'

  const yearField = series === 'legacy' ? 'lastYear' : (`${series}LastYear` as const)
  const numberField = series === 'legacy' ? 'lastNumber' : (`${series}LastNumber` as const)

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
    const invoiceNumber = `${SERIES_PREFIX[series]}-${year}-${String(nextNumber).padStart(4, '0')}`

    return { ...data, invoiceNumber }
  } catch (err) {
    payload.logger.error(
      `[assignInvoiceNumber] Failed to assign invoice number: ${err instanceof Error ? err.message : String(err)}`,
    )
    // Non-fatal — order still saves, just without a sequential number
    return data
  }
}
