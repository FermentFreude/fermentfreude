'use client'

import React, { useEffect, useState } from 'react'

import { AttentionPanel, useAttentionCount } from './AttentionPanel'
import { DashboardView } from './DashboardView'
import { LOCALE, WELCOME, partOfDay, type Lang } from './rosterI18n'
import { BRAND, STAT_ACCENTS, workshopColor } from './rosterTheme'
import type { RosterData } from './types'

type Section = 'dashboard' | 'workshops' | 'detail' | 'participants' | 'pickups' | 'orders'

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
  onNavigate: (s: Section) => void
}) {
  const t = WELCOME[lang]
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

  const kpis = [
    { label: t.kpiUpcoming, value: upcoming.length, accent: STAT_ACCENTS.indigo.accent },
    { label: t.kpiSeats, value: seats, accent: STAT_ACCENTS.green.accent },
    { label: t.kpiFull, value: full.length, accent: STAT_ACCENTS.orange.accent },
    { label: t.kpiAttention, value: attentionCount, accent: BRAND.goldDark },
  ]

  const top = (
    <>
      <header style={{ marginBottom: '28px' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: BRAND.goldDark, minHeight: '18px' }}>
          {now ? now.toLocaleDateString(LOCALE[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Vienna' }) : ''}
        </p>
        <h1 style={{ margin: '6px 0 0', fontSize: '32px', fontWeight: 700, color: 'var(--theme-text)', minHeight: '40px' }}>
          {now ? t.greeting[partOfDay(now)] : ''}
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--theme-text)', opacity: 0.6 }}>{t.tagline}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: 'var(--theme-elevation-0)', border: '1px solid var(--theme-elevation-100)', borderTop: `3px solid ${k.accent}`, borderRadius: '14px', padding: '16px 18px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--theme-text)', opacity: 0.6, fontWeight: 500 }}>{k.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)' }}>{k.value}</p>
          </div>
        ))}
      </div>

      <AttentionPanel data={data} lang={lang} onRefresh={onRefresh} onOpenAppointment={onSelectWorkshop} />

      <section aria-labelledby="full-title" style={{ marginBottom: '24px' }}>
        <h2 id="full-title" style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 10px', color: 'var(--theme-text)' }}>{t.fullTitle}</h2>
        {full.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--theme-text)', opacity: 0.55 }}>{t.fullNone}</p>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {full.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelectWorkshop(a.id)}
                style={{ border: '1px solid var(--theme-elevation-100)', borderLeft: `4px solid ${workshopColor(a.workshopTitle).accent}`, background: 'var(--theme-elevation-0)', color: 'var(--theme-text)', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', textAlign: 'left' }}
              >
                <strong style={{ display: 'block', fontSize: '14px' }}>{a.workshopTitle}</strong>
                <span style={{ fontSize: '12px', opacity: 0.6 }}>{a.date} · {a.time}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  )

  return <DashboardView data={data} onSelectWorkshop={onSelectWorkshop} onNavigate={onNavigate} top={top} />
}
