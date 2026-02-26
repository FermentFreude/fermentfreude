/**
 * Product seed — creates Organic Kombucha products with bottle images.
 *
 * Uploads 4 shop images and creates 8 products (DE + EN) matching the
 * Figma shop grid: Apple & Carrot, Coffee Flavour, Wald Berry × 2, etc.
 *
 * Run alone:  set -a && source .env && set +a && npx tsx src/scripts/seed-products.ts
 * Run via:    pnpm seed products
 */

import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

// ── Product definitions (order mirrors the Figma slider) ────────────────────
const PRODUCTS = [
  {
    de: { title: 'Organic Kombucha', variant: 'Apfel & Karotte', size: '250ML' },
    en: { title: 'Organic Kombucha', variant: 'Apple & Carrot', size: '250ML' },
    slug: 'kombucha-apple-carrot',
    price: 4.9,
    image: 'shop1.png',
  },
  {
    de: { title: 'Organic Kombucha', variant: 'Kaffee Geschmack', size: '250ML' },
    en: { title: 'Organic Kombucha', variant: 'Coffe Flavour', size: '250ML' },
    slug: 'kombucha-coffee',
    price: 4.9,
    image: 'Shop2.png',
  },
  {
    de: { title: 'Organic Kombucha', variant: 'Waldbeere', size: '250ML' },
    en: { title: 'Organic Kombucha', variant: 'Wald berry', size: '250ML' },
    slug: 'kombucha-waldberry',
    price: 4.9,
    image: 'Shop3.png',
  },
  {
    de: { title: 'Organic Kombucha', variant: 'Kaffee Geschmack', size: '250ML' },
    en: { title: 'Organic Kombucha', variant: 'Coffe Flavour', size: '250ML' },
    slug: 'kombucha-coffee-2',
    price: 4.9,
    image: 'Shop4.png',
  },
  {
    de: { title: 'Organic Kombucha', variant: 'Kaffee Geschmack', size: '250ML' },
    en: { title: 'Organic Kombucha', variant: 'Coffe Flavour', size: '250ML' },
    slug: 'kombucha-coffee-3',
    price: 4.9,
    image: 'Shop2.png',
  },
  {
    de: { title: 'Organic Kombucha', variant: 'Waldbeere', size: '250ML' },
    en: { title: 'Organic Kombucha', variant: 'Wald berry', size: '250ML' },
    slug: 'kombucha-waldberry-2',
    price: 4.9,
    image: 'Shop3.png',
  },
  {
    de: { title: 'Organic Kombucha', variant: 'Kaffee Geschmack', size: '250ML' },
    en: { title: 'Organic Kombucha', variant: 'Coffe Flavour', size: '250ML' },
    slug: 'kombucha-coffee-4',
    price: 4.9,
    image: 'Shop4.png',
  },
  {
    de: { title: 'Organic Kombucha', variant: 'Apfel & Karotte', size: '250ML' },
    en: { title: 'Organic Kombucha', variant: 'Apple & Carrot', size: '250ML' },
    slug: 'kombucha-apple-carrot-2',
    price: 4.9,
    image: 'shop1.png',
  },
]

export async function seedProducts(payloadInstance?: ReturnType<typeof getPayload> extends Promise<infer P> ? P : never) {
  const payload = payloadInstance ?? await getPayload({ config })

  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')

  // ── Clean up stale products from previous seeds ───────────────────────────
  payload.logger.info('Cleaning up stale seeded products...')
  for (const prod of PRODUCTS) {
    await payload
      .delete({
        collection: 'products',
        where: { slug: { equals: prod.slug } },
        context: ctx,
      })
      .catch(() => {})
  }

  // ── Clean up stale shop media ─────────────────────────────────────────────
  await payload
    .delete({
      collection: 'media',
      where: { alt: { contains: 'shop-product-' } },
      context: ctx,
    })
    .catch(() => {})

  // ── Upload the 4 unique shop images ───────────────────────────────────────
  const uniqueImages = ['shop1.png', 'Shop2.png', 'Shop3.png', 'Shop4.png']
  const mediaMap: Record<string, string> = {}

  for (const filename of uniqueImages) {
    const media = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: `shop-product-${filename.replace('.png', '')}` },
      file: await optimizedFile(path.join(imagesDir, filename), IMAGE_PRESETS.card),
    })
    mediaMap[filename] = String(media.id)
    payload.logger.info(`  ✓ Uploaded ${filename} → ${media.id}`)
  }

  // ── Create products sequentially (MongoDB M0 — no transactions) ───────────
  const productIds: string[] = []

  for (const prod of PRODUCTS) {
    // 1. Create product in DE locale
    const created = await payload.create({
      collection: 'products',
      locale: 'de',
      context: ctx,
      data: {
        title: prod.de.title,
        slug: prod.slug,
        _status: 'published',
        gallery: [{ image: mediaMap[prod.image] }],
        priceInUSD: prod.price,
        enableVariants: false,
      },
    })
    const productId = String(created.id)
    productIds.push(productId)

    // 2. Save EN locale with the same ID
    await payload.update({
      collection: 'products',
      id: productId,
      locale: 'en',
      context: ctx,
      data: {
        title: prod.en.title,
      },
    })

    payload.logger.info(`  ✓ Product "${prod.en.variant}" (${prod.slug}) → ${productId}`)
  }

  payload.logger.info(`✅ ${productIds.length} products seeded.`)
  return productIds
}

// ── Run standalone ──────────────────────────────────────────────────────────
if (process.argv[1]?.includes('seed-products')) {
  seedProducts()
    .then((ids) => {
      console.log(`\n🎉 Product IDs: ${ids.join(', ')}`)
      process.exit(0)
    })
    .catch((err) => {
      console.error('Seed failed:', err)
      process.exit(1)
    })
}
