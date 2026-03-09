/**
 * Seed Kombucha Workshop Page Data
 *
 * Populates the workshopDetail section with experienceCards + images.
 * Seeds both DE (German) and EN (English) with proper ID reuse.
 *
 * Run:  pnpm seed kombucha
 *       pnpm seed kombucha --force   (overwrite existing content)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const isForce = process.argv.includes('--force')

// ═════════════════════════════════════════════════════════════
//  GERMAN (DE) — Kombucha Workshop Details with Experience Cards
// ═════════════════════════════════════════════════════════════

const kombucha_DE = {
  // Hero
  heroEyebrow: 'KOMBUCHA-WORKSHOP',
  heroTitle: 'Fermentiere deinen eigenen Kombucha',
  heroDescription:
    'Lerne die Kunst der Kombucha-Fermentation von Grund auf. In 3 Stunden wirst du eine lebendige SCOBY-Kultur erschaffen und deine erste Charge brauen.',

  // Booking Card
  bookingEyebrow: 'KOMBUCHA-WORKSHOP BUCHEN',
  bookingPrice: 79,
  bookingPriceSuffix: 'pro Teilnehmer',
  bookingCurrency: '€',
  bookingViewDatesLabel: 'Verfügbare Termine anzeigen',
  bookingHideDatesLabel: 'Termine ausblenden',
  bookingMoreDetailsLabel: 'Mehr Details',
  bookingBookLabel: 'Jetzt buchen',
  bookingSpotsLabel: 'Plätze frei',

  // About
  aboutHeading: 'Über den Workshop',
  aboutText:
    'Kombucha ist mehr als ein trendy Getränk — es ist eine jahrhundertealte Fermentations-Tradition, die Gesundheit und Geschmack vereint. In diesem Workshop tauchen wir tief in die Wissenschaft hinter SCOBY ein und brauen gemeinsam deine erste probiotische Charge von Grund auf.',

  // Schedule
  scheduleHeading: 'Ablauf des Workshops',
  schedule: [
    {
      duration: '0–15 Min',
      title: 'Willkommen & Grundlagen',
      description: 'Treffen, Übersicht des Ablaufs, Einführung in SCOBY und probiotische Kulturen.',
    },
    {
      duration: '15–75 Min',
      title: 'Theorie & Praxis',
      description:
        'Verstehe die Mikrobiologie, lerne die richtige Temperatur, infiziere dein erstes Gebräu.',
    },
    {
      duration: '75–165 Min',
      title: 'Brauen & Verkostung',
      description:
        'Brau deine Charge mit einer echten SCOBY. Verkoste fertige Sorten und Variationen.',
    },
    {
      duration: '165–180 Min',
      title: 'Mitnehmen & Support',
      description:
        'Bekomme eine SCOBY-Starterkultur, Pflegeanleitung und Links für lebenslanges Coaching.',
    },
  ],

  // Included
  includedHeading: "Was's im Preis enthalten",
  includedItems: [
    { text: 'Premium-Schwarztee & Quellwasser' },
    { text: 'SCOBY-Starterkultur zum Mitnehmen' },
    { text: 'Alle Brew-Ausrüstung & Flaschen' },
    { text: 'Rezeptkarten & Pflegeanleitung' },
    { text: 'Verkostung von fertigem Kombucha' },
    { text: 'Lebenslange Support per E-Mail' },
  ],

  // Why
  whyHeading: 'Warum dieser Workshop?',
  whyPoints: [
    {
      bold: 'Gesundheitsbewusster Lebensstil',
      rest: ' Fermentiere deine eigenen Probiotika statt teure Flaschen zu kaufen.',
    },
    {
      bold: 'Kosteneffektiv',
      rest: ' Eine SCOBY-Charge kostet 0,30 € nach der ersten Investition — viel günstiger als gekaufte Sorten.',
    },
    {
      bold: 'DIY-Vertrauen',
      rest: ' Fermentation wird zur zweiten Natur. Die Kombucha-Welt wird dir nie gleich erscheinen.',
    },
    {
      bold: 'Geschmacksfreiheit',
      rest: ' Kreiere deinen Traum-Kombucha — Passionsfruchthybiskus, würzige Zitrone, was auch immer dir gefällt.',
    },
  ],

  // Experience Cards (WAS DICH ERWARTET — 3 phases with images)
  experienceEyebrow: 'WAS DICH ERWARTET',
  experienceTitle: 'Dein Workshop-Erlebnis',
  experienceCards: [
    {
      eyebrow: 'THEORIE',
      title: 'Kombucha-Mikrobiologie',
      description:
        'Entdecke die Wissenschaft hinter Kombucha. Lerne, wie Bakterien und Hefen zusammenarbeiten, warum eine SCOBY so wertvoll ist, und welche Vorteile probiotische Getränke bieten.',
      image: 'FF-Vorschau-90',
    },
    {
      eyebrow: 'PRAXIS',
      title: 'Dein Kombucha brauen',
      description:
        'Unter fachkundiger Anleitung stellst du deine erste Charge Kombucha her. Mit einer frischen SCOBY und hochwertigen Zutaten kreierst du einen lebendigen Ferment zum Mitnehmen.',
      image: 'FF-Vorschau-62',
    },
    {
      eyebrow: 'GESCHMACK',
      title: 'Kreative Variationen',
      description:
        'Erkunde unzählige Geschmackskombinationen — von fruchtigen Varianten bis zu würzigen Experimenten. Verkoste verschiedene Variationen und finde deine Lieblingskombination.',
      image: '_H8A5827',
    },
  ],

  // Dates
  datesHeading: 'Verfügbare Termine',

  // Modal
  modalConfirmHeading: 'Buchung bestätigt!',
  modalConfirmSubheading: 'Du bist angemeldet für:',
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Datum',
  modalTimeLabel: 'Uhrzeit',
  modalTotalLabel: 'Gesamt',
  modalCancelLabel: 'Zurück',
  modalConfirmLabel: 'Buchung bestätigen',
}

// ═════════════════════════════════════════════════════════════
//  ENGLISH (EN) — Kombucha Workshop Details with Experience Cards
// ═════════════════════════════════════════════════════════════

const kombucha_EN = {
  // Hero
  heroEyebrow: 'KOMBUCHA WORKSHOP',
  heroTitle: 'Brew Your Own Kombucha',
  heroDescription:
    "Learn kombucha fermentation from scratch. In 3 hours, you'll create a living SCOBY culture and brew your first batch.",

  // Booking Card
  bookingEyebrow: 'KOMBUCHA WORKSHOP',
  bookingPrice: 79,
  bookingPriceSuffix: 'per participant',
  bookingCurrency: '€',
  bookingViewDatesLabel: 'Show available dates',
  bookingHideDatesLabel: 'Hide dates',
  bookingMoreDetailsLabel: 'More details',
  bookingBookLabel: 'Book now',
  bookingSpotsLabel: 'spots available',

  // About
  aboutHeading: 'About the workshop',
  aboutText:
    "Kombucha is more than a trendy drink—it's a centuries-old fermentation tradition that combines health and flavor. In this workshop, we dive deep into the science behind SCOBY and brew your first probiotic batch from the ground up.",

  // Schedule
  scheduleHeading: 'Workshop Schedule',
  schedule: [
    {
      duration: '0–15 min',
      title: 'Welcome & Fundamentals',
      description: 'Meet, overview the process, introduction to SCOBY and probiotic cultures.',
    },
    {
      duration: '15–75 min',
      title: 'Theory & Practice',
      description: 'Understand microbiology, learn proper temperature, inoculate your first batch.',
    },
    {
      duration: '75–165 min',
      title: 'Brewing & Tasting',
      description:
        'Brew your batch with a real SCOBY. Taste finished varieties and creative variations.',
    },
    {
      duration: '165–180 min',
      title: 'Take-Home & Support',
      description:
        'Get a SCOBY starter culture, care instructions, and links for lifetime coaching.',
    },
  ],

  // Included
  includedHeading: "What's included",
  includedItems: [
    { text: 'Premium black tea & spring water' },
    { text: 'SCOBY starter culture to take home' },
    { text: 'All brewing equipment & bottles' },
    { text: 'Recipe cards & care guide' },
    { text: 'Tasting of finished kombucha' },
    { text: 'Lifetime email support' },
  ],

  // Why
  whyHeading: 'Why this workshop?',
  whyPoints: [
    {
      bold: 'Health-conscious lifestyle',
      rest: ' Ferment your own probiotics instead of buying expensive bottles.',
    },
    {
      bold: 'Cost-effective',
      rest: ' One SCOBY batch costs €0.30 after initial investment—much cheaper than store-bought.',
    },
    {
      bold: 'DIY confidence',
      rest: ' Fermentation becomes second nature. The kombucha world will never be the same.',
    },
    {
      bold: 'Flavor freedom',
      rest: ' Create your dream kombucha—passionfruit hibiscus, spicy lemon, whatever you like.',
    },
  ],

  // Experience Cards (3 phases with images)
  experienceEyebrow: 'WHAT TO EXPECT',
  experienceTitle: 'Your Workshop Experience',
  experienceCards: [
    {
      eyebrow: 'THEORY',
      title: 'Kombucha Microbiology',
      description:
        'Discover the science behind kombucha. Learn how bacteria and yeasts work together, why a SCOBY is so valuable, and what benefits probiotic drinks offer.',
      image: 'FF-Vorschau-90',
    },
    {
      eyebrow: 'PRACTICE',
      title: 'Brew Your Kombucha',
      description:
        "Under expert guidance, brew your first batch of kombucha. With a fresh SCOBY and quality ingredients, you\'ll create a living ferment to take home.",
      image: 'FF-Vorschau-62',
    },
    {
      eyebrow: 'FLAVOR',
      title: 'Creative Variations',
      description:
        'Explore endless flavor possibilities—from fruity variations to spicy experiments. Taste different options and discover your favorite combination.',
      image: '_H8A5827',
    },
  ],

  // Dates
  datesHeading: 'Available dates',

  // Modal
  modalConfirmHeading: 'Booking confirmed!',
  modalConfirmSubheading: "You're registered for:",
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Date',
  modalTimeLabel: 'Time',
  modalTotalLabel: 'Total',
  modalCancelLabel: 'Back',
  modalConfirmLabel: 'Confirm booking',
}

// ═════════════════════════════════════════════════════════════
//  SEED FUNCTION
// ═════════════════════════════════════════════════════════════

async function seedKombucha() {
  try {
    const payload = await getPayload({ config })

    const pageSlug = 'kombucha'

    // 0. Non-destructive check — skip if page already has content
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: pageSlug } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length === 0) {
      payload.logger.error(`❌ Page "${pageSlug}" not found. Create it first in admin.`)
      process.exit(1)
    }

    const page = existing.docs[0]

    // Check if workshopDetail already exists
    if (!isForce && page.workshopDetail) {
      const hasExperienceCards = page.workshopDetail.experienceCards?.length ?? 0
      if (hasExperienceCards > 0) {
        payload.logger.info(
          '⏭️  Page already has experienceCards. Skipping. Use --force to overwrite.',
        )
        process.exit(0)
      }
    }

    const pageId = page.id as string

    // 1. SEED GERMAN (DE) ─────────────────────────────
    console.log(`[${new Date().toLocaleTimeString()}] Seeding "${pageSlug}" workshopDetail (DE)...`)

    // Prepare experience cards with resolved media IDs
    const deExperienceCards = kombucha_DE.experienceCards.map((card) => ({
      ...card,
      image: undefined, // Will add after upload
    }))

    const deSaveData = { ...kombucha_DE, experienceCards: deExperienceCards }

    const _deSaved = await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      data: { workshopDetail: deSaveData },
      context: ctx,
    })

    // 2. UPLOAD IMAGES & LINK THEM ──────────────────────
    console.log(
      `[${new Date().toLocaleTimeString()}] Uploading experience card images and linking...`,
    )

    const deDoc = await payload.findByID({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      depth: 0,
    })

    const deExperienceCardsWithIds = await Promise.all(
      (deDoc.workshopDetail?.experienceCards ?? []).map(async (card, _idx) => {
        // Map filename to actual media IDs (needs to exist in Media collection)
        let mediaId = null
        if (card.image === 'FF-Vorschau-90') {
          // Find media by filename
          const mediaResult = await payload.find({
            collection: 'media',
            where: { filename: { equals: 'FF-Vorschau-90.webp' } },
            limit: 1,
          })
          mediaId = mediaResult.docs[0]?.id ?? null
        } else if (card.image === 'FF-Vorschau-62') {
          const mediaResult = await payload.find({
            collection: 'media',
            where: { filename: { equals: 'FF-Vorschau-62.webp' } },
            limit: 1,
          })
          mediaId = mediaResult.docs[0]?.id ?? null
        } else if (card.image === '_H8A5827') {
          const mediaResult = await payload.find({
            collection: 'media',
            where: { filename: { contains: '_H8A5827' } },
            limit: 1,
          })
          mediaId = mediaResult.docs[0]?.id ?? null
        }

        return {
          ...card,
          image: mediaId || null,
        }
      }),
    )

    // 3. SAVE DE WITH MEDIA IDS ─────────────────────────
    const deFullData = { ...deSaveData, experienceCards: deExperienceCardsWithIds }
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      data: { workshopDetail: deFullData },
      context: ctx,
    })

    console.log(`✓ German workshopDetail seeded with images`)

    // 4. SEED ENGLISH (EN) — REUSE MEDIA IDS ─────────────
    console.log(`[${new Date().toLocaleTimeString()}] Seeding "${pageSlug}" workshopDetail (EN)...`)

    // Match images by index and use the same media IDs
    const enExperienceCards = kombucha_EN.experienceCards.map((card, idx) => ({
      ...card,
      image: deExperienceCardsWithIds[idx]?.image ?? null,
    }))

    const enSaveData = { ...kombucha_EN, experienceCards: enExperienceCards }

    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'en',
      data: { workshopDetail: enSaveData },
      context: ctx,
    })

    console.log(`✓ English workshopDetail seeded (images reused from DE)`)

    payload.logger.info(`✅ Successfully seeded Kombucha workshopDetail (DE + EN)!`)
    process.exit(0)
  } catch (error) {
    console.error(`❌ Error seeding Kombucha:`, error)
    process.exit(1)
  }
}

seedKombucha()
