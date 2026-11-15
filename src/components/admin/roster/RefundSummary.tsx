'use client'

import React from 'react'

import type { Lang } from './rosterI18n'
import type { RefundRequestRow } from './types'

const T = {
  de: {
    none: 'Keine offenen Rückerstattungen.',
    open: 'Rückerstattungen öffnen →',
    status: { requested: 'Angefragt', acknowledged: 'Gestartet', processing: 'Gestartet' } as Record<string, string>,
    days: (n: number) => (n <= 0 ? 'Heute angefragt' : `Seit ${n} ${n === 1 ? 'Tag' : 'Tagen'} offen`),
    by: (n: string) => `Von ${n}`,
  },
  en: {
    none: 'No open refunds.',
    open: 'Open refunds →',
    status: { requested: 'Requested', acknowledged: 'Started', processing: 'Started' } as Record<string, string>,
    days: (n: number) => (n <= 0 ? 'Requested today' : `Open for ${n} day${n === 1 ? '' : 's'}`),
    by: (n: string) => `By ${n}`,
  },
}

export const isOpenRefund = (r: RefundRequestRow) => r.status === 'requested' || r.status === 'acknowledged' || r.status === 'processing'

/** Open refund requests as a short list — used on the dashboard card and in the Notifications "Refunds" tab. */
export function RefundSummary({ refundRequests, lang, onOpen }: { refundRequests: RefundRequestRow[]; lang: Lang; onOpen: () => void }) {
  const t = T[lang]
  const open = refundRequests.filter(isOpenRefund).sort((a, b) => b.daysPending - a.daysPending)
  if (open.length === 0) {
    return <p className="ff-muted" style={{ margin: 0, padding: '14px 20px 20px', borderTop: '1px solid var(--ff-line)' }}>{t.none}</p>
  }
  return (
    <div>
      {open.map((r) => (
        <button key={r.id} type="button" className="ff-nrow" onClick={onOpen}>
          <span className="ff-nmain">
            <b>{r.customerName || r.customerEmail}</b>
            <span className="ff-snip">{r.workshopTitle} · {r.workshopDate} · €{(r.amount / 100).toFixed(2).replace('.', ',')}</span>
            <small>{r.status === 'requested' ? t.days(r.daysPending) : `${r.handledByName ? t.by(r.handledByName) : ''}${r.resolutionNote ? ` · ${r.resolutionNote}` : ''}`}</small>
          </span>
          <span className="ff-nside">
            <span className="ff-pill ff-pillgrey">{t.status[r.status] ?? r.status}</span>
          </span>
        </button>
      ))}
      <div style={{ padding: '10px 20px 16px' }}>
        <button type="button" className="ff-btn is-gold" onClick={onOpen}>{t.open}</button>
      </div>
    </div>
  )
}
