import type { Field } from 'payload'

/**
 * Workshop Overview fields — editable content for the /workshops overview page.
 *
 * Every text field is localized (de + en).
 * Collapsible groups map 1:1 to page sections for easy admin editing.
 */
export const workshopOverviewFields: Field[] = [
  {
    type: 'collapsible',
    label: '🎯 Hero Section',
    admin: { initCollapsed: false },
    fields: [
      {
        name: 'workshopsHeroEyebrow',
        type: 'text',
        required: false,
        localized: true,
        label: 'Eyebrow Text',
        admin: {
          description: 'Small text above the title (e.g., "Fermentation Workshops").',
        },
      },
      {
        name: 'workshopsHeroTitle',
        type: 'text',
        required: false,
        localized: true,
        label: 'Hero Title',
        admin: {
          description:
            'Main heading. Use \\n for line breaks (e.g., "Discover the Art\\nof Fermentation").',
        },
      },
      {
        name: 'workshopsHeroDescription',
        type: 'textarea',
        required: false,
        localized: true,
        label: 'Hero Description',
        admin: { description: 'Short intro text describing the workshops.' },
      },
      {
        name: 'workshopsHeroAttributes',
        type: 'array',
        required: false,
        minRows: 0,
        maxRows: 5,
        label: 'Hero Attributes',
        admin: {
          description: 'Small text items (e.g., "3 Hours", "Hands-on", "Experience").',
        },
        fields: [
          {
            name: 'text',
            type: 'text',
            required: true,
            localized: true,
            label: 'Attribute Text',
          },
        ],
      },
      {
        name: 'workshopsHeroImage',
        type: 'upload',
        relationTo: 'media',
        required: false,
        label: 'Hero Image',
        admin: {
          description:
            'Optional background image for the hero. If empty, jar silhouettes are shown.',
        },
      },
    ],
  },
  {
    type: 'collapsible',
    label: '📅 Workshop Calendar — Section Header',
    admin: {
      initCollapsed: true,
      description: 'The main title and description that appear above the workshop cards.',
    },
    fields: [
      {
        name: 'workshopsCalendarTitle',
        type: 'text',
        required: false,
        localized: true,
        label: 'Section Title',
        admin: { description: 'e.g., "Unsere Termine" / "Our Dates"' },
      },
      {
        name: 'workshopsCalendarDescription',
        type: 'textarea',
        required: false,
        localized: true,
        label: 'Section Description',
        admin: { description: 'Intro text below the title.' },
      },
    ],
  },
  {
    type: 'collapsible',
    label: '🃏 Workshop Cards (Lakto, Kombucha, Tempeh)',
    admin: {
      initCollapsed: true,
      description:
        'The 3 clickable cards at the top of the calendar — each shows a workshop type with image, next date and a booking button.',
    },
    fields: [
      {
        name: 'workshopsCalendarNextDateLabel',
        type: 'text',
        required: false,
        localized: true,
        label: 'Next Date Label',
        admin: {
          description:
            'Small label above the next date on each card (e.g. "Nächster Termin" / "Next Date").',
        },
      },
      {
        name: 'workshopsCalendarCards',
        type: 'array',
        required: false,
        minRows: 0,
        maxRows: 10,
        label: 'Workshop Cards',
        admin: {
          description:
            'Each card represents one workshop type. Configure the image, duration and button labels.',
        },
        fields: [
          {
            name: 'workshopType',
            type: 'select',
            required: true,
            localized: true,
            label: 'Workshop Type',
            options: [
              { label: '🥬 Basics (Lacto-vegetables)', value: 'basics' },
              { label: '🥒 Lakto-Gemüse', value: 'lakto' },
              { label: '🫖 Kombucha', value: 'kombucha' },
              { label: '🌱 Tempeh', value: 'tempeh' },
            ],
          },
          {
            name: 'cardImage',
            type: 'upload',
            relationTo: 'media',
            required: false,
            label: 'Card Image',
            admin: { description: 'Card background image for this workshop type.' },
          },
          {
            name: 'nextDate',
            type: 'text',
            required: false,
            localized: true,
            label: 'Next Date (Fallback)',
            admin: {
              description:
                '⚠️ Auto-filled from Workshop Appointments. Only used as fallback when no appointments exist.',
              readOnly: true,
            },
          },
          {
            name: 'duration',
            type: 'text',
            required: false,
            localized: true,
            label: 'Duration',
            admin: { description: 'e.g., "3h 30m" / "3.5 Stunden"' },
          },
          {
            name: 'detailsLabel',
            type: 'text',
            required: false,
            localized: true,
            label: 'Details Button Label',
            admin: { description: 'e.g., "Details" / "More Info"' },
          },
          {
            name: 'buttonLabel',
            type: 'text',
            required: false,
            localized: true,
            label: 'Button Label',
            admin: { description: 'e.g., "Buchen" / "Book Now"' },
          },
        ],
      },
    ],
  },
  {
    type: 'collapsible',
    label: '📋 All Dates List (Alle verfügbaren Termine)',
    admin: {
      initCollapsed: true,
      description:
        'The filterable list below the cards that shows every upcoming appointment with type, date, spots and a book button.',
    },
    fields: [
      {
        name: 'workshopsCalendarAllDatesHeading',
        type: 'text',
        localized: true,
        label: 'Heading',
        admin: { description: 'e.g. "Alle verfügbaren Termine" / "All Available Dates".' },
      },
      {
        name: 'workshopsCalendarAllFilterLabel',
        type: 'text',
        localized: true,
        label: '"All" Filter Button',
        admin: {
          description: 'Text on the filter button that shows all types (e.g. "Alle" / "All").',
        },
      },
      {
        name: 'workshopsCalendarTypeColumnLabel',
        type: 'text',
        localized: true,
        label: 'Type Column Label',
        admin: { description: 'e.g. "Workshop-Art" / "Workshop Type".' },
      },
      {
        name: 'workshopsCalendarDateColumnLabel',
        type: 'text',
        localized: true,
        label: 'Date Column Label',
        admin: { description: 'e.g. "Datum & Zeit" / "Date & Time".' },
      },
      {
        name: 'workshopsCalendarSpotsColumnLabel',
        type: 'text',
        localized: true,
        label: 'Spots Column Label',
        admin: { description: 'e.g. "Plätze frei" / "Spots Available".' },
      },
      {
        name: 'workshopsCalendarSpotsLabel',
        type: 'text',
        localized: true,
        label: 'Spots Unit Label',
        admin: { description: 'Word after the number (e.g. "Plätze" / "spots").' },
      },
      {
        name: 'workshopsCalendarSoldOutLabel',
        type: 'text',
        localized: true,
        label: 'Sold Out Label',
        admin: { description: 'Shown when all spots are taken (e.g. "Ausgebucht" / "Sold Out").' },
      },
      {
        name: 'workshopsCalendarBookLabel',
        type: 'text',
        localized: true,
        label: 'Book Button Label',
        admin: { description: 'Text on the booking button (e.g. "→ Buchen" / "→ Book").' },
      },
      {
        name: 'workshopsCalendarEmptyMessage',
        type: 'text',
        localized: true,
        label: 'No Dates Message',
        admin: { description: 'Shown when no appointments match the selected filter.' },
      },
    ],
  },
  // ── Voucher CTA Section ──────────────────────────────────
  {
    type: 'collapsible',
    label: '🎁 Voucher CTA Section',
    admin: { initCollapsed: true },
    fields: [
      {
        name: 'workshopsVoucherCustom',
        type: 'checkbox',
        label: 'Customize for this page',
        defaultValue: false,
        admin: {
          description:
            'Off = uses content from Website → Voucher CTA global. On = uses the fields below.',
        },
      },
      {
        name: 'workshopsVoucherHeading',
        type: 'text',
        localized: true,
        label: 'Heading',
        admin: {
          description: 'e.g., "Gift a special tasty experience"',
          condition: (data) => data?.workshops?.workshopsVoucherCustom === true,
        },
      },
      {
        name: 'workshopsVoucherDescription',
        type: 'textarea',
        localized: true,
        label: 'Description',
        admin: {
          description: 'Short paragraph below heading.',
          condition: (data) => data?.workshops?.workshopsVoucherCustom === true,
        },
      },
      {
        name: 'workshopsVoucherButtonLabel',
        type: 'text',
        localized: true,
        label: 'Button Label',
        admin: {
          description: 'e.g., "Voucher"',
          condition: (data) => data?.workshops?.workshopsVoucherCustom === true,
        },
      },
      {
        name: 'workshopsVoucherButtonLink',
        type: 'text',
        localized: true,
        label: 'Button Link',
        admin: {
          description: 'e.g., "/workshops/voucher"',
          condition: (data) => data?.workshops?.workshopsVoucherCustom === true,
        },
      },
      {
        name: 'workshopsVoucherGalleryImages',
        type: 'array',
        maxRows: 8,
        label: 'Gallery Images',
        admin: {
          description: 'Up to 8 images for the bento gallery.',
          condition: (data) => data?.workshops?.workshopsVoucherCustom === true,
        },
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
            label: 'Image',
          },
        ],
      },
      {
        name: 'workshopsVoucherBackgroundImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Background Image',
        admin: {
          description: 'Optional background image.',
          condition: (data) => data?.workshops?.workshopsVoucherCustom === true,
        },
      },
    ],
  },
  // ── Product Slider Section ───────────────────────────────
  {
    type: 'collapsible',
    label: '🛒 Product Slider Section',
    admin: { initCollapsed: true },
    fields: [
      {
        name: 'workshopsProductSliderCustom',
        type: 'checkbox',
        label: 'Customize for this page',
        defaultValue: false,
        admin: {
          description:
            'Off = uses content from Website → Product Slider global. On = uses the fields below.',
        },
      },
      {
        name: 'workshopsProductSliderHeading',
        type: 'text',
        localized: true,
        label: 'Heading',
        admin: {
          description: 'e.g., "Discover UNIQUE."',
          condition: (data) => data?.workshops?.workshopsProductSliderCustom === true,
        },
      },
      {
        name: 'workshopsProductSliderHeadingAccent',
        type: 'text',
        localized: true,
        label: 'Heading Accent Word',
        admin: {
          description: 'Accent word displayed next to heading (e.g., "FLAVOURS").',
          condition: (data) => data?.workshops?.workshopsProductSliderCustom === true,
        },
      },
      {
        name: 'workshopsProductSliderDescription',
        type: 'textarea',
        localized: true,
        label: 'Description',
        admin: {
          description: 'Short paragraph (1–2 sentences).',
          condition: (data) => data?.workshops?.workshopsProductSliderCustom === true,
        },
      },
      {
        name: 'workshopsProductSliderButtonLabel',
        type: 'text',
        localized: true,
        label: 'Button Label',
        admin: {
          description: 'e.g., "View All Products"',
          condition: (data) => data?.workshops?.workshopsProductSliderCustom === true,
        },
      },
      {
        name: 'workshopsProductSliderButtonLink',
        type: 'text',
        localized: true,
        label: 'Button Link',
        admin: {
          description: 'e.g., "/products"',
          condition: (data) => data?.workshops?.workshopsProductSliderCustom === true,
        },
      },
      {
        name: 'workshopsProductSliderProducts',
        type: 'relationship',
        relationTo: 'products',
        hasMany: true,
        label: 'Products',
        admin: {
          description: 'Select products to display in the slider.',
          condition: (data) => data?.workshops?.workshopsProductSliderCustom === true,
        },
      },
    ],
  },
  // ── Sponsors Bar Section ─────────────────────────────────
  {
    type: 'collapsible',
    label: '🤝 Sponsors Bar Section',
    admin: { initCollapsed: true },
    fields: [
      {
        name: 'workshopsSponsorsCustom',
        type: 'checkbox',
        label: 'Customize for this page',
        defaultValue: false,
        admin: {
          description:
            'Off = uses content from Website → Sponsors Bar global. On = uses the fields below.',
        },
      },
      {
        name: 'workshopsSponsorsHeading',
        type: 'text',
        localized: true,
        label: 'Heading',
        admin: {
          description: 'e.g., "This project is supported by:"',
          condition: (data) => data?.workshops?.workshopsSponsorsCustom === true,
        },
      },
      {
        name: 'workshopsSponsorsList',
        type: 'array',
        maxRows: 10,
        label: 'Sponsors',
        admin: {
          description: 'Sponsor logos and links.',
          condition: (data) => data?.workshops?.workshopsSponsorsCustom === true,
        },
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true,
            localized: true,
            label: 'Sponsor Name',
          },
          {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
            required: true,
            label: 'Logo',
          },
          {
            name: 'url',
            type: 'text',
            label: 'Website URL',
            admin: { description: 'Optional link to sponsor website.' },
          },
        ],
      },
    ],
  },
  // ── Testimonials Section ─────────────────────────────────
  {
    type: 'collapsible',
    label: '💬 Testimonials Section',
    admin: { initCollapsed: true },
    fields: [
      {
        name: 'workshopsTestimonialsCustom',
        type: 'checkbox',
        label: 'Customize for this page',
        defaultValue: false,
        admin: {
          description:
            'Off = uses content from Website → Testimonials global. On = uses the fields below.',
        },
      },
      {
        name: 'workshopsTestimonialsEyebrow',
        type: 'text',
        localized: true,
        label: 'Eyebrow',
        admin: {
          description: 'Small text above heading (e.g., "Testimonials").',
          condition: (data) => data?.workshops?.workshopsTestimonialsCustom === true,
        },
      },
      {
        name: 'workshopsTestimonialsHeading',
        type: 'text',
        localized: true,
        label: 'Heading',
        admin: {
          description: 'e.g., "What Our Community Says"',
          condition: (data) => data?.workshops?.workshopsTestimonialsCustom === true,
        },
      },
      {
        name: 'workshopsTestimonialsList',
        type: 'array',
        minRows: 1,
        maxRows: 10,
        label: 'Testimonials',
        admin: {
          description: 'Customer quotes and ratings.',
          condition: (data) => data?.workshops?.workshopsTestimonialsCustom === true,
        },
        fields: [
          {
            name: 'quote',
            type: 'textarea',
            required: true,
            localized: true,
            label: 'Quote',
          },
          {
            name: 'authorName',
            type: 'text',
            required: true,
            localized: true,
            label: 'Author Name',
          },
          {
            name: 'authorRole',
            type: 'text',
            localized: true,
            label: 'Author Role',
            admin: { description: 'e.g., "Workshop Participant"' },
          },
          {
            name: 'rating',
            type: 'number',
            min: 1,
            max: 5,
            defaultValue: 5,
            label: 'Rating (1–5)',
          },
        ],
      },
    ],
  },
]
