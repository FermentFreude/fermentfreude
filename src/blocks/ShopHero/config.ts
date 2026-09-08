import type { Block } from 'payload'

export const ShopHero: Block = {
  slug: 'shopHero',
  interfaceName: 'ShopHeroBlock',
  labels: {
    singular: 'Shop Hero',
    plural: 'Shop Heroes',
  },
  fields: [
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: {
        description: 'Toggle off to hide the whole shop hero without deleting it.',
      },
    },
    {
      name: 'signatureBadge',
      type: 'group',
      label: 'Signature badge (top right of photo)',
      admin: {
        description:
          'Small badge on the top-right of the shop hero. Uncheck “Show on shop” to hide it. Text stays saved.',
      },
      fields: [
        {
          name: 'show',
          type: 'checkbox',
          label: 'Show on shop',
          defaultValue: true,
          admin: {
            description: 'Uncheck to hide the badge on /shop. Check again to show it.',
          },
        },
        {
          name: 'brand',
          type: 'text',
          localized: true,
          label: 'Line 1',
          admin: { description: 'e.g. FermentFreude' },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: 'Line 2',
          admin: { description: 'e.g. Signature' },
        },
        {
          name: 'subtitle',
          type: 'text',
          localized: true,
          label: 'Line 3',
          admin: {
            description: 'e.g. Handgemacht in Graz / Handmade in Graz (switch DE/EN at the top)',
          },
        },
      ],
    },
    {
      name: 'heroProduct',
      type: 'relationship',
      relationTo: 'products',
      hasMany: false,
      label: 'Hero product',
      admin: {
        description:
          'Product shown on /shop (title, price, description, sold-out). Packaging shots belong on the product detail page.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero background photo',
      admin: {
        description:
          'Full-bleed plated photo behind the hero. Leave empty to use the default Käfer photo.',
      },
    },
    {
      name: 'heroPanelColor',
      type: 'text',
      label: 'Hero panel color (legacy)',
      defaultValue: '#403c39',
      admin: {
        description: 'Unused by the current layout. Default: #403c39.',
      },
    },
    {
      name: 'trustItems',
      type: 'array',
      label: 'Trust row (below the hero)',
      minRows: 0,
      maxRows: 3,
      labels: { singular: 'Trust item', plural: 'Trust items' },
      admin: {
        description:
          'Three short highlights under the hero (icons + text). Leave empty to show the default Graz / pickup / fresh lines.',
      },
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Icon',
          required: true,
          defaultValue: 'hand',
          options: [
            { label: 'Hand (handmade)', value: 'hand' },
            { label: 'Map pin (pickup)', value: 'mapPin' },
            { label: 'Leaf (fresh)', value: 'leaf' },
          ],
          admin: { description: 'Icon shown in the gold circle.' },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Label',
          admin: {
            description: 'e.g. "Handgemacht in Graz" / "Handmade in Graz"',
          },
        },
      ],
    },
    {
      name: 'heroTitle',
      type: 'textarea',
      required: false,
      localized: true,
      label: 'Intro line (optional)',
      admin: {
        description: 'Small line above the hero product. Leave empty to keep focus on the product.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaPrimaryLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'Primary button label',
          admin: { width: '50%', description: 'e.g. "Jetzt bestellen" / "Order now"' },
        },
        {
          name: 'ctaPrimaryUrl',
          type: 'text',
          required: false,
          label: 'Primary button URL',
          admin: {
            width: '50%',
            description: 'Leave empty to link to the hero product page.',
          },
        },
      ],
    },
    {
      name: 'bottomTagline',
      type: 'text',
      required: false,
      localized: true,
      label: 'Pickup tagline',
      admin: {
        description: 'e.g. "Fermentierte Lebensmittel, mit Sorgfalt hergestellt."',
      },
    },
    {
      name: 'bottomSubtitle',
      type: 'textarea',
      required: false,
      localized: true,
      label: 'Pickup subtitle',
      admin: {
        description: 'Shown under the price/buttons. e.g. "Abholung in Graz, jede Woche frisch."',
      },
    },
    {
      name: 'bottomDisclaimer',
      type: 'text',
      required: false,
      localized: true,
      label: 'Delivery note',
      admin: {
        description: 'Optional extra line under the pickup text.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'soldOutLabel',
          type: 'text',
          localized: true,
          label: 'Sold-out badge',
          admin: { width: '50%', description: 'e.g. "Ausverkauft" / "Sold out"' },
        },
        {
          name: 'priceLabel',
          type: 'text',
          localized: true,
          label: 'Price label',
          admin: { width: '50%', description: 'e.g. "Preis" / "Price"' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'addToCartLabel',
          type: 'text',
          localized: true,
          label: 'Add to cart button',
          admin: { width: '33%', description: 'e.g. "In den Warenkorb" / "Add to cart"' },
        },
        {
          name: 'detailsLabel',
          type: 'text',
          localized: true,
          label: 'Product details link',
          admin: { width: '33%', description: 'e.g. "Produktdetails" / "Product details"' },
        },
        {
          name: 'viewDetailsLabel',
          type: 'text',
          localized: true,
          label: 'View details (when sold out)',
          admin: {
            width: '34%',
            description: 'Button text if the hero product is sold out.',
          },
        },
      ],
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Product cards (legacy — unused)',
      minRows: 0,
      maxRows: 6,
      admin: {
        description: 'Old jar slider. Leave empty. Hidden from the live shop.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Product image',
        },
        {
          name: 'categoryLabel',
          type: 'text',
          required: false,
          localized: true,
          label: 'Card label',
        },
        {
          name: 'detailUrl',
          type: 'text',
          required: false,
          label: 'Detail link',
        },
      ],
    },
    {
      name: 'showSignatureBadge',
      type: 'checkbox',
      label: 'Show Signature badge (legacy)',
      defaultValue: true,
      admin: { hidden: true },
    },
    {
      name: 'signatureBrand',
      type: 'text',
      localized: true,
      label: 'Signature brand (legacy)',
      admin: { hidden: true },
    },
    {
      name: 'signatureLabel',
      type: 'text',
      localized: true,
      label: 'Signature title (legacy)',
      admin: { hidden: true },
    },
    {
      name: 'signatureSubtitle',
      type: 'text',
      localized: true,
      label: 'Signature subtitle (legacy)',
      admin: { hidden: true },
    },
  ],
}
