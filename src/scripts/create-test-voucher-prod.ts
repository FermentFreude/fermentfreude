/**
 * Creates ONE test voucher (99 €, active) on PRODUCTION, the same way the roster's
 * "create voucher" does (status active, delivery pdf, no buyer email → no email is sent).
 * Context skipVoucherEmail (as for the giveaway vouchers) also skips the invoice number,
 * so a test voucher doesn't use up a number. The record is labelled TEST in the notes.
 *
 * Needs --production (explicit) and the database must be exactly `fermentfreude`.
 * Run:  npx tsx src/scripts/create-test-voucher-prod.ts --production
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })
if (!process.argv.includes('--production')) {
  console.error('🚫 Needs --production (this writes to the live database).')
  process.exit(1)
}
process.env.DATABASE_URL = process.env.PROD_DATABASE_URL ?? ''
if (!/\/fermentfreude(\?|$)/.test(process.env.DATABASE_URL)) {
  console.error('🚫 REFUSING: the database must be exactly "fermentfreude".')
  process.exit(1)
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })
const created = await payload.create({
  collection: 'vouchers',
  draft: false,
  data: {
    value: 99,
    status: 'active',
    deliveryMethod: 'pdf',
    purchaserName: 'TEST – Release 11.11.2026',
    notes:
      'TEST voucher for the live release test (Rafaela, 11.11.2026). Redeem on a test workshop booking, then cancel the booking.',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  context: { skipVoucherEmail: true, skipRevalidate: true, disableRevalidate: true },
  overrideAccess: true,
})
const v = created as unknown as { code?: string; id: string; status?: string; value?: number }
console.log(`CREATED id=${v.id} code=${v.code} value=${v.value} status=${v.status}`)
process.exit(0)
