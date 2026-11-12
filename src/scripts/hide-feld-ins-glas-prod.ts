/**
 * Hide "Vom Feld ins Glas" on PRODUCTION (season workshop, no dates):
 *  - removes its link from the footer's workshop list
 *  - sets the workshop inactive (drops it from the home showcase + nav lists)
 * Reversible: re-add the footer link and tick "active" on the workshop in /admin.
 * Refuses unless the database is exactly `fermentfreude`. Dry run unless --production.
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
const { MongoClient } = createRequire(
  createRequire(req.resolve('@payloadcms/db-mongodb')).resolve('mongoose'),
)('mongodb')
const c = new MongoClient(uri)
await c.connect()
const D = c.db()

const footer = await D.collection('globals').findOne({ globalType: 'footer' })
const links: any[] = footer?.workshopLinks ?? []
const keep = links.filter((l) => !String(l?.link?.url ?? '').includes('vom-feld-ins-glas'))
const ws = await D.collection('workshops').find({ slug: 'vom-feld-ins-glas' }).toArray()
console.log(apply ? 'APPLY' : 'DRY RUN', { footerLinks: `${links.length} → ${keep.length}`, workshops: ws.length })
if (links.length - keep.length !== 1 || ws.length !== 1) {
  console.error('Unexpected match counts — aborting.')
  process.exit(1)
}
if (apply) {
  await D.collection('globals').updateOne({ _id: footer._id }, { $set: { workshopLinks: keep } })
  await D.collection('workshops').updateOne({ _id: ws[0]._id }, { $set: { isActive: false } })
  console.log('done')
}
await c.close()
