import type { Block, Condition } from 'payload'

import { pointIconField } from '@/fields/pointIcon'

/** The text panel under the gallery only shows when the gift slide is off */
const textPanelOnly: Condition = (_, siblingData) => !siblingData?.giftSlide?.enabled

export const VoucherCta: Block = {
  slug: 'voucherCta',
  interfaceName: 'VoucherCtaBlock',
  labels: {
    singular: 'Voucher — photo wall + gift slide',
    plural: 'Voucher sections',
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
      name: 'galleryImages',
      type: 'array',
      label: 'Photo wall (8 pictures)',
      minRows: 0,
      maxRows: 8,
      labels: { singular: 'Picture', plural: 'Pictures' },
      admin: {
        description:
          'Exactly 8 pictures. They sit in a grid and open up to a full-screen gallery while you scroll. Use large photos (at least 1920 px wide) so they stay sharp full-screen.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Picture',
        },
      ],
    },
    {
      name: 'giftSlide',
      type: 'group',
      label: 'Gift slide (after the photo wall)',
      admin: {
        description:
          'A full-screen slide that rises over the open photo wall — built like the Tempeh and Workshops slides: a picture, a short text with price and button, and up to 4 points with icons.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show the gift slide',
          defaultValue: false,
          admin: {
            description:
              'ON = the gift slide follows the photo wall. OFF = a simple text panel with a button is shown under the photo wall instead.',
          },
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Picture',
          admin: {
            description: 'A photo or an illustration for the slide. Choose below how it is shown.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'pictureLayout',
          type: 'select',
          defaultValue: 'top',
          label: 'How the picture is shown',
          options: [
            { label: 'On top (for an illustration that already shows the word)', value: 'top' },
            {
              label: 'Full background (for a photo — dark shade, big word, light text)',
              value: 'background',
            },
          ],
          admin: {
            description:
              'On top: the picture sits above the text on a paper background. Full background: the photo fills the slide like on the Tempeh slide, with the big headline on top.',
            condition: (_, siblingData) =>
              Boolean(siblingData?.enabled) && Boolean(siblingData?.backgroundImage),
          },
        },
        {
          name: 'bigWord',
          type: 'textarea',
          localized: true,
          label: 'Big headline',
          admin: {
            description:
              'Huge word across the slide — one short word, e.g. "GUTSCHEIN". Not shown when the picture sits on top (the illustration carries the word).',
            condition: (_, siblingData) =>
              Boolean(siblingData?.enabled) &&
              (!siblingData?.backgroundImage || siblingData?.pictureLayout === 'background'),
          },
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
          label: 'Name',
          admin: {
            description:
              'Small uppercase line above the headline, e.g. "Gutschein · Fermentations-Workshop".',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'headline',
          type: 'text',
          localized: true,
          label: 'Headline',
          admin: {
            description:
              'Editorial headline in the text block, e.g. "Ein Erlebnis zum Verschenken."',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: 'Short text',
          admin: {
            description: 'One short paragraph under the headline.',
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
          name: 'buttonNote',
          type: 'textarea',
          localized: true,
          label: 'Note under the button',
          admin: {
            description:
              'Optional, one or two short lines, e.g. "Sofort per E-Mail" / "oder zur Abholung vor Ort".',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'points',
          type: 'array',
          label: 'Points',
          maxRows: 4,
          labels: { singular: 'Point', plural: 'Points' },
          admin: {
            description: '3–4 short points on the slide: icon, title and an optional short line.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
          fields: [
            {
              type: 'row',
              fields: [
                pointIconField('leaf'),
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
                  label: 'Short line (optional)',
                  admin: { width: '40%' },
                },
              ],
            },
          ],
        },
        {
          name: 'cardAlt',
          type: 'text',
          localized: true,
          label: 'Description for Google & screen readers',
          admin: {
            description:
              'Names the voucher for search engines, e.g. "Geschenkgutschein für einen Fermentations-Workshop bei Fermentfreude in Graz".',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
      ],
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
        condition: textPanelOnly,
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
        condition: textPanelOnly,
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
        condition: textPanelOnly,
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
        condition: textPanelOnly,
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
        condition: textPanelOnly,
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
        condition: textPanelOnly,
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Background Image (text panel)',
      admin: {
        description:
          'Background image shown behind heading and button below the gallery. Uses a neutral fallback color if not set.',
        condition: textPanelOnly,
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
        condition: textPanelOnly,
      },
    },
    {
      name: 'customBackgroundColor',
      type: 'text',
      required: false,
      label: 'Custom Background Color (HEX)',
      admin: {
        description: 'Used when "Background Theme" is set to "Custom color". Example: #ECE5DE',
        condition: (data, siblingData, ctx) =>
          Boolean(textPanelOnly(data, siblingData, ctx)) &&
          siblingData?.backgroundTheme === 'custom',
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
        condition: (data, siblingData, ctx) =>
          Boolean(textPanelOnly(data, siblingData, ctx)) && Boolean(siblingData?.backgroundImage),
      },
    },
  ],
}
