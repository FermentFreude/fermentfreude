'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { AttentionPanel, useAttentionCount } from './AttentionPanel'
import { bookingOrigin } from './bookingOrigin'
import { LOCALE, WELCOME, partOfDay, type Lang } from './rosterI18n'
import type { BookingRow, RosterData } from './types'
import { WorkshopCard } from './WorkshopCard'
import { kindColor } from './workshopKind'

const X = {
  de: {
    latT: 'Letzte Käufe', latS: 'Die letzten 10 Buchungen über die Webseite.', latNone: 'Noch keine Käufe über die Webseite.',
    seats: (n: number) => `${n} ${n === 1 ? 'Platz' : 'Plätze'}`, open: 'Workshop öffnen', next: 'Nächste Workshops', all: 'Alle Termine',
  },
  en: {
    latT: 'Latest purchases', latS: 'The last 10 bookings through the website.', latNone: 'No website purchases yet.',
    seats: (n: number) => `${n} ${n === 1 ? 'seat' : 'seats'}`, open: 'Open workshop', next: 'Next workshops', all: 'All dates',
  },
}

export function WelcomeView({
  data,
  lang,
  onRefresh,
  onSelectWorkshop,
  onNavigate,
}: {
  data: RosterData
  lang: Lang
  onRefresh: () => void | Promise<void>
  onSelectWorkshop: (id: string) => void
  onNavigate: (s: 'workshops') => void
}) {
  const t = WELCOME[lang]
  const x = X[lang]
  // Render the clock after mount so server and browser never disagree on the greeting.
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const attentionCount = useAttentionCount(data)
  const upcoming = data.appointments.filter((a) => !a.isPast)
  const seats = upcoming.reduce((s, a) => s + a.totalBooked, 0)
  const full = upcoming.filter((a) => a.totalBooked >= a.capacity)
  const meName = data.team.find((m) => m.id === data.me)?.name ?? ''

  const latest = useMemo(() => {
    const rows: { b: BookingRow; apptId: string }[] = []
    for (const a of data.appointments) {
      for (const b of data.bookingsByAppointment[a.id] ?? []) if (bookingOrigin(b) === 'website') rows.push({ b, apptId: a.id })
    }
    return rows.sort((p, q) => q.b.createdAt.localeCompare(p.b.createdAt)).slice(0, 10)
  }, [data])

  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleString(LOCALE[lang], { timeZone: 'Europe/Vienna', ...o })

  return (
    <div className="ff-page">
      <header className="ff-head" style={{ marginBottom: 22 }}>
        <div>
          <div className="ff-eyebrow" style={{ minHeight: 18 }}>
            {now ? fmt(now.toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </div>
          <h1 className="ff-hello">{now ? `${t.greeting[partOfDay(now)]}${meName ? `, ${meName}` : ''}` : ' '}</h1>
          <p>{t.tagline}</p>
        </div>
      </header>

      <div className="ff-kpis">
        <div className="ff-panel ff-kpi"><b>{upcoming.length}</b><span>{t.kpiUpcoming}</span></div>
        <div className="ff-panel ff-kpi"><b>{seats}</b><span>{t.kpiSeats}</span></div>
        <div className="ff-panel ff-kpi"><b>{full.length}</b><span>{t.kpiFull}</span></div>
        <div className="ff-panel ff-kpi"><b>{attentionCount}</b><span>{t.kpiAttention}</span></div>
      </div>

      <AttentionPanel data={data} lang={lang} onRefresh={onRefresh} onOpenAppointment={onSelectWorkshop} />

      <section className="ff-panel" style={{ overflow: 'hidden' }} aria-labelledby="latest-title">
        <div style={{ padding: '18px 20px 12px' }}>
          <h2 id="latest-title" style={{ fontSize: 18, margin: 0 }}>{x.latT}</h2>
          <p className="ff-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{x.latS}</p>
        </div>
        {latest.length === 0 ? (
          <p className="ff-muted" style={{ margin: 0, padding: '14px 20px', borderTop: '1px solid var(--ff-line)' }}>{x.latNone}</p>
        ) : (
          latest.map(({ b, apptId }) => {
            const a = data.appointments.find((q) => q.id === apptId)
            const name = [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email
            return (
              <div key={b.id} className="ff-todo">
                <span style={{ flex: 1, minWidth: 200 }}>
                  <b>{name}</b>
                  <br />
                  <small className="ff-muted">{b.workshopTitle} · {a?.date} · {x.seats(b.guestCount)}</small>
                  <br />
                  <small className="ff-muted">{fmt(b.createdAt, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
                </span>
                {b.totalPrice > 0 && <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{b.totalPrice} €</span>}
                {b.orderId && b.invoiceNumber && (
                  <a className="ff-link" style={{ fontSize: 12 }} href={`/api/admin/orders/${b.orderId}/receipt`} target="_blank" rel="noopener">{b.invoiceNumber}</a>
                )}
                <button type="button" className="ff-btn is-sm" onClick={() => onSelectWorkshop(apptId)}>{x.open}</button>
              </div>
            )
          })
        )}
      </section>

      <h2 className="ff-sec">{t.fullTitle}</h2>
      {full.length === 0 ? (
        <p className="ff-muted">{t.fullNone}</p>
      ) : (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {full.map((a) => (
            <button key={a.id} type="button" className="ff-btn" style={{ borderLeft: `4px solid ${kindColor(a.workshopTitle)}`, textAlign: 'left', display: 'grid', justifyItems: 'start' }} onClick={() => onSelectWorkshop(a.id)}>
              <b>{a.workshopTitle}</b>
              <small className="ff-muted" style={{ fontWeight: 500 }}>{a.date} · {a.time}</small>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <h2 className="ff-sec">{x.next}</h2>
        <button type="button" className="ff-link" onClick={() => onNavigate('workshops')}>{x.all} →</button>
      </div>
      <div className="ff-stack">
        {upcoming.slice(0, 4).map((a) => <WorkshopCard key={a.id} a={a} lang={lang} onOpen={onSelectWorkshop} />)}
      </div>
    </div>
  )
}
