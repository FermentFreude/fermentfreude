import type { Field } from 'payload'

/**
 * Workshop Detail fields — editable content for the dedicated workshop detail page.
 * Currently used by /workshops/lakto-gemuese, expandable to other workshops.
 *
 * Every text field is localized (de + en).
 * Collapsible groups map 1:1 to page sections for easy admin editing.
 */
export const workshopDetailFields: Field[] = [
  // ── 1. Hero ──────────────────────────────────────────────
  {
    type: 'collapsible',
    label: '1. Hero',
    admin: {
      initCollapsed: false,
      description:
        'Full-viewport hero with panel + text. Jar silhouettes are decorative (code-only).',
    },
    fields: [
      {
        name: 'heroEyebrow',
        type: 'text',
        localized: true,
        label: 'Eyebrow',
        admin: { description: 'Small text above the title (e.g. "Workshop Experience").' },
      },
      {
        name: 'heroTitle',
        type: 'textarea',
        localized: true,
        label: 'Title',
        admin: {
          description:
            'Main heading. Use a line break for two lines (e.g. "Die Kunst der\\nLakto-Fermentation").',
        },
      },
      {
        name: 'heroDescription',
        type: 'textarea',
        localized: true,
        label: 'Description',
        admin: { description: 'Short paragraph below the title.' },
      },
      {
        name: 'heroImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Hero Image',
        admin: {
          description:
            'Image shown on the left side of the hero (portrait or square, min 800px tall). When empty, decorative jar illustrations are shown instead.',
        },
      },
      {
        name: 'heroAttributes',
        type: 'array',
        label: 'Attribute Pills',
        maxRows: 6,
        admin: {
          description:
            'Small pills below the divider (e.g. "3 Stunden", "Hands-on", "Experience").',
        },
        fields: [{ name: 'text', type: 'text', required: true, localized: true, label: 'Text' }],
      },
    ],
  },

  // ── 2. Booking Card ──────────────────────────────────────
  {
    type: 'collapsible',
    label: '2. Booking Card',
    admin: {
      initCollapsed: true,
      description: 'Dark header with price, cinematic image, and action buttons.',
    },
    fields: [
      {
        name: 'bookingEyebrow',
        type: 'text',
        localized: true,
        label: 'Header Eyebrow',
        admin: {
          description: 'Gold text above title (e.g. "3-HOUR HANDS-ON WORKSHOP").',
        },
      },
      {
        type: 'row',
        fields: [
          {
            name: 'bookingPrice',
            type: 'number',
            label: 'Price (€)',
            admin: { description: 'Workshop price in euros (e.g. 99).' },
          },
          {
            name: 'bookingPriceSuffix',
            type: 'text',
            localized: true,
            label: 'Price Suffix',
            admin: { description: 'e.g. "/per person" or "/pro Person".' },
          },
          {
            name: 'bookingCurrency',
            type: 'text',
            label: 'Currency Symbol',
            admin: { description: 'e.g. "€". Defaults to €.' },
          },
        ],
      },
      {
        name: 'bookingImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Cinematic Image',
        admin: {
          description: 'Wide image (21:9 ratio) shown between header and action buttons.',
        },
      },
      {
        name: 'bookingAttributes',
        type: 'array',
        label: 'Attribute Pills',
        maxRows: 8,
        admin: {
          description:
            'Rounded pills in the header (e.g. "3 Stunden", "Hands-on", "Max. 12 Personen").',
        },
        fields: [{ name: 'text', type: 'text', required: true, localized: true, label: 'Text' }],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'bookingViewDatesLabel',
            type: 'text',
            localized: true,
            label: 'View Dates Button',
            admin: { description: 'e.g. "Nächste Termine" / "Upcoming Dates"' },
          },
          {
            name: 'bookingHideDatesLabel',
            type: 'text',
            localized: true,
            label: 'Hide Dates Text',
            admin: { description: 'e.g. "Termine ausblenden" / "Hide Dates"' },
          },
          {
            name: 'bookingMoreDetailsLabel',
            type: 'text',
            localized: true,
            label: 'More Details Button',
            admin: { description: 'e.g. "Mehr Details" / "More Details"' },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'bookingBookLabel',
            type: 'text',
            localized: true,
            label: 'Book Button',
            admin: { description: 'e.g. "Buchen" / "Book"' },
          },
          {
            name: 'bookingSpotsLabel',
            type: 'text',
            localized: true,
            label: 'Spots Suffix',
            admin: { description: 'e.g. "Plätze frei" / "spots left"' },
          },
        ],
      },
    ],
  },

  // ── 3. Workshop Details (expandable drawer) ──────────────
  {
    type: 'collapsible',
    label: '3. Workshop Details (Expandable)',
    admin: {
      initCollapsed: true,
      description: 'Content shown when "Mehr Details" is clicked: About, Schedule, Included, Why.',
    },
    fields: [
      {
        name: 'aboutHeading',
        type: 'text',
        localized: true,
        label: 'About Heading',
        admin: { description: 'e.g. "About the Workshop"' },
      },
      {
        name: 'aboutText',
        type: 'textarea',
        localized: true,
        label: 'About Text',
      },
      {
        name: 'scheduleHeading',
        type: 'text',
        localized: true,
        label: 'Schedule Heading',
        admin: { description: 'e.g. "Schedule (3 Hours)"' },
      },
      {
        name: 'schedule',
        type: 'array',
        label: 'Schedule Steps',
        maxRows: 6,
        fields: [
          {
            name: 'duration',
            type: 'text',
            required: true,
            label: 'Duration',
            admin: { description: 'e.g. "45 min"' },
          },
          { name: 'title', type: 'text', required: true, localized: true, label: 'Step Title' },
          {
            name: 'description',
            type: 'textarea',
            required: true,
            localized: true,
            label: 'Step Description',
          },
        ],
      },
      {
        name: 'includedHeading',
        type: 'text',
        localized: true,
        label: 'Included Heading',
        admin: { description: 'e.g. "Included in Price (€99)"' },
      },
      {
        name: 'includedItems',
        type: 'array',
        label: 'Included Items',
        maxRows: 12,
        fields: [{ name: 'text', type: 'text', required: true, localized: true, label: 'Item' }],
      },
      {
        name: 'whyHeading',
        type: 'text',
        localized: true,
        label: 'Why This Workshop Heading',
        admin: { description: 'e.g. "Why This Workshop?"' },
      },
      {
        name: 'whyPoints',
        type: 'array',
        label: 'Why Points',
        maxRows: 6,
        fields: [
          {
            name: 'bold',
            type: 'text',
            required: true,
            localized: true,
            label: 'Bold Intro',
            admin: { description: 'e.g. "Gut Health:"' },
          },
          {
            name: 'rest',
            type: 'textarea',
            required: true,
            localized: true,
            label: 'Description',
          },
        ],
      },
    ],
  },

  // ── 4. Experience Cards (Was dich erwartet) ──────────────
  {
    type: 'collapsible',
    label: '4. Experience Cards (Was dich erwartet)',
    admin: {
      initCollapsed: true,
      description: 'Three alternating image+text cards: Theory, Practice, Tasting.',
    },
    fields: [
      {
        name: 'experienceEyebrow',
        type: 'text',
        localized: true,
        label: 'Section Eyebrow',
        admin: { description: 'e.g. "WAS DICH ERWARTET" / "WHAT TO EXPECT"' },
      },
      {
        name: 'experienceTitle',
        type: 'text',
        localized: true,
        label: 'Section Title',
        admin: { description: 'e.g. "Dein Workshop-Erlebnis" / "Your Workshop Experience"' },
      },
      {
        name: 'experienceCards',
        type: 'array',
        label: 'Cards',
        maxRows: 6,
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            label: 'Image',
            admin: { description: 'Photo for this card (4:3 ratio).' },
          },
          {
            name: 'eyebrow',
            type: 'text',
            required: true,
            localized: true,
            label: 'Card Eyebrow',
            admin: { description: 'e.g. "THEORY", "PRACTICE", "TASTING"' },
          },
          {
            name: 'title',
            type: 'text',
            required: true,
            localized: true,
            label: 'Card Title',
          },
          {
            name: 'description',
            type: 'textarea',
            required: true,
            localized: true,
            label: 'Card Description',
          },
        ],
      },
    ],
  },

  // ── 5. Upcoming Dates ────────────────────────────────────
  {
    type: 'collapsible',
    label: '5. Upcoming Dates',
    admin: {
      initCollapsed: true,
      description: 'Workshop dates shown in the expandable booking panel.',
    },
    fields: [
      {
        name: 'datesHeading',
        type: 'text',
        localized: true,
        label: 'Dates Heading',
        admin: { description: 'e.g. "Nächste Workshops" / "Next Workshops"' },
      },
      {
        name: 'dates',
        type: 'array',
        label: 'Available Dates',
        maxRows: 20,
        fields: [
          {
            name: 'date',
            type: 'text',
            required: true,
            localized: true,
            label: 'Date',
            admin: { description: 'e.g. "15. Februar 2026" / "February 15, 2026"' },
          },
          {
            name: 'time',
            type: 'text',
            required: true,
            localized: true,
            label: 'Time',
            admin: { description: 'e.g. "14:00 – 17:00" / "2:00 PM – 5:00 PM"' },
          },
          {
            name: 'spotsLeft',
            type: 'number',
            required: true,
            label: 'Spots Left',
          },
        ],
      },
    ],
  },

  // ── 6. Seasonal Calendar ─────────────────────────────────
  {
    type: 'collapsible',
    label: '6. Seasonal Calendar',
    admin: {
      initCollapsed: true,
      description: 'Horizontal timeline with seasonal months and recipes.',
    },
    fields: [
      {
        name: 'calendarEyebrow',
        type: 'text',
        localized: true,
        label: 'Eyebrow',
        admin: { description: 'e.g. "SAISONALE REZEPTE" / "SEASONAL RECIPES"' },
      },
      {
        name: 'calendarTitle',
        type: 'text',
        localized: true,
        label: 'Title',
        admin: { description: 'e.g. "Fermentkalender" / "Fermentation Calendar"' },
      },
      {
        name: 'calendarDescription',
        type: 'textarea',
        localized: true,
        label: 'Description',
      },
      {
        name: 'calendarMonths',
        type: 'array',
        label: 'Months',
        maxRows: 12,
        fields: [
          {
            name: 'month',
            type: 'text',
            required: true,
            localized: true,
            label: 'Month Name',
            admin: { description: 'e.g. "März" / "March"' },
          },
          {
            name: 'monthShort',
            type: 'text',
            required: true,
            localized: true,
            label: 'Abbreviation',
            admin: { description: '3-letter code (e.g. "MÄR" / "MAR").' },
          },
          {
            name: 'monthNumber',
            type: 'text',
            required: true,
            label: 'Number',
            admin: { description: 'Two-digit month number (e.g. "03").' },
          },
          {
            name: 'season',
            type: 'text',
            required: true,
            localized: true,
            label: 'Season',
            admin: { description: 'e.g. "FRÜHLING" / "SPRING"' },
          },
          {
            name: 'accent',
            type: 'text',
            label: 'Accent Color',
            admin: {
              description:
                'Hex color for month badge and accent lines (e.g. "#e6be68"). Leave empty for default.',
            },
          },
          {
            name: 'recipes',
            type: 'array',
            label: 'Recipes',
            maxRows: 8,
            fields: [
              {
                name: 'name',
                type: 'text',
                required: true,
                localized: true,
                label: 'Recipe Name',
              },
            ],
          },
        ],
      },
    ],
  },

  // ── 7. Voucher CTA ──────────────────────────────────────
  {
    type: 'collapsible',
    label: '7. Voucher CTA',
    admin: {
      initCollapsed: true,
      description: '"Go with a friend" voucher section.',
    },
    fields: [
      {
        name: 'voucherEyebrow',
        type: 'text',
        localized: true,
        label: 'Eyebrow',
        admin: { description: 'e.g. "GEMEINSAM FERMENTIEREN" / "FERMENT TOGETHER"' },
      },
      {
        name: 'voucherTitle',
        type: 'text',
        localized: true,
        label: 'Title',
        admin: { description: 'e.g. "Go with a friend."' },
      },
      {
        name: 'voucherDescription',
        type: 'textarea',
        localized: true,
        label: 'Description',
      },
      {
        name: 'voucherBackgroundImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Background Image',
        admin: {
          description:
            'Optional background image. If provided, text will be white with a dark overlay. If empty, cream background with dark text will be used.',
        },
      },
      {
        type: 'row',
        fields: [
          {
            name: 'voucherPrimaryLabel',
            type: 'text',
            localized: true,
            label: 'Primary Button',
            admin: { description: 'e.g. "Gutschein kaufen" / "Buy Voucher"' },
          },
          {
            name: 'voucherPrimaryHref',
            type: 'text',
            label: 'Primary URL',
            admin: { description: 'e.g. "/voucher"' },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'voucherSecondaryLabel',
            type: 'text',
            localized: true,
            label: 'Secondary Button',
            admin: { description: 'e.g. "Zum Shop" / "Visit Shop"' },
          },
          {
            name: 'voucherSecondaryHref',
            type: 'text',
            label: 'Secondary URL',
            admin: { description: 'e.g. "/shop"' },
          },
        ],
      },
      {
        name: 'voucherPills',
        type: 'array',
        label: 'Feature Pills',
        maxRows: 6,
        admin: {
          description: 'Small tags below buttons (e.g. "Sofort einlösbar", "Für alle Workshops").',
        },
        fields: [{ name: 'text', type: 'text', required: true, localized: true, label: 'Text' }],
      },
    ],
  },

  // ── 8. FAQ ──────────────────────────────────────────────
  {
    type: 'collapsible',
    label: '8. FAQ',
    admin: {
      initCollapsed: true,
      description: 'Booking-specific FAQ accordion.',
    },
    fields: [
      {
        name: 'faqEyebrow',
        type: 'text',
        localized: true,
        label: 'Eyebrow',
        admin: { description: 'e.g. "HÄUFIGE FRAGEN" / "FAQ"' },
      },
      {
        name: 'faqTitle',
        type: 'text',
        localized: true,
        label: 'Title',
        admin: { description: 'e.g. "Gut zu wissen" / "Good to Know"' },
      },
      {
        name: 'faqDescription',
        type: 'textarea',
        localized: true,
        label: 'Description',
      },
      {
        name: 'faqItems',
        type: 'array',
        label: 'FAQ Items',
        maxRows: 12,
        fields: [
          {
            name: 'question',
            type: 'text',
            required: true,
            localized: true,
            label: 'Question',
          },
          {
            name: 'answer',
            type: 'textarea',
            required: true,
            localized: true,
            label: 'Answer',
          },
        ],
      },
      {
        name: 'faqContactEmail',
        type: 'text',
        label: 'Contact Email',
        admin: { description: 'Email shown at bottom (e.g. "info@fermentfreude.de").' },
      },
    ],
  },

  // ── 9. Booking Modal Labels ──────────────────────────────
  {
    type: 'collapsible',
    label: '9. Booking Modal Labels',
    admin: {
      initCollapsed: true,
      description: 'Labels for the booking confirmation popup.',
    },
    fields: [
      {
        name: 'modalConfirmHeading',
        type: 'text',
        localized: true,
        label: 'Confirm Heading',
        admin: { description: 'e.g. "Buchung bestätigen" / "Confirm Booking"' },
      },
      {
        name: 'modalConfirmSubheading',
        type: 'text',
        localized: true,
        label: 'Confirm Subheading',
        admin: { description: 'e.g. "Details überprüfen" / "Review your details"' },
      },
      {
        type: 'row',
        fields: [
          { name: 'modalWorkshopLabel', type: 'text', localized: true, label: 'Workshop Label' },
          { name: 'modalDateLabel', type: 'text', localized: true, label: 'Date Label' },
          { name: 'modalTimeLabel', type: 'text', localized: true, label: 'Time Label' },
          { name: 'modalTotalLabel', type: 'text', localized: true, label: 'Total Label' },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'modalCancelLabel', type: 'text', localized: true, label: 'Cancel Button' },
          { name: 'modalConfirmLabel', type: 'text', localized: true, label: 'Confirm Button' },
        ],
      },
    ],
  },

  // ── 10. How-To Articles ──────────────────────────────────
  {
    type: 'collapsible',
    label: '10. How-To Articles',
    admin: {
      initCollapsed: true,
      description:
        "6 educational article cards shown below the Fermentation Calendar. Edit the section heading and each article's title, description, read time, link and cover image.",
    },
    fields: [
      {
        name: 'howToEyebrow',
        type: 'text',
        localized: true,
        label: 'Eyebrow',
        admin: { description: 'Small label above the heading (e.g. "TIPPS & GUIDES").' },
      },
      {
        name: 'howToTitle',
        type: 'text',
        localized: true,
        label: 'Section Title',
        admin: { description: 'Main heading (e.g. "Lerne fermentieren.").' },
      },
      {
        name: 'howToDescription',
        type: 'textarea',
        localized: true,
        label: 'Section Description',
        admin: { description: 'Short paragraph below the heading.' },
      },
      {
        name: 'howToArticles',
        type: 'relationship',
        relationTo: 'posts',
        hasMany: true,
        label: 'Articles (pick 6)',
        admin: {
          description:
            "Select the 6 how-to articles to show as cards. Order matters — drag to reorder. Each article's title, image and content is edited directly inside the Posts collection.",
          allowCreate: false,
        },
      },
    ],
  },
]
