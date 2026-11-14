'use client'

import React from 'react'

import { LOCALE, type Lang } from './rosterI18n'
import { seatMismatch } from './seatCheck'
import type { AppointmentRow } from './types'
import { kindColor } from './workshopKind'

const T = {
  de: {
    free: (n: number) => `${n} frei`, full: 'ausgebucht', almost: 'fast voll', of: (c: number) => `von ${c} Plätzen`, uhr: ' Uhr',
    mism: (s: number, e: number) => `Die Buchungsseite zeigt ${s} freie Plätze, laut Buchungen sollten es ${e} sein.`,
  },
  en: {
    free: (n: number) => `${n} free`, full: 'fully booked', almost: 'almost full', of: (c: number) => `of ${c} seats`, uhr: '',
    mism: (s: number, e: number) => `The booking page shows ${s} free seats; according to the bookings it should be ${e}.`,
  },
}

/** One upcoming date as a card: date box, title, time, fill bar, seats and state. */
export function WorkshopCard({ a, lang, onOpen }: { a: AppointmentRow; lang: Lang; onOpen: (id: string) => void }) {
  const t = T[lang]
  const dt = new Date(a.dateTime)
  const free = Math.max(a.capacity - a.totalBooked - (a.pendingSeats ?? 0), 0)
  const pct = a.capacity ? Math.min(100, Math.round((a.totalBooked / a.capacity) * 100)) : 0
  const fill = a.totalBooked >= a.capacity ? 'var(--ff-bad-fg)' : pct >= 70 ? 'var(--ff-warn-fg)' : 'var(--ff-ok-fg)'
  const m = seatMismatch(a)
  const part = (o: Intl.DateTimeFormatOptions) => dt.toLocaleDateString(LOCALE[lang], { timeZone: 'Europe/Vienna', ...o })
  const time = dt.toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Vienna' })
  return (
    <button type="button" className="ff-panel ff-lcard" style={{ ['--c' as string]: kindColor(a.workshopTitle), ['--c2' as string]: fill }} onClick={() => onOpen(a.id)}>
      <span className="ff-datebox">
        <small>{part({ weekday: 'short' })}</small>
        <b>{part({ day: 'numeric' })}</b>
        <span>{part({ month: 'short' })}</span>
      </span>
      <span className="ff-lmain">
        <h3>
          {a.workshopTitle}
          {m && <span className="ff-warnmark" title={t.mism(m.shown, m.expected)}>!</span>}
        </h3>
        <span className="ff-lsub">{time}{t.uhr} · {a.locationName}</span>
        <span className="ff-bar" style={{ maxWidth: 300, marginTop: 10, ['--c' as string]: fill }}><i style={{ width: `${pct}%` }} /></span>
      </span>
      <span className="ff-lside">
        <b>{a.totalBooked}/{a.capacity}</b>
        <span className="ff-muted" style={{ fontSize: 12 }}>{t.of(a.capacity)}</span>
        {free <= 0 ? <span className="ff-pill bad">{t.full}</span> : free <= 2 ? <span className="ff-pill warn">{t.almost}</span> : <span className="ff-pill ok">{t.free(free)}</span>}
      </span>
    </button>
  )
}
