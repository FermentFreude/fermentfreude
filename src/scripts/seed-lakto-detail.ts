/**
 * Seed the workshopDetail tab for the lakto-gemuese page.
 *
 * Populates all 10 CMS sections with TEXT CONTENT ONLY:
 * 1. Hero, 2. Booking Card, 3. Workshop Details, 4. Experience Cards,
 * 5. Upcoming Dates, 6. Calendar, 7. Voucher CTA, 8. FAQ, 9. Modal Labels, 10. How-To Articles
 *
 * ⚠️  IMAGES ARE NOT SEEDED
 * Images (heroImage, bookingImage, voucherBackgroundImage) are managed entirely through the admin UI.
 * The schema defines upload fields — you upload them in /admin/collections/pages and they persist across re-seeds.
 *
 * Run:  pnpm seed lakto-detail
 *       pnpm seed lakto-detail --force   (overwrite existing text content)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const isForce = process.argv.includes('--force')

// ═══════════════════════════════════════════════════════════════
//  DE — German seed data
// ═══════════════════════════════════════════════════════════════

const workshopDetailDE = {
  // ── 1. Hero ────────────────────────────────────────────
  heroEyebrow: 'Workshop Experience',
  heroTitle: 'Die Kunst der\nLakto-Fermentation',
  heroDescription:
    'Verwandle frisches Gemüse in probiotische Köstlichkeiten — mit Salz, Zeit und der Magie nützlicher Bakterien.',
  heroAttributes: [{ text: '3 Stunden' }, { text: 'Hands-on' }, { text: 'Experience' }],

  // ── 2. Booking Card ────────────────────────────────────
  bookingEyebrow: '3-STUNDEN HANDS-ON WORKSHOP',
  bookingPrice: 99,
  bookingPriceSuffix: 'pro Person',
  bookingCurrency: '€',
  bookingAttributes: [
    { text: '3 Stunden' },
    { text: 'Hands-on' },
    { text: 'Experience' },
    { text: 'Max. 12 Personen' },
  ],
  bookingViewDatesLabel: 'Termine & Buchen',
  bookingHideDatesLabel: 'Termine ausblenden',
  bookingMoreDetailsLabel: 'Mehr Informationen',
  bookingBookLabel: 'Buchen',
  bookingSpotsLabel: 'Plätze frei',

  // ── 3. Workshop Details ────────────────────────────────
  aboutHeading: 'Über den Workshop',
  aboutText:
    'Entdecke die Welt der Lakto-Fermentation — eine der ältesten und einfachsten Konservierungstechniken. In diesem Hands-on-Workshop lernst du, wie Milchsäurebakterien alltägliches Gemüse in säuerliche, probiotische Lebensmittel verwandeln. Keine besondere Ausrüstung nötig — nur frisches Gemüse, Salz und ein wenig Geduld.',
  scheduleHeading: 'Ablauf (3 Stunden)',
  schedule: [
    {
      duration: '45 Min',
      title: 'Fermentations-Grundlagen',
      description:
        'Verständnis der Milchsäure-Fermentation, die Mikrobiom-Verbindung und die Wissenschaft hinter sicherer Gemüsekonservierung.',
    },
    {
      duration: '90 Min',
      title: 'Drei Fermente herstellen',
      description:
        'Hands-on: Apfel-Rotkohl-Sauerkraut, Indische Mischpickles und Mangold-Kimchi — jedes Glas nimmst du mit nach Hause.',
    },
    {
      duration: '45 Min',
      title: 'Verkostung & Austausch',
      description:
        'Genieße ein kuratiertes Ferment-Board mit saisonalen Kreationen, tausche Erfahrungen aus und bekomme Tipps fürs Fermentieren zu Hause.',
    },
  ],
  includedHeading: 'Im Preis enthalten (€99)',
  includedItems: [
    { text: 'Drei Fermentationsgläser' },
    { text: 'Bio-Gemüse und Gewürze' },
    { text: 'Fermentationsgewichte und Deckel' },
    { text: 'Digitale Rezeptsammlung' },
    { text: 'Fermentations-Starterguide' },
    { text: 'Ferment-Board Verkostung' },
    { text: 'Troubleshooting-Referenzkarte' },
    { text: '14-Tage E-Mail-Support' },
  ],
  whyHeading: 'Warum dieser Workshop?',
  whyPoints: [
    {
      bold: 'Darmgesundheit:',
      rest: ' Lakto-fermentiertes Gemüse ist reich an Probiotika, die Verdauung und Immunsystem unterstützen — Vorteile, die du in keinem Laden findest.',
    },
    {
      bold: 'Zero Waste:',
      rest: ' Verwandle saisonale Überschüsse und nicht perfektes Gemüse in köstliche Konserven, die monatelang halten.',
    },
    {
      bold: 'Keine Ausrüstung nötig:',
      rest: ' Anders als beim Einkochen oder Trocknen brauchst du nur ein Glas, Salz und Geduld.',
    },
    {
      bold: 'Endlose Kreativität:',
      rest: ' Wenn du die Grundlagen beherrschst, wird jedes Gemüse zum Experiment — Kraut, Kimchi, Pickles, Hot Sauce und mehr.',
    },
  ],

  // ── 4. Experience Cards ────────────────────────────────
  experienceEyebrow: 'WAS DICH ERWARTET',
  experienceTitle: 'Dein Workshop-Erlebnis',
  experienceCards: [
    {
      eyebrow: 'THEORIE',
      title: 'Fermentations-Grundlagen',
      description:
        'Lerne die Wissenschaft und gesundheitlichen Vorteile der Lakto-Fermentation — von Mikrobiologie bis Darmgesundheit, wir behandeln die Grundlagen, die dich sicher in der Küche machen.',
    },
    {
      eyebrow: 'PRAXIS',
      title: 'Drei Fermente',
      description:
        'Stelle Apfel-Rotkohl-Sauerkraut, Indische Pickles & Mangold-Kimchi her — drei Gläser lebendiger Kultur zum Mitnehmen und wochenlang Genießen.',
    },
    {
      eyebrow: 'VERKOSTUNG',
      title: 'Ferment-Board',
      description:
        'Genieße ein kuratiertes Verkostungsboard mit hauseigenen Fermenten und Sauerteigbrot — vegane Option immer verfügbar.',
    },
  ],

  // ── 5. Upcoming Dates ──────────────────────────────────
  datesHeading: 'Nächste Workshops',
  dates: [
    { date: '15. Februar 2026', time: '14:00 – 17:00', spotsLeft: 5 },
    { date: '22. Februar 2026', time: '10:00 – 13:00', spotsLeft: 3 },
    { date: '8. März 2026', time: '14:00 – 17:00', spotsLeft: 8 },
    { date: '15. März 2026', time: '10:00 – 13:00', spotsLeft: 12 },
  ],

  // ── 6. Calendar ────────────────────────────────────────
  calendarEyebrow: 'SAISONALE REZEPTE',
  calendarTitle: 'Fermentkalender',
  calendarDescription:
    'Entdecke was du in jedem Monat fermentieren kannst — frisch, saisonal und voller Geschmack.',
  calendarMonths: [
    {
      month: 'März',
      monthShort: 'MÄR',
      monthNumber: '03',
      season: 'FRÜHLING',
      accent: '#e6be68',
      recipes: [
        { name: 'Fermentierte Curry-Zwiebel' },
        { name: 'Milchsaure Radieschen-Pickles' },
        { name: 'Kohlrabi Kimchi' },
      ],
    },
    {
      month: 'April',
      monthShort: 'APR',
      monthNumber: '04',
      season: 'FRÜHLING',
      accent: '#555954',
      recipes: [
        { name: 'Milchsaure Bärlauchblüten' },
        { name: 'Fermentierter Rhabarber-Kohlrabi' },
        { name: 'Radieschen Kimchi' },
      ],
    },
    {
      month: 'Mai',
      monthShort: 'MAI',
      monthNumber: '05',
      season: 'FRÜHLING',
      accent: '#1a1a1a',
      recipes: [
        { name: 'Fermentierter Spargel' },
        { name: 'Rhabarber-Sauerkraut' },
        { name: 'Kohlrabi-Kimchi' },
      ],
    },
  ],

  // ── 7. Voucher CTA ────────────────────────────────────
  voucherEyebrow: 'GEMEINSAM FERMENTIEREN',
  voucherTitle: 'Go with a friend.',
  voucherDescription:
    'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und neugierige Köpfe.',
  voucherPrimaryLabel: 'Gutschein kaufen',
  voucherPrimaryHref: '/voucher',
  voucherSecondaryLabel: 'Zum Shop',
  voucherSecondaryHref: '/shop',
  voucherPills: [
    { text: 'Sofort einlösbar' },
    { text: 'Für alle Workshops' },
    { text: 'Digital oder gedruckt' },
  ],

  // ── 8. FAQ ─────────────────────────────────────────────
  faqEyebrow: 'HÄUFIGE FRAGEN',
  faqTitle: 'Gut zu wissen',
  faqDescription:
    'Alles was du vor deiner Buchung wissen solltest — von Stornierung bis Verpflegung.',
  faqItems: [
    {
      question: 'Wie kann ich stornieren oder umbuchen?',
      answer:
        'Du kannst bis 48 Stunden vor dem Workshop kostenlos stornieren oder auf einen anderen Termin umbuchen. Schreib uns einfach eine E-Mail an info@fermentfreude.de. Bei späterer Absage behalten wir 50% der Gebühr.',
    },
    {
      question: 'Was muss ich zum Workshop mitbringen?',
      answer:
        'Nur gute Laune! Wir stellen alle Zutaten, Werkzeuge, Schürzen und Gläser zum Mitnehmen bereit. Bequeme Kleidung wird empfohlen. Wenn du Allergien hast, gib uns bitte vorher Bescheid.',
    },
    {
      question: 'Wie groß sind die Gruppen?',
      answer:
        'Unsere Workshops haben maximal 12 Teilnehmer, damit jeder genug persönliche Betreuung bekommt. Ab 8 Personen bieten wir auch private Gruppen-Workshops an — schreib uns für ein individuelles Angebot.',
    },
    {
      question: 'Wie lange dauert der Workshop und wann fängt er an?',
      answer:
        'Der Lakto-Workshop dauert ca. 3 Stunden. Bitte sei 10 Minuten vor Beginn da, damit wir pünktlich starten können. Genaue Uhrzeiten findest du bei den einzelnen Terminen oben.',
    },
    {
      question: 'Ist der Workshop für Anfänger geeignet?',
      answer:
        'Absolut! Unsere Workshops sind speziell für Einsteiger konzipiert. Du brauchst keinerlei Vorkenntnisse. Wir erklären alles Schritt für Schritt — von der Wissenschaft bis zur Praxis.',
    },
    {
      question: 'Gibt es vegetarische/vegane Optionen?',
      answer:
        'Ja! Alle unsere Lakto-Gemüse-Rezepte sind von Natur aus vegan. Auch die Verkostung bietet vegane Optionen. Bitte teile uns eventuelle Allergien vorab mit.',
    },
  ],
  faqContactEmail: 'info@fermentfreude.de',

  // ── 10. How-To Articles ────────────────────────────────
  // Note: If no posts exist yet, this remains empty []
  // Posts are seeded separately. Link them through the admin UI.
  // howToEyebrow: 'TIPPS & GUIDES',
  // howToTitle: 'Lerne fermentieren.',
  // howToDescription: 'Einfache Anleitungen für dein erstes Ferment — direkt aus unserer Küche.',

  // ── 9. Modal Labels ────────────────────────────────────
  modalConfirmHeading: 'Buchung bestätigen',
  modalConfirmSubheading: 'Details überprüfen',
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Datum',
  modalTimeLabel: 'Uhrzeit',
  modalTotalLabel: 'Gesamt',
  modalCancelLabel: 'Abbrechen',
  modalConfirmLabel: 'Buchung bestätigen',
}

// ═══════════════════════════════════════════════════════════════
//  EN — English seed data
// ═══════════════════════════════════════════════════════════════

const workshopDetailEN = {
  // ── 1. Hero ────────────────────────────────────────────
  heroEyebrow: 'Workshop Experience',
  heroTitle: 'The Art of\nLacto-Fermentation',
  heroDescription:
    'Transform fresh vegetables into probiotic-rich delicacies — with salt, time, and the magic of beneficial bacteria.',
  heroAttributes: [{ text: '3 Hours' }, { text: 'Hands-on' }, { text: 'Experience' }],

  // ── 2. Booking Card ────────────────────────────────────
  bookingEyebrow: '3-HOUR HANDS-ON WORKSHOP',
  bookingPrice: 99,
  bookingPriceSuffix: 'per person',
  bookingCurrency: '€',
  bookingAttributes: [
    { text: '3 Hours' },
    { text: 'Hands-on' },
    { text: 'Experience' },
    { text: 'Max. 12 Participants' },
  ],
  bookingViewDatesLabel: 'View Dates & Book',
  bookingHideDatesLabel: 'Hide Dates',
  bookingMoreDetailsLabel: 'More Information',
  bookingBookLabel: 'Book',
  bookingSpotsLabel: 'spots left',

  // ── 3. Workshop Details ────────────────────────────────
  aboutHeading: 'About the Workshop',
  aboutText:
    'Explore the world of lacto-fermentation — one of the oldest and simplest preservation techniques. In this hands-on workshop you will learn how lactic-acid bacteria transform everyday vegetables into tangy, probiotic-rich foods. No special equipment needed, just fresh produce, salt, and a bit of patience.',
  scheduleHeading: 'Schedule (3 Hours)',
  schedule: [
    {
      duration: '45 min',
      title: 'Fermentation Fundamentals',
      description:
        'Understanding lactic-acid fermentation, the microbiome connection, and the science behind safe vegetable preservation.',
    },
    {
      duration: '90 min',
      title: 'Making Three Ferments',
      description:
        'Hands-on preparation: Apple-Red Cabbage Sauerkraut, Indian-style Mixed Pickles, and Chard Kimchi — each jar is yours to take home.',
    },
    {
      duration: '45 min',
      title: 'Tasting & Discussion',
      description:
        'Enjoy a curated ferment board with seasonal creations, share experiences, and get tips for fermenting at home.',
    },
  ],
  includedHeading: 'Included in Price (€99)',
  includedItems: [
    { text: 'Three fermentation jars' },
    { text: 'Organic vegetables and spices' },
    { text: 'Fermentation weights and lids' },
    { text: 'Digital recipe collection' },
    { text: 'Fermentation starter guide' },
    { text: 'Ferment board tasting menu' },
    { text: 'Troubleshooting reference card' },
    { text: '14-day email support' },
  ],
  whyHeading: 'Why This Workshop?',
  whyPoints: [
    {
      bold: 'Gut Health:',
      rest: " Lacto-fermented vegetables are rich in probiotics that support digestion and immunity — benefits you won't find on any shop shelf.",
    },
    {
      bold: 'Zero Waste:',
      rest: ' Turn seasonal surplus and imperfect produce into delicious preserved foods that last for months.',
    },
    {
      bold: 'No Equipment Needed:',
      rest: ' Unlike canning or dehydrating, lacto-fermentation requires only a jar, salt, and patience.',
    },
    {
      bold: 'Endless Creativity:',
      rest: ' Once you master the basics, every vegetable becomes an experiment — kraut, kimchi, pickles, hot sauce, and more.',
    },
  ],

  // ── 4. Experience Cards ────────────────────────────────
  experienceEyebrow: 'WHAT TO EXPECT',
  experienceTitle: 'Your Workshop Experience',
  experienceCards: [
    {
      eyebrow: 'THEORY',
      title: 'Fermentation Basics',
      description:
        'Learn the science and health benefits behind lacto-fermentation — from microbiology to gut health, we cover the foundations that will make you confident in the kitchen.',
    },
    {
      eyebrow: 'PRACTICE',
      title: 'Three Ferments',
      description:
        'Create Apple-Red Cabbage Sauerkraut, Indian Pickles & Chard Kimchi — three jars of living culture to take home and enjoy for weeks.',
    },
    {
      eyebrow: 'TASTING',
      title: 'Ferment Board',
      description:
        'Enjoy a curated tasting board of house-made ferments paired with artisan bread — vegan option always available.',
    },
  ],

  // ── 5. Upcoming Dates ──────────────────────────────────
  datesHeading: 'Next Workshops',
  dates: [
    { date: 'February 15, 2026', time: '2:00 PM – 5:00 PM', spotsLeft: 5 },
    { date: 'February 22, 2026', time: '10:00 AM – 1:00 PM', spotsLeft: 3 },
    { date: 'March 8, 2026', time: '2:00 PM – 5:00 PM', spotsLeft: 8 },
    { date: 'March 15, 2026', time: '10:00 AM – 1:00 PM', spotsLeft: 12 },
  ],

  // ── 6. Calendar ────────────────────────────────────────
  calendarEyebrow: 'SEASONAL RECIPES',
  calendarTitle: 'Fermentation Calendar',
  calendarDescription:
    'Discover what you can ferment each month — fresh, seasonal, and full of flavor.',
  calendarMonths: [
    {
      month: 'March',
      monthShort: 'MAR',
      monthNumber: '03',
      season: 'SPRING',
      accent: '#e6be68',
      recipes: [
        { name: 'Fermented Curry Onions' },
        { name: 'Lacto-Fermented Radish Pickles' },
        { name: 'Kohlrabi Kimchi' },
      ],
    },
    {
      month: 'April',
      monthShort: 'APR',
      monthNumber: '04',
      season: 'SPRING',
      accent: '#555954',
      recipes: [
        { name: 'Lacto-Fermented Wild Garlic Buds' },
        { name: 'Fermented Rhubarb Kohlrabi' },
        { name: 'Radish Kimchi' },
      ],
    },
    {
      month: 'May',
      monthShort: 'MAY',
      monthNumber: '05',
      season: 'SPRING',
      accent: '#1a1a1a',
      recipes: [
        { name: 'Fermented Asparagus' },
        { name: 'Rhubarb Sauerkraut' },
        { name: 'Kohlrabi Kimchi' },
      ],
    },
  ],

  // ── 7. Voucher CTA ────────────────────────────────────
  voucherEyebrow: 'FERMENT TOGETHER',
  voucherTitle: 'Go with a friend.',
  voucherDescription:
    'Give someone a special experience — our vouchers are the perfect gift for foodies and curious minds.',
  voucherPrimaryLabel: 'Buy Voucher',
  voucherPrimaryHref: '/voucher',
  voucherSecondaryLabel: 'Visit Shop',
  voucherSecondaryHref: '/shop',
  voucherPills: [
    { text: 'Instantly redeemable' },
    { text: 'For all workshops' },
    { text: 'Digital or printed' },
  ],

  // ── 8. FAQ ─────────────────────────────────────────────
  faqEyebrow: 'FAQ',
  faqTitle: 'Good to Know',
  faqDescription: 'Everything you need to know before booking — from cancellation to catering.',
  faqItems: [
    {
      question: 'How can I cancel or reschedule?',
      answer:
        'You can cancel or reschedule free of charge up to 48 hours before the workshop. Simply send us an email at info@fermentfreude.de. For later cancellations, we retain 50% of the fee.',
    },
    {
      question: 'What do I need to bring?',
      answer:
        'Just a good mood! We provide all ingredients, tools, aprons, and jars to take home. Comfortable clothing is recommended. If you have allergies, please let us know in advance.',
    },
    {
      question: 'How big are the groups?',
      answer:
        'Our workshops have a maximum of 12 participants to ensure everyone gets enough personal attention. For groups of 8 or more, we also offer private group workshops — contact us for a custom quote.',
    },
    {
      question: 'How long is the workshop and when does it start?',
      answer:
        'The Lakto workshop lasts approximately 3 hours. Please arrive 10 minutes before the start so we can begin on time. Exact times can be found with the individual dates above.',
    },
    {
      question: 'Is the workshop suitable for beginners?',
      answer:
        "Absolutely! Our workshops are specifically designed for beginners. You don't need any prior knowledge. We explain everything step by step — from the science to the practice.",
    },
    {
      question: 'Are there vegetarian/vegan options?',
      answer:
        'Yes! All our lacto-vegetable recipes are naturally vegan. The tasting also offers vegan options. Please let us know about any allergies in advance.',
    },
  ],
  faqContactEmail: 'info@fermentfreude.de',

  // ── 10. How-To Articles ────────────────────────────────
  // Note: If no posts exist yet, this remains empty []
  // Posts are seeded separately. Link them through the admin UI.
  // howToEyebrow: 'TIPS & GUIDES',
  // howToTitle: 'Learn to ferment.',
  // howToDescription: 'Simple guides for your first ferment — straight from our kitchen.',

  // ── 9. Modal Labels ────────────────────────────────────
  modalConfirmHeading: 'Confirm Booking',
  modalConfirmSubheading: 'Review your details',
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Date',
  modalTimeLabel: 'Time',
  modalTotalLabel: 'Total',
  modalCancelLabel: 'Cancel',
  modalConfirmLabel: 'Confirm Booking',
}

// ═══════════════════════════════════════════════════════════════
//  Seed runner
// ═══════════════════════════════════════════════════════════════

async function seedLaktoDetail() {
  const payload = await getPayload({ config })
  const slug = 'lakto-gemuese'

  payload.logger.info(`Seeding workshopDetail for "${slug}"...`)
  payload.logger.info('  📝 Seeding text content only (images managed in /admin)')

  // ── Find the existing page ──────────────────────────────
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale: 'de',
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length === 0) {
    payload.logger.error(`❌ Page "${slug}" not found. Run "pnpm seed workshop-pages" first.`)
    process.exit(1)
  }

  const page = existing.docs[0]
  const pageId = page.id

  // ── Non-destructive check ───────────────────────────────
  const detail = (page as unknown as Record<string, unknown>).workshopDetail as
    | Record<string, unknown>
    | undefined
  if (detail?.heroTitle && !isForce) {
    payload.logger.info(
      `⏭️  workshopDetail already has data for "${slug}". Use --force to overwrite.`,
    )
    process.exit(0)
  }

  // ── Preserve admin-uploaded images (don't overwrite) ─────
  // Each image field is managed individually in /admin
  const deData = {
    ...workshopDetailDE,
    // Preserve images: only use seed values if images don't already exist
    heroImage: detail?.heroImage ?? workshopDetailDE.heroImage,
    bookingImage: detail?.bookingImage ?? workshopDetailDE.bookingImage,
    voucherBackgroundImage: detail?.voucherBackgroundImage ?? workshopDetailDE.voucherBackgroundImage,
  }

  if (detail?.heroImage) payload.logger.info('  🖼️  Preserving existing heroImage')
  if (detail?.bookingImage) payload.logger.info('  🖼️  Preserving existing bookingImage')
  if (detail?.voucherBackgroundImage) payload.logger.info('  🖼️  Preserving existing voucherBackgroundImage')

  // ── Save DE ─────────────────────────────────────────────
  payload.logger.info('  Saving DE locale...')
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    data: { workshopDetail: deData } as never,
    context: ctx,
  })

  // ── Read back for generated IDs (arrays get Payload IDs) ─
  const saved = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
  })

  const savedDetail = (saved as unknown as Record<string, unknown>).workshopDetail as
    | Record<string, unknown>
    | undefined

  // ── Merge EN arrays with DE-generated IDs ───────────────
  // Also preserve images across locales (same images for both DE and EN)
  const enData = {
    ...workshopDetailEN,
    heroImage: deData.heroImage,
    bookingImage: deData.bookingImage,
    voucherBackgroundImage: deData.voucherBackgroundImage,
  } as Record<string, unknown>

  // For each array field, copy the `id` from the saved DE doc
  const arrayFields = [
    'heroAttributes',
    'bookingAttributes',
    'schedule',
    'includedItems',
    'whyPoints',
    'experienceCards',
    'dates',
    'calendarMonths',
    'voucherPills',
    'faqItems',
    // howToArticles is a relationship to Posts — linked manually in admin
  ] as const

  for (const field of arrayFields) {
    const savedArr = (savedDetail?.[field] as Array<{ id?: string }>) ?? []
    const enArr = (enData[field] as Array<Record<string, unknown>>) ?? []

    if (savedArr.length === enArr.length) {
      for (let i = 0; i < enArr.length; i++) {
        if (savedArr[i]?.id) {
          enArr[i].id = savedArr[i].id
        }
      }
    }
  }

  // Also handle nested recipes arrays inside calendarMonths
  const savedMonths =
    (savedDetail?.calendarMonths as Array<{ id?: string; recipes?: Array<{ id?: string }> }>) ?? []
  const enMonths = (enData.calendarMonths as Array<Record<string, unknown>>) ?? []
  for (let m = 0; m < Math.min(savedMonths.length, enMonths.length); m++) {
    const savedRecipes = savedMonths[m].recipes ?? []
    const enRecipes = (enMonths[m].recipes as Array<Record<string, unknown>>) ?? []
    for (let r = 0; r < Math.min(savedRecipes.length, enRecipes.length); r++) {
      if (savedRecipes[r]?.id) {
        enRecipes[r].id = savedRecipes[r].id
      }
    }
  }

  // ── Save EN ─────────────────────────────────────────────
  payload.logger.info('  Saving EN locale...')
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    data: { workshopDetail: enData } as never,
    context: ctx,
  })

  payload.logger.info(`✅ workshopDetail seeded for "${slug}" (DE + EN)`)
  payload.logger.info('   Edit at: /admin/collections/pages')
}

seedLaktoDetail().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
