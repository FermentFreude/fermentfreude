/**
 * Vom Feld ins Glas — Marktgarten special workshop
 * Copy aligned with: ferment-freude.at/service-page/vom-feld-ins-glas
 * CMS: pages → vom-feld-ins-glas → Workshop Detail (FAQ, voucher, howTo, calendar, slider)
 */

import type { WorkshopDetailData } from '../workshop-data'

export const FELD_INS_GLAS_SLUG = 'vom-feld-ins-glas'

export type FeldInsGlasPhase = {
  label: string
  /** Short nav label (Feld / Küche / Glas) — optional for schedule phases */
  name?: string
  /** Section heading */
  title: string
  description: string
  bullets?: string[]
  detail?: string
}

export type FeldInsGlasCopy = {
  eyebrow: string
  title: string
  titleLines: string[]
  partnerLine: string
  locationLine: string
  /** Hero supporting sentence under the title */
  heroSubline: string
  journeyHint: string
  editionLabel: string
  sealRingText: string
  sealCenterText: string
  notStudioLabel: string
  notStudioText: string
  fermentsHeading: string
  ferments: string[]
  description: string
  ctaLabel: string
  secondaryCtaLabel: string
  priceLabel: string
  price: number
  currency: string
  attributes: string[]
  storyEyebrow: string
  storyTitle: string
  storyText: string
  storyTextSecondary: string
  storyQuote: string
  storySupport: string
  storySeasonMonths: string
  storySeasonLabel: string
  /** Main story arc  -  Feld · Küche · Glas */
  journeySections: FeldInsGlasPhase[]
  /** Detailed workshop steps (booking card / admin) */
  phasesHeading: string
  phasesSubheading: string
  phases: FeldInsGlasPhase[]
  includedHeading: string
  includedItems: string[]
  practicalHeading: string
  practicalItems: { label: string; text: string }[]
  why: { title: string; text: string }[]
  howToEyebrow: string
  howToTitle: string
  howToDescription: string
}

/** Curated Tipps for Vom Feld ins Glas (see feld-ins-glas-articles.ts) */
export const FELD_INS_GLAS_HOWTO_SLUGS = [
  'frisches-gemuese-am-feld-erkennen',
  'milchsaure-zucchini-pickels',
  'fermentiertes-gurken-relish',
  'karfiol-kimchi-anleitung',
  'marktgarten-workshop-vorbereitung',
  'vom-feld-ins-glas-ablauf',
] as const

