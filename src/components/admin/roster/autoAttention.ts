import { seatsHoldingPlace } from '@/lib/seatCapacity'

import { bookingOrigin } from './bookingOrigin'
import { seatMismatch } from './seatCheck'
import type { AutoAttentionItem } from './attentionTypes'
import type { RosterData } from './types'

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
      if (b.manual?.paymentStatus === 'open') {
        // a reservation that has not been paid yet
        items.push({ key: `payment-open:${b.id}`, severity: 'attention', rule: 'payment-open', appointmentId: a.id, params })
      } else if (!b.manual?.paymentStatus) {
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
      params: { name: r.customerName || r.customerEmail, days: r.daysPending },
    })
  }

  const rank = { urgent: 0, attention: 1, info: 2 } as const
  return items.sort((x, y) => rank[x.severity] - rank[y.severity])
}
