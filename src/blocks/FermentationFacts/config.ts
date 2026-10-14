import type { Block } from 'payload'

export const FermentationFacts: Block = {
  slug: 'fermentationFacts',
  interfaceName: 'FermentationFactsBlock',
  labels: {
    singular: 'Fermentation Facts (slider)',
    plural: 'Fermentation Facts (sliders)',
  },
  admin: {
    group: 'Home',
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
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Small label',
      admin: { description: 'Gold label above the heading, e.g. "Fermentation & Ernährung".' },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: 'Heading',
      admin: { description: 'e.g. "Was hinter dem Glas steckt".' },
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Slides',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Slide', plural: 'Slides' },
      admin: {
        description:
          'The cards you swipe through sideways. Keep it short and honest: say what research looks at, never promise a health effect.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          label: 'Title',
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          required: true,
          label: 'Text',
          admin: { description: 'A few short sentences.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'sourceLabel',
              type: 'text',
              localized: true,
              label: 'Source (optional)',
              admin: {
                description: 'Small line under the text, e.g. "Wastyk et al., Cell (2021)".',
                width: '50%',
              },
            },
            {
              name: 'sourceUrl',
              type: 'text',
              label: 'Source link (optional)',
              admin: { description: 'Link to the study.', width: '50%' },
            },
          ],
        },
      ],
    },
  ],
}
