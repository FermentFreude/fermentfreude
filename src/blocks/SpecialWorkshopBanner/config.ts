import type { Block } from 'payload'

/**
 * EXPERIMENT — home banner for special / partner workshops (e.g. Vom Feld ins Glas).
 * Delete block folder + registrations if founders reject it.
 */
export const SpecialWorkshopBanner: Block = {
  slug: 'specialWorkshopBanner',
  interfaceName: 'SpecialWorkshopBannerBlock',
  labels: {
    singular: 'Special Workshop Banner',
    plural: 'Special Workshop Banners',
  },
  fields: [
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: {
        description: 'Toggle off to hide this banner without deleting it.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow',
      admin: {
        description: 'Small line above the title (e.g. "Spezial-Workshop").',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Title',
      admin: {
        description: 'Main title (e.g. "Vom Feld ins Glas").',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
      label: 'Subtitle',
      admin: {
        description: 'Partner / place line (e.g. Marktgarten „Unser Bauerngarten“).',
      },
    },
    {
      name: 'priceLabel',
      type: 'text',
      localized: true,
      label: 'Price label',
      admin: {
        description: 'Shown next to the price (e.g. "€ 99" or "99 Euro").',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      label: 'CTA button label',
      admin: {
        description: 'Button text (e.g. "Mehr Infos & Buchen").',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      localized: true,
      label: 'CTA link',
      admin: {
        description: 'Where the button goes (e.g. "/workshops/vom-feld-ins-glas").',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Background / side image',
      admin: {
        description: 'Optional image. If empty, a garden-toned placeholder is used.',
      },
    },
  ],
}
