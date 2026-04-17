/**
 * Seed globals with bilingual content (DE + EN).
 *
 * NON-DESTRUCTIVE by default:
 * - Only creates globals that don't exist in DB yet
 * - Only fills EMPTY fields on existing globals (footer)
 * - Never overwrites existing production data
 * - Use --force to overwrite everything
 *
 * Populates: Footer (empty fields only), VoucherCTA, WorkshopSlider,
 * ProductSlider, WorkshopCards.
 * Skips: Header (separate script), Testimonials & SponsorsBar (already populated).
 *
 * Run:  pnpm seed globals
 * Or:   npx tsx src/scripts/seed-globals.ts
 * Force: pnpm seed globals --force
 */
import type {
  Footer,
  SponsorsBarGlobal,
  TestimonialsGlobal,
  VoucherCtaGlobal,
  WorkshopCardsGlobal,
  WorkshopSliderGlobal,
} from '@/payload-types'
import config from '@payload-config'
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

loadEnv()

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const force = process.argv.includes('--force')

// ═══════════════════════════════════════════════════════════════════════
// Helper: find media by filename
// ═══════════════════════════════════════════════════════════════════════

async function findMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
): Promise<string | undefined> {
  const result = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0]?.id || undefined
}

// ═══════════════════════════════════════════════════════════════════════
// Helper: check if a global has data
// ═══════════════════════════════════════════════════════════════════════

