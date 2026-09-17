/**
 * Replace Kimchi gallery with user's original photos (Classic removed only).
 * Does NOT use the black-bar packshot edit.
 * Staging only.
 *
 * Run: pnpm exec tsx src/scripts/patch-kimchi-gallery-originals.ts
 */
import fs from 'fs'
import path from 'path'
// @ts-expect-error — dotenv
import { config as dotenvConfig } from 'dotenv'

dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

const CTX = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const ROOT = process.cwd()

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

async function uploadImage(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  absPath: string,
  filename: string,
  altDe: string,
  altEn: string,
) {
  const buf = fs.readFileSync(absPath)
  const mime = filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 'image/webp'
  const media = await payload.create({
    collection: 'media',
    locale: 'de',
    data: { alt: altDe },
    file: { name: filename, data: buf, mimetype: mime, size: buf.byteLength },
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
      payload.logger.info(`  ✔ ${filename}`)
      return String(media.id)
    }
    await sleep(1500)
  }
  throw new Error(`404: ${url}`)
}

async function reuseLive(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  id: string,
) {
  try {
    const doc = await payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true })
    if (doc.url && (await urlOk(doc.url))) {
      payload.logger.info(`  ↩ reuse ${id}`)
      return String(doc.id)
    }
  } catch {
    /* ignore */
  }
  return null
}

async function main() {
  assertStaging()
  // Prod jar photos with Classic erased (same logo/photo); lifestyle shots have no label text
  const wood = path.resolve(ROOT, 'tmp/kimchi-prod/wood-clean.webp')
  const stone = path.resolve(ROOT, 'tmp/kimchi-prod/stone-clean.webp')
  const bowl = path.resolve(ROOT, 'tmp/kimchi-prod/2.webp')
  const life = path.resolve(ROOT, 'tmp/kimchi-prod/3.webp')
  for (const p of [wood, stone, bowl, life]) {
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
  if (!product) throw new Error('Kimchi not found')

  const stamp = Date.now()
  payload.logger.info('🖼  Setting Kimchi gallery — same photos/logo, Classic removed…')

  const woodId = await uploadImage(
    payload,
    wood,
    `kimchi-wood-noclassic-${stamp}.webp`,
    'Kimchi im Glas',
    'Kimchi in a jar',
  )
  await sleep(3000)
  const stoneId = await uploadImage(
    payload,
    stone,
    `kimchi-stone-noclassic-${stamp}.webp`,
    'Kimchi im Glas',
    'Kimchi in a jar',
  )
  await sleep(3000)
  const bowlId = await uploadImage(
    payload,
    bowl,
    `kimchi-bowl-${stamp}.webp`,
    'Kimchi in der Schale',
    'Kimchi in a bowl',
  )
  await sleep(3000)
  const lifeId = await uploadImage(
    payload,
    life,
    `kimchi-life-${stamp}.webp`,
    'Kimchi im Glas und Schale',
    'Kimchi in jar and bowl',
  )
  await sleep(1000)

  const gallery = [
    { image: woodId },
    { image: stoneId },
    { image: bowlId },
    { image: lifeId },
  ]

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

  payload.logger.info('✔ Gallery uses your original photos — Classic removed only')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
