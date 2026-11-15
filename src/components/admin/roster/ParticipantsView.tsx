'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { BookingDetailModal } from './BookingDetailModal'
import { bookingOrigin } from './bookingOrigin'
import type { Lang } from './rosterI18n'
import { seatStatusLabel } from './seatStatusLabels'
import type { ParticipantRow, RosterStats } from './types'
import { kindColor } from './workshopKind'

interface Props {
  participants: ParticipantRow[]
  stats: RosterStats
  lang?: Lang
  /** Opens the person's full profile page (needs an email). */
  onOpenProfile?: (email: string) => void
  /** Opens the workshop date page of a participant's booking. */
  onOpenWorkshop?: (appointmentId: string) => void
}

const T = {
  de: {
    title: 'Teilnehmer', placeholder: 'Name, E-Mail oder Telefon …', clear: 'Suche leeren',
    results: (n: number, q: boolean) => (q ? `${n} ${n === 1 ? 'Treffer' : 'Treffer'}` : `${n} Teilnehmende`),
    total: 'Teilnehmende gesamt',
    none: 'Keine Treffer. Probier einen Teil des Namens oder der E-Mail.', empty: 'Noch keine Teilnehmer.',
    manual: 'Manuell', companion: 'Begleitung', companionOf: (n: string) => `Begleitung von ${n}`, order: 'Bestellung',
    noEmail: 'Keine E-Mail', open: 'Workshop öffnen', openHint: 'Diesen Workshop-Termin öffnen', account: 'Kundenakte öffnen', accountHint: 'Alle Infos zu dieser Person: Buchungen, Käufe, Verlauf', hasAcc: 'Hat ein Konto', guest: 'Gast, kein Konto', acctAll: 'Alle', acctYes: 'Mit Konto', acctNo: 'Gäste (ohne Konto)', booking: 'Buchung ansehen', more: (n: number) => `Mehr anzeigen (${n})`,
    all: 'Alle', hint: 'Tipp: Auch nach Workshop oder Datum suchen, mit mehreren Wörtern, z. B. „anna lakto“.',
  },
  en: {
    title: 'Participants', placeholder: 'Name, email or phone …', clear: 'Clear search',
    results: (n: number, q: boolean) => (q ? `${n} ${n === 1 ? 'match' : 'matches'}` : `${n} participants`),
    total: 'participants in total',
    none: 'No matches. Try part of the name or email.', empty: 'No participants yet.',
    manual: 'Manual', companion: 'Companion', companionOf: (n: string) => `Companion of ${n}`, order: 'Order',
    noEmail: 'No email', open: 'Open workshop', openHint: 'Open this workshop date', account: 'Open customer record', accountHint: 'Everything about this person: bookings, purchases, history', booking: 'View booking', hasAcc: 'Has an account', guest: 'Guest, no account', acctAll: 'All', acctYes: 'With account', acctNo: 'Guests (no account)', more: (n: number) => `Show more (${n})`,
    all: 'All', hint: 'Tip: you can also search by workshop or date, with several words, e.g. "anna lakto".',
  },
}

const PAGE = 40

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const TONE: Record<string, string> = { success: 'ok', danger: 'bad', warning: 'warn', info: 'info', purple: 'info', neutral: 'neu' }

