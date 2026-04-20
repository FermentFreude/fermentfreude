import type { CollectionConfig } from 'payload'

export const Downloads: CollectionConfig = {
  slug: 'downloads',
  admin: {
    useAsTitle: 'id',
    group: 'Shop',
    description: 'Digitale Downloads für Kunden nach dem Kauf',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.roles?.includes('admin')) return true
      return { user: { equals: req.user.id } }
    },
    create: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
    update: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
    delete: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
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
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Produkt',
    },
    {
      name: 'file',
      type: 'relationship',
      relationTo: 'media',
      label: 'Datei',
    },
    {
      name: 'downloadCount',
      type: 'number',
      defaultValue: 0,
      label: 'Anzahl Downloads',
      admin: { readOnly: true },
    },
    {
      name: 'downloadLimit',
      type: 'number',
      defaultValue: 5,
      label: 'Download-Limit',
      admin: { description: 'Maximale Anzahl erlaubter Downloads' },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Läuft ab am',
      admin: { description: 'Datum nach dem der Download nicht mehr verfügbar ist' },
    },
  ],
}
