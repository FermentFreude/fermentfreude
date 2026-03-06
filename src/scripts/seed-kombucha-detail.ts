/**
 * Seed the workshopDetail tab for the kombucha page.
 *
 * Populates ONLY the sections rendered on kombucha frontend:
 * - Hero (eyebrow, title, description, attributes, image)
 * - Booking Card (about, schedule, included, why, experience cards with image support, dates)
 * - Voucher CTA (eyebrow, title, description, pills, primary/secondary labels)
 * - FAQ (eyebrow, title, description, faqItems)
 * - How-To (eyebrow, title, description — articles loaded from Posts collection)
 *
 * ⚠️  IMAGE UPLOADS
 * Images (heroImage, voucherBackgroundImage, experienceCards images) are managed entirely through the admin UI.
 * Seed initializes image fields as null — upload via CMS admin dashboard at /admin/collections/pages.
 *
 * Run:  pnpm seed kombucha-detail
 *       pnpm seed kombucha-detail --force   (overwrite existing text content)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const isForce = process.argv.includes('--force')

// ═══════════════════════════════════════════════════════════════
//  DE — German seed data for Kombucha
// ═══════════════════════════════════════════════════════════════

const workshopDetailDE = {
  // ── Calendar Toggle ────────────────────────────────────
  showSeasonalCalendar: false,

  // ── 1. Hero ────────────────────────────────────────────
  heroEyebrow: 'Workshop Experience',
  heroTitle: 'Die Kunst der\nKombucha-Fermentation',
  heroDescription:
    'Lerne Schritt für Schritt, wie du probiotisches Kombucha brauen kannst — mit schwarzem Tee, Zucker und deiner SCOBY. Ein faszinierendes Fermentationsabenteuer erwartet dich.',
  heroAttributes: [{ text: '3 Stunden' }, { text: 'Hands-on' }, { text: 'Experience' }],

  // ── 2. Booking Card ────────────────────────────────────
  bookingEyebrow: '3-STUNDEN HANDS-ON WORKSHOP',
  bookingPrice: 79,
  bookingPriceSuffix: 'pro Person',
  bookingCurrency: '€',
  bookingAttributes: [
    { text: '3 Stunden' },
    { text: 'Hands-on' },
    { text: 'Exklusiv' },
    { text: 'Max. 12 Personen' },
  ],
  bookingViewDatesLabel: 'Termine & Buchen',
  bookingHideDatesLabel: 'Termine ausblenden',
  bookingMoreDetailsLabel: 'Mehr Informationen',
  bookingBookLabel: 'Buchen',
  bookingSpotsLabel: 'Plätze frei',

  // ── 3. Workshop Details (About, Schedule, Included, Why, Experience, Dates) ────
  aboutHeading: 'Über den Workshop',
  aboutText:
    'Tauche ein in die faszinierende Welt des Kombucha-Brauens. In diesem praktischen Workshop lernst du Schritt für Schritt, wie du probiotisches Kombucha selbst herstellst — von der Teevorbereitung bis zur Gärung. Du erfährst, welche Bedingungen Kombucha für optimales Wachstum benötigt, und erhältst ein komplettes Starter-Set, das du mit nach Hause nimmst. Egal ob Anfänger oder neugieriger Gesundheitsenthusiast, dieser Workshop ist für alle konzipiert, die ihre Fermentationsfähigkeiten erweitern und probiotisches Kombucha entdecken möchten.',

  scheduleHeading: 'Ablauf (3 Stunden)',
  schedule: [
    {
      duration: '45 Min',
      title: 'Kombucha-Grundlagen & Wissenschaft',
      description:
        'Tauche mit uns in die Welt des Kombucha ein. Lerne, wie Fermentation funktioniert, was eine SCOBY ist, und entdecke die gesundheitlichen Vorteile probiotischer Getränke.',
    },
    {
      duration: '90 Min',
      title: 'Praxis: Dein eigenes Kombucha brauen',
      description:
        'Jetzt wird es praktisch. Unter Anleitung bereitest du hochwertigen schwarzen Tee vor und brauen deinen ersten Kombucha-Charge mit einer frischen SCOBY. Wir zeigen dir, wie du zuhause die ideale Gär-Umgebung schaffst.',
    },
    {
      duration: '45 Min',
      title: 'Abfüllung & Geschmacksvariationen',
      description:
        'Zum Abschluss wird es fruchtig. Wir füllen fertige Kombucha in Flaschen und erforschen spannende Geschmackskombinationen — Frucht, Kräuter, Gewürze. Eine ursprüngliche Verkostung wartet auf dich.',
    },
  ],

  includedHeading: 'Im Preis enthalten (€79)',
  includedItems: [
    { text: 'Frische SCOBY und fertiger Kombucha-Ansatz zum Mitnehmen' },
    { text: 'Hochwertiger Bio-Schwarztee (genug für deine erste Charge)' },
    { text: 'Komplettes Gär-Set für zuhause (Glas-Gärbehälter + Stoff)' },
    { text: 'Umfassende Anleitung mit Infografiken & Rezepten' },
    { text: 'Gemeinsame Verkostung mit verschiedenen Geschmacksvariationen' },
    { text: 'Fehlerbehebbungs-Referenzkarte' },
    { text: 'Digitale Ressourcensammlung' },
    { text: '14-Tage E-Mail-Support' },
  ],

  whyHeading: 'Warum dieser Workshop?',
  whyPoints: [
    {
      bold: 'Gesundheits-Boost:',
      rest: ' Kombucha liefert natürliche Probiotika statt teurer Flaschen aus dem Supermarkt. Selbstgebraut ist es 10x günstiger.',
    },
    {
      bold: 'Lebende Kulturen:',
      rest: " Deine SCOBY ist ein lebendiger, atmendes Organismus. Mit der richtigen Pflege produziert sie endlos Kombucha — eine Kultur für's Leben.",
    },
    {
      bold: 'DIY-Nachhaltigkeit:',
      rest: ' Braue deinen Kombucha mit einfachen Zutaten zuhause. Keine Chemikalien, keine Plastikflaschen — nur Tee, Zucker und Zeit.',
    },
    {
      bold: 'Geschmacks-Freiheit:',
      rest: ' Kreiere deine Traum-Variante — Hibiskus-Passionsfrucht, Ingwer-Zitrone, Kräutermischungen. Nur du entscheidest.',
    },
  ],

  experienceEyebrow: 'WAS DICH ERWARTET',
  experienceTitle: 'Dein Workshop-Erlebnis',
  experienceCards: [
    {
      eyebrow: 'THEORIE',
      title: 'Kombucha-Mikrobiologie',
      description:
        'Entdecke die Wissenschaft hinter Kombucha. Lerne, wie Bakterien und Hefen zusammenarbeiten, warum eine SCOBY so wertvoll ist, und welche Vorteile probiotische Getränke bieten.',
      image: null,
    },
    {
      eyebrow: 'PRAXIS',
      title: 'Dein Kombucha brauen',
      description:
        'Unter fachkundiger Anleitung stellst du deine erste Charge Kombucha her. Mit einer frischen SCOBY und hochwertigen Zutaten kreierst du einen lebendigen Ferment zum Mitnehmen.',
      image: null,
    },
    {
      eyebrow: 'GESCHMACK',
      title: 'Kreative Variationen',
      description:
        'Erkunde unzählige Geschmackskombinationen — von fruchtigen Varianten bis zu würzigen Experimenten. Verkoste verschiedene Variationen und finde deine Lieblingskombination.',
      image: null,
    },
  ],

  datesHeading: 'Nächste Workshops',
  dates: [
    {
      id: 'kombucha-1',
      date: '7. März 2026',
      time: '14:00 – 17:00',
      spotsLeft: 8,
    },
    {
      id: 'kombucha-2',
      date: '21. März 2026',
      time: '10:00 – 13:00',
      spotsLeft: 6,
    },
    {
      id: 'kombucha-3',
      date: '4. April 2026',
      time: '14:00 – 17:00',
      spotsLeft: 10,
    },
    {
      id: 'kombucha-4',
      date: '18. April 2026',
      time: '10:00 – 13:00',
      spotsLeft: 7,
    },
  ],

  // UI labels (German defaults)
  viewDatesLabel: 'Termine & Buchen',
  hideDatesLabel: 'Termine ausblenden',
  moreInfoLabel: 'Mehr Informationen',
  bookLabel: 'Buchen',
  spotsLabel: 'Plätze verfügbar',
  closeLabel: 'Schließen',

  // Booking modal
  confirmHeading: 'Buchung bestätigen',
  confirmSubheading: 'Überprüfe deine Angaben',
  workshopLabel: 'Workshop',
  dateLabel: 'Datum',
  timeLabel: 'Uhrzeit',
  totalLabel: 'Summe',
  cancelLabel: 'Abbrechen',
  confirmLabel: 'Buchung bestätigen',
  modalConfirmSubheading: 'Bitte überprüfe deine Buchung',
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Datum',
  modalTimeLabel: 'Uhrzeit',
  modalTotalLabel: 'Gesamtbetrag',
  modalCancelLabel: 'Abbrechen',
  modalConfirmLabel: 'Bestätigen',

  // ── 3. How-To Articles ─────────────────────────────────
  howToEyebrow: 'FERMENTATIONS-LEITFADEN',
  howToTitle: 'Schritt-für-Schritt Anleitungen',
  howToDescription: 'Detaillierte Anleitungen für jede Fermentationsmethode.',

  // ── 4. Voucher CTA ─────────────────────────────────────
  voucherEyebrow: 'GEMEINSAM FERMENTIEREN',
  voucherTitle: 'Schenke Kombucha-Abenteuer',
  voucherDescription:
    'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und Gesundheitsenthusiast*innen.',
  voucherPrimaryLabel: 'Gutschein kaufen',
  voucherPrimaryHref: '/voucher',
  voucherSecondaryLabel: 'Zum Shop',
  voucherSecondaryHref: '/shop',
  voucherPills: [
    { text: 'Sofort einlösbar' },
    { text: 'Für alle Workshops' },
    { text: 'Digital oder gedruckt' },
  ],

  // ── 5. FAQ ──────────────────────────────────────────────
  faqEyebrow: 'HÄUFIG GESTELLTE FRAGEN',
  faqTitle: 'Du hast Fragen zu Kombucha?',
  faqDescription: 'Alles, was du über unseren Kombucha-Workshop wissen musst.',
  faqItems: [
    {
      question: 'Muss ich den SCOBY nach dem Workshop im Kühlschrank lagern?',
      answer:
        'Nein! Dein frischer SCOBY und die Starter-Flüssigkeit sollten bei Zimmertemperatur (20–25°C) bleiben, damit sie aktiv bleiben. Lagere sie in einem Glas mit Tuch abgedeckt. Überprüfe sie einmal pro Woche und erfrische bei längeren Pausen mit süßem Tee.',
    },
    {
      question: 'Was muss ich zum Workshop mitbringen?',
      answer:
        'Gar nichts! Wir stellen alles bereit: Bio-Schwarztee, Zucker, SCOBY, Glas-Behälter, Flaschen und alle Werkzeuge zum Mitnehmen. Trage bequeme Kleidung und teile uns eventuelle Allergien vorab mit.',
    },
    {
      question: 'Wie groß sind die Workshop-Gruppen?',
      answer:
        'Unsere Workshops haben maximal 12 Teilnehmer*innen, damit jede*r genug persönliche Betreuung bekommt. Ab 8 Personen bieten wir auch private Gruppen-Workshops an — schreib uns für ein individuelles Angebot.',
    },
    {
      question: 'Wie lange dauert der Workshop und wann fängt er an?',
      answer:
        'Der Kombucha-Workshop dauert ca. 3 Stunden. Bitte sei 10 Minuten vor Beginn da, damit wir pünktlich starten können. Genaue Uhrzeiten findest du bei den einzelnen Terminen oben.',
    },
    {
      question: 'Ist der Workshop für Anfänger geeignet?',
      answer:
        'Absolut! Unsere Workshops sind speziell für Einsteiger*innen konzipiert. Du brauchst keinerlei Vorkenntnisse. Wir erklären alles Schritt für Schritt — von der Wissenschaft bis zur Praxis.',
    },
    {
      question: 'Ist Kombucha vegan?',
      answer:
        'Ja! Kombucha ist vollständig pflanzlich und besteht aus schwarzem oder grünem Tee, Zucker und einer SCOBY. Im Workshop zeigen wir auch wie du verschiedene Tee- und Geschmacksvariationen nutzt. Die Verkostung bietet rein vegane Optionen.',
    },
  ],
}

// ═══════════════════════════════════════════════════════════════
//  EN — English seed data for Kombucha
// ═══════════════════════════════════════════════════════════════

const workshopDetailEN = {
  // ── Calendar Toggle ────────────────────────────────────
  showSeasonalCalendar: false,

  heroEyebrow: 'Workshop Experience',
  heroTitle: 'The Art of\nKombucha Fermentation',
  heroDescription:
    'Learn step by step how to brew probiotic kombucha at home — with black tea, sugar, and your own SCOBY. A fascinating fermentation adventure awaits.',
  heroAttributes: [{ text: '3 Hours' }, { text: 'Hands-on' }, { text: 'Experience' }],

  // ── 2. Booking Card ────────────────────────────────────
  bookingEyebrow: '3-HOUR HANDS-ON WORKSHOP',
  bookingPrice: 79,
  bookingPriceSuffix: 'per person',
  bookingCurrency: '€',
  bookingAttributes: [
    { text: '3 Hours' },
    { text: 'Hands-on' },
    { text: 'Exclusive' },
    { text: 'Max. 12 people' },
  ],
  bookingViewDatesLabel: 'View Dates & Book',
  bookingHideDatesLabel: 'Hide Dates',
  bookingMoreDetailsLabel: 'More Information',
  bookingBookLabel: 'Book',
  bookingSpotsLabel: 'spots available',

  // ── 3. Workshop Details (About, Schedule, Included, Why, Experience, Dates) ────
  aboutHeading: 'About the Workshop',
  aboutText:
    "Explore the fascinating world of kombucha brewing. In this hands-on workshop, you'll learn step by step how to make probiotic kombucha yourself — from tea preparation to fermentation. You'll discover what conditions kombucha needs for optimal growth, and you'll receive a complete starter kit to take home. Whether you're a beginner or a curious health enthusiast, this workshop is designed for everyone who wants to expand their fermentation skills and discover probiotic kombucha.",

  scheduleHeading: 'Schedule (3 Hours)',
  schedule: [
    {
      duration: '45 min',
      title: 'Kombucha Basics & Science',
      description:
        'Dive into the world of kombucha with us. Learn how fermentation works, what a SCOBY is, and discover the health benefits of probiotic beverages.',
    },
    {
      duration: '90 min',
      title: 'Practice: Brew Your Kombucha',
      description:
        'Now it gets hands-on. Under guidance, you prepare premium black tea and brew your first kombucha batch with a fresh SCOBY. We show you how to create the perfect fermentation environment at home.',
    },
    {
      duration: '45 min',
      title: 'Bottling & Flavor Variations',
      description:
        'The finale is fruity and fun. We bottle finished kombucha and explore exciting flavor combinations — fruits, herbs, and spices. A delicious tasting awaits you.',
    },
  ],

  includedHeading: 'Included in Price (€79)',
  includedItems: [
    { text: 'Fresh SCOBY and kombucha starter to take home' },
    { text: 'Premium organic black tea (enough for your first batch)' },
    { text: 'Complete fermentation kit for home (glass vessel + cloth)' },
    { text: 'Comprehensive guide with infographics & recipes' },
    { text: 'Group tasting with various flavor combinations' },
    { text: 'Troubleshooting reference card' },
    { text: 'Digital resource collection' },
    { text: '14-day email support' },
  ],

  whyHeading: 'Why This Workshop?',
  whyPoints: [
    {
      bold: 'Health Boost:',
      rest: ' Kombucha delivers natural probiotics instead of expensive store-bought bottles. Homemade is 10x cheaper.',
    },
    {
      bold: 'Living Culture:',
      rest: ' Your SCOBY is a living, breathing organism. With proper care, it produces kombucha endlessly — a culture for life.',
    },
    {
      bold: 'DIY Sustainability:',
      rest: ' Brew your kombucha at home with simple ingredients. No chemicals, no plastic bottles — just tea, sugar, and time.',
    },
    {
      bold: 'Flavor Freedom:',
      rest: ' Create your dream flavor — hibiscus-passion fruit, ginger-lemon, herbal blends. You decide everything.',
    },
  ],

  experienceEyebrow: 'WHAT TO EXPECT',
  experienceTitle: 'Your Workshop Experience',
  experienceCards: [
    {
      eyebrow: 'THEORY',
      title: 'Kombucha Microbiology',
      description:
        'Discover the science behind kombucha. Learn how bacteria and yeasts work together, why a SCOBY is so valuable, and what benefits probiotic drinks offer.',
      image: null as null,
    },
    {
      eyebrow: 'PRACTICE',
      title: 'Brew Your Kombucha',
      description:
        "Under expert guidance, brew your first batch of kombucha. With a fresh SCOBY and quality ingredients, you'll create a living ferment to take home.",
      image: null as null,
    },
    {
      eyebrow: 'FLAVOR',
      title: 'Creative Variations',
      description:
        'Explore endless flavor possibilities — from fruity variations to spicy experiments. Taste different options and discover your favorite combination.',
      image: null as null,
    },
  ],

  datesHeading: 'Next Workshops',
  dates: [
    {
      id: 'kombucha-1',
      date: 'March 7, 2026',
      time: '2:00 PM – 5:00 PM',
      spotsLeft: 8,
    },
    {
      id: 'kombucha-2',
      date: 'March 21, 2026',
      time: '10:00 AM – 1:00 PM',
      spotsLeft: 6,
    },
    {
      id: 'kombucha-3',
      date: 'April 4, 2026',
      time: '2:00 PM – 5:00 PM',
      spotsLeft: 10,
    },
    {
      id: 'kombucha-4',
      date: 'April 18, 2026',
      time: '10:00 AM – 1:00 PM',
      spotsLeft: 7,
    },
  ],

  // UI labels (English defaults)
  viewDatesLabel: 'View Dates & Book',
  hideDatesLabel: 'Hide Dates',
  moreInfoLabel: 'More Information',
  bookLabel: 'Book',
  spotsLabel: 'spots left',
  closeLabel: 'Close',

  // Booking modal
  confirmHeading: 'Confirm Booking',
  confirmSubheading: 'Review your details',
  workshopLabel: 'Workshop',
  dateLabel: 'Date',
  timeLabel: 'Time',
  totalLabel: 'Total',
  cancelLabel: 'Cancel',
  confirmLabel: 'Confirm Booking',

  // ── 3. How-To Articles ─────────────────────────────────
  howToEyebrow: 'FERMENTATION GUIDE',
  howToTitle: 'Step-by-Step Instructions',
  howToDescription: 'Detailed guides for each fermentation method.',

  // ── 4. Voucher CTA ─────────────────────────────────────
  voucherEyebrow: 'FERMENT TOGETHER',
  voucherTitle: 'Give a Kombucha Adventure',
  voucherDescription:
    'Give someone a special experience — our vouchers are the perfect gift for foodies and health-conscious friends.',
  voucherPrimaryLabel: 'Buy Voucher',
  voucherPrimaryHref: '/voucher',
  voucherSecondaryLabel: 'Visit Shop',
  voucherSecondaryHref: '/shop',
  voucherPills: [
    { text: 'Instantly Redeemable' },
    { text: 'For All Workshops' },
    { text: 'Digital or Printed' },
  ],

  faqEyebrow: 'FREQUENTLY ASKED QUESTIONS',
  faqTitle: 'Do you have questions about kombucha?',
  faqDescription: 'Everything you need to know about our kombucha workshop.',
  faqItems: [
    {
      question: 'Do I need to keep my SCOBY in the fridge after the workshop?',
      answer:
        'No! Your fresh SCOBY and starter liquid should stay at room temperature (68–77°F / 20–25°C) to remain active. Store it in a glass jar covered with a cloth. Check it once a week and refresh with sweet tea if resting for more than a month.',
    },
    {
      question: 'What do I need to bring to the workshop?',
      answer:
        'Nothing! We provide everything: organic black tea, sugar, SCOBY, glass vessels, bottles, and all tools to take home. Wear comfortable clothes and let us know about any allergies in advance.',
    },
    {
      question: 'How large are the workshop groups?',
      answer:
        'Our workshops have a maximum of 12 participants to ensure everyone gets personal attention. For groups of 8 or more, we also offer private group workshops — email us at info@fermentfreude.de for a custom quote.',
    },
    {
      question: 'How long is the workshop and when does it start?',
      answer:
        "The Kombucha workshop lasts about 3 hours. Please arrive 10 minutes early so we can start on time. You'll find exact times listed with each date above.",
    },
    {
      question: 'Is this workshop suitable for beginners?',
      answer:
        'Absolutely! Our workshops are designed specifically for beginners. You need zero prior experience. We explain everything step by step — from the science to the brewing, fermentation, and flavoring.',
    },
    {
      question: 'Is kombucha vegan?',
      answer:
        'Yes, kombucha is completely plant-based — made from black or green tea, sugar, and a SCOBY. In the workshop, we also show you how to use different tea and flavor variations. The tasting offers purely vegan options.',
    },
  ],
}

// ═══════════════════════════════════════════════════════════════
//  Seed Logic
// ═══════════════════════════════════════════════════════════════

async function seedKombuchaDetail() {
  const payload = await getPayload({ config })
  const pageSlug = 'kombucha'

  try {
    // ── Find the existing page ──────────────────────────────
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: pageSlug } },
      locale: 'de',
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length === 0) {
      payload.logger.error(`❌ Page "${pageSlug}" not found. Run "pnpm seed workshop-pages" first.`)
      process.exit(1)
    }

    const page = existing.docs[0]
    const pageId = page.id

    // ── Non-destructive check ───────────────────────────────
    const detail = (page as unknown as Record<string, unknown>).workshopDetail as
      | Record<string, unknown>
      | undefined
    if (detail?.aboutText && !isForce) {
      payload.logger.info(
        `⏭️  workshopDetail already has data for "${pageSlug}". Use --force to overwrite.`,
      )
      process.exit(0)
    }

    // STEP 1: Save German content
    console.log(`[${new Date().toLocaleTimeString()}] Seeding "${pageSlug}" (DE)...`)
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      data: { workshopDetail: workshopDetailDE },
      context: ctx,
    })

    // STEP 2: Read back the saved document to capture any generated array IDs
    console.log(
      `[${new Date().toLocaleTimeString()}] Reading saved German content to capture generated IDs...`,
    )
    const dePage = await payload.findByID({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      depth: 0,
    })

    // STEP 3: Merge English data (reuse any IDs from German)
    const mergedEN = {
      ...workshopDetailEN,
      // Preserve any generated IDs from German arrays
      heroAttributes: dePage.workshopDetail?.heroAttributes?.map(
        (attr: { id?: string | null }, i: number) => ({
          ...workshopDetailEN.heroAttributes?.[i],
          id: attr.id,
        }),
      ),
      bookingAttributes: dePage.workshopDetail?.bookingAttributes?.map(
        (attr: { id?: string | null }, i: number) => ({
          ...workshopDetailEN.bookingAttributes?.[i],
          id: attr.id,
        }),
      ),
      schedule: dePage.workshopDetail?.schedule?.map((step: { id?: string | null }, i: number) => ({
        ...workshopDetailEN.schedule?.[i],
        id: step.id,
      })),
      includedItems: dePage.workshopDetail?.includedItems?.map(
        (item: { id?: string | null }, i: number) => ({
          ...workshopDetailEN.includedItems?.[i],
          id: item.id,
        }),
      ),
      whyPoints: dePage.workshopDetail?.whyPoints?.map(
        (point: { id?: string | null }, i: number) => ({
          ...workshopDetailEN.whyPoints?.[i],
          id: point.id,
        }),
      ),
      experienceCards: dePage.workshopDetail?.experienceCards?.map(
        (card: { id?: string | null; image?: unknown }, i: number) => ({
          ...workshopDetailEN.experienceCards?.[i],
          id: card.id,
          image: card.image || null, // Preserve German image if present, else null
        }),
      ),
      voucherPills: dePage.workshopDetail?.voucherPills?.map(
        (pill: { id?: string | null }, i: number) => ({
          ...workshopDetailEN.voucherPills?.[i],
          id: pill.id,
        }),
      ),
      faqItems: dePage.workshopDetail?.faqItems?.map((item: { id?: string | null }, i: number) => ({
        ...workshopDetailEN.faqItems?.[i],
        id: item.id,
      })),
      dates: dePage.workshopDetail?.dates?.map((date: { id?: string | null }, i: number) => ({
        ...workshopDetailEN.dates?.[i],
        id: date.id,
      })),
    }

    // STEP 4: Save English content with preserved IDs
    console.log(`[${new Date().toLocaleTimeString()}] Seeding "${pageSlug}" (EN)...`)
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'en',
      data: { workshopDetail: mergedEN },
      context: ctx,
    })

    payload.logger.info(`✅ German content seeded for "${pageSlug}".`)

    payload.logger.info(`✅ English content seeded for "${pageSlug}".`)
    console.log(`\n✨ Successfully seeded "${pageSlug}" in both languages!`)
    process.exit(0)
  } catch (error) {
    console.error(`❌ Error seeding "${pageSlug}":`, error)
    process.exit(1)
  }
}

seedKombuchaDetail()
