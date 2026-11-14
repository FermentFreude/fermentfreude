/**
 * READ-ONLY audit before promoting staging → production (Home, Gutschein, footer).
 *
 * Reads staging (DATABASE_URL) and production (PROD_DATABASE_URL) and prints what
 * has to be copied or matched. It NEVER writes: it only calls find / count on the
 * database driver (no Payload, no hooks, no index creation), and refuses to run
 * unless the two databases are exactly `fermentfreude-staging` and `fermentfreude`.
 * Prints no connection strings or secrets.
 *
 * Run:  npx tsx src/scripts/prod-readonly-audit.ts
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import { createRequire } from 'node:module'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const dbName = (uri: string) =>
  (uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/)?.[1] ?? '').trim()
const STAGING_URI = process.env.DATABASE_URL ?? ''
const PROD_URI = process.env.PROD_DATABASE_URL ?? ''
if (dbName(STAGING_URI) !== 'fermentfreude-staging' || dbName(PROD_URI) !== 'fermentfreude') {
  console.error(
    '🚫 REFUSING TO RUN: expected DATABASE_URL → fermentfreude-staging and PROD_DATABASE_URL → fermentfreude.',
  )
  process.exit(1)
}

// The Mongo driver comes with Payload's Mongo adapter (mongoose)
const req = createRequire(import.meta.url)
const mongoosePath = createRequire(req.resolve('@payloadcms/db-mongodb')).resolve('mongoose')
const { MongoClient } = createRequire(mongoosePath)('mongodb')

/** Read-only view of a database: the only methods that exist are reads. */
const readOnly = (db: any) => ({
  find: (c: string, q: object = {}, projection: object = {}) =>
    db.collection(c).find(q, { projection }).toArray(),
  count: (c: string, q: object = {}) => db.collection(c).countDocuments(q),
})

const HEX = /^[0-9a-f]{24}$/
const collectIds = (x: unknown, out = new Set<string>(), key = ''): Set<string> => {
  if (x == null) return out
  if (typeof x === 'string') {
    if (HEX.test(x) && key !== 'id') out.add(x)
  } else if (Array.isArray(x)) x.forEach((v) => collectIds(v, out, key))
  else if (typeof x === 'object') {
    const o = x as Record<string, unknown>
    if ((o as any)._bsontype === 'ObjectId' || o.constructor?.name === 'ObjectId') {
      if (key !== '_id' && key !== 'id') out.add(String(x))
    } else for (const [k, v] of Object.entries(o)) collectIds(v, out, k)
  }
  return out
}
const loc = (v: any) =>
  v && typeof v === 'object' && !Array.isArray(v) && ('de' in v || 'en' in v) ? (v.de ?? v.en) : v

