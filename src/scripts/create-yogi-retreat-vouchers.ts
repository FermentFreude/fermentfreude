/**
 * create-yogi-retreat-vouchers.ts
 *
 * Bulk-creates 11 short-code marketing-gift vouchers (€5 each) for
 * participants of a yoga retreat. Codes are short on purpose so they fit by
 * hand into the pre-printed hard-copy voucher boxes. No emails are sent, no
 * invoice numbers assigned.
 *
 * Usage (staging):
 *   npx tsx src/scripts/create-yogi-retreat-vouchers.ts
 *
 * Usage (production):
 *   DATABASE_URL=$PROD_DATABASE_URL npx tsx src/scripts/create-yogi-retreat-vouchers.ts
 */

import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const CODES = [
  'YOGI-101',
  'YOGI-102',
  'YOGI-103',
  'YOGI-104',
  'YOGI-105',
  'YOGI-106',
  'YOGI-107',
  'YOGI-108',
  'YOGI-109',
  'YOGI-110',
  'YOGI-111',
]

async function run() {
  const payload = await getPayload({ config })

  console.log(`Creating ${CODES.length} yoga-retreat gift vouchers...`)

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
        value: 5,
        status: 'active',
        deliveryMethod: 'pdf',
        purchaserEmail: 'kontakt@fermentfreude.at',
        purchaserName: 'Yoga Retreat Marketing Gift',
        notes: 'Marketing gift voucher for yoga retreat participant — hard copy printed and handed out in person.',
      },
      context: {
        skipVoucherEmail: true, // skip sendVoucherPurchaseEmail + assignInvoiceNumber
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
