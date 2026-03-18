/**
 * Courses page seed — sets up the "courses" page with layout blocks.
 *
 * Layout blocks:
 *   1. FeatureCards — "What You'll Learn" (6 cards)
 *   2. OnlineCourseSlider — fetches from OnlineCourses collection
 *
 * The courses page hero is baked into the page template (3 rotated image cards).
 * The OnlineCourseSlider block handles both active and coming-soon courses.
 *
 * Non-destructive: skips if page layout already has blocks. Use --force to overwrite.
 * Bilingual: DE first → read IDs → EN with same IDs.
 *
 * Run: pnpm seed courses-page
 */

import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

// ── DE block data ────────────────────────────────────────────────────────────

const featureCardsDe = {
  blockType: 'featureCards' as const,
  eyebrow: 'Überblick',
  heading: 'Was du lernen wirst',
  description:
    'Unsere Online-Kurse decken alle wesentlichen Fermentationstechniken ab — von Gemüse bis Getränke, von Sauerteig bis Milchprodukte.',
  cards: [
    {
      title: 'Gemüse-Fermentation',
      description:
        'Meistere Sauerkraut, Kimchi und eingelegtes Gemüse mit traditionellen und modernen Techniken.',
    },
    {
      title: 'Fermentierte Getränke',
      description: 'Braue Kombucha, Wasserkefir und andere probiotische Getränke zu Hause.',
    },
    {
      title: 'Sauerteigbrot',
      description:
        'Erstelle und pflege einen Starter; backe handwerkliche Brote mit perfekter Kruste.',
    },
    {
      title: 'Milch-Fermentation',
      description: 'Stelle Joghurt, Kefir und Kulturmilchprodukte mit optimalen Probiotika her.',
    },
    {
      title: 'Sicherheit & Wissenschaft',
      description: 'Verstehe Fermentationswissenschaft, Ausstattung und Lebensmittelsicherheit.',
    },
    {
      title: 'Fehlerbehebung',
      description: 'Erkenne und behebe häufige Fermentationsprobleme mit fachkundiger Anleitung.',
    },
  ],
}

const onlineCourseSliderDe = {
  blockType: 'onlineCourseSlider' as const,
  eyebrow: 'Kursübersicht',
  heading: 'Kursmodule',
  showComingSoon: true,
  comingSoonEyebrow: 'Entdecken',
  comingSoonHeading: 'Weitere Kurse in Planung',
  comingSoonDescription:
    'Wir arbeiten an spannenden neuen Kursen. Melde dich an, um benachrichtigt zu werden!',
}

// ── EN block data ────────────────────────────────────────────────────────────

const featureCardsEn = {
  blockType: 'featureCards' as const,
  eyebrow: 'Overview',
  heading: "What You'll Learn",
  description:
    'Our online courses cover all essential fermentation techniques — from vegetables to beverages, from sourdough to dairy.',
  cards: [
    {
      title: 'Vegetable Fermentation',
      description:
        'Master sauerkraut, kimchi, and pickled vegetables with traditional and modern techniques.',
    },
    {
      title: 'Fermented Beverages',
      description: 'Brew kombucha, water kefir, and other probiotic drinks at home.',
    },
    {
      title: 'Sourdough Bread',
      description: 'Create and maintain a starter; bake artisan loaves with a perfect crust.',
    },
    {
      title: 'Dairy Fermentation',
      description: 'Make yogurt, kefir, and cultured dairy with optimal probiotics.',
    },
    {
      title: 'Safety & Science',
      description: 'Understand fermentation science, equipment, and food safety.',
    },
    {
      title: 'Troubleshooting',
      description: 'Identify and fix common fermentation issues with expert guidance.',
    },
  ],
}

const onlineCourseSliderEn = {
  blockType: 'onlineCourseSlider' as const,
  eyebrow: 'Course Overview',
  heading: 'Course Modules',
  showComingSoon: true,
  comingSoonEyebrow: 'Explore',
  comingSoonHeading: 'More Courses on the Way',
  comingSoonDescription:
    "We're working on exciting new courses. Sign up to be notified when they launch!",
}

// ── Seed function ────────────────────────────────────────────────────────────

async function seedCoursesPage() {
  const payload = await getPayload({ config })
  const forceRecreate = process.argv.includes('--force')

  // Find or create the courses page
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'courses' } },
    limit: 1,
    depth: 0,
  })

  let pageId: string

  if (existing.docs.length > 0) {
    const doc = existing.docs[0]
    pageId = String(doc.id)
    const layout = Array.isArray(doc.layout) ? doc.layout : []

    if (layout.length > 0 && !forceRecreate) {
      payload.logger.info(
        '⏭️  Courses page already has %d blocks. Skipping. Use --force to overwrite.',
        layout.length,
      )
      process.exit(0)
    }

    if (forceRecreate) {
      payload.logger.info('🔄 --force: overwriting courses page layout...')
    }
  } else {
    // Create the page
    payload.logger.info('📄 Creating courses page...')
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      data: {
        title: 'Online Kurse',
        slug: 'courses',
        _status: 'published',
        hero: { type: 'none' },
        layout: [],
      },
      context: ctx,
    })
    pageId = String(created.id)
  }

  // 1. Save DE layout
  payload.logger.info('📄 Saving courses page layout (DE)...')
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    data: {
      title: 'Online Kurse',
      layout: [featureCardsDe, onlineCourseSliderDe],
    },
    context: ctx,
  })

  // 2. Read back to capture generated block/array IDs
  const fresh = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
  })

  const freshLayout = (fresh.layout ?? []) as Array<{
    id?: string
    blockType?: string
    cards?: Array<{ id?: string }>
  }>

  // 3. Build EN with same IDs
  const featureCardsBlock = freshLayout.find((b) => b.blockType === 'featureCards')
  const sliderBlock = freshLayout.find((b) => b.blockType === 'onlineCourseSlider')

  const enLayout = [
    {
      ...featureCardsEn,
      id: featureCardsBlock?.id,
      cards: featureCardsEn.cards.map((card, i) => ({
        ...card,
        id: featureCardsBlock?.cards?.[i]?.id,
      })),
    },
    {
      ...onlineCourseSliderEn,
      id: sliderBlock?.id,
    },
  ]

  // 4. Save EN
  payload.logger.info('📄 Saving courses page layout (EN)...')
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    data: {
      title: 'Online Courses',
      layout: enLayout,
    },
    context: ctx,
  })

  payload.logger.info('✅ Courses page seeded with %d blocks', enLayout.length)
  process.exit(0)
}

seedCoursesPage()
