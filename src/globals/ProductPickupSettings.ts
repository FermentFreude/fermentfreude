import type { GlobalConfig } from 'payload'

import { revalidateGlobal } from './hooks/revalidateGlobal'

/**
 * Product Pickup Settings — where physical-product orders (jars, fresh,
 * bottled goods) get picked up, and the link customers use to book their
 * exact pickup time.
 *
 * The location is the shop/manufacturing site — fixed and permanent, safe to
 * show in checkout before payment. The exact pickup time is NOT collected in
 * checkout at all: after paying, the customer gets `googleScheduleUrl` (a
 * Google Calendar "Appointment Schedule" link, set up like Calendly) to pick
 * a slot directly in David's calendar. There is deliberately no day/hours
 * field here — Google's own booking page is the single source of truth for
 * availability, so there's nothing to keep in sync on our side.
 *
 * Does not apply to workshops or vouchers — those have their own booking
 * systems and are unaffected by this global.
 */
export const ProductPickupSettingsGlobal: GlobalConfig = {
  slug: 'product-pickup-settings',
  label: 'Product Pickup Settings',
  admin: {
    group: 'Settings',
    description:
      'Wo Bestellungen (Gläser, frische & abgefüllte Produkte) abgeholt werden, und der Link, über den Kund:innen nach der Bezahlung ihre Abholzeit buchen. Gilt NICHT für Workshops oder Gutscheine.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      name: 'locationName',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Fermentfreude',
      label: 'Name des Abholorts',
      admin: {
        description: 'Wird Kund:innen vor und nach der Zahlung angezeigt (z. B. Geschäftsname).',
      },
    },
    {
      name: 'locationAddress',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Grabenstraße 15, 8010 Graz, Austria',
      label: 'Adresse des Abholorts',
      admin: {
        description:
          'Feste Adresse unseres Geschäfts/Produktionsstandorts — wird bereits vor der Zahlung angezeigt, da sie sich nicht ändert.',
      },
    },
    {
      name: 'googleScheduleUrl',
      type: 'text',
      label: 'Google Appointment Schedule Link',
      admin: {
        description:
          'Der öffentliche Buchungslink aus Google Kalender (Termine erstellen → "Terminplan"), über den Kund:innen nach der Zahlung ihre Abholzeit wählen. Erscheint erst NACH der Zahlung (Bestellbestätigung + E-Mail) — nicht im Checkout. Leer lassen, bis ein echter Terminplan existiert.',
      },
    },
  ],
}
