'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DashboardView } from './DashboardView'
import { ParticipantsView } from './ParticipantsView'
import { PickupsView } from './PickupsView'
import type { RosterData } from './types'
import { VouchersView } from './VouchersView'
import { WorkshopDetailView } from './WorkshopDetailView'
import { WorkshopsView } from './WorkshopsView'

type Section = 'dashboard' | 'workshops' | 'detail' | 'participants' | 'pickups' | 'vouchers'

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'workshops',
    label: 'Workshops',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'participants',
    label: 'Teilnehmer',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

const SHOP_NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  {
    id: 'pickups',
    label: 'Abholbestellungen',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'vouchers',
    label: 'Gutscheine',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
        <path d="M22 7H2v5h20V7z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
]

const navItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px',
  fontSize: '14px', fontWeight: active ? 600 : 400, cursor: 'pointer', border: 'none',
  background: active ? 'var(--theme-elevation-100)' : 'transparent',
  color: 'var(--theme-text)', width: '100%', textAlign: 'left', transition: 'background 0.15s',
})

const s: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--theme-bg)' },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    borderRight: '1px solid var(--theme-elevation-100)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    background: 'var(--theme-elevation-0)',
  },
  sidebarHeader: { padding: '0 20px 24px', borderBottom: '1px solid var(--theme-elevation-100)' },
  sidebarTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 },
  sidebarSub: { fontSize: '12px', color: 'var(--theme-text)', opacity: 0.5, margin: '2px 0 0' },
  navSection: { padding: '16px 12px 8px' },
  navLabel: { fontSize: '11px', fontWeight: 600, color: 'var(--theme-text)', opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 8px 6px' },
  liveIndicator: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '16px 20px 0',
    marginTop: 'auto', fontSize: '11px', color: 'var(--theme-text)', opacity: 0.4,
  },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 },
  main: { flex: 1, overflow: 'auto' },
}

export function RosterClient({ initialData }: { initialData: RosterData }) {
  const [data, setData] = useState<RosterData>(initialData)
  const [section, setSection] = useState<Section>('dashboard')
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const refreshingRef = useRef(false)

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true
    try {
      const res = await fetch('/api/admin/roster', { cache: 'no-store' })
      if (res.ok) {
        const fresh = await res.json()
        setData(fresh)
        setLastRefresh(new Date())
      }
    } catch {
      // Non-fatal — stale data is fine for a short interval
    } finally {
      refreshingRef.current = false
    }
  }, [])

  // Poll every 30 seconds
  useEffect(() => {
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [refresh])

  // Refresh on tab focus
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  const navigate = (sec: Section) => {
    setSection(sec)
    if (sec !== 'detail') setSelectedApptId(null)
  }

  const openDetail = (apptId: string) => {
    setSelectedApptId(apptId)
    setSection('detail')
  }

  const timeStr = lastRefresh.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={s.shell}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <p style={s.sidebarTitle}>Fermentfreude</p>
          <p style={s.sidebarSub}>Admin Dashboard</p>
        </div>

        <div style={s.navSection}>
          <p style={s.navLabel}>Übersicht</p>
          {NAV.map((item) => (
            <button key={item.id} style={navItemStyle(section === item.id || (section === 'detail' && item.id === 'workshops'))} onClick={() => navigate(item.id)}>
              <span style={{ opacity: 0.65, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={s.navSection}>
          <p style={s.navLabel}>Shop</p>
          {SHOP_NAV.map((item) => (
            <button key={item.id} style={navItemStyle(section === item.id)} onClick={() => navigate(item.id)}>
              <span style={{ opacity: 0.65, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={s.liveIndicator}>
          <span style={s.liveDot} />
          Live · {timeStr}
        </div>
      </aside>

      {/* Main content */}
      <main style={s.main}>
        {section === 'dashboard' && (
          <DashboardView data={data} onSelectWorkshop={openDetail} onNavigate={navigate} />
        )}
        {section === 'workshops' && (
          <WorkshopsView appointments={data.appointments} onSelectAppointment={openDetail} />
        )}
        {section === 'detail' && selectedApptId && (
          <WorkshopDetailView
            appointment={data.appointments.find((a) => a.id === selectedApptId) ?? data.appointments[0]}
            bookings={data.bookingsByAppointment[selectedApptId] ?? []}
            onBack={() => navigate('workshops')}
          />
        )}
        {section === 'participants' && <ParticipantsView participants={data.participants} stats={data.stats} />}
        {section === 'pickups' && (
          <PickupsView orders={data.pickupOrders} onRefresh={refresh} />
        )}
        {section === 'vouchers' && (
          <VouchersView vouchers={data.vouchers} onRefresh={refresh} />
        )}
      </main>
    </div>
  )
}
