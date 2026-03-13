/**
 * Seed the Voucher page.
 * Creates a "Geschenkgutschein" / "Gift Voucher" page with all sections:
 * hero with voucher form, starter set, gift occasions, and FAQ.
 *
 * Uploads images to Payload Media (Cloudflare R2) so they're editable from /admin.
 * Seeds both DE (default) and EN locales, reusing array IDs.
 *
 * Following the rules:
 * - Schema first: all voucher fields are in the CMS schema
 * - Seed both languages: DE first, read back IDs, then EN with same IDs
 * - Context flags: skipRevalidate, disableRevalidate, skipAutoTranslate
 * - Sequential DB writes (no Promise.all) for MongoDB Atlas M0
 * - Images uploaded via Payload Media collection (stored in Cloudflare R2)
 *
 * Run: npx tsx src/scripts/seed-voucher.ts
 */
import type { Media } from '@/payload-types'
import config from '@payload-config'
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

// Load .env file
loadEnv()

import {
  voucherPageDataDE,
  voucherPageDataEN,
  seedContext as voucherSeedContext,
} from './data/voucher-page'
import { IMAGE_PRESETS, optimizedFile, readLocalFile } from './seed-image-utils'

async function seedVoucher() {
  const payload = await getPayload({ config })

  console.log('🧪 Seeding Voucher page…')

  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')
  const forceRecreate = process.argv.includes('--force')

  // ── 0. Non-destructive check — skip if page already has content ──
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'voucher' } },
    limit: 10,
    depth: 0,
  })

  if (existing.docs.length > 0 && !forceRecreate) {
    const doc = existing.docs[0]
    const layout = Array.isArray(doc.layout) ? doc.layout : []
    if (layout.length > 0) {
      console.log(
        `⏭️  Voucher page already has content (${layout.length} blocks). Skipping seed to protect admin changes.`,
      )
      console.log('   To overwrite, run: pnpm seed voucher --force')
      process.exit(0)
    }
  }

  if (forceRecreate) {
    console.log('🔄 --force flag detected. Will overwrite existing voucher page content.')
  }

  // ── 1. Skip deletion — will update existing page if it exists ──────────────────────
  // (Images are preserved by updating instead of deleting)

  // ── 2. Upload images to Payload Media (Cloudflare R2) ────────
  console.log('  📸 Uploading images to Media collection…')

  // Upload card logo
  const cardLogoPath = path.join(imagesDir, 'submark.svg')
  let cardLogo: Media | null = null
  if (fs.existsSync(cardLogoPath)) {
    cardLogo = await payload.create({
      collection: 'media',
      data: { alt: 'voucher-logo – FermentFreude logo for voucher card' },
      file: readLocalFile(cardLogoPath),
      context: { skipAutoTranslate: true },
    })
    console.log(`    ✅ Card logo: ${cardLogo.id}`)
  } else {
    console.log(`    ⚠️  Card logo not found at ${cardLogoPath}`)
  }

  // Upload starter set image (use a placeholder if not available)
  const starterSetImagePath = path.join(imagesDir, 'Image (Gift Set).png')
  let starterSetImage: Media | null = null
  if (fs.existsSync(starterSetImagePath)) {
    starterSetImage = await payload.create({
      collection: 'media',
      data: { alt: 'voucher-starter-set – Starter set image for voucher page' },
      file: await optimizedFile(starterSetImagePath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    console.log(`    ✅ Starter set image: ${starterSetImage.id}`)
  } else {
    console.log(`    ⚠️  Starter set image not found at ${starterSetImagePath}`)
  }

  // Upload gift occasion images
  const giftOccasionFiles = [
    { file: 'Geburtstage.png', alt: 'voucher-occasion-birthdays – Birthdays gift occasion' },
    { file: 'hochzeit.png', alt: 'voucher-occasion-weddings – Weddings gift occasion' },
    { file: 'Team_Events.png', alt: 'voucher-occasion-team-events – Team events gift occasion' },
    { file: 'Weihnachten.png', alt: 'voucher-occasion-christmas – Christmas gift occasion' },
  ]

  const giftOccasionImages: (Media | null)[] = []
  for (const occasion of giftOccasionFiles) {
    const filePath = path.join(imagesDir, occasion.file)
    if (fs.existsSync(filePath)) {
      const img = await payload.create({
        collection: 'media',
        data: { alt: occasion.alt },
        file: await optimizedFile(filePath, IMAGE_PRESETS.card),
        context: { skipAutoTranslate: true },
      })
      giftOccasionImages.push(img)
      console.log(`    ✅ ${occasion.file}: ${img.id}`)
    } else {
      console.log(`    ⚠️  ${occasion.file} not found at ${filePath}`)
      // Push null to maintain array order
      giftOccasionImages.push(null)
    }
  }

  // ── 4. Create or update the Voucher page in DE (default locale) ────────
  console.log('  📄 Creating/updating voucher page (DE)...')

  let voucherPageDE: any
  const pageId = existing.docs.length > 0 ? existing.docs[0]!.id : undefined

  if (pageId && forceRecreate) {
    // Update existing page
    voucherPageDE = await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      depth: 0,
      data: voucherPageDataDE({
        cardLogo,
        starterSetImage,
        giftOccasionImages,
      }),
      context: voucherSeedContext,
    })
    console.log(`  ✅ Updated voucher page ${pageId} (DE)`)
  } else {
    // Create new page
    voucherPageDE = await payload.create({
      collection: 'pages',
      locale: 'de',
      depth: 0,
      data: voucherPageDataDE({
        cardLogo,
        starterSetImage,
        giftOccasionImages,
      }),
      context: voucherSeedContext,
    })
    console.log(`  ✅ Created voucher page ${voucherPageDE.id} (DE)`)
  }

  // ── 5. Read back the page to get array IDs ──────────────
  const savedVoucherDoc = await payload.findByID({
    collection: 'pages',
    id: voucherPageDE.id,
    depth: 0,
    locale: 'de',
  })

  // ── 6. Update with EN locale, reusing array IDs ──────────────
  console.log('  📄 Updating voucher page (EN)...')
  await payload.update({
    collection: 'pages',
    id: voucherPageDE.id,
    locale: 'en',
    depth: 0,
    data: voucherPageDataEN(savedVoucherDoc, {
      cardLogo,
      starterSetImage,
      giftOccasionImages,
    }),
    context: voucherSeedContext,
  })

  console.log(`  ✅ Updated voucher page ${voucherPageDE.id} (EN)`)
  console.log('\n🎉 Voucher page seeded successfully!')
  console.log(`   View at: http://localhost:3000/workshops/voucher`)
  console.log(`   Edit at: http://localhost:3000/admin/collections/pages/${voucherPageDE.id}`)
}

seedVoucher()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error seeding voucher page:', error)
    process.exit(1)
  })