export const FELD_INS_GLAS_COPY: Record<'de' | 'en', FeldInsGlasCopy> = {
  de: {
    eyebrow: 'Spezial-Workshop',
    title: 'Vom Feld ins Glas',
    titleLines: ['Vom Feld', 'ins Glas'],
    partnerLine: 'Lakto-Gemüse mit dem Team von Unser Bauerngarten',
    locationLine: "Marktgarten 'Unser Bauerngarten' · Graz",
    heroSubline:
      'Ein ganzer Tag im Marktgarten von der Ernte bis ins fermentierte Glas.',
    journeyHint: 'Feld · Küche · Glas',
    editionLabel: 'Marktgarten Edition',
    sealRingText: 'SPEZIAL-WORKSHOP',
    sealCenterText: 'FERMENT · freude',
    notStudioLabel: 'Nicht im Studio',
    notStudioText:
      'Dieser Workshop findet nicht in der Grabenstraße statt, sondern im Freien beim Marktgarten „Unser Bauerngarten“.',
    fermentsHeading: 'Drei Fermente zum Mitnehmen',
    ferments: ['Zucchini-Pickles', 'Gurken-Relish', 'Karfiol-Kimchi'],
    description:
      'Fermentation beginnt nicht erst in der Küche, sondern bereits am Feld. Gemeinsam ernten wir frisches, saisonales Gemüse und verwandeln es in köstliche Lakto-Fermente.',
    ctaLabel: 'Jetzt buchen',
    secondaryCtaLabel: 'Mehr erfahren',
    priceLabel: 'pro Person',
    price: 99,
    currency: '€',
    attributes: ['ca. 4 Std', 'Hands-on', 'Marktgarten', 'Max. 12 Personen'],
    storyEyebrow: 'Das Konzept',
    storyTitle: 'Der kürzeste Weg vom Feld ins Glas.',
    storyQuote:
      'Fermentation beginnt dort, wo die Ernte endet, nicht in der Fabrik, sondern in der eigenen Hand.',
    storyText:
      'Gemeinsam besuchen wir den Marktgarten „Unser Bauerngarten“ in Graz, ernten saisonal, was der Tag gibt, und verwandeln es noch vor Ort in lebendige, haltbare Fermente. Du lernst nicht aus einem Buch, sondern mit Erde an den Fingern.',
    storyTextSecondary:
      'Der Workshop ist einmalig: kein Studio, keine Kursküche. Nur ein Garten, eine Gemeinschaft und das Handwerk der Fermentation in seiner reinsten Form.',
    storySupport:
      'Ernte, Handwerk und Verkostung im Marktgarten „Unser Bauerngarten“, nicht in der Grabenstraße.',
    storySeasonMonths: 'Aug – Okt',
    storySeasonLabel: 'Saison 2025',
    journeySections: [
      {
        label: '01',
        name: 'Feld',
        title: 'Der Garten als Ausgangspunkt',
        description:
          'Der Tag beginnt nicht in der Küche, sondern draußen. Du lernst, was reif ist, wie man erntet ohne zu beschädigen, und warum das Timing über die Qualität des Fermentes entscheidet.',
        bullets: [
          'Saisonale Ernte mit Anleitung im Marktgarten',
          'Sortenvielfalt & Bodenqualität als Geschmacksfaktor',
          'Biozertifiziertes Saatgut, keine Pestizide',
          'Direkter Kontakt zur landwirtschaftlichen Praxis',
        ],
      },
      {
        label: '02',
        name: 'Küche',
        title: 'Handwerk statt Rezeptkarte',
        description:
          'Theorie und Praxis am Ort der Ernte: Wie Fermentation funktioniert, welche Vorteile sie hat, und unter Anleitung bereitest du drei Lakto-Gemüse-Fermente zu.',
        bullets: [
          'Grundlagen der milchsauren Fermentation',
          'Drei Fermente: Zucchini-Pickles, Gurken-Relish, Karfiol-Kimchi',
          'Salz, Zeit und Gefühl statt starre Rezepte',
          'Hygiene und Sicherheit im offenen Garten',
        ],
        detail: 'Zucchini-Pickles · Gurken-Relish · Karfiol-Kimchi',
      },
      {
        label: '03',
        name: 'Glas',
        title: 'Dein Ferment, deine Signatur',
        description:
          'Am Ende des Tages gehst du nicht mit leeren Händen. Jedes Glas, das du befüllt hast, trägt deine Handschrift: die Auswahl, den Rhythmus, den Geschmack des Tages.',
        bullets: [
          'Bis zu 3 verschiedene Fermente zum Mitnehmen',
          'Etikettierung & Lagertipps für zu Hause',
          'Rezeptkarte für jedes Ferment',
          'Zugang zum Fermentfreude Online-Archiv',
        ],
      },
    ],
    phasesHeading: 'Workshop-Inhalt',
    phasesSubheading: 'Theorie · Ernte · Praxis · Verkostung',
    phases: [
      {
        label: '01',
        title: 'Theorie',
        description:
          'Zu Beginn tauchen wir in die Welt der Fermentation ein: Wie funktioniert sie? Welche Vorteile hat sie? Überblick über die wichtigsten Techniken.',
      },
      {
        label: '02',
        title: 'Ernte im Bauerngarten',
        description:
          'Gemeinsam ernten wir einen Teil des Gemüses direkt am Feld, mit Einblicken in den Marktgarten-Anbau und saisonale Kulturen.',
      },
      {
        label: '03',
        title: 'Praxis',
        description:
          'Unter Schritt-für-Schritt-Anleitung bereitest du drei Lakto-Gemüse-Fermente zu. Alle Gläser nimmst du mit nach Hause.',
        detail: 'Zucchini-Pickles · Gurken-Relish · Karfiol-Kimchi',
      },
      {
        label: '04',
        title: 'Verkostung',
        description:
          'Zum Abschluss eine Ferment-Brettljaus’n (auf Wunsch vegan): eine bunte Vielfalt fermentierter Spezialitäten.',
      },
    ],
    includedHeading: 'Im Preis enthalten',
    includedItems: [
      'Gemeinsame Gemüseernte im Bauerngarten',
      'Drei Fermente zum Mitnehmen inkl. Gärgefäße',
      'Ausführliches Skript mit allen Rezepten',
      'Gemeinsame Verkostung + Getränke',
    ],
    practicalHeading: 'Rahmeninfos',
    practicalItems: [
      { label: 'Dauer', text: 'ca. 4 Stunden' },
      {
        label: 'Für wen',
        text: 'Für alle, vom Neuling bis zum Profi. Ideal, wenn du Herkunft und Handwerk verbinden willst.',
      },
      {
        label: 'Mitbringen',
        text: 'Wetterfeste Kleidung, festes Schuhwerk, bei Bedarf Sonnenschutz. Gemüse, Gläser, Gewürze und Equipment stellen wir bereit.',
      },
      {
        label: 'Ort',
        text: 'Marktgarten „Unser Bauerngarten“, Hochfeldweg, Graz, nicht Grabenstraße.',
      },
    ],
    why: [
      {
        title: 'Am Feld',
        text: 'Nicht im Studio, sondern im Freien beim Marktgarten, wo das Gemüse wächst.',
      },
      {
        title: 'Drei Fermente',
        text: 'Zucchini-Pickles, Gurken-Relish und Karfiol-Kimchi, zum Mitnehmen.',
      },
      {
        title: 'Vom Acker bis zum Glas',
        text: 'Ernte, Handwerk und Verkostung in einem Nachmittag.',
      },
    ],
    howToEyebrow: 'Tipps & Guides',
    howToTitle: 'Alles rund um den Marktgarten-Workshop.',
    howToDescription:
      'Von der Ernte am Feld bis zu deinen drei Fermenten: Anleitungen, Rezepte und praktische Vorbereitung für „Vom Feld ins Glas“.',
  },
  en: {
    eyebrow: 'Special Workshop',
    title: 'From Field to Jar',
    titleLines: ['From Field', 'to Jar'],
    partnerLine: 'Lacto-veg with the Unser Bauerngarten team',
    locationLine: "Marktgarten 'Unser Bauerngarten' · Graz",
    heroSubline:
      'A full day at the market garden from harvest to the fermented jar.',
    journeyHint: 'Field · Kitchen · Jar',
    editionLabel: 'Market Garden Edition',
    sealRingText: 'SPECIAL WORKSHOP',
    sealCenterText: 'FERMENT · freude',
    notStudioLabel: 'Not in the studio',
    notStudioText:
      'This workshop isn’t at Grabenstraße. It’s outdoors at Marktgarten “Unser Bauerngarten”.',
    fermentsHeading: 'Three ferments to take home',
    ferments: ['Zucchini pickles', 'Cucumber relish', 'Cauliflower kimchi'],
    description:
      'Fermentation doesn’t start in the kitchen, it starts in the field. Together we harvest fresh seasonal vegetables and turn them into delicious lacto-ferments.',
    ctaLabel: 'Book now',
    secondaryCtaLabel: 'Learn more',
    priceLabel: 'per person',
    price: 99,
    currency: '€',
    attributes: ['~4 hrs', 'Hands-on', 'Market garden', 'Max. 12 people'],
    storyEyebrow: 'The concept',
    storyTitle: 'The shortest path from field to jar.',
    storyQuote:
      'Fermentation begins where the harvest ends, not in a factory, but in your own hands.',
    storyText:
      'Together we visit Marktgarten “Unser Bauerngarten” in Graz, harvest what the day offers, and turn it into living, lasting ferments on site. You don’t learn from a book, you learn with soil on your fingers.',
    storyTextSecondary:
      'This workshop is unique: no studio, no teaching kitchen. Just a garden, a community, and the craft of fermentation in its purest form.',
    storySupport:
      'Harvest, craft and tasting at Marktgarten “Unser Bauerngarten”, not on Grabenstraße.',
    storySeasonMonths: 'Aug – Oct',
    storySeasonLabel: 'Season 2025',
    journeySections: [
      {
        label: '01',
        name: 'Field',
        title: 'The garden as starting point',
        description:
          'The day doesn’t start in the kitchen, it starts outdoors. You learn what is ripe, how to harvest without damage, and why timing decides the quality of the ferment.',
        bullets: [
          'Seasonal harvest with guidance in the market garden',
          'Variety and soil quality as flavour factors',
          'Certified organic seed, no pesticides',
          'Direct contact with agricultural practice',
        ],
      },
      {
        label: '02',
        name: 'Kitchen',
        title: 'Craft instead of a recipe card',
        description:
          'Theory and practice where the harvest happens: how fermentation works, its benefits, and step by step you prepare three lacto-vegetable ferments.',
        bullets: [
          'Basics of lactic fermentation',
          'Three ferments: zucchini pickles, cucumber relish, cauliflower kimchi',
          'Salt, time and feel instead of rigid recipes',
          'Hygiene and safety in an open garden',
        ],
        detail: 'Zucchini pickles · Cucumber relish · Cauliflower kimchi',
      },
      {
        label: '03',
        name: 'Jar',
        title: 'Your ferment, your signature',
        description:
          'At the end of the day you don’t leave empty-handed. Every jar you fill carries your handwriting: the selection, the rhythm, the taste of the day.',
        bullets: [
          'Up to 3 different ferments to take home',
          'Labelling & storage tips for home',
          'A recipe card for every ferment',
          'Access to the Fermentfreude online archive',
        ],
      },
    ],
    phasesHeading: 'Workshop content',
    phasesSubheading: 'Theory · Harvest · Practice · Tasting',
    phases: [
      {
        label: '01',
        title: 'Theory',
        description:
          'We dive into fermentation: how it works, its benefits, and an overview of the key techniques.',
      },
      {
        label: '02',
        title: 'Harvest at the garden',
        description:
          'Together we harvest part of the vegetables right in the field, with insights into market-garden growing and seasonal crops.',
      },
      {
        label: '03',
        title: 'Practice',
        description:
          'Step by step you prepare three lacto-vegetable ferments. All jars go home with you.',
        detail: 'Zucchini pickles · Cucumber relish · Cauliflower kimchi',
      },
      {
        label: '04',
        title: 'Tasting',
        description:
          'We finish with a ferment Brettljaus’n (vegan on request): a colourful spread of fermented specialities.',
      },
    ],
    includedHeading: 'Included in the price',
    includedItems: [
      'Shared vegetable harvest in the market garden',
      'Three ferments to take home incl. fermentation jars',
      'Detailed script with all recipes',
      'Shared tasting + drinks',
    ],
    practicalHeading: 'Practical info',
    practicalItems: [
      { label: 'Duration', text: 'approx. 4 hours' },
      {
        label: 'For whom',
        text: 'Everyone, from beginners to fermentation pros. Ideal if you want to connect origin and craft.',
      },
      {
        label: 'Bring',
        text: 'Weatherproof clothing, sturdy shoes, sun protection if needed. Vegetables, jars, spices and equipment are provided.',
      },
      {
        label: 'Location',
        text: 'Marktgarten “Unser Bauerngarten”, Hochfeldweg, Graz, not Grabenstraße.',
      },
    ],
    why: [
      {
        title: 'In the field',
        text: 'Not in the studio, but outdoors at the market garden where the vegetables grow.',
      },
      {
        title: 'Three ferments',
        text: 'Zucchini pickles, cucumber relish and cauliflower kimchi, to take home.',
      },
      {
        title: 'From soil to jar',
        text: 'Harvest, craft and tasting in one afternoon.',
      },
    ],
    howToEyebrow: 'Tips & Guides',
    howToTitle: 'Everything about the market-garden workshop.',
    howToDescription:
      'From field harvest to your three ferments: guides, recipes and practical prep for “From Field to Jar”.',
  },
}

