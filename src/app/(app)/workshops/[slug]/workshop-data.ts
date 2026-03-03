/* ═══════════════════════════════════════════════════════════════
 *  Hardcoded workshop data — frontend only (no CMS seed yet).
 *  Each workshop is keyed by its URL slug.
 *
 *  NOTE: This is temporary. Once a Workshops collection exists
 *  in Payload, this file will be replaced by CMS queries.
 * ═══════════════════════════════════════════════════════════════ */

export interface WorkshopDate {
  id: string
  date: string // Display date, e.g. "February 15, 2026"
  time: string // Display time, e.g. "2:00 PM - 5:00 PM"
  spotsLeft: number
}

export interface ScheduleStep {
  duration: string // e.g. "35 min"
  title: string
  description: string
}

export interface IncludedItem {
  text: string
}

export interface WhyPoint {
  bold: string
  rest: string
}

export interface WorkshopIncluded {
  title: string
  description: string
}

export interface WorkshopDetailData {
  slug: string
  title: string
  subtitle: string // e.g. "3-hour hands-on workshop"
  description: string // Full about paragraph
  price: number
  priceSuffix: string // e.g. "per person"
  currency: string
  heroImage: string | null // URL or null for placeholder

  // "What's included" summary (card view — 3 items w/ icons)
  highlights: WorkshopIncluded[]

  // "Über den Workshop" — about section
  aboutHeading: string
  aboutText: string

  // "Ablauf" — schedule timeline
  scheduleHeading: string
  schedule: ScheduleStep[]

  // "Im Preis enthalten" — included in price (bullet list)
  includedHeading: string
  includedItems: IncludedItem[]

  // "Warum dieser Workshop?" — why section
  whyHeading: string
  whyPoints: WhyPoint[]

  // Upcoming dates
  datesHeading: string
  dates: WorkshopDate[]

  // Button labels
  viewDatesLabel: string
  hideDatesLabel: string
  moreInfoLabel: string
  bookLabel: string
  spotsLabel: string // suffix, e.g. "spots left" / "Plätze frei"
  closeLabel: string

  // Booking modal
  confirmHeading: string
  confirmSubheading: string
  workshopLabel: string
  dateLabel: string
  timeLabel: string
  totalLabel: string
  cancelLabel: string
  confirmLabel: string
}

// ─────────────────────────────────────────────────────────────
//  Lakto-Fermented Vegetables (Lakto Gemüse)
// ─────────────────────────────────────────────────────────────

const lakto: WorkshopDetailData = {
  slug: 'lakto-gemuese',
  title: 'Lacto-Fermented Vegetables',
  subtitle: '3-hour hands-on workshop',
  description:
    'Discover the ancient art of lacto-fermentation. Transform fresh vegetables into probiotic-rich, flavour-packed preserves using nothing but salt, time, and beneficial bacteria. Learn techniques passed down through generations and take home your own creations.',
  price: 99,
  priceSuffix: 'per person',
  currency: '€',
  heroImage: null,

  highlights: [
    {
      title: 'Theory: Fermentation Basics',
      description: 'Learn the science and health benefits',
    },
    {
      title: 'Practice: Three Ferments',
      description:
        'Create Apple-Red Cabbage Sauerkraut, Indian Pickles & Chard Kimchi with jars to take home',
    },
    {
      title: 'Tasting: Ferment Board',
      description: 'Enjoy a curated selection (vegan option available)',
    },
  ],

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
      rest: " Lacto-fermented vegetables are rich in probiotics that support digestion and immunity \u2014 benefits you won't find on any shop shelf.",
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

  datesHeading: 'Next Workshops',
  dates: [
    {
      id: 'lakto-1',
      date: 'February 15, 2026',
      time: '2:00 PM – 5:00 PM',
      spotsLeft: 5,
    },
    {
      id: 'lakto-2',
      date: 'February 22, 2026',
      time: '10:00 AM – 1:00 PM',
      spotsLeft: 3,
    },
    {
      id: 'lakto-3',
      date: 'March 8, 2026',
      time: '2:00 PM – 5:00 PM',
      spotsLeft: 8,
    },
    {
      id: 'lakto-4',
      date: 'March 15, 2026',
      time: '10:00 AM – 1:00 PM',
      spotsLeft: 12,
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
}

// ─────────────────────────────────────────────────────────────
//  Registry — keyed by slug
// ─────────────────────────────────────────────────────────────

export const WORKSHOPS: Record<string, WorkshopDetailData> = {
  'lakto-gemuese': lakto,
}

export function getWorkshopBySlug(slug: string): WorkshopDetailData | null {
  return WORKSHOPS[slug] ?? null
}
