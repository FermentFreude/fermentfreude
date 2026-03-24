import type { Block } from 'payload'

export const ProductSlider: Block = {
  slug: 'productSlider',
  interfaceName: 'ProductSliderBlock',
  labels: {
    singular: 'Product Slider',
    plural: 'Product Sliders',
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
      name: 'useGlobalData',
      type: 'checkbox',
      label: 'Use global content',
      defaultValue: false,
      admin: {
        description:
          '✅ ON = Uses shared content from Website → Product Slider (edit once, applies everywhere).\n❌ OFF = Use custom content just for this page (default).',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: false,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Large heading text (e.g. "Discover UNIQUE.").',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      name: 'headingAccent',
      type: 'text',
      required: false,
      localized: true,
      label: 'Heading Accent Text',
      admin: {
        description: 'Accent word displayed next to the heading in brand color (e.g. "FLAVOURS").',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      localized: true,
      label: 'Description',
      admin: {
        description: 'Short paragraph below the heading (1–2 sentences).',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: false,
      localized: true,
      label: 'Button Label',
      admin: {
        description: 'Text on the CTA button (e.g. "View All Products").',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: false,
      localized: true,
      label: 'Button Link',
      admin: {
        description: 'URL the button links to (e.g. "/products").',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Products',
      admin: {
        description:
          'Select products to display in the slider. If empty, the latest products will be shown.',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
  ],
}
