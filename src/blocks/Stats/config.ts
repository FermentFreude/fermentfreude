import type { Block } from 'payload'

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: {
    singular: 'Stats',
    plural: 'Stats Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: false,
      localized: true,
      label: 'Section Label',
      admin: {
        description: 'Small accent text above the heading (e.g. "By the Numbers").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Main Heading',
      admin: {
        description: 'Section heading (e.g. "FermentFreude in Numbers").',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Stats',
      minRows: 2,
      maxRows: 6,
      required: true,
      admin: {
        description: '3–4 stat items. Each has a value (number or text) and label.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Value',
          admin: {
            description: 'Number or short text (e.g. "500+", "10", "2"). Not localized — same in all languages.',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Label',
          admin: {
            description: 'Description below the value (e.g. "Workshops held", "Years experience").',
          },
        },
      ],
    },
  ],
}
