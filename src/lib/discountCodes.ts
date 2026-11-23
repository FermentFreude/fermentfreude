import type { Payload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  Discount codes (Rabattcodes) for buying a gift voucher
 *
 *  One check, used twice: by the "Einlösen" button in the buy panel
 *  (/api/voucher/discount-code) and again by /api/voucher/checkout
 *  before the Stripe payment is created. The price the browser shows
 *  is never trusted: the amount charged always comes from here.
 *
 *  Dates are calendar days in Vienna: "valid until 31.01.2027" means
 *  the whole of 31 January, Austrian time.
 * ═══════════════════════════════════════════════════════════════ */

export type DiscountCodeProblem = 'unknown' | 'inactive' | 'notYet' | 'expired' | 'notForAmount'

export type DiscountCodeCheck =
  | {
      ok: true
      /** Normalised code, e.g. "FREUDE26" */
      code: string
      /** Euros off */
      amountOff: number
      /** Euros to pay after the discount */
      finalAmount: number
    }
  | { ok: false; problem: DiscountCodeProblem }

/** "  freude 26 " → "FREUDE26" */
export const normaliseDiscountCode = (raw: string): string =>
  raw.replace(/\s+/g, '').toUpperCase()

/** Calendar day in Vienna as "YYYY-MM-DD" (sortable as text) */
const viennaDay = (date: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Vienna',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

export async function checkDiscountCode(
  payload: Payload,
  rawCode: string,
  voucherAmount: number,
  now: Date = new Date(),
): Promise<DiscountCodeCheck> {
  const code = normaliseDiscountCode(rawCode)
  if (code.length < 2 || code.length > 40) return { ok: false, problem: 'unknown' }

  const found = await payload.find({
    collection: 'discount-codes',
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = found.docs[0]
  if (!doc) return { ok: false, problem: 'unknown' }
  if (!doc.active) return { ok: false, problem: 'inactive' }

  const today = viennaDay(now)
  if (doc.validFrom && today < viennaDay(new Date(doc.validFrom))) {
    return { ok: false, problem: 'notYet' }
  }
  if (doc.validUntil && today > viennaDay(new Date(doc.validUntil))) {
    return { ok: false, problem: 'expired' }
  }

  const amounts = (doc.voucherAmounts ?? []).map(Number)
  if (!amounts.includes(voucherAmount)) return { ok: false, problem: 'notForAmount' }

  const amountOff = Number(doc.amountOff)
  const finalAmount = voucherAmount - amountOff
  // A discount must leave something to pay (Stripe can't charge €0)
  if (!(amountOff > 0) || finalAmount < 1) return { ok: false, problem: 'notForAmount' }

  return { ok: true, code: doc.code, amountOff, finalAmount }
}
