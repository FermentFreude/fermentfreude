import type { Block } from 'payload'

export const HomeTempehStory: Block = {
  slug: 'homeTempehStory',
  interfaceName: 'HomeTempehStoryBlock',
  labels: {
    singular: 'Product Story Carousel (Tempeh & Kimchi)',
    plural: 'Product Story Carousels',
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
      // Visual group only — field names (and stored data) stay the same
      type: 'collapsible',
      label: 'Section title — the text above the carousel',
      admin: {
        initCollapsed: false,
        description:
          'The two lines above the photos, e.g. "AUS UNSERER FERMENTKÜCHE" and "Tempeh & Kimchi aus Graz".',
      },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          label: '① Section label (small capitals, first line)',
          admin: {
            description:
              'e.g. "Aus unserer Fermentküche" — shown in small capitals above the heading.',
          },
        },
        {
          name: 'heading',
          type: 'text',
          localized: true,
          label: '② Section heading (big title, second line)',
          admin: {
            description: 'e.g. "Tempeh & Kimchi aus Graz".',
          },
        },
      ],
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
          label: 'Slide photo',
          admin: {
            description:
              'A full photo with a real background (no cut-out / transparent product images — they look odd in the animation). Landscape works best.',
          },
        },
        {
          name: 'punchWord',
          type: 'text',
          localized: true,
          maxLength: 16,
          label: 'Punch word (big outlined word)',
          admin: {
            description:
              'One short, bold word shown huge in outline above the text, e.g. "Nussig." or "Steirisch.". Leave empty to show the slide number instead.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              localized: true,
              label: 'Slide label (small capitals)',
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
              label: 'Slide title',
              admin: { width: '65%' },
            },
          ],
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Slide text',
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
