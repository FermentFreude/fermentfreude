/**
 * One-off: remove the "Vom Feld ins Glas" dropdown item from the Header global on PRODUCTION
 * (seasonal workshop, no dates right now). Removes only that one dropdown row; nothing else.
 * To bring it back: add the item again in /admin → Header → Workshops dropdown.
 * Refuses unless PROD_DATABASE_URL is the database `fermentfreude`. Dry run by default.
 *
 * Run:  npx tsx src/scripts/hide-feld-ins-glas-nav-prod.ts            (dry run)
 *       npx tsx src/scripts/hide-feld-ins-glas-nav-prod.ts --production (apply)
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
const { MongoClient } = createRequire(createRequire(req.resolve('@payloadcms/db-mongodb')).resolve('mongoose'))('mongodb')
const c = new MongoClient(uri)
await c.connect()
const G = c.db().collection('globals')
const doc = await G.findOne({ globalType: 'header' })
if (!doc) { console.error('no header global'); process.exit(1) }
const hits: { n: number; d: number; label: unknown }[] = []
;(doc.navItems ?? []).forEach((n: any, ni: number) =>
  (n.dropdownItems ?? []).forEach((d: any, di: number) => {
    if (typeof d.href === 'string' && d.href.includes('vom-feld-ins-glas')) hits.push({ n: ni, d: di, label: d.label })
  }),
)
console.log(apply ? 'APPLY' : 'DRY RUN', '— matches:', JSON.stringify(hits))
if (hits.length !== 1) { console.error('Expected exactly one match, aborting.'); await c.close(); process.exit(1) }
if (apply) {
  const before = (doc.navItems as any[]).reduce((a, n) => a + (n.dropdownItems?.length ?? 0), 0)
  const items = doc.navItems as any[]
  items[hits[0].n].dropdownItems.splice(hits[0].d, 1)
  const r = await G.updateOne({ _id: doc._id }, { $set: { navItems: items } })
  const after = await G.findOne({ _id: doc._id })
  const n2 = (after!.navItems as any[]).reduce((a, n) => a + (n.dropdownItems?.length ?? 0), 0)
  console.log(`modified ${r.modifiedCount}; dropdown items ${before} → ${n2}`)
}
await c.close()
