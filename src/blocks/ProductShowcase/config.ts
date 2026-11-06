import type { Block } from 'payload'

import { pointIconField } from '@/fields/pointIcon'

export const ProductShowcase: Block = {
  slug: 'productShowcase',
  interfaceName: 'ProductShowcaseBlock',
  labels: {
    singular: 'Showcase slides (Tempeh, Workshops …)',
    plural: 'Product Showcases',
  },
  admin: {
    group: 'Shop',
  },
  fields: [
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
    },
    {
      name: 'tagline',
      type: 'textarea',
      localized: true,
      label: 'Small text top left',
      admin: {
        description:
          'Short lines in small capitals, e.g. "Fermentiert.⏎Funktional.⏎Für dich." Press Enter for a new line.',
      },
    },
    {
      name: 'slides',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Slide', plural: 'Slides' },
      admin: {
        description:
          'One slide per product, in this order — drag to reorder. Price and weight come live from the shop product. A slide can also be the "Workshops" slide that leads to the workshop booking page.',
        components: {
          RowLabel: '@/blocks/ProductShowcase/slideRowLabel.tsx#ProductShowcaseRowLabel',
        },
      },
      fields: [
        {
          name: 'slideType',
          type: 'select',
          defaultValue: 'product',
          required: true,
          label: 'Slide type',
          options: [
            { label: 'Shop product', value: 'product' },
            { label: 'Workshops (leads to the workshop booking page)', value: 'workshops' },
          ],
          admin: {
            description:
              'Product: shows a shop product with price and button. Workshops: shows a short text and a button to the workshops page.',
          },
        },
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          label: 'Shop product',
          admin: {
            description: 'Price, weight and the button link come from this product.',
            condition: (_, siblingData) => siblingData?.slideType !== 'workshops',
          },
        },
        {
          name: 'linkUrl',
          type: 'text',
          label: 'Button link',
          defaultValue: '/workshops',
          admin: {
            description: 'Where the button goes, e.g. /workshops (the page to book workshops).',
            condition: (_, siblingData) => siblingData?.slideType === 'workshops',
          },
        },
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          label: 'Small label (top right of the big word)',
          admin: {
            description:
              'Optional, e.g. "Käferbohnen", "Klassisch", "Linsen". Leave empty for none.',
          },
        },
        {
          name: 'accentColor',
          type: 'text',
          label: 'Label colour',
          admin: {
            description:
              'Colour of the small label, as a hex code, e.g. #7A2E3B (bean red), #B07A1F (ochre), #5C6B2E (olive). Helps tell the varieties apart.',
            condition: (_, siblingData) => Boolean(siblingData?.eyebrow),
          },
          validate: (value: string | null | undefined) =>
            !value || /^#[0-9a-fA-F]{6}$/.test(value) || 'Use a 6-digit hex code like #7A2E3B',
        },
        {
          name: 'bigWord',
          type: 'textarea',
          localized: true,
          required: true,
          label: 'Big word (behind the product)',
          admin: {
            description:
              'Shown huge behind the product. One line per row, e.g. "Käfer⏎bohnen⏎Tempeh". Press Enter for a new line.',
          },
        },
        {
          name: 'showProductImages',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show the product picture and ingredients',
          admin: {
            description:
              'Untick to hide the floating product and ingredients on this slide (e.g. when the background picture is enough). They come back as soon as you tick it again.',
            condition: (_, siblingData) => siblingData?.slideType !== 'workshops',
          },
        },
        {
          type: 'row',
          // Hidden while "Show the product picture" is unticked — they aren't shown then
          admin: { condition: (_, siblingData) => siblingData?.showProductImages !== false },
          fields: [
            {
              name: 'productImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Picture (transparent PNG)',
              validate: (
                value: unknown,
                { siblingData }: { siblingData?: { slideType?: string; showProductImages?: boolean } },
              ) =>
                Boolean(value) ||
                siblingData?.slideType === 'workshops' ||
                siblingData?.showProductImages === false ||
                'This field is required.',
              admin: {
                width: '50%',
                description:
                  'The product on a TRANSPARENT background (export from Kittl as PNG). It floats in front of the big word. On the Workshops slide the picture is optional.',
              },
            },
            {
              name: 'ingredientsImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Ingredients layer (optional, transparent PNG)',
              admin: {
                width: '50%',
                description:
                  'Optional: beans, leaves, chili… on a transparent background, same size as the product cut-out. Floats at its own depth for extra parallax.',
              },
            },
          ],
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Background picture (optional)',
          admin: {
            description:
              'A photo that fills the whole slide behind the big word and the product. Leave empty for the plain beige background. Use a calm, light picture so the text stays easy to read.',
          },
        },
        {
          type: 'row',
          admin: { condition: (_, siblingData) => Boolean(siblingData?.backgroundImage) },
          fields: [
            {
              name: 'textTone',
              type: 'select',
              defaultValue: 'light',
              label: 'Text on the picture',
              options: [
                { label: 'Light text (for dark photos)', value: 'light' },
                { label: 'Dark text (for bright photos)', value: 'dark' },
              ],
              admin: {
                width: '50%',
                description: 'Light = cream text with a dark shade at the bottom. Dark = charcoal text with an ivory shade.',
              },
            },
            {
              name: 'backgroundVeil',
              type: 'number',
              min: 0,
              max: 80,
              defaultValue: 30,
              label: 'Shade strength (0–80 %)',
              admin: {
                width: '50%',
                description: 'How strong the shade over the picture is, so the text stays readable. 0 = picture as it is.',
              },
            },
          ],
        },
        {
          name: 'workshopsToShow',
          type: 'relationship',
          relationTo: 'workshops',
          hasMany: true,
          label: 'Workshops in the list',
          admin: {
            description:
              'Which workshops appear on this slide, in this order (drag to reorder). Leave empty to show all active workshops.',
            condition: (_, siblingData) => siblingData?.slideType === 'workshops',
          },
        },
        {
          name: 'seasonalLabel',
          type: 'text',
          localized: true,
          label: 'Label for workshops without a date',
          admin: {
            description: 'Shown instead of a date, e.g. "Saisonal". The list of workshops comes from the Workshops collection (active ones).',
            condition: (_, siblingData) => siblingData?.slideType === 'workshops',
          },
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
          label: 'Name (bottom left)',
          admin: { description: 'Leave empty to use the shop product name.' },
        },
        {
          name: 'subline',
          type: 'text',
          localized: true,
          label: 'Second line under the name',
          admin: {
            description: 'Optional, e.g. "Regional. Innovativ. Vielseitig."',
            condition: (_, siblingData) => siblingData?.slideType !== 'workshops',
          },
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: 'Short text (bottom left)',
          admin: { description: 'Leave empty to use the shop product short description.' },
        },
        {
          name: 'buttonLabel',
          type: 'text',
          localized: true,
          label: 'Button text',
          admin: { description: 'e.g. "Zum Produkt". The button opens the shop product.' },
        },
        {
          name: 'buttonNote',
          type: 'textarea',
          localized: true,
          label: 'Note under the button',
          admin: {
            description: 'Optional, one or two short lines, e.g. "Vakuumiert & gekühlt" / "6 Wochen haltbar".',
            condition: (_, siblingData) => siblingData?.slideType !== 'workshops',
          },
        },
      ],
    },
    {
      name: 'trustPointsTitle',
      type: 'text',
      localized: true,
      label: 'Heading above the points',
      admin: { description: 'Optional small heading over the points row, e.g. "Zubereitung".' },
    },
    {
      name: 'trustPoints',
      type: 'array',
      maxRows: 3,
      labels: { singular: 'Point', plural: 'Points' },
      admin: {
        description:
          'Up to 3 points under the button of the product slide (same look as the chefs banner), e.g. the preparation steps.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            pointIconField('bean'),
            {
              name: 'text',
              type: 'text',
              localized: true,
              required: true,
              label: 'Title',
              admin: { width: '75%' },
            },
          ],
        },
        {
          name: 'detail',
          type: 'text',
          localized: true,
          label: 'Short line (optional)',
          admin: { description: 'One short line under the title, e.g. "Käferbohnen, Apfelessig, Tempeh-Kultur."' },
        },
      ],
    },
  ],
}
