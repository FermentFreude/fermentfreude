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
      admin: { description: 'Gold label above the heading, e.g. "Events & Gastronomie". Optional.' },
    },
    {
      name: 'heading',
      type: 'textarea',
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
      name: 'points',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Offer point', plural: 'Offer points' },
      admin: {
        description:
          'Optional: what you offer, shown as a short row under the text (e.g. "Tempeh für eure Küche", "Schulungen fürs Team"). 3 points look best.',
      },
      fields: [
        { name: 'title', type: 'text', localized: true, required: true, label: 'Title' },
        { name: 'text', type: 'textarea', localized: true, label: 'Short text (one line)' },
      ],
    },
    {
      name: 'mediaLayout',
      type: 'select',
      defaultValue: 'side',
      label: 'Picture / video position',
      options: [
        { label: 'Beside the text (rounded frame on the right)', value: 'side' },
        { label: 'Full background (cinematic, text on top)', value: 'background' },
      ],
      admin: {
        description:
          'Side: black section with the picture or video in a rounded frame. Full background: the picture or video fills the whole section, the text sits on a dark shade.',
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
