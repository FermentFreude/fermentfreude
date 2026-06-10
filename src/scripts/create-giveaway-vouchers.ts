/**
 * create-giveaway-vouchers.ts
 *
 * Bulk-creates 14 Grazathlon giveaway vouchers in the database.
 * No emails are sent, no invoice numbers assigned.
 *
 * Usage (staging):
 *   npx tsx src/scripts/create-giveaway-vouchers.ts
 *
 * Usage (production):
 *   DATABASE_URL=$PROD_DATABASE_URL npx tsx src/scripts/create-giveaway-vouchers.ts
 */

import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const CODES = [
  'GRAZATHLON-01',
  'GRAZATHLON-02',
  'GRAZATHLON-03',
  'GRAZATHLON-04',
  'GRAZATHLON-05',
  'GRAZATHLON-06',
  'GRAZATHLON-07',
  'GRAZATHLON-08',
  'GRAZATHLON-09',
  'GRAZATHLON-10',
  'GRAZATHLON-11',
  'GRAZATHLON-12',
  'GRAZATHLON-13',
  'GRAZATHLON-14',
]

async function run() {
  const payload = await getPayload({ config })

  console.log(`Creating ${CODES.length} giveaway vouchers...`)

  let created = 0
  let skipped = 0

  for (const code of CODES) {
    // Check if code already exists to make this script safely re-runnable
    const existing = await payload.find({
      collection: 'vouchers',
      where: { code: { equals: code } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`  ⏭  ${code} — already exists, skipping`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'vouchers',
      data: {
        code,
        value: 99,
        status: 'active',
        deliveryMethod: 'pdf',
        purchaserEmail: 'kontakt@fermentfreude.at',
        purchaserName: 'Grazathlon Giveaway',
      },
      context: {
        skipVoucherEmail: true,  // skip sendVoucherPurchaseEmail + assignInvoiceNumber
        skipRevalidate: true,
        disableRevalidate: true,
      },
      overrideAccess: true,
    })

    console.log(`  ✓  ${code}`)
    created++
  }

  console.log(`\nDone. Created: ${created}, Skipped (already existed): ${skipped}`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})
