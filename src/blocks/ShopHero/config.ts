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
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: {
        description: 'Toggle off to hide this section on the page without deleting it.',
      },
    },
    {
      name: 'heroProduct',
      type: 'relationship',
      relationTo: 'products',
      hasMany: false,
      label: 'Hero Product (Käferbohnentempeh)',
      admin: {
        description:
          'Hero product at the top of /shop. Title, price, description and sold-out come from this product. Packaging shots belong on the product detail page.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Background Image',
      admin: {
        description:
          'Full-bleed plated photo behind the hero. Leave empty to use the default Käfer photo. Prefer a prepared/plated shot (not packaging).',
      },
    },
    {
      name: 'heroPanelColor',
      type: 'text',
      label: 'Hero Panel Color',
      defaultValue: '#403c39',
      admin: {
        description: 'Legacy field — kept for older layouts. Default: #403c39.',
      },
    },
    {
      name: 'trustItems',
      type: 'array',
      label: 'Trust Row (below hero)',
      minRows: 0,
      maxRows: 3,
      labels: { singular: 'Trust Item', plural: 'Trust Items' },
      admin: {
        description:
          'Three short highlights under the hero (icons + text). Leave empty to show the default Graz / pickup / fresh lines.',
      },
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Icon',
          required: true,
          defaultValue: 'hand',
          options: [
            { label: 'Hand (handmade)', value: 'hand' },
            { label: 'Map pin (pickup)', value: 'mapPin' },
            { label: 'Leaf (fresh)', value: 'leaf' },
          ],
          admin: { description: 'Icon shown in the gold circle.' },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Label',
          admin: {
            description: 'e.g. "Handgemacht in Graz" / "Handmade in Graz"',
          },
        },
      ],
    },
    {
      name: 'heroTitle',
      type: 'textarea',
      required: false,
      localized: true,
      label: 'Intro Line (optional)',
      admin: {
        description:
          'Small line above the hero product (e.g. pickup shop intro). Leave empty to keep focus on the product.',
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
          admin: { width: '50%', description: 'Overrides product CTA (e.g. "Jetzt bestellen")' },
        },
        {
          name: 'ctaPrimaryUrl',
          type: 'text',
          required: false,
          label: 'Primary Button URL',
          admin: {
            width: '50%',
            description: 'Leave empty to link to the hero product page.',
          },
        },
      ],
    },
    {
      name: 'bottomTagline',
      type: 'text',
      required: false,
      localized: true,
      label: 'Pickup Tagline',
      admin: {
        description: 'e.g. "Fermentierte Lebensmittel, mit Sorgfalt hergestellt."',
      },
    },
    {
      name: 'bottomSubtitle',
      type: 'textarea',
      required: false,
      localized: true,
      label: 'Pickup Subtitle',
      admin: {
        description: 'e.g. "Abholung in Graz, jede Woche frisch."',
      },
    },
    {
      name: 'bottomDisclaimer',
      type: 'text',
      required: false,
      localized: true,
      label: 'Delivery Note',
      admin: {
        description: 'Optional delivery note under the pickup lines.',
      },
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Product Cards (legacy — unused)',
      minRows: 0,
      maxRows: 6,
      admin: {
        description: 'Legacy jar slider — unused. Leave empty.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Product Image',
        },
        {
          name: 'categoryLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'Card Label',
        },
        {
          name: 'detailUrl',
          type: 'text',
          required: false,
          label: 'Detail Link',
        },
      ],
    },
  ],
}
