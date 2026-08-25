/**
 * Local shop patch — wires the 3-product editorial layout without a full --force reseed.
 *
 * - Ensures Berglinsen-Tempeh exists
 * - Marks Classic Kimchi as seasonal (title + ingredients editable each batch)
 * - Patches FeaturedProductCards: Käfer hero + Berglinsen + Kimchi
 * - Hides ShopProductList (no product repetition)
 * - Calms ShopHero CTAs / clears jar slides
 *
 * Run: pnpm tsx src/scripts/patch-shop-three-products.ts
 * Safe: only touches shop page blocks + the three products. No push.
 */

import config from '@payload-config'
import { getPayload } from 'payload'

import {
  CTX,
  appendBlockToPage,
  findProductBySlug,
  patchBlockInPage,
} from './migrations/_helpers'

async function ensureBerglinsen(
  payload: Awaited<ReturnType<typeof getPayload>>,
  galleryFromHero?: string | null,
): Promise<string> {
  const existing = await findProductBySlug(payload, 'berglinsen-tempeh', false)
  if (existing) {
    // If existing but no gallery, attach hero image as temporary stand-in
    if (galleryFromHero) {
      const doc = await payload.findByID({
        collection: 'products',
        id: existing,
        depth: 0,
        overrideAccess: true,
      })
      const hasGallery = Array.isArray(doc.gallery) && doc.gallery.length > 0
      if (!hasGallery) {
        await payload.update({
          collection: 'products',
          id: existing,
          data: { gallery: [{ image: galleryFromHero }] } as never,
          context: CTX,
          overrideAccess: true,
        })
        payload.logger.info('  ✔ Berglinsen gallery filled from hero image (replace in admin)')
      }
    }
    return existing
  }

  payload.logger.info('  → Creating Berglinsen-Tempeh product…')

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
      gallery: galleryFromHero ? [{ image: galleryFromHero }] : [],
    } as never,
    context: CTX,
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
  })

  return String(created.id)
}

async function markKimchiSeasonal(payload: Awaited<ReturnType<typeof getPayload>>, id: string) {
  await payload.update({
    collection: 'products',
    id,
    locale: 'de',
    data: {
      isSeasonal: true,
    } as never,
    context: CTX,
  })
  // isSeasonal is not localized — one write is enough, but keep EN text fields intact
  payload.logger.info('  ✔ Classic Kimchi marked as seasonal')
}

async function main() {
  const payload = await getPayload({ config })
  payload.logger.info('🛒 Patching shop for 3-product editorial layout…')

  const kaferId = await findProductBySlug(payload, 'kaeferbohnen-tempeh', false)
  const kimchiId = await findProductBySlug(payload, 'classic-kimchi', false)

  // Reuse Käfer gallery image as temporary stand-in when creating/fixing Berglinsen
  let kaferGalleryId: string | null = null
  if (kaferId) {
    const kafer = await payload.findByID({
      collection: 'products',
      id: kaferId,
      depth: 0,
      overrideAccess: true,
    })
    const first = kafer.gallery?.[0]?.image
    if (typeof first === 'string') kaferGalleryId = first
    else if (typeof first === 'object' && first !== null && 'id' in first) {
      kaferGalleryId = String((first as { id: string }).id)
    }
  }

  const berglinsenId = await ensureBerglinsen(payload, kaferGalleryId)

  if (!kaferId) {
    throw new Error('Product kaeferbohnen-tempeh not found. Run: pnpm seed products')
  }
  if (!kimchiId) {
    throw new Error('Product classic-kimchi not found. Run: pnpm seed products')
  }

  await markKimchiSeasonal(payload, kimchiId)

  // Shop hero = Käfer product (large, at top)
  await patchBlockInPage(
    payload,
    'shop',
    'shopHero',
    {
      heroProduct: kaferId,
      heroPanelColor: '#403c39',
      heroTitle: 'Unsere handgemachten Produkte aus unserem Pick-Up Shop.',
      ctaPrimaryLabel: 'Jetzt bestellen',
      ctaPrimaryUrl: `/products/kaeferbohnen-tempeh`,
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
      ctaPrimaryUrl: `/products/kaeferbohnen-tempeh`,
      slides: [],
      bottomTagline: 'Fermented foods, crafted with care.',
      bottomSubtitle: 'Pickup in Graz — freshly made every week.',
      bottomDisclaimer: 'Delivery coming soon — to ensure the freshest quality.',
    },
  )

  // Hide duplicate catalog
  await patchBlockInPage(payload, 'shop', 'shopProductList', { visible: false }, { visible: false })

  // Supporting products only — Käfer already in ShopHero (no banner, no "Bestseller")
  const featuredDE = {
    visible: true,
    heading: 'Weitere Produkte',
    subheading: 'Berglinsen-Tempeh und saisonales Kimchi.',
    products: [berglinsenId, kimchiId],
    cardColors: [{ color: '#4b4f4a' }, { color: '#555954' }],
    bannerProduct: null,
    bannerColor: null,
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
    payload.logger.info('  → FeaturedProductCards missing — appending…')
    await appendBlockToPage(payload, 'shop', 'featuredProductCards', featuredDE, featuredEN)
  }

  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag('pages')
    revalidateTag('shop-page')
    payload.logger.info('  ✔ Cache tags revalidated')
  } catch {
    payload.logger.info('  ℹ Restart pnpm dev or hard-refresh if shop looks cached')
  }

  payload.logger.info('✅ Shop three-product patch complete. Refresh /shop locally.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Shop patch failed:', err)
  process.exit(1)
})
