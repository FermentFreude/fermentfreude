import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from './linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'Hero Slider',
          value: 'heroSlider',
        },
        {
          label: 'Hero Carousel',
          value: 'heroCarousel',
        },
        {
          label: 'Food Presentation Slider',
          value: 'foodPresentationSlider',
        },
      ],
      required: true,
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow Text',
      admin: {
        description: 'Small uppercase text above the heading (e.g. "Fermentation for everyone").',
        condition: (_, { type } = {}) => type === 'heroSlider',
      },
    },
    {
      name: 'richText',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'showWordmark',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Brand Wordmark',
      localized: false,
      admin: {
        condition: (_, { type } = {}) => type === 'heroSlider',
        description:
          'Display the gold FERMENTFREUDE wordmark above the heading in the hero section.',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      maxRows: 6,
      admin: {
        condition: (_, { type } = {}) =>
          type === 'heroSlider' || type === 'foodPresentationSlider',
        description:
          'Social media icons displayed alongside the hero content. Leave empty to hide.',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          label: 'Platform',
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Pinterest', value: 'pinterest' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'Profile URL',
          admin: {
            description:
              'Full URL to your social media profile (e.g. https://facebook.com/yourpage).',
          },
        },
      ],
    },
    {
      name: 'heroImages',
      type: 'array',
      label: 'Hero Carousel Images',
      minRows: 1,
      maxRows: 8,
      admin: {
        condition: (_, { type } = {}) => type === 'heroSlider',
        description:
          'Images for the hero carousel. Add 3–5 for the best visual effect. They appear in a stacked slider layout.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image',
        },
      ],
    },
    {
      name: 'heroSlides',
      type: 'array',
      label: 'Hero Slides',
      minRows: 1,
      maxRows: 8,
      admin: {
        condition: (_, { type } = {}) => type === 'heroSlider',
        description:
          'Each slide has its own text, product images, colors, and CTA. The slider cycles through these automatically.',
      },
      fields: [
        {
          name: 'slideId',
          type: 'text',
          required: true,
          label: 'Slide Identifier',
          admin: {
            description: 'Internal ID for this slide (e.g. "lakto", "kombucha", "tempeh", "basics"). Not shown to visitors.',
          },
        },
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          label: 'Eyebrow Text',
          admin: {
            description: 'Small uppercase text above the title (e.g. "Workshop Experience").',
          },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          label: 'Slide Title',
          admin: {
            description: 'Main heading for this slide. Use \\n for line breaks.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Slide Description',
          admin: {
            description: 'Short description text below the title.',
          },
        },
        {
          name: 'attributes',
          type: 'array',
          label: 'Attributes',
          maxRows: 5,
          admin: {
            description: 'Short tags displayed below the divider (e.g. "All-natural", "Probiotic-rich").',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              localized: true,
              required: true,
              label: 'Attribute Text',
            },
          ],
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          label: 'CTA Button Label',
          admin: {
            description: 'Text for the primary call-to-action button (e.g. "Learn More").',
          },
        },
        {
          name: 'ctaHref',
          type: 'text',
          label: 'CTA Button Link',
          admin: {
            description: 'URL the CTA button links to (e.g. "/workshops/lakto").',
          },
        },
        {
          name: 'panelColor',
          type: 'text',
          label: 'Panel Color',
          admin: {
            description: 'Hex color for the central card background (e.g. "#555954").',
          },
        },
        {
          name: 'bgColor',
          type: 'text',
          label: 'Background Color',
          admin: {
            description: 'Hex color for the outer/page background (e.g. "#D2DFD7").',
          },
        },
        {
          name: 'leftImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Left Product Image',
          admin: {
            description: 'Product or person image shown to the left of the central card.',
          },
        },
        {
          name: 'rightImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Right Product Image',
          admin: {
            description: 'Product or person image shown to the right of the central card.',
          },
        },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Carousel Slides',
      minRows: 1,
      maxRows: 8,
      admin: {
        condition: (_, { type } = {}) =>
          type === 'heroCarousel' || type === 'foodPresentationSlider',
        description: 'Each slide has a fullscreen image with overlay text and CTA.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Background Image',
          admin: {
            description: 'Fullscreen background for this slide.',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Title',
          admin: {
            description: 'Main heading on the slide.',
          },
        },
        {
          name: 'tagline',
          type: 'text',
          required: false,
          localized: true,
          label: 'Tagline',
          admin: {
            description: 'Elegant tagline below the title (e.g. "Elegance in Every Spoonful").',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Description',
          admin: {
            description: 'Optional supporting text.',
          },
        },
        {
          name: 'buttonLabel',
          type: 'text',
          localized: true,
          label: 'Button Label',
          admin: {
            description: 'CTA button text (e.g., "Order Now", "Learn More").',
          },
        },
        {
          name: 'buttonUrl',
          type: 'text',
          label: 'Button URL',
          admin: {
            description: 'Where the button links to.',
          },
        },
      ],
    },
  ],
  label: false,
}
