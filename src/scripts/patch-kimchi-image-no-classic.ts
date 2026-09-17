/**
 * Upload Kimchi packshot without “Classic” on the label and set as gallery primary.
 * Staging only.
 *
 * Prerequisite: public/shop/kimchi-packaging-kimchi-only.webp
 * Run: pnpm exec tsx src/scripts/patch-kimchi-image-no-classic.ts
 */
import fs from 'fs'
import path from 'path'
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as dotenvConfig } from 'dotenv'

dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

const CTX = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const OUT_LOCAL = path.resolve(process.cwd(), 'public/shop/kimchi-packaging-kimchi-only.webp')

function assertStagingDatabase() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  if (!dbUrl.includes('-staging')) {
    console.error('\n🚫 REFUSING TO RUN: DATABASE_URL does not look like staging.\n')
    process.exit(1)
  }
}

async function main() {
  assertStagingDatabase()

  if (!fs.existsSync(OUT_LOCAL)) {
    throw new Error(`Missing ${OUT_LOCAL} — generate the packshot first`)
  }

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const { optimizedFile } = await import('./seed-image-utils')
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'products',
    where: {
      or: [{ slug: { equals: 'kimchi' } }, { slug: { equals: 'classic-kimchi' } }],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const product = found.docs[0]
  if (!product) throw new Error('Kimchi product not found')

  const stamp = Date.now()
  const file = await optimizedFile(OUT_LOCAL, { maxWidth: 1200, quality: 85 })

  const media = await payload.create({
    collection: 'media',
    data: { alt: 'Kimchi im Glas' },
    file: {
      data: file.data,
      mimetype: file.mimetype,
      name: `kimchi-packaging-kimchi-only-${stamp}.webp`,
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
    data: { alt: 'Kimchi in a jar' },
    context: CTX,
    overrideAccess: true,
  })

  const existing = Array.isArray(product.gallery) ? product.gallery : []
  const rest = existing.slice(1).map((item) => {
    const image =
      typeof item?.image === 'object' && item?.image !== null
        ? (item.image as { id: string }).id
        : item?.image
    return { image, ...(item?.id ? { id: item.id } : {}) }
  })

  await payload.update({
    collection: 'products',
    id: product.id,
    data: {
      gallery: [{ image: media.id }, ...rest.filter((r) => Boolean(r.image))],
    },
    context: CTX,
    overrideAccess: true,
  })

  payload.logger.info(`✔ Kimchi primary image updated (no Classic) → media ${media.id}`)
  payload.logger.info(`  Product ${product.id} /${product.slug}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