async function globalHasData(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  checkField: string,
): Promise<boolean> {
  try {
    const doc = await payload.findGlobal({ slug: slug as 'footer', locale: 'de', depth: 0 })
    const val = (doc as unknown as Record<string, unknown>)[checkField]
    if (Array.isArray(val)) return val.length > 0
    return Boolean(val)
  } catch {
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 1. FOOTER — only fill empty fields, never overwrite existing data
// ═══════════════════════════════════════════════════════════════════════

async function seedFooter(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('\n── Footer ──')

  // Read current footer data
  let existing: Footer
  try {
    existing = (await payload.findGlobal({ slug: 'footer', locale: 'de', depth: 0 })) as Footer
  } catch {
    existing = {} as Footer
  }

  // Check which fields are empty
  const hasNewsletter = Boolean(existing.newsletterHeading)
  const hasNavItems = (existing.navItems ?? []).length > 0
  const hasWorkshopLinks = (existing.workshopLinks ?? []).length > 0
  const hasLegalLinks = (existing.legalLinks ?? []).length > 0
  const hasCopyright = Boolean(existing.copyrightText)
  const hasAccentColor = Boolean(existing.accentColor)

  if (
    !force &&
    hasNewsletter &&
    hasNavItems &&
    hasWorkshopLinks &&
    hasLegalLinks &&
    hasCopyright &&
    hasAccentColor
  ) {
    console.log('  ⏭ Footer already has data — skipping (use --force to overwrite)')
    return
  }

  // Build DE data: only set fields that are currently empty
  const deData: Record<string, unknown> = {}
  const enData: Record<string, unknown> = {}

  if (force || !hasNewsletter) {
    deData.newsletterHeading = 'Werde Teil der FermentFreude Bewegung'
    deData.freeRecipesLabel = 'Kostenlose Workshop-Rezepte'
    enData.newsletterHeading = 'Join the FermentFreude Movement'
    enData.freeRecipesLabel = 'Free Workshop Recipes'
    console.log('  + Newsletter fields')
  }

  if (force || !Boolean(existing.quickLinksHeading)) {
    deData.quickLinksHeading = 'Schnellzugriff'
    deData.workshopsHeading = 'Workshops'
    deData.legalHeading = 'Rechtliches'
    deData.followUsHeading = 'Folge uns'
    enData.quickLinksHeading = 'Quick Links'
    enData.workshopsHeading = 'Workshops'
    enData.legalHeading = 'Legal Info'
    enData.followUsHeading = 'Follow Us'
    console.log('  + Section headings')
  }

  if (force || !hasCopyright) {
    deData.copyrightText = 'FermentFreude — Alle Rechte vorbehalten'
    enData.copyrightText = 'FermentFreude — All Rights Reserved'
    console.log('  + Copyright text')
  }

  if (force || !hasAccentColor) {
    deData.accentColor = '#e6be68'
    console.log('  + Accent color')
  }

  if (force || !hasNavItems) {
    deData.navItems = [
      { link: { type: 'custom', url: '/', label: 'Startseite' } },
      { link: { type: 'custom', url: '/shop', label: 'Shop' } },
      { link: { type: 'custom', url: '/gastronomy', label: 'Für Gastronomen' } },
      { link: { type: 'custom', url: '/about', label: 'Über uns' } },
      { link: { type: 'custom', url: '/contact', label: 'Kontakt' } },
    ]
    console.log('  + Quick links (5)')
  }

  if (force || !hasWorkshopLinks) {
    deData.workshopLinks = [
      { link: { type: 'custom', url: '/workshops/lakto-gemuese', label: 'Lakto-Gemüse' } },
      { link: { type: 'custom', url: '/workshops/tempeh', label: 'Tempeh' } },
      { link: { type: 'custom', url: '/workshops/kombucha', label: 'Kombucha' } },
      { link: { type: 'custom', url: '/workshops/voucher', label: 'Gutschein' } },
    ]
    console.log('  + Workshop links (4)')
  }

  if (force || !hasLegalLinks) {
    deData.legalLinks = [
      { link: { type: 'custom', url: '/datenschutz', label: 'Datenschutz' } },
      { link: { type: 'custom', url: '/agb', label: 'AGB' } },
      { link: { type: 'custom', url: '/impressum', label: 'Impressum' } },
    ]
    console.log('  + Legal links (3)')
  }

  if (force || !Boolean(existing.location)) {
    deData.location = 'Grabenstraße 15\n8010 Graz, Österreich'
    enData.location = 'Grabenstraße 15\n8010 Graz, Austria'
    console.log('  + Location')
  }

  if (force || !Boolean(existing.phone)) {
    deData.phone = '+43 664 1234567'
    enData.phone = '+43 664 1234567'
    console.log('  + Phone')
  }

  // Don't touch socialMedia if it already has instagram
  if (force || !Boolean(existing.socialMedia?.instagram)) {
    deData.socialMedia = {
      instagram: 'https://www.instagram.com/fermentfreude/',
      facebook: 'https://www.facebook.com/fermentfreude/',
      linkedin: '',
    }
    enData.socialMedia = deData.socialMedia
    console.log('  + Social media')
  }

  if (Object.keys(deData).length === 0) {
    console.log('  ⏭ Nothing to update')
    return
  }

  // Save DE
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'de',
    context: ctx,
    data: deData as Partial<Footer>,
  })

  // Read back to capture generated array IDs
  const saved = (await payload.findGlobal({ slug: 'footer', locale: 'de', depth: 0 })) as Footer

  // Build EN data with matching array IDs
  if (deData.navItems) {
    const ids = (saved.navItems ?? []).map((i) => i.id)
    enData.navItems = [
      { id: ids[0], link: { type: 'custom', url: '/', label: 'Home' } },
      { id: ids[1], link: { type: 'custom', url: '/shop', label: 'Shop' } },
      { id: ids[2], link: { type: 'custom', url: '/gastronomy', label: 'For Chefs' } },
      { id: ids[3], link: { type: 'custom', url: '/about', label: 'About Us' } },
      { id: ids[4], link: { type: 'custom', url: '/contact', label: 'Contact' } },
    ]
  }

  if (deData.workshopLinks) {
    const ids = (saved.workshopLinks ?? []).map((i) => i.id)
    enData.workshopLinks = [
      {
        id: ids[0],
        link: { type: 'custom', url: '/workshops/lakto-gemuese', label: 'Lacto Vegetables' },
      },
      { id: ids[1], link: { type: 'custom', url: '/workshops/tempeh', label: 'Tempeh' } },
      { id: ids[2], link: { type: 'custom', url: '/workshops/kombucha', label: 'Kombucha' } },
      {
        id: ids[3],
        link: { type: 'custom', url: '/workshops/voucher', label: 'Gift Voucher' },
      },
    ]
  }

  if (deData.legalLinks) {
    const ids = (saved.legalLinks ?? []).map((i) => i.id)
    enData.legalLinks = [
      { id: ids[0], link: { type: 'custom', url: '/datenschutz', label: 'Privacy Policy' } },
      { id: ids[1], link: { type: 'custom', url: '/agb', label: 'Terms & Conditions' } },
      { id: ids[2], link: { type: 'custom', url: '/impressum', label: 'Imprint' } },
    ]
  }

  // Save EN
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    context: ctx,
    data: enData as Partial<Footer>,
  })

  console.log('✅ Footer updated (empty fields filled, DE + EN)')
}

// ═══════════════════════════════════════════════════════════════════════
// 2. TESTIMONIALS — SKIPPED (already populated in production)
// ═══════════════════════════════════════════════════════════════════════

