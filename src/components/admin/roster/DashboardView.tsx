'use client'

import React from 'react'

import type { RosterData } from './types'

type Section = 'dashboard' | 'workshops' | 'detail' | 'participants' | 'pickups'

interface Props {
  data: RosterData
  onSelectWorkshop: (apptId: string) => void
  onNavigate: (section: Section) => void
}

const WORKSHOP_COLORS: Record<string, { accent: string; bg: string; icon: string }> = {
  kombucha: { accent: '#0d9488', bg: '#ccfbf1', icon: '🫧' },
  tempeh: { accent: '#b45309', bg: '#fef3c7', icon: '🫘' },
  lakto: { accent: '#15803d', bg: '#dcfce7', icon: '🥬' },
  'vom feld': { accent: '#c2410c', bg: '#ffedd5', icon: '🌾' },
}

function workshopColor(title: string) {
  const key = title.toLowerCase()
  const match = Object.keys(WORKSHOP_COLORS).find((k) => key.includes(k))
  return match ? WORKSHOP_COLORS[match] : { accent: '#6366f1', bg: '#e0e7ff', icon: '🍽️' }
}

function fillLevel(booked: number, capacity: number) {
  if (capacity <= 0) return { pct: 0, accent: '#94a3b8', bg: '#f1f5f9', label: '#475569' }
  const pct = Math.min(100, Math.round((booked / capacity) * 100))
  if (booked > capacity) return { pct: 100, accent: '#d97706', bg: '#fef3c7', label: '#92400e' } // overbooked
  if (booked === capacity) return { pct: 100, accent: '#dc2626', bg: '#fee2e2', label: '#991b1b' } // full
  if (pct >= 70) return { pct, accent: '#ea580c', bg: '#ffedd5', label: '#9a3412' } // filling up
  if (pct > 0) return { pct, accent: '#16a34a', bg: '#dcfce7', label: '#166534' } // open, has bookings
  return { pct, accent: '#94a3b8', bg: '#f1f5f9', label: '#475569' } // empty
}

function StatCard({
  label,
  value,
  icon,
  accent,
  bg,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  accent: string
  bg: string
}) {
  return (
    <div
      style={{
        background: 'var(--theme-elevation-0)',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        border: '1px solid var(--theme-elevation-100)',
        borderTop: `3px solid ${accent}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text)', opacity: 0.6, fontWeight: 500 }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)' }}>{value}</p>
      </div>
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  )
}

export function DashboardView({ data, onSelectWorkshop, onNavigate }: Props) {
  const { stats, appointments } = data
  const upcoming = appointments.filter((a) => !a.isPast).slice(0, 8)

  return (
    <div style={{ padding: '40px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 }}>Dashboard</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55 }}>
          Willkommen zurück! Hier ist deine Übersicht.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <StatCard
          label="Kommende Workshops"
          value={stats.upcomingWorkshops}
          accent="#4f46e5"
          bg="#e0e7ff"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Teilnehmer Gesamt"
          value={stats.totalParticipants}
          accent="#16a34a"
          bg="#dcfce7"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Offene Abholungen"
          value={stats.openPickups}
          accent="#ea580c"
          bg="#ffedd5"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
        />
        <StatCard
          label="Umsatz (Workshops)"
          value={`€ ${stats.workshopRevenue.toLocaleString('de-DE')}`}
          accent="#c026d3"
          bg="#fae8ff"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c026d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          }
        />
      </div>

      {/* Upcoming workshops */}
      <div style={{ background: 'var(--theme-elevation-0)', borderRadius: '14px', border: '1px solid var(--theme-elevation-100)', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--theme-elevation-100)' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--theme-text)' }}>Nächste Workshops</h2>
        </div>
        {upcoming.length === 0 ? (
          <p style={{ padding: '20px 24px', color: 'var(--theme-text)', opacity: 0.5, margin: 0 }}>Keine kommenden Workshops.</p>
        ) : (
          upcoming.map((appt, i) => {
            const wc = workshopColor(appt.workshopTitle)
            const fill = fillLevel(appt.totalBooked, appt.capacity)
            return (
              <button
                key={appt.id}
                onClick={() => onSelectWorkshop(appt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '14px 24px',
                  border: 'none',
                  background: 'transparent',
                  borderTop: i > 0 ? '1px solid var(--theme-elevation-100)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '16px',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-elevation-50)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: wc.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                  aria-hidden
                >
                  {wc.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--theme-text)' }}>{appt.workshopTitle}</p>
                  <p style={{ margin: '2px 0 6px', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55 }}>
                    {appt.date} · {appt.time} · {appt.locationName}
                  </p>
                  <div style={{ width: '100%', maxWidth: '220px', height: '5px', borderRadius: '999px', background: 'var(--theme-elevation-100)', overflow: 'hidden' }}>
                    <div style={{ width: `${fill.pct}%`, height: '100%', background: fill.accent, borderRadius: '999px', transition: 'width 0.2s' }} />
                  </div>
                </div>

                <span
                  style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: fill.bg,
                    color: fill.label,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {appt.totalBooked}/{appt.capacity} Teilnehmer
                </span>
              </button>
            )
          })
        )}
        {upcoming.length > 0 && (
          <button
            onClick={() => onNavigate('workshops')}
            style={{
              display: 'block',
              width: '100%',
              padding: '14px 24px',
              border: 'none',
              borderTop: '1px solid var(--theme-elevation-100)',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              color: '#4f46e5',
              textAlign: 'center',
            }}
          >
            Alle Workshops anzeigen →
          </button>
        )}
      </div>
    </div>
  )
}
