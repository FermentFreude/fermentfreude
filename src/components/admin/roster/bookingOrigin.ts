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

/**
 * Older hand-entered bookings have no structured source/payment, only a free-text note
 * ("Workshop per Email angemeldet", "hat einen Gutschein", "zahlt vor Ort"). Read the
 * note and return short labels so the card can say how it came in and how it is paid.
 * Display only: nothing is written back.
 */
export function noteHints(notes: string, lang: 'de' | 'en'): { source: string[]; pay: string[] } {
  const n = (notes ?? '').replace(/\[Wix[^\]]*\]/gi, '')
  const de = lang === 'de'
  const source: string[] = []
  const pay: string[] = []
  if (/umbuch|transfer|rebook|verschoben|cancelled due|abgesagt/i.test(n)) source.push(de ? 'Umbuchung' : 'Rebooking')
  if (/e-?mail/i.test(n)) source.push(de ? 'Per E-Mail' : 'By email')
  if (/telefon|anruf|phone/i.test(n)) source.push(de ? 'Per Telefon' : 'By phone')
  if (/whatsapp|instagram|nachricht/i.test(n)) source.push(de ? 'Per Nachricht' : 'By message')
  if (/vor ort|in person|persönlich|bar\b|cash/i.test(n)) pay.push(de ? 'Zahlt vor Ort' : 'Pays on site')
  if (/gutschein|voucher/i.test(n)) pay.push(de ? 'Gutschein' : 'Voucher')
  if (/rechnung|invoice|überweisung|transfer(?!\s*vom)/i.test(n)) pay.push(de ? 'Rechnung / Überweisung' : 'Invoice / bank transfer')
  if (/\bbezahlt\b|\bpaid\b/i.test(n) && !/nicht bezahlt|noch nicht|unpaid/i.test(n)) pay.push(de ? 'Bezahlt' : 'Paid')
  if (/noch nicht bezahlt|nicht bezahlt|offen|unpaid/i.test(n)) pay.push(de ? 'Zahlung offen' : 'Payment open')
  return { source, pay }
}

/**
 * True when a note only restates what the source / payment labels already say
 * ("Workshop per Email angemeldet", "Telefonisch gebucht, zahlt vor Ort", "Hat einen Gutschein").
 * The card hides such a note so the same fact is not shown twice; anything with names, dates
 * or other details is kept. Display only.
 */
export function isRedundantNote(note: string): boolean {
  const left = (note ?? '')
    .replace(/\[[^\]]*\]/g, ' ')
    .toLowerCase()
    .replace(/\b(workshop|per|via|by|e-?mail|email|mail|angemeldet|gebucht|booked|telefonisch|telefon|phone|anruf|nachricht|whatsapp|zahlt|zahlung|pays?|paid|bezahlt|vor|ort|on|site|in|person|persönlich|bar|cash|hat|einen|ein|gutschein|voucher|rechnung|invoice|überweisung|und|oder|and|or|noch|nicht|offen|die|der|das|bitte|has|a|the)\b/g, ' ')
    .replace(/[^a-zäöüß0-9]+/g, '')
  return left.length === 0
}
