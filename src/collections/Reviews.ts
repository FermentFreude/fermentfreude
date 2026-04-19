import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    group: 'Shop',
    description: 'Kundenbewertungen für Produkte',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Kunde',
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Produkt',
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      label: 'Bewertung (1–5)',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
    },
    {
      name: 'body',
      type: 'textarea',
      label: 'Bewertungstext',
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected'],
      defaultValue: 'pending',
      label: 'Status',
      admin: { description: 'Bewertungen müssen manuell freigegeben werden' },
    },
    {
      name: 'verifiedPurchase',
      type: 'checkbox',
      defaultValue: false,
      label: 'Verifizierter Kauf',
      admin: { readOnly: true, description: 'Wird automatisch gesetzt wenn eine Bestellung gefunden wird' },
    },
  ],
}
