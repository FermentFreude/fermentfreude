'use client'

import React, { useState } from 'react'

import { updateQuoteStatus } from './actions'
import { CreateQuoteForm } from './CreateQuoteForm'
import type { QuoteRow } from './types'

interface Props {
  quotes: QuoteRow[]
  onRefresh: () => Promise<void>
}

const STATUS_CONFIG: Record<QuoteRow['status'], { label: string; bg: string; color: string; dot: string }> = {
  open: { label: 'Offen', bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  accepted: { label: 'Angenommen', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  expired: { label: 'Abgelaufen', bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
}

function StatusBadge({ status }: { status: QuoteRow['status'] }) {
  const cfg = STATUS_CONFIG[status]
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

export function QuotesView({ quotes, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 }}>
          Angebote
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: '#111827', color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>{showForm ? '×' : '+'}</span>
          {showForm ? 'Abbrechen' : 'Neues Angebot'}
        </button>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55, margin: '0 0 24px' }}>
        Kostenvoranschläge für Sonder-, Partner- oder Firmenveranstaltungen. Bei Annahme wird die
        reale Bestellung/Rechnung separat erstellt.
      </p>

      {showForm && (
        <CreateQuoteForm
          onDone={() => {
            setShowForm(false)
            onRefresh()
          }}
        />
      )}

      {quotes.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.5, fontSize: '13px' }}>
          Noch keine Angebote erstellt.
        </div>
      ) : (
        <div style={{ border: '1px solid var(--theme-elevation-100)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--theme-elevation-50)', textAlign: 'left' }}>
                {['Angebot #', 'Kunde', 'Projekt', 'Summe', 'Status', 'Gültig bis', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.55 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px' }}>{q.quoteNumber}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 500 }}>{q.clientName}</td>
                  <td style={{ padding: '12px 14px', opacity: 0.85 }}>{q.projectName}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{fmtMoney(q.totalAmount)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <select
                      value={q.status}
                      onChange={(e) => {
                        updateQuoteStatus(q.id, e.target.value as QuoteRow['status']).then(onRefresh)
                      }}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', font: 'inherit' }}
                    >
                      <option value="open">Offen</option>
                      <option value="accepted">Angenommen</option>
                      <option value="expired">Abgelaufen</option>
                    </select>
                    {' '}
                    <StatusBadge status={q.status} />
                  </td>
                  <td style={{ padding: '12px 14px', opacity: 0.7 }}>{q.validUntil}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <a
                      href={`/api/admin/quotes/${q.id}/receipt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: 'var(--theme-text)', opacity: 0.75 }}
                    >
                      Angebot ↓
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
