'use client'

import React from 'react'

import type { RosterData } from './types'

type Section = 'dashboard' | 'workshops' | 'detail' | 'participants' | 'pickups'

interface Props {
  data: RosterData
  onSelectWorkshop: (apptId: string) => void
  onNavigate: (section: Section) => void
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--theme-elevation-50)', borderRadius: '12px', padding: '20px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      border: '1px solid var(--theme-elevation-100)',
    }}>
      <div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55, fontWeight: 500 }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)' }}>{value}</p>
      </div>
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px', background: 'var(--theme-elevation-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  )
}

export function DashboardView({ data, onSelectWorkshop, onNavigate }: Props) {
  const { stats, appointments } = data
  const upcoming = appointments.filter((a) => !a.isPast).slice(0, 8)

  const getStatusBadge = (a: (typeof appointments)[0]) => {
    const full = a.totalBooked >= a.capacity && a.capacity > 0
    const over = a.totalBooked > a.capacity && a.capacity > 0
    if (over) return { label: `${a.totalBooked}/${a.capacity} Teilnehmer`, bg: '#fef3c7', color: '#92400e' }
    if (full) return { label: `${a.totalBooked}/${a.capacity} Teilnehmer`, bg: '#fee2e2', color: '#991b1b' }
    return { label: `${a.totalBooked}/${a.capacity} Teilnehmer`, bg: 'var(--theme-elevation-100)', color: 'var(--theme-text)' }
  }

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
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <StatCard
          label="Teilnehmer Gesamt"
          value={stats.totalParticipants}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Offene Abholungen"
          value={stats.openPickups}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
        />
        <StatCard
          label="Umsatz (Workshops)"
          value={`€ ${stats.workshopRevenue.toLocaleString('de-DE')}`}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
        />
      </div>

      {/* Upcoming workshops */}
      <div style={{ background: 'var(--theme-elevation-50)', borderRadius: '12px', border: '1px solid var(--theme-elevation-100)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--theme-elevation-100)' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--theme-text)' }}>Nächste Workshops</h2>
        </div>
        {upcoming.length === 0 ? (
          <p style={{ padding: '20px 24px', color: 'var(--theme-text)', opacity: 0.5, margin: 0 }}>Keine kommenden Workshops.</p>
        ) : (
          upcoming.map((appt, i) => {
            const badge = getStatusBadge(appt)
            return (
              <button
                key={appt.id}
                onClick={() => onSelectWorkshop(appt.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '16px 24px', border: 'none', background: 'transparent',
                  borderTop: i > 0 ? '1px solid var(--theme-elevation-100)' : 'none',
                  cursor: 'pointer', textAlign: 'left', gap: '12px',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-elevation-100)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--theme-text)' }}>{appt.workshopTitle}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55 }}>
                    {appt.date} · {appt.time} · {appt.locationName}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                  background: badge.bg, color: badge.color, whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {badge.label}
                </span>
              </button>
            )
          })
        )}
        {upcoming.length > 0 && (
          <button
            onClick={() => onNavigate('workshops')}
            style={{
              display: 'block', width: '100%', padding: '14px 24px', border: 'none',
              borderTop: '1px solid var(--theme-elevation-100)', background: 'transparent',
              cursor: 'pointer', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55,
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
