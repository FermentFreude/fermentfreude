import type { Field } from 'payload'

/** Shared “What to expect” cards — shown inside the booking section on the live page. */
const whatToExpectCardFields: Field[] = [
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
    admin: { description: 'Main heading for the experience cards (e.g. "Dein Workshop-Erlebnis").' },
  },
  {
    name: 'experienceCards',
    type: 'array',
    label: 'Experience Cards',
    maxRows: 6,
    admin: {
      description:
        'Three cards with images work best (Theory · Practice · Tasting). Upload one image per card.',
      initCollapsed: false,
    },
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
        type: 'textarea',
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
        label: 'Card Image',
        admin: { description: 'Photo for this step — shown on the workshop page.' },
      },
    ],
  },
]

/**
 * Workshop Detail fields — editable content for the dedicated workshop detail page.
 * Currently used by /workshops/lakto-gemuese, expandable to other workshops.
 *
 * Every text field is localized (de + en).
 * Content for each page section lives directly inside its block in `pageSections` —
 * expand a block to edit its copy. There is no separate "Edit text & images" area.
 */
export const workshopDetailFields: Field[] = [
  // ── Template settings ─────────────────────────────────────
  {
    name: 'layoutTemplate',
    type: 'select',
    label: 'Page Template',
    defaultValue: 'standard',
    options: [
      {
        label: 'Standard (Lakto / Tempeh / Kombucha layout)',
        value: 'standard',
      },
      {
        label: 'Special (Custom editorial — e.g. Vom Feld ins Glas)',
        value: 'special',
      },
    ],
    admin: {
      description:
        'Standard = reusable workshop layout with booking, FAQ, voucher. Special = fully custom editorial layout (developer-only).',
    },
  },
  {
    name: 'heroStyle',
    type: 'select',
    label: 'Hero Style',
    defaultValue: 'default',
    options: [
      { label: 'Default (neutral)', value: 'default' },
      { label: 'Lakto (sage green)', value: 'lakto' },
      { label: 'Tempeh (warm cream)', value: 'tempeh' },
      { label: 'Kombucha (cool teal)', value: 'kombucha' },
    ],
    admin: {
      condition: (_data, siblingData) => siblingData?.layoutTemplate !== 'special',
      description: 'Visual theme for the hero section. Default works for new workshops.',
    },
  },
  {
    name: 'workshopDbSlug',
    type: 'text',
    label: 'Booking Slug (database)',
    admin: {
      condition: (_data, siblingData) => siblingData?.layoutTemplate !== 'special',
      description:
        'Slug in Workshops collection for appointments & cart. Leave empty if same as page slug (e.g. lakto-gemuese → "lakto" is automatic). Only set for new workshop pages when the page slug differs from the Workshops record.',
    },
  },
  // ── Page Sections — drag to reorder, expand to edit content ──
  {
    name: 'pageSections',
    type: 'blocks',
    label: 'Page Sections',
    labels: {
      singular: 'Section',
      plural: 'Sections',
    },
    admin: {
      description: 'Drag to reorder. Expand a section to edit its content. Upload images in Hero, What to Expect, and Booking → header image.',
      initCollapsed: false,
    },
    blocks: [
      {
        slug: 'hero',
        labels: { singular: 'Hero', plural: 'Hero' },
        fields: [
          { name: 'enabled', type: 'checkbox', label: 'Show on page', defaultValue: true },
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
                'Hero background image (full-bleed). For Vom Feld ins Glas this is the wheat field photo. When empty, a fallback media file is used.',
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
            fields: [
              { name: 'text', type: 'text', required: true, localized: true, label: 'Text' },
            ],
          },
          {
            name: 'sealRingText',
            type: 'text',
            localized: true,
            label: 'Seal Ring Text',
            admin: {
              description:
                'Text repeated around the hero stamp circle (e.g. "SPEZIAL-WORKSHOP" / "SPECIAL WORKSHOP"). Leave empty to use the default.',
            },
          },
          {
            name: 'sealCenterText',
            type: 'text',
            localized: true,
            label: 'Seal Center Text (brand)',
            admin: {
              description:
                'Middle of the stamp. Use exactly: FERMENT · freude  → shows as two lines (FERMENT / freude). Change DE and EN separately.',
            },
          },
        ],
      },
      {
        slug: 'whatToExpect',
        labels: { singular: 'What to Expect (images)', plural: 'What to Expect' },
        fields: [
          {
            name: 'enabled',
            type: 'checkbox',
            label: 'Show on page',
            defaultValue: true,
            admin: {
              description:
                'Three image cards inside the booking area (Theory · Practice · Tasting). Upload hero-style photos here.',
            },
          },
          ...whatToExpectCardFields,
        ],
      },
      {
        slug: 'experience',
        labels: { singular: 'Konzept (Special pages only)', plural: 'Konzept' },
        fields: [
          {
            name: 'enabled',
            type: 'checkbox',
            label: 'Show on page',
            defaultValue: true,
            admin: {
              description:
                'Only for “Special” template (e.g. Vom Feld ins Glas). Toggle the editorial Feld · Küche · Glas story — detailed copy is still partly code-driven.',
            },
          },
        ],
      },
      {
        slug: 'booking',
        labels: { singular: 'Booking', plural: 'Booking' },
        fields: [
          { name: 'enabled', type: 'checkbox', label: 'Show on page', defaultValue: true },

          {
            type: 'collapsible',
            label: '1. Header, price & card image',
            admin: { initCollapsed: false },
            fields: [
          {
            name: 'bookingEyebrow',
            type: 'text',
            localized: true,
            label: 'Header Eyebrow',
            admin: {
              description: 'e.g. "3-STUNDEN HANDS-ON WORKSHOP" / "3-HOUR HANDS-ON WORKSHOP"',
            },
          },
          {
            name: 'bookingTitle',
            type: 'text',
            localized: true,
            label: 'Booking Card Title',
            admin: {
              description:
                'Main title shown on the dark booking header (e.g. "Lakto-Fermentiertes Gemüse" / "Lacto-Fermented Vegetables", "Tempeh", "Kombucha"). Set both German and English values.',
            },
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
            admin: {
              description: 'Small attribute pills (e.g. "3 Stunden", "Hands-on", "Experience").',
            },
            fields: [
              { name: 'text', type: 'text', required: true, localized: true, label: 'Text' },
            ],
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
            ],
          },

          {
            type: 'collapsible',
            label: '2. About the workshop',
            admin: { initCollapsed: true },
            fields: [
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
            ],
          },

          {
            type: 'collapsible',
            label: '3. Schedule (step-by-step)',
            admin: { initCollapsed: true },
            fields: [
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
            labels: { singular: 'Step', plural: 'Steps' },
            admin: {
              description: 'Drag ⋮⋮ to reorder steps 01, 02, 03… inside the booking card.',
              initCollapsed: false,
            },
            fields: [
              {
                name: 'duration',
                type: 'text',
                required: true,
                localized: true,
                label: 'Number',
                admin: { description: 'e.g. "01", "02"' },
              },
              {
                name: 'title',
                type: 'textarea',
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
            ],
          },

          {
            type: 'collapsible',
            label: '4. Included in the price',
            admin: { initCollapsed: true },
            fields: [
          {
            name: 'includedHeading',
            type: 'text',
            localized: true,
            label: 'Included Heading',
            admin: {
              description: 'e.g. "Im Preis enthalten (€99)" / "Included in the Price (€99)"',
            },
          },
          {
            name: 'includedItems',
            type: 'array',
            label: 'Included Items',
            maxRows: 12,
            admin: { description: 'List of items/benefits included in the workshop.' },
            fields: [
              { name: 'text', type: 'text', required: true, localized: true, label: 'Item' },
            ],
          },
            ],
          },

          {
            type: 'collapsible',
            label: '5. Why this workshop',
            admin: { initCollapsed: true },
            fields: [
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
            ],
          },

          {
            type: 'collapsible',
            label: '6. Dates & booking modal labels',
            admin: { initCollapsed: true },
            fields: [
          {
            name: 'datesHeading',
            type: 'text',
            localized: true,
            label: 'Dates Heading',
            admin: { description: 'e.g. "Nächste Workshops" / "Upcoming Workshops"' },
          },
          {
            type: 'row',
            fields: [
              {
                name: 'datesDateColumnLabel',
                type: 'text',
                localized: true,
                label: 'Date Column Header',
                admin: { description: 'e.g. "Datum" / "Date"' },
              },
              {
                name: 'datesTimeColumnLabel',
                type: 'text',
                localized: true,
                label: 'Time Column Header',
                admin: { description: 'e.g. "Zeit" / "Time"' },
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'datesSpotsColumnLabel',
                type: 'text',
                localized: true,
                label: 'Spots Column Header',
                admin: { description: 'e.g. "Plätze frei" / "Spots available"' },
              },
              {
                name: 'soldOutLabel',
                type: 'text',
                localized: true,
                label: 'Sold Out Label',
                admin: { description: 'e.g. "Ausgebucht" / "Sold out"' },
              },
            ],
          },
          {
            name: 'noDatesMessage',
            type: 'textarea',
            localized: true,
            label: 'No Dates Message',
            admin: {
              description: 'Shown when no appointment dates exist yet.',
            },
          },
          {
            type: 'row',
            fields: [
              {
                name: 'closeDatesLabel',
                type: 'text',
                localized: true,
                label: 'Close Dates (accessibility)',
                admin: { description: 'e.g. "Termine schließen" / "Close dates"' },
              },
              {
                name: 'closeDetailsLabel',
                type: 'text',
                localized: true,
                label: 'Close Details Button',
                admin: { description: 'e.g. "Details schließen" / "Close details"' },
              },
            ],
          },
          {
            name: 'bookingImagePlaceholderLabel',
            type: 'text',
            localized: true,
            label: 'Booking Image Placeholder',
            admin: {
              description: 'Text shown when no booking header image is uploaded.',
            },
          },
          {
            type: 'row',
            fields: [
              {
                name: 'detailsAboutEyebrow',
                type: 'text',
                localized: true,
                label: 'Details — About Eyebrow',
                admin: { description: 'Optional. Defaults to the About heading in uppercase.' },
              },
              {
                name: 'detailsScheduleEyebrow',
                type: 'text',
                localized: true,
                label: 'Details — Schedule Eyebrow',
                admin: { description: 'Optional. Defaults to the Schedule heading in uppercase.' },
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'detailsIncludedEyebrow',
                type: 'text',
                localized: true,
                label: 'Details — Included Eyebrow',
                admin: { description: 'Optional. Defaults to the Included heading in uppercase.' },
              },
              {
                name: 'detailsWhyEyebrow',
                type: 'text',
                localized: true,
                label: 'Details — Why Eyebrow',
                admin: { description: 'Optional. Defaults to the Why heading in uppercase.' },
              },
            ],
          },
          // Dates are fetched automatically from Workshop Appointments collection.
          // No manual date entry needed here — create appointments in Workshops → Workshop Appointments.

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
          {
            name: 'modalGuestCountLabel',
            type: 'text',
            localized: true,
            label: 'Modal Guest Count Label',
            admin: { description: 'e.g. "Anzahl Personen" / "Number of guests"' },
          },
          {
            name: 'modalAvailableSpotsPrefix',
            type: 'text',
            localized: true,
            label: 'Modal Available Spots Prefix',
            admin: { description: 'e.g. "Verfügbar für dieses Datum:" / "Available for this date:"' },
          },
          {
            name: 'modalSpotsUnit',
            type: 'text',
            localized: true,
            label: 'Modal Spots Unit',
            admin: { description: 'Word after the count (e.g. "Plätze" / "spots")' },
          },
          {
            name: 'modalCapacityWarning',
            type: 'textarea',
            localized: true,
            label: 'Modal Capacity Warning',
            admin: {
              description:
                'Use {requested} and {available} as placeholders. e.g. "Sie möchten {requested} Plätze buchen, aber nur {available} sind verfügbar."',
            },
          },
          {
            type: 'row',
            fields: [
              {
                name: 'modalReduceGuestsLabel',
                type: 'text',
                localized: true,
                label: 'Modal Reduce Guests Button',
                admin: { description: 'Use {count}. e.g. "Auf {count} reduzieren"' },
              },
              {
                name: 'modalChooseDifferentDateLabel',
                type: 'text',
                localized: true,
                label: 'Modal Choose Date Button',
                admin: { description: 'e.g. "Anderes Datum wählen" / "Choose a different date"' },
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'modalAddToCartLabel',
                type: 'text',
                localized: true,
                label: 'Modal Add to Cart Button',
                admin: { description: 'e.g. "In den Warenkorb" / "Add to cart"' },
              },
              {
                name: 'modalAddingLabel',
                type: 'text',
                localized: true,
                label: 'Modal Adding Label',
                admin: { description: 'Shown while adding to cart (e.g. "Wird hinzugefügt...")' },
              },
            ],
          },
          {
            name: 'modalCloseLabel',
            type: 'text',
            localized: true,
            label: 'Modal Close (accessibility)',
            admin: { description: 'e.g. "Schließen" / "Close"' },
          },
            ],
          },
        ],
      },
      {
        slug: 'recipePlan',
        labels: { singular: 'Recipe Plan', plural: 'Recipe Plan' },
        fields: [
          { name: 'enabled', type: 'checkbox', label: 'Show on page', defaultValue: true },
          {
            name: 'recipePlanEyebrow',
            type: 'text',
            localized: true,
            label: 'Eyebrow',
            admin: { description: 'e.g. "Im Workshop" / "In the workshop"' },
          },
          {
            name: 'recipePlanTitle',
            type: 'text',
            localized: true,
            label: 'Title',
            admin: {
              description: 'e.g. "Das fermentieren wir." / "What we will ferment."',
            },
          },
          {
            name: 'recipePlanDescription',
            type: 'textarea',
            localized: true,
            label: 'Description',
            admin: {
              description:
                'Short explanation under the title — why this isn’t a monthly calendar.',
            },
          },
          {
            name: 'recipePlanRecipes',
            type: 'array',
            label: 'Recipes',
            minRows: 1,
            maxRows: 4,
            admin: {
              description:
                'Usually 2 recipes per workshop. Add or remove as needed — order = display order.',
            },
            fields: [
              {
                name: 'name',
                type: 'text',
                required: true,
                localized: true,
                label: 'Recipe name',
                admin: { description: 'e.g. "Zucchini-Pickels"' },
              },
            ],
          },
        ],
      },
      {
        slug: 'calendar',
        labels: { singular: 'Seasonal Calendar', plural: 'Seasonal Calendar' },
        fields: [
          {
            name: 'enabled',
            type: 'checkbox',
            label: 'Show on page',
            defaultValue: false,
            admin: {
              description:
                'Shows the seasonal Fermentkalender. Month/recipe content is edited in “Seasonal calendar — months” below.',
            },
          },
        ],
      },
      {
        slug: 'howTo',
        labels: { singular: 'Tipps & Guides', plural: 'Tipps & Guides' },
        fields: [
          { name: 'enabled', type: 'checkbox', label: 'Show on page', defaultValue: false },
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
      {
        slug: 'faq',
        labels: { singular: 'FAQ', plural: 'FAQ' },
        fields: [
          { name: 'enabled', type: 'checkbox', label: 'Show on page', defaultValue: true },
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
            admin: {
              description:
                'Optional mailto link at the bottom. e.g. kontakt@fermentfreude.at — leave empty to link to /contact only.',
            },
          },
          {
            name: 'faqContactPrompt',
            type: 'text',
            localized: true,
            label: 'Contact Prompt',
            admin: { description: 'e.g. "Noch Fragen?" / "Still have questions?"' },
          },
          {
            name: 'faqContactLinkLabel',
            type: 'text',
            localized: true,
            label: 'Contact Link Label',
            admin: { description: 'e.g. "Schreib uns" / "Get in touch"' },
          },
          {
            name: 'faqContactHref',
            type: 'text',
            label: 'Contact Link URL',
            admin: {
              description:
                'Default /contact. Use mailto:kontakt@fermentfreude.at to open email directly.',
            },
          },
        ],
      },
      {
        slug: 'voucher',
        labels: { singular: 'Voucher / Gift', plural: 'Voucher' },
        fields: [
          { name: 'enabled', type: 'checkbox', label: 'Show on page', defaultValue: true },
          {
            name: 'useGlobalVoucherData',
            type: 'checkbox',
            label: 'Use global Voucher CTA content',
            defaultValue: true,
            admin: {
              description:
                '✅ ON = Uses shared content from Website → Voucher CTA (edit once, applies everywhere).\n❌ OFF = Use custom content just for this workshop page.',
            },
          },
          {
            name: 'voucherEyebrow',
            type: 'text',
            localized: true,
            label: 'Eyebrow',
            admin: {
              description: 'e.g. "GEMEINSAM FERMENTIEREN" / "FERMENT TOGETHER"',
              condition: (_data, siblingData) => siblingData?.useGlobalVoucherData === false,
            },
          },
          {
            name: 'voucherTitle',
            type: 'text',
            localized: true,
            label: 'Title',
            admin: {
              description: 'e.g. "Go with a friend."',
              condition: (_data, siblingData) => siblingData?.useGlobalVoucherData === false,
            },
          },
          {
            name: 'voucherDescription',
            type: 'textarea',
            localized: true,
            label: 'Description',
            admin: {
              condition: (_data, siblingData) => siblingData?.useGlobalVoucherData === false,
            },
          },
          {
            name: 'voucherBackgroundImage',
            type: 'upload',
            relationTo: 'media',
            label: 'Background Image',
            admin: {
              description:
                'Optional background image. If provided, text will be white with a dark overlay. If empty, cream background with dark text will be used.',
              condition: (_data, siblingData) => siblingData?.useGlobalVoucherData === false,
            },
          },
          {
            type: 'row',
            admin: {
              condition: (_data, siblingData) => siblingData?.useGlobalVoucherData === false,
            },
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
            admin: {
              condition: (_data, siblingData) => siblingData?.useGlobalVoucherData === false,
            },
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
              description:
                'Small tags below buttons (e.g. "Sofort einlösbar", "Für alle Workshops").',
              condition: (_data, siblingData) => siblingData?.useGlobalVoucherData === false,
            },
            fields: [
              { name: 'text', type: 'text', required: true, localized: true, label: 'Text' },
            ],
          },
        ],
      },
      {
        slug: 'moreWorkshops',
        labels: { singular: 'More Workshops', plural: 'More Workshops' },
        fields: [
          { name: 'enabled', type: 'checkbox', label: 'Show on page', defaultValue: true },
          {
            name: 'sliderHeading',
            type: 'text',
            localized: true,
            label: 'Heading',
            admin: {
              description: 'e.g. "Entdecke weitere Workshops" / "Discover Other Workshops".',
            },
          },
          {
            name: 'sliderSubtitle',
            type: 'textarea',
            localized: true,
            label: 'Subtitle',
            admin: { description: 'Short paragraph below the heading.' },
          },
          {
            name: 'sliderPillLabel',
            type: 'text',
            localized: true,
            label: 'Pill Label',
            admin: { description: 'Small pill/badge text (e.g. "Workshop" / "Workshop").' },
          },
          {
            name: 'sliderBuyLabel',
            type: 'text',
            localized: true,
            label: 'Buy Button Label',
            admin: { description: 'e.g. "Buchen" / "Book Now".' },
          },
          {
            name: 'sliderMoreInfoLabel',
            type: 'text',
            localized: true,
            label: 'More Info Label',
            admin: { description: 'e.g. "Mehr erfahren" / "Learn More".' },
          },
        ],
      },
    ],
  },

  // ── Visibility toggles ───────────────────────────────────
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
  {
    type: 'checkbox',
    name: 'showHowToGuides',
    label: 'Show Tipps & Guides?',
    admin: {
      description:
        'Legacy toggle. Prefer enabling Tipps in Page Sections above. Usually off for Vom Feld ins Glas.',
    },
    defaultValue: true,
  },

  // ── Seasonal Calendar (not part of Page Sections) ────────
  {
    type: 'collapsible',
    label: 'Seasonal calendar — months',
    admin: {
      initCollapsed: true,
      description: 'Only used when “Show Seasonal Calendar?” is on (usually off for Feld).',
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
]
