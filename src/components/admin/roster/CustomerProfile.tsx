'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { bookingOrigin, noteHints } from './bookingOrigin'
import { MP } from './ManualPayment'
import { getCustomerProfile, type CustomerProfile, type ProfileEvent } from './profileActions'
import type { Lang } from './rosterI18n'
import { seatStatusLabel } from './seatStatusLabels'
import type { BookingRow } from './types'
import { kindColor } from './workshopKind'

const T = {
  de: {
    manualBadge: 'Manuell eingetragen', allOfPerson: 'Alles von dieser Person', onlyThisDate: 'Nur dieser Termin', thisDate: 'Dieser Termin', openWs: 'Workshop öffnen', back: '← Zurück zur Liste', close: 'Schließen', loading: 'Wird geladen…', failed: 'Konnte nicht geladen werden.',
    since: 'Kund:in seit', account: 'Hat ein Konto', noAccount: 'Kein Konto (Gast)', noEmail: 'Keine E-Mail hinterlegt',
    scopedNote: 'Nur diese Buchung und alles, was dazugehört (Gutschein, Bestellung, Umbuchungen, Links).', fullProfile: 'Ganzes Profil ansehen',
    bookings: 'Buchungen', orders: 'Käufe', vouchers: 'Gutscheine', history: 'Verlauf', links: 'Verwaltungs-Links', refunds: 'Erstattungen',
    none: 'Nichts vorhanden.', seats: (n: number) => (n === 1 ? '1 Platz' : `${n} Plätze`), bookedOn: 'gebucht am',
    payment: 'Bezahlt', order: 'Bestellung', invoice: 'Rechnung', usedVoucher: 'Mit Gutschein bezahlt', origin: 'Herkunft',
    role: { bought: 'gekauft', received: 'erhalten', used: 'zum Bezahlen benutzt' },
    pay: { stripe: 'Stripe (Karte)', mixed: 'Bezahlt + Gutschein', voucher: 'Gutschein', manual: 'Zahlung nicht erfasst', wix: 'In Wix bezahlt', none: 'Kein Beleg' } as Record<string, string>,
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
    manualBadge: 'Added manually', allOfPerson: 'Everything of this person', onlyThisDate: 'Only this date', thisDate: 'This date', openWs: 'Open workshop', back: '← Back to list', close: 'Close', loading: 'Loading…', failed: 'Could not be loaded.',
    since: 'Customer since', account: 'Has an account', noAccount: 'No account (guest)', noEmail: 'No email on file',
    scopedNote: 'Only this booking and everything that belongs to it (voucher, order, rebookings, links).', fullProfile: 'View full profile',
    bookings: 'Bookings', orders: 'Purchases', vouchers: 'Vouchers', history: 'History', links: 'Management links', refunds: 'Refunds',
    none: 'Nothing here.', seats: (n: number) => (n === 1 ? '1 seat' : `${n} seats`), bookedOn: 'booked on',
    payment: 'Paid', order: 'Order', invoice: 'Invoice', usedVoucher: 'Paid with voucher', origin: 'Source',
    role: { bought: 'bought', received: 'received', used: 'used to pay' },
    pay: { stripe: 'Stripe (card)', mixed: 'Paid + voucher', voucher: 'Voucher', manual: 'Payment not recorded', wix: 'Paid in Wix', none: 'No receipt' } as Record<string, string>,
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
const PATHS: Record<string, React.ReactNode> = {
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  userCheck: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m16 11 2 2 4-4" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  receipt: <><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .67V2l-1 .67L17 2l-3 2-3-2-3 2-3-2z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  ticket: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><path d="M13 5v2M13 17v2M13 11v2" /></>,
  euro: <><path d="M18 7a6 6 0 0 0-9.5 1M18 17a6 6 0 0 1-9.5-1" /><path d="M5 10h9M5 14h9" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  repeat: <><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></>,
  alert: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l4 2" /></>,
  pencil: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
}
function Ico({ n, size = 16 }: { n: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="ff-ico">
      {PATHS[n] ?? PATHS.calendar}
    </svg>
  )
}
const KIND_ICON: Record<ProfileEvent['kind'], string> = {
  booking: 'calendar', team: 'user', customer: 'userCheck', link: 'link', order: 'receipt', voucher: 'ticket', refund: 'euro', email: 'mail', note: 'message',
}
const fmt = (iso: string, lang: Lang, time = true) =>
  iso
    ? new Date(iso).toLocaleString(LOCALE[lang], {
        day: 'numeric', month: 'short', year: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}), timeZone: 'Europe/Vienna',
      })
    : ''
