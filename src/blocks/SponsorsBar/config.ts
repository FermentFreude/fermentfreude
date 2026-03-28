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
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: {
        description: 'Toggle off to hide this section on the page without deleting it.',
      },
    },
    {
      name: 'useGlobalData',
      type: 'checkbox',
      label: 'Use global content',
      defaultValue: true,
      admin: {
        description:
          '✅ ON = Uses shared content from Website → Sponsors Bar (edit once, applies everywhere). This is the default.\n❌ OFF = Use custom content just for this page.',
      },
    },
    {
      name: 'heading',
      type: 'textarea',
      required: false,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Text above the logos (e.g. "This project is supported by:").',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
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
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
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
