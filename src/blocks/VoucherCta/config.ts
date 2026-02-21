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
        description: 'URL the button links to (e.g. "/voucher").',
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
        },
      ],
    },
  ],
}