export function getFeldInsGlasHowTosCms(locale: 'de' | 'en') {
  const copy = FELD_INS_GLAS_COPY[locale]
  return {
    eyebrow: copy.howToEyebrow,
    title: copy.howToTitle,
    description: copy.howToDescription,
  }
}

export function getFeldInsGlasWorkshop(locale: 'de' | 'en'): WorkshopDetailData {
  const copy = FELD_INS_GLAS_COPY[locale]
  const isDe = locale === 'de'

  return {
    slug: FELD_INS_GLAS_SLUG,
    workshopType: 'lakto',
    title: copy.title,
    subtitle: copy.partnerLine,
    description: copy.description,
    price: copy.price,
    priceSuffix: copy.priceLabel,
    currency: copy.currency,
    heroImage: null,

    highlights: [],

    aboutHeading: isDe ? 'Über diesen Spezial-Workshop' : 'About this special workshop',
    aboutText: copy.storyText,

    scheduleHeading: copy.phasesHeading,
    schedule: copy.phases.map((p) => ({
      duration: p.label,
      title: p.title,
      description: p.description,
    })),

    includedHeading: copy.includedHeading,
    includedItems: copy.includedItems.map((text) => ({ text })),

    whyHeading: copy.practicalHeading,
    whyPoints: copy.practicalItems.map((item) => ({
      bold: `${item.label}: `,
      rest: item.text,
    })),

    datesHeading: isDe ? 'Termine' : 'Dates',
    dates: [],

    viewDatesLabel: isDe ? 'Termin auswählen' : 'Select a date',
    hideDatesLabel: isDe ? 'Termine ausblenden' : 'Hide Dates',
    moreInfoLabel: isDe ? 'Mehr Informationen' : 'More Information',
    bookLabel: isDe ? 'Buchen' : 'Book',
    spotsLabel: isDe ? 'Plätze frei' : 'spots left',
    closeLabel: isDe ? 'Schließen' : 'Close',

    confirmHeading: isDe ? 'Buchung bestätigen' : 'Confirm Booking',
    confirmSubheading: isDe ? 'Details prüfen' : 'Review your details',
    workshopLabel: 'Workshop',
    dateLabel: isDe ? 'Datum' : 'Date',
    timeLabel: isDe ? 'Uhrzeit' : 'Time',
    totalLabel: isDe ? 'Gesamt' : 'Total',
    cancelLabel: isDe ? 'Abbrechen' : 'Cancel',
    confirmLabel: isDe ? 'Buchung bestätigen' : 'Confirm Booking',
  }
}

