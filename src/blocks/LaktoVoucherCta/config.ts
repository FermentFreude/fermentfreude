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
      name: 'useGlobalData',
      type: 'checkbox',
      label: 'Use global content',
      defaultValue: true,
      admin: {
        description:
          '✅ ON = Uses shared content from Website → Voucher CTA (edit once, applies everywhere).\n❌ OFF = Use custom content just for this page.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow',
      admin: {
        description: 'Small text above the title (e.g. "GEMEINSAM FERMENTIEREN").',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Title',
      admin: {
        description: 'Main heading (e.g. "Go with a friend.").',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
      admin: {
        description: 'Short paragraph below the heading.',
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
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
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
    },
    {
      type: 'row',
      admin: {
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
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
      admin: {
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
      },
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
        condition: (_data, siblingData) => siblingData?.useGlobalData === false,
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
