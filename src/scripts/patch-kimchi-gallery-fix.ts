/**
 * Fix Kimchi gallery broken mobile thumbs — sequential webp uploads + verify.
 * Staging only.
 *
 * Run: pnpm exec tsx src/scripts/patch-kimchi-gallery-fix.ts
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

async function urlOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

async function uploadWebp(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  absPath: string,
  filename: string,
  altDe: string,
  altEn: string,
): Promise<string> {
  const buf = fs.readFileSync(absPath)
  const media = await payload.create({
    collection: 'media',
    locale: 'de',
    data: { alt: altDe },
    file: {
      name: filename,
      data: buf,
      mimetype: 'image/webp',
      size: buf.byteLength,
    },
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

  for (let i = 0; i < 10; i++) {
    if (await urlOk(url)) {
      payload.logger.info(`  ✔ ${filename}`)
      return String(media.id)
    }
    await sleep(1000)
  }
  throw new Error(`404 after upload: ${url}`)
}

async function reuseLive(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  id: string,
): Promise<string | null> {
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

  const files = {
    pack: path.resolve(ROOT, 'tmp/kimchi-gallery/pack-clean.webp'),
    three: path.resolve(ROOT, 'tmp/kimchi-gallery/three-from-png.webp'),
    life1: path.resolve(ROOT, 'tmp/kimchi-gallery/life1-from-png.webp'),
    bowl: path.resolve(ROOT, 'tmp/kimchi-gallery/g2.webp'),
    life2: path.resolve(ROOT, 'tmp/kimchi-gallery/life2-from-png.webp'),
  }
  for (const [k, p] of Object.entries(files)) {
    if (!fs.existsSync(p)) throw new Error(`Missing ${k}: ${p}`)
  }

  // Keep local fallback pack in sync
  fs.copyFileSync(files.pack, path.resolve(ROOT, 'public/shop/kimchi-packaging-kimchi-only.webp'))

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
  payload.logger.info('🖼  Fixing Kimchi gallery for mobile…')

  const packId =
    (await reuseLive(payload, '6aabc72c1d4932e00f3eabf5')) ??
    (await uploadWebp(payload, files.pack, `kimchi-pack-${stamp}.webp`, 'Kimchi im Glas', 'Kimchi in a jar'))
  await sleep(500)

  const threeId =
    (await reuseLive(payload, '6aabc89f5de0c426abf5113f')) ??
    (await uploadWebp(payload, files.three, `kimchi-three-${stamp}.webp`, 'Kimchi im Glas', 'Kimchi in a jar'))
  await sleep(500)

  // Prefer the retry that we already verified live in this session if still up
  const life1Id =
    (await reuseLive(payload, '6aabca94ad43afbf43b300b0')) ??
    (await uploadWebp(payload, files.life1, `kimchi-life1-${stamp}.webp`, 'Kimchi im Glas', 'Kimchi in a jar'))
  await sleep(500)

  const bowlId =
    (await reuseLive(payload, '69c14502013349be01faea18')) ??
    (await uploadWebp(payload, files.bowl, `kimchi-bowl-${stamp}.webp`, 'Kimchi in der Schale', 'Kimchi in a bowl'))
  await sleep(500)

  const life2Id = await uploadWebp(
    payload,
    files.life2,
    `kimchi-life2-${stamp}.webp`,
    'Kimchi im Glas',
    'Kimchi in a jar',
  )

  await payload.update({
    collection: 'products',
    id: product.id,
    data: {
      gallery: [
        { image: packId },
        { image: threeId },
        { image: life1Id },
        { image: bowlId },
        { image: life2Id },
      ],
    },
    context: CTX,
    overrideAccess: true,
  })

  // Final verify every gallery URL
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
    if (!ok) throw new Error(`Gallery index ${i} still broken`)
  }

  payload.logger.info('✔ All 5 Kimchi gallery images live on R2')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
