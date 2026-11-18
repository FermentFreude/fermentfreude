'use client'

import React, { useState } from 'react'

import { createRefundCancellationInvoice, handleRefundRequest, markRefundCompleted, type RefundResolution } from './actions'
import { Dlg } from './AttentionPanel'
import type { Lang } from './rosterI18n'
import { PageHeader } from './rosterTheme'
import { useToast } from './RosterToast'
import type { ActivityEventRow, RefundRequestRow } from './types'
import { TYPE_LABELS } from './ActivityFeed'

const T = {
  de: {
    title: 'Anfragen',
    sub: 'Alles, was Kundinnen und Kunden über ihren Buchungslink gemacht haben, und die Ausnahmen, die ihr gemacht habt. Nur Rückerstattungen warten auf eure Entscheidung — das Geld zahlt ihr in Stripe zurück, Stripe schließt die Anfrage dann automatisch. Ging es anders zurück (Überweisung, Teilbetrag), schließt ihr sie mit „Als erstattet markieren“.',
    open: 'Offen', done: 'Erledigt', noneOpen: 'Keine offenen Rückerstattungen.', noneDone: 'Noch nichts erledigt.',
    customer: 'Von Kund:innen', custSub: 'Über den Buchungslink erledigt: umgebucht, Gutschein-Code, storniert, Rückerstattung angefragt. Passiert automatisch nach euren Regeln — hier seht ihr es nur.', noneCust: 'Noch nichts über Buchungslinks.',
    exceptions: 'Ausnahmen', excSub: 'Was ihr außerhalb der Regeln gemacht habt: weniger als 14 Tage vorher verschoben, einen Platz als Umbuchung geschenkt, einen vollen Termin geöffnet.', noneExc: 'Noch keine Ausnahmen.',
    reason: 'Grund', by: 'von',
    days: (n: number) => `${n} ${n === 1 ? 'Tag' : 'Tage'} offen`, seat: 'Platz',
    status: { requested: 'Angefragt', acknowledged: 'Gestartet — wartet auf Stripe', processing: 'Gestartet — wartet auf Stripe', completed: 'Erstattet — abgeschlossen', failed: 'Fehlgeschlagen', resolved: 'Gelöst ohne Rückzahlung' },
    handle: 'Bearbeiten …', edit: 'Notiz ändern', handled: (n: string, d: string) => `${n ? `Von ${n}` : 'Bearbeitet'}${d ? ` am ${d}` : ''}`,
    copy: 'Kopieren', stripe: 'In Stripe öffnen ↗',
    dlgTitle: 'Rückerstattung bearbeiten', how: 'Wie wird es gelöst?', note: 'Notiz (was wurde gemacht oder vereinbart?)', notePh: 'z. B. Rückzahlung am 15.11. in Stripe angestoßen',
    stripeHint: 'Die Rückzahlung selbst macht ihr in Stripe. Hier speichert ihr nur, dass sie läuft. Eine Stornorechnung entsteht dabei nicht — die erstellt ihr bei Bedarf separat.',
    cancel: 'Abbrechen', save: 'Speichern', saved: 'Gespeichert.',
    storno: 'Stornorechnung erstellen …', stornoTitle: 'Stornorechnung erstellen?', stornoYes: 'Ja, erstellen',
    stornoText: (amt: string, who: string, ws: string) => `Es wird eine Stornorechnung über ${amt} für ${who} (${ws}) erstellt. Sie bekommt eine fortlaufende Nummer und gehört zur Buchhaltung. Nur erstellen, wenn ihr das so entschieden habt.`,
    stornoDone: (n: string) => `Stornorechnung ${n} erstellt.`, stornoLinked: (n: string) => `Es gab schon eine Stornorechnung (${n}) — sie ist jetzt mit der Anfrage verknüpft.`,
    stornoHas: (n: string) => `Stornorechnung ${n || 'erstellt'}`, stornoOpen: 'Im CMS öffnen',
    stornoWait: 'Stornorechnung erst nach dem Abschluss (Betrag der Teilerstattung)',
    markDone: 'Als erstattet markieren …', doneTitle: 'Rückerstattung abschließen', doneYes: 'Abschließen', doneSaved: 'Rückerstattung abgeschlossen.',
    doneText: 'Nur wenn das Geld wirklich zurück ist und Stripe die Anfrage nicht selbst geschlossen hat — z. B. per Überweisung zurückgezahlt oder ein Teilbetrag. Der Platz wird danach wieder frei. Eine Stornorechnung entsteht dabei nicht.',
    amountLbl: 'Erstatteter Betrag (€)', doneNotePh: 'z. B. am 16.11. per Überweisung zurückgezahlt',
    of: (a: string, b: string) => `${a} von ${b} erstattet`,
    res: { refunded: 'Rückzahlung in Stripe gestartet', partial: 'Teilrückzahlung in Stripe gestartet', voucher: 'Gutschein statt Rückzahlung', rebooked: 'Auf anderen Termin umgebucht', declined: 'Abgelehnt', other: 'Andere Lösung' },
  },
  en: {
    title: 'Requests',
    sub: 'Everything customers did through their booking link, and the exceptions you made. Only refunds wait for your decision — you send the money back in Stripe, and Stripe then closes the request by itself. If it went back another way (bank transfer, part of the amount), close it with “Mark as refunded”.',
    open: 'Open', done: 'Done', noneOpen: 'No open refunds.', noneDone: 'Nothing done yet.',
    customer: 'From customers', custSub: 'Done through the booking link: rebooked, voucher code, cancelled, refund requested. Happens automatically under your rules — this is just so you see it.', noneCust: 'Nothing through booking links yet.',
    exceptions: 'Exceptions', excSub: 'What you did outside the rules: moved with less than 14 days to go, gave a seat as a rebooking, opened up a full date.', noneExc: 'No exceptions yet.',
    reason: 'Reason', by: 'by',
    days: (n: number) => `${n} day${n === 1 ? '' : 's'} open`, seat: 'Seat',
    status: { requested: 'Requested', acknowledged: 'Started — waiting for Stripe', processing: 'Started — waiting for Stripe', completed: 'Refunded — closed', failed: 'Failed', resolved: 'Solved without refund' },
    handle: 'Handle…', edit: 'Edit note', handled: (n: string, d: string) => `${n ? `By ${n}` : 'Handled'}${d ? ` on ${d}` : ''}`,
    copy: 'Copy', stripe: 'Open in Stripe ↗',
    dlgTitle: 'Handle refund', how: 'How is it solved?', note: 'Note (what was done or agreed?)', notePh: 'e.g. Refund started in Stripe on 15 Nov',
    stripeHint: 'You send the money back in Stripe yourselves. Here you only record that it is on its way. No Stornorechnung is made by this — create one separately if you decide to.',
    cancel: 'Cancel', save: 'Save', saved: 'Saved.',
    storno: 'Create Stornorechnung…', stornoTitle: 'Create a Stornorechnung?', stornoYes: 'Yes, create it',
    stornoText: (amt: string, who: string, ws: string) => `This creates a Stornorechnung (cancellation invoice) over ${amt} for ${who} (${ws}). It gets the next number in the series and is part of the accounts. Only create it if you have decided so.`,
    stornoDone: (n: string) => `Stornorechnung ${n} created.`, stornoLinked: (n: string) => `A Stornorechnung (${n}) already existed — it is now linked to this request.`,
    stornoHas: (n: string) => `Stornorechnung ${n || 'created'}`, stornoOpen: 'Open in CMS',
    stornoWait: 'Stornorechnung only after closing (partial amount)',
    markDone: 'Mark as refunded…', doneTitle: 'Close the refund', doneYes: 'Close it', doneSaved: 'Refund closed.',
    doneText: 'Only when the money really is back and Stripe has not closed the request itself — e.g. paid back by bank transfer, or part of the amount. The seat becomes free again. No Stornorechnung is made by this.',
    amountLbl: 'Amount refunded (€)', doneNotePh: 'e.g. paid back by bank transfer on 16 Nov',
    of: (a: string, b: string) => `${a} of ${b} refunded`,
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

function StornoDialog({ r, lang, onClose, onDone }: { r: RefundRequestRow; lang: Lang; onClose: () => void; onDone: (msg: string) => void }) {
  const t = T[lang]
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const create = async () => {
    setBusy(true)
    setError('')
    const res = await createRefundCancellationInvoice(r.id)
    setBusy(false)
    if (!res.ok) return setError(res.error)
    onDone(res.existed ? t.stornoLinked(res.number) : t.stornoDone(res.number))
  }
  return (
    <Dlg label={t.stornoTitle} onClose={onClose}>
      <p style={{ margin: '0 0 14px', lineHeight: 1.5 }}>{t.stornoText(fmtMoney(r.refundedAmount ?? r.amount), r.customerName || r.customerEmail, `${r.workshopTitle} · ${r.workshopDate}`)}</p>
      {error && <p className="ff-info" style={{ margin: '0 0 14px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-gold" onClick={create} disabled={busy}>{t.stornoYes}</button>
      </div>
    </Dlg>
  )
}

function DoneDialog({ r, lang, onClose, onDone }: { r: RefundRequestRow; lang: Lang; onClose: () => void; onDone: () => void }) {
  const t = T[lang]
  const [euros, setEuros] = useState((r.amount / 100).toFixed(2).replace('.', ','))
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const save = async () => {
    const cents = Math.round(Number(euros.replace(/\s/g, '').replace(',', '.')) * 100)
    setBusy(true)
    setError('')
    try {
      const res = await markRefundCompleted(r.id, cents, note)
      if (!res.ok) setError(res.error)
      else onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    }
    setBusy(false)
  }
  return (
    <Dlg label={t.doneTitle} onClose={onClose}>
      <h3>{t.doneTitle}</h3>
      <p style={{ margin: '0 0 12px' }}>
        <strong>{r.customerName || r.customerEmail}</strong>
        <br />
        <span className="ff-muted">{r.workshopTitle} · {r.workshopDate} · {fmtMoney(r.amount)}</span>
      </p>
      <p className="ff-muted" style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.5 }}>{t.doneText}</p>
      <label className="ff-field"><span>{t.amountLbl}</span>
        <input className="ff-input" inputMode="decimal" value={euros} onChange={(e) => setEuros(e.target.value)} />
      </label>
      <label className="ff-field" style={{ marginTop: 12 }}><span>{t.note}</span>
        <textarea className="ff-input" rows={3} maxLength={300} value={note} placeholder={t.doneNotePh} onChange={(e) => setNote(e.target.value)} />
      </label>
      {error && <div className="ff-err" style={{ marginTop: 10 }}>{error}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-gold" onClick={save} disabled={busy}>{t.doneYes}</button>
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

/** What customers do themselves through their booking link (plus a date the founders cancelled). */
const CUSTOMER_TYPES = ['booking_rebooked', 'booking_cancelled_no_refund', 'refund_requested', 'refund_completed', 'appointment_cancelled_by_organiser']

type RequestsTab = 'open' | 'customer' | 'exceptions' | 'done'

export function RequestsView({ refundRequests, activityEvents = [], lang = 'de', onRefresh, initialTab = 'open' }: { refundRequests: RefundRequestRow[]; activityEvents?: ActivityEventRow[]; lang?: Lang; onRefresh: () => Promise<void>; initialTab?: RequestsTab }) {
  const t = T[lang]
  const toast = useToast()
  const [tab, setTab] = useState<RequestsTab>(initialTab)
  const [dialog, setDialog] = useState<RefundRequestRow | null>(null)
  const [stornoFor, setStornoFor] = useState<RefundRequestRow | null>(null)
  const [doneFor, setDoneFor] = useState<RefundRequestRow | null>(null)

  const isOpen = (r: RefundRequestRow) => r.status === 'requested' || r.status === 'acknowledged' || r.status === 'processing'
  const open = refundRequests.filter(isOpen).sort((a, b) => b.daysPending - a.daysPending)
  const done = refundRequests.filter((r) => !isOpen(r))
  const rows = tab === 'open' ? open : tab === 'done' ? done : []
  const fromCustomers = activityEvents.filter((e) => CUSTOMER_TYPES.includes(e.type))
  const exceptions = activityEvents.filter((e) => e.type === 'founder_exception')
  const events = tab === 'customer' ? fromCustomers : exceptions

  return (
    <div className="ff-page">
      <PageHeader title={t.title} subtitle={t.sub} />

      <div className="ff-fchips" style={{ padding: '0 0 16px' }} role="group" aria-label={t.title}>
        <button type="button" className="ff-fchip" aria-pressed={tab === 'open'} onClick={() => setTab('open')}>{t.open} <b>{open.length}</b></button>
        <button type="button" className="ff-fchip" aria-pressed={tab === 'customer'} onClick={() => setTab('customer')}>{t.customer} <b>{fromCustomers.length}</b></button>
        <button type="button" className="ff-fchip" aria-pressed={tab === 'exceptions'} onClick={() => setTab('exceptions')}>{t.exceptions} <b>{exceptions.length}</b></button>
        <button type="button" className="ff-fchip" aria-pressed={tab === 'done'} onClick={() => setTab('done')}>{t.done} <b>{done.length}</b></button>
      </div>

      {tab === 'customer' || tab === 'exceptions' ? (
        <section className="ff-panel" style={{ overflow: 'hidden' }}>
          <p className="ff-muted" style={{ margin: 0, padding: '14px 20px', fontSize: 13 }}>{tab === 'customer' ? t.custSub : t.excSub}</p>
          {events.length === 0 ? (
            <p className="ff-muted" style={{ margin: 0, padding: '14px 20px 20px', borderTop: '1px solid var(--ff-line)' }}>{tab === 'customer' ? t.noneCust : t.noneExc}</p>
          ) : (
            events.map((e) => (
              <div key={e.id} className="ff-nrow" style={{ cursor: 'default' }}>
                <span className="ff-nmain">
                  <b>{e.summary}</b>
                  {e.reason && <span style={{ fontSize: 13 }}>{t.reason}: {e.reason}</span>}
                  <small>
                    {TYPE_LABELS[lang][e.type] ?? e.type}
                    {e.actorName ? ` · ${t.by} ${e.actorName}` : ''} · {e.createdAt}
                  </small>
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
                  {r.reason && <div style={{ fontSize: 13, marginTop: 4 }}><b>{t.reason}:</b> {r.reason}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ fontSize: 18 }}>{fmtMoney(r.refundedAmount ?? r.amount)}</b>
                  {r.refundedAmount != null && r.refundedAmount < r.amount && <div className="ff-muted" style={{ fontSize: 12 }}>{t.of(fmtMoney(r.refundedAmount), fmtMoney(r.amount))}</div>}
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
                {r.stornoId ? (
                  <a className="ff-btn is-sm" href={`/admin/collections/cancellation-invoices/${r.stornoId}`} target="_blank" rel="noopener noreferrer" title={t.stornoOpen}>
                    {t.stornoHas(r.stornoNumber)} ↗
                  </a>
                ) : (
                  r.status !== 'requested' &&
                  (r.resolution === 'partial' && r.refundedAmount == null ? (
                    <span className="ff-muted" style={{ fontSize: 12 }}>{t.stornoWait}</span>
                  ) : (
                    <button type="button" className="ff-btn is-sm" onClick={() => setStornoFor(r)}>{t.storno}</button>
                  ))
                )}
                {(r.status === 'acknowledged' || r.status === 'processing') && (r.resolution === 'refunded' || r.resolution === 'partial') && (
                  <button type="button" className="ff-btn is-sm" style={{ marginLeft: 'auto' }} onClick={() => setDoneFor(r)}>{t.markDone}</button>
                )}
                {isOpen(r) && (
                  <button type="button" className="ff-btn is-gold" style={{ marginLeft: r.status === 'requested' || !(r.resolution === 'refunded' || r.resolution === 'partial') ? 'auto' : undefined }} onClick={() => setDialog(r)}>
                    {r.resolution ? t.edit : t.handle}
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {stornoFor && <StornoDialog r={stornoFor} lang={lang} onClose={() => setStornoFor(null)} onDone={async (msg) => { setStornoFor(null); toast(msg); await onRefresh() }} />}
      {doneFor && <DoneDialog r={doneFor} lang={lang} onClose={() => setDoneFor(null)} onDone={async () => { setDoneFor(null); toast(t.doneSaved); await onRefresh() }} />}
      {dialog && <RefundDialog r={dialog} lang={lang} onClose={() => setDialog(null)} onDone={async () => { setDialog(null); toast(t.saved); await onRefresh() }} />}
    </div>
  )
}
