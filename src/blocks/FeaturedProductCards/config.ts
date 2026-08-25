import type { Block } from 'payload'

export const FeaturedProductCards: Block = {
  slug: 'featuredProductCards',
  interfaceName: 'FeaturedProductCardsBlock',
  labels: {
    singular: 'Featured Product Cards',
    plural: 'Featured Product Cards',
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
      name: 'bannerProduct',
      type: 'relationship',
      relationTo: 'products',
      hasMany: false,
      label: 'Hero Product',
      admin: {
        description:
          'Shown first and largest — FermentFreude hero product (Käferbohnentempeh).',
      },
    },
    {
      name: 'bannerColor',
      type: 'text',
      label: 'Hero Background Color',
      admin: {
        description: 'Hero card accent color. Default: #403c39.',
      },
    },
    {
      name: 'heading',
      type: 'textarea',
      localized: true,
      label: 'Section Heading',
      admin: {
        description:
          'Optional heading above products (e.g. "Weitere Produkte"). Avoid "Bestseller" — Käfer is already the hero above, so this section is only the other products.',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      localized: true,
      label: 'Section Subheading',
      admin: {
        description: 'Short intro text below the heading. Leave empty to keep the layout calm.',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      minRows: 0,
      maxRows: 3,
      required: false,
      label: 'Supporting Products (max 2–3)',
      admin: {
        description:
          'Berglinsentempeh + Kimchi (seasonal). If the hero product is also selected here, it is shown only once in the hero. Prefer 2 supporting products when a hero is set.',
      },
    },
    {
      name: 'cardColors',
      type: 'array',
      label: 'Supporting Card Colors',
      minRows: 0,
      maxRows: 3,
      admin: {
        description:
          'Optional accent colors for each supporting card. Leave empty for defaults.',
      },
      fields: [
        {
          name: 'color',
          type: 'text',
          label: 'Background Color (hex)',
          admin: { description: 'e.g. #4b6043, #403c39' },
        },
      ],
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      label: 'CTA Button Label',
      admin: {
        description: 'Button text on each card (e.g. "Jetzt bestellen" / "Order Now").',
      },
    },
  ],
}
