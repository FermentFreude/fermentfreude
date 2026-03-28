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
      type: 'textarea',
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
      admin: {
        description: 'Main call-to-action button (filled style).',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Button Label',
          admin: {
            description: 'Text shown on the button (e.g. "Browse Workshops").',
          },
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
      admin: {
        description: 'Secondary call-to-action button (outline style).',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Button Label',
          admin: {
            description: 'Text shown on the button (e.g. "Explore Courses").',
          },
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
