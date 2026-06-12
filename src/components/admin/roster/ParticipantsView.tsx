'use client'

import React, { useState } from 'react'

import type { ParticipantRow, RosterStats } from './types'

interface Props {
  participants: ParticipantRow[]
  stats: RosterStats
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function ParticipantsView({ participants, stats }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? participants.filter((p) => {
        const q = query.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q)
        )
      })
    : participants

  const pending = participants.filter((p) => p.status === 'pending').length

  return (
    <div style={{ padding: '40px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 }}>Teilnehmer</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55 }}>
          Alle Kunden und Teilnehmer im Überblick
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Gesamt Kunden', value: participants.length, icon: '👤' },
          { label: 'Bestätigte Buchungen', value: stats.totalParticipants, icon: '📅' },
          { label: 'Ausstehende Buchungen', value: pending, icon: '🕐', accent: pending > 0 },
        ].map(({ label, value, icon, accent }) => (
          <div key={label} style={{
            background: 'var(--theme-elevation-50)', borderRadius: '12px', padding: '18px 20px',
            border: accent ? '1px solid #fbbf24' : '1px solid var(--theme-elevation-100)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px',
              background: accent ? '#fef3c7' : 'var(--theme-elevation-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
            }}>
              {icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--theme-text)', opacity: 0.55 }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 700, color: accent ? '#d97706' : 'var(--theme-text)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{
        background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
        borderRadius: '12px', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-elevation-100)', gap: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--theme-text)' }}>Kundenliste</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--theme-elevation-100)', borderRadius: '8px', padding: '8px 12px', minWidth: '260px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche nach Name, E-Mail oder Telefon..."
              style={{
                border: 'none', background: 'transparent', outline: 'none', fontSize: '13px',
                color: 'var(--theme-text)', width: '100%',
              }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ padding: '20px', color: 'var(--theme-text)', opacity: 0.5, margin: 0 }}>
            {query ? 'Keine Ergebnisse gefunden.' : 'Noch keine Teilnehmer.'}
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--theme-elevation-100)' }}>
                {['Name', 'E-Mail', 'Telefon', 'Workshop'].map((col) => (
                  <th key={col} style={{
                    padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--theme-text)',
                    opacity: 0.55, whiteSpace: 'nowrap',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: 'var(--theme-elevation-100)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700, color: 'var(--theme-text)', flexShrink: 0,
                      }}>
                        {initials(p.name) || '?'}
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--theme-text)' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    {p.email ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <a href={`mailto:${p.email}`} style={{ color: 'var(--theme-text)', opacity: 0.75, textDecoration: 'none', fontSize: '13px' }}>{p.email}</a>
                      </div>
                    ) : <span style={{ opacity: 0.35 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    {p.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z"/></svg>
                        <span style={{ color: 'var(--theme-text)', opacity: 0.75 }}>{p.phone}</span>
                      </div>
                    ) : <span style={{ opacity: 0.35 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: 'var(--theme-text)', opacity: 0.65 }}>
                    {p.workshopTitle || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
