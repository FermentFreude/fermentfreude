import type { Block } from 'payload'

export const SponsorsBar: Block = {
  slug: 'sponsorsBar',
  interfaceName: 'SponsorsBarBlock',
  labels: {
    singular: 'Sponsors Bar',
    plural: 'Sponsors Bars',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Text above the logos (e.g. "This project is supported by:").',
      },
    },
    {
      name: 'sponsors',
      type: 'array',
      label: 'Sponsors',
      minRows: 1,
      maxRows: 10,
      required: true,
      admin: {
        description: 'Sponsor/partner logos displayed in a horizontal row.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
          label: 'Sponsor Name',
          admin: {
            description: 'Name used as alt text for the logo image.',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Logo Image',
          admin: {
            description: 'Sponsor logo. SVG or PNG recommended.',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Website URL',
          admin: {
            description: 'Optional link to the sponsor website.',
          },
        },
      ],
    },
  ],
}
