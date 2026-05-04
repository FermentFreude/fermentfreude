/**
 * Courses page seed — sets up the "courses" page with layout blocks.
 *
 * Layout blocks:
 *   1. FeatureCards — "What You'll Learn" (6 cards)
 *   2. OnlineCourseSlider — fetches from OnlineCourses collection
 *   3. CourseWaitlistCta — email waitlist below course modules (+ optional image from
 *      public/assets/images/courses/course-waitlist-ingredients.png → Media / R2)
 *
 * The courses page hero is baked into the page template (3 rotated image cards).
 * The OnlineCourseSlider block handles both active and coming-soon courses.
 *
 * Non-destructive: skips if page layout already has blocks. Use --force to overwrite.
 * Bilingual: DE first → read IDs → EN with same IDs.
 *
 * Run: pnpm seed courses-page
 */

import type { Media } from '@/payload-types'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

/** Committed asset → Payload Media (R2). Same file for DE/EN block locale fields. */
const COURSE_WAITLIST_IMAGE_PATH = path.resolve(
  process.cwd(),
  'public/assets/images/courses/course-waitlist-ingredients.png',
)

async function ensureCourseWaitlistSeedImage(payload: Awaited<ReturnType<typeof getPayload>>) {
  if (!fs.existsSync(COURSE_WAITLIST_IMAGE_PATH)) {
    payload.logger.warn(
      'Course waitlist image not found at %s — block will have no image until you add the file or upload in admin.',
      COURSE_WAITLIST_IMAGE_PATH,
    )
    return undefined
  }

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { contains: 'course-waitlist-ingredients' } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    payload.logger.info('📸 Reusing Media for course waitlist: %s', existing.docs[0].id)
    return String(existing.docs[0].id)
  }

  const created = (await payload.create({
    collection: 'media',
    locale: 'de',
    data: {
      alt: 'Kleine Schüsseln mit fermentiertem Gemüse, Kimchi, Karotten und Kräutern von oben',
    },
    file: await optimizedFile(COURSE_WAITLIST_IMAGE_PATH, IMAGE_PRESETS.card),
    context: ctx,
  })) as Media

  await payload.update({
    collection: 'media',
    id: created.id,
    locale: 'en',
    data: {
      alt: 'Overhead view of small bowls with fermented vegetables, kimchi, carrots, and herbs',
    },
    context: ctx,
  })

  payload.logger.info('📸 Uploaded course waitlist image → Media %s', created.id)
  return String(created.id)
}

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

const courseWaitlistCtaDe = {
  blockType: 'courseWaitlistCta' as const,
  heading: 'Lerne Fermentation ohne Unsicherheit',
  description:
    'Trag dich auf die Warteliste ein und erfahre als Erste:r, wenn der Kurs startet.\n\nDu bekommst außerdem die Möglichkeit auf einen vergünstigten Einstieg und exklusive Einblicke vorab.',
  emailPlaceholder: 'Deine E-Mail-Adresse',
  submitLabel: 'Auf Warteliste setzen',
  successMessage:
    'Danke! Wenn sich dein E-Mail-Programm geöffnet hat, sende die Nachricht ab. Sonst schreibe an kontakt@fermentfreude.at.',
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

const courseWaitlistCtaEn = {
  blockType: 'courseWaitlistCta' as const,
  heading: 'Learn fermentation without uncertainty',
  description:
    'Join the waitlist and be the first to know when the course launches.\n\nYou will also get access to a discounted entry and exclusive previews.',
  emailPlaceholder: 'Your email address',
  submitLabel: 'Join the waitlist',
  successMessage:
    'Thanks! If your email app opened, send the message to join the waitlist. Otherwise email kontakt@fermentfreude.at.',
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

  const waitlistImageId = await ensureCourseWaitlistSeedImage(payload)

  const waitlistDe = {
    ...courseWaitlistCtaDe,
    ...(waitlistImageId ? { image: waitlistImageId } : {}),
  }

  // 1. Save DE layout
  payload.logger.info('📄 Saving courses page layout (DE)...')
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    data: {
      title: 'Online Kurse',
      layout: [featureCardsDe, onlineCourseSliderDe, waitlistDe],
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
  const waitlistBlock = freshLayout.find((b) => b.blockType === 'courseWaitlistCta')

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
    {
      ...courseWaitlistCtaEn,
      id: waitlistBlock?.id,
      ...(waitlistImageId ? { image: waitlistImageId } : {}),
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
