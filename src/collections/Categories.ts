import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'
import { isAdmin } from '@/access/isAdmin'

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
    group: 'Content',
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
