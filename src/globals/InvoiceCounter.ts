import type { GlobalConfig } from 'payload'

/**
 * InvoiceCounter — source of truth for sequential document numbers.
 * Managed exclusively by assignInvoiceNumber / assignQuoteNumber /
 * assignCancellationInvoiceNumber via atomic $inc — never edit manually.
 *
 * `lastYear`/`lastNumber` is the legacy single series (format FF-YYYY-NNNN),
 * kept untouched so historical Orders/Vouchers keep valid numbers. Vouchers
 * still draw from this legacy pair. New typed series below are independent:
 *   ang* -> ANG-YYYY-NNNN (Angebot/quote)
 *   man* -> MAN-YYYY-NNNN (manually-created/offline-paid orders)
 *   web* -> WEB-YYYY-NNNN (Stripe-paid website orders)
 * A Stornorechnung draws its number from its parent order's own series
 * (man/web) rather than a fourth series.
 */
export const InvoiceCounterGlobal: GlobalConfig = {
  slug: 'invoice-counter',
  label: 'Invoice Counter',
  admin: {
    group: 'Settings',
    description: 'Auto-managed sequential invoice counters. Do not edit manually.',
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
      admin: { description: 'Legacy series (FF-YYYY-NNNN) — year of the last issued number.' },
    },
    {
      name: 'lastNumber',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Legacy series (FF-YYYY-NNNN) — last sequential number issued in lastYear.' },
    },
    {
      name: 'angLastYear',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'ANG series — year of the last issued number.' },
    },
    {
      name: 'angLastNumber',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'ANG series — last sequential number issued in angLastYear.' },
    },
    {
      name: 'manLastYear',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'MAN series — year of the last issued number.' },
    },
    {
      name: 'manLastNumber',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'MAN series — last sequential number issued in manLastYear.' },
    },
    {
      name: 'webLastYear',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'WEB series — year of the last issued number.' },
    },
    {
      name: 'webLastNumber',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'WEB series — last sequential number issued in webLastYear.' },
    },
  ],
}
