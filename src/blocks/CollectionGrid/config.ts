import type { Block } from 'payload'

export const CollectionGrid: Block = {
  slug: 'collectionGrid',
  interfaceName: 'CollectionGridBlock',
  labels: {
    singular: 'Collection Grid',
    plural: 'Collection Grids',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      required: false,
      localized: true,
      label: 'Eyebrow Text',
      admin: {
        description: 'Small label above the heading (e.g. "Our Collections").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Section Heading',
      admin: {
        description: 'Main heading (e.g. "Explore Our Products").',
      },
    },
    {
      name: 'collections',
      type: 'array',
      label: 'Collections',
      minRows: 1,
      maxRows: 6,
      admin: {
        description:
          'Product collections to display (e.g. Tempeh, Kimchi & Laktogemüse, Starterkulturen, Miso).',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Collection Image',
          admin: {
            description: 'Square or portrait image representing this collection.',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Collection Title',
          admin: { description: 'e.g. "Tempeh"' },
        },
        {
          name: 'description',
          type: 'textarea',
          required: false,
          localized: true,
          label: 'Short Description',
          admin: {
            description: 'One-line description (e.g. "Handcrafted soy tempeh, rich in protein.").',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: false,
          label: 'Link URL',
          admin: {
            description: 'Where this card links to (e.g. "/shop?category=tempeh").',
          },
        },
      ],
    },
  ],
}
