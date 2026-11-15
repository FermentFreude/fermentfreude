'use client'

import React, { useState } from 'react'

import { handleRefundRequest, type RefundResolution } from './actions'
import { Dlg } from './AttentionPanel'
import type { Lang } from './rosterI18n'
import { PageHeader } from './rosterTheme'
import { useToast } from './RosterToast'
import type { ActivityEventRow, RefundRequestRow } from './types'
import { TYPE_LABELS } from './ActivityView'

const T = {
  de: {
    title: 'Rückerstattungen',
    sub: 'Das Geld wird weiterhin von euch in Stripe zurückgezahlt — hier haltet ihr fest, was ihr getan habt. Sobald Stripe die Rückzahlung bestätigt, wird die Anfrage automatisch abgeschlossen.',
    open: 'Offen', done: 'Erledigt', history: 'Verlauf', noneOpen: 'Keine offenen Rückerstattungen.', noneDone: 'Noch nichts erledigt.',
    histSub: 'Frühere Rückerstattungen, Stornos und Absagen aus dem Aktivitätsprotokoll — auch wenn es dazu keine Anfrage mehr im System gibt.', noneHist: 'Noch nichts im Verlauf.',
    days: (n: number) => `${n} ${n === 1 ? 'Tag' : 'Tage'} offen`, seat: 'Platz',
    status: { requested: 'Angefragt', acknowledged: 'Gestartet — wartet auf Stripe', processing: 'Gestartet — wartet auf Stripe', completed: 'Von Stripe bestätigt', failed: 'Fehlgeschlagen', resolved: 'Gelöst ohne Rückzahlung' },
    handle: 'Bearbeiten …', edit: 'Notiz ändern', handled: (n: string, d: string) => `${n ? `Von ${n}` : 'Bearbeitet'}${d ? ` am ${d}` : ''}`,
    copy: 'Kopieren', stripe: 'In Stripe öffnen ↗',
    dlgTitle: 'Rückerstattung bearbeiten', how: 'Wie wird es gelöst?', note: 'Notiz (was wurde gemacht oder vereinbart?)', notePh: 'z. B. Rückzahlung am 15.11. in Stripe angestoßen',
    stripeHint: 'Die Rückzahlung selbst macht ihr in Stripe. Hier speichert ihr nur, dass sie läuft.',
    cancel: 'Abbrechen', save: 'Speichern', saved: 'Gespeichert.',
    res: { refunded: 'Rückzahlung in Stripe gestartet', partial: 'Teilrückzahlung in Stripe gestartet', voucher: 'Gutschein statt Rückzahlung', rebooked: 'Auf anderen Termin umgebucht', declined: 'Abgelehnt', other: 'Andere Lösung' },
  },
  en: {
    title: 'Refunds',
    sub: 'You still send the money back in Stripe — here you record what you did. When Stripe confirms the refund, the request closes by itself.',
    open: 'Open', done: 'Done', history: 'History', noneOpen: 'No open refunds.', noneDone: 'Nothing done yet.',
    histSub: 'Earlier refunds, cancellations and date cancellations from the activity log — even if the request no longer exists in the system.', noneHist: 'Nothing in the history yet.',
    days: (n: number) => `${n} day${n === 1 ? '' : 's'} open`, seat: 'Seat',
    status: { requested: 'Requested', acknowledged: 'Started — waiting for Stripe', processing: 'Started — waiting for Stripe', completed: 'Confirmed by Stripe', failed: 'Failed', resolved: 'Solved without refund' },
    handle: 'Handle…', edit: 'Edit note', handled: (n: string, d: string) => `${n ? `By ${n}` : 'Handled'}${d ? ` on ${d}` : ''}`,
    copy: 'Copy', stripe: 'Open in Stripe ↗',
    dlgTitle: 'Handle refund', how: 'How is it solved?', note: 'Note (what was done or agreed?)', notePh: 'e.g. Refund started in Stripe on 15 Nov',
    stripeHint: 'You send the money back in Stripe yourselves. Here you only record that it is on its way.',
    cancel: 'Cancel', save: 'Save', saved: 'Saved.',
    res: { refunded: 'Refund started in Stripe', partial: 'Partial refund started in Stripe', voucher: 'Voucher instead of refund', rebooked: 'Moved to another date', declined: 'Declined', other: 'Other solution' },
  },
}