async function seedTestimonials(payload: Awaited<ReturnType<typeof getPayload>>) {
  const hasData = await globalHasData(payload, 'testimonials-global', 'testimonials')
  if (hasData && !force) {
    console.log('\n── Testimonials ──')
    console.log('  ⏭ Already has 6 testimonials — skipping (use --force to overwrite)')
    return
  }

  console.log('\n── Testimonials (DE) ──')

  await payload.updateGlobal({
    slug: 'testimonials-global',
    locale: 'de',
    context: ctx,
    data: {
      eyebrow: 'Testimonials',
      heading: 'Was gefällt',
      testimonials: [
        {
          quote:
            'Das Kursangebot besuchen zu können, war eines der besten Geburtstagsgeschenke, die ich mir denken kann. Es war wunderbar zu sehen, wie Marcel seine Leidenschaft für Fermentation mit den Teilnehmern teilt. Und das Beste ist: Es öffnet mir eine ganz neue kulinarische Welt.',
          authorName: 'Ernst Michael Preininger',
          authorRole: 'Workshop Teilnehmer',
          rating: 5,
        },
        {
          quote:
            'Ein sehr empfehlenswerter Workshop, sowohl für Anfänger als auch für Erfahrene. Marcel vermittelt die faszinierenden Techniken mit Leidenschaft für das Thema, detaillierten aber nicht langweiligen Erklärungen und einer guten Portion Humor. Das Highlight war definitiv die ausgezeichnete Verkostung.',
          authorName: 'Mme Kuchar',
          authorRole: 'Workshop Teilnehmerin',
          rating: 5,
        },
        {
          quote:
            'Marcel und David sind unglaublich freundliche Menschen, die gerne ihr Wissen in verschiedenen Workshops teilen. Der Kombucha-Workshop war die perfekte Einführung in die faszinierende Welt der Kombucha! Ich empfehle es jedem sehr, der sich für Fermentation interessiert!',
          authorName: 'Vera Wagner',
          authorRole: 'Workshop Teilnehmerin',
          rating: 5,
        },
        {
          quote:
            'Ich habe meinen Geburtstag bei Ferment-Freude gefeiert. Es war riesig Spaß, und David hat uns den Nachmittag wunderbar geleitet. Wir haben sofort alle technischen Informationen in die Praxis umgesetzt. Sehr empfehlenswert für alle, die einen coolen Nachmittag oder etwas zum Feiern möchten!',
          authorName: 'Andi Wind',
          authorRole: 'Workshop Teilnehmer',
          rating: 5,
        },
        {
          quote:
            'Sehr informative Workshops von einem ausgebildeten Koch mit Leidenschaft für Fermentation, mit viel praktischer Erfahrung und großartigen selbstgemachten Geschenken zum Mitnehmen. Die danach verkosteten selbst fermentierten Produkte sind köstlich! Der nächste Workshop ist bereits gebucht.',
          authorName: 'Jorche Kanipcki',
          authorRole: 'Workshop Teilnehmer',
          rating: 5,
        },
        {
          quote:
            'Wir hatten einen wunderschönen Abend beim Tempeh-Workshop. Wir haben viel gelernt und die Verkostung der verschiedenen fermentierten Lebensmittel war ein kulinarischer Höhepunkt.',
          authorName: 'Marlies Kern',
          authorRole: 'Workshop Teilnehmerin',
          rating: 5,
        },
      ],
    },
  })

  const saved = (await payload.findGlobal({
    slug: 'testimonials-global',
    locale: 'de',
    depth: 0,
  })) as TestimonialsGlobal

  const ids = (saved.testimonials ?? []).map((t) => t.id)

  console.log('── Testimonials (EN) ──')

  await payload.updateGlobal({
    slug: 'testimonials-global',
    locale: 'en',
    context: ctx,
    data: {
      eyebrow: 'Testimonials',
      heading: 'What Our Community Says',
      testimonials: [
        {
          id: ids[0],
          quote:
            'Being able to attend the course was one of the best birthday presents I can remember. It was wonderful to see Marcel share his passion for fermentation with the participants. And the best part is: it opens up a whole new culinary world for me.',
          authorName: 'Ernst Michael Preininger',
          authorRole: 'Workshop Participant',
          rating: 5,
        },
        {
          id: ids[1],
          quote:
            'A highly recommended workshop, both for beginners and those with some experience. Marcel conveys the fascinating techniques with a passion for the subject, detailed but not boring explanations, and a good dose of humor. The highlight was definitely the excellent tasting.',
          authorName: 'Mme Kuchar',
          authorRole: 'Workshop Participant',
          rating: 5,
        },
        {
          id: ids[2],
          quote:
            'Marcel and David are incredibly kind people who genuinely enjoy sharing their knowledge in various workshops. The kombucha workshop was the perfect introduction to the fascinating world of kombucha! I highly recommend it to anyone interested in fermentation!',
          authorName: 'Vera Wagner',
          authorRole: 'Workshop Participant',
          rating: 5,
        },
        {
          id: ids[3],
          quote:
            'I celebrated my birthday at Ferment-Freude. It was super fun, and David did a fantastic job guiding us through the afternoon. We immediately put all the technical information into practice. Highly recommended for anyone who wants a cool afternoon or has something to celebrate!',
          authorName: 'Andi Wind',
          authorRole: 'Workshop Participant',
          rating: 5,
        },
        {
          id: ids[4],
          quote:
            'Very informative workshops from a trained chef with a passion for fermentation, with plenty of practical experience and great homemade gifts to take home. The homemade fermented products tasted afterward are exquisite! The next workshop is already booked.',
          authorName: 'Jorche Kanipcki',
          authorRole: 'Workshop Participant',
          rating: 5,
        },
        {
          id: ids[5],
          quote:
            'We had a wonderful evening at the Tempeh workshop. We learned a lot and the tasting of the different fermented foods was a culinary highlight.',
          authorName: 'Marlies Kern',
          authorRole: 'Workshop Participant',
          rating: 5,
        },
      ],
    },
  })

  console.log('✅ Testimonials seeded (DE + EN)')
}

