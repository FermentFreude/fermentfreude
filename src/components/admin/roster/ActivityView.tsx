'use client'

import React, { useTransition } from 'react'

import { markActivityEventsRead, markAllActivityEventsRead } from './actions'
import type { ActivityEventRow } from './types'

interface Props {
  activityEvents: ActivityEventRow[]
  onRefresh: () => Promise<void>
}

const TYPE_LABELS: Record<string, string> = {
  order_placed: 'Bestellung',
  voucher_purchased: 'Gutschein-Kauf',
  voucher_redeemed: 'Gutschein eingelöst',
  booking_rebooked: 'Umbuchung',
  booking_cancelled_no_refund: 'Storno (ohne Erstattung)',
  refund_requested: 'Rückerstattung angefragt',
  refund_completed: 'Rückerstattung abgeschlossen',
  appointment_cancelled_by_organiser: 'Termin abgesagt',
}

export function ActivityView({ activityEvents, onRefresh }: Props) {
  const [isPending, startTransition] = useTransition()

  const unreadCount = activityEvents.filter((e) => e.isUnread).length

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllActivityEventsRead()
      await onRefresh()
    })
  }

  const handleMarkOne = (id: string) => {
    startTransition(async () => {
      await markActivityEventsRead([id])
      await onRefresh()
    })
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--theme-text)', margin: '0 0 4px' }}>
            Aktivität
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55, margin: 0 }}>
            Bestellungen, Gutscheine, Umbuchungen, Stornierungen und Rückerstattungen — alles an einem Ort.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            style={{
              padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--theme-elevation-150)',
              background: 'var(--theme-elevation-0)', color: 'var(--theme-text)', fontSize: '13px',
              cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {/* Sequential writes (MongoDB Atlas M0 has no transactions) mean
                marking many events read can take a few seconds — say so,
                rather than leaving the button looking unresponsive. */}
            {isPending ? 'Markiere …' : `Alle als gelesen markieren (${unreadCount})`}
          </button>
        )}
      </div>

      {activityEvents.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.5, fontSize: '13px' }}>
          Noch keine Aktivität.
        </div>
      )}

      <div style={{ border: '1px solid var(--theme-elevation-100)', borderRadius: '8px', overflow: 'hidden' }}>
        {activityEvents.map((event, i) => (
          <div
            key={event.id}
            onClick={() => event.isUnread && handleMarkOne(event.id)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px',
              borderTop: i > 0 ? '1px solid var(--theme-elevation-100)' : 'none',
              background: event.isUnread ? 'var(--theme-elevation-50)' : 'transparent',
              cursor: event.isUnread ? 'pointer' : 'default',
            }}
            title={event.isUnread ? 'Als gelesen markieren' : undefined}
          >
            <span
              style={{
                width: '7px', height: '7px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                background: event.isUnread ? '#3b82f6' : 'transparent',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.5 }}>
                  {TYPE_LABELS[event.type] ?? event.type}
                </span>
                <span style={{ fontSize: '11px', opacity: 0.4 }}>{event.createdAt}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: event.isUnread ? 600 : 400, color: 'var(--theme-text)' }}>
                {event.summary}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
