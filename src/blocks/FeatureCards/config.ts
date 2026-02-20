import type { Block } from 'payload'

export const FeatureCards: Block = {
  slug: 'featureCards',
  interfaceName: 'FeatureCardsBlock',
  labels: {
    singular: 'Feature Cards',
    plural: 'Feature Cards',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow Text',
      admin: {
        description: 'Small uppercase text above the heading (e.g. "FERMENTATION").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Main section heading (e.g. "Why Fermentation?").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
      admin: {
        description: 'Short paragraph below the heading.',
      },
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Feature Cards',
      minRows: 1,
      maxRows: 6,
      required: true,
      admin: {
        description: 'Cards with icon, title, and description. Shown in a horizontal row.',
      },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: 'Icon Image',
          admin: {
            description: 'Small icon displayed at the top of the card.',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Card Title',
          admin: {
            description: 'Title displayed below the icon (e.g. "Probiotics").',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Card Description',
          admin: {
            description: 'Short description text for this feature.',
          },
        },
      ],
    },
    {
      name: 'buttonLabel',
      type: 'text',
      localized: true,
      label: 'Button Label',
      admin: {
        description: 'CTA button text (e.g. "Read more about it"). Leave empty to hide.',
      },
    },
    {
      name: 'buttonLink',
      type: 'text',
      localized: true,
      label: 'Button Link',
      admin: {
        description: 'URL the button links to.',
      },
    },
  ],
}
