import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Inhalt',
  },
  hooks: {
    afterChange: [autoTranslateCollection],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
