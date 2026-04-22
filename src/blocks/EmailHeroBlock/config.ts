import type { Block } from 'payload'

export const EmailHeroBlock: Block = {
  slug: 'emailHero',
  interfaceName: 'EmailHeroBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description: 'Main heading for email header section',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Subheading or intro text',
        rows: 3,
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      defaultValue: '#ffffff',
      admin: {
        description: 'Hex color for background (e.g., #AEB1AE)',
      },
    },
  ],
  labels: {
    singular: 'Email Hero Section',
    plural: 'Email Hero Sections',
  },
}
