'use client'

import React, { useState, useTransition } from 'react'

import { acknowledgeRefundRequest } from './actions'
import type { RefundRequestRow } from './types'

interface Props {
  refundRequests: RefundRequestRow[]
  onRefresh: () => Promise<void>
}

const STATUS_CONFIG: Record<RefundRequestRow['status'], { label: string; bg: string; color: string; dot: string }> = {
  requested: { label: 'Angefragt', bg: '#FEF3C7', color: '#92400E', dot: '#f59e0b' },
  acknowledged: { label: 'In Bearbeitung', bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  processing: { label: 'In Bearbeitung', bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  completed: { label: 'Abgeschlossen', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  failed: { label: 'Fehlgeschlagen', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
}

function StatusBadge({ status }: { status: RefundRequestRow['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.requested
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  if (!text) return <span style={{ opacity: 0.4 }}>—</span>
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
      {text}
      <button
        onClick={copy}
        title="Kopieren"
        style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 4px',
          borderRadius: '4px', fontSize: '11px', color: copied ? '#22c55e' : 'var(--theme-text)',
          opacity: copied ? 1 : 0.45,
        }}
      >
        {copied ? '✓' : '⎘'}
      </button>
    </span>
  )
}

const fmtMoney = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`

export function RefundsView({ refundRequests, onRefresh }: Props) {
  const [tab, setTab] = useState<'queue' | 'completed'>('queue')
  const [isPending, startTransition] = useTransition()
  const [ackingId, setAckingId] = useState<string | null>(null)

  const queue = refundRequests
    .filter((r) => r.status === 'requested' || r.status === 'acknowledged' || r.status === 'processing')
    .sort((a, b) => b.daysPending - a.daysPending) // oldest-first (most days pending first)
  const completed = refundRequests.filter((r) => r.status === 'completed' || r.status === 'failed')

  const rows = tab === 'queue' ? queue : completed

  const handleAcknowledge = (id: string) => {
    setAckingId(id)
    startTransition(async () => {
      await acknowledgeRefundRequest(id)
      await onRefresh()
      setAckingId(null)
    })
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--theme-text)', margin: '0 0 4px' }}>
        Rückerstattungen
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55, margin: '0 0 24px' }}>
        Keine Rückerstattung wird automatisch ausgeführt — nutze die Stripe-PaymentIntent-ID, um sie im
        Stripe-Dashboard manuell zu bearbeiten. Abgeschlossen wird eine Zeile automatisch, sobald Stripe die
        Rückerstattung bestätigt.
      </p>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--theme-elevation-100)' }}>
        {(['queue', 'completed'] as const).map((t) => (
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
            {t === 'queue' ? `Offen (${queue.length})` : `Abgeschlossen (${completed.length})`}
          </button>
        ))}
      </div>

      {rows.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.5, fontSize: '13px' }}>
          {tab === 'queue' ? 'Keine offenen Rückerstattungen.' : 'Noch keine abgeschlossenen Rückerstattungen.'}
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ border: '1px solid var(--theme-elevation-100)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--theme-elevation-50)', textAlign: 'left' }}>
                {['Kund:in', 'Workshop', 'Platz', 'Betrag', tab === 'queue' ? 'Tage offen' : 'Status', 'Stripe PaymentIntent', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.55 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 500 }}>{r.customerName || '—'}</div>
                    <div style={{ opacity: 0.55, fontSize: '12px' }}>{r.customerEmail}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div>{r.workshopTitle}</div>
                    <div style={{ opacity: 0.55, fontSize: '12px' }}>{r.workshopDate}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>{r.seatIndex + 1}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{fmtMoney(r.amount)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {tab === 'queue' ? (
                      <span style={{ fontWeight: r.daysPending >= 7 ? 700 : 400, color: r.daysPending >= 7 ? '#dc2626' : 'inherit' }}>
                        {r.daysPending} {r.daysPending === 1 ? 'Tag' : 'Tage'}
                      </span>
                    ) : (
                      <StatusBadge status={r.status} />
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <CopyButton text={r.stripePaymentIntentId} />
                    {r.stripePaymentIntentId && (
                      <a
                        href={`https://dashboard.stripe.com/search?query=${encodeURIComponent(r.stripePaymentIntentId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--theme-text)', opacity: 0.55 }}
                      >
                        In Stripe öffnen ↗
                      </a>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {tab === 'queue' && r.status === 'requested' && (
                      <button
                        onClick={() => handleAcknowledge(r.id)}
                        disabled={isPending && ackingId === r.id}
                        style={{
                          padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--theme-elevation-150)',
                          background: 'var(--theme-elevation-0)', color: 'var(--theme-text)', fontSize: '12px', cursor: 'pointer',
                        }}
                        title="Rein kosmetisch — markiert nur als 'in Bearbeitung', schließt nichts ab. Der Webhook von Stripe bleibt maßgeblich."
                      >
                        {isPending && ackingId === r.id ? '…' : 'In Stripe bearbeitet ✓'}
                      </button>
                    )}
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
