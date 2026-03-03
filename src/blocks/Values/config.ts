import type { Block } from 'payload'

export const Values: Block = {
  slug: 'values',
  interfaceName: 'ValuesBlock',
  labels: {
    singular: 'Values',
    plural: 'Values Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: false,
      localized: true,
      label: 'Section Label',
      admin: {
        description: 'Small accent text above the heading (e.g. "Our Values", "Unsere Werte").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Main Heading',
      admin: {
        description: 'Section heading (e.g. "What We Stand For").',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Values',
      minRows: 2,
      maxRows: 6,
      required: true,
      admin: {
        description: '3–4 values or principles. Each has a title and optional short description.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Title',
          admin: {
            description: 'Value name (e.g. "Tradition meets Science").',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: false,
          localized: true,
          label: 'Description',
          admin: {
            description: 'Short explanation. Leave empty for title-only.',
          },
        },
      ],
    },
  ],
}
