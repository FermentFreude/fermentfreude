/**
 * Seed /workshops overview page with hero section.
 *
 * This page showcases all available workshops with hero, booking calendar,
 * and reusable sections (ProductSlider, Testimonials, Sponsors).
 *
 * Run: pnpm seed workshops
 */

import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

// Load .env file
loadEnv()

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

// ── DE: German seed data ──────────────────────────────────────────────────

const workshopsHeroDE = {
  workshopsHeroEyebrow: 'Fermentations-Workshops',
  workshopsHeroTitle: 'Entdecke die Kunst\nder Fermentation',
  workshopsHeroDescription:
    'Lerne von Experten, wie du gesunde fermentierte Lebensmittel selbst zubereitest. Wähle aus drei Workshop-Arten für Anfänger und Fortgeschrittene.',
  workshopsHeroAttributes: [{ text: '3 Stunden' }, { text: 'Hands-on' }, { text: 'Experience' }],
}

const workshopsCalendarDE = {
  workshopsCalendarTitle: 'Unsere nächsten Termine',
  workshopsCalendarDescription:
    'Buche deinen Workshop für Lakto-Gemüse, Kombucha oder Tempeh. Verfügbare Plätze sind begrenzt.',
}

const workshopsProductSliderDE = {
  workshopsProductSliderTitle: 'Starter Kits & Fermentations-Zubehör',
  workshopsProductSliderDescription:
    'Alles, was du brauchst, um zu Hause zu fermentieren. Von Glas-Behältern bis hin zu unseren eigenen fermentierten Produkten.',
}

const workshopsTestimonialsDE = {
  workshopsTestimonialsTitle: 'Das sagen unsere Workshop-Teilnehmer',
  workshopsTestimonialsDescription:
    'Höre von echten Menschen, deren Leben sich durch unsere Workshops verändert hat.',
}

const workshopsSponsorsDE = {
  workshopsSponsorsTitle: 'Unsere Partner & Sponsoren',
  workshopsSponsorsDescription:
    'Wir arbeiten mit den besten Unternehmen zusammen, um workshop-Erlebnisse zu schaffen.',
}

const workshopsPageDataDE = {
  title: 'Workshops',
  slug: 'workshops',
  _status: 'published' as const,
  hero: { type: 'none' as const },
  workshops: {
    ...workshopsHeroDE,
    ...workshopsCalendarDE,
    ...workshopsProductSliderDE,
    ...workshopsTestimonialsDE,
    ...workshopsSponsorsDE,
  },
}

// ── EN: English seed data ─────────────────────────────────────────────────

const workshopsHeroEN = {
  workshopsHeroEyebrow: 'Fermentation Workshops',
  workshopsHeroTitle: 'Discover the Art\nof Fermentation',
  workshopsHeroDescription:
    'Learn from our experts how to create healthy fermented foods yourself. Choose from three workshop types for beginners and advanced participants.',
  workshopsHeroAttributes: [{ text: '3 Hours' }, { text: 'Hands-on' }, { text: 'Experience' }],
}

const workshopsCalendarEN = {
  workshopsCalendarTitle: 'Our Upcoming Dates',
  workshopsCalendarDescription:
    'Book your workshop for Lacto-vegetables, Kombucha, or Tempeh. Available spots are limited.',
}

const workshopsProductSliderEN = {
  workshopsProductSliderTitle: 'Starter Kits & Fermentation Supplies',
  workshopsProductSliderDescription:
    'Everything you need to start fermenting at home. From glass containers to our own fermented products.',
}

const workshopsTestimonialsEN = {
  workshopsTestimonialsTitle: 'What Our Workshop Students Say',
  workshopsTestimonialsDescription:
    'Hear from real people whose lives have been transformed through our workshops.',
}

const workshopsSponsorsEN = {
  workshopsSponsorsTitle: 'Our Partners & Sponsors',
  workshopsSponsorsDescription:
    'We partner with the best brands to create unforgettable workshop experiences.',
}

const workshopsPageDataEN = {
  title: 'Workshops',
  slug: 'workshops',
  _status: 'published' as const,
  hero: { type: 'none' as const },
  workshops: {
    ...workshopsHeroEN,
    ...workshopsCalendarEN,
    ...workshopsProductSliderEN,
    ...workshopsTestimonialsEN,
    ...workshopsSponsorsEN,
  },
}

// ── Seed function ─────────────────────────────────────────────────────────

async function seedWorkshops() {
  const payload = await getPayload({ config })
  const forceRecreate = process.argv.includes('--force')

  payload.logger.info('Seeding /workshops overview page...')

  // Non-destructive check
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'workshops' } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0 && !forceRecreate) {
    payload.logger.info('⏭️  /workshops page already exists. Skipping to protect admin changes.')
    payload.logger.info('   To overwrite, run: pnpm seed workshops --force')
    process.exit(0)
  }

  // 1. Upload hero image (optional — can be added later)
  let heroImageId: string | undefined

  const heroDir = path.resolve(process.cwd(), 'seed-assets/media/hero')
  try {
    // Try to upload workshops hero image if it exists
    const workshopsHeroImage = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'Workshops overview hero image' },
      file: await optimizedFile(path.join(heroDir, 'workshops-hero.png'), IMAGE_PRESETS.hero),
    })
    heroImageId = workshopsHeroImage.id
  } catch {
    // Image file not found — that's okay, we'll use silhouettes
    payload.logger.info('ℹ️  workshops-hero.png not found. Hero will use jar silhouettes.')
  }

  // 2. Build workshops data with image if available
  const workshopsImageField = heroImageId ? { workshopsHeroImage: heroImageId } : {}

  // 3. Save DE locale
  let workshopsPageId: string | number

  if (existing.docs.length > 0) {
    // Update existing
    workshopsPageId = existing.docs[0].id as string | number
    await payload.update({
      collection: 'pages',
      id: workshopsPageId,
      locale: 'de',
      data: {
        ...workshopsPageDataDE,
        workshops: {
          ...workshopsPageDataDE.workshops,
          ...workshopsImageField,
        },
      },
      context: ctx,
    })
    payload.logger.info('✅ Updated German /workshops page')
  } else {
    // Create new
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      draft: false,
      data: {
        ...workshopsPageDataDE,
        workshops: {
          ...workshopsPageDataDE.workshops,
          ...workshopsImageField,
        },
      },
      context: ctx,
    })
    workshopsPageId = created.id
    payload.logger.info('✅ Created German /workshops page')
  }

  // 4. Save EN locale with same IDs
  await payload.update({
    collection: 'pages',
    id: workshopsPageId as string | number,
    locale: 'en',
    data: {
      ...workshopsPageDataEN,
      workshops: {
        ...workshopsPageDataEN.workshops,
        ...workshopsImageField,
      },
    },
    context: ctx,
  })

  payload.logger.info('✅ Created English /workshops page')
  payload.logger.info('')
  payload.logger.info('🎉 /workshops page seed complete!')
}

seedWorkshops().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
