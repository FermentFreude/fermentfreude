import type { BookingRow } from './types'

/**
 * Where a booking came from. The system only records a few things:
 *  - history entry "created_manual": a founder added it in the dashboard
 *  - an order, or history entry "created_online": booked through the website (Stripe or voucher)
 *  - a note carrying the Wix import tag: taken over from the old Wix shop
 *  - none of these: entered by hand before the marker existed, or imported without a tag
 */
export type BookingOrigin = 'website' | 'manual' | 'wix' | 'unmarked'

export const ORIGIN_INFO: Record<BookingOrigin, { label: string; hint: string }> = {
  website: { label: 'Online', hint: 'Über die Website gebucht (Stripe oder Gutschein).' },
  manual: { label: 'Manuell', hint: 'Von euch im Dashboard eingetragen.' },
  wix: { label: 'Wix-Import', hint: 'Aus dem alten Wix-Shop übernommen.' },
  unmarked: {
    label: 'Ohne Beleg',
    hint: 'Kein Online-Auftrag und keine Markierung — vermutlich von Hand eingetragen oder importiert.',
  },
}

export function bookingOrigin(b: Pick<BookingRow, 'orderId' | 'notes' | 'history'>): BookingOrigin {
  const types = (b.history ?? []).map((h) => h.type)
  if (types.includes('created_manual')) return 'manual'
  if (/wix/i.test(b.notes ?? '')) return 'wix'
  if (b.orderId || types.includes('created_online')) return 'website'
  return 'unmarked'
}
