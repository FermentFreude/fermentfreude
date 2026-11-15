import { seatsHoldingPlace } from '@/lib/seatCapacity'

import { bookingOrigin, noteHints } from './bookingOrigin'
import { seatMismatch } from './seatCheck'
import type { AutoAttentionItem } from './attentionTypes'
import type { RosterData } from './types'

/** Days after "refund started" without Stripe's confirmation before the dashboard reminds the founders. */
const REFUND_STALE_DAYS = 5

/** Problems the dashboard finds by itself. Read-only: nothing here changes data. */
export function detectAttentionItems(data: RosterData): AutoAttentionItem[] {
  const items: AutoAttentionItem[] = []

  for (const a of data.appointments) {
    if (a.isPast) continue
    const m = seatMismatch(a)
    if (m) {
      items.push({
        key: `seat-mismatch:${a.id}:${m.shown}:${m.expected}`,
        severity: 'attention',
        rule: 'seat-mismatch',
        appointmentId: a.id,
        params: { workshop: a.workshopTitle, date: a.date, shown: m.shown, expected: m.expected },
      })
    }
    for (const b of data.bookingsByAppointment[a.id] ?? []) {
      if (seatsHoldingPlace(b) === 0) continue
      const origin = bookingOrigin(b)
      if (origin === 'website' || origin === 'wix') continue // paid online / in Wix: nothing to record
      const params = { name: [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email, workshop: a.workshopTitle, date: a.date }
      // Old hand-entered bookings: the note often already says how it was paid ("Gutschein", "zahlt vor Ort").
      const fromNote = origin === 'unmarked' && !b.manual ? noteHints(b.notes, 'de').pay : []
      const noteOpen = fromNote.includes('Zahlung offen')
      if (b.manual?.paymentStatus === 'open' || noteOpen) {
        // a reservation that has not been paid yet
        items.push({ key: `payment-open:${b.id}`, severity: 'attention', rule: 'payment-open', appointmentId: a.id, params })
      } else if (!b.manual?.paymentStatus && fromNote.length === 0) {
        // added by hand (or entered without a marker) and nobody recorded how it was paid
        items.push({ key: `no-receipt:${b.id}`, severity: 'info', rule: 'no-receipt', appointmentId: a.id, params })
      }
    }
  }

  for (const r of data.refundRequests) {
    if (r.status !== 'requested') continue
    items.push({
      key: `refund-open:${r.id}`,
      severity: r.daysPending >= 3 ? 'urgent' : 'attention',
      rule: 'refund-open',
      section: 'refunds',
      params: { name: r.customerName || r.customerEmail, days: r.daysPending },
    })
  }
  // A refund the founders started in Stripe that Stripe has not confirmed yet (the webhook closes it when the money is back).
  for (const r of data.refundRequests) {
    if ((r.status !== 'acknowledged' && r.status !== 'processing') || r.resolution === 'voucher' || r.resolution === 'rebooked') continue
    if (r.daysSinceHandled < REFUND_STALE_DAYS) continue
    items.push({
      key: `refund-stale:${r.id}`,
      severity: 'attention',
      rule: 'refund-stale',
      section: 'refunds',
      params: { name: r.customerName || r.customerEmail, days: r.daysSinceHandled },
    })
  }

  const rank = { urgent: 0, attention: 1, info: 2 } as const
  return items.sort((x, y) => rank[x.severity] - rank[y.severity])
}