// ═══════════════════════════════════════════════════════════════════════
// 3. SPONSORS BAR — SKIPPED (already populated in production)
// ═══════════════════════════════════════════════════════════════════════

async function seedSponsorsBar(payload: Awaited<ReturnType<typeof getPayload>>) {
  const hasData = await globalHasData(payload, 'sponsors-bar-global', 'heading')
  if (hasData && !force) {
    console.log('\n── Sponsors Bar ──')
    console.log('  ⏭ Already has data — skipping (use --force to overwrite)')
    return
  }

  console.log('\n── Sponsors Bar (DE) ──')

  // Look for any existing sponsor logos in media
  const existingLogos = await payload.find({
    collection: 'media',
    where: {
      alt: { contains: 'sponsor' },
    },
    limit: 10,
    depth: 0,
  })

  const logoIds = existingLogos.docs.map((d) => d.id)

  // Build sponsors array with any existing logos
  const sponsors =
    logoIds.length > 0
      ? logoIds.map((id, i) => ({
          name: existingLogos.docs[i]?.alt?.replace(/^sponsor-?\s*/i, '') || `Partner ${i + 1}`,
          logo: id,
          url: '',
        }))
      : []

  await payload.updateGlobal({
    slug: 'sponsors-bar-global',
    locale: 'de',
    context: ctx,
    data: {
      heading: 'Dieses Projekt wird unterstützt von:',
      sponsors,
    },
  })

  const saved = (await payload.findGlobal({
    slug: 'sponsors-bar-global',
    locale: 'de',
    depth: 0,
  })) as SponsorsBarGlobal

  const sponsorIds = (saved.sponsors ?? []).map((s) => s.id)

  console.log('── Sponsors Bar (EN) ──')

  await payload.updateGlobal({
    slug: 'sponsors-bar-global',
    locale: 'en',
    context: ctx,
    data: {
      heading: 'This project is supported by:',
      sponsors: sponsors.map((s, i) => ({ ...s, id: sponsorIds[i] })),
    },
  })

  console.log(
    `✅ Sponsors Bar seeded (DE + EN) — ${sponsors.length} sponsors${sponsors.length === 0 ? ' (upload logos in /admin)' : ''}`,
  )
}

// ═══════════════════════════════════════════════════════════════════════
// 4. VOUCHER CTA — creates if missing, skips if exists
// ═══════════════════════════════════════════════════════════════════════

