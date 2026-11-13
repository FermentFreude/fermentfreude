/** PRODUCTION: point the Workshops dropdown "Workshop Gutschein" straight at /workshops/voucher (skips a redirect). Dry run unless --production. */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import { createRequire } from 'node:module'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })
const uri = process.env.PROD_DATABASE_URL ?? ''
if (!/\/fermentfreude(\?|$)/.test(uri)) { console.error('🚫 REFUSING: not the "fermentfreude" database.'); process.exit(1) }
const apply = process.argv.includes('--production')
const req = createRequire(import.meta.url)
const { MongoClient } = createRequire(createRequire(req.resolve('@payloadcms/db-mongodb')).resolve('mongoose'))('mongodb')
const c = new MongoClient(uri)
await c.connect()
const G = c.db().collection('globals')
const doc = await G.findOne({ globalType: 'header' })
const hits: [number, number][] = []
;(doc!.navItems as any[]).forEach((n, i) => (n.dropdownItems ?? []).forEach((d: any, j: number) => { if (d.href === '/voucher') hits.push([i, j]) }))
console.log(apply ? 'APPLY' : 'DRY RUN', JSON.stringify(hits))
if (hits.length !== 1) { console.error('Expected exactly one match.'); process.exit(1) }
if (apply) {
  const r = await G.updateOne({ _id: doc!._id }, { $set: { [`navItems.${hits[0][0]}.dropdownItems.${hits[0][1]}.href`]: '/workshops/voucher' } })
  console.log('modified', r.modifiedCount)
}
await c.close()
