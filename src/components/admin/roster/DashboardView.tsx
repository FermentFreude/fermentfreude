'use client'

import React from 'react'

import type { RosterData } from './types'
import { BRAND, PageHeader, StatCard, fillLevel, workshopColor } from './rosterTheme'

type Section = 'dashboard' | 'workshops' | 'detail' | 'participants' | 'pickups' | 'orders'

const ORDER_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  processing: { label: 'In Bearbeitung', bg: '#dbeafe', color: '#1e40af' },
  completed: { label: 'Abgeschlossen', bg: '#dcfce7', color: '#166534' },
  cancelled: { label: 'Storniert', bg: '#f3f4f6', color: '#374151' },
  refunded: { label: 'Rückerstattet', bg: '#fee2e2', color: '#991b1b' },
}

const fmtOrderMoney = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`

interface Props {
  data: RosterData
  onSelectWorkshop: (apptId: string) => void
  onNavigate: (section: Section) => void
}

export function DashboardView({ data, onSelectWorkshop, onNavigate }: Props) {
  const { stats, appointments, orders } = data
  const upcoming = appointments.filter((a) => !a.isPast).slice(0, 8)
  const latestOrders = orders.slice(0, 5)

  return (
    <div style={{ padding: '40px', maxWidth: '900px' }}>
      <PageHeader title="Dashboard" subtitle="Willkommen zurück! Hier ist deine Übersicht." />

      {/* Latest orders from the website — first thing a founder sees, and
          where the admin order-notification email's button now lands. */}
      <div style={{
        background: 'var(--theme-elevation-0)', borderRadius: '14px', border: '1px solid var(--theme-elevation-100)',
        overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: '24px',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--theme-elevation-100)' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--theme-text)' }}>Neueste Bestellungen</h2>
        </div>
        {latestOrders.length === 0 ? (
          <p style={{ padding: '20px 24px', color: 'var(--theme-text)', opacity: 0.5, margin: 0 }}>Noch keine Bestellungen.</p>
        ) : (
          latestOrders.map((order, i) => {
            const cfg = ORDER_STATUS_CONFIG[order.status]
            return (
              <button
                key={order.id}
                onClick={() => onNavigate('orders')}
                style={{
                  display: 'flex', alignItems: 'center', width: '100%', padding: '14px 24px',
                  border: 'none', background: 'transparent', borderTop: i > 0 ? '1px solid var(--theme-elevation-100)' : 'none',
                  cursor: 'pointer', textAlign: 'left', gap: '16px', transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-elevation-50)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--theme-text)' }}>
                    {order.customerName || order.customerEmail || '—'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.itemsSummary || '—'} · {order.createdAt}
                  </p>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--theme-text)', flexShrink: 0 }}>
                  {fmtOrderMoney(order.amount)}
                </span>
                {cfg && (
                  <span style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                    background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {cfg.label}
                  </span>
                )}
              </button>
            )
          })
        )}
        {latestOrders.length > 0 && (
          <button
            onClick={() => onNavigate('orders')}
            style={{
              display: 'block', width: '100%', padding: '14px 24px', border: 'none',
              borderTop: '1px solid var(--theme-elevation-100)', background: 'transparent', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, color: BRAND.goldDark, textAlign: 'center',
            }}
          >
            Alle Bestellungen anzeigen →
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <StatCard
          label="Kommende Workshops"
          value={stats.upcomingWorkshops}
          accentKey="indigo"
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
          accentKey="green"
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
          accentKey="orange"
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
          accentKey="gold"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND.goldDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    color: fill.color,
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
              fontWeight: 700,
              color: BRAND.goldDark,
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