async function seedVoucherCta(payload: Awaited<ReturnType<typeof getPayload>>) {
  const hasData = await globalHasData(payload, 'voucher-cta-global', 'title')
  if (hasData && !force) {
    console.log('\n── Voucher CTA ──')
    console.log('  ⏭ Already has data — skipping (use --force to overwrite)')
    return
  }

  console.log('\n── Voucher CTA (DE) ──')

  // Look for background image
  const bgMedia = await payload.find({
    collection: 'media',
    where: {
      alt: { contains: 'voucher-bg' },
    },
    limit: 1,
    depth: 0,
  })

  const backgroundImage = bgMedia.docs[0]?.id || undefined

  await payload.updateGlobal({
    slug: 'voucher-cta-global',
    locale: 'de',
    context: ctx,
    data: {
      eyebrow: 'GEMEINSAM FERMENTIEREN',
      title: 'Go with a friend.',
      description:
        'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und neugierige Köpfe.',
      primaryLabel: 'Gutschein kaufen',
      primaryHref: '/voucher',
      secondaryLabel: 'Zum Shop',
      secondaryHref: '/shop',
      pills: [
        { text: 'Sofort einlösbar' },
        { text: 'Für alle Workshops' },
        { text: 'Digital oder gedruckt' },
      ],
      ...(backgroundImage ? { backgroundImage } : {}),
    },
  })

  const saved = (await payload.findGlobal({
    slug: 'voucher-cta-global',
    locale: 'de',
    depth: 0,
  })) as VoucherCtaGlobal

  const pillIds = (saved.pills ?? []).map((p) => p.id)

  console.log('── Voucher CTA (EN) ──')

  await payload.updateGlobal({
    slug: 'voucher-cta-global',
    locale: 'en',
    context: ctx,
    data: {
      eyebrow: 'FERMENT TOGETHER',
      title: 'Go with a friend.',
      description:
        'Gift someone a special experience — our vouchers are the perfect gift for foodies and curious minds.',
      primaryLabel: 'Buy Voucher',
      primaryHref: '/voucher',
      secondaryLabel: 'Visit Shop',
      secondaryHref: '/shop',
      pills: [
        { text: 'Instantly redeemable', id: pillIds[0] },
        { text: 'For all workshops', id: pillIds[1] },
        { text: 'Digital or printed', id: pillIds[2] },
      ],
      ...(backgroundImage ? { backgroundImage } : {}),
    },
  })

  console.log(
    `✅ Voucher CTA seeded (DE + EN)${!backgroundImage ? ' (no background image found)' : ''}`,
  )
}

// ═══════════════════════════════════════════════════════════════════════
// 5. WORKSHOP SLIDER — creates if missing, skips if exists
// ═══════════════════════════════════════════════════════════════════════

