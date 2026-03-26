import type { GlobalConfig } from 'payload'

import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

export const WorkshopCardsGlobal: GlobalConfig = {
  slug: 'workshop-cards-global',
  label: 'Workshop Cards',
  admin: {
    group: 'Website',
    description:
      'Global workshop cards section used on Fermentation, Gastronomy, and other pages. Edit once, appears everywhere.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Section Title',
      admin: {
        description: 'Heading for the workshop cards section.',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
      label: 'Subtitle',
      admin: {
        description: 'Optional text below the title.',
      },
    },
    {
      name: 'clarification',
      type: 'text',
      localized: true,
      label: 'Clarification Text',
      admin: {
        description: 'Optional clarification below subtitle (e.g. price disclaimer).',
      },
    },
    {
      name: 'nextDateLabel',
      type: 'text',
      localized: true,
      label: 'Next Date Label',
      admin: {
        description: 'Label for the next appointment date (e.g. "Nächster Termin").',
      },
    },
    {
      name: 'viewAllLabel',
      type: 'text',
      localized: true,
      label: 'View All Button Label',
      admin: {
        description: 'Label for the "View All" button (e.g. "Alle Workshops").',
      },
    },
    {
      name: 'viewAllUrl',
      type: 'text',
      label: 'View All Button URL',
      admin: {
        description: 'URL for the "View All" button (e.g. "/workshops").',
      },
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Workshop Cards',
      minRows: 1,
      maxRows: 6,
      required: true,
      admin: {
        description: 'Individual workshop cards to display.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Title',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Description',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
        },
        {
          name: 'price',
          type: 'text',
          required: true,
          label: 'Price',
        },
        {
          name: 'priceSuffix',
          type: 'text',
          localized: true,
          label: 'Price Suffix',
          admin: {
            description: 'Text after the price (e.g. "pro Person").',
          },
        },
        {
          name: 'buttonLabel',
          type: 'text',
          localized: true,
          label: 'Button Label',
        },
        {
          name: 'buttonUrl',
          type: 'text',
          label: 'Button URL',
        },
        {
          name: 'nextDate',
          type: 'text',
          localized: true,
          label: 'Next Appointment (fallback)',
          admin: {
            description:
              'Dates are auto-populated from Workshop Appointments. Only used as fallback if no upcoming appointment exists.',
          },
        },
      ],
    },
  ],
}
