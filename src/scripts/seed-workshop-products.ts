/**
 * Workshop Products Seed — Creates workshop products for the ecommerce cart
 *
 * ⚠️ IMPORTANT: These ARE the workshop products sold to customers.
 * - Created ONCE by this script (run: pnpm seed workshop-products)
 * - NEVER edited by admins (they are reference products, not editable in /admin)
 * - Real workshop data (dates, times, availability) lives in WorkshopAppointments collection
 * - When user books a workshop:
 *   1. They select an appointment from WorkshopAppointments
 *   2. API validates availability server-side
 *   3. Item added to cart with product ID (from this Products table)
 *   4. Cart displays: workshop title + booking metadata (date, time, guests, total price)
 *
 * Why separate products?
 * - Payload's ecommerce plugin requires cart items to reference a Product
 * - Workshops are products (they're what customers buy)
 * - But each booking is unique (different date, guest count, price)
 * - So we store one product per workshop type, and store booking details in cart metadata
 *
 * Run: pnpm seed workshop-products
 */

import config from '@payload-config'
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

const WORKSHOP_PRODUCTS = [
  {
    slug: 'workshop-lakto',
    titleDe: 'Lakto-Gemüse Workshop',
    titleEn: 'Fermented Vegetables Workshop',
    priceInUSD: 99,
    imagePath: 'media/workshops/lakto.png',
    alt: 'Lakto-fermented vegetables workshop',
    descriptionDe: 'Workshop-Buchung (Details siehe Warenkorb)',
    descriptionEn: 'Workshop booking (see cart for details)',
  },
  {
    slug: 'workshop-kombucha',
    titleDe: 'Kombucha Workshop',
    titleEn: 'Kombucha Workshop',
    priceInUSD: 99,
    imagePath: 'media/workshops/kombucha.png',
    alt: 'Kombucha brewing workshop',
    descriptionDe: 'Workshop-Buchung (Details siehe Warenkorb)',
    descriptionEn: 'Workshop booking (see cart for details)',
  },
  {
    slug: 'workshop-tempeh',
    titleDe: 'Tempeh Workshop',
    titleEn: 'Tempeh Workshop',
    priceInUSD: 89,
    imagePath: 'media/workshops/tempeh.png',
    alt: 'Tempeh making workshop',
    descriptionDe: 'Workshop-Buchung (Details siehe Warenkorb)',
    descriptionEn: 'Workshop booking (see cart for details)',
  },
]

async function seedWorkshopProducts() {
  const payload = await getPayload({ config })

  console.log('\n─────────────────────────────────────────')
  console.log('🛍️  Seeding Workshop Products (for cart system)')
  console.log('─────────────────────────────────────────')
  console.log('✅ These ARE your workshop products (kombucha, lakto, tempeh)')
  console.log('💡 Booking details (date, time, guests) stored per appointment')
  console.log('─────────────────────────────────────────\n')

  for (const workshop of WORKSHOP_PRODUCTS) {
    console.log(`\n📦 Processing: ${workshop.titleDe}`)

    // Check if product already exists
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: workshop.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  ✓ Workshop product already exists (${workshop.slug})`)
      continue
    }

    // Upload image (optional - product creation proceeds even without image)
    const seedAssetsDir = path.resolve(process.cwd(), 'seed-assets')
    const imagePath = path.join(seedAssetsDir, 'images', workshop.imagePath)

    let uploadedImage: { id: string } | null = null
    try {
      const optimized = await optimizedFile(imagePath, IMAGE_PRESETS.card)
      uploadedImage = await payload.create({
        collection: 'media',
        locale: 'de',
        data: { alt: workshop.alt },
        file: optimized,
        context: ctx,
      })
      console.log(`  ✓ Image uploaded`)
    } catch (error) {
      console.warn(`  ⚠️  Image upload failed (continuing without image):`, (error as any).code)
      // Don't fail - just proceed without image
    }

    // Create product (DE)
    let productId: string
    try {
      const productDE = await payload.create({
        collection: 'products',
        locale: 'de',
        data: {
          title: workshop.titleDe,
          slug: workshop.slug,
          priceInUSD: workshop.priceInUSD,
          description: buildDescription(workshop.descriptionDe),
          _status: 'published',
          ...(uploadedImage && {
            meta: {
              title: workshop.titleDe,
              description: workshop.descriptionDe,
              image: uploadedImage.id,
            },
            gallery: [
              {
                image: uploadedImage.id,
              },
            ],
          }),
          ...(!uploadedImage && {
            meta: {
              title: workshop.titleDe,
              description: workshop.descriptionDe,
            },
          }),
        },
        context: ctx,
      })
      productId = productDE.id
      console.log(`  ✓ Product created (DE)`)
    } catch (error) {
      console.error(`  ✗ Failed to create product (DE):`, error)
      continue
    }

    // Create product (EN)
    try {
      await payload.update({
        collection: 'products',
        id: productId,
        locale: 'en',
        data: {
          title: workshop.titleEn,
          description: buildDescription(workshop.descriptionEn),
          meta: {
            title: workshop.titleEn,
            description: workshop.descriptionEn,
          },
        },
        context: ctx,
      })
      console.log(`  ✓ Product updated (EN)`)
    } catch (error) {
      console.error(`  ✗ Failed to update product (EN):`, error)
    }

    console.log(`  ✅ ${workshop.titleDe} — Ready for bookings`)
  }

  console.log('\n─────────────────────────────────────────')
  console.log('✅ Workshop products created successfully!')
  console.log('💡 Manage appointment dates in /admin → workshop-appointments')
  console.log('📝 Admins should NOT edit these products (they are reference records)')
  console.log('─────────────────────────────────────────\n')
}

export { seedWorkshopProducts }

// Auto-run if executed directly
seedWorkshopProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error seeding workshop products:', error)
    process.exit(1)
  })
