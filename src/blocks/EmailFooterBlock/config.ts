import type { Block } from 'payload'

export const EmailFooterBlock: Block = {
  slug: 'emailFooter',
  interfaceName: 'EmailFooterBlock',
  fields: [
    {
      name: 'content',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Footer content - links, company info, unsubscribe notice',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      defaultValue: '#f5f5f5',
      admin: {
        description: 'Footer background color hex',
      },
    },
  ],
  labels: {
    singular: 'Email Footer Section',
    plural: 'Email Footer Sections',
  },
}
