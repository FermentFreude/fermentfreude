/**
 * Replace Kimchi gallery with clean label images (no “Classic”).
 * Staging only.
 *
 * Run: pnpm exec tsx src/scripts/patch-kimchi-gallery-no-classic.ts
 */
import fs from 'fs'
import path from 'path'
// @ts-expect-error — dotenv
import { config as dotenvConfig } from 'dotenv'

dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

const CTX = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

function assertStaging() {
  if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
    console.error('🚫 staging only')
    process.exit(1)
  }
}

async function upload(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  localPath: string,
  filename: string,
  altDe: string,
  altEn: string,
) {
  const { optimizedFile } = await import('./seed-image-utils')
  const file = await optimizedFile(localPath, { maxWidth: 1600, quality: 85 })
  const media = await payload.create({
    collection: 'media',
    data: { alt: altDe },
    file: {
      data: file.data,
      mimetype: file.mimetype,
      name: filename,
      size: file.size,
    },
    locale: 'de',
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
  return String(media.id)
}

async function main() {
  assertStaging()
  const root = process.cwd()
  const three = path.resolve(root, 'tmp/kimchi-gallery/three-jars-clean.webp')
  const pack = path.resolve(root, 'public/shop/kimchi-packaging-kimchi-only.webp')
  const lifestyle = path.resolve(root, 'tmp/kimchi-gallery/g1-clean.webp')
  const lifestyle2 = path.resolve(root, 'tmp/kimchi-gallery/g3-clean.webp')

  for (const p of [three, pack, lifestyle, lifestyle2]) {
    if (!fs.existsSync(p)) throw new Error(`Missing ${p}`)
  }

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'products',
    where: { or: [{ slug: { equals: 'kimchi' } }, { slug: { equals: 'classic-kimchi' } }] },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const product = found.docs[0]
  if (!product) throw new Error('Kimchi not found')

  const stamp = Date.now()

  // Keep unlabeled food shots (bowl / jar+bowl) from existing gallery when present
  const existing = Array.isArray(product.gallery) ? product.gallery : []
  const keepIds: string[] = []
  for (const item of existing) {
    const img = item?.image
    const filename =
      typeof img === 'object' && img && 'filename' in img
        ? String((img as { filename?: string }).filename ?? '')
        : ''
    const id =
      typeof img === 'object' && img && 'id' in img
        ? String((img as { id: string }).id)
        : typeof img === 'string'
          ? img
          : null
    // Keep food-only shots that never had Classic on a label
    if (id && (filename === '2.webp' || filename === '3.webp')) {
      keepIds.push(id)
    }
  }

  const threeId = await upload(
    payload,
    three,
    `kimchi-three-jars-${stamp}.webp`,
    'Kimchi im Glas',
    'Kimchi in a jar',
  )
  const packId = await upload(
    payload,
    pack,
    `kimchi-pack-${stamp}.webp`,
    'Kimchi im Glas',
    'Kimchi in a jar',
  )
  const life1Id = await upload(
    payload,
    lifestyle,
    `kimchi-lifestyle-${stamp}.webp`,
    'Kimchi im Glas',
    'Kimchi in a jar',
  )
  const life2Id = await upload(
    payload,
    lifestyle2,
    `kimchi-lifestyle-2-${stamp}.webp`,
    'Kimchi im Glas',
    'Kimchi in a jar',
  )

  const gallery = [
    { image: threeId },
    { image: life1Id },
    ...(keepIds[0] ? [{ image: keepIds[0] }] : []),
    { image: life2Id },
    ...(keepIds[1] ? [{ image: keepIds[1] }] : [{ image: packId }]),
  ]

  await payload.update({
    collection: 'products',
    id: product.id,
    data: { gallery },
    context: CTX,
    overrideAccess: true,
  })

  payload.logger.info(`✔ Kimchi gallery updated (${gallery.length} images, no Classic on labels)`)
  payload.logger.info(`  Product ${product.id} /${product.slug}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
