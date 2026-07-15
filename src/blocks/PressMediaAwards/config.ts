import type { Block } from 'payload'

export const PressMediaAwards: Block = {
  slug: 'pressMediaAwards',
  interfaceName: 'PressMediaAwardsBlock',
  labels: {
    singular: 'Press, Media & Awards',
    plural: 'Press, Media & Awards',
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
      name: 'moreCoverageHeading',
      type: 'text',
      localized: true,
      label: 'More Coverage Heading',
      admin: {
        description:
          'Heading above additional (non-featured) entries. Shown only when at least one featured entry exists.',
      },
    },
    {
      name: 'secondaryLinksPrefix',
      type: 'text',
      localized: true,
      label: 'Secondary Links Prefix',
      admin: {
        description: 'Intro text before secondary links on a card (e.g. "Weitere Berichte:").',
      },
    },
    {
      name: 'typeLabels',
      type: 'group',
      label: 'Category Labels',
      admin: {
        description:
          'Short tags shown above each card date (e.g. "Presse", "TV"). Leave empty to use built-in defaults.',
      },
      fields: [
        {
          name: 'press',
          type: 'text',
          localized: true,
          label: 'Press',
        },
        {
          name: 'tv',
          type: 'text',
          localized: true,
          label: 'TV / Video',
        },
        {
          name: 'award',
          type: 'text',
          localized: true,
          label: 'Award',
        },
        {
          name: 'expert',
          type: 'text',
          localized: true,
          label: 'Expert appearance',
        },
        {
          name: 'origin',
          type: 'text',
          localized: true,
          label: 'Our beginnings',
        },
      ],
    },
    {
      name: 'intro',
      type: 'group',
      label: 'Page Intro (Hero)',
      admin: {
        description: 'Top hero section — headline and intro text for the press page.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          label: 'Eyebrow Label',
          admin: { description: 'Small label above the H1 (e.g. "PRESSE").' },
        },
        {
          name: 'heading',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Heading (H1)',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Introduction',
          admin: { description: 'Intro paragraph below the heading.' },
        },
        {
          name: 'bannerImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Poster Image',
          admin: {
            description:
              'Poster / fallback image while the video loads, or static hero if no video is set.',
          },
        },
        {
          name: 'bannerVideo',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Background Video',
          admin: {
            description:
              'Optional looped background video (MP4/WebM). Upload in Media — shown muted, autoplay, no controls.',
          },
        },
        {
          name: 'bannerVideoUrl',
          type: 'text',
          label: 'Hero Video URL (optional)',
          admin: {
            description:
              'Alternative: path to a video in /public (e.g. /assets/videos/fermentation-cta.mp4). Used when no uploaded video is set.',
          },
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Press & Media Entries',
      minRows: 0,
      maxRows: 30,
      admin: {
        description:
          'Articles, TV features, awards, and expert appearances. Drag to reorder — newest first.',
      },
      fields: [
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Featured entry',
          defaultValue: false,
          admin: {
            description: 'Highlight this entry visually (e.g. Kleine Zeitung, Kanal 3).',
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'press',
          label: 'Category',
          options: [
            { label: 'Presse / Press', value: 'press' },
            { label: 'TV / Video', value: 'tv' },
            { label: 'Auszeichnung / Award', value: 'award' },
            { label: 'Fachauftritt / Expert appearance', value: 'expert' },
            { label: 'Unsere Anfänge / Our beginnings', value: 'origin' },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Main Image',
          admin: {
            description:
              'One main photo or video still per entry (~1200 px wide, WebP). Alt text is set on the Media item.',
          },
        },
        {
          name: 'imageCredit',
          type: 'text',
          localized: true,
          label: 'Photo / Video Credit',
          admin: {
            description: 'Shown directly below the image (e.g. "Bild: © Fermentfreude").',
          },
        },
        {
          name: 'imageCrop',
          type: 'select',
          label: 'Photo Crop',
          defaultValue: 'auto',
          admin: {
            description:
              'Use if a TV watermark or outlet logo is still visible in the photo. Best fix: upload a clean photo without baked-in logos.',
          },
          options: [
            { label: 'Automatic (based on category)', value: 'auto' },
            { label: 'Focus top — hide bottom watermark', value: 'top' },
            { label: 'Focus center — TV / corner logos', value: 'center' },
            { label: 'Focus upper center', value: 'upper-center' },
          ],
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Media / Institution Logo',
          admin: {
            description:
              'Optional outlet logo shown in the masthead strip above the photo. Use official brand assets when available.',
          },
        },
        {
          name: 'outlet',
          type: 'text',
          required: true,
          localized: true,
          label: 'Medium or Institution',
          admin: {
            description: 'Publication, TV channel, or institution (e.g. "Kleine Zeitung", "kanal3").',
          },
        },
        {
          name: 'dateLabel',
          type: 'text',
          localized: true,
          label: 'Date (display text)',
          admin: {
            description:
              'Human-readable date as shown on the site (e.g. "27. September 2025", "März 2026").',
          },
        },
        {
          name: 'titleHighlight',
          type: 'text',
          localized: true,
          label: 'Headline Highlight (optional)',
          admin: {
            description:
              'Optional accent-colored line before the main headline (e.g. "Von der Masterclass zum Markt:"). Leave empty to show only the headline below.',
          },
        },
        {
          name: 'titleHighlightColor',
          type: 'select',
          label: 'Highlight Color',
          defaultValue: 'gold',
          admin: {
            description: 'Color for the highlight line. Only applies when Highlight Text is filled in.',
            condition: (_, siblingData) => Boolean(siblingData?.titleHighlight?.trim?.() ?? siblingData?.titleHighlight),
          },
          options: [
            { label: 'Gold accent', value: 'gold' },
            { label: 'Black', value: 'near-black' },
            { label: 'Olive green', value: 'olive' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Headline',
          admin: {
            description:
              'Main card headline (H2). If you use a highlight line above, put the rest of the title here.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Description',
          admin: {
            description: 'Short paragraph describing the coverage or award.',
          },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          label: 'Primary CTA Label',
          admin: {
            description: 'Button text (e.g. "Originalartikel lesen", "TV-Beitrag ansehen").',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Primary CTA URL',
          admin: {
            description: 'External link — opens in a new tab with an external-link icon.',
          },
        },
        {
          name: 'secondaryLinks',
          type: 'array',
          label: 'Secondary Links',
          maxRows: 4,
          admin: {
            description: 'Optional smaller links below the primary CTA (e.g. additional press coverage).',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: 'Link Label',
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
            },
          ],
        },
      ],
    },
    {
      name: 'footerCta',
      type: 'group',
      label: 'Bottom CTA',
      admin: {
        description: 'Conversion section below the press entries.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show bottom CTA',
          defaultValue: true,
        },
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          label: 'Eyebrow Label',
          admin: {
            description: 'Small gold label above the footer CTA heading (e.g. "Mehr entdecken").',
          },
        },
        {
          name: 'heading',
          type: 'textarea',
          localized: true,
          label: 'Heading',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Description',
        },
        {
          name: 'primaryButton',
          type: 'group',
          label: 'Primary Button',
          fields: [
            { name: 'label', type: 'text', localized: true, label: 'Label' },
            {
              name: 'href',
              type: 'text',
              label: 'URL',
              admin: { description: 'Internal path (e.g. /workshops) or full URL.' },
            },
          ],
        },
        {
          name: 'secondaryButton',
          type: 'group',
          label: 'Secondary Button',
          fields: [
            { name: 'label', type: 'text', localized: true, label: 'Label' },
            {
              name: 'href',
              type: 'text',
              label: 'URL',
              admin: { description: 'Internal path (e.g. /gastronomy) or full URL.' },
            },
          ],
        },
      ],
    },
  ],
}
