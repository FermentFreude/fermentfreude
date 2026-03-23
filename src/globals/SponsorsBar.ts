import type { GlobalConfig } from 'payload'

export const SponsorsBarGlobal: GlobalConfig = {
  slug: 'sponsors-bar-global',
  label: 'Sponsors Bar',
  admin: {
    group: 'Website',
    description:
      'Global sponsors/partners bar shown across multiple pages. Edit once, appears everywhere.',
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
      minRows: 0,
      maxRows: 10,
      required: false,
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
