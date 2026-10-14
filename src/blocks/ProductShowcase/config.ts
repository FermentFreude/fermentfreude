import type { Block } from 'payload'

export const ProductShowcase: Block = {
  slug: 'productShowcase',
  interfaceName: 'ProductShowcaseBlock',
  labels: {
    singular: 'Product Showcase (big word + floating product)',
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
      labels: { singular: 'Product', plural: 'Products' },
      admin: {
        description:
          'One slide per product, in this order — drag to reorder. Price and weight come live from the shop product.',
        components: {
          RowLabel: '@/blocks/ProductShowcase/slideRowLabel.tsx#ProductShowcaseRowLabel',
        },
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          label: 'Shop product',
          admin: {
            description: 'Price, weight and the button link come from this product.',
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
          type: 'row',
          fields: [
            {
              name: 'productImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Product cut-out (transparent PNG)',
              admin: {
                width: '50%',
                description:
                  'The product on a TRANSPARENT background (export from Kittl as PNG). It floats in front of the big word.',
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
          name: 'label',
          type: 'text',
          localized: true,
          label: 'Name (bottom left)',
          admin: { description: 'Leave empty to use the shop product name.' },
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
      ],
    },
    {
      name: 'trustPoints',
      type: 'array',
      maxRows: 8,
      labels: { singular: 'Point', plural: 'Points' },
      admin: {
        description:
          'The line along the bottom, e.g. "100 % pflanzlich", "Natürlich fermentiert", "Regional aus Graz".',
      },
      fields: [{ name: 'text', type: 'text', localized: true, required: true, label: 'Text' }],
    },
  ],
}
