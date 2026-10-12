import type { Block } from 'payload'

export const HomeTempehStory: Block = {
  slug: 'homeTempehStory',
  interfaceName: 'HomeTempehStoryBlock',
  labels: {
    singular: 'Tempeh Story Carousel',
    plural: 'Tempeh Story Carousels',
  },
  fields: [
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: {
        description: 'Hide this section without deleting its content.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: 'Section heading',
      admin: {
        description: 'Large heading above the carousel, e.g. "Käferbohnen Tempeh".',
      },
    },
    {
      name: 'slides',
      type: 'array',
      minRows: 2,
      maxRows: 8,
      labels: {
        singular: 'Slide',
        plural: 'Slides',
      },
      admin: {
        description:
          'Slides play in this order — drag to reorder. Start with the product slide (pick the shop product so it gets a button), then explain tempeh.',
        components: {
          RowLabel: '@/blocks/HomeTempehStory/slideRowLabel.tsx#TempehSlideRowLabel',
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Photo',
          admin: {
            description:
              'A full photo with a real background (no cut-out / transparent product images — they look odd in the animation). Landscape works best.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              localized: true,
              label: 'Small label',
              admin: {
                width: '35%',
                description: 'Short tag above the title, e.g. "Unser Produkt", "Die Bohne".',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: 'Title',
              admin: { width: '65%' },
            },
          ],
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Text',
          admin: {
            description: 'Two or three short sentences — readable at a glance.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'product',
              type: 'relationship',
              relationTo: 'products',
              label: 'Shop product (optional)',
              admin: {
                width: '50%',
                description: 'Pick a product to show a button that opens its shop page.',
              },
            },
            {
              name: 'buttonLabel',
              type: 'text',
              localized: true,
              label: 'Button text',
              admin: {
                width: '50%',
                description: 'e.g. "Zum Produkt". Only shown when a product is picked.',
                condition: (_, siblingData) => Boolean(siblingData?.product),
              },
            },
          ],
        },
      ],
    },
  ],
}
