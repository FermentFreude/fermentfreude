import type { Block } from 'payload'

import { PICTURE_SLOTS } from './layers'

export const FermentationStory: Block = {
  slug: 'fermentationStory',
  interfaceName: 'FermentationStoryBlock',
  labels: {
    singular: 'Fermentation Story (swipe cards)',
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
      admin: {
        description:
          'One short sentence under the title (about 100 characters) — longer text squeezes the picture.',
      },
    },
    {
      name: 'bigWord',
      type: 'text',
      localized: true,
      label: 'Big word',
      admin: {
        description:
          'The huge word across the section — one short, punchy word, e.g. "GESUND". The picture sits under it.',
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
      name: 'introPicture',
      type: 'select',
      label: 'Picture (intro card)',
      defaultValue: 'intro',
      options: PICTURE_SLOTS,
      admin: {
        description: 'Which built-in illustration sits under the big word on the first card.',
      },
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
    {
      name: 'slides',
      type: 'array',
      label: 'More cards',
      maxRows: 6,
      labels: { singular: 'Card', plural: 'Cards' },
      admin: {
        description:
          'The cards after the first — visitors swipe sideways through them. Keep it short and factual: describe the food and the craft, never promise a health effect.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'bigWord',
              type: 'text',
              localized: true,
              required: true,
              label: 'Big word',
              admin: { description: 'One short word, e.g. "LEBENDIG".', width: '50%' },
            },
            {
              name: 'picture',
              type: 'select',
              label: 'Picture',
              options: PICTURE_SLOTS,
              admin: { description: 'Built-in illustration under the big word.', width: '50%' },
            },
          ],
        },
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
          admin: {
            description:
              'One or two short sentences (about 100 characters) — longer text squeezes the picture.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'buttonLabel',
              type: 'text',
              localized: true,
              label: 'Button text (optional)',
              admin: { description: 'e.g. "Zum Shop". Empty = no button.', width: '50%' },
            },
            {
              name: 'buttonLink',
              type: 'text',
              localized: true,
              label: 'Button link',
              admin: { description: 'e.g. "/shop".', width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'sourceLabel',
              type: 'text',
              localized: true,
              label: 'Source (optional)',
              admin: { description: 'e.g. "Wastyk et al., Cell (2021)".', width: '50%' },
            },
            {
              name: 'sourceUrl',
              type: 'text',
              label: 'Source link (optional)',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ],
}
