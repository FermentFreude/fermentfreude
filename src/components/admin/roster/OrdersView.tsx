'use client'

import React, { useState } from 'react'

import type { OrderRow } from './types'

interface Props {
  orders: OrderRow[]
}

type Tab = 'all' | 'completed' | 'processing' | 'cancelled' | 'refunded'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  processing: { label: 'In Bearbeitung', bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  completed: { label: 'Abgeschlossen', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  cancelled: { label: 'Storniert', bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
  refunded: { label: 'Rückerstattet', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return <span style={{ opacity: 0.4 }}>—</span>
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

const fmtMoney = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`

const TAB_LABELS: Record<Tab, string> = {
  all: 'Alle',
  completed: 'Abgeschlossen',
  processing: 'In Bearbeitung',
  cancelled: 'Storniert',
  refunded: 'Rückerstattet',
}

export function OrdersView({ orders }: Props) {
  const [tab, setTab] = useState<Tab>('all')

  const rows = tab === 'all' ? orders : orders.filter((o) => o.status === tab)

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--theme-text)', margin: '0 0 4px' }}>
        Bestellungen
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55, margin: '0 0 24px' }}>
        Alle Bestellungen mit Rechnung — inklusive stornierter und rückerstatteter, für die Buchhaltung.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--theme-elevation-100)' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
        {(['all', 'completed', 'processing', 'cancelled', 'refunded'] as const).map((t) => {
          const count = t === 'all' ? orders.length : orders.filter((o) => o.status === t).length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: '13px', fontWeight: tab === t ? 600 : 400,
                color: 'var(--theme-text)', opacity: tab === t ? 1 : 0.55,
                borderBottom: tab === t ? '2px solid var(--theme-text)' : '2px solid transparent',
              }}
            >
              {TAB_LABELS[t]} ({count})
            </button>
          )
        })}
        </div>

        <a
          href={`/api/admin/orders/receipt-bulk?status=${tab}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: rows.length === 0 ? 'none' : 'inline-flex',
            alignItems: 'center', gap: '6px', padding: '8px 14px', marginBottom: '8px',
            borderRadius: '6px', border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-0)', color: 'var(--theme-text)',
            fontSize: '12px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
          }}
        >
          ↓ Alle Rechnungen herunterladen ({rows.length})
        </a>
      </div>

      {rows.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.5, fontSize: '13px' }}>
          Keine Bestellungen in dieser Kategorie.
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ border: '1px solid var(--theme-elevation-100)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--theme-elevation-50)', textAlign: 'left' }}>
                {['Rechnung #', 'Kund:in', 'Artikel', 'Betrag', 'Status', 'Datum', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.55 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px' }}>{o.invoiceNumber}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 500 }}>{o.customerName || '—'}</div>
                    <div style={{ opacity: 0.55, fontSize: '12px' }}>{o.customerEmail}</div>
                  </td>
                  <td style={{ padding: '12px 14px', opacity: 0.85 }}>{o.itemsSummary || '—'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{fmtMoney(o.amount)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td style={{ padding: '12px 14px', opacity: 0.7 }}>{o.createdAt}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <a
                      href={`/api/admin/orders/${o.id}/receipt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: 'var(--theme-text)', opacity: 0.75 }}
                    >
                      Rechnung ↓
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
