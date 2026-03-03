import type { Block } from 'payload'

export const ClosingTagline: Block = {
  slug: 'closingTagline',
  interfaceName: 'ClosingTaglineBlock',
  labels: {
    singular: 'Closing Tagline',
    plural: 'Closing Tagline Blocks',
  },
  fields: [
    {
      name: 'tagline',
      type: 'text',
      required: true,
      localized: true,
      label: 'Tagline',
      admin: {
        description: 'Short closing line (e.g. "Fermentation for everyone").',
      },
    },
    {
      name: 'subtext',
      type: 'text',
      required: false,
      localized: true,
      label: 'Subtext',
      admin: {
        description: 'Optional smaller text below (e.g. "Get in touch").',
      },
    },
    {
      name: 'linkLabel',
      type: 'text',
      required: false,
      localized: true,
      label: 'Button Label',
      admin: {
        description: 'CTA button (e.g. "Contact us"). Leave empty to hide.',
      },
    },
    {
      name: 'linkUrl',
      type: 'text',
      required: false,
      label: 'Button URL',
      admin: {
        description: 'Where the button links (e.g. /contact).',
      },
    },
  ],
}
