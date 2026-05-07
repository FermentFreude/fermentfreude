import type { GlobalConfig } from 'payload'

import { revalidateGlobal } from './hooks/revalidateGlobal'

/**
 * BusinessInfo — single source of truth for legal & banking data on invoices.
 *
 * David & Marcel fill this in once via /admin → Globals → Business Info.
 * Every PDF receipt (orders, workshop bookings, vouchers) reads from here, so
 * there is exactly one place to update if the company moves, the IBAN changes
 * or the Steuernummer is finally issued.
 *
 * Not localized — this is legal data tied to the Austrian entity.
 */
export const BusinessInfoGlobal: GlobalConfig = {
  slug: 'business-info',
  label: 'Business Info (Invoices)',
  admin: {
    group: 'Settings',
    description:
      'Rechnungs- und Bankdaten für alle PDF-Belege (Bestellungen, Workshop-Buchungen, Gutscheine). Wird nur einmal ausgefüllt — alle Rechnungen lesen automatisch von hier.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Firma',
          fields: [
            {
              name: 'companyName',
              type: 'text',
              required: true,
              defaultValue: 'FermentFreude OG',
              label: 'Firmenname',
              admin: {
                description: 'Vollständiger eingetragener Firmenname inkl. Rechtsform.',
              },
            },
            {
              name: 'addressLine1',
              type: 'text',
              required: true,
              defaultValue: 'Grabenstraße 15',
              label: 'Straße & Hausnummer',
            },
            {
              name: 'postalCode',
              type: 'text',
              required: true,
              defaultValue: '8010',
              label: 'PLZ',
            },
            {
              name: 'city',
              type: 'text',
              required: true,
              defaultValue: 'Graz',
              label: 'Stadt',
            },
            {
              name: 'country',
              type: 'text',
              required: true,
              defaultValue: 'Österreich',
              label: 'Land',
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              defaultValue: 'kontakt@fermentfreude.at',
              label: 'Kontakt-E-Mail',
            },
            {
              name: 'website',
              type: 'text',
              defaultValue: 'www.fermentfreude.at',
              label: 'Website',
            },
            {
              name: 'phone',
              type: 'text',
              defaultValue: '+43 660 4943577',
              label: 'Telefon (optional)',
            },
          ],
        },
        {
          label: 'Recht & Steuer',
          fields: [
            {
              name: 'uid',
              type: 'text',
              defaultValue: 'ATU82444712',
              label: 'UID-Nummer (ATU…)',
              admin: {
                description:
                  'Österreichische Umsatzsteuer-Identifikationsnummer (z. B. ATU12345678). Auf jeder Rechnung Pflicht.',
              },
            },
            {
              name: 'fn',
              type: 'text',
              defaultValue: 'FN 659072 z',
              label: 'Firmenbuchnummer (FN…)',
              admin: {
                description: 'Firmenbuchnummer inkl. Präfix "FN" (z. B. FN 123456a).',
              },
            },
            {
              name: 'court',
              type: 'text',
              defaultValue: 'Firmenbuchgericht Graz',
              label: 'Gerichtsstand / Firmenbuchgericht',
            },
            {
              name: 'isKleinunternehmer',
              type: 'checkbox',
              defaultValue: true,
              label: 'Kleinunternehmer-Regelung (§ 6 Abs. 1 Z 27 UStG)',
              admin: {
                description:
                  'Wenn aktiviert: Auf Rechnungen wird KEINE Umsatzsteuer ausgewiesen, stattdessen der Kleinunternehmer-Hinweis. MwSt.-Satz unten wird ignoriert.',
              },
            },
            {
              name: 'vatRate',
              type: 'number',
              required: true,
              defaultValue: 0,
              label: 'Standard-MwSt.-Satz (%)',
              admin: {
                description:
                  'Nur relevant wenn Kleinunternehmer-Regelung deaktiviert ist. Standard Österreich: 20 %.',
                condition: (data, siblingData) => !siblingData?.isKleinunternehmer,
              },
            },
          ],
        },
        {
          label: 'Bank',
          fields: [
            {
              name: 'iban',
              type: 'text',
              label: 'IBAN',
              admin: {
                description: 'Wird auf jeder Rechnung im Footer angezeigt.',
              },
            },
            {
              name: 'bic',
              type: 'text',
              label: 'BIC',
            },
            {
              name: 'bankName',
              type: 'text',
              label: 'Bankname',
            },
          ],
        },
      ],
    },
  ],
}
