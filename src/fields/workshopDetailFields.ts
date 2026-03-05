import type { Field } from 'payload'

/**
 * Workshop Detail fields — editable content for the dedicated workshop detail page.
 * Currently used by /workshops/lakto-gemuese, expandable to other workshops.
 *
 * Every text field is localized (de + en).
 * Collapsible groups map 1:1 to page sections for easy admin editing.
 */
export const workshopDetailFields: Field[] = [
  // ── Calendar Toggle ──────────────────────────────────────
  {
    type: 'checkbox',
    name: 'showSeasonalCalendar',
    label: 'Show Seasonal Calendar?',
    admin: {
      description:
        'Enable this to show the seasonal calendar section on this workshop page. Disable to hide all calendar fields from the admin.',
    },
    defaultValue: true,
  },

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
      description: 'Complete booking experience: header, about, schedule, included items, why, experience cards, and dates.',
    },
    fields: [
      // ── Header ────────────────────────────────────────────
      {
        name: 'bookingEyebrow',
        type: 'text',
        localized: true,
        label: 'Header Eyebrow',
        admin: { description: 'e.g. "3-STUNDEN HANDS-ON WORKSHOP" / "3-HOUR HANDS-ON WORKSHOP"' },
      },
      {
        type: 'row',
        fields: [
          {
            name: 'bookingPrice',
            type: 'number',
            label: 'Price (€)',
            admin: { description: 'e.g. "99"' },
          },
          {
            name: 'bookingPriceSuffix',
            type: 'text',
            localized: true,
            label: 'Price Suffix',
            admin: { description: 'e.g. "pro Person" / "per person"' },
          },
        ],
      },
      {
        name: 'bookingCurrency',
        type: 'text',
        label: 'Currency Symbol',
        admin: { description: 'e.g. "€"' },
      },
      {
        name: 'bookingImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Header Background Image',
        admin: { description: 'Optional background image for the booking card header.' },
      },
      {
        name: 'bookingAttributes',
        type: 'array',
        label: 'Attribute Pills',
        maxRows: 6,
        admin: { description: 'Small attribute pills (e.g. "3 Stunden", "Hands-on", "Experience").' },
        fields: [{ name: 'text', type: 'text', required: true, localized: true, label: 'Text' }],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'bookingViewDatesLabel',
            type: 'text',
            localized: true,
            label: 'Show Dates Button',
            admin: { description: 'e.g. "Termine & Buchen" / "View Dates & Book"' },
          },
          {
            name: 'bookingHideDatesLabel',
            type: 'text',
            localized: true,
            label: 'Hide Dates Button',
            admin: { description: 'e.g. "Termine ausblenden" / "Hide Dates"' },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'bookingMoreDetailsLabel',
            type: 'text',
            localized: true,
            label: 'More Details Button',
            admin: { description: 'e.g. "Mehr Informationen" / "Learn More"' },
          },
          {
            name: 'bookingBookLabel',
            type: 'text',
            localized: true,
            label: 'Book Button',
            admin: { description: 'e.g. "Buchen" / "Book"' },
          },
        ],
      },
      {
        name: 'bookingSpotsLabel',
        type: 'text',
        localized: true,
        label: 'Spots Available Label',
        admin: { description: 'e.g. "Plätze frei" / "spots available"' },
      },

      // ── About Section ─────────────────────────────────────
      {
        name: 'aboutHeading',
        type: 'text',
        localized: true,
        label: 'About Heading',
        admin: { description: 'e.g. "Über den Workshop" / "About this Workshop"' },
      },
      {
        name: 'aboutText',
        type: 'textarea',
        localized: true,
        label: 'About Text',
        admin: { description: 'Long prose description of what the workshop is about.' },
      },

      // ── Schedule Section ──────────────────────────────────
      {
        name: 'scheduleHeading',
        type: 'text',
        localized: true,
        label: 'Schedule Heading',
        admin: { description: 'e.g. "Ablauf (3 Stunden)" / "Schedule (3 Hours)"' },
      },
      {
        name: 'schedule',
        type: 'array',
        label: 'Schedule Items',
        maxRows: 6,
        fields: [
          {
            name: 'duration',
            type: 'text',
            required: true,
            localized: true,
            label: 'Duration',
            admin: { description: 'e.g. "45 Min" / "45 minutes"' },
          },
          {
            name: 'title',
            type: 'text',
            required: true,
            localized: true,
            label: 'Title',
          },
          {
            name: 'description',
            type: 'textarea',
            required: true,
            localized: true,
            label: 'Description',
          },
        ],
      },

      // ── Included Items ────────────────────────────────────
      {
        name: 'includedHeading',
        type: 'text',
        localized: true,
        label: 'Included Heading',
        admin: { description: 'e.g. "Im Preis enthalten (€99)" / "Included in the Price (€99)"' },
      },
      {
        name: 'includedItems',
        type: 'array',
        label: 'Included Items',
        maxRows: 12,
        admin: { description: 'List of items/benefits included in the workshop.' },
        fields: [{ name: 'text', type: 'text', required: true, localized: true, label: 'Item' }],
      },

      // ── Why Section ───────────────────────────────────────
      {
        name: 'whyHeading',
        type: 'text',
        localized: true,
        label: 'Why This Workshop Heading',
        admin: { description: 'e.g. "Warum dieser Workshop?" / "Why This Workshop?"' },
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
            label: 'Bold Text',
            admin: { description: 'The bolded title of this point (e.g. "Darmgesundheit:")' },
          },
          {
            name: 'rest',
            type: 'textarea',
            required: true,
            localized: true,
            label: 'Description',
            admin: { description: 'The explanatory text that follows the bold title.' },
          },
        ],
      },

      // ── Experience Cards ──────────────────────────────────
      {
        name: 'experienceEyebrow',
        type: 'text',
        localized: true,
        label: 'Experience Cards Eyebrow',
        admin: { description: 'e.g. "WAS DICH ERWARTET" / "WHAT TO EXPECT"' },
      },
      {
        name: 'experienceTitle',
        type: 'text',
        localized: true,
        label: 'Experience Cards Title',
        admin: { description: 'Main heading for the experience section.' },
      },
      {
        name: 'experienceCards',
        type: 'array',
        label: 'Experience Cards',
        maxRows: 6,
        fields: [
          {
            name: 'eyebrow',
            type: 'text',
            required: true,
            localized: true,
            label: 'Card Eyebrow',
            admin: { description: 'e.g. "THEORIE" / "THEORY"' },
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
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            label: 'Card Image (optional)',
          },
        ],
      },

      // ── Upcoming Dates ────────────────────────────────────
      {
        name: 'datesHeading',
        type: 'text',
        localized: true,
        label: 'Dates Heading',
        admin: { description: 'e.g. "Nächste Workshops" / "Upcoming Workshops"' },
      },
      {
        name: 'dates',
        type: 'array',
        label: 'Workshop Dates',
        maxRows: 20,
        fields: [
          {
            name: 'date',
            type: 'text',
            required: true,
            label: 'Date',
            admin: { description: 'e.g. "15. Februar 2026"' },
          },
          {
            name: 'time',
            type: 'text',
            required: true,
            label: 'Time',
            admin: { description: 'e.g. "14:00 – 17:00"' },
          },
          {
            name: 'spotsLeft',
            type: 'number',
            label: 'Spots Available',
            admin: { description: 'Number of available spots for this date.' },
          },
        ],
      },

      // ── Booking Modal Labels ──────────────────────────────
      {
        name: 'modalConfirmHeading',
        type: 'text',
        localized: true,
        label: 'Modal Confirmation Heading',
        admin: { description: 'e.g. "Reservierung bestätigen" / "Confirm Reservation"' },
      },
      {
        name: 'modalConfirmSubheading',
        type: 'text',
        localized: true,
        label: 'Modal Confirmation Subheading',
      },
      {
        type: 'row',
        fields: [
          {
            name: 'modalWorkshopLabel',
            type: 'text',
            localized: true,
            label: 'Modal Workshop Label',
            admin: { description: 'e.g. "Workshop"' },
          },
          {
            name: 'modalDateLabel',
            type: 'text',
            localized: true,
            label: 'Modal Date Label',
            admin: { description: 'e.g. "Datum"' },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'modalTimeLabel',
            type: 'text',
            localized: true,
            label: 'Modal Time Label',
            admin: { description: 'e.g. "Uhrzeit"' },
          },
          {
            name: 'modalTotalLabel',
            type: 'text',
            localized: true,
            label: 'Modal Total Label',
            admin: { description: 'e.g. "Gesamtbetrag"' },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'modalCancelLabel',
            type: 'text',
            localized: true,
            label: 'Modal Cancel Button',
            admin: { description: 'e.g. "Abbrechen" / "Cancel"' },
          },
          {
            name: 'modalConfirmLabel',
            type: 'text',
            localized: true,
            label: 'Modal Confirm Button',
            admin: { description: 'e.g. "Bestätigen" / "Confirm"' },
          },
        ],
      },
    ],
  },

  // ── 3. Seasonal Calendar ─────────────────────────────────
  {
    type: 'collapsible',
    label: '3. Seasonal Calendar',
    admin: {
      initCollapsed: true,
      description: 'Horizontal timeline with seasonal months and recipes.',
      condition: (data) => data?.showSeasonalCalendar === true,
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

  // ── 4. Voucher CTA ──────────────────────────────────────
  {
    type: 'collapsible',
    label: '4. Voucher CTA',
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

  // ── 5. FAQ ──────────────────────────────────────────────
  {
    type: 'collapsible',
    label: '5. FAQ',
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

  // ── 6. How-To Articles ──────────────────────────────
  {
    type: 'collapsible',
    label: '6. How-To Articles',
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
