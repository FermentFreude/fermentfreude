/**
 * Seed the workshopDetail tab for the tempeh page.
 *
 * Populates all 10 CMS sections with TEXT CONTENT ONLY:
 * Structure matches lakto-gemuese pattern.
 *
 * ⚠️  IMAGES ARE NOT SEEDED
 * Images (heroImage, bookingImage, voucherBackgroundImage) are managed entirely through the admin UI.
 *
 * Run:  pnpm seed tempeh-detail
 *       pnpm seed tempeh-detail --force   (overwrite existing text content)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const isForce = process.argv.includes('--force')

// ═══════════════════════════════════════════════════════════════
//  DE — German seed data for Tempeh
// ═══════════════════════════════════════════════════════════════

const workshopDetailDE = {
  // ── 1. Hero ────────────────────────────────────────────
  heroEyebrow: 'Workshop Experience',
  heroTitle: 'Die Kunst der\nTempeh-Fermentation',
  heroDescription:
    'Tauche ein in die Welt des Tempehs. Lerne Schritt für Schritt, wie du Tempeh selbst herstellst — vom Ansetzen bis zum fertigen, aromatischen Ferment.',
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
    'Entdecke die faszinierende Welt des Tempehs — ein indonesischer Fermentationsklassiker mit großem Zukunftspotenzial. In diesem Hands-on-Workshop lernst du Schritt für Schritt, wie du Tempeh selbst herstellst: vom Ansetzen bis zum fertigen, aromatischen Ferment. Du erfährst, welche Bedingungen Tempeh für ein optimales Wachstum braucht — Wissen, das du sofort zuhause anwenden kannst.',
  scheduleHeading: 'Ablauf (3 Stunden)',
  schedule: [
    {
      duration: '45 Min',
      title: 'Fermentations-Grundlagen',
      description:
        'Tauche gemeinsam in die Welt der Fermentation ein. Erfahre, wie Fermentation funktioniert, welche Vorteile sie hat, und bekomme einen spannenden Überblick über die wichtigsten Techniken.',
    },
    {
      duration: '90 Min',
      title: 'Praxis: Deinen Tempeh ansetzen',
      description:
        'Jetzt geht\'s ans Eingemachte: Unter Anleitung setzt du deinen eigenen Tempeh an — inklusive Starter, Bohnen und Gärgefäß. Wir zeigen dir, wie du zuhause mit einfachen Mitteln (Backrohr mit Lichtfunktion, Dörrautomat, Thermobox oder Heizraum) die ideale Umgebung schaffst.',
    },
    {
      duration: '45 Min',
      title: 'Verkostung: Tempeh-Burger',
      description:
        'Zum Abschluss wird\'s lecker: Gemeinsam braten wir frisch gereiften Tempeh an und bauen daraus saftige Tempeh-Burger mit verschiedenen fermentierten Beilagen. Ein echtes Geschmackserlebnis — natürlich auch in veganer Variante.',
    },
  ],
  includedHeading: 'Im Preis enthalten (€99)',
  includedItems: [
    { text: 'Ein frisch angesetzter Tempeh im Gärgefäß zum Mitnehmen' },
    { text: 'Ein kompletter Tempehkit für zuhause (Bohnen, Starter & Gärgefäß)' },
    { text: 'Ausführliches Skript mit allen Infos & Rezepten' },
    { text: 'Gemeinsame Verkostung (Tempeh-Burger + fermentierte Beilagen) + Getränke' },
    { text: 'Anleitung zu Umgebungsbedingungen für zuhause' },
    { text: 'Troubleshooting-Referenzkarte' },
    { text: 'Digitale Ressourcensammlung' },
    { text: '14-Tage E-Mail-Support' },
  ],
  whyHeading: 'Warum dieser Workshop?',
  whyPoints: [
    {
      bold: 'Pflanzliches Protein:',
      rest: ' Tempeh ist eine vollständige Proteinquelle mit allen essentiellen Aminosäuren — perfekt für Veganer, Vegetarier und alle, die alternative Proteine erforschen.',
    },
    {
      bold: 'Lebende Kulturen:',
      rest: ' Anders als Tofu ist Tempeh ein lebendes, atmendes Ferment mit einzigartigen Aromen und Nährwerten, die sich im Laufe der Zeit entwickeln.',
    },
    {
      bold: 'DIY-Nachhaltigkeit:',
      rest: ' Stelle Tempeh zu Hause mit einfachen, erschwinglichen Zutaten her — keine spezielle Ausrüstung oder komplizierte Prozesse nötig.',
    },
    {
      bold: 'Kulinarische Vielseitigkeit:',
      rest: ' Sobald du Tempeh beherrschst, entdeckst du unzählige Wege, es zuzubereiten — von Burgers bis Stir-Fries, Salate und Sandwiche.',
    },
  ],

  // ── 4. Calendar (copy from lakto for now) ──────────────
  calendarEyebrow: 'DIE SAISONEN DER FERMENTATION',
  calendarTitle: 'Wann fermentierst du am besten?',
  calendarDescription:
    'Der Fermentationsprozess ist ein natürlicher Prozess, der von den Jahreszeiten beeinflusst wird. Hier sind die idealen Monate für jede Fermentationsmethode.',
  calendarMonths: [
    { month: 'January', icon: 'snowflake' },
    { month: 'February', icon: 'snowflake' },
    { month: 'March', icon: 'sprout' },
    { month: 'April', icon: 'sprout' },
    { month: 'May', icon: 'flower' },
    { month: 'June', icon: 'sun' },
    { month: 'July', icon: 'sun' },
    { month: 'August', icon: 'sun' },
    { month: 'September', icon: 'leaf' },
    { month: 'October', icon: 'leaf' },
    { month: 'November', icon: 'wind' },
    { month: 'December', icon: 'snowflake' },
  ],

  // ── 5. How-To Articles (empty for now, can add later) ───
  howToEyebrow: 'FERMENTATIONS-LEITFADEN',
  howToTitle: 'Schritt-für-Schritt Anleitungen',
  howToDescription: 'Detaillierte Anleitungen für jede Fermentationsmethode.',
  howToArticles: [],

  // ── 6. Voucher CTA ────────────────────────────────────
  voucherEyebrow: 'GEMEINSAM FERMENTIEREN',
  voucherTitle: 'Schenke Tempeh-Abenteuer',
  voucherDescription:
    'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und gesundheitsbewusste Freunde.',
  voucherPrimaryLabel: 'Gutschein kaufen',
  voucherPrimaryHref: '/voucher',
  voucherSecondaryLabel: 'Zum Shop',
  voucherSecondaryHref: '/shop',
  voucherPills: [{ text: 'Sofort einlösbar' }, { text: 'Für alle Workshops' }, { text: 'Digital oder gedruckt' }],

  // ── 7. FAQ ────────────────────────────────────────────
  faqEyebrow: 'HÄUFIG GESTELLTE FRAGEN',
  faqTitle: 'Du hast Fragen zu Tempeh?',
  faqItems: [
    {
      question: 'Muss ich den Ofen für 24 Stunden freihalten?',
      answer:
        'Ja, nach dem Workshop solltest du deinen Ofen (oder eine alternative Wärmequelle wie einen Dörrautomat oder eine Thermobox) für etwa 24 Stunden freihalten, damit dein Tempeh richtig fermentieren kann.',
    },
    {
      question: 'Ist der Workshop für Anfänger geeignet?',
      answer:
        'Absolut! Der Workshop ist für jeden konzipiert — ob Anfänger oder neugieriger Genießer. Keine Vorkenntnisse erforderlich.',
    },
    {
      question: 'Kann ich den Workshop verschenken?',
      answer: 'Ja, wir bieten Gutscheine für alle Workshops an, die jederzeit eingelöst werden können.',
    },
    {
      question: 'Ist der Tempeh vegan?',
      answer: 'Tempeh ist pflanzlich, wird aber aus Sojabohnen hergestellt. Im Workshop zeigen wir auch Alternativen mit anderen Hülsenfrüchten.',
    },
    {
      question: 'Was passiert nach dem Workshop?',
      answer:
        'Dein frisch angesetzter Tempeh fermentiert zuhause. Nach etwa 24 Stunden ist er bereit zum Kochen. Du erhältst ein komplettes Kit mit Anleitung.',
    },
    {
      question: 'Gibt es Online-Optionen?',
      answer:
        'Derzeit bieten wir den Tempeh-Workshop nur vor Ort an. Aber wir arbeiten an digitalen Ressourcen für Online-Lerner!',
    },
  ],

  // ── 8. Booking Modal Labels ────────────────────────────
  modalConfirmHeading: 'Booking bestätigen',
  modalConfirmSubheading: 'Bitte überprüfe deine Angaben',
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Datum',
  modalTimeLabel: 'Uhrzeit',
  modalTotalLabel: 'Gesamtpreis',
  modalCancelLabel: 'Abbrechen',
  modalConfirmLabel: 'Buchen bestätigen',
}

// ═══════════════════════════════════════════════════════════════
//  EN — English seed data for Tempeh
// ═══════════════════════════════════════════════════════════════

const workshopDetailEN = {
  heroEyebrow: 'Workshop Experience',
  heroTitle: 'The Art of\nTempeh Fermentation',
  heroDescription:
    'Dive into the fascinating world of tempeh. Learn step by step how to make tempeh yourself — from setup to finished, aromatic ferment.',
  heroAttributes: [{ text: '3 Hours' }, { text: 'Hands-on' }, { text: 'Experience' }],

  bookingEyebrow: '3-HOUR HANDS-ON WORKSHOP',
  bookingPrice: 99,
  bookingPriceSuffix: 'per person',
  bookingCurrency: '€',
  bookingAttributes: [
    { text: '3 Hours' },
    { text: 'Hands-on' },
    { text: 'Experience' },
    { text: 'Max. 12 People' },
  ],
  bookingViewDatesLabel: 'View Dates & Book',
  bookingHideDatesLabel: 'Hide Dates',
  bookingMoreDetailsLabel: 'More Information',
  bookingBookLabel: 'Book',
  bookingSpotsLabel: 'spots left',

  aboutHeading: 'About the Workshop',
  aboutText:
    'Explore the fascinating world of tempeh — an Indonesian fermentation classic with huge potential for plant-based protein lovers. In this hands-on workshop, you will learn step by step how to make tempeh yourself, from setup to finished ferment. You will discover what conditions tempeh needs for optimal growth — knowledge you can apply immediately at home.',
  scheduleHeading: 'Schedule (3 Hours)',
  schedule: [
    {
      duration: '45 min',
      title: 'Fermentation Fundamentals',
      description:
        'Dive into fermentation together. Learn how fermentation works, what benefits it offers, and get an exciting overview of the most important techniques.',
    },
    {
      duration: '90 min',
      title: 'Practice: Setting Your Tempeh',
      description:
        'Now it gets practical. Under guidance, you set up your own tempeh — complete with starter, beans, and fermentation vessel. We show you how to create the ideal environment at home using simple means.',
    },
    {
      duration: '45 min',
      title: 'Tasting: Tempeh Burgers',
      description:
        'At the end it gets delicious. We fry freshly ripened tempeh and create juicy tempeh burgers with various fermented side dishes. A real taste experience — of course also available in vegan form.',
    },
  ],

  includedHeading: 'Included in Price (€99)',
  includedItems: [
    { text: 'Fresh, set tempeh in fermentation vessel to take home' },
    { text: 'Complete tempeh kit for home (beans, starter & vessel)' },
    { text: 'Comprehensive script with all info & recipes' },
    { text: 'Joint tasting (tempeh burgers + fermented sides) + drinks' },
    { text: 'Home setup guide for fermentation conditions' },
    { text: 'Troubleshooting reference card' },
    { text: 'Digital resource collection' },
    { text: '14-day email support' },
  ],

  whyHeading: 'Why This Workshop?',
  whyPoints: [
    {
      bold: 'Plant-Based Protein:',
      rest: ' Tempeh is a complete protein source with all essential amino acids — perfect for vegans, vegetarians, and anyone exploring alternative proteins.',
    },
    {
      bold: 'Living Cultures:',
      rest: ' Unlike tofu, tempeh is a living, breathing ferment with unique flavors and nutritional values that develop over time.',
    },
    {
      bold: 'DIY Sustainability:',
      rest: ' Make your own tempeh at home using simple, affordable ingredients — no special equipment needed.',
    },
    {
      bold: 'Culinary Versatility:',
      rest: ' Once you master tempeh, you\'ll discover countless ways to cook it — from burgers to stir-fries, salads, and sandwiches.',
    },
  ],

  calendarEyebrow: 'FERMENTATION SEASONS',
  calendarTitle: 'When is the best time to ferment?',
  calendarDescription:
    'Fermentation is a natural process influenced by the seasons. Here are the ideal months for each fermentation method.',
  calendarMonths: [
    { month: 'January', icon: 'snowflake' },
    { month: 'February', icon: 'snowflake' },
    { month: 'March', icon: 'sprout' },
    { month: 'April', icon: 'sprout' },
    { month: 'May', icon: 'flower' },
    { month: 'June', icon: 'sun' },
    { month: 'July', icon: 'sun' },
    { month: 'August', icon: 'sun' },
    { month: 'September', icon: 'leaf' },
    { month: 'October', icon: 'leaf' },
    { month: 'November', icon: 'wind' },
    { month: 'December', icon: 'snowflake' },
  ],

  howToEyebrow: 'FERMENTATION GUIDE',
  howToTitle: 'Step-by-Step Instructions',
  howToDescription: 'Detailed guides for each fermentation method.',
  howToArticles: [],

  voucherEyebrow: 'FERMENT TOGETHER',
  voucherTitle: 'Give a Tempeh Adventure',
  voucherDescription:
    'Give someone a special experience — our vouchers are the perfect gift for foodies and health-conscious friends.',
  voucherPrimaryLabel: 'Buy Voucher',
  voucherPrimaryHref: '/voucher',
  voucherSecondaryLabel: 'Visit Shop',
  voucherSecondaryHref: '/shop',
  voucherPills: [{ text: 'Instantly Redeemable' }, { text: 'For All Workshops' }, { text: 'Digital or Printed' }],

  faqEyebrow: 'FREQUENTLY ASKED QUESTIONS',
  faqTitle: 'Do you have questions about tempeh?',
  faqItems: [
    {
      question: 'Do I need to keep my oven free for 24 hours?',
      answer:
        'Yes, after the workshop you should keep your oven (or an alternative heat source like a dehydrator or heat box) free for about 24 hours so your tempeh can ferment properly.',
    },
    {
      question: 'Is the workshop suitable for beginners?',
      answer:
        'Absolutely! The workshop is designed for everyone — whether beginner or curious food enthusiast. No prior knowledge required.',
    },
    {
      question: 'Can I gift the workshop?',
      answer: 'Yes, we offer vouchers for all workshops that can be redeemed at any time.',
    },
    {
      question: 'Is tempeh vegan?',
      answer: 'Tempeh is plant-based, made from soybeans. In the workshop we also show alternatives using other legumes.',
    },
    {
      question: 'What happens after the workshop?',
      answer:
        'Your freshly set tempeh ferments at home. After about 24 hours it\'s ready to cook. You receive a complete kit with instructions.',
    },
    {
      question: 'Are there online options?',
      answer:
        'Currently we only offer the Tempeh workshop on-site. But we\'re working on digital resources for online learners!',
    },
  ],

  modalConfirmHeading: 'Confirm Booking',
  modalConfirmSubheading: 'Please review your details',
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Date',
  modalTimeLabel: 'Time',
  modalTotalLabel: 'Total',
  modalCancelLabel: 'Cancel',
  modalConfirmLabel: 'Confirm Booking',
}

// ═══════════════════════════════════════════════════════════════
//  Seed Logic
// ═══════════════════════════════════════════════════════════════

async function seedTempehDetail() {
  const payload = await getPayload({ config })
  const pageSlug = 'tempeh'

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
      payload.logger.error(
        `❌ Page "${pageSlug}" not found. Run "pnpm seed workshop-pages" first.`,
      )
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

    // STEP 2: Read back to capture any generated IDs
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
      heroAttributes: dePage.workshopDetail?.heroAttributes?.map((attr, i) => ({
        ...workshopDetailEN.heroAttributes?.[i],
        id: attr.id,
      })),
      bookingAttributes: dePage.workshopDetail?.bookingAttributes?.map((attr, i) => ({
        ...workshopDetailEN.bookingAttributes?.[i],
        id: attr.id,
      })),
      schedule: dePage.workshopDetail?.schedule?.map((item, i) => ({
        ...workshopDetailEN.schedule?.[i],
        id: item.id,
      })),
      includedItems: dePage.workshopDetail?.includedItems?.map((item, i) => ({
        ...workshopDetailEN.includedItems?.[i],
        id: item.id,
      })),
      whyPoints: dePage.workshopDetail?.whyPoints?.map((point, i) => ({
        ...workshopDetailEN.whyPoints?.[i],
        id: point.id,
      })),
      voucherPills: dePage.workshopDetail?.voucherPills?.map((pill, i) => ({
        ...workshopDetailEN.voucherPills?.[i],
        id: pill.id,
      })),
      faqItems: dePage.workshopDetail?.faqItems?.map((item, i) => ({
        ...workshopDetailEN.faqItems?.[i],
        id: item.id,
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

    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ workshopDetail seeded for "${pageSlug}" (DE + EN)`,
    )
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error seeding "${pageSlug}":`, error)
    process.exit(1)
  }
}

seedTempehDetail()
