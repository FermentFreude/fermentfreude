/**
 * PROMOTE Home + Gutschein page + footer links: staging DB → target DB (production).
 *
 * What it copies (and nothing else):
 *   - pages "home" (hero + layout + meta) and "voucher" (voucher tab + meta)
 *   - footer global: ONLY the social links
 *   - the images those use: copied into the target bucket (real files, target URLs)
 * What it never touches: prices, products, workshops, orders, users, vouchers,
 * other pages, or any other field of the footer. Nothing is ever deleted.
 *
 * Workshops/products are matched by SLUG, images by FILENAME (their ids differ per database).
 * Any id it cannot map stops the run.
 *
 * Safety:
 *   - default = DRY RUN (reads only, prints the plan)
 *   - --apply writes; target must be `fermentfreude-rehearsal` (a scratch copy of the production
 *     backup) or, with the extra flag --production, `fermentfreude`
 *   - source must be `fermentfreude-staging`
 *   - refuses if the target page has an unpublished admin draft (it would be published/unpublished)
 *   - --no-files skips copying image files (rehearsal)
 *
 * Run (target is passed explicitly, never guessed):
 *   TARGET_DATABASE_URL=<uri> npx tsx src/scripts/promote-home-voucher-to-prod.ts [--apply] [--production] [--no-files]
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import { createRequire } from 'node:module'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const APPLY = process.argv.includes('--apply')
const PRODUCTION_FLAG = process.argv.includes('--production')
const NO_FILES = process.argv.includes('--no-files')

const dbName = (uri: string) =>
  (uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/)?.[1] ?? '').trim()
const SOURCE_URI = process.env.DATABASE_URL ?? ''
const TARGET_URI = process.env.TARGET_DATABASE_URL ?? ''
const SOURCE_DB = dbName(SOURCE_URI)
const TARGET_DB = dbName(TARGET_URI)

if (SOURCE_DB !== 'fermentfreude-staging') {
  console.error('🚫 REFUSING: the source (DATABASE_URL) must be fermentfreude-staging.')
  process.exit(1)
}
if (!['fermentfreude-rehearsal', 'fermentfreude'].includes(TARGET_DB)) {
  console.error(
    '🚫 REFUSING: TARGET_DATABASE_URL must point at fermentfreude-rehearsal or fermentfreude.',
  )
  process.exit(1)
}
if (APPLY && TARGET_DB === 'fermentfreude' && !PRODUCTION_FLAG) {
  console.error('🚫 REFUSING: writing to PRODUCTION needs --production as well as --apply.')
  process.exit(1)
}

const STAGING_PUBLIC = (process.env.R2_PUBLIC_URL ?? '').replace(/"/g, '').replace(/\/$/, '')
// Production image host (documented in CLAUDE.md → "Seeding Production")
const TARGET_PUBLIC = (
  process.env.PROD_R2_PUBLIC_URL ?? 'https://pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev'
).replace(/\/$/, '')
const TARGET_BUCKET = (process.env.PROD_R2_BUCKET ?? '').replace(/"/g, '')

const req = createRequire(import.meta.url)
const mongoosePath = createRequire(req.resolve('@payloadcms/db-mongodb')).resolve('mongoose')
const { MongoClient, ObjectId } = createRequire(mongoosePath)('mongodb')
const s3Path = createRequire(req.resolve('@payloadcms/storage-s3')).resolve('@aws-sdk/client-s3')
const { S3Client, PutObjectCommand } = createRequire(s3Path)('@aws-sdk/client-s3')

const HEX = /^[0-9a-f]{24}$/
const isOid = (x: any) =>
  x && typeof x === 'object' && (x._bsontype === 'ObjectId' || x.constructor?.name === 'ObjectId')

const collectIds = (x: any, out = new Set<string>(), key = ''): Set<string> => {
  if (x == null || key === '_id' || key === 'id') return out
  if (isOid(x)) out.add(String(x))
  else if (typeof x === 'string') {
    if (HEX.test(x)) out.add(x)
  }
  else if (Array.isArray(x)) x.forEach((v) => collectIds(v, out, key))
  else if (typeof x === 'object' && !(x instanceof Date))
    for (const [k, v] of Object.entries(x)) collectIds(v, out, k)
  return out
}

const mb = (n = 0) => (n / 1048576).toFixed(2)
const keyOf = (url: string) => decodeURIComponent(new URL(url).pathname.replace(/^\//, ''))
const toTarget = (url?: string) =>
  url && STAGING_PUBLIC && url.startsWith(STAGING_PUBLIC)
    ? TARGET_PUBLIC + url.slice(STAGING_PUBLIC.length)
    : url
const head = async (url: string) => {
  try {
    return (await fetch(url, { method: 'HEAD' })).status
  } catch {
    return 0
  }
}

async function main() {
  console.log(
    `${APPLY ? '🔴 APPLY' : '🟢 DRY RUN'}  staging (${SOURCE_DB}) → ${TARGET_DB}${NO_FILES ? '  [no image files]' : ''}\n`,
  )
  const sc = new MongoClient(SOURCE_URI)
  const tc = new MongoClient(TARGET_URI)
  await Promise.all([sc.connect(), tc.connect()])
  const S = sc.db()
  const T = tc.db()

  // ── 1. read the source documents ───────────────────────────────
  const srcPages: Record<string, any> = {}
  for (const slug of ['home', 'voucher']) {
    srcPages[slug] = await S.collection('pages').findOne({ slug })
    if (!srcPages[slug]) throw new Error(`staging page "${slug}" not found`)
  }
  const srcFooter = await S.collection('globals').findOne({ globalType: 'footer' })
  const social = srcFooter?.socialMedia
  if (!social) throw new Error('staging footer has no socialMedia')

  // ── 2. work out what they point to ─────────────────────────────
  const ids = new Set<string>()
  for (const slug of ['home', 'voucher'])
    collectIds(
      {
        h: srcPages[slug].hero,
        l: srcPages[slug].layout,
        v: srcPages[slug].voucher,
        m: srcPages[slug].meta,
      },
      ids,
    )
  const oids = [...ids].map((i) => new ObjectId(i))
  const sMedia = await S.collection('media')
    .find({ _id: { $in: oids } })
    .toArray()
  const sWorkshops = await S.collection('workshops')
    .find({ _id: { $in: oids } })
    .project({ slug: 1 })
    .toArray()
  const sProducts = await S.collection('products')
    .find({ _id: { $in: oids } })
    .project({ slug: 1 })
    .toArray()

  // ── 3. match with the target ───────────────────────────────────
  const idMap = new Map<string, string>() // staging id → target id
  const problems: string[] = []
  const tWorkshops = await T.collection('workshops').find({}).project({ slug: 1 }).toArray()
  const tProducts = await T.collection('products').find({}).project({ slug: 1 }).toArray()
  for (const w of sWorkshops) {
    const m = tWorkshops.find((x: any) => x.slug === w.slug)
    if (m) idMap.set(String(w._id), String(m._id))
    else problems.push(`workshop "${w.slug}" does not exist in the target`)
  }
  for (const p of sProducts) {
    const m = tProducts.find((x: any) => x.slug === p.slug)
    if (m) idMap.set(String(p._id), String(m._id))
    else problems.push(`product "${p.slug}" does not exist in the target`)
  }

  const tMediaByName = new Map<string, any>()
  for (const d of await T.collection('media')
    .find({ filename: { $in: sMedia.map((m: any) => m.filename) } })
    .toArray())
    tMediaByName.set(d.filename, d)
  const toCreate = sMedia.filter((m: any) => !tMediaByName.has(m.filename))
  const toRepair = sMedia.filter((m: any) => {
    const t = tMediaByName.get(m.filename)
    return t && STAGING_PUBLIC && String(t.url ?? '').startsWith(STAGING_PUBLIC)
  })
  console.log(
    `Images used: ${sMedia.length} → already in target ${sMedia.length - toCreate.length} · to create ${toCreate.length} (${mb(toCreate.reduce((a: number, m: any) => a + (m.filesize ?? 0), 0))} MB) · to repair (record points at staging bucket) ${toRepair.length}`,
  )
  for (const m of toCreate) console.log(`   ➕ ${m.filename}`)
  for (const m of toRepair) console.log(`   🔧 ${m.filename}`)
  console.log(
    `Workshops matched by slug: ${sWorkshops.length}/${sWorkshops.length - problems.filter((p) => p.startsWith('workshop')).length} · products: ${sProducts.length}/${sProducts.length - problems.filter((p) => p.startsWith('product')).length}`,
  )

  // existing target images must actually be served by the target host
  let missingFiles = 0
  for (const m of sMedia) {
    const t = tMediaByName.get(m.filename)
    if (!t || toRepair.includes(m)) continue
    const s = await head(t.url)
    if (s !== 200) {
      missingFiles++
      problems.push(`target image ${m.filename} answers ${s} at ${t.url}`)
    }
  }
  if (!missingFiles) console.log('Existing target images: all answer 200')

  // new media ids are only known after inserting; reserve them now so the page walk can map
  const newIds = new Map<string, any>() // staging media id → new target _id (not yet inserted)
  for (const m of toCreate) newIds.set(String(m._id), new ObjectId())
  for (const m of sMedia) {
    const t = tMediaByName.get(m.filename)
    idMap.set(String(m._id), t ? String(t._id) : String(newIds.get(String(m._id))))
  }

  // ── 4. convert the pages to plain per-language data ────────────
  const unmapped: string[] = []
  const mapId = (sid: string, p: string) => {
    if (idMap.has(sid)) return idMap.get(sid)!
    unmapped.push(`${p} = ${sid}`)
    return sid
  }
  const toPlain = (x: any, locale: 'de' | 'en', key = '', p = ''): any => {
    if (x == null) return x
    if (isOid(x)) return key === '_id' || key === 'id' ? String(x) : mapId(String(x), p)
    if (typeof x === 'string') return HEX.test(x) && key !== 'id' && key !== '_id' ? mapId(x, p) : x
    if (Array.isArray(x))
      return x.map((v, i) => toPlain(v, locale, key, `${p}[${i}]`)).filter((v) => v !== undefined)
    if (x instanceof Date) return x
    if (typeof x === 'object') {
      const keys = Object.keys(x)
      if (keys.length && keys.every((k) => k === 'de' || k === 'en'))
        return x[locale] === undefined ? undefined : toPlain(x[locale], locale, key, p)
      const out: any = {}
      for (const [k, v] of Object.entries(x)) {
        if (k === '_id' || k === '__v') continue
        const r = toPlain(v, locale, k, p ? `${p}.${k}` : k)
        if (r !== undefined) out[k] = r
      }
      return out
    }
    return x
  }
  const payloads: Record<string, Record<'de' | 'en', any>> = { home: {} as any, voucher: {} as any }
  for (const locale of ['de', 'en'] as const) {
    const h = srcPages.home
    payloads.home[locale] = {
      hero: toPlain(h.hero, locale, 'hero', 'home.hero'),
      layout: toPlain(h.layout, locale, 'layout', 'home.layout'),
      ...(h.meta ? { meta: toPlain(h.meta, locale, 'meta', 'home.meta') } : {}),
    }
    const v = srcPages.voucher
    payloads.voucher[locale] = {
      voucher: toPlain(v.voucher, locale, 'voucher', 'voucher.voucher'),
      ...(v.meta ? { meta: toPlain(v.meta, locale, 'meta', 'voucher.meta') } : {}),
    }
  }
  // An id that points at nothing in staging is only acceptable if the target page ALREADY has the
  // very same id (e.g. the sponsor logos: dangling in both databases, so nothing changes).
  const targetHas = new Set<string>()
  for (const slug of ['home', 'voucher']) {
    const tp = await T.collection('pages').findOne({ slug })
    if (tp) collectIds({ h: tp.hero, l: tp.layout, v: tp.voucher, m: tp.meta }, targetHas)
  }
  const uniqueUnmapped = [...new Set(unmapped)]
  const passthrough = uniqueUnmapped.filter((u) => targetHas.has(u.split(' = ')[1]!))
  for (const u of uniqueUnmapped.filter((x) => !passthrough.includes(x)).slice(0, 12))
    problems.push(`cannot map id → ${u}`)
  if (passthrough.length)
    console.log(
      `Ids kept unchanged (they point at nothing in staging, and the target page already has the same id): ${passthrough.length}`,
    )
  console.log(`Home blocks: ${srcPages.home.layout.map((b: any) => b.blockType).join(', ')}`)

  // ── 5. target pages: draft check ───────────────────────────────
  for (const slug of ['home', 'voucher']) {
    const tp = await T.collection('pages').findOne({ slug })
    if (!tp) {
      problems.push(`target page "${slug}" not found`)
      continue
    }
    const v = await T.collection('_pages_versions')
      .find({ parent: tp._id })
      .sort({ updatedAt: -1 })
      .limit(1)
      .toArray()
    const st = v[0]?.version?._status
    console.log(
      `Target ${slug}: status=${tp._status}, last edited ${new Date(tp.updatedAt).toISOString().slice(0, 16)}, latest version ${st}`,
    )
    if (st === 'draft') problems.push(`target page "${slug}" has an unpublished admin draft`)
  }
  console.log(`Footer: ${JSON.stringify(social)}`)

  if (problems.length) {
    console.log('\n❌ PROBLEMS (nothing was written):')
    problems.forEach((p) => console.log('   - ' + p))
    await Promise.all([sc.close(), tc.close()])
    process.exit(1)
  }
  if (!APPLY) {
    console.log('\n✅ Dry run clean: every id maps, no drafts, files reachable. Nothing written.')
    await Promise.all([sc.close(), tc.close()])
    return
  }

  // ═══════════════ APPLY ═══════════════
  // a. image files + records
  const s3 = NO_FILES
    ? null
    : new S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      })
  const copyFile = async (srcUrl: string) => {
    if (!s3) return
    const res = await fetch(srcUrl)
    if (!res.ok) throw new Error(`cannot download ${srcUrl} (${res.status})`)
    await s3.send(
      new PutObjectCommand({
        Bucket: TARGET_BUCKET,
        Key: keyOf(srcUrl),
        Body: Buffer.from(await res.arrayBuffer()),
        ContentType: res.headers.get('content-type') ?? undefined,
      }),
    )
  }
  const remapSizes = (sizes: any) => {
    if (!sizes) return sizes
    const out: any = {}
    for (const [k, v] of Object.entries<any>(sizes))
      out[k] = v && typeof v === 'object' ? { ...v, url: toTarget(v.url) } : v
    return out
  }
  // Size variants that were never generated have no filename and a ".../media/null" address: skip them
  const fileUrls = (m: any) =>
    [
      m.url,
      ...Object.values<any>(m.sizes ?? {})
        .filter((s) => s?.filename)
        .map((s) => s.url),
    ].filter((u) => u && !/\/null$/.test(u)) as string[]

  for (const m of toCreate) {
    for (const u of fileUrls(m)) await copyFile(u)
    const { _id, ...rest } = m
    await T.collection('media').insertOne({
      ...rest,
      _id: newIds.get(String(_id)),
      url: toTarget(m.url),
      thumbnailURL: toTarget(m.thumbnailURL),
      sizes: remapSizes(m.sizes),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log(`  ➕ media ${m.filename}`)
  }
  for (const m of toRepair) {
    const t = tMediaByName.get(m.filename)
    for (const u of fileUrls(t)) if ((await head(toTarget(u)!)) !== 200) await copyFile(u)
    await T.collection('media').updateOne(
      { _id: t._id },
      {
        $set: {
          url: toTarget(t.url),
          thumbnailURL: toTarget(t.thumbnailURL),
          sizes: remapSizes(t.sizes),
          updatedAt: new Date(),
        },
      },
    )
    console.log(`  🔧 media ${m.filename}`)
  }

  // b. pages + footer through Payload (versions, locales, hooks handled properly)
  process.env.DATABASE_URL = TARGET_URI
  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })
  for (const slug of ['home', 'voucher']) {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const id = found.docs[0]!.id
    for (const locale of ['de', 'en'] as const) {
      await payload.update({
        collection: 'pages',
        id,
        locale,
        data: { ...payloads[slug]![locale], _status: 'published' } as never,
        context: ctx,
      })
      console.log(`  ✅ page ${slug} ${locale}`)
    }
  }
  const foot = await payload.findGlobal({ slug: 'footer', depth: 0 })
  await payload.updateGlobal({
    slug: 'footer',
    data: { socialMedia: { ...(foot.socialMedia ?? {}), ...social } } as never,
    context: ctx,
  })
  console.log('  ✅ footer social links')

  // c. verify
  let bad = 0
  for (const m of sMedia) {
    const t = await T.collection('media').findOne({ _id: new ObjectId(idMap.get(String(m._id))!) })
    const s = t ? await head(t.url) : 0
    if (s !== 200) {
      bad++
      console.log(`  ⚠️  ${m.filename} → ${s}`)
    }
  }
  console.log(bad ? `\n⚠️  ${bad} image(s) not reachable` : '\n✅ Done. All images answer 200.')
  await Promise.all([sc.close(), tc.close()])
}

await main()
process.exit(0)
