import type { GlobalConfig } from 'payload'

import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

export const VoucherCtaGlobal: GlobalConfig = {
  slug: 'voucher-cta-global',
  label: 'Voucher CTA',
  admin: {
    group: 'Website',
    description:
      'Global "Go with a friend" voucher CTA section. Edit once, appears on Shop, workshop detail pages, and any page with a Voucher CTA block set to "Use global content".',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow',
      admin: {
        description: 'Small uppercase text above the title (e.g. "GEMEINSAM FERMENTIEREN").',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Title',
      admin: {
        description: 'Main heading (e.g. "Go with a friend.").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
      admin: {
        description: 'Short paragraph below the heading (1–2 sentences).',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
      admin: {
        description:
          'Optional background image. White text with dark overlay when set, cream background with dark text when empty.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryLabel',
          type: 'text',
          localized: true,
          label: 'Primary Button',
          admin: { description: 'e.g. "Gutschein kaufen" / "Buy Voucher"' },
        },
        {
          name: 'primaryHref',
          type: 'text',
          label: 'Primary URL',
          admin: { description: 'e.g. "/voucher"' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'secondaryLabel',
          type: 'text',
          localized: true,
          label: 'Secondary Button',
          admin: { description: 'e.g. "Zum Shop" / "To Shop"' },
        },
        {
          name: 'secondaryHref',
          type: 'text',
          label: 'Secondary URL',
          admin: { description: 'e.g. "/shop"' },
        },
      ],
    },
    {
      name: 'pills',
      type: 'array',
      label: 'Feature Pills',
      maxRows: 6,
      admin: {
        description:
          'Small tags at the bottom (e.g. "Sofort einlösbar", "Für alle Workshops", "Digital oder gedruckt").',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          localized: true,
          label: 'Text',
        },
      ],
    },
  ],
}