const eur = (n: number) => `€ ${n.toFixed(2)}`

function Section({ title, count, icon, children }: { title: string; count?: number; icon: string; children: React.ReactNode }) {
  return (
    <section className="ff-psec">
      <h2 className="ff-psech">
        <span className="ff-psecico"><Ico n={icon} size={17} /></span>
        {title}
        {count !== undefined && <span className="ff-psecn">{count}</span>}
      </h2>
      {children}
    </section>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ff-fact">
      <div className="ff-factl">{label}</div>
      <div className="ff-factv">{children}</div>
    </div>
  )
}

function BookingCard({ b, p, lang, t, focus, onOpenWorkshop }: { b: BookingRow; p: CustomerProfile; lang: Lang; t: (typeof T)['de']; focus?: boolean; onOpenWorkshop?: (appointmentId: string) => void }) {
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
      note: s?.giftNote || (i === 0 ? b.notes.replace(/\[Wix[^\]]*\]/gi, '').trim() : ''),
    }
  })
  const de = lang === 'de'
  const m = b.manual && (b.manual.channel || b.manual.paymentStatus || b.manual.paymentMethod || b.manual.paymentNote || b.manual.voucherCode) ? b.manual : null
  // How it was paid: stored on the booking if entered by hand, otherwise read from the order.
  // A voucher can cover only some of the seats: voucher used AND something paid by card in the same order.
  const orderBookings = order ? p.bookings.filter((x) => x.orderId === order.id) : []
  const orderTotal = orderBookings.reduce((sum, x) => sum + x.totalPrice, 0)
  const paidEur = order ? order.amount / 100 : 0
  const mixed = !!order && usedCodes.length > 0 && order.amount > 0
  const voucherEur = mixed ? Math.max(0, orderTotal - paidEur) : 0
  const perSeat = b.pricePerPerson || 0
  const soloOrder = orderBookings.length === 1
  const voucherSeats = mixed && soloOrder && perSeat > 0 && Math.abs(voucherEur / perSeat - Math.round(voucherEur / perSeat)) < 0.01 ? Math.round(voucherEur / perSeat) : null
  const voucherFrom = used.map((v) => v.purchaser).filter(Boolean)[0] ?? ''
  const voucherLabel = `${usedCodes.join(', ')}${voucherFrom ? `${de ? ', gekauft von ' : ', bought by '}${voucherFrom}` : ''}`
  // Say what THIS person paid; the voucher was bought (and invoiced) by someone else.
  const mixText = mixed
    ? voucherSeats !== null && voucherSeats > 0 && voucherSeats < b.guestCount
      ? `${t.seats(b.guestCount - voucherSeats)} ${de ? 'bezahlt' : 'paid'} (${eur(paidEur)}) · ${t.seats(voucherSeats)} ${de ? 'mit Gutschein' : 'with voucher'} (${voucherLabel})`
      : `${de ? 'Bezahlt' : 'Paid'} ${eur(paidEur)} + ${de ? 'Gutschein' : 'voucher'} ${voucherLabel}`
    : ''
  const payKey = mixed ? 'mixed' : b.payment && b.payment !== 'none' ? b.payment : order ? (order.amount > 0 ? 'stripe' : 'voucher') : origin === 'wix' ? 'wix' : undefined
  const sourceParts: string[] = []
  if (origin === 'website') {
    sourceParts.push(t.origins.website)
    if (payKey) sourceParts.push(t.pay[payKey] ?? payKey)
    if (usedCodes.length && !mixed) sourceParts.push(`${t.usedVoucher}: ${usedCodes.join(', ')}`)
  } else if (origin === 'wix') {
    sourceParts.push(t.origins.wix)
  } else if (m) {
    sourceParts.push(MP[lang].channels[m.channel] ?? m.channel)
    sourceParts.push(m.paymentStatus === 'open' ? (de ? 'Zahlung offen' : 'Payment open') : m.paymentStatus === 'paid' ? (de ? 'Bezahlt' : 'Paid') : '')
    sourceParts.push(MP[lang].methods[m.paymentMethod] ?? m.paymentMethod)
    sourceParts.push(m.voucherCode)
  } else {
    const h = noteHints(b.notes, lang)
    sourceParts.push(origin === 'manual' ? t.origins.manual : t.origins.unmarked, ...h.source, ...(h.pay.length ? h.pay : [t.pay.manual]))
  }
  for (let i = sourceParts.length - 1; i >= 0; i--) if (!sourceParts[i]) sourceParts.splice(i, 1)
  return (
    <div className={`ff-panel ff-pbook${focus ? ' is-focus' : ''}`} style={{ ['--c' as string]: kindColor(b.workshopTitle) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <b style={{ fontSize: 16, fontFamily: 'var(--ff-display)' }}>{b.workshopTitle}</b>{focus && <span className="ff-pill gold" style={{ marginLeft: 8 }}>{t.thisDate}</span>}
          <div className="ff-muted" style={{ fontSize: 13 }}>{b.date} · {b.time} · {t.seats(b.guestCount)} · {mixed ? `${eur(paidEur)} ${de ? 'bezahlt' : 'paid'}` : eur(b.totalPrice)}</div>
          {mixText && (
            <div className="ff-mixline">
              <Ico n="ticket" size={14} />
              <span>{mixText}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="ff-chips">
            {origin === 'manual' && <span className="ff-manual">✎ {t.manualBadge}</span>}
            {/* One pill per source: Wix = "Wix import" only; online = how it was paid (Stripe / voucher). */}
            {origin === 'wix' && <span className="ff-pill neu">{t.origins.wix}</span>}
            {origin === 'website' && <span className="ff-pill gold">{payKey ? t.pay[payKey] : t.origins.website}</span>}
            {origin === 'unmarked' && <span className="ff-pill neu">{t.origins.unmarked}</span>}
            {(origin === 'manual' || origin === 'unmarked') && b.payment && b.payment !== 'none' && <span className="ff-pill gold">{t.pay[b.payment]}</span>}
          </div>
          {onOpenWorkshop && b.appointmentId && (
            <button type="button" className="ff-btn is-sm is-tint" onClick={() => onOpenWorkshop(b.appointmentId as string)} title={t.openWs}>
              {t.openWs} →
            </button>
          )}
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
        {origin === 'manual' && (() => {
          const entry = b.history.find((h) => h.type === 'created_manual')
          return entry?.by && entry.by !== 'System' ? <Fact label={t.manualBadge}>{entry.by}{entry.at ? ` · ${fmt(entry.at, lang, false)}` : ''}</Fact> : null
        })()}
        <Fact label={lang === 'de' ? 'Quelle & Zahlung' : 'Source & payment'}>
          {sourceParts.join(' · ') || '—'}
          {b.manual?.paymentNote && <div className="ff-muted" style={{ fontSize: 12 }}>{b.manual.paymentNote}</div>}
        </Fact>
        {(b.manual?.paymentMethod === 'rebooking' || b.history.some((h) => h.type === 'created_rebooking')) && (
          <Fact label={lang === 'de' ? 'Herkunft' : 'Origin'}><span className="ff-inl"><Ico n="repeat" size={14} /> {lang === 'de' ? 'Kommt aus einer Umbuchung' : 'Comes from a rebooking'}</span></Fact>
        )}
        {origin === 'unmarked' && (() => {
          const h = noteHints(b.notes, lang)
          return h.source.length + h.pay.length ? <Fact label={lang === 'de' ? 'Laut Notiz' : 'According to the note'}>{[...h.source, ...h.pay].join(' · ')}</Fact> : null
        })()}
        {b.notes.replace(/\[Wix[^\]]*\]/gi, '').trim() && (
          <Fact label={lang === 'de' ? 'Notiz zur Buchung' : 'Booking note'}>{b.notes.replace(/\[Wix[^\]]*\]/gi, '').trim()}</Fact>
        )}
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
            <span key={l.id} className={`ff-pill ff-pillico ${l.openedAt ? 'ok' : 'neu'}`}>
              <Ico n="link" size={12} /> {t.scope[l.scope] ?? l.scope}: {t.sent} {fmt(l.issuedAt, lang, false)}, {l.openedAt ? `${t.opened} ${fmt(l.openedAt, lang, false)}` : t.notOpened}
            </span>
          ))}
          {refunds.map((r) => (
            <span key={r.id} className="ff-pill ff-pillico warn"><Ico n="euro" size={12} /> {t.refunds}: {r.status} · {eur(r.amount / 100)}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProfileBody({ p, lang, onOpenProfile, onOpenWorkshop, hideName }: { hideName?: boolean; p: CustomerProfile; lang: Lang; onOpenProfile?: (email: string) => void; onOpenWorkshop?: (appointmentId: string) => void }) {
  const t = T[lang]
  const [filter, setFilter] = useState('all')
  const kinds = useMemo(() => [...new Set(p.events.map((e) => e.kind))], [p.events])
  const events = filter === 'all' ? p.events : p.events.filter((e) => e.kind === filter)
  const multiple = p.bookings.length > 1

  const totalSpent = p.orders.reduce((sum, o) => sum + o.amount, 0) / 100
  return (
    <>
      <div className="ff-phero">
        <div className="ff-phtop">
          <span className="ff-phav" aria-hidden>{(p.name || p.email || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')}</span>
          <div className="ff-phid">
            {!hideName && <h1>{p.name || p.email}</h1>}
            <span className={`ff-phacc${p.hasAccount ? ' is-yes' : ''}`}>
              <Ico n={p.hasAccount ? 'userCheck' : 'user'} size={14} />
              {p.hasAccount ? t.account : t.noAccount}
            </span>
            {!p.hasAccount && <small>{lang === 'de' ? 'Kein Shop-Konto: wir kennen nur die Buchungsdaten.' : 'No shop account: we only know the booking details.'}</small>}
          </div>
        </div>
        <span className="ff-phsince">
          <Ico n="clock" size={14} />
          {t.since} {fmt(p.customerSince, lang, false) || '—'}
        </span>
        <ul className="ff-phcontact">
          <li>
            <Ico n="mail" />
            {p.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : <span className="is-warn"><Ico n="alert" size={14} /> {t.noEmail}</span>}
          </li>
          <li><Ico n="phone" />{p.phone ? <a href={`tel:${p.phone.replace(/\s+/g, '')}`}>{p.phone}</a> : <span className="is-dim">—</span>}</li>
        </ul>
        <div className="ff-phstats">
          <div><b>{p.bookings.length}</b><span>{t.bookings} · {t.seats(p.bookings.reduce((n, x) => n + Math.max(x.guestCount, 1), 0))}</span></div>
          <div><b>{eur(totalSpent)}</b><span>{lang === 'de' ? 'Käufe gesamt' : 'Total purchases'}</span></div>
          <div><b>{p.vouchers.length}</b><span>{t.vouchers}</span></div>
        </div>
      </div>

      {p.scoped && (
        <div className="ff-info" style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{t.scopedNote}</span>
          {onOpenProfile && p.email && (
            <button type="button" className="ff-btn is-sm" onClick={() => onOpenProfile(p.email)}>{t.fullProfile}</button>
          )}
        </div>
      )}

      <Section title={t.bookings} count={p.bookings.length} icon="calendar">
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'minmax(0, 1fr)' }}>
          {p.bookings.length === 0 ? <p className="ff-muted">{t.none}</p> : [...p.bookings].sort((a, c) => Number(c.id === p.focusBookingId) - Number(a.id === p.focusBookingId)).map((b) => <BookingCard key={b.id} b={b} p={p} lang={lang} t={t} focus={b.id === p.focusBookingId} onOpenWorkshop={onOpenWorkshop} />)}
        </div>
      </Section>

      <Section title={t.orders} count={p.orders.length} icon="receipt">
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

      <Section title={t.vouchers} count={p.vouchers.length} icon="ticket">
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

      <Section title={t.history} count={p.events.length} icon="history">
        <p className="ff-muted" style={{ margin: '0 0 10px', fontSize: 12.5 }}>{t.flow}. {t.emailsNote}</p>
        <div className="ff-tlfilter">
          {['all', ...kinds].map((k) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {k !== 'all' && <Ico n={KIND_ICON[k as ProfileEvent['kind']]} size={13} />}
              {t.filters[k] ?? k}
              <b>{k === 'all' ? p.events.length : p.events.filter((e) => e.kind === k).length}</b>
            </button>
          ))}
        </div>
        {events.length === 0 && <p className="ff-muted">{t.none}</p>}
        <ol className="ff-tl">
          {events.map((e, i) => {
            const day = fmt(e.at, lang, false)
            const newDay = i === 0 || fmt(events[i - 1]!.at, lang, false) !== day
            return (
              <React.Fragment key={e.id}>
                {newDay && <li className="ff-tlday" aria-hidden>{day}</li>}
                <li className={`ff-tli k-${e.kind}`}>
                  <span className="ff-tlnode"><Ico n={KIND_ICON[e.kind]} size={15} /></span>
                  <div className="ff-tlbody">
                    <div className="ff-tlhead">
                      <b>{e.title}</b>
                      <span>
                        {new Date(e.at).toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna' })}
                        {e.by && ` · ${e.by}`}
                      </span>
                    </div>
                    {multiple && e.context && <span className="ff-tlctx">{e.context}</span>}
                    {e.summary && <div className="ff-tlsum">{e.summary}</div>}
                  </div>
                </li>
              </React.Fragment>
            )
          })}
        </ol>
      </Section>
    </>
  )
}

function useProfile(email: string | undefined, bookingId: string | undefined, full = false) {
  const [state, setState] = useState<{ p: CustomerProfile | null; error: boolean }>({ p: null, error: false })
  useEffect(() => {
    let live = true
    setState({ p: null, error: false })
    getCustomerProfile({ email, bookingId, full })
      .then((p) => live && setState({ p, error: false }))
      .catch(() => live && setState({ p: null, error: true }))
    return () => {
      live = false
    }
  }, [email, bookingId, full])
  return state
}

/** Full page: everything about one person. Opened from Teilnehmer. */
export function CustomerProfilePage({ email, lang, onBack, onOpenWorkshop }: { email: string; lang: Lang; onBack: () => void; onOpenWorkshop?: (appointmentId: string) => void }) {
  const t = T[lang]
  const { p, error } = useProfile(email, undefined)
  return (
    <div className="ff-page">
      <button type="button" className="ff-btn is-sm ff-noprint" onClick={onBack}>{t.back}</button>
      {!p && <h1 style={{ fontSize: 28, margin: '16px 0 18px' }}>{email}</h1>}
      <div style={{ height: 14 }} />
      {error && <div className="ff-err">{t.failed}</div>}
      {!p && !error && <p className="ff-muted">{t.loading}</p>}
      {p && <ProfileBody p={p} lang={lang} onOpenWorkshop={onOpenWorkshop} />}
    </div>
  )
}

/** Popup: one booking only (what this person did for this workshop). Opened from the day sheet. */
export function CustomerProfileModal({
  bookingId, title, lang, onClose, onOpenProfile, onOpenWorkshop, onEdit,
}: { onEdit?: () => void; bookingId: string; title: string; lang: Lang; onClose: () => void; onOpenProfile?: (email: string) => void; onOpenWorkshop?: (appointmentId: string) => void }) {
  const t = T[lang]
  const [onlyThis, setOnlyThis] = useState(false)
  const { p, error } = useProfile(undefined, bookingId, !onlyThis)
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
          <div style={{ display: 'flex', gap: 8 }}>
            {onEdit && <button type="button" className="ff-btn is-sm is-gold" onClick={onEdit}>{lang === 'de' ? 'Bearbeiten' : 'Edit'}</button>}
            <button type="button" className="ff-btn is-sm" onClick={onClose}>{t.close}</button>
          </div>
        </div>
        <div className="ff-chips" style={{ marginBottom: 12 }}>
          <button type="button" className={`ff-btn is-sm${!onlyThis ? ' is-gold' : ''}`} onClick={() => setOnlyThis(false)}>{t.allOfPerson}</button>
          <button type="button" className={`ff-btn is-sm${onlyThis ? ' is-gold' : ''}`} onClick={() => setOnlyThis(true)}>{t.onlyThisDate}</button>
        </div>
        {error && <div className="ff-err">{t.failed}</div>}
        {!p && !error && <p className="ff-muted">{t.loading}</p>}
        {p && <ProfileBody p={p} lang={lang} hideName onOpenProfile={onOpenProfile} onOpenWorkshop={onOpenWorkshop} />}
      </div>
    </div>
  )
}