async function seedWorkshopSlider(payload: Awaited<ReturnType<typeof getPayload>>) {
  const hasData = await globalHasData(payload, 'workshop-slider-global', 'workshops')
  if (hasData && !force) {
    console.log('\n── Workshop Slider ──')
    console.log('  ⏭ Already has data — skipping (use --force to overwrite)')
    return
  }

  console.log('\n── Workshop Slider (DE) ──')

  // Look for existing workshop images by specific filenames
  const laktoImg =
    (await findMedia(payload, 'lakto-45.webp')) || (await findMedia(payload, 'lakto-2.webp'))
  const laktoImg2 =
    (await findMedia(payload, 'lakto1-3.webp')) || (await findMedia(payload, 'lakto-3.webp'))
  const kombuchaImg =
    (await findMedia(payload, 'kombucha-39.webp')) || (await findMedia(payload, 'kombucha-1.webp'))
  const kombuchaImg2 =
    (await findMedia(payload, 'kombucha1-3.webp')) ||
    (await findMedia(payload, 'kombuchaworkshop1.webp'))
  const tempehImg =
    (await findMedia(payload, 'tempeh-32.webp')) || (await findMedia(payload, 'tempeh.webp'))
  const tempehImg2 =
    (await findMedia(payload, 'tempeh1-10.webp')) || (await findMedia(payload, 'tempeh1-2.webp'))

  const deWorkshops = [
    {
      title: 'Lakto-Gemüse',
      audienceTag: 'Für Köche und Lebensmittelexperten',
      theme: 'light' as const,
      description:
        'Gemüse fermentieren und jeden Monat neue Geschmacksrichtungen erleben. Hast du saisonales Gemüse übrig und möchtest es in echte Geschmackserlebnisse verwandeln?',
      features: [
        { text: 'Dauer: ca. 3 Stunden' },
        { text: 'Für alle – vom Anfänger bis zum Profi.' },
        { text: 'Zutaten, Gläser und Gewürze werden gestellt.' },
        { text: 'Nimm alle Gläser mit nach Hause.' },
      ],
      ...(laktoImg ? { image: laktoImg } : {}),
      ...(laktoImg2 ? { image2: laktoImg2 } : {}),
      ctaLink: '/workshops/lakto-gemuese',
      detailsButtonLabel: 'Workshop Details',
    },
    {
      title: 'Kombucha',
      audienceTag: 'Für Köche und Lebensmittelexperten',
      theme: 'dark' as const,
      description:
        'Tee fermentieren und mit jedem Brauvorgang ausgewogene Aromen kreieren. Neugierig, wie Kombucha natürlich spritzig, frisch und komplex wird?',
      features: [
        { text: 'Dauer: ca. 3 Stunden' },
        { text: 'Für alle – vom Anfänger bis zum Profi.' },
        { text: 'Tee, Flaschen und Aromen werden gestellt.' },
        { text: 'Nimm deinen selbst gebrauten Kombucha mit nach Hause.' },
      ],
      ...(kombuchaImg ? { image: kombuchaImg } : {}),
      ...(kombuchaImg2 ? { image2: kombuchaImg2 } : {}),
      ctaLink: '/workshops/kombucha',
      detailsButtonLabel: 'Workshop Details',
    },
    {
      title: 'Tempeh',
      audienceTag: 'Für Köche und Lebensmittelexperten',
      theme: 'dark' as const,
      description:
        'Von Bohnen zu Tempeh – Textur, Geschmack und Technik verstehen. Lerne, wie diese traditionelle Fermentation zu einem vielseitigen, gesunden Protein wird.',
      features: [
        { text: 'Dauer: ca. 3 Stunden' },
        { text: 'Für Hobbyköche und Profis geeignet.' },
        { text: 'Bohnen, Starterkulturen und alles wird gestellt.' },
        { text: 'Nimm frisch zubereitetes Tempeh mit nach Hause.' },
      ],
      ...(tempehImg ? { image: tempehImg } : {}),
      ...(tempehImg2 ? { image2: tempehImg2 } : {}),
      ctaLink: '/workshops/tempeh',
      detailsButtonLabel: 'Workshop Details',
    },
  ]

  await payload.updateGlobal({
    slug: 'workshop-slider-global',
    locale: 'de',
    context: ctx,
    data: {
      eyebrow: 'Workshop-Erlebnis',
      allWorkshopsButtonLabel: 'Alle Workshops',
      allWorkshopsLink: '/workshops',
      workshops: deWorkshops,
    },
  })

  const saved = (await payload.findGlobal({
    slug: 'workshop-slider-global',
    locale: 'de',
    depth: 0,
  })) as WorkshopSliderGlobal

  const workshopIds = (saved.workshops ?? []).map((w) => w.id)
  const featureIds = (saved.workshops ?? []).map((w) => (w.features ?? []).map((f) => f.id))

  console.log('── Workshop Slider (EN) ──')

  const enWorkshops = [
    {
      id: workshopIds[0],
      title: 'Lacto-Vegetables',
      audienceTag: 'For Chefs and Food Professionals',
      theme: 'light' as const,
      description:
        'Fermenting vegetables, experiencing different flavours every month. Do you have leftover seasonal vegetables and want to transform them into real taste sensations?',
      features: [
        { id: featureIds[0]?.[0], text: 'Duration: approx. 3 hours' },
        { id: featureIds[0]?.[1], text: 'For everyone from beginner to pro.' },
        { id: featureIds[0]?.[2], text: 'Ingredients, jars, and spices are all provided.' },
        { id: featureIds[0]?.[3], text: 'Take all the jars home with you afterward.' },
      ],
      ...(laktoImg ? { image: laktoImg } : {}),
      ...(laktoImg2 ? { image2: laktoImg2 } : {}),
      ctaLink: '/workshops/lakto-gemuese',
      detailsButtonLabel: 'Workshop Details',
    },
    {
      id: workshopIds[1],
      title: 'Kombucha',
      audienceTag: 'For Chefs and Food Professionals',
      theme: 'dark' as const,
      description:
        'Fermenting tea, creating balanced flavours with every brew. Curious how kombucha becomes naturally fizzy, fresh, and complex?',
      features: [
        { id: featureIds[1]?.[0], text: 'Duration: approx. 3 hours' },
        { id: featureIds[1]?.[1], text: 'For everyone from beginner to pro.' },
        { id: featureIds[1]?.[2], text: 'Tea, bottles, and flavourings are all provided.' },
        { id: featureIds[1]?.[3], text: 'Take home your own brewed kombucha.' },
      ],
      ...(kombuchaImg ? { image: kombuchaImg } : {}),
      ...(kombuchaImg2 ? { image2: kombuchaImg2 } : {}),
      ctaLink: '/workshops/kombucha',
      detailsButtonLabel: 'Workshop Details',
    },
    {
      id: workshopIds[2],
      title: 'Tempeh',
      audienceTag: 'For Chefs and Food Professionals',
      theme: 'dark' as const,
      description:
        'From beans to tempeh, understanding texture, taste, and technique. Learn how this traditional fermentation becomes a versatile, healthy protein.',
      features: [
        { id: featureIds[2]?.[0], text: 'Duration: approx. 3 hours' },
        { id: featureIds[2]?.[1], text: 'Suitable for home cooks and professionals.' },
        { id: featureIds[2]?.[2], text: 'Beans, starter cultures, and all are provided.' },
        { id: featureIds[2]?.[3], text: 'Take home freshly made tempeh.' },
      ],
      ...(tempehImg ? { image: tempehImg } : {}),
      ...(tempehImg2 ? { image2: tempehImg2 } : {}),
      ctaLink: '/workshops/tempeh',
      detailsButtonLabel: 'Workshop Details',
    },
  ]

  await payload.updateGlobal({
    slug: 'workshop-slider-global',
    locale: 'en',
    context: ctx,
    data: {
      eyebrow: 'Workshop Experience',
      allWorkshopsButtonLabel: 'All Workshops',
      allWorkshopsLink: '/workshops',
      workshops: enWorkshops,
    },
  })

  const imgCount = [laktoImg, kombuchaImg, tempehImg].filter(Boolean).length
  console.log(`✅ Workshop Slider seeded (DE + EN) — 3 workshops, ${imgCount} with images`)
}

