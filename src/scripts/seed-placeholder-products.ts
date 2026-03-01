/**
 * Placeholder products seed — replaces all products with placeholder versions.
 *
 * This script:
 *   1. Deletes all existing products
 *   2. Creates placeholder products using a single kombucha bottle image
 *   3. Keeps the UI functional and ready for real products later
 *
 * Run: pnpm seed placeholders
 */

import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

function buildDescription(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [
            {
              type: 'text' as const,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              text,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

// Placeholder products — all use the same kombucha bottle image
const PLACEHOLDER_PRODUCTS = [
  {
    titleDe: 'Organic Kombucha',
    titleEn: 'Organic Kombucha',
    slug: 'placeholder-1',
    priceInUSD: 5,
    descriptionDe: 'Bio-Kombucha – Platzhalter-Produkt.',
    descriptionEn: 'Organic Kombucha – Placeholder product.',
  },
  {
    titleDe: 'Organic Kombucha',
    titleEn: 'Organic Kombucha',
    slug: 'placeholder-2',
    priceInUSD: 5,
    descriptionDe: 'Bio-Kombucha – Platzhalter-Produkt.',
    descriptionEn: 'Organic Kombucha – Placeholder product.',
  },
  {
    titleDe: 'Organic Kombucha',
    titleEn: 'Organic Kombucha',
    slug: 'placeholder-3',
    priceInUSD: 5,
    descriptionDe: 'Bio-Kombucha – Platzhalter-Produkt.',
    descriptionEn: 'Organic Kombucha – Placeholder product.',
  },
  {
    titleDe: 'Organic Kombucha',
    titleEn: 'Organic Kombucha',
    slug: 'placeholder-4',
    priceInUSD: 5,
    descriptionDe: 'Bio-Kombucha – Platzhalter-Produkt.',
    descriptionEn: 'Organic Kombucha – Placeholder product.',
  },
  {
    titleDe: 'Organic Kombucha',
    titleEn: 'Organic Kombucha',
    slug: 'placeholder-5',
    priceInUSD: 5,
    descriptionDe: 'Bio-Kombucha – Platzhalter-Produkt.',
    descriptionEn: 'Organic Kombucha – Placeholder product.',
  },
  {
    titleDe: 'Organic Kombucha',
    titleEn: 'Organic Kombucha',
    slug: 'placeholder-6',
    priceInUSD: 5,
    descriptionDe: 'Bio-Kombucha – Platzhalter-Produkt.',
    descriptionEn: 'Organic Kombucha – Placeholder product.',
  },
]

async function seedPlaceholderProducts() {
  const payload = await getPayload({ config })
  const seedAssets = path.resolve(process.cwd(), 'seed-assets')

  console.log('🗑️  Deleting all existing products...')

  // Delete all existing products
  const existingProducts = await payload.find({
    collection: 'products',
    limit: 1000,
    depth: 0,
  })

  for (const product of existingProducts.docs) {
    await payload.delete({
      collection: 'products',
      id: product.id,
      context: ctx,
    })
  }
  console.log(`   Deleted ${existingProducts.docs.length} products`)

  // Upload placeholder image (kombucha bottle)
  console.log('📸 Uploading placeholder image...')

  const placeholderImagePath = path.join(seedAssets, 'images/shop1.png')
  let placeholderImageId: string | null = null

  if (fs.existsSync(placeholderImagePath)) {
    // Check if placeholder image already exists
    const existingPlaceholder = await payload.find({
      collection: 'media',
      where: { alt: { equals: 'Kombucha bottle – placeholder' } },
      limit: 1,
      depth: 0,
    })

    if (existingPlaceholder.docs.length > 0 && existingPlaceholder.docs[0]) {
      placeholderImageId = String(existingPlaceholder.docs[0].id)
      console.log('   Using existing placeholder image')
    } else {
      const media = await payload.create({
        collection: 'media',
        context: ctx,
        data: { alt: 'Kombucha bottle – placeholder' },
        file: await optimizedFile(placeholderImagePath, IMAGE_PRESETS.card),
      })
      placeholderImageId = String(media.id)
      console.log('   Uploaded new placeholder image')
    }
  }

  if (!placeholderImageId) {
    console.error('❌ No placeholder image found at seed-assets/images/shop1.png')
    process.exit(1)
  }

  // Create placeholder products
  console.log('🛒 Creating placeholder products...')
  const productIds: string[] = []

  for (const product of PLACEHOLDER_PRODUCTS) {
    // Create DE locale first
    const created = await payload.create({
      collection: 'products',
      locale: 'de',
      context: ctx,
      data: {
        title: product.titleDe,
        slug: product.slug,
        description: buildDescription(product.descriptionDe),
        gallery: [{ image: placeholderImageId }],
        priceInUSD: product.priceInUSD,
        inventory: 50,
        _status: 'published',
      },
    })
    productIds.push(String(created.id))

    // Update EN locale
    await payload.update({
      collection: 'products',
      id: created.id,
      locale: 'en',
      context: ctx,
      data: {
        title: product.titleEn,
        description: buildDescription(product.descriptionEn),
      },
    })
  }

  console.log(`✅ Created ${productIds.length} placeholder products`)
  console.log('   Product IDs:', productIds.join(', '))

  return productIds
}

seedPlaceholderProducts().catch((err) => {
  console.error('❌ Error seeding placeholders:', err)
  process.exit(1)
})
