import { adminOnly } from '@/access/adminOnly'
import { followStandardCapacity, validateStandardCapacity } from '@/hooks/appointmentCapacity'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'
import type { CollectionConfig } from 'payload'

export const Workshops: CollectionConfig = {
  slug: 'workshops',
  access: {
    read: () => true, // Public read
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [validateStandardCapacity],
    afterChange: [autoTranslateCollection, followStandardCapacity],
  },
  admin: {
    useAsTitle: 'title',
    group: 'Workshops',
    defaultColumns: ['title', 'basePrice', 'maxCapacityPerSlot', 'isActive'],
    description: 'Define workshop metadata. Price and standard capacity apply to all dates and locations. A single date can have its own capacity.',
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
      defaultValue: 8,
      min: 1,
      admin: {
        description:
          'Standard-Kapazität: wie viele Personen pro Termin dabei sein können. Sie gilt für alle Termine dieses Workshops, die keine eigene Kapazität haben (bei einem einzelnen Termin kann sie unter „Workshop-Termine“ überschrieben werden). Eine Änderung passt die freien Plätze aller kommenden Termine ohne eigene Kapazität automatisch an.',
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
      name: 'whatToBring',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'What attendees should bring to the workshop. Plain text — line breaks are preserved in confirmation/reminder emails. Leave empty to omit the section.',
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
