import type { GlobalConfig } from 'payload'

/**
 * InvoiceCounter — single source of truth for the sequential invoice number.
 * Managed exclusively by the assignInvoiceNumber hook — never edit manually.
 * Format: FF-YYYY-NNNN (e.g. FF-2026-0001)
 */
export const InvoiceCounterGlobal: GlobalConfig = {
  slug: 'invoice-counter',
  label: 'Invoice Counter',
  admin: {
    group: 'Settings',
    description: 'Auto-managed sequential invoice counter. Do not edit manually.',
    hidden: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'lastYear',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Year of the last issued invoice.' },
    },
    {
      name: 'lastNumber',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Last sequential number issued in lastYear.' },
    },
  ],
}
