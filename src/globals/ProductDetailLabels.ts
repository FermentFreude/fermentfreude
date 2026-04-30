import type { GlobalConfig } from 'payload'

import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

export const ProductDetailLabelsGlobal: GlobalConfig = {
  slug: 'product-detail-labels-global',
  label: 'Product Detail Labels',
  admin: {
    group: 'Website',
    description: 'Localized labels for product detail headings and notices.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  fields: [
    {
      name: 'ingredientsLabel',
      type: 'text',
      localized: true,
      required: false,
      label: 'Ingredients Label',
    },
    {
      name: 'allergensLabel',
      type: 'text',
      localized: true,
      required: false,
      label: 'Allergens Label',
    },
    {
      name: 'storageShelfLifeLabel',
      type: 'text',
      localized: true,
      required: false,
      label: 'Storage & Shelf Life Label',
    },
    {
      name: 'shelfLifeLabel',
      type: 'text',
      localized: true,
      required: false,
      label: 'Shelf Life Label',
    },
    {
      name: 'howToUseLabel',
      type: 'text',
      localized: true,
      required: false,
      label: 'How To Use Label',
    },
    {
      name: 'instructionsBeforeUseLabel',
      type: 'text',
      localized: true,
      required: false,
      label: 'Instructions Before Use Label',
    },
    {
      name: 'deliveryNotice',
      type: 'textarea',
      localized: true,
      required: false,
      label: 'Delivery Notice',
    },
  ],
}
