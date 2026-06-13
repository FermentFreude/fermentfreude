'use client'

import React from 'react'

import type { AppointmentRow } from './types'

interface Props {
  appointments: AppointmentRow[]
  onSelectAppointment: (id: string) => void
}

function progressBarColor(totalBooked: number, capacity: number): string {
  if (capacity === 0) return '#e5e7eb'
  if (totalBooked > capacity) return '#f97316'
  if (totalBooked >= capacity) return '#f97316'
  return '#111827'
}

function statusBadge(totalBooked: number, capacity: number): { label: string; bg: string; color: string } | null {
  if (capacity === 0) return null
  if (totalBooked > capacity) return { label: 'Überbucht', bg: '#fef3c7', color: '#92400e' }
  if (totalBooked >= capacity) return { label: 'Ausgebucht', bg: '#fee2e2', color: '#991b1b' }
  return { label: 'Verfügbar', bg: 'var(--theme-elevation-100)', color: 'var(--theme-text)' }
}

function groupByDate(appointments: AppointmentRow[]): Map<string, AppointmentRow[]> {
  const map = new Map<string, AppointmentRow[]>()
  for (const appt of appointments) {
    const dateKey = appt.date
    if (!map.has(dateKey)) map.set(dateKey, [])
    map.get(dateKey)!.push(appt)
  }
  return map
}

export function WorkshopsView({ appointments, onSelectAppointment }: Props) {
  const upcoming = appointments.filter((a) => !a.isPast)
  const grouped = groupByDate(upcoming)
  const total = upcoming.length

  return (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 }}>Workshops</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55 }}>
            Verwalte alle Workshops und Buchungen
          </p>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55, whiteSpace: 'nowrap', paddingTop: '6px' }}>
          {total} {total === 1 ? 'Workshop' : 'Workshops'} insgesamt
        </span>
      </div>

      {grouped.size === 0 && (
        <p style={{ color: 'var(--theme-text)', opacity: 0.5 }}>Keine kommenden Workshops.</p>
      )}

      {Array.from(grouped.entries()).map(([date, appts]) => (
        <div key={date} style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--theme-text)', opacity: 0.55, margin: '0 0 12px' }}>
            {date}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appts.map((appt) => {
              const badge = statusBadge(appt.totalBooked, appt.capacity)
              const pct = appt.capacity > 0 ? Math.min((appt.totalBooked / appt.capacity) * 100, 100) : 0
              const barColor = progressBarColor(appt.totalBooked, appt.capacity)
              const desc = appt.workshopDescription
                ? appt.workshopDescription.replace(/<[^>]+>/g, '').slice(0, 80) + (appt.workshopDescription.length > 80 ? '…' : '')
                : ''

              return (
                <button
                  key={appt.id}
                  onClick={() => onSelectAppointment(appt.id)}
                  style={{
                    background: 'var(--theme-elevation-0)', border: '1px solid var(--theme-elevation-100)',
                    borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'left',
                    width: '100%', transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
                >
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: 'var(--theme-text)' }}>
                    {appt.workshopTitle}
                  </h3>
                  {desc && (
                    <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.6, lineHeight: 1.5 }}>
                      {desc}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    {[
                      { icon: '🕐', text: appt.time },
                      { icon: '📍', text: appt.locationName },
                      { icon: '€', text: `€${appt.pricePerPerson}` },
                    ].map(({ icon, text }) => (
                      <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.7 }}>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>{icon}</span>
                        {text}
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--theme-elevation-100)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        {appt.totalBooked}/{appt.capacity}
                      </span>
                      {badge && (
                        <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', background: 'var(--theme-elevation-100)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
