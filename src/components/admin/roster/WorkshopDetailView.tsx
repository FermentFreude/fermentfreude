'use client'

import React from 'react'

import type { AppointmentRow, BookingRow } from './types'

interface Props {
  appointment: AppointmentRow
  bookings: BookingRow[]
  onBack: () => void
}

function statusBadgeLabel(totalBooked: number, capacity: number): { label: string; bg: string; color: string } | null {
  if (capacity === 0) return null
  if (totalBooked > capacity) return { label: 'Überbucht', bg: '#fef3c7', color: '#92400e' }
  if (totalBooked >= capacity) return { label: 'Ausgebucht', bg: '#fee2e2', color: '#991b1b' }
  return { label: 'Verfügbar', bg: 'var(--theme-elevation-100)', color: 'var(--theme-text)' }
}

function fmtBookingDate(iso: string): string {
  if (!iso) return ''
  return 'Gebucht am ' + new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Vienna',
  })
}

export function WorkshopDetailView({ appointment, bookings, onBack }: Props) {
  const badge = statusBadgeLabel(appointment.totalBooked, appointment.capacity)

  return (
    <div style={{ padding: '40px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px' }}>
        <div>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55,
              padding: '0 0 10px', marginLeft: '-2px',
            }}
          >
            ← Zurück
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 }}>
            {appointment.workshopTitle}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55 }}>
            {appointment.date}
          </p>
        </div>
        {badge && (
          <span style={{
            padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
            background: badge.bg, color: badge.color, whiteSpace: 'nowrap', flexShrink: 0, marginTop: '28px',
          }}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Participant list */}
      <div style={{
        background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
        borderRadius: '12px', padding: '24px', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--theme-text)' }}>Teilnehmerliste</h2>
          <span style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            {bookings.length} bestätigt
          </span>
        </div>

        {bookings.length === 0 ? (
          <p style={{ color: 'var(--theme-text)', opacity: 0.5, margin: 0 }}>Noch keine bestätigten Buchungen.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {bookings.map((booking, i) => {
              const name = [booking.firstName, booking.lastName].filter(Boolean).join(' ') || booking.email || '—'
              return (
                <div
                  key={booking.id}
                  style={{
                    background: 'var(--theme-elevation-0)', border: '1px solid var(--theme-elevation-100)',
                    borderRadius: '10px', padding: '18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%', background: 'var(--theme-elevation-100)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700, color: 'var(--theme-text)', flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--theme-text)' }}>{name}</span>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px',
                      background: '#dcfce7', color: '#166534',
                    }}>
                      Bestätigt
                    </span>
                  </div>

                  {booking.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <a href={`mailto:${booking.email}`} style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.75, textDecoration: 'none' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none' }}
                      >
                        {booking.email}
                      </a>
                    </div>
                  )}

                  {booking.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z"/></svg>
                      <span style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.75 }}>{booking.phone}</span>
                    </div>
                  )}

                  {booking.notes && (
                    <div style={{
                      marginTop: '10px', padding: '10px 12px', borderRadius: '6px',
                      background: '#fffbeb', border: '1px solid #fbbf24',
                      display: 'flex', alignItems: 'flex-start', gap: '8px',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <span style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.4 }}>{booking.notes}</span>
                    </div>
                  )}

                  <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.4 }}>
                    {fmtBookingDate(booking.createdAt)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Teilnehmer', value: `${appointment.totalBooked}/${appointment.capacity}`, icon: '👤' },
          { label: 'Uhrzeit', value: appointment.time, icon: '🕐' },
          { label: 'Preis', value: `€${appointment.pricePerPerson}`, icon: '€' },
          { label: 'Ort', value: appointment.locationName, icon: '📍' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
            borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px', background: 'var(--theme-elevation-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
            }}>
              {icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--theme-text)', opacity: 0.5 }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 700, color: 'var(--theme-text)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      {appointment.workshopDescription && (
        <div style={{
          background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
          borderRadius: '12px', padding: '24px',
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: 'var(--theme-text)' }}>Beschreibung</h3>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--theme-text)', opacity: 0.75, lineHeight: 1.6 }}>
            {appointment.workshopDescription.replace(/<[^>]+>/g, '')}
          </p>
        </div>
      )}
    </div>
  )
}
