/**
 * Upload selected shop product images to Payload/R2 and attach galleries.
 *
 * Image selection: src/data/shop-product-images.ts (from David's Drive folders)
 *
 * Run: pnpm patch:shop-images
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import fs from 'fs'
import path from 'path'
import config from '@payload-config'
import { getPayload } from 'payload'

import { SHOP_PRODUCT_IMAGES } from '../data/shop-product-images'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'
import {
  CTX,
  appendBlockToPage,
  findMediaByFilename,
  findProductBySlug,
  patchBlockInPage,
  setProductGallery,
} from './migrations/_helpers'

const ROOT = process.cwd()

function resolveLocalPath(localPath: string, fallbackPath?: string): string {
  const primary = path.resolve(ROOT, localPath)
  if (fs.existsSync(primary)) return primary
  if (fallbackPath) {
    const fallback = path.resolve(ROOT, fallbackPath)
    if (fs.existsSync(fallback)) return fallback
    throw new Error(`Missing image: ${localPath} (and fallback ${fallbackPath})`)
  }
  throw new Error(`Missing image: ${localPath}`)
}

const forceReupload = process.argv.includes('--force')

async function uploadOrReuse(
  payload: Awaited<ReturnType<typeof getPayload>>,
  absPath: string,
  filename: string,
  altDe: string,
  altEn: string,
): Promise<string> {
  const existing = await findMediaByFilename(payload, filename)

  if (existing && forceReupload) {
    await payload.delete({
      collection: 'media',
      id: existing,
      context: CTX,
      overrideAccess: true,
    })
    payload.logger.info(`  ✕ deleted stale media ${filename} — re-uploading`)
  }

  if (existing && !forceReupload) {
    payload.logger.info(`  ↩ media exists: ${filename} (pass --force to re-upload to R2)`)
    return existing
  }

  const file = await optimizedFile(absPath, IMAGE_PRESETS.card)
  file.name = filename

  const media = await payload.create({
    collection: 'media',
    locale: 'de',
    data: { alt: altDe },
    file,
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

  payload.logger.info(`  ✔ uploaded ${filename}`)
  return String(media.id)
}

async function main() {
  const payload = await getPayload({ config })
  payload.logger.info('🖼  Attaching selected shop product images (Drive → R2)…')

  for (const spec of SHOP_PRODUCT_IMAGES) {
    payload.logger.info(`  → ${spec.slug}: ${spec.driveNote}`)

    const primaryPath = resolveLocalPath(spec.primary.localPath, spec.primary.fallbackPath)
    const primaryId = await uploadOrReuse(
      payload,
      primaryPath,
      spec.primary.filename,
      spec.primary.altDe,
      spec.primary.altEn,
    )

    const galleryIds = [primaryId]

    if (spec.secondary) {
      const secondaryPath = resolveLocalPath(
        spec.secondary.localPath,
        spec.secondary.fallbackPath,
      )
      const secondaryId = await uploadOrReuse(
        payload,
        secondaryPath,
        spec.secondary.filename,
        spec.secondary.altDe,
        spec.secondary.altEn,
      )
      galleryIds.push(secondaryId)
    }

    const productId = await findProductBySlug(payload, spec.slug, true)
    if (!productId) continue

    await setProductGallery(payload, productId, galleryIds)
    payload.logger.info(`  ✔ ${spec.slug} gallery ← ${galleryIds.join(', ')}`)
  }

  const kaferId = await findProductBySlug(payload, 'kaeferbohnen-tempeh', true)
  const berglinsenId = await findProductBySlug(payload, 'berglinsen-tempeh', true)
  const kimchiId = await findProductBySlug(payload, 'classic-kimchi', true)

  await patchBlockInPage(
    payload,
    'shop',
    'shopHero',
    {
      heroProduct: kaferId,
      heroPanelColor: '#403c39',
      heroTitle: 'Unsere handgemachten Produkte aus unserem Pick-Up Shop.',
      ctaPrimaryLabel: 'Jetzt bestellen',
      ctaPrimaryUrl: '/products/kaeferbohnen-tempeh',
      slides: [],
      bottomTagline: 'Fermentierte Lebensmittel, mit Sorgfalt hergestellt.',
      bottomSubtitle: 'Abholung in Graz, jede Woche frisch.',
      bottomDisclaimer: 'Wir arbeiten an einem Lieferservice, für garantierte Frische.',
    },
    {
      heroProduct: kaferId,
      heroPanelColor: '#403c39',
      heroTitle: 'Our handmade products from our pick-up shop.',
      ctaPrimaryLabel: 'Order Now',
      ctaPrimaryUrl: '/products/kaeferbohnen-tempeh',
      slides: [],
      bottomTagline: 'Fermented foods, crafted with care.',
      bottomSubtitle: 'Pickup in Graz, freshly made every week.',
      bottomDisclaimer: 'Delivery coming soon, to ensure the freshest quality.',
    },
  )

  await patchBlockInPage(payload, 'shop', 'shopProductList', { visible: false }, { visible: false })

  const featuredDE = {
    visible: true,
    heading: 'Weitere Produkte',
    subheading: 'Berglinsen-Tempeh und saisonales Kimchi.',
    products: [berglinsenId, kimchiId],
    cardColors: [{ color: '#4b4f4a' }, { color: '#555954' }],
    bannerProduct: null,
    ctaLabel: 'Jetzt bestellen',
  }
  const featuredEN = {
    ...featuredDE,
    heading: 'More products',
    subheading: 'Mountain lentil tempeh and seasonal kimchi.',
    ctaLabel: 'Order Now',
  }

  const patched = await patchBlockInPage(
    payload,
    'shop',
    'featuredProductCards',
    featuredDE,
    featuredEN,
  )
  if (patched === 'not-found') {
    await appendBlockToPage(payload, 'shop', 'featuredProductCards', featuredDE, featuredEN)
  }

  payload.logger.info('✅ Shop product images attached. Hard-refresh /shop and product pages.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