/** Same Fermentkalender months as Lakto (Juni–September) */
export function getFeldInsGlasCalendar(locale: 'de' | 'en') {
  const isDe = locale === 'de'
  return {
    eyebrow: isDe ? 'Saisonale Rezepte' : 'Seasonal recipes',
    title: isDe ? 'Fermentkalender' : 'Fermentation Calendar',
    description: isDe
      ? 'Entdecke was du in jedem Monat fermentieren kannst, frisch, saisonal und voller Geschmack.'
      : 'Discover what you can ferment each month, fresh, seasonal and full of flavour.',
    months: isDe
      ? [
          {
            month: 'Juni',
            monthShort: 'JUN',
            monthNumber: '06',
            season: 'SOMMER',
            accent: '#4a7c59',
            recipes: [
              { name: 'Salzgurken' },
              { name: 'Fermentierter Orangen-Fenchel' },
              { name: 'Spargel-Kimchi' },
            ],
          },
          {
            month: 'Juli',
            monthShort: 'JUL',
            monthNumber: '07',
            season: 'SOMMER',
            accent: '#2d6a4f',
            recipes: [
              { name: 'Milchsaure Zucchini-Pickles' },
              { name: 'Fermentierte Gurken-Relish' },
              { name: 'Karfiol-Kimchi' },
            ],
          },
          {
            month: 'August',
            monthShort: 'AUG',
            monthNumber: '08',
            season: 'SOMMER',
            accent: '#e6be68',
            recipes: [
              { name: 'Milchsaure Eierschwammerl' },
              { name: 'Fermentierte Tomaten-Salsa' },
              { name: 'Paprika-Kimchi' },
            ],
          },
          {
            month: 'September',
            monthShort: 'SEP',
            monthNumber: '09',
            season: 'HERBST',
            accent: '#d4875a',
            recipes: [
              { name: 'Salzlacken-Kirschtomaten' },
              { name: 'Fermentierte Hot-Sauce' },
              { name: 'Süßkartoffel-Kimchi' },
            ],
          },
        ]
      : [
          {
            month: 'June',
            monthShort: 'JUN',
            monthNumber: '06',
            season: 'SUMMER',
            accent: '#4a7c59',
            recipes: [
              { name: 'Pickled Cucumbers' },
              { name: 'Fermented Orange-Fennel' },
              { name: 'Asparagus Kimchi' },
            ],
          },
          {
            month: 'July',
            monthShort: 'JUL',
            monthNumber: '07',
            season: 'SUMMER',
            accent: '#2d6a4f',
            recipes: [
              { name: 'Lacto-Fermented Zucchini Pickles' },
              { name: 'Fermented Cucumber Relish' },
              { name: 'Cauliflower Kimchi' },
            ],
          },
          {
            month: 'August',
            monthShort: 'AUG',
            monthNumber: '08',
            season: 'SUMMER',
            accent: '#e6be68',
            recipes: [
              { name: 'Lacto-Fermented Chanterelles' },
              { name: 'Fermented Tomato Salsa' },
              { name: 'Pepper Kimchi' },
            ],
          },
          {
            month: 'September',
            monthShort: 'SEP',
            monthNumber: '09',
            season: 'AUTUMN',
            accent: '#d4875a',
            recipes: [
              { name: 'Salt-Cured Cherry Tomatoes' },
              { name: 'Fermented Hot Sauce' },
              { name: 'Sweet Potato Kimchi' },
            ],
          },
        ],
  }
}
