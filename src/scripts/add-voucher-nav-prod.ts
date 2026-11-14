/**
 * Add the top-level "Gutschein / Voucher" navbar link on PRODUCTION (same as staging):
 * inserted right after "Workshops". Refuses unless the database is exactly `fermentfreude`.
 * Dry run unless --production. Skips if a top-level link to /workshops/voucher exists.
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import { createRequire } from 'node:module'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })
const uri = process.env.PROD_DATABASE_URL ?? ''
if (!/\/fermentfreude(\?|$)/.test(uri)) {
  console.error('🚫 REFUSING: PROD_DATABASE_URL must point at the database "fermentfreude".')
  process.exit(1)
}
const apply = process.argv.includes('--production')
const req = createRequire(import.meta.url)
const { MongoClient, ObjectId } = createRequire(
  createRequire(req.resolve('@payloadcms/db-mongodb')).resolve('mongoose'),
)('mongodb')
const c = new MongoClient(uri)
await c.connect()
const G = c.db().collection('globals')
const doc = await G.findOne({ globalType: 'header' })
if (!doc) { console.error('no header global'); process.exit(1) }
const items = doc.navItems as any[]
const idx = items.findIndex((n) => n?.link?.url === '/workshops')
const exists = items.some((n) => String(n?.link?.url ?? '').includes('voucher'))
console.log(apply ? 'APPLY' : 'DRY RUN', { workshopsAt: idx, voucherAlreadyThere: exists, total: items.length })
if (idx < 0 || exists) { console.error('Unexpected state — aborting.'); await c.close(); process.exit(1) }
if (apply) {
  items.splice(idx + 1, 0, {
    link: { type: 'custom', newTab: false, url: '/workshops/voucher', label: { de: 'Gutschein', en: 'Voucher' } },
    dropdownItems: [],
    id: new ObjectId().toString(),
  })
  const r = await G.updateOne({ _id: doc._id }, { $set: { navItems: items } })
  console.log(`modified ${r.modifiedCount}; nav items ${items.length - 1} → ${items.length}`)
}
await c.close()
