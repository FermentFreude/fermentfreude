import type { Block } from 'payload'

export const EmailContentBlock: Block = {
  slug: 'emailContent',
  interfaceName: 'EmailContentBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Rich text content for this section',
      },
    },
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
  labels: {
    singular: 'Email Content Section',
    plural: 'Email Content Sections',
  },
}
