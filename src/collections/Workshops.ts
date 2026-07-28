import { adminOnly } from '@/access/adminOnly'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'
import type { CollectionConfig } from 'payload'

import {
  revalidateWorkshopsNav,
  revalidateWorkshopsNavAfterDelete,
} from './Workshops/hooks/revalidateWorkshopsNav'
import { provisionWorkshopOnSave } from './Workshops/hooks/provisionWorkshopOnSave'

export const Workshops: CollectionConfig = {
  slug: 'workshops',
  access: {
    read: () => true, // Public read
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    afterChange: [provisionWorkshopOnSave, autoTranslateCollection, revalidateWorkshopsNav],
    afterDelete: [revalidateWorkshopsNavAfterDelete],
  },
  admin: {
    useAsTitle: 'title',
    group: 'Workshops',
    defaultColumns: ['title', 'basePrice', 'maxCapacityPerSlot', 'isActive'],
    description:
      'Create a workshop here — saving automatically creates the shop product and public page. Then add appointment dates and customize content on the page.',
  },
  fields: [
    {
      name: 'setupChecklist',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/WorkshopSetupChecklist#WorkshopSetupChecklist',
        },
      },
    },
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
