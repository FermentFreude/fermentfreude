/* ═══════════════════════════════════════════════════════════════
 *  Tempeh Workshop Hardcoded Defaults
 *
 *  These are frontend-only defaults. Overridden by CMS content
 *  from the workshopDetail tab (seed-tempeh-detail.ts).
 * ═══════════════════════════════════════════════════════════════ */

import type { WorkshopDetailData } from './workshop-data'

export const tempehDefaults: WorkshopDetailData = {
  slug: 'tempeh',
  title: 'Tempeh',
  subtitle: '3-hour hands-on workshop',
  description:
    'Dive into the fascinating world of tempeh - a classic Indonesian fermentation with huge potential. Learn step by step how to make tempeh yourself: from setup to finished, aromatic ferment. You will learn what conditions tempeh needs for optimal growth - knowledge you can apply immediately at home.',
  price: 99,
  priceSuffix: 'per person',
  currency: '€',
  heroImage: null,

  highlights: [
    {
      title: 'Theory: Fermentation Basics',
      description: 'How fermentation works and why tempeh is so special',
    },
    {
      title: 'Practice: Your Own Tempeh',
      description: 'Set up your own tempeh with starter, beans, and fermentation vessel to take home',
    },
    {
      title: 'Tasting: Tempeh Burgers',
      description: 'Fresh tempeh burgers with fermented sides (vegan option available)',
    },
  ],

  aboutHeading: 'About the Workshop',
  aboutText:
    'Explore the fascinating world of tempeh — an Indonesian fermentation classic with huge potential for plant-based protein lovers. In this hands-on workshop, you will learn step by step how to make tempeh yourself, from setup to finished ferment. You will discover what conditions tempeh needs for optimal growth — knowledge you can apply immediately at home. Whether you\'re a beginner or a curious food enthusiast, this workshop is designed for everyone interested in expanding their fermentation skills and discovering plant-based proteins.',

  scheduleHeading: 'Schedule (3 Hours)',
  schedule: [
    {
      duration: '45 min',
      title: 'Fermentation Fundamentals',
      description:
        'Dive into the world of fermentation together. Learn how fermentation works, what benefits it offers, and get an exciting overview of the most important techniques.',
    },
    {
      duration: '90 min',
      title: 'Practice: Setting Your Tempeh',
      description:
        'Now it gets practical. Under guidance, you set up your own tempeh - complete with starter, beans, and fermentation vessel. We show you how to create the ideal environment at home using simple means (oven with light function, dehydrator, heat box, or heating room).',
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
      rest: ' Unlike tofu, tempeh is a living, breathing ferment with unique flavors and nutritional benefits that develop over time.',
    },
    {
      bold: 'DIY Sustainability:',
      rest: ' Make your own tempeh at home using simple, affordable ingredients — no special equipment or complicated processes.',
    },
    {
      bold: 'Culinary Versatility:',
      rest: ' Once you master tempeh, you\'ll discover countless ways to cook it — from burgers to stir-fries, salads, and sandwiches.',
    },
  ],

  datesHeading: 'Next Workshops',
  dates: [
    {
      id: 'tempeh-1',
      date: 'February 20, 2026',
      time: '2:00 PM – 5:00 PM',
      spotsLeft: 6,
    },
    {
      id: 'tempeh-2',
      date: 'February 27, 2026',
      time: '10:00 AM – 1:00 PM',
      spotsLeft: 4,
    },
    {
      id: 'tempeh-3',
      date: 'March 10, 2026',
      time: '2:00 PM – 5:00 PM',
      spotsLeft: 9,
    },
    {
      id: 'tempeh-4',
      date: 'March 20, 2026',
      time: '10:00 AM – 1:00 PM',
      spotsLeft: 10,
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
