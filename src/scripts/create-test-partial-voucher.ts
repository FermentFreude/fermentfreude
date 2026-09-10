/**
 * create-test-partial-voucher.ts
 *
 * Throwaway €5 voucher for manually testing partial-voucher-redemption at
 * checkout: apply this code against a workshop that costs more than €5,
 * confirm Stripe charges (cart total - €5), and confirm the voucher flips
 * to 'redeemed' afterwards. Re-runnable — pass a different code to create
 * another one without touching the first (e.g. after a prior test voucher
 * on staging already got redeemed and you need a fresh one).
 *
 * Safe to delete from /admin once the test is done.
 *
 * Usage (staging):
 *   npx tsx src/scripts/create-test-partial-voucher.ts [CODE]
 *   npx tsx src/scripts/create-test-partial-voucher.ts TEST-PARTIAL-5EUR-2
 */

import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const CODE = process.argv[2] || 'TEST-PARTIAL-5EUR'

async function run() {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'vouchers',
    where: { code: { equals: CODE } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0) {
    console.log(`${CODE} already exists (id: ${existing.docs[0].id}) — nothing to do.`)
    process.exit(0)
  }

  const voucher = await payload.create({
    collection: 'vouchers',
    data: {
      code: CODE,
      value: 5,
      status: 'active',
      deliveryMethod: 'pdf',
      purchaserEmail: 'kontakt@fermentfreude.at',
      purchaserName: 'Internal test — partial redemption fix',
      notes: 'Throwaway test voucher for the partial-voucher-discount fix. Safe to delete after testing.',
    },
    context: {
      skipVoucherEmail: true,
      skipRevalidate: true,
      disableRevalidate: true,
    },
    overrideAccess: true,
  })

  console.log(`Created ${voucher.code} (€5, id: ${voucher.id})`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})
