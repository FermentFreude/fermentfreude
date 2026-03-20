import type { Block } from 'payload'

export const ShopProductGrid: Block = {
  slug: 'shopProductGrid',
  interfaceName: 'ShopProductGridBlock',
  labels: {
    singular: 'Shop Product Grid',
    plural: 'Shop Product Grids',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      required: false,
      localized: true,
      label: 'Eyebrow Text',
      admin: { description: 'Small label above the heading (e.g. "Unsere Produkte").' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Section Heading',
      admin: { description: 'Main heading (e.g. "Shop All Products").' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      localized: true,
      label: 'Section Description',
      admin: {
        description:
          'Intro text below the heading (e.g. "All products available for pickup at our Berlin studio.").',
      },
    },
    {
      name: 'pickupNotice',
      type: 'text',
      required: false,
      localized: true,
      label: 'Pickup Notice',
      admin: {
        description: 'Badge text for pickup-only (e.g. "Abholung in Berlin"). Leave empty to hide.',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Featured Products',
      admin: {
        description:
          'Select specific products to feature. Leave empty to show all published products automatically.',
      },
    },
    {
      name: 'showAllFallback',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show all products if none selected',
      admin: {
        description:
          'When checked and no products are selected above, all published products will be displayed.',
      },
    },
    {
      name: 'maxProducts',
      type: 'number',
      defaultValue: 12,
      label: 'Max Products',
      admin: {
        description: 'Maximum number of products to display (default 12).',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      required: false,
      localized: true,
      label: 'CTA Button Label',
      admin: { description: 'Button text below the grid (e.g. "View All Products").' },
    },
    {
      name: 'ctaUrl',
      type: 'text',
      required: false,
      label: 'CTA Button URL',
      admin: { description: 'Where the CTA links to (e.g. "/shop").' },
    },
  ],
}
