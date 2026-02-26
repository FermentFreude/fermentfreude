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
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Large heading text (e.g. "Discover UNIQUE.").',
      },
    },
    {
      name: 'headingAccent',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading Accent Text',
      admin: {
        description: 'Accent word displayed next to the heading in brand color (e.g. "FLAVOURS").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Description',
      admin: {
        description: 'Short paragraph below the heading (1–2 sentences).',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
      localized: true,
      label: 'Button Label',
      admin: {
        description: 'Text on the CTA button (e.g. "View All Products").',
      },
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: true,
      localized: true,
      label: 'Button Link',
      admin: {
        description: 'URL the button links to (e.g. "/products").',
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
      },
    },
  ],
}
