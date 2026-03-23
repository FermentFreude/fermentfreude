import type { GlobalConfig } from 'payload'

export const VoucherCtaGlobal: GlobalConfig = {
  slug: 'voucher-cta-global',
  label: 'Voucher CTA',
  admin: {
    group: 'Website',
    description:
      'Global voucher call-to-action section with bento gallery. Edit once, appears on Home, Shop, and other pages.',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: 'Heading',
      admin: {
        description: 'Large heading text (e.g. "Gift a special tasty experience").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Description',
      admin: {
        description: 'Short paragraph below the heading (1–2 sentences).',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
      localized: true,
      label: 'Button Label',
      admin: {
        description: 'Text on the CTA button (e.g. "Voucher").',
      },
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: true,
      localized: true,
      label: 'Button Link',
      admin: {
        description: 'URL the button links to (e.g. "/workshops/voucher").',
      },
    },
    {
      name: 'galleryImages',
      type: 'array',
      label: 'Bento Gallery Images',
      minRows: 1,
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
  ],
}