async function main() {
  const sc = new MongoClient(STAGING_URI)
  const pc = new MongoClient(PROD_URI)
  await Promise.all([sc.connect(), pc.connect()])
  const S = readOnly(sc.db())
  const P = readOnly(pc.db())
  console.log(
    'Databases: staging =',
    dbName(STAGING_URI),
    '| production =',
    dbName(PROD_URI),
    '(read-only)\n',
  )

  // 1 ─ sizes
  console.log('1. DOCUMENT COUNTS  (staging / production)')
  for (const c of [
    'pages',
    'media',
    'workshops',
    'products',
    'workshop-appointments',
    'orders',
    'vouchers',
    'users',
  ])
    console.log(
      `   ${c.padEnd(24)} ${String(await S.count(c)).padStart(5)} / ${String(await P.count(c)).padStart(5)}`,
    )

  // 2 ─ the pages
  console.log('\n2. PAGES')
  const pageInfo = async (X: ReturnType<typeof readOnly>, slug: string) => {
    const [doc] = await X.find(
      'pages',
      { slug },
      { layout: 1, hero: 1, voucher: 1, meta: 1, _status: 1, updatedAt: 1 },
    )
    if (!doc) return null
    const versions = await X.find(
      '_pages_versions',
      { parent: doc._id },
      { 'version._status': 1, updatedAt: 1, latest: 1 },
    )
    versions.sort((a: any, b: any) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    return { doc, latest: versions[0], nVersions: versions.length }
  }
  const st: Record<string, any> = {}
  for (const slug of ['home', 'voucher']) {
    const [s, p] = [await pageInfo(S, slug), await pageInfo(P, slug)]
    st[slug] = s
    const show = (label: string, x: any) =>
      console.log(
        `   ${slug.padEnd(8)} ${label.padEnd(10)} ` +
          (x
            ? `status=${x.doc._status} updated=${new Date(x.doc.updatedAt).toISOString().slice(0, 16)} versions=${x.nVersions} latestVersion=${x.latest?.version?._status}` +
              (x.doc.layout
                ? `\n${' '.repeat(23)}blocks: ${x.doc.layout.map((b: any) => b.blockType).join(', ')}`
                : '')
            : 'MISSING'),
      )
    show('staging', s)
    show('production', p)
    if (p?.latest?.version?._status === 'draft')
      console.log(
        `   ⚠️  production ${slug} has an unpublished admin DRAFT — a write would publish/unpublish it`,
      )
  }

  // 3 ─ what the staging pages/footer point to
  console.log('\n3. WHAT STAGING HOME + GUTSCHEIN + FOOTER POINT TO')
  const [footerS] = await S.find('globals', { globalType: 'footer' })
  const [footerP] = await P.find('globals', { globalType: 'footer' })
  const ids = new Set<string>()
  for (const slug of ['home', 'voucher'])
    collectIds(
      {
        h: st[slug]?.doc?.hero,
        l: st[slug]?.doc?.layout,
        v: st[slug]?.doc?.voucher,
        m: st[slug]?.doc?.meta,
      },
      ids,
    )
  collectIds(footerS, ids)
  const { ObjectId } = createRequire(mongoosePath)('mongodb')
  const oids = [...ids].map((i) => new ObjectId(i))
  const media = await S.find(
    'media',
    { _id: { $in: oids } },
    { filename: 1, filesize: 1, mimeType: 1, url: 1 },
  )
  const workshops = await S.find('workshops', { _id: { $in: oids } }, { slug: 1, title: 1 })
  const products = await S.find(
    'products',
    { _id: { $in: oids } },
    { slug: 1, title: 1, priceInEUR: 1 },
  )
  const known = new Set([...media, ...workshops, ...products].map((d: any) => String(d._id)))
  console.log(
    `   images: ${media.length} | workshops: ${workshops.length} | products: ${products.length} | other ids: ${[...ids].filter((i) => !known.has(i)).length}`,
  )

  // 4 ─ do they exist in production?
  console.log('\n4. DO THEY EXIST IN PRODUCTION?')
  const pw = await P.find('workshops', {}, { slug: 1, title: 1 })
  const pp = await P.find('products', {}, { slug: 1, title: 1, priceInEUR: 1 })
  console.log('   WORKSHOPS (matched by slug)')
  for (const w of workshops) {
    const m = pw.find((x: any) => x.slug === w.slug)
    console.log(`     ${m ? '✅' : '❌ MISSING'} ${w.slug}  (${loc(w.title)})`)
  }
  console.log('   PRODUCTS (matched by slug)')
  for (const p of products) {
    const m = pp.find((x: any) => x.slug === p.slug)
    console.log(
      `     ${m ? '✅' : '❌ MISSING'} ${p.slug}  price staging=${p.priceInEUR} production=${m?.priceInEUR ?? '-'}`,
    )
  }
  const pmedia = await P.find(
    'media',
    { filename: { $in: media.map((m: any) => m.filename) } },
    { filename: 1, filesize: 1, url: 1 },
  )
  const missing: any[] = []
  const sizeDiff: any[] = []
  for (const m of media) {
    const f = pmedia.find((x: any) => x.filename === m.filename)
    if (!f) missing.push(m)
    else if (f.filesize !== m.filesize) sizeDiff.push([m, f])
  }
  const mb = (n: number) => (n / 1048576).toFixed(1)
  console.log(
    `   IMAGES (matched by filename): ${media.length - missing.length} already in production, ${missing.length} to copy (${mb(missing.reduce((a, m) => a + (m.filesize ?? 0), 0))} MB), ${sizeDiff.length} same name but different file size`,
  )
  for (const m of missing) console.log(`     ➕ ${m.filename}  (${mb(m.filesize ?? 0)} MB)`)
  for (const [m, f] of sizeDiff)
    console.log(
      `     ⚠️  ${m.filename}: staging ${mb(m.filesize)} MB vs production ${mb(f.filesize)} MB`,
    )
  const stagingUrls = pmedia.filter((x: any) => /pub-0cf8a1c18a/.test(x.url ?? '')).length
  console.log(
    `   production media docs pointing at the STAGING bucket: ${stagingUrls} of the matched ones`,
  )

  // 5 ─ footer + price note
  console.log('\n5. FOOTER SOCIAL LINKS')
  console.log('   staging   ', JSON.stringify(footerS?.socialMedia))
  console.log('   production', JSON.stringify(footerP?.socialMedia))

  await Promise.all([sc.close(), pc.close()])
}

await main()
process.exit(0)
