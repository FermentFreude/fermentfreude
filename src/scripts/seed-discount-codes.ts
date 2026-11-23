/**
 * Creates the Rabattcodes the site needs (Shop → Rabattcodes).
 *
 *   npx tsx src/scripts/seed-discount-codes.ts
 *
 * Additive only: a code that already exists is left exactly as it is,
 * so changes the founders make in /admin are never overwritten.
 * Safe to run against production (it only ever adds).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const CODES = [
  {
    code: 'FREUDE26',
    amountOff: 5,
    voucherAmounts: ['99'] as ('99' | '50' | '30' | '20')[],
    // Midday UTC = the same calendar day in Vienna
    validFrom: '2026-12-01T12:00:00.000Z',
    validUntil: '2027-01-31T12:00:00.000Z',
    active: true,
    note: 'Kleine Zeitung Tip-On-Card (Graz & Umgebung), erscheint 4.12.2026. €5 Rabatt auf den €99 Workshop-Gutschein, gültig 1.12.2026–31.1.2027.',
  },
]

async function run() {
  const db = process.env.DATABASE_URL ?? ''
  const dbName = db.match(/\/([^/?]+)(\?|$)/)?.[1] ?? 'unknown'
  console.log(`Database: ${dbName}`)

  const payload = await getPayload({ config: configPromise })

  for (const entry of CODES) {
    const existing = await payload.find({
      collection: 'discount-codes',
      where: { code: { equals: entry.code } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      console.log(`= ${entry.code} already exists — left unchanged`)
      continue
    }
    await payload.create({
      collection: 'discount-codes',
      data: entry,
      overrideAccess: true,
      context: { skipRevalidate: true, skipAutoTranslate: true },
    })
    console.log(`+ ${entry.code} created`)
  }
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