// ═══════════════════════════════════════════════════════════════════════
// 6. PRODUCT SLIDER — creates if missing, skips if exists
// ═══════════════════════════════════════════════════════════════════════

async function seedProductSlider(payload: Awaited<ReturnType<typeof getPayload>>) {
  const hasData = await globalHasData(payload, 'product-slider-global', 'heading')
  if (hasData && !force) {
    console.log('\n── Product Slider ──')
    console.log('  ⏭ Already has data — skipping (use --force to overwrite)')
    return
  }

  console.log('\n── Product Slider (DE) ──')

  // Find existing products to reference
  const products = await payload.find({
    collection: 'products',
    limit: 10,
    depth: 0,
  })

  const productIds = products.docs.map((p) => p.id)

  await payload.updateGlobal({
    slug: 'product-slider-global',
    locale: 'de',
    context: ctx,
    data: {
      heading: 'Entdecke EINZIGARTIGE.',
      headingAccent: 'GESCHMÄCKER',
      description:
        'Tauche ein in die Welt der Fermentations-Innovation bei FermentFreude. Unsere sorgfältig kuratierte Auswahl vereint die neuesten Geschmacksrichtungen und zeitlose Klassiker, damit du für jeden Anlass den perfekten Genuss findest.',
      buttonLabel: 'Alle Produkte ansehen',
      buttonLink: '/products',
      products: productIds,
    },
  })

  console.log('── Product Slider (EN) ──')

  await payload.updateGlobal({
    slug: 'product-slider-global',
    locale: 'en',
    context: ctx,
    data: {
      heading: 'Discover UNIQUE.',
      headingAccent: 'FLAVOURS',
      description:
        'Dive into a world of fermentation innovation at FermentFreude. Our carefully curated products bring together the latest flavours and timeless classics, ensuring you find the perfect taste for every occasion.',
      buttonLabel: 'View All Products',
      buttonLink: '/products',
      products: productIds,
    },
  })

  console.log(`✅ Product Slider seeded (DE + EN) — ${productIds.length} products linked`)
}

// ═══════════════════════════════════════════════════════════════════════
// 7. WORKSHOP CARDS — creates if missing, skips if exists
// ═══════════════════════════════════════════════════════════════════════

