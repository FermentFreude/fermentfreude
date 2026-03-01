import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Quick Links',
      admin: {
        description: 'Links shown in the "Quick Links" column.',
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
    },
    {
      name: 'workshopLinks',
      type: 'array',
      label: 'Workshop Links',
      admin: {
        description: 'Links shown in the "Our Workshops" column.',
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
    {
      name: 'location',
      type: 'textarea',
      localized: true,
      label: 'Location Address',
      admin: {
        description:
          'Address displayed in the footer (e.g. "Grabenstraße 15, 8010 Graz, Austria").',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      admin: {
        description: 'Contact phone number.',
      },
    },
    {
      name: 'newsletterHeading',
      type: 'text',
      localized: true,
      label: 'Newsletter Heading',
      admin: {
        description: 'Heading for the newsletter section (e.g. "Subscribe Newsletter").',
      },
    },
    {
      name: 'newsletterDescription',
      type: 'textarea',
      localized: true,
      label: 'Newsletter Description',
      admin: {
        description: 'Short text above the newsletter subscribe form.',
      },
    },
    {
      name: 'socialMedia',
      type: 'group',
      label: 'Social Media Links',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          label: 'Facebook URL',
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram URL',
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
        },
      ],
    },
  ],
}
