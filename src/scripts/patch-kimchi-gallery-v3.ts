/**
 * Upload 3 Kimchi gallery images (correct FF, no Classic) and set on product.
 * Staging only.
 *
 * Run: pnpm exec tsx src/scripts/patch-kimchi-gallery-v3.ts
 */
import fs from 'fs'
import path from 'path'
// @ts-expect-error — dotenv
import { config as dotenvConfig } from 'dotenv'

dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

const CTX = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const ROOT = process.cwd()
const DIR = path.resolve(ROOT, 'tmp/kimchi-prod/gallery-v3')

const FILES = [
  { file: '01-pack.webp', altDe: 'Kimchi im Glas', altEn: 'Kimchi in a jar' },
  { file: '02-wood.webp', altDe: 'Kimchi auf Holz', altEn: 'Kimchi on wood' },
  { file: '03-stone.webp', altDe: 'Kimchi auf Stein', altEn: 'Kimchi on stone' },
]

function assertStaging() {
  if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
    console.error('🚫 staging only')
    process.exit(1)
  }
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

async function urlOk(url: string) {
  try {
    const head = await fetch(url, { method: 'HEAD' })
    if (head.ok) return true
    const get = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } })
    return get.ok || get.status === 206
  } catch {
    return false
  }
}

async function uploadOne(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  absPath: string,
  filename: string,
  altDe: string,
  altEn: string,
) {
  const buf = fs.readFileSync(absPath)
  const media = await payload.create({
    collection: 'media',
    locale: 'de',
    data: { alt: altDe },
    file: { name: filename, data: buf, mimetype: 'image/webp', size: buf.byteLength },
    context: CTX,
    overrideAccess: true,
  })
  await payload.update({
    collection: 'media',
    id: media.id,
    locale: 'en',
    data: { alt: altEn },
    context: CTX,
    overrideAccess: true,
  })
  const fresh = await payload.findByID({
    collection: 'media',
    id: media.id,
    depth: 0,
    overrideAccess: true,
  })
  const url = fresh.url?.trim()
  if (!url) throw new Error(`no url for ${filename}`)
  for (let i = 0; i < 30; i++) {
    if (await urlOk(url)) {
      payload.logger.info(`  ✔ ${filename} → ${media.id}`)
      return String(media.id)
    }
    await sleep(1500)
  }
  throw new Error(`404: ${url}`)
}

async function main() {
  assertStaging()
  for (const f of FILES) {
    const p = path.join(DIR, f.file)
    if (!fs.existsSync(p)) throw new Error(`Missing ${p}`)
  }

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'products',
    where: { or: [{ slug: { equals: 'kimchi' } }, { slug: { equals: 'classic-kimchi' } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const product = found.docs[0]
  if (!product) throw new Error('Kimchi product not found')
  payload.logger.info(`Product ${product.id} slug=${product.slug}`)

  const stamp = Date.now()
  const ids: string[] = []
  for (const f of FILES) {
    const id = await uploadOne(
      payload,
      path.join(DIR, f.file),
      `kimchi-v3-${f.file.replace('.webp', '')}-${stamp}.webp`,
      f.altDe,
      f.altEn,
    )
    ids.push(id)
    await sleep(3000)
  }

  const gallery = ids.map((image) => ({ image }))
  await payload.update({
    collection: 'products',
    id: product.id,
    data: { gallery },
    context: CTX,
    overrideAccess: true,
  })

  const check = await payload.findByID({
    collection: 'products',
    id: product.id,
    depth: 1,
    overrideAccess: true,
  })
  for (const [i, g] of (check.gallery ?? []).entries()) {
    const img = g?.image
    const url = typeof img === 'object' && img ? img.url : null
    const ok = url ? await urlOk(url) : false
    payload.logger.info(`  [${i}] ${ok ? 'OK' : 'FAIL'} ${url}`)
    if (!ok) throw new Error(`gallery ${i} broken`)
  }

  payload.logger.info('✔ Kimchi gallery = 3 images with correct FF logo')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
