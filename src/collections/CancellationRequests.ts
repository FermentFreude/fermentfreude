import type { CollectionConfig } from 'payload'

export const CancellationRequests: CollectionConfig = {
  slug: 'cancellation-requests',
  admin: {
    useAsTitle: 'id',
    group: 'Shop',
    description: 'Stornierungsanfragen von Kunden',
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
      name: 'stripeRefundId',
      type: 'text',
      label: 'Stripe Rückerstattungs-ID',
      admin: { readOnly: true },
    },
    {
      name: 'refundAmount',
      type: 'number',
      label: 'Rückerstattungsbetrag (Cent)',
      admin: { description: 'Betrag in Cent, z.B. 2500 = 25,00 €' },
    },
    {
      name: 'processedAt',
      type: 'date',
      label: 'Bearbeitet am',
      admin: { readOnly: true },
    },
  ],
}
