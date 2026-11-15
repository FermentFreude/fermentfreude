'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Accordion } from './Accordion'
import { AttentionPanel, useAttentionCount } from './AttentionPanel'
import { RefundSummary, isOpenRefund } from './RefundSummary'
import { bookingOrigin } from './bookingOrigin'
import { LOCALE, WELCOME, partOfDay, type Lang } from './rosterI18n'
import type { BookingRow, RosterData } from './types'
import { WorkshopCard } from './WorkshopCard'

const X = {
  de: {
    refT: 'Rückerstattungen', refS: 'Kundinnen und Kunden, die ihr Geld zurückwollen. Öffnen, vermerken, dass ihr die Rückzahlung gestartet habt, und eine Notiz dazu schreiben.',
    latT: 'Letzte Käufe', latS: 'Die 10 neuesten Buchungen über die Webseite. Anklicken, um Zahlung, Platz und Kontakt zu prüfen oder zu ändern.', latNone: 'Noch keine Käufe über die Webseite.',
    seats: (n: number) => `${n} ${n === 1 ? 'Platz' : 'Plätze'}`, open: 'Workshop öffnen', next: 'Nächste Workshops', nextS: 'Die kommenden Termine mit freien Plätzen. Einen Termin öffnen, um Teilnehmende zu sehen, Buchungen zu ändern oder umzubuchen.', all: 'Alle Termine',
  },
  en: {
    refT: 'Refunds', refS: 'Customers asking for their money back. Open a request, record that you started the refund and add a note.',
    latT: 'Latest purchases', latS: 'The 10 newest bookings from the website. Click one to check or change payment, seat and contact details.', latNone: 'No website purchases yet.',
    seats: (n: number) => `${n} ${n === 1 ? 'seat' : 'seats'}`, open: 'Open workshop', next: 'Next workshops', nextS: 'Upcoming dates with free seats. Open one to see participants, edit bookings or move people to another date.', all: 'All dates',
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
  onNavigate: (s: 'workshops' | 'refunds') => void
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

      <AttentionPanel data={data} lang={lang} onRefresh={onRefresh} onOpenAppointment={onSelectWorkshop} onNavigate={onNavigate} />

      <Accordion
        id="refunds"
        title={x.refT}
        sub={x.refS}
        count={data.refundRequests.filter(isOpenRefund).length}
      >
        <RefundSummary refundRequests={data.refundRequests} lang={lang} onOpen={() => onNavigate('refunds')} />
      </Accordion>

      <Accordion
        id="next"
        title={x.next}
        sub={x.nextS}
        count={upcoming.length}
        actions={<button type="button" className="ff-btn is-gold" onClick={() => onNavigate('workshops')}>{x.all} →</button>}
      >
        <div className="ff-stack" style={{ padding: 16 }}>
          {upcoming.slice(0, 4).map((a) => <WorkshopCard key={a.id} a={a} lang={lang} onOpen={onSelectWorkshop} />)}
        </div>
      </Accordion>

      <Accordion id="latest" title={x.latT} sub={x.latS} count={latest.length}>
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
      </Accordion>

    </div>
  )
}
