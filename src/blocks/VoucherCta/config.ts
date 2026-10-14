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
      name: 'eyebrow',
      type: 'text',
      required: false,
      localized: true,
      label: 'Eyebrow (gold line above heading)',
      admin: {
        description:
          'Small uppercase line above the main heading, in brand gold (e.g. "WORKSHOPS & GUTSCHEINE"). Leave empty to hide.',
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
      name: 'voucherImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Voucher picture (next to the text)',
      admin: {
        description:
          'Optional picture of the voucher, e.g. a printed-card mockup. Shown to the right of the text on desktop and below it on mobile. Make sure no real, unused voucher code is readable in it.',
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
        description: 'Used when "Background Theme" is set to "Custom color". Example: #ECE5DE',
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
    {
      name: 'giftSlide',
      type: 'group',
      label: 'Gift slide (after the gallery)',
      admin: {
        description:
          'A full-screen card that slides up over the photo gallery once it is fully open — big headline, voucher picture and price. The pictures (jars, ingredients, voucher card) are built into the website; everything written here is editable.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show the gift slide',
          defaultValue: false,
          admin: {
            description:
              'ON = the gift slide replaces the text panel under the gallery (eyebrow, heading, description above are then not shown).',
          },
        },
        {
          name: 'bigWord',
          type: 'textarea',
          localized: true,
          label: 'Big headline',
          admin: {
            description:
              'Huge word behind the pictures — keep it to one short, punchy word, e.g. "GUTSCHEIN". (A new row also works, but one word reads strongest.)',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
          label: 'Name',
          admin: {
            description:
              'Bold uppercase name above the description, e.g. "Gutschein · Fermentations-Workshop".',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: 'Short text',
          admin: {
            description: 'A few short lines under the label — one per row.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'priceText',
          type: 'text',
          localized: true,
          label: 'Price',
          admin: {
            description: 'Shown big, e.g. "99 €". Leave empty to hide.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          type: 'row',
          admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) },
          fields: [
            {
              name: 'buttonLabel',
              type: 'text',
              localized: true,
              label: 'Button text',
              admin: { description: 'e.g. "Gutschein kaufen". Empty = no button.', width: '50%' },
            },
            {
              name: 'buttonLink',
              type: 'text',
              localized: true,
              label: 'Button link',
              admin: { description: 'e.g. "/voucher".', width: '50%' },
            },
          ],
        },
        {
          name: 'cardAlt',
          type: 'text',
          localized: true,
          label: 'Voucher picture description (for Google & screen readers)',
          admin: {
            description:
              'Describes the voucher picture and names the product for search engines, e.g. "Geschenkgutschein für einen Fermentations-Workshop bei FermentFreude in Graz".',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'points',
          type: 'array',
          label: 'Points along the bottom',
          maxRows: 4,
          labels: { singular: 'Point', plural: 'Points' },
          admin: {
            description: '3–4 short points along the bottom of the slide: icon + title.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  label: 'Icon',
                  defaultValue: 'leaf',
                  options: [
                    { label: 'Leaf', value: 'leaf' },
                    { label: 'Jar', value: 'jar' },
                    { label: 'Heart', value: 'heart' },
                    { label: 'Gift', value: 'gift' },
                    { label: 'Box (kit)', value: 'box' },
                    { label: 'Bowl', value: 'bowl' },
                  ],
                  admin: { width: '25%' },
                },
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  required: true,
                  label: 'Title',
                  admin: { width: '35%' },
                },
                {
                  name: 'text',
                  type: 'text',
                  localized: true,
                  label: 'Short line (not shown)',
                  admin: {
                    width: '40%',
                    description: 'Not shown at the moment — the points show icon + title.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