const fmtMoney = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`
const RESOLUTIONS: RefundResolution[] = ['refunded', 'partial', 'voucher', 'rebooked', 'declined', 'other']

function RefundDialog({ r, lang, onClose, onDone }: { r: RefundRequestRow; lang: Lang; onClose: () => void; onDone: () => void }) {
  const t = T[lang]
  const [resolution, setResolution] = useState<RefundResolution>((r.resolution as RefundResolution) || 'refunded')
  const [note, setNote] = useState(r.resolutionNote)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await handleRefundRequest(r.id, resolution, note)
      if (!res.ok) setErr(res.error)
      else onDone()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error')
    }
    setBusy(false)
  }
  return (
    <Dlg label={t.dlgTitle} onClose={onClose}>
      <h3>{t.dlgTitle}</h3>
      <p style={{ margin: '0 0 12px' }}>
        <strong>{r.customerName || r.customerEmail}</strong>
        <br />
        <span className="ff-muted">{r.workshopTitle} · {r.workshopDate} · {fmtMoney(r.amount)}</span>
      </p>
      <label className="ff-field"><span>{t.how}</span>
        <select className="ff-input" value={resolution} onChange={(e) => setResolution(e.target.value as RefundResolution)}>
          {RESOLUTIONS.map((k) => <option key={k} value={k}>{t.res[k]}</option>)}
        </select>
      </label>
      {(resolution === 'refunded' || resolution === 'partial') && <p className="ff-muted" style={{ margin: '8px 0 0', fontSize: 13 }}>{t.stripeHint}</p>}
      <label className="ff-field" style={{ marginTop: 12 }}><span>{t.note}</span>
        <textarea className="ff-input" rows={4} maxLength={1000} value={note} placeholder={t.notePh} onChange={(e) => setNote(e.target.value)} />
      </label>
      {err && <div className="ff-err" style={{ marginTop: 10 }}>{err}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-gold" onClick={save} disabled={busy}>{t.save}</button>
      </div>
    </Dlg>
  )
}

function Copy({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false)
  if (!text) return null
  return (
    <button
      type="button"
      className="ff-btn is-sm"
      onClick={() => navigator.clipboard.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1500) }).catch(() => {})}
      title={text}
    >
      {ok ? '✓' : label}
    </button>
  )
}

const HISTORY_TYPES = ['refund_requested', 'refund_completed', 'booking_cancelled_no_refund', 'appointment_cancelled_by_organiser']

export function RefundsView({ refundRequests, activityEvents = [], lang = 'de', onRefresh }: { refundRequests: RefundRequestRow[]; activityEvents?: ActivityEventRow[]; lang?: Lang; onRefresh: () => Promise<void> }) {
  const t = T[lang]
  const toast = useToast()
  const [tab, setTab] = useState<'open' | 'done' | 'history'>('open')
  const [dialog, setDialog] = useState<RefundRequestRow | null>(null)

  const isOpen = (r: RefundRequestRow) => r.status === 'requested' || r.status === 'acknowledged' || r.status === 'processing'
  const open = refundRequests.filter(isOpen).sort((a, b) => b.daysPending - a.daysPending)
  const done = refundRequests.filter((r) => !isOpen(r))
  const rows = tab === 'open' ? open : tab === 'done' ? done : []
  const history = activityEvents.filter((e) => HISTORY_TYPES.includes(e.type))

  return (
    <div className="ff-page">
      <PageHeader title={t.title} subtitle={t.sub} />

      <div className="ff-fchips" style={{ padding: '0 0 16px' }} role="group" aria-label={t.title}>
        <button type="button" className="ff-fchip" aria-pressed={tab === 'open'} onClick={() => setTab('open')}>{t.open} <b>{open.length}</b></button>
        <button type="button" className="ff-fchip" aria-pressed={tab === 'done'} onClick={() => setTab('done')}>{t.done} <b>{done.length}</b></button>
        <button type="button" className="ff-fchip" aria-pressed={tab === 'history'} onClick={() => setTab('history')}>{t.history} <b>{history.length}</b></button>
      </div>

      {tab === 'history' ? (
        <section className="ff-panel" style={{ overflow: 'hidden' }}>
          <p className="ff-muted" style={{ margin: 0, padding: '14px 20px', fontSize: 13 }}>{t.histSub}</p>
          {history.length === 0 ? (
            <p className="ff-muted" style={{ margin: 0, padding: '14px 20px 20px', borderTop: '1px solid var(--ff-line)' }}>{t.noneHist}</p>
          ) : (
            history.map((e) => (
              <div key={e.id} className="ff-nrow" style={{ cursor: 'default' }}>
                <span className="ff-nmain">
                  <b>{e.summary}</b>
                  <small>{TYPE_LABELS[lang][e.type] ?? e.type} · {e.createdAt}</small>
                </span>
              </div>
            ))
          )}
        </section>
      ) : rows.length === 0 ? (
        <p className="ff-muted">{tab === 'open' ? t.noneOpen : t.noneDone}</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {rows.map((r) => (
            <section key={r.id} className="ff-panel" style={{ padding: '16px 18px', display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <b style={{ fontSize: 16 }}>{r.customerName || r.customerEmail}</b>
                  {r.customerName && <div className="ff-muted" style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{r.customerEmail}</div>}
                  <div className="ff-muted" style={{ fontSize: 13, marginTop: 2 }}>{r.workshopTitle} · {r.workshopDate} · {t.seat} {r.seatIndex + 1}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ fontSize: 18 }}>{fmtMoney(r.amount)}</b>
                  <div style={{ marginTop: 4 }}><span className="ff-pill ff-pillgrey">{t.status[r.status]}</span></div>
                  {isOpen(r) && <div className="ff-muted" style={{ fontSize: 12, marginTop: 4 }}>{t.days(r.daysPending)}</div>}
                </div>
              </div>

              {(r.resolution || r.resolutionNote) && (
                <div className="ff-info" style={{ margin: 0, background: 'var(--ff-surface2)', color: 'var(--ff-fg)' }}>
                  <b>{r.resolution ? t.res[r.resolution] : ''}</b>
                  {r.resolutionNote && <div style={{ marginTop: 2, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{r.resolutionNote}</div>}
                  <small className="ff-muted" style={{ display: 'block', marginTop: 4 }}>{t.handled(r.handledByName, r.handledAt)}</small>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {r.stripePaymentIntentId && (
                  <>
                    <Copy text={r.stripePaymentIntentId} label={t.copy} />
                    <a className="ff-btn is-sm" href={`https://dashboard.stripe.com/search?query=${encodeURIComponent(r.stripePaymentIntentId)}`} target="_blank" rel="noopener noreferrer">{t.stripe}</a>
                  </>
                )}
                {isOpen(r) && (
                  <button type="button" className="ff-btn is-gold" style={{ marginLeft: 'auto' }} onClick={() => setDialog(r)}>
                    {r.resolution ? t.edit : t.handle}
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {dialog && <RefundDialog r={dialog} lang={lang} onClose={() => setDialog(null)} onDone={async () => { setDialog(null); toast(t.saved); await onRefresh() }} />}
    </div>
  )
}
