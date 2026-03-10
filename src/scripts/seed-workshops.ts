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
  workshopsCalendarCards: [
    {
      workshopType: 'lakto' as const,
      nextDate: '20. März',
      duration: '3 Stunden',
      buttonLabel: 'Mehr Infos & Buchen',
    },
    {
      workshopType: 'kombucha' as const,
      nextDate: '22. März',
      duration: '3 Stunden',
      buttonLabel: 'Mehr Infos & Buchen',
    },
    {
      workshopType: 'tempeh' as const,
      nextDate: '24. März',
      duration: '3 Stunden',
      buttonLabel: 'Mehr Infos & Buchen',
    },
  ],
}

const workshopsPageDataDE = {
  title: 'Workshops',
  slug: 'workshops',
  _status: 'published' as const,
  hero: { type: 'none' as const },
  workshops: {
    ...workshopsHeroDE,
    ...workshopsCalendarDE,
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
  workshopsCalendarCards: [
    {
      workshopType: 'lakto' as const,
      nextDate: 'Mar 20',
      duration: '3 Hours',
      buttonLabel: 'More Info & Book',
    },
    {
      workshopType: 'kombucha' as const,
      nextDate: 'Mar 22',
      duration: '3 Hours',
      buttonLabel: 'More Info & Book',
    },
    {
      workshopType: 'tempeh' as const,
      nextDate: 'Mar 24',
      duration: '3 Hours',
      buttonLabel: 'More Info & Book',
    },
  ],
}

const workshopsPageDataEN = {
  title: 'Workshops',
  slug: 'workshops',
  _status: 'published' as const,
  hero: { type: 'none' as const },
  workshops: {
    ...workshopsHeroEN,
    ...workshopsCalendarEN,
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

  // 2. Upload workshop card images (lakto, kombucha, tempeh)
  const workshopsDir = path.resolve(process.cwd(), 'seed-assets/media/workshops')
  const cardImageIds: Record<string, string> = {}

  for (const [type, filename] of Object.entries({
    lakto: 'lakto.png',
    kombucha: 'kombucha.png',
    tempeh: 'tempeh.png',
  })) {
    try {
      const cardImage = await payload.create({
        collection: 'media',
        context: { skipAutoTranslate: true, skipRevalidate: true },
        data: {
          alt:
            type === 'lakto'
              ? 'Lakto-Gemüse Workshop'
              : type === 'kombucha'
                ? 'Kombucha Workshop'
                : 'Tempeh Workshop',
        },
        file: await optimizedFile(path.join(workshopsDir, filename), IMAGE_PRESETS.card),
      })
      cardImageIds[type] = cardImage.id
      payload.logger.info(`✅ Uploaded ${type} workshop card image`)
    } catch (err) {
      payload.logger.warn(`⚠️  Could not upload ${type}.png: ${err}`)
    }
  }

  // 3. Build workshops data with images and calendar cards
  const workshopsImageField = heroImageId ? { workshopsHeroImage: heroImageId } : {}

  // 4. Build calendar cards with images (merge uploaded IDs with base card data)
  const addImagesToCards = (
    cards: Array<{
      workshopType: 'lakto' | 'kombucha' | 'tempeh' | 'basics'
      nextDate: string
      duration: string
      buttonLabel: string
    }>,
  ) =>
    cards.map((card) => ({
      ...card,
      ...(cardImageIds[card.workshopType]
        ? {
            cardImage: cardImageIds[card.workshopType],
            cardImageId: cardImageIds[card.workshopType],
          }
        : {}),
    }))

  // 5. Update locale data with calendar cards + images
  const workshopsDataDEWithCards = {
    ...workshopsPageDataDE.workshops,
    workshopsCalendarCards: addImagesToCards(workshopsPageDataDE.workshops.workshopsCalendarCards),
  }

  const workshopsDataENWithCards = {
    ...workshopsPageDataEN.workshops,
    workshopsCalendarCards: addImagesToCards(workshopsPageDataEN.workshops.workshopsCalendarCards),
  }

  // 6. Save DE locale
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
          ...workshopsDataDEWithCards,
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
          ...workshopsDataDEWithCards,
          ...workshopsImageField,
        },
      },
      context: ctx,
    })
    workshopsPageId = created.id
    payload.logger.info('✅ Created German /workshops page')
  }

  // 7. Save EN locale with same IDs
  await payload.update({
    collection: 'pages',
    id: workshopsPageId as string | number,
    locale: 'en',
    data: {
      ...workshopsPageDataEN,
      workshops: {
        ...workshopsDataENWithCards,
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
