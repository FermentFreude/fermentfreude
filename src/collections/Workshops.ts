import { adminOnly } from '@/access/adminOnly'
import type { CollectionConfig } from 'payload'

export const Workshops: CollectionConfig = {
  slug: 'workshops',
  access: {
    read: () => true, // Public read
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'basePrice', 'maxCapacityPerSlot', 'isActive'],
    description: 'Define workshop metadata. Price and capacity apply to all dates and locations.',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly identifier (e.g., kombucha, lakto, tempeh, basics)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Workshop name (displayed on frontend)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Detailed workshop description',
      },
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
      defaultValue: 99,
      min: 0,
      admin: {
        description: 'Price per person in EUR (default: €99)',
      },
    },
    {
      name: 'maxCapacityPerSlot',
      type: 'number',
      required: true,
      defaultValue: 12,
      min: 1,
      max: 12,
      admin: {
        readOnly: true,
        description:
          'Maximum number of people per workshop session (locked at 12 for quality control)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Workshop hero image',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Hide workshop from frontend if unchecked',
      },
    },
  ],
}
