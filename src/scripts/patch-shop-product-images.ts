/**
 * Upload temporary product photos from /public and attach to the 3 shop products.
 * Also wires ShopHero → Käfer and supporting cards → Berglinsen + Kimchi.
 *
 * Run: pnpm patch:shop-images
 */
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import path from 'path'
import config from '@payload-config'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'
import {
  CTX,
  appendBlockToPage,
  findMediaByFilename,
  findProductBySlug,
  patchBlockInPage,
} from './migrations/_helpers'

const ROOT = process.cwd()

const PRODUCT_IMAGES: Record<
  string,
  { localPath: string; altDe: string; altEn: string; filename: string }
> = {
  'kaeferbohnen-tempeh': {
    // Packaging for product page; shop hero uses public/shop/hero-kaefer.webp separately
    localPath: 'public/shop/kaefer-packaging.webp',
    filename: 'kaefer-packaging-drive.webp',
    altDe: 'Käferbohnen-Tempeh in Verpackung',
    altEn: 'Runner bean tempeh in packaging',
  },
  'berglinsen-tempeh': {
    // Temporary plated shot until packaged Berglinsen photo exists
    localPath: 'public/shop/berglinsen-plated.webp',
    filename: 'berglinsen-plated-drive.webp',
    altDe: 'Berglinsen-Tempeh, angerichtet',
    altEn: 'Mountain lentil tempeh, plated',
  },
  'classic-kimchi': {
    localPath: 'public/courses-hero/kimchi.webp',
    filename: `kimchi-shop-${Date.now()}.webp`,
    altDe: 'Classic Kimchi im Glas',
    altEn: 'Classic kimchi in a jar',
  },
}

async function uploadOrReuse(
  payload: Awaited<ReturnType<typeof getPayload>>,
  localPath: string,
  filename: string,
  altDe: string,
  altEn: string,
): Promise<string> {
  const existing = await findMediaByFilename(payload, filename)
  if (existing) {
    payload.logger.info(`  ↩ media exists: ${filename}`)
    return existing
  }

  const abs = path.resolve(ROOT, localPath)
  const file = await optimizedFile(abs, IMAGE_PRESETS.card)
  // Force a stable filename so re-runs are idempotent
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

async function ensureBerglinsen(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<string> {
  const existing = await findProductBySlug(payload, 'berglinsen-tempeh', false)
  if (existing) return existing

  payload.logger.info('  → Creating Berglinsen-Tempeh…')
  const created = await payload.create({
    collection: 'products',
    locale: 'de',
    data: {
      title: 'Berglinsen-Tempeh',
      slug: 'berglinsen-tempeh',
      _status: 'published',
      priceInEUR: 790,
      inventory: 20,
      productType: 'fresh',
      unitSize: '185g Frischpackung',
      shortDescription:
        'Tempeh aus österreichischen Berglinsen — nussig, proteinreich, handgemacht.',
      ingredients:
        'Berglinsen aus Österreich gekocht (97%), Apfelessig, Starterkultur (Rhizopus oligosporus).',
      gallery: [],
    } as never,
    context: CTX,
    overrideAccess: true,
  })

  await payload.update({
    collection: 'products',
    id: created.id,
    locale: 'en',
    data: {
      title: 'Mountain Lentil Tempeh',
      unitSize: '185g fresh pack',
      shortDescription:
        'Tempeh from Austrian mountain lentils — nutty, protein-rich, handmade.',
      ingredients:
        'Cooked Austrian mountain lentils (97%), apple cider vinegar, starter culture (Rhizopus oligosporus).',
    } as never,
    context: CTX,
    overrideAccess: true,
  })

  return String(created.id)
}

async function main() {
  const payload = await getPayload({ config })
  payload.logger.info('🖼  Attaching temporary shop product images…')

  // Ensure Berglinsen exists
  await ensureBerglinsen(payload)

  const mediaBySlug: Record<string, string> = {}

  for (const [slug, spec] of Object.entries(PRODUCT_IMAGES)) {
    mediaBySlug[slug] = await uploadOrReuse(
      payload,
      spec.localPath,
      spec.filename,
      spec.altDe,
      spec.altEn,
    )
  }

  // Attach gallery images (overwrite so placeholders always show)
  for (const [slug, mediaId] of Object.entries(mediaBySlug)) {
    const productId = await findProductBySlug(payload, slug, false)
    if (!productId) {
      payload.logger.warn(`  ⚠ product missing: ${slug}`)
      continue
    }

    await payload.update({
      collection: 'products',
      id: productId,
      data: {
        gallery: [{ image: mediaId }],
        ...(slug === 'classic-kimchi' ? { isSeasonal: true } : {}),
      } as never,
      context: CTX,
      overrideAccess: true,
    })
    payload.logger.info(`  ✔ ${slug} ← ${mediaId}`)
  }

  const kaferId = await findProductBySlug(payload, 'kaeferbohnen-tempeh', true)
  const berglinsenId = await findProductBySlug(payload, 'berglinsen-tempeh', true)
  const kimchiId = await findProductBySlug(payload, 'classic-kimchi', true)

  // Wire ShopHero → Käfer
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
      bottomSubtitle: 'Abholung in Graz — jede Woche frisch.',
      bottomDisclaimer: 'Wir arbeiten an einem Lieferservice — für garantierte Frische.',
    },
    {
      heroProduct: kaferId,
      heroPanelColor: '#403c39',
      heroTitle: 'Our handmade products from our pick-up shop.',
      ctaPrimaryLabel: 'Order Now',
      ctaPrimaryUrl: '/products/kaeferbohnen-tempeh',
      slides: [],
      bottomTagline: 'Fermented foods, crafted with care.',
      bottomSubtitle: 'Pickup in Graz — freshly made every week.',
      bottomDisclaimer: 'Delivery coming soon — to ensure the freshest quality.',
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

  payload.logger.info('✅ Drive images attached. Hard-refresh /shop')
  payload.logger.info('   Hero BG: public/shop/hero-kaefer.webp (plated cooked Käfer)')
  payload.logger.info('   Käfer product: packaging · Berglinsen: plated (pack shot TBD)')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
