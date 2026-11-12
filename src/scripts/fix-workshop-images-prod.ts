/**
 * One-off: re-link the `image` field of the Tempeh, Lakto and Kombucha workshops on PRODUCTION.
 * They pointed at media records that no longer exist (saved 2026-09-07, media re-uploaded since).
 * The correct media records exist in production under the same ids as on staging.
 *
 * Touches ONLY `image` on exactly these three workshops. Never deletes. Refuses unless
 * PROD_DATABASE_URL is the database `fermentfreude`, and every target media doc exists.
 * Dry run by default.
 *
 * Run:  npx tsx src/scripts/fix-workshop-images-prod.ts            (dry run)
 *       npx tsx src/scripts/fix-workshop-images-prod.ts --production (apply)
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
const mongoosePath = createRequire(req.resolve('@payloadcms/db-mongodb')).resolve('mongoose')
const { MongoClient, ObjectId } = createRequire(mongoosePath)('mongodb')

const TARGETS: Record<string, { mediaId: string; filename: string }> = {
  tempeh: {
    mediaId: '69b2c33e5a3d01ba3783b957',
    filename: 'sliced-raw-tempeh-on-wooden-plate-tempeh-or-tempe-2026-01-06-09-26-00-utc-1.webp',
  },
  lakto: { mediaId: '69b09a7d0e3404c47eeff4d3', filename: 'workshop-lakto.webp' },
  kombucha: { mediaId: '69b2c38d5a3d01ba3783ba2e', filename: 'kombuchaworkshop.webp' },
}

const c = new MongoClient(uri)
await c.connect()
const D = c.db()
console.log(apply ? 'APPLY on production' : 'DRY RUN (nothing written)')
let bad = 0
const plan: { slug: string; _id: unknown; to: unknown }[] = []
for (const [slug, t] of Object.entries(TARGETS)) {
  const m = await D.collection('media').findOne({ _id: new ObjectId(t.mediaId) }, { projection: { filename: 1 } })
  const w = await D.collection('workshops').findOne({ slug }, { projection: { image: 1 } })
  if (!m || m.filename !== t.filename || !w) {
    console.error(`❌ ${slug}: media or workshop not as expected`, !!m, m?.filename, !!w)
    bad++
    continue
  }
  console.log(`✅ ${slug}: image ${String(w.image)} → ${t.mediaId} (${m.filename})`)
  plan.push({ slug, _id: w._id, to: m._id })
}
if (bad) { console.error('Aborting, nothing written.'); await c.close(); process.exit(1) }
if (apply) {
  for (const p of plan) {
    const r = await D.collection('workshops').updateOne({ _id: p._id }, { $set: { image: p.to } })
    console.log(`   wrote ${p.slug}: matched ${r.matchedCount}, modified ${r.modifiedCount}`)
  }
  for (const slug of Object.keys(TARGETS)) {
    const w = await D.collection('workshops').findOne({ slug }, { projection: { image: 1 } })
    const m = await D.collection('media').findOne({ _id: w!.image }, { projection: { filename: 1 } })
    console.log(`   verify ${slug}: ${m ? m.filename : 'STILL DANGLING'}`)
  }
}
await c.close()
