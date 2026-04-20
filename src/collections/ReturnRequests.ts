import type { CollectionConfig } from 'payload'

export const ReturnRequests: CollectionConfig = {
  slug: 'return-requests',
  admin: {
    useAsTitle: 'id',
    group: 'Shop',
    description: 'Rückgabeanfragen von Kunden',
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
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      label: 'Bestellung',
    },
    {
      name: 'reason',
      type: 'textarea',
      label: 'Grund',
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected', 'completed'],
      defaultValue: 'pending',
      label: 'Status',
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Interne Notizen',
      admin: { description: 'Nur für Admins sichtbar' },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Artikel',
      fields: [
        {
          name: 'productId',
          type: 'text',
          label: 'Produkt-ID',
        },
        {
          name: 'quantity',
          type: 'number',
          label: 'Menge',
        },
      ],
    },
  ],
}
