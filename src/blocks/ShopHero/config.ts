import type { Block } from 'payload'

export const ShopHero: Block = {
  slug: 'shopHero',
  interfaceName: 'ShopHeroBlock',
  labels: {
    singular: 'Shop Hero',
    plural: 'Shop Heroes',
  },
  fields: [
    {
      name: 'heroTitle',
      type: 'text',
      required: true,
      localized: true,
      label: 'Hero Title',
      admin: {
        description:
          'Single main headline for the hero section (e.g. "Unsere handgemachten Produkte aus unserem Pick-Up Shop").',
      },
    },
    {
      name: 'heroPrice',
      type: 'text',
      required: false,
      localized: true,
      label: 'Price Display',
      admin: {
        description: 'Price shown below the title (e.g. "ab €8,50"). Leave empty to hide.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaPrimaryLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'Primary Button Label',
          admin: { width: '25%', description: 'e.g. "Jetzt bestellen"' },
        },
        {
          name: 'ctaPrimaryUrl',
          type: 'text',
          required: false,
          label: 'Primary Button URL',
          admin: { width: '25%', description: 'e.g. "/shop#products"' },
        },
        {
          name: 'ctaSecondaryLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'Secondary Button Label',
          admin: { width: '25%', description: 'e.g. "Mehr erfahren"' },
        },
        {
          name: 'ctaSecondaryUrl',
          type: 'text',
          required: false,
          label: 'Secondary Button URL',
          admin: { width: '25%', description: 'e.g. "/fermentation"' },
        },
      ],
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Product Cards',
      minRows: 2,
      maxRows: 6,
      admin: {
        description:
          'Product cards for the scrolling carousel. Each card has an image, category label, and link to product detail.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Product Image',
          admin: {
            description: 'Product photo (portrait ratio, ~860×1044px).',
          },
        },
        {
          name: 'categoryLabel',
          type: 'text',
          required: true,
          localized: true,
          label: 'Card Label',
          admin: {
            description: 'Label shown vertically on the card (e.g. "Tempeh", "Kimchi").',
          },
        },
        {
          name: 'detailUrl',
          type: 'text',
          required: false,
          label: 'Detail Link',
          admin: {
            description: 'URL the arrow button links to (e.g. "/shop/tempeh").',
          },
        },
      ],
    },
    {
      name: 'bottomTagline',
      type: 'text',
      required: false,
      localized: true,
      label: 'Bottom Tagline',
      admin: {
        description:
          'Small bold text at the bottom (e.g. "Fermentierte Lebensmittel, mit Sorgfalt hergestellt.").',
      },
    },
    {
      name: 'bottomSubtitle',
      type: 'text',
      required: false,
      localized: true,
      label: 'Bottom Subtitle',
      admin: {
        description:
          'Secondary line below the tagline (e.g. "Abholung in Berlin — jede Woche frisch.").',
      },
    },
    {
      name: 'bottomDisclaimer',
      type: 'text',
      required: false,
      localized: true,
      label: 'Delivery Note',
      admin: {
        description:
          'Optional note about delivery plans (e.g. "Lieferung in Planung — für garantierte Frische.").',
      },
    },
  ],
}
