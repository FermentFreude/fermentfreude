import type { Block } from 'payload'

export const FermentationStory: Block = {
  slug: 'fermentationStory',
  interfaceName: 'FermentationStoryBlock',
  labels: {
    singular: 'Fermentation Story',
    plural: 'Fermentation Stories',
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
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Title (top left)',
      admin: { description: 'Short question or headline, e.g. "Warum Fermentation?".' },
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: 'Intro',
      admin: { description: 'One or two short sentences under the title.' },
    },
    {
      name: 'bigWord',
      type: 'text',
      localized: true,
      label: 'Big word',
      admin: {
        description:
          'The huge word across the section — one short, punchy word, e.g. "GESUND". The picture floats over it.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'buttonLabel',
          type: 'text',
          localized: true,
          label: 'Button text',
          admin: { description: 'e.g. "Mehr über Fermentation". Empty = no button.', width: '50%' },
        },
        {
          name: 'buttonLink',
          type: 'text',
          localized: true,
          label: 'Button link',
          admin: { description: 'e.g. "/fermentation".', width: '50%' },
        },
      ],
    },
    {
      name: 'benefits',
      type: 'array',
      label: 'Benefits',
      maxRows: 3,
      labels: { singular: 'Benefit', plural: 'Benefits' },
      admin: {
        description: 'Up to 3 short benefits with an icon — a title and one short line each.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              type: 'select',
              label: 'Icon',
              defaultValue: 'microscope',
              options: [
                { label: 'Microscope (cultures)', value: 'microscope' },
                { label: 'Leaf (nutrients)', value: 'leaf' },
                { label: 'Sparkles (flavour)', value: 'sparkles' },
                { label: 'Sprout', value: 'sprout' },
              ],
              admin: { width: '25%' },
            },
            {
              name: 'title',
              type: 'text',
              localized: true,
              required: true,
              label: 'Title',
              admin: { width: '30%' },
            },
            {
              name: 'text',
              type: 'text',
              localized: true,
              label: 'Short line',
              admin: { width: '45%' },
            },
          ],
        },
      ],
    },
  ],
}
