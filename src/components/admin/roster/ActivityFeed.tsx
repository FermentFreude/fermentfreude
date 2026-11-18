'use client'

import React, { useTransition } from 'react'

import { markActivityEventsRead, markAllActivityEventsRead } from './actions'
import type { Lang } from './rosterI18n'
import type { ActivityEventRow } from './types'

export const TYPE_LABELS: Record<Lang, Record<string, string>> = {
  de: {
    order_placed: 'Bestellung',
    voucher_purchased: 'Gutschein-Kauf',
    voucher_redeemed: 'Gutschein eingelöst',
    booking_rebooked: 'Umbuchung',
    booking_cancelled_no_refund: 'Storno (ohne Erstattung)',
    refund_requested: 'Rückerstattung angefragt',
    refund_completed: 'Rückerstattung abgeschlossen',
    appointment_cancelled_by_organiser: 'Termin abgesagt',
    founder_exception: 'Ausnahme',
  },
  en: {
    order_placed: 'Order',
    voucher_purchased: 'Voucher purchase',
    voucher_redeemed: 'Voucher redeemed',
    booking_rebooked: 'Rebooking',
    booking_cancelled_no_refund: 'Cancellation (no refund)',
    refund_requested: 'Refund requested',
    refund_completed: 'Refund completed',
    appointment_cancelled_by_organiser: 'Date cancelled',
    founder_exception: 'Exception',
  },
}

const T = {
  de: { empty: 'Noch keine Aktivität.', markAll: (n: number) => `Alle als gelesen markieren (${n})`, marking: 'Markiere …', markOne: 'Als gelesen markieren' },
  en: { empty: 'No activity yet.', markAll: (n: number) => `Mark all as read (${n})`, marking: 'Marking…', markOne: 'Mark as read' },
}

/** What customers did on the website (orders, vouchers, rebookings, refunds) — shown inside the Notifications card. */
export function ActivityFeed({ activityEvents, lang, onRefresh }: { activityEvents: ActivityEventRow[]; lang: Lang; onRefresh: () => void | Promise<void> }) {
  const [isPending, startTransition] = useTransition()
  const t = T[lang]
  const unreadCount = activityEvents.filter((e) => e.isUnread).length

  const markAll = () =>
    startTransition(async () => {
      await markAllActivityEventsRead()
      await onRefresh()
    })
  const markOne = (id: string) =>
    startTransition(async () => {
      await markActivityEventsRead([id])
      await onRefresh()
    })

  return (
    <div>
      {unreadCount > 0 && (
        <div style={{ padding: '0 20px 12px' }}>
          {/* Writes run one after another (MongoDB Atlas M0, no transactions) — say so while it works. */}
          <button type="button" className="ff-btn is-sm" onClick={markAll} disabled={isPending}>
            {isPending ? t.marking : t.markAll(unreadCount)}
          </button>
        </div>
      )}
      {activityEvents.length === 0 ? (
        <p className="ff-muted" style={{ margin: 0, padding: '14px 20px 20px', borderTop: '1px solid var(--ff-line)' }}>{t.empty}</p>
      ) : (
        activityEvents.map((e) => (
          <button
            key={e.id}
            type="button"
            className={`ff-nrow${e.isUnread ? ' is-unread' : ''}`}
            onClick={() => e.isUnread && markOne(e.id)}
            title={e.isUnread ? t.markOne : undefined}
            style={{ cursor: e.isUnread ? 'pointer' : 'default' }}
          >
            <span className="ff-nmain">
              <b>{e.summary}</b>
              <small>
                {TYPE_LABELS[lang][e.type] ?? e.type}
                {e.actorName ? ` · ${lang === 'de' ? 'von' : 'by'} ${e.actorName}` : ''}
                {e.reason ? ` · ${lang === 'de' ? 'Grund' : 'Reason'}: ${e.reason}` : ''} · {e.createdAt}
              </small>
            </span>
          </button>
        ))
      )}
    </div>
  )
}
