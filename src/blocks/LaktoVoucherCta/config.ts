import type { Block } from 'payload'

export const LaktoVoucherCtaBlock: Block = {
  slug: 'laktoVoucherCta',
  interfaceName: 'LaktoVoucherCtaBlock',
  labels: {
    singular: { de: 'Gutschein CTA (mit Hintergrundbild)', en: 'Voucher CTA (with Background)' },
    plural: { de: 'Gutschein CTAs (mit Hintergrundbild)', en: 'Voucher CTAs (with Background)' },
  },
  fields: [
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Show this section',
      defaultValue: true,
      admin: {
        description: 'Toggle off to hide this section on the page without deleting it.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow',
      admin: { description: 'Small text above the title (e.g. "GEMEINSAM FERMENTIEREN").' },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Title',
      admin: { description: 'Main heading (e.g. "Go with a friend.").' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
      admin: { description: 'Short paragraph below the heading.' },
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
          label: { de: 'Primärer Button', en: 'Primary Button' },
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
          label: { de: 'Sekundärer Button', en: 'Secondary Button' },
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
      label: 'Pills / Tags',
      maxRows: 5,
      admin: {
        description:
          'Small tags shown at the bottom (e.g. "Sofort einlösbar", "Für alle Workshops").',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
          label: 'Text',
        },
      ],
    },
  ],
}
