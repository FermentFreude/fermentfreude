import type { Block } from 'payload'

/**
 * Full-bleed product banner slider — same visual language as the Shop Hero
 * (src/blocks/ShopHero), but cycling through several products instead of one.
 */
export const ProductHeroSlider: Block = {
  slug: 'productHeroSlider',
  interfaceName: 'ProductHeroSliderBlock',
  labels: {
    singular: 'Product Hero Slider',
    plural: 'Product Hero Sliders',
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
      name: 'slides',
      type: 'array',
      label: 'Slides',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Slide', plural: 'Slides' },
      admin: {
        description: 'One slide per product. The slider auto-rotates through these in order.',
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          hasMany: false,
          required: true,
          label: 'Product',
          admin: {
            description: 'Title, price, description and sold-out status come from this product.',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Slide Background Image',
          admin: {
            description: 'Full-bleed photo behind this slide. Leave empty to show a plain placeholder.',
          },
        },
        {
          name: 'badgeLabel',
          type: 'text',
          localized: true,
          label: 'Badge Label',
          admin: {
            description: 'Optional small badge over the image (e.g. "Signature"). Leave empty to hide.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ctaLabel',
              type: 'text',
              localized: true,
              label: 'CTA Button Label',
              admin: { width: '50%', description: 'Overrides the default "Order now" label.' },
            },
            {
              name: 'ctaLink',
              type: 'text',
              label: 'CTA Button Link',
              admin: {
                width: '50%',
                description: 'Leave empty to link to the product page.',
              },
            },
          ],
        },
      ],
    },
  ],
}
