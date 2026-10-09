import type { Block } from 'payload'

export const HomeTempehStory: Block = {
  slug: 'homeTempehStory',
  interfaceName: 'HomeTempehStoryBlock',
  labels: {
    singular: 'Käferbohnen Tempeh Story',
    plural: 'Käferbohnen Tempeh Story',
  },
  fields: [
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: {
        description: 'Hide this homepage section without deleting its content.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: 'Section heading',
      admin: {
        description: 'Heading displayed above the slides.',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Shop product (first slide)',
      admin: {
        description:
          'The product shown on the first slide, with its photo and a button to its shop page. Leave empty to use Käferbohnen-Tempeh.',
      },
    },
    {
      name: 'productLinkLabel',
      type: 'text',
      localized: true,
      label: 'Product link label',
      admin: {
        description: 'Button label linking to the live Käferbohnen-Tempeh shop product.',
      },
    },
    {
      name: 'slides',
      type: 'array',
      minRows: 3,
      maxRows: 4,
      labels: {
        singular: 'Tempeh story slide',
        plural: 'Tempeh story slides',
      },
      admin: {
        description:
          'Add 3–4 educational slides. The live Käferbohnen-Tempeh product is always shown first.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Slide image',
          admin: {
            description:
              'Optional photo for this slide. Without one, a photo of the shop product is used — upload a different image for each topic when you have one.',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Slide title',
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Slide text',
          admin: {
            description: 'Keep the copy short enough to read at a glance.',
          },
        },
      ],
    },
  ],
}
