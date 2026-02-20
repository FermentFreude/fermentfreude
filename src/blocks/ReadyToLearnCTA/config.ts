import type { Block } from 'payload'

export const ReadyToLearnCTA: Block = {
  slug: 'readyToLearnCta',
  interfaceName: 'ReadyToLearnCtaBlock',
  labels: {
    singular: 'Ready to Learn CTA',
    plural: 'Ready to Learn CTAs',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'CTA heading text (e.g. "Ready to learn?").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Description',
      admin: {
        description: 'Body text below the heading.',
      },
    },
    {
      name: 'primaryButton',
      type: 'group',
      label: 'Primary Button',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Button Label',
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          label: 'Button URL',
          admin: {
            description: 'URL the button links to (e.g. "/workshops").',
          },
        },
      ],
    },
    {
      name: 'secondaryButton',
      type: 'group',
      label: 'Secondary Button',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Button Label',
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          label: 'Button URL',
          admin: {
            description: 'URL the button links to (e.g. "/courses").',
          },
        },
      ],
    },
  ],
}
