import type { Block } from 'payload'

export const VoucherCta: Block = {
  slug: 'voucherCta',
  interfaceName: 'VoucherCtaBlock',
  labels: {
    singular: 'Voucher CTA',
    plural: 'Voucher CTAs',
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
      name: 'heading',
      type: 'textarea',
      required: false,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Large heading text (e.g. "Gift a special tasty experience").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      localized: true,
      label: 'Description',
      admin: {
        description: 'Short paragraph below the heading (1–2 sentences).',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: false,
      localized: true,
      label: 'Button Label',
      admin: {
        description: 'Text on the CTA button (e.g. "Voucher").',
      },
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: false,
      localized: true,
      label: 'Button Link',
      admin: {
        description: 'URL the button links to (e.g. "/voucher").',
      },
    },
    {
      name: 'galleryImages',
      type: 'array',
      label: 'Bento Gallery Images',
      minRows: 0,
      maxRows: 8,
      admin: {
        description:
          'Upload exactly 8 images for the bento gallery grid. They animate into a full-screen scrubbed gallery on scroll.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Gallery Image',
          admin: {
            description: 'One of the 8 bento gallery images. Use square or portrait orientation.',
          },
        },
      ],
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Background Image (CTA section)',
      admin: {
        description:
          'Background image shown behind heading and button below the gallery. Uses a neutral fallback color if not set.',
      },
    },
    {
      name: 'backgroundTheme',
      type: 'select',
      required: false,
      defaultValue: 'light',
      label: 'Background Theme',
      options: [
        { label: 'Light (soft beige)', value: 'light' },
        { label: 'Dark (charcoal)', value: 'dark' },
        { label: 'Custom color', value: 'custom' },
      ],
      admin: {
        description:
          'Controls fallback background color (when no image is set) and text/button contrast.',
      },
    },
    {
      name: 'customBackgroundColor',
      type: 'text',
      required: false,
      label: 'Custom Background Color (HEX)',
      admin: {
        description:
          'Used when "Background Theme" is set to "Custom color". Example: #ECE5DE',
        condition: (_, siblingData) => siblingData?.backgroundTheme === 'custom',
      },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      required: false,
      defaultValue: 20,
      min: 0,
      max: 90,
      label: 'Image Overlay Opacity (%)',
      admin: {
        description:
          'Dark overlay strength on top of the background image. Lower values keep images brighter.',
        condition: (_, siblingData) => Boolean(siblingData?.backgroundImage),
      },
    },
  ],
}
