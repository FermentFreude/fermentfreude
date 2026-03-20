import { adminOnly } from '@/access/adminOnly'
import type { CollectionConfig } from 'payload'

export const WorkshopLocations: CollectionConfig = {
  slug: 'workshop-locations',
  access: {
    read: () => true, // Public read
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Workshops & Kurse',
    defaultColumns: ['name', 'address', 'isActive'],
    description: 'Workshop locations. Used to organize appointments by geography.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Location name (e.g., Berlin Studio, Munich Workshop)',
      },
    },
    {
      name: 'address',
      type: 'text',
      required: true,
      admin: {
        description: 'Full address including street, city, and postal code',
      },
    },
    {
      name: 'timezone',
      type: 'text',
      admin: {
        description: 'Optional timezone (e.g., Europe/Berlin) for date/time clarity',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Hide location from frontend if unchecked',
      },
    },
  ],
}
