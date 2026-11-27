import { adminOnly } from '@/access/adminOnly'
import { normaliseDiscountCode } from '@/lib/discountCodes'
import type { CollectionConfig } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  Rabattcodes — discount codes for buying a gift voucher
 *  (e.g. FREUDE26: €5 off the €99 workshop voucher, Kleine Zeitung
 *  campaign Dec 2026). Checked by src/lib/discountCodes.ts.
 *
 *  Admin-only on purpose: the list of codes must never be readable
 *  through the public API. The website checks a code server-side.
 * ═══════════════════════════════════════════════════════════════ */

const VOUCHER_AMOUNT_OPTIONS = [
  { label: '€99 Workshop-Gutschein', value: '99' },
  { label: '€50 Wertgutschein', value: '50' },
  { label: '€30 Wertgutschein', value: '30' },
  { label: '€20 Wertgutschein', value: '20' },
]

export const DiscountCodes: CollectionConfig = {
  slug: 'discount-codes',
  labels: { singular: 'Rabattcode', plural: 'Rabattcodes' },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'code',
    defaultColumns: ['code', 'amountOff', 'validFrom', 'validUntil', 'active', 'timesUsed'],
    description:
      'Codes, die Kund:innen beim Kauf eines Gutscheins auf der Gutschein-Seite eingeben (z. B. aus einer Zeitungsaktion). Der Rabatt wird vom Preis abgezogen, der Gutschein behält seinen vollen Wert.',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      label: 'Code',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Was Kund:innen eintippen, z. B. WINTER10. Groß-/Kleinschreibung und Leerzeichen sind egal.',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => (typeof value === 'string' ? normaliseDiscountCode(value) : value),
        ],
      },
    },
    {
      name: 'amountOff',
      type: 'number',
      label: 'Rabatt in €',
      required: true,
      min: 1,
      admin: { description: 'Wird vom Gutscheinpreis abgezogen, z. B. 5 → €99 Gutschein kostet €94.' },
      validate: (value: number | null | undefined, { siblingData }: { siblingData: unknown }) => {
        if (typeof value !== 'number' || value <= 0) return 'Bitte einen Betrag größer als 0 eingeben.'
        const amounts = ((siblingData as { voucherAmounts?: string[] })?.voucherAmounts ?? []).map(Number)
        const smallest = amounts.length ? Math.min(...amounts) : Infinity
        if (value >= smallest) return `Der Rabatt muss kleiner sein als der Gutschein (€${smallest}).`
        return true
      },
    },
    {
      name: 'voucherAmounts',
      type: 'select',
      label: 'Gilt für',
      hasMany: true,
      required: true,
      defaultValue: ['99'],
      options: VOUCHER_AMOUNT_OPTIONS,
      admin: { description: 'Bei welchen Gutscheinen der Code funktioniert.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'validFrom',
          type: 'date',
          label: 'Gültig ab',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
            description: 'Ab diesem Tag (österreichische Zeit). Leer = sofort.',
          },
        },
        {
          name: 'validUntil',
          type: 'date',
          label: 'Gültig bis (einschließlich)',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
            description: 'Bis einschließlich diesem Tag. Leer = unbegrenzt.',
          },
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Ausschalten, um den Code sofort zu stoppen (auch innerhalb der Gültigkeit).',
      },
    },
    {
      name: 'timesUsed',
      type: 'number',
      label: 'Verwendet',
      virtual: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'So viele bezahlte Gutscheine wurden mit diesem Code gekauft.',
      },
      hooks: {
        afterRead: [
          async ({ data, req }) => {
            if (!data?.code) return 0
            const { totalDocs } = await req.payload.count({
              collection: 'vouchers',
              where: { discountCode: { equals: data.code } },
              overrideAccess: true,
              req,
            })
            return totalDocs
          },
        ],
      },
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Interne Notiz',
      admin: {
        position: 'sidebar',
        description: 'Nur für euch, z. B. „Kleine Zeitung Tip-On-Card, 4.12.2026“.',
      },
    },
  ],
}
