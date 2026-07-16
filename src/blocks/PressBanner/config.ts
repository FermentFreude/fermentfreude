import type { Block } from 'payload'

export const PressBanner: Block = {
  slug: 'pressBanner',
  interfaceName: 'PressBannerBlock',
  labels: {
    singular: 'Press Banner',
    plural: 'Press Banners',
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
      label: 'Eyebrow',
      admin: {
        description: 'Small uppercase line above the heading (e.g. "PRESSE & MEDIEN").',
      },
    },
    {
      name: 'heading',
      type: 'textarea',
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Main section heading (e.g. "Bekannt aus Presse & TV").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
      admin: {
        description: 'Optional short supporting text under the heading (1–2 sentences).',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      label: 'CTA Button Label',
      admin: {
        description: 'Button text linking to the full press page (e.g. "Alle Berichte").',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      localized: true,
      label: 'CTA Button Link',
      admin: {
        description: 'URL for the CTA button. Usually "/presse".',
      },
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: 'Auto-advance slides',
      defaultValue: true,
      admin: {
        description: 'When on, slides advance automatically every few seconds.',
      },
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Press Slides',
      minRows: 1,
      maxRows: 8,
      admin: {
        description:
          'Each slide shows one press / TV / award mention. Keep quotes short — one or two lines.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'outlet',
          type: 'text',
          required: true,
          localized: true,
          label: 'Outlet Name',
          admin: {
            description: 'Media outlet or award name (e.g. "Kleine Zeitung", "kanal3").',
          },
        },
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Quote / Teaser',
          admin: {
            description: 'Short pull-quote or teaser shown on the slide (1–2 sentences).',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Outlet Logo',
          admin: {
            description: 'Optional logo for this outlet. Falls back to a soft placeholder if empty.',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Article / Video URL',
          admin: {
            description: 'Optional link to the original article, TV segment, or award page.',
          },
        },
        {
          name: 'linkLabel',
          type: 'text',
          localized: true,
          label: 'Slide Link Label',
          admin: {
            description: 'Optional text for the slide link (e.g. "Artikel lesen").',
          },
        },
      ],
    },
  ],
}
