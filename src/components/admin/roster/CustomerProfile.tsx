'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { bookingOrigin } from './bookingOrigin'
import { getCustomerProfile, type CustomerProfile, type ProfileEvent } from './profileActions'
import type { Lang } from './rosterI18n'
import { seatStatusLabel } from './seatStatusLabels'
import type { BookingRow } from './types'

const T = {
  de: {
    openWs: 'Workshop-Termin öffnen', back: '← Zurück zur Liste', close: 'Schließen', loading: 'Wird geladen…', failed: 'Konnte nicht geladen werden.',
    since: 'Kund:in seit', account: 'Hat ein Konto', noAccount: 'Kein Konto (Gast)', noEmail: 'Keine E-Mail hinterlegt',
    scopedNote: 'Nur diese Buchung und alles, was dazugehört (Gutschein, Bestellung, Umbuchungen, Links).', fullProfile: 'Ganzes Profil ansehen',
    bookings: 'Buchungen', orders: 'Käufe', vouchers: 'Gutscheine', history: 'Verlauf', links: 'Verwaltungs-Links', refunds: 'Erstattungen',
    none: 'Nichts vorhanden.', seats: (n: number) => (n === 1 ? '1 Platz' : `${n} Plätze`), bookedOn: 'gebucht am',
    payment: 'Bezahlt', order: 'Bestellung', invoice: 'Rechnung', usedVoucher: 'Mit Gutschein bezahlt', origin: 'Herkunft',
    role: { bought: 'gekauft', received: 'erhalten', used: 'zum Bezahlen benutzt' },
    pay: { stripe: 'Stripe (Karte)', voucher: 'Gutschein', manual: 'Zahlung nicht erfasst', wix: 'In Wix bezahlt', none: 'Kein Beleg' } as Record<string, string>,
    origins: { website: 'Online', manual: 'Manuell eingetragen', wix: 'Wix-Import', unmarked: 'Ohne Beleg' } as Record<string, string>,
    code: 'Code', value: 'Wert', status: 'Status', redeemedOn: 'eingelöst am', forWs: 'für', from: 'von', to: 'für',
    sent: 'verschickt', opened: 'geöffnet', notOpened: 'noch nicht geöffnet', expires: 'gültig bis',
    scope: { 'self-service': 'Verwaltungs-Link', 'date-offer': 'Neuen Termin wählen', 'organiser-cancellation': 'Nach Absage durch uns' } as Record<string, string>,
    filters: { all: 'Alles', booking: 'Buchung', team: 'Team', customer: 'Kund:in', link: 'Links', email: 'E-Mails', order: 'Käufe', voucher: 'Gutscheine', refund: 'Erstattungen', note: 'Notizen' } as Record<string, string>,
    emailsNote: 'E-Mails: hier stehen die, die das System selbst aufgeschrieben hat (Erinnerungen, Termin-Angebote, Verschiebungen).',
    flow: 'Verlauf (neueste zuerst, wird automatisch geschrieben)', earlier: 'frühere Buchung',
    st: { confirmed: 'Bestätigt', pending: 'Ausstehend', cancelled: 'Storniert' } as Record<string, string>,
  },
  en: {
    openWs: 'Open this workshop date', back: '← Back to list', close: 'Close', loading: 'Loading…', failed: 'Could not be loaded.',
    since: 'Customer since', account: 'Has an account', noAccount: 'No account (guest)', noEmail: 'No email on file',
    scopedNote: 'Only this booking and everything that belongs to it (voucher, order, rebookings, links).', fullProfile: 'View full profile',
    bookings: 'Bookings', orders: 'Purchases', vouchers: 'Vouchers', history: 'History', links: 'Management links', refunds: 'Refunds',
    none: 'Nothing here.', seats: (n: number) => (n === 1 ? '1 seat' : `${n} seats`), bookedOn: 'booked on',
    payment: 'Paid', order: 'Order', invoice: 'Invoice', usedVoucher: 'Paid with voucher', origin: 'Source',
    role: { bought: 'bought', received: 'received', used: 'used to pay' },
    pay: { stripe: 'Stripe (card)', voucher: 'Voucher', manual: 'Payment not recorded', wix: 'Paid in Wix', none: 'No receipt' } as Record<string, string>,
    origins: { website: 'Online', manual: 'Added by hand', wix: 'Wix import', unmarked: 'No receipt' } as Record<string, string>,
    code: 'Code', value: 'Value', status: 'Status', redeemedOn: 'redeemed on', forWs: 'for', from: 'from', to: 'for',
    sent: 'sent', opened: 'opened', notOpened: 'not opened yet', expires: 'valid until',
    scope: { 'self-service': 'Management link', 'date-offer': 'Choose a new date', 'organiser-cancellation': 'After cancellation by us' } as Record<string, string>,
    filters: { all: 'All', booking: 'Booking', team: 'Team', customer: 'Customer', link: 'Links', email: 'Emails', order: 'Purchases', voucher: 'Vouchers', refund: 'Refunds', note: 'Notes' } as Record<string, string>,
    emailsNote: 'Emails: these are the ones the system recorded itself (reminders, date offers, moves).',
    flow: 'History (newest first, written automatically)', earlier: 'earlier booking',
    st: { confirmed: 'Confirmed', pending: 'Pending', cancelled: 'Cancelled' } as Record<string, string>,
  },
}

