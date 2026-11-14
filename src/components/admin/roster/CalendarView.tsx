'use client'

import React, { useMemo, useState } from 'react'

import { LOCALE, type Lang } from './rosterI18n'
import { seatMismatch } from './seatCheck'
import type { AppointmentRow } from './types'
import { kindColor } from './workshopKind'

const TZ = 'Europe/Vienna'
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: TZ })

const T = {
  de: {
    title: 'Kalender', sub: 'Alle Termine auf einen Blick. Ein Klick öffnet den Workshop mit allen Teilnehmenden.',
    today: 'Heute', prev: 'Vorheriger Monat', next: 'Nächster Monat', wd: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    seats: 'Plätze gebucht', ws: (n: number) => `${n} ${n === 1 ? 'Workshop' : 'Workshops'}`,
    warn: (n: number) => `Bei ${n === 1 ? 'einem Termin' : `${n} Terminen`} weicht die Platzzahl auf der Buchungsseite von den Buchungen ab (mit ! markiert).`,
    mism: (s: number, e: number) => `Die Buchungsseite zeigt ${s} freie Plätze, laut Buchungen sollten es ${e} sein.`,
    older: 'Ältere Termine stehen im Archiv.',
    legend: [['kombucha', 'Kombucha'], ['lakto', 'Lakto-Gemüse'], ['tempeh', 'Tempeh'], ['feld', 'Vom Feld ins Glas']],
  },
  en: {
    title: 'Calendar', sub: 'All dates at a glance. One click opens the workshop with all participants.',
    today: 'Today', prev: 'Previous month', next: 'Next month', wd: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    seats: 'seats booked', ws: (n: number) => `${n} ${n === 1 ? 'workshop' : 'workshops'}`,
    warn: (n: number) => `For ${n === 1 ? 'one date' : `${n} dates`} the seat count on the booking page differs from the bookings (marked with !).`,
    mism: (s: number, e: number) => `The booking page shows ${s} free seats; according to the bookings it should be ${e}.`,
    older: 'Older dates are in the archive.',
    legend: [['kombucha', 'Kombucha'], ['lakto', 'Lakto vegetables'], ['tempeh', 'Tempeh'], ['feld', 'From field to jar']],
  },
}

function shortTitle(title: string): string {
  const t = (title || '').toLowerCase()
  if (t.includes('lakto')) return 'Lakto-Gemüse'
  return title
}

export function CalendarView({
  appointments,
  lang,
  onSelectAppointment,
}: {
  appointments: AppointmentRow[]
  lang: Lang
  onSelectAppointment: (id: string) => void
}) {
  const t = T[lang]
  const todayKey = new Date().toLocaleDateString('sv-SE', { timeZone: TZ })
  const [cursor, setCursor] = useState(() => {
    const [y, m] = todayKey.split('-').map(Number)
    return { y: y as number, m: (m as number) - 1 }
  })

  const byDay = useMemo(() => {
    const map = new Map<string, AppointmentRow[]>()
    for (const a of appointments) {
      if (!a.dateTime) continue
      const key = dayKey(a.dateTime)
      map.set(key, [...(map.get(key) ?? []), a])
    }
    for (const list of map.values()) list.sort((a, b) => a.dateTime.localeCompare(b.dateTime))
    return map
  }, [appointments])

  const first = new Date(Date.UTC(cursor.y, cursor.m, 1))
  const lead = (first.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate()
  const weeks = Math.ceil((lead + daysInMonth) / 7)
  const cells = Array.from({ length: weeks * 7 }, (_, i) => new Date(Date.UTC(cursor.y, cursor.m, 1 - lead + i)))

  const monthKey = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}`
  const inMonth = appointments.filter((a) => a.dateTime && dayKey(a.dateTime).startsWith(monthKey))
  const booked = inMonth.reduce((s, a) => s + a.totalBooked, 0)
  const cap = inMonth.reduce((s, a) => s + a.capacity, 0)
  const pct = cap ? Math.round((booked / cap) * 100) : 0
  const mismatches = inMonth.filter((a) => seatMismatch(a)).length
  const monthTitle = first.toLocaleDateString(LOCALE[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' })

  const shift = (d: number) => {
    const x = new Date(Date.UTC(cursor.y, cursor.m + d, 1))
    setCursor({ y: x.getUTCFullYear(), m: x.getUTCMonth() })
  }
  const goToday = () => {
    const [y, m] = todayKey.split('-').map(Number)
    setCursor({ y: y as number, m: (m as number) - 1 })
  }

  return (
    <div className="ff-page is-wide" style={{ maxWidth: 1240 }}>
      <div className="ff-head">
        <div>
          <h1>{t.title}</h1>
          <p>{t.sub}</p>
        </div>
      </div>
      <div className="ff-calbar">
        <button type="button" className="ff-btn ff-sq" onClick={() => shift(-1)} aria-label={t.prev}>‹</button>
        <button type="button" className="ff-btn ff-sq" onClick={() => shift(1)} aria-label={t.next}>›</button>
        <h2>{monthTitle}</h2>
        <button type="button" className="ff-btn" onClick={goToday}>{t.today}</button>
        {inMonth.length > 0 && (
          <div className="ff-mbadge" role="status">
            <div className="ff-mbtop"><b>{booked}</b><span>/ {cap}</span><em>{t.seats}</em></div>
            <div className="ff-bar" aria-hidden><i style={{ width: `${pct}%` }} /></div>
            <small>{t.ws(inMonth.length)} · {pct}%</small>
          </div>
        )}
      </div>
      {mismatches > 0 && <div className="ff-note">{t.warn(mismatches)}</div>}
      <div className="ff-panel ff-cal">
        <div className="ff-calgrid">
          {t.wd.map((d) => <div key={d} className="ff-dow">{d}</div>)}
          {cells.map((d) => {
            const key = d.toISOString().slice(0, 10)
            const out = d.getUTCMonth() !== cursor.m
            const list = byDay.get(key) ?? []
            return (
              <div key={key} className={`ff-day${out ? ' is-out' : ''}`}>
                <span className={`ff-dn${key === todayKey ? ' is-today' : ''}`}>{d.getUTCDate()}</span>
                {list.map((a) => {
                  const m = seatMismatch(a)
                  const time = new Date(a.dateTime).toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="ff-chip2"
                      style={{ ['--c' as string]: kindColor(a.workshopTitle), opacity: a.isPast ? 0.6 : 1 }}
                      onClick={() => onSelectAppointment(a.id)}
                    >
                      <span className="ct">{shortTitle(a.workshopTitle)}</span>
                      <span className="cm">
                        <span>{time}</span>
                        <span>
                          <b>{a.totalBooked}/{a.capacity}</b>
                          {m && <span className="ff-warnmark" title={t.mism(m.shown, m.expected)}> !</span>}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
      <div className="ff-legend">
        {t.legend.map(([k, label]) => (
          <span key={k}><i style={{ ['--c' as string]: `var(--ff-${k})` }} />{label}</span>
        ))}
        <span>{t.older}</span>
      </div>
    </div>
  )
}
