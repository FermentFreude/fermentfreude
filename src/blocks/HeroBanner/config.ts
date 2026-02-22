import type { Block } from 'payload'

export const HeroBanner: Block = {
  slug: 'heroBanner',
  interfaceName: 'HeroBannerBlock',
  labels: {
    singular: 'Hero Banner',
    plural: 'Hero Banners',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description:
          'Large white heading over the background image (e.g. "For Chefs and Food Professionals").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Description',
      admin: {
        description: 'Subtext below the heading (1–2 sentences).',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
      localized: true,
      label: 'Button Label',
      admin: {
        description: 'CTA button text (e.g. "Get to know more here").',
      },
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: true,
      localized: true,
      label: 'Button Link',
      admin: {
        description: 'URL the CTA button links to.',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
      admin: {
        description:
          'Full-width background image for the banner section. Used as fallback/poster when a video is set.',
      },
    },
    {
      name: 'backgroundVideoUrl',
      type: 'text',
      label: 'Background Video URL',
      admin: {
        description:
          'Optional static video URL (e.g. /assets/videos/gastro-banner.mp4). Served from public/ — no DB or R2 storage used. Overrides the background image when set.',
      },
    },
  ],
}