async function seedWorkshopCards(payload: Awaited<ReturnType<typeof getPayload>>) {
  const hasData = await globalHasData(payload, 'workshop-cards-global', 'cards')
  if (hasData && !force) {
    console.log('\n── Workshop Cards ──')
    console.log('  ⏭ Already has data — skipping (use --force to overwrite)')
    return
  }

  console.log('\n── Workshop Cards (DE) ──')

  // Look for working workshop card images by specific filenames
  const laktoCardImg =
    (await findMedia(payload, 'lakto1-3.webp')) || (await findMedia(payload, 'lakto-2.webp'))
  const kombuchaCardImg =
    (await findMedia(payload, 'kombucha1-3.webp')) || (await findMedia(payload, 'kombucha-1.webp'))
  const tempehCardImg =
    (await findMedia(payload, 'tempeh1-10.webp')) || (await findMedia(payload, 'tempeh.webp'))

  const deCards = [
    {
      title: 'Lakto-Gemüse',
      description:
        'Entdecke die Kunst der Milchsäerefermentation. Lerne, saisonales Gemüse in haltbare, probiotische Köstlichkeiten zu verwandeln.',
      ...(laktoCardImg ? { image: laktoCardImg } : {}),
      price: '€99',
      priceSuffix: 'pro Person',
      buttonLabel: 'Jetzt buchen',
      buttonUrl: '/workshops/lakto-gemuese',
      nextDate: '',
    },
    {
      title: 'Kombucha',
      description:
        'Braue deinen eigenen Kombucha! Von der SCOBY-Pflege bis zur Zweitfermentation mit einzigartigen Geschmacksrichtungen.',
      ...(kombuchaCardImg ? { image: kombuchaCardImg } : {}),
      price: '€99',
      priceSuffix: 'pro Person',
      buttonLabel: 'Jetzt buchen',
      buttonUrl: '/workshops/kombucha',
      nextDate: '',
    },
    {
      title: 'Tempeh',
      description:
        'Von der Bohne zum fertigen Tempeh. Erlerne die traditionelle indonesische Fermentationstechnik und kreiere dein eigenes Tempeh.',
      ...(tempehCardImg ? { image: tempehCardImg } : {}),
      price: '€99',
      priceSuffix: 'pro Person',
      buttonLabel: 'Jetzt buchen',
      buttonUrl: '/workshops/tempeh',
      nextDate: '',
    },
  ]

  await payload.updateGlobal({
    slug: 'workshop-cards-global',
    locale: 'de',
    context: ctx,
    data: {
      title: 'Unsere Workshops',
      subtitle:
        'Entdecke die Welt der Fermentation in unseren praxisorientierten Workshops. Lerne von Profis und nimm deine eigenen Kreationen mit nach Hause.',
      clarification: 'Alle Preise inkl. MwSt.',
      nextDateLabel: 'Nächster Termin',
      viewAllLabel: 'Alle Workshops',
      viewAllUrl: '/workshops',
      cards: deCards,
    },
  })

  const saved = (await payload.findGlobal({
    slug: 'workshop-cards-global',
    locale: 'de',
    depth: 0,
  })) as WorkshopCardsGlobal

  const cardIds = (saved.cards ?? []).map((c) => c.id)

  console.log('── Workshop Cards (EN) ──')

  const enCards = [
    {
      id: cardIds[0],
      title: 'Lacto-Vegetables',
      description:
        'Discover the art of lactic acid fermentation. Learn to transform seasonal vegetables into preserved, probiotic delicacies.',
      ...(laktoCardImg ? { image: laktoCardImg } : {}),
      price: '€99',
      priceSuffix: 'per person',
      buttonLabel: 'Book Now',
      buttonUrl: '/workshops/lakto-gemuese',
      nextDate: '',
    },
    {
      id: cardIds[1],
      title: 'Kombucha',
      description:
        'Brew your own kombucha! From SCOBY care to second fermentation with unique flavours.',
      ...(kombuchaCardImg ? { image: kombuchaCardImg } : {}),
      price: '€99',
      priceSuffix: 'per person',
      buttonLabel: 'Book Now',
      buttonUrl: '/workshops/kombucha',
      nextDate: '',
    },
    {
      id: cardIds[2],
      title: 'Tempeh',
      description:
        'From beans to finished tempeh. Learn the traditional Indonesian fermentation technique and create your own tempeh.',
      ...(tempehCardImg ? { image: tempehCardImg } : {}),
      price: '€99',
      priceSuffix: 'per person',
      buttonLabel: 'Book Now',
      buttonUrl: '/workshops/tempeh',
      nextDate: '',
    },
  ]

  await payload.updateGlobal({
    slug: 'workshop-cards-global',
    locale: 'en',
    context: ctx,
    data: {
      title: 'Our Workshops',
      subtitle:
        'Discover the world of fermentation in our hands-on workshops. Learn from professionals and take your own creations home.',
      clarification: 'All prices incl. VAT.',
      nextDateLabel: 'Next Date',
      viewAllLabel: 'All Workshops',
      viewAllUrl: '/workshops',
      cards: enCards,
    },
  })

  const imgCount = [laktoCardImg, kombuchaCardImg, tempehCardImg].filter(Boolean).length
  console.log(`✅ Workshop Cards seeded (DE + EN) — 3 cards, ${imgCount} with images`)
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════

async function seedAllGlobals() {
  const payload = await getPayload({ config })

  console.log(
    `🌱 Seeding globals (DE + EN)${force ? ' — FORCE MODE (overwrites existing)' : ' — non-destructive'}`,
  )
  console.log('   Header is seeded separately via: pnpm seed header')

  // Sequential writes — MongoDB Atlas M0, no transactions
  await seedFooter(payload)
  await seedTestimonials(payload)
  await seedSponsorsBar(payload)
  await seedVoucherCta(payload)
  await seedWorkshopSlider(payload)
  await seedProductSlider(payload)
  await seedWorkshopCards(payload)

  console.log('\n🎉 Globals seed complete!')
  console.log('   Open /admin → Website group to verify all globals.')
  console.log('   Switch locale (DE/EN) in top-right to check both languages.')

  process.exit(0)
}

seedAllGlobals().catch((err) => {
  console.error('❌ Failed to seed globals:', err)
  process.exit(1)
})
