/**
 * Seed the Vom Feld ins Glas CMS page + discoverability.
 *
 * - Creates / updates pages slug `vom-feld-ins-glas` with workshopDetail (FAQ, voucher, howTo, calendar, slider)
 * - Links Feld Tipps posts as howToArticles
 * - Adds nav item to Header (if missing)
 * - Adds WorkshopSlider card on home (if missing)
 *
 * Run:  pnpm seed feld-ins-glas-page
 *       pnpm seed feld-ins-glas-page --force
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

loadEnv()

import { FELD_INS_GLAS_HOWTO_SLUGS, getFeldInsGlasCalendar } from '@/app/(app)/workshops/[slug]/FeldInsGlas/data'
import config from '@payload-config'
import { getPayload } from 'payload'

const isForce = process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const SLUG = 'vom-feld-ins-glas'

const calendarDE = getFeldInsGlasCalendar('de')
const calendarEN = getFeldInsGlasCalendar('en')

const workshopDetailDE = {
  showSeasonalCalendar: true,
  heroEyebrow: 'Spezial-Workshop',
  heroTitle: 'Vom Feld\nins Glas',
  heroDescription:
    'Ein ganzer Tag im Marktgarten von der Ernte bis ins fermentierte Glas.',
  heroPrimaryCtaLabel: 'Jetzt buchen',
  heroSecondaryCtaLabel: 'Mehr erfahren',
  heroSealRingText: 'EINMALIGE VERANSTALTUNG',
  heroSealCenterLine1: 'FER',
  heroSealCenterLine2: 'MEN',
  heroAttributes: [
    { text: 'ca. 4 Std' },
    { text: 'Hands-on' },
    { text: 'Marktgarten' },
    { text: 'Max. 12 Personen' },
  ],
  conceptEyebrow: 'Das Konzept',
  conceptTitle: 'Der kürzeste Weg vom Feld ins Glas.',
  conceptQuote:
    'Fermentation beginnt dort, wo die Ernte endet — nicht in der Fabrik, sondern in der eigenen Hand.',
  conceptText:
    'Gemeinsam besuchen wir den Marktgarten „Unser Bauerngarten“ in Graz, ernten saisonal, was der Tag gibt, und verwandeln es noch vor Ort in lebendige, haltbare Fermente. Du lernst nicht aus einem Buch — sondern mit Erde an den Fingern.',
  conceptTextSecondary:
    'Der Workshop ist einmalig: kein Studio, keine Kursküche. Nur ein Garten, eine Gemeinschaft und das Handwerk der Fermentation in seiner reinsten Form.',
  conceptSeasonMonths: 'Aug – Okt',
  conceptSeasonLabel: 'Saison 2025',
  journeySections: [
    {
      label: '01',
      name: 'Feld',
      title: 'Der Garten als Ausgangspunkt',
      description:
        'Der Tag beginnt nicht in der Küche, sondern draußen. Du lernst, was reif ist, wie man erntet ohne zu beschädigen, und warum das Timing über die Qualität des Fermentes entscheidet.',
      bullets: [
        { text: 'Saisonale Ernte mit Anleitung im Marktgarten' },
        { text: 'Sortenvielfalt & Bodenqualität als Geschmacksfaktor' },
        { text: 'Biozertifiziertes Saatgut, keine Pestizide' },
        { text: 'Direkter Kontakt zur landwirtschaftlichen Praxis' },
      ],
    },
    {
      label: '02',
      name: 'Küche',
      title: 'Handwerk statt Rezeptkarte',
      description:
        'Theorie und Praxis am Ort der Ernte: Wie Fermentation funktioniert, welche Vorteile sie hat, und unter Anleitung bereitest du drei Lakto-Gemüse-Fermente zu.',
      bullets: [
        { text: 'Grundlagen der milchsauren Fermentation' },
        { text: 'Drei Fermente: Zucchini-Pickels, Gurken-Relish, Karfiol-Kimchi' },
        { text: 'Salz, Zeit und Gefühl statt starre Rezepte' },
        { text: 'Hygiene und Sicherheit im offenen Garten' },
      ],
    },
    {
      label: '03',
      name: 'Glas',
      title: 'Dein Ferment, deine Signatur',
      description:
        'Am Ende des Tages gehst du nicht mit leeren Händen. Jedes Glas, das du befüllt hast, trägt deine Handschrift — die Auswahl, den Rhythmus, den Geschmack des Tages.',
      bullets: [
        { text: 'Bis zu 3 verschiedene Fermente zum Mitnehmen' },
        { text: 'Etikettierung & Lagertipps für zu Hause' },
        { text: 'Rezeptkarte für jedes Ferment' },
        { text: 'Zugang zum FermentFreude Online-Archiv' },
      ],
    },
  ],
  bookingEyebrow: 'Fermentations-Workshop',
  bookingTitle: 'Vom Feld ins Glas',
  bookingPrice: 99,
  bookingPriceSuffix: 'pro Person',
  bookingCurrency: '€',
  bookingAttributes: [
    { text: 'ca. 4 Std' },
    { text: 'Hands-on' },
    { text: 'Marktgarten' },
    { text: 'Max. 12 Personen' },
  ],
  bookingViewDatesLabel: 'Termin auswählen',
  bookingHideDatesLabel: 'Termine ausblenden',
  bookingMoreDetailsLabel: 'Mehr Informationen',
  bookingBookLabel: 'Buchen',
  bookingSpotsLabel: 'Plätze frei',
  aboutHeading: 'Über diesen Spezial-Workshop',
  aboutText:
    'Du lernst nicht nur, wie Fermentation funktioniert, sondern auch, wo die Zutaten herkommen. Nicht in der Grabenstraße, sondern im Freien beim Marktgarten „Unser Bauerngarten“.',
  scheduleHeading: 'Workshop-Inhalt',
  schedule: [
    {
      duration: '01',
      title: 'Theorie',
      description: 'Wie funktioniert Fermentation? Welche Vorteile hat sie? Überblick über die wichtigsten Techniken.',
    },
    {
      duration: '02',
      title: 'Ernte im Bauerngarten',
      description: 'Gemeinsam ernten wir frisches, saisonales Gemüse direkt am Feld.',
    },
    {
      duration: '03',
      title: 'Praxis',
      description: 'Drei Lakto-Fermente: Zucchini-Pickels, Gurken-Relish und Karfiol-Kimchi. Alle Gläser nimmst du mit.',
    },
    {
      duration: '04',
      title: 'Verkostung',
      description: 'Ferment-Brettljaus’n (auf Wunsch vegan): natürlich, überraschend und aromatisch.',
    },
  ],
  includedHeading: 'Im Preis enthalten',
  includedItems: [
    { text: 'Gemeinsame Gemüseernte im Bauerngarten' },
    { text: 'Drei Fermente zum Mitnehmen inkl. Gärgefäße' },
    { text: 'Ausführliches Skript mit allen Rezepten' },
    { text: 'Gemeinsame Verkostung + Getränke' },
  ],
  whyHeading: 'Rahmeninfos',
  whyPoints: [
    { bold: 'Dauer: ', rest: 'ca. 4 Stunden' },
    {
      bold: 'Für wen: ',
      rest: 'Für alle, vom Neuling bis zur Fermentier-Profi.',
    },
    {
      bold: 'Mitbringen: ',
      rest: 'Wetterfeste Kleidung, festes Schuhwerk, bei Bedarf Sonnenschutz.',
    },
    {
      bold: 'Ort: ',
      rest: 'Marktgarten „Unser Bauerngarten“, Hochfeldweg, Graz.',
    },
  ],
  experienceCards: [],
  datesHeading: 'Termine',
  dates: [],
  calendarEyebrow: calendarDE.eyebrow,
  calendarTitle: calendarDE.title,
  calendarDescription: calendarDE.description,
  calendarMonths: calendarDE.months,
  useGlobalVoucherData: false,
  voucherEyebrow: 'Geschenk',
  voucherTitle: 'Verschenke Fermentation als Erlebnis.',
  voucherDescription:
    'Ein FermentFreude-Gutschein für „Vom Feld ins Glas“ — für Menschen, die mehr suchen als ein Kochbuch. Schöner verpackt, per Post oder digital, mit persönlicher Widmung.',
  voucherPrimaryLabel: 'Gutschein bestellen',
  voucherPrimaryHref: '/workshops/voucher',
  voucherSecondaryLabel: 'Zum Shop',
  voucherSecondaryHref: '/shop',
  voucherImageQuote: '„Das schönste Geschenk ist Zeit — im Garten.“',
  voucherPills: [
    { text: 'Einlösbar für alle Termine 2025' },
    { text: 'Kostenloser Versand (gedruckt)' },
    { text: 'Mit persönlicher Botschaft' },
    { text: 'Auch als PDF zum Sofortversand' },
  ],
  faqEyebrow: 'HÄUFIGE FRAGEN',
  faqTitle: 'Gut zu wissen',
  faqDescription:
    'Alles rund um den Marktgarten-Workshop — von Kleidung bis Anfahrt.',
  faqItems: [
    {
      question: 'Wo findet der Workshop statt?',
      answer:
        'Beim Marktgarten „Unser Bauerngarten“ am Hochfeldweg in Graz — nicht in unserem Studio an der Grabenstraße. Die genaue Adresse und Anfahrt schicken wir dir mit der Buchungsbestätigung.',
    },
    {
      question: 'Was muss ich mitbringen?',
      answer:
        'Wetterfeste Kleidung, festes Schuhwerk und bei Bedarf Sonnenschutz. Gemüse, Gläser, Gewürze und Equipment stellen wir bereit.',
    },
    {
      question: 'Wie lange dauert der Workshop?',
      answer:
        'Ca. 4 Stunden: Theorie, Ernte, Praxis und Verkostung. Bitte sei 10 Minuten vor Beginn da.',
    },
    {
      question: 'Ist der Workshop für Anfänger geeignet?',
      answer:
        'Ja. Vom Neuling bis zur Fermentier-Profi — Vorkenntnisse sind nicht nötig.',
    },
    {
      question: 'Was nehme ich mit nach Hause?',
      answer:
        'Drei eigene Lakto-Fermente inkl. Gärgefäße (Zucchini-Pickels, Gurken-Relish, Karfiol-Kimchi) und ein Skript mit allen Rezepten.',
    },
    {
      question: 'Wie kann ich stornieren oder umbuchen?',
      answer:
        'Bis 48 Stunden vor dem Workshop kostenlos stornieren oder umbuchen. Schreib an kontakt@fermentfreude.at. Bei späterer Absage behalten wir 50% der Gebühr.',
    },
  ],
  faqContactEmail: 'kontakt@fermentfreude.at',
  howToEyebrow: 'Tipps & Guides',
  howToTitle: 'Alles rund um den Marktgarten-Workshop.',
  howToDescription:
    'Von der Ernte am Feld bis zu deinen drei Fermenten: Anleitungen, Rezepte und praktische Vorbereitung.',
  modalConfirmHeading: 'Buchung bestätigen',
  modalConfirmSubheading: 'Details überprüfen',
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Datum',
  modalTimeLabel: 'Uhrzeit',
  modalTotalLabel: 'Gesamt',
  modalCancelLabel: 'Abbrechen',
  modalConfirmLabel: 'Buchung bestätigen',
  sliderHeading: 'Entdecke weitere Workshops.',
  sliderSubtitle:
    'Wähle deinen Weg in die Welt der Mikroorganismen. Jeder Workshop ist für Einsteiger und Enthusiasten konzipiert.',
  sliderPillLabel: 'Mehr entdecken',
  sliderBuyLabel: 'Jetzt buchen',
  sliderMoreInfoLabel: 'Mehr erfahren',
}

const workshopDetailEN = {
  showSeasonalCalendar: true,
  heroEyebrow: 'Special Workshop',
  heroTitle: 'From Field\nto Jar',
  heroDescription:
    'A full day at the market garden from harvest to the fermented jar.',
  heroPrimaryCtaLabel: 'Book now',
  heroSecondaryCtaLabel: 'Learn more',
  heroSealRingText: 'ONE-TIME EVENT',
  heroSealCenterLine1: 'FER',
  heroSealCenterLine2: 'MEN',
  heroAttributes: [
    { text: '~4 hrs' },
    { text: 'Hands-on' },
    { text: 'Market garden' },
    { text: 'Max. 12 people' },
  ],
  conceptEyebrow: 'The concept',
  conceptTitle: 'The shortest path from field to jar.',
  conceptQuote:
    'Fermentation begins where the harvest ends — not in a factory, but in your own hands.',
  conceptText:
    'Together we visit Marktgarten “Unser Bauerngarten” in Graz, harvest what the day offers, and turn it into living, lasting ferments on site. You don’t learn from a book — you learn with soil on your fingers.',
  conceptTextSecondary:
    'This workshop is unique: no studio, no teaching kitchen. Just a garden, a community, and the craft of fermentation in its purest form.',
  conceptSeasonMonths: 'Aug – Oct',
  conceptSeasonLabel: 'Season 2025',
  journeySections: [
    {
      label: '01',
      name: 'Field',
      title: 'The garden as starting point',
      description:
        'The day doesn’t start in the kitchen, it starts outdoors. You learn what is ripe, how to harvest without damage, and why timing decides the quality of the ferment.',
      bullets: [
        { text: 'Seasonal harvest with guidance in the market garden' },
        { text: 'Variety and soil quality as flavour factors' },
        { text: 'Certified organic seed, no pesticides' },
        { text: 'Direct contact with agricultural practice' },
      ],
    },
    {
      label: '02',
      name: 'Kitchen',
      title: 'Craft instead of a recipe card',
      description:
        'Theory and practice where the harvest happens: how fermentation works, its benefits, and step by step you prepare three lacto-vegetable ferments.',
      bullets: [
        { text: 'Basics of lactic fermentation' },
        { text: 'Three ferments: zucchini pickles, cucumber relish, cauliflower kimchi' },
        { text: 'Salt, time and feel instead of rigid recipes' },
        { text: 'Hygiene and safety in an open garden' },
      ],
    },
    {
      label: '03',
      name: 'Jar',
      title: 'Your ferment, your signature',
      description:
        'At the end of the day you don’t leave empty-handed. Every jar you fill carries your handwriting — the selection, the rhythm, the taste of the day.',
      bullets: [
        { text: 'Up to 3 different ferments to take home' },
        { text: 'Labelling & storage tips for home' },
        { text: 'A recipe card for every ferment' },
        { text: 'Access to the FermentFreude online archive' },
      ],
    },
  ],
  bookingEyebrow: 'Fermentation Workshop',
  bookingTitle: 'From Field to Jar',
  bookingPrice: 99,
  bookingPriceSuffix: 'per person',
  bookingCurrency: '€',
  bookingAttributes: [
    { text: '~4 hrs' },
    { text: 'Hands-on' },
    { text: 'Market garden' },
    { text: 'Max. 12 people' },
  ],
  bookingViewDatesLabel: 'Select a date',
  bookingHideDatesLabel: 'Hide Dates',
  bookingMoreDetailsLabel: 'More Information',
  bookingBookLabel: 'Book',
  bookingSpotsLabel: 'spots left',
  aboutHeading: 'About this special workshop',
  aboutText:
    'You learn how fermentation works and where ingredients come from — outdoors at Marktgarten “Unser Bauerngarten”, not on Grabenstraße.',
  scheduleHeading: 'Workshop content',
  schedule: [
    {
      duration: '01',
      title: 'Theory',
      description: 'How fermentation works, its benefits, and key techniques.',
    },
    {
      duration: '02',
      title: 'Harvest at the garden',
      description: 'Together we harvest fresh seasonal vegetables in the field.',
    },
    {
      duration: '03',
      title: 'Practice',
      description:
        'Three lacto-ferments: zucchini pickles, cucumber relish and cauliflower kimchi. All jars go home with you.',
    },
    {
      duration: '04',
      title: 'Tasting',
      description: 'Ferment Brettljaus’n (vegan on request): natural, surprising, aromatic.',
    },
  ],
  includedHeading: 'Included in the price',
  includedItems: [
    { text: 'Shared vegetable harvest in the market garden' },
    { text: 'Three ferments to take home incl. fermentation jars' },
    { text: 'Detailed script with all recipes' },
    { text: 'Shared tasting + drinks' },
  ],
  whyHeading: 'Practical info',
  whyPoints: [
    { bold: 'Duration: ', rest: 'approx. 4 hours' },
    { bold: 'For whom: ', rest: 'Everyone, from beginners to fermentation pros.' },
    {
      bold: 'Bring: ',
      rest: 'Weatherproof clothing, sturdy shoes, sun protection if needed.',
    },
    {
      bold: 'Location: ',
      rest: 'Marktgarten “Unser Bauerngarten”, Hochfeldweg, Graz.',
    },
  ],
  experienceCards: [],
  datesHeading: 'Dates',
  dates: [],
  calendarEyebrow: calendarEN.eyebrow,
  calendarTitle: calendarEN.title,
  calendarDescription: calendarEN.description,
  calendarMonths: calendarEN.months,
  useGlobalVoucherData: false,
  voucherEyebrow: 'Gift',
  voucherTitle: 'Gift fermentation as an experience.',
  voucherDescription:
    'A FermentFreude voucher for “From Field to Jar” — for people who want more than a cookbook. Beautifully packed, by post or digital, with a personal dedication.',
  voucherPrimaryLabel: 'Order voucher',
  voucherPrimaryHref: '/workshops/voucher',
  voucherSecondaryLabel: 'To the shop',
  voucherSecondaryHref: '/shop',
  voucherImageQuote: '“The most beautiful gift is time — in the garden.”',
  voucherPills: [
    { text: 'Valid for all 2025 dates' },
    { text: 'Free shipping (printed)' },
    { text: 'With a personal message' },
    { text: 'Also as PDF for instant delivery' },
  ],
  faqEyebrow: 'FAQ',
  faqTitle: 'Good to know',
  faqDescription: 'Everything about the market-garden workshop — from clothing to getting there.',
  faqItems: [
    {
      question: 'Where does the workshop take place?',
      answer:
        'At Marktgarten “Unser Bauerngarten” on Hochfeldweg in Graz — not at our Grabenstraße studio. Exact address and directions come with your confirmation email.',
    },
    {
      question: 'What should I bring?',
      answer:
        'Weatherproof clothing, sturdy shoes and sun protection if needed. We provide vegetables, jars, spices and equipment.',
    },
    {
      question: 'How long is the workshop?',
      answer:
        'About 4 hours: theory, harvest, practice and tasting. Please arrive 10 minutes early.',
    },
    {
      question: 'Is it suitable for beginners?',
      answer: 'Yes. From beginners to fermentation pros — no prior knowledge needed.',
    },
    {
      question: 'What do I take home?',
      answer:
        'Three lacto-ferments including jars (zucchini pickles, cucumber relish, cauliflower kimchi) and a recipe script.',
    },
    {
      question: 'How do I cancel or reschedule?',
      answer:
        'Free cancellation or reschedule up to 48 hours before. Email kontakt@fermentfreude.at. Later cancellations keep 50% of the fee.',
    },
  ],
  faqContactEmail: 'kontakt@fermentfreude.at',
  howToEyebrow: 'Tips & Guides',
  howToTitle: 'Everything about the market-garden workshop.',
  howToDescription:
    'From field harvest to your three ferments: guides, recipes and practical prep.',
  modalConfirmHeading: 'Confirm Booking',
  modalConfirmSubheading: 'Review your details',
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Date',
  modalTimeLabel: 'Time',
  modalTotalLabel: 'Total',
  modalCancelLabel: 'Cancel',
  modalConfirmLabel: 'Confirm Booking',
  sliderHeading: 'Discover more workshops.',
  sliderSubtitle:
    'Choose your path into the world of microorganisms. Every workshop is designed for beginners and enthusiasts.',
  sliderPillLabel: 'Discover more',
  sliderBuyLabel: 'Book now',
  sliderMoreInfoLabel: 'Learn more',
}

function mergeArrayIds(
  savedDetail: Record<string, unknown> | undefined,
  enData: Record<string, unknown>,
) {
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
    'journeySections',
  ] as const

  for (const field of arrayFields) {
    const savedArr = (savedDetail?.[field] as Array<{ id?: string }>) ?? []
    const enArr = (enData[field] as Array<Record<string, unknown>>) ?? []
    if (savedArr.length === enArr.length) {
      for (let i = 0; i < enArr.length; i++) {
        if (savedArr[i]?.id) enArr[i].id = savedArr[i].id
      }
    }
  }

  const savedMonths =
    (savedDetail?.calendarMonths as Array<{ id?: string; recipes?: Array<{ id?: string }> }>) ?? []
  const enMonths = (enData.calendarMonths as Array<Record<string, unknown>>) ?? []
  for (let m = 0; m < Math.min(savedMonths.length, enMonths.length); m++) {
    const savedRecipes = savedMonths[m].recipes ?? []
    const enRecipes = (enMonths[m].recipes as Array<Record<string, unknown>>) ?? []
    for (let r = 0; r < Math.min(savedRecipes.length, enRecipes.length); r++) {
      if (savedRecipes[r]?.id) enRecipes[r].id = savedRecipes[r].id
    }
  }

  const savedJourney =
    (savedDetail?.journeySections as Array<{ id?: string; bullets?: Array<{ id?: string }> }>) ??
    []
  const enJourney = (enData.journeySections as Array<Record<string, unknown>>) ?? []
  for (let j = 0; j < Math.min(savedJourney.length, enJourney.length); j++) {
    const savedBullets = savedJourney[j].bullets ?? []
    const enBullets = (enJourney[j].bullets as Array<Record<string, unknown>>) ?? []
    for (let b = 0; b < Math.min(savedBullets.length, enBullets.length); b++) {
      if (savedBullets[b]?.id) enBullets[b].id = savedBullets[b].id
    }
  }
}

function preserveImageFields(
  target: Record<string, unknown>,
  existing?: Record<string, unknown> | null,
) {
  if (!existing) return
  const keys = [
    'heroImage',
    'conceptImage',
    'bookingImage',
    'voucherBackgroundImage',
    'useGlobalVoucherData',
    'voucherImageQuote',
  ] as const
  for (const key of keys) {
    if (existing[key] != null) target[key] = existing[key]
  }
  const existingJourney = existing.journeySections
  if (Array.isArray(existingJourney) && Array.isArray(target.journeySections)) {
    target.journeySections = (target.journeySections as Array<Record<string, unknown>>).map(
      (row, i) => ({
        ...row,
        ...(existingJourney[i] && typeof existingJourney[i] === 'object'
          ? {
              id: (existingJourney[i] as { id?: string }).id,
              image: (existingJourney[i] as { image?: unknown }).image,
            }
          : {}),
      }),
    )
  }
}

async function seedFeldInsGlasPage() {
  const payload = await getPayload({ config })
  payload.logger.info(`Seeding CMS page "${SLUG}"...`)

  // ── Resolve Tipps post IDs ────────────────────────────────
  const postIds: string[] = []
  for (const postSlug of FELD_INS_GLAS_HOWTO_SLUGS) {
    const found = await payload.find({
      collection: 'posts',
      where: { slug: { equals: postSlug } },
      limit: 1,
      depth: 0,
    })
    if (found.docs[0]) postIds.push(found.docs[0].id)
  }
  payload.logger.info(`  · linked ${postIds.length}/${FELD_INS_GLAS_HOWTO_SLUGS.length} Tipps posts`)

  // ── Ensure page exists ────────────────────────────────────
  let page = (
    await payload.find({
      collection: 'pages',
      where: { slug: { equals: SLUG } },
      locale: 'de',
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (!page) {
    page = await payload.create({
      collection: 'pages',
      locale: 'de',
      draft: false,
      data: {
        title: 'Vom Feld ins Glas',
        slug: SLUG,
        _status: 'published',
        hero: { type: 'none' as const },
      },
      context: ctx,
    })
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      data: { title: 'From Field to Jar' },
      context: ctx,
    })
    payload.logger.info(`  ✓ created page ${page.id}`)
  } else {
    payload.logger.info(`  · reuse page ${page.id}`)
  }

  const detail = (page as unknown as { workshopDetail?: { heroTitle?: string } }).workshopDetail
  if (detail?.heroTitle && !isForce) {
    payload.logger.info('  ⏭️  workshopDetail already set — use --force to overwrite text')
  } else {
    const existingDetail = (
      await payload.findByID({
        collection: 'pages',
        id: page.id,
        locale: 'de',
        depth: 0,
      })
    ).workshopDetail as Record<string, unknown> | undefined

    const deData = { ...workshopDetailDE, howToArticles: postIds } as Record<string, unknown>
    preserveImageFields(deData, existingDetail)
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'de',
      data: { workshopDetail: deData, title: 'Vom Feld ins Glas', _status: 'published' } as never,
      context: ctx,
    })

    const saved = await payload.findByID({
      collection: 'pages',
      id: page.id,
      locale: 'de',
      depth: 0,
    })
    const savedDetail = (saved as unknown as { workshopDetail?: Record<string, unknown> })
      .workshopDetail
    const enData = { ...workshopDetailEN, howToArticles: postIds } as Record<string, unknown>
    mergeArrayIds(savedDetail, enData)
    preserveImageFields(enData, savedDetail)

    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      data: {
        title: 'From Field to Jar',
        workshopDetail: enData,
      } as never,
      context: ctx,
    })
    payload.logger.info('  ✓ workshopDetail DE + EN saved')
  }

  // ── Header nav ────────────────────────────────────────────
  const header = await payload.findGlobal({ slug: 'header', locale: 'de', depth: 0 })
  type NavItem = {
    id?: string
    link?: { label?: string; url?: string }
    dropdownItems?: Array<{ id?: string; label?: string; href?: string; isSmall?: boolean }>
  }
  const navItems = (Array.isArray(header.navItems) ? header.navItems : []) as NavItem[]
  const workshopsNav = navItems.find((n) => n.link?.url === '/workshops')
  const alreadyInNav = workshopsNav?.dropdownItems?.some(
    (d) => d.href === `/workshops/${SLUG}`,
  )

  if (workshopsNav && !alreadyInNav) {
    const dropdown = [...(workshopsNav.dropdownItems ?? [])]
    const kombuchaIdx = dropdown.findIndex((d) => d.href === '/workshops/kombucha')
    const insertAt = kombuchaIdx >= 0 ? kombuchaIdx + 1 : dropdown.length
    dropdown.splice(insertAt, 0, {
      label: 'Vom Feld ins Glas',
      href: `/workshops/${SLUG}`,
      isSmall: true,
    })

    const nextNavDE = navItems.map((n) =>
      n.link?.url === '/workshops' ? { ...n, dropdownItems: dropdown } : n,
    )
    await payload.updateGlobal({
      slug: 'header',
      locale: 'de',
      data: { navItems: nextNavDE as never },
      context: ctx,
    })

    const headerDEFresh = await payload.findGlobal({ slug: 'header', locale: 'de', depth: 0 })
    const deNavFresh = (
      Array.isArray(headerDEFresh.navItems) ? headerDEFresh.navItems : []
    ) as NavItem[]
    const nextFromDE = deNavFresh.map((n) => {
      if (n.link?.url !== '/workshops') return n
      return {
        ...n,
        dropdownItems: (n.dropdownItems ?? []).map((d) => ({
          ...d,
          label:
            d.href === `/workshops/${SLUG}`
              ? 'From Field to Jar'
              : d.href === '/workshops/lakto-gemuese'
                ? 'Lacto Vegetables'
                : d.href === '/workshops/tempeh'
                  ? 'Tempeh'
                  : d.href === '/workshops/kombucha'
                    ? 'Kombucha'
                    : d.href === '/workshops'
                      ? 'All Workshops'
                      : d.href === '/courses'
                        ? 'Online Courses'
                        : d.href === '/workshops/voucher'
                          ? 'Workshop Voucher'
                          : (d.label ?? ''),
        })),
      }
    })
    await payload.updateGlobal({
      slug: 'header',
      locale: 'en',
      data: { navItems: nextFromDE as never },
      context: ctx,
    })
    payload.logger.info('  ✓ Header nav updated (DE + EN)')
  } else if (alreadyInNav) {
    payload.logger.info('  · Header already has Vom Feld ins Glas')
  } else {
    payload.logger.warn('  ⚠️  Workshops nav not found — skip header patch')
  }

  // ── Home WorkshopSlider card ──────────────────────────────
  const home = (
    await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      locale: 'de',
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (home) {
    type LayoutBlock = {
      id?: string
      blockType?: string
      workshops?: Array<{
        id?: string
        title?: string
        ctaLink?: string
        image?: string
        image2?: string
        [key: string]: unknown
      }>
      [key: string]: unknown
    }
    const layout = (Array.isArray(home.layout) ? home.layout : []) as LayoutBlock[]
    const slider = layout.find((b) => b.blockType === 'workshopSlider')
    const hasCard = slider?.workshops?.some((w) => w.ctaLink === `/workshops/${SLUG}`)

    if (slider && !hasCard) {
      const media = await payload.find({
        collection: 'media',
        where: { alt: { contains: 'feld-ins-glas-hero-v2' } },
        limit: 1,
      })
      const jars = await payload.find({
        collection: 'media',
        where: { alt: { contains: 'feld-ins-glas-jars-v2' } },
        limit: 1,
      })
      const imageId = media.docs[0]?.id ?? jars.docs[0]?.id
      const image2Id = jars.docs[0]?.id ?? media.docs[0]?.id

      const newCard = {
        title: 'Vom Feld ins Glas',
        audienceTag: 'Marktgarten Edition',
        theme: 'light' as const,
        description:
          'Ernte am Feld, Fermentation in der Praxis, drei Gläser zum Mitnehmen — im Marktgarten „Unser Bauerngarten“.',
        features: [
          { text: 'Dauer: ca. 4 Stunden' },
          { text: 'Nicht im Studio — draußen im Marktgarten' },
          { text: 'Drei Fermente inkl. Gläser zum Mitnehmen' },
          { text: 'Für alle — vom Anfänger bis zum Profi' },
        ],
        ...(imageId ? { image: imageId } : {}),
        ...(image2Id ? { image2: image2Id } : {}),
        ctaLink: `/workshops/${SLUG}`,
        detailsButtonLabel: 'Workshop Details',
      }

      const nextLayoutDE = layout.map((b) =>
        b.blockType === 'workshopSlider'
          ? { ...b, workshops: [...(b.workshops ?? []), newCard] }
          : b,
      )

      await payload.update({
        collection: 'pages',
        id: home.id,
        locale: 'de',
        data: { layout: nextLayoutDE as never },
        context: ctx,
      })

      const homeDE = await payload.findByID({
        collection: 'pages',
        id: home.id,
        locale: 'de',
        depth: 0,
      })
      const layoutDE = (Array.isArray(homeDE.layout) ? homeDE.layout : []) as LayoutBlock[]
      const sliderDE = layoutDE.find((b) => b.blockType === 'workshopSlider')
      const savedCard = sliderDE?.workshops?.find((w) => w.ctaLink === `/workshops/${SLUG}`)

      const homeEN = await payload.findByID({
        collection: 'pages',
        id: home.id,
        locale: 'en',
        depth: 0,
      })
      const layoutEN = (Array.isArray(homeEN.layout) ? homeEN.layout : []) as LayoutBlock[]

      const enCard = {
        ...newCard,
        id: savedCard?.id,
        title: 'From Field to Jar',
        audienceTag: 'Market Garden Edition',
        description:
          'Harvest in the field, hands-on fermentation, three jars to take home — at Marktgarten “Unser Bauerngarten”.',
        features: [
          { text: 'Duration: approx. 4 hours' },
          { text: 'Not in the studio — outdoors at the market garden' },
          { text: 'Three ferments incl. jars to take home' },
          { text: 'For everyone — from beginner to pro' },
        ],
        detailsButtonLabel: 'Workshop Details',
      }

      const nextLayoutEN = layoutEN.map((b) => {
        if (b.blockType !== 'workshopSlider') return b
        const workshops = [...(b.workshops ?? [])]
        if (!workshops.some((w) => w.ctaLink === `/workshops/${SLUG}`)) {
          workshops.push(enCard)
        } else {
          return {
            ...b,
            id: sliderDE?.id ?? b.id,
            workshops: workshops.map((w) =>
              w.ctaLink === `/workshops/${SLUG}` ? { ...enCard, id: w.id ?? savedCard?.id } : w,
            ),
          }
        }
        return { ...b, id: sliderDE?.id ?? b.id, workshops }
      })

      await payload.update({
        collection: 'pages',
        id: home.id,
        locale: 'en',
        data: { layout: nextLayoutEN as never },
        context: ctx,
      })
      payload.logger.info('  ✓ Home WorkshopSlider card added (DE + EN)')
    } else if (hasCard) {
      payload.logger.info('  · Home WorkshopSlider already has Feld card')
    } else {
      payload.logger.warn('  ⚠️  workshopSlider block not on home — skip')
    }
  }

  payload.logger.info('✅ Vom Feld ins Glas CMS page + discoverability done')
  payload.logger.info('   Edit: /admin/collections/pages → vom-feld-ins-glas → Workshop Detail')
  process.exit(0)
}

seedFeldInsGlasPage().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