const LOCALE = { de: 'de-DE', en: 'en-GB' } as const
const ICON: Record<ProfileEvent['kind'], string> = {
  booking: '📅', team: '👤', customer: '🙋', link: '🔗', order: '🧾', voucher: '🎟️', refund: '💶', email: '✉️', note: '💬',
}
const fmt = (iso: string, lang: Lang, time = true) =>
  iso
    ? new Date(iso).toLocaleString(LOCALE[lang], {
        day: 'numeric', month: 'short', year: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}), timeZone: 'Europe/Vienna',
      })
    : ''
const eur = (n: number) => `€ ${n.toFixed(2)}`

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 15, margin: '0 0 10px' }}>
        {title}
        {count !== undefined && <span className="ff-muted" style={{ fontWeight: 400 }}> · {count}</span>}
      </h2>
      {children}
    </section>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div className="ff-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontSize: 14, overflowWrap: 'anywhere' }}>{children}</div>
    </div>
  )
}

function BookingCard({ b, p, lang, t, onOpenWorkshop }: { b: BookingRow; p: CustomerProfile; lang: Lang; t: (typeof T)['de']; onOpenWorkshop?: (appointmentId: string) => void }) {
  const origin = bookingOrigin(b)
  const order = p.orders.find((o) => o.id === b.orderId)
  const usedCodes = order?.voucherCodes ?? []
  const used = p.vouchers.filter((v) => usedCodes.includes(v.code))
  const links = p.links.filter((l) => l.bookingId === b.id)
  const refunds = p.refunds.filter((r) => r.bookingId === b.id)
  const seats = Array.from({ length: Math.max(b.guestCount, 1) }, (_, i) => {
    const s = b.seats[i]
    return {
      i,
      name: s?.recipientName || (i === 0 ? [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email : ''),
      status: s?.seatStatus || 'active',
      note: s?.giftNote || (i === 0 ? b.notes.replace(/\[Wix Import[^\]]*\]/gi, '').trim() : ''),
    }
  })
  return (
    <div className="ff-panel" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          {onOpenWorkshop && b.appointmentId ? (
            <button type="button" className="ff-namebtn" style={{ fontSize: 15 }} onClick={() => onOpenWorkshop(b.appointmentId as string)} title={t.openWs}>
              {b.workshopTitle} →
            </button>
          ) : (
            <b style={{ fontSize: 15 }}>{b.workshopTitle}</b>
          )}
          <div className="ff-muted" style={{ fontSize: 13 }}>{b.date} · {b.time} · {t.seats(b.guestCount)} · {eur(b.totalPrice)}</div>
        </div>
        <div className="ff-chips" style={{ alignSelf: 'flex-start' }}>
          <span className="ff-pill neu">{t.origins[origin]}</span>
          {b.payment && <span className="ff-pill gold">{t.pay[b.payment]}</span>}
        </div>
      </div>

      <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
        {seats.map((s) => {
          const st = seatStatusLabel(s.status)
          return (
            <div key={s.i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span>{s.name || `${lang === 'de' ? 'Platz' : 'Seat'} ${s.i + 1}`}</span>
              <span className="ff-pill neu">{st.label}</span>
              {s.note && <span className="ff-allergy">{s.note}</span>}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <Fact label={t.bookedOn}>{fmt(b.createdAt, lang, false)}</Fact>
        {order && (
          <Fact label={t.order}>
            {order.invoiceNumber}
            {order.hasInvoice && (
              <>
                {' · '}
                <a className="ff-link" href={`/api/admin/orders/${order.id}/receipt`} target="_blank" rel="noopener">{t.invoice}</a>
              </>
            )}
          </Fact>
        )}
        {used.map((v) => (
          <Fact key={v.id} label={t.usedVoucher}>
            <b>{v.code}</b> · {eur(v.value)}
            <div className="ff-muted" style={{ fontSize: 12 }}>
              {v.purchaser && `${t.from} ${v.purchaser}`}
              {v.createdAt && ` · ${t.bookedOn} ${fmt(v.createdAt, lang, false)}`}
            </div>
          </Fact>
        ))}
        {usedCodes.filter((c) => !used.some((v) => v.code === c)).map((c) => (
          <Fact key={c} label={t.usedVoucher}><b>{c}</b></Fact>
        ))}
      </div>

      {(links.length > 0 || refunds.length > 0) && (
        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {links.map((l) => (
            <span key={l.id} className={`ff-pill ${l.openedAt ? 'ok' : 'neu'}`}>
              🔗 {t.scope[l.scope] ?? l.scope}: {t.sent} {fmt(l.issuedAt, lang, false)}, {l.openedAt ? `${t.opened} ${fmt(l.openedAt, lang, false)}` : t.notOpened}
            </span>
          ))}
          {refunds.map((r) => (
            <span key={r.id} className="ff-pill warn">💶 {t.refunds}: {r.status} · {eur(r.amount / 100)}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileBody({ p, lang, onOpenProfile, onOpenWorkshop }: { p: CustomerProfile; lang: Lang; onOpenProfile?: (email: string) => void; onOpenWorkshop?: (appointmentId: string) => void }) {
  const t = T[lang]
  const [filter, setFilter] = useState('all')
  const kinds = useMemo(() => [...new Set(p.events.map((e) => e.kind))], [p.events])
  const events = filter === 'all' ? p.events : p.events.filter((e) => e.kind === filter)
  const multiple = p.bookings.length > 1

  return (
    <>
      <div className="ff-panel" style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        <Fact label="E-Mail">
          {p.email ? <a className="ff-link" href={`mailto:${p.email}`}>{p.email}</a> : <span style={{ color: 'var(--ff-warn-fg)' }}>⚠ {t.noEmail}</span>}
        </Fact>
        <Fact label={lang === 'de' ? 'Telefon' : 'Phone'}>{p.phone || '—'}</Fact>
        <Fact label={t.since}>{fmt(p.customerSince, lang, false) || '—'}</Fact>
        <Fact label="Konto">
          <span className={`ff-pill ${p.hasAccount ? 'ok' : 'neu'}`}>{p.hasAccount ? t.account : t.noAccount}</span>
        </Fact>
      </div>

      {p.scoped && (
        <div className="ff-info" style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{t.scopedNote}</span>
          {onOpenProfile && p.email && (
            <button type="button" className="ff-btn is-sm" onClick={() => onOpenProfile(p.email)}>{t.fullProfile}</button>
          )}
        </div>
      )}

      <Section title={t.bookings} count={p.bookings.length}>
        <div style={{ display: 'grid', gap: 12 }}>
          {p.bookings.length === 0 ? <p className="ff-muted">{t.none}</p> : p.bookings.map((b) => <BookingCard key={b.id} b={b} p={p} lang={lang} t={t} onOpenWorkshop={onOpenWorkshop} />)}
        </div>
      </Section>

      <Section title={t.orders} count={p.orders.length}>
        {p.orders.length === 0 ? (
          <p className="ff-muted">{t.none}</p>
        ) : (
          <div className="ff-panel" style={{ overflow: 'hidden' }}>
            {p.orders.map((o) => (
              <div key={o.id} style={{ display: 'flex', gap: 12, justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--ff-line)', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <b>{o.invoiceNumber}</b> <span className="ff-muted">· {fmt(o.createdAt, lang, false)}</span>
                  <div className="ff-muted" style={{ fontSize: 13 }}>{o.what}{o.voucherCodes.length ? ` · ${t.usedVoucher} ${o.voucherCodes.join(', ')}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b>{eur(o.amount / 100)}</b>
                  <div>
                    <span className="ff-pill neu">{o.status || '—'}</span>
                    {o.hasInvoice && <> <a className="ff-link" style={{ fontSize: 12 }} href={`/api/admin/orders/${o.id}/receipt`} target="_blank" rel="noopener">{t.invoice}</a></>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={t.vouchers} count={p.vouchers.length}>
        {p.vouchers.length === 0 ? (
          <p className="ff-muted">{t.none}</p>
        ) : (
          <div className="ff-panel" style={{ overflow: 'hidden' }}>
            {p.vouchers.map((v) => (
              <div key={v.id} style={{ padding: '10px 16px', borderTop: '1px solid var(--ff-line)' }}>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <span><b>{v.code}</b> · {eur(v.value)} <span className="ff-pill gold">{t.role[v.role]}</span></span>
                  <span className={`ff-pill ${v.redeemed ? 'neu' : 'ok'}`}>{v.redeemed ? `${t.redeemedOn} ${fmt(v.redeemedOn, lang, false)}` : v.status || 'aktiv'}</span>
                </div>
                <div className="ff-muted" style={{ fontSize: 13 }}>
                  {fmt(v.createdAt, lang, false)}
                  {v.purchaser && ` · ${t.from} ${v.purchaser}`}
                  {v.recipient && ` · ${t.to} ${v.recipient}`}
                  {v.redeemedForWorkshop && ` · ${t.forWs} ${v.redeemedForWorkshop}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={t.history} count={p.events.length}>
        <p className="ff-muted" style={{ margin: '0 0 8px', fontSize: 12 }}>{t.flow}. {t.emailsNote}</p>
        <div className="ff-chips" style={{ marginBottom: 10 }}>
          {['all', ...kinds].map((k) => (
            <button key={k} type="button" className={`ff-btn is-sm${filter === k ? ' is-gold' : ''}`} onClick={() => setFilter(k)}>{t.filters[k] ?? k}</button>
          ))}
        </div>
        <div className="ff-panel" style={{ overflow: 'hidden' }}>
          {events.length === 0 && <p className="ff-muted" style={{ padding: 16, margin: 0 }}>{t.none}</p>}
          {events.map((e) => (
            <div key={e.id} style={{ display: 'flex', gap: 10, padding: '10px 16px', borderTop: '1px solid var(--ff-line)' }}>
              <span aria-hidden style={{ width: 22, flexShrink: 0 }}>{ICON[e.kind]}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <b style={{ fontSize: 13 }}>{e.title}</b>
                <div className="ff-muted" style={{ fontSize: 12 }}>
                  {fmt(e.at, lang)}
                  {e.by && ` · ${e.by}`}
                  {multiple && e.context && ` · ${e.context}`}
                </div>
                {e.summary && <div style={{ fontSize: 13, marginTop: 2, overflowWrap: 'anywhere' }}>{e.summary}</div>}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

function useProfile(email: string | undefined, bookingId: string | undefined) {
  const [state, setState] = useState<{ p: CustomerProfile | null; error: boolean }>({ p: null, error: false })
  useEffect(() => {
    let live = true
    setState({ p: null, error: false })
    getCustomerProfile({ email, bookingId })
      .then((p) => live && setState({ p, error: false }))
      .catch(() => live && setState({ p: null, error: true }))
    return () => {
      live = false
    }
  }, [email, bookingId])
  return state
}

/** Full page: everything about one person. Opened from Teilnehmer. */
export function CustomerProfilePage({ email, lang, onBack, onOpenWorkshop }: { email: string; lang: Lang; onBack: () => void; onOpenWorkshop?: (appointmentId: string) => void }) {
  const t = T[lang]
  const { p, error } = useProfile(email, undefined)
  return (
    <div className="ff-page">
      <button type="button" className="ff-btn is-sm ff-noprint" onClick={onBack}>{t.back}</button>
      <h1 style={{ fontSize: 28, margin: '16px 0 18px' }}>{p?.name || email}</h1>
      {error && <div className="ff-err">{t.failed}</div>}
      {!p && !error && <p className="ff-muted">{t.loading}</p>}
      {p && <ProfileBody p={p} lang={lang} onOpenWorkshop={onOpenWorkshop} />}
    </div>
  )
}

/** Popup: one booking only (what this person did for this workshop). Opened from the day sheet. */
export function CustomerProfileModal({
  bookingId, title, lang, onClose, onOpenProfile, onOpenWorkshop,
}: { bookingId: string; title: string; lang: Lang; onClose: () => void; onOpenProfile?: (email: string) => void; onOpenWorkshop?: (appointmentId: string) => void }) {
  const t = T[lang]
  const { p, error } = useProfile(undefined, bookingId)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="ff-modal" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ff-dlg is-wide" style={{ maxWidth: 860 }} role="dialog" aria-modal="true" aria-label={title}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{p?.name || title}</h3>
          <button type="button" className="ff-btn is-sm" onClick={onClose}>{t.close}</button>
        </div>
        {error && <div className="ff-err">{t.failed}</div>}
        {!p && !error && <p className="ff-muted">{t.loading}</p>}
        {p && <ProfileBody p={p} lang={lang} onOpenProfile={onOpenProfile} onOpenWorkshop={onOpenWorkshop} />}
      </div>
    </div>
  )
}
