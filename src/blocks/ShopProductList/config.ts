import type { Block } from 'payload'

export const ShopProductList: Block = {
  slug: 'shopProductList',
  interfaceName: 'ShopProductListBlock',
  labels: {
    singular: 'Produkt-Anzeige',
    plural: 'Produkt-Anzeigen',
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
      type: 'text',
      required: false,
      localized: true,
      label: 'Überschrift / Heading',
      admin: {
        description:
          'Optionale Überschrift über dem Produkt-Raster. / Optional heading above the product grid.',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      required: false,
      label: 'Produkte auswählen / Select Products',
      admin: {
        description:
          'Wähle die Produkte aus, die in diesem Block angezeigt werden sollen. Wenn leer, werden alle veröffentlichten Produkte angezeigt. / Pick which products to display in this block. If empty, all published products are shown.',
      },
    },
  ],
}
