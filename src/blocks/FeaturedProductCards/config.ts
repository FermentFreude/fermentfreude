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
      name: 'heading',
      type: 'text',
      localized: true,
      label: 'Section Heading',
      admin: {
        description: 'Main heading above the cards (e.g. "Unsere Bestseller" / "Our Bestsellers").',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      localized: true,
      label: 'Section Subheading',
      admin: {
        description: 'Short intro text below the heading.',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      minRows: 1,
      maxRows: 3,
      required: true,
      label: 'Featured Products (max 3)',
      admin: {
        description:
          'Select up to 3 products to display as large feature cards. These appear in a 3-column row.',
      },
    },
    {
      name: 'cardColors',
      type: 'array',
      label: 'Card Background Colors',
      minRows: 0,
      maxRows: 3,
      admin: {
        description:
          'Optional accent colors for each card. Leave empty for defaults (olive-green, warm-gold, earthy-brown).',
      },
      fields: [
        {
          name: 'color',
          type: 'text',
          label: 'Background Color (hex)',
          admin: { description: 'e.g. #4b6043, #b8860b, #8b4513' },
        },
      ],
    },
    {
      name: 'bannerProduct',
      type: 'relationship',
      relationTo: 'products',
      hasMany: false,
      label: 'Banner Product (full width)',
      admin: {
        description:
          'A single product shown as a wide banner card below the 3-column row (e.g. Tempeh).',
      },
    },
    {
      name: 'bannerColor',
      type: 'text',
      label: 'Banner Background Color',
      admin: {
        description: 'Banner card accent color. Default: #555954 (muted olive).',
      },
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