export function ParticipantsView({ participants, lang = 'de', onOpenProfile, onOpenWorkshop }: Props) {
  const t = T[lang]
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ParticipantRow | null>(null)
  const [shown, setShown] = useState(PAGE)
  const [acct, setAcct] = useState<'all' | 'yes' | 'no'>('all')
  const input = useRef<HTMLInputElement>(null)

  // People come here to look someone up: the search box is ready to type in.
  useEffect(() => {
    input.current?.focus()
  }, [])
  useEffect(() => setShown(PAGE), [query, acct])

  const index = useMemo(
    () =>
      participants.map((p) => ({
        p,
        hay: norm([p.name, p.email, p.phone, p.workshopTitle, p.booking.date, p.guestOfName, p.orderRef].filter(Boolean).join(' ')),
      })),
    [participants],
  )
  const words = norm(query).split(/\s+/).filter(Boolean)
  const matched = words.length ? index.filter((x) => words.every((w) => x.hay.includes(w))).map((x) => x.p) : participants
  const filtered = acct === 'all' ? matched : matched.filter((p) => (acct === 'yes') === p.hasAccount)
  const visible = filtered.slice(0, shown)

  const openRow = (p: ParticipantRow) => (p.email && onOpenProfile ? onOpenProfile(p.email) : setSelected(p))

  return (
    <div className="ff-page">
      <div className="ff-head" style={{ marginBottom: 14 }}>
        <div>
          <h1>{t.title}</h1>
        </div>
        <div className="ff-pstats" aria-label="Overview">
          <span><b>{participants.length}</b> {t.total}</span>
        </div>
      </div>

      <div className="ff-psearch" role="search">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); input.current?.focus() }} aria-label={t.clear}>✕</button>
        )}
      </div>
      <div className="ff-pmeta" role="status" aria-live="polite">
        {(words.length > 0 || acct !== 'all') && <span>{t.results(filtered.length, true)}</span>}
        {words.length === 0 && <span className="ff-muted">{t.hint}</span>}
        <span className="ff-pfilter" role="group" aria-label={t.hasAcc}>
          {(['all', 'yes', 'no'] as const).map((k) => (
            <button key={k} type="button" aria-pressed={acct === k} onClick={() => setAcct(k)}>
              {{ all: t.acctAll, yes: t.acctYes, no: t.acctNo }[k]}
            </button>
          ))}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="ff-panel" style={{ padding: 24 }}>
          <p className="ff-muted" style={{ margin: 0 }}>{words.length ? t.none : t.empty}</p>
        </div>
      ) : (
        <div className="ff-plist">
          {visible.map((p, i) => {
            const origin = bookingOrigin(p.booking)
            const st = p.seatStatus !== 'active' ? seatStatusLabel(p.seatStatus) : null
            const when = p.booking.date ? `${p.booking.date}${p.booking.time ? ` · ${p.booking.time}` : ''}` : ''
            return (
              <div
                key={`${p.booking.id}-${i}`}
                className="ff-prow"
                style={{ ['--c' as string]: kindColor(p.workshopTitle) }}
                onClick={(e) => { if (!(e.target as HTMLElement).closest('a, button')) openRow(p) }}
              >
                <span className="ff-pav" aria-hidden>{initials(p.name) || '?'}</span>
                <div className="ff-pwho">
                  <button type="button" className="ff-pname" onClick={() => openRow(p)}>{p.name || '—'}</button>
                  <span className="ff-pbadges">
                    {origin === 'manual' && <span className="ff-manual">✎ {t.manual}</span>}
                    {st && <span className={`ff-pill ${TONE[st.tone] ?? 'neu'}`}>{st.label}</span>}
                    <span className={`ff-pill ${p.hasAccount ? 'gold' : 'neu'}`} title={p.hasAccount ? undefined : t.guest}>{p.hasAccount ? `● ${t.hasAcc}` : t.guest}</span>
                    {!p.isBuyer && <span className="ff-pill neu">{p.guestOfName ? t.companionOf(p.guestOfName) : t.companion}</span>}
                  </span>
                  <span className="ff-pcontact">
                    {p.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : <span className="ff-muted">{t.noEmail}</span>}
                    {p.phone && <a href={`tel:${p.phone.replace(/\s+/g, '')}`}>{p.phone}</a>}
                  </span>
                </div>
                <div className="ff-pws">
                  <b>{p.workshopTitle || '—'}</b>
                  {when && <span>{when}</span>}
                  {!p.isBuyer && p.orderRef && <span className="ff-muted">{t.order} #{p.orderRef}</span>}
                </div>
                <div className="ff-pacts">
                  <button type="button" className="ff-btn is-sm is-gold" onClick={() => openRow(p)} title={t.accountHint}>
                    {p.email && onOpenProfile ? t.account : t.booking}
                  </button>
                  {onOpenWorkshop && p.booking.appointmentId && (
                    <button
                      type="button"
                      className="ff-btn is-sm"
                      onClick={() => onOpenWorkshop(p.booking.appointmentId as string)}
                      title={t.openHint}
                    >
                      {t.open}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length > visible.length && (
            <button type="button" className="ff-more" onClick={() => setShown((n) => n + PAGE)}>{t.more(filtered.length - visible.length)}</button>
          )}
        </div>
      )}

      {selected && <BookingDetailModal booking={selected.booking} onClose={() => setSelected(null)} />}
    </div>
  )
}
