import type { Block } from 'payload'

export const EmailCTABlock: Block = {
  slug: 'emailCTA',
  interfaceName: 'EmailCTABlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      admin: {
        description: 'CTA section heading',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'CTA description text',
        rows: 3,
      },
    },
    {
      name: 'buttonText',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description: 'Button label',
      },
    },
    {
      name: 'buttonUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Button link (e.g., https://fermentfreude.at/orders or {{ORDER_URL}})',
      },
    },
    {
      name: 'buttonColor',
      type: 'text',
      defaultValue: '#e5b765',
      admin: {
        description: 'Button color hex (default: #e5b765)',
      },
    },
  ],
  labels: {
    singular: 'Email CTA',
    plural: 'Email CTAs',
  },
}
