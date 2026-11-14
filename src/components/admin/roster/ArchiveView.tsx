'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import type { ArchiveAppointment, ArchiveBooking, ArchiveResponse } from './archiveTypes'
import { ORIGIN_INFO } from './bookingOrigin'
import { OriginBadge, PageHeader, Pill, STATUS, primaryButtonStyle, workshopColor } from './rosterTheme'
import { seatStatusLabel } from './seatStatusLabels'

const TZ = 'Europe/Vienna'

const PAYMENT: Record<ArchiveBooking['payment'], { label: string; tone: keyof typeof STATUS; hint: string }> = {
  stripe: { label: 'Stripe', tone: 'success', hint: 'Online bezahlt, Rechnung vorhanden.' },
  voucher: { label: 'Gutschein', tone: 'purple', hint: 'Mit Gutschein bezahlt (Bestellung über 0 EUR).' },
  manual: { label: 'Manuell', tone: 'purple', hint: 'Von euch eingetragen — Zahlungsart nicht erfasst.' },
  wix: { label: 'Wix', tone: 'info', hint: 'Aus dem alten Wix-Shop — kein Beleg im neuen System.' },
  none: { label: 'Kein Beleg', tone: 'warning', hint: 'Kein Beleg im System gefunden.' },
}

const monthKeyOf = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: TZ }).slice(0, 7)

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(Date.UTC(y as number, (m as number) - 1, 1)).toLocaleDateString('de-AT', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function csvCell(value: string | number): string {
  const s = String(value ?? '')
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function buildCsv(appointments: ArchiveAppointment[]): string {
  const header = [
    'Datum',
    'Uhrzeit',
    'Workshop',
    'Name',
    'Gebucht von',
    'E-Mail',
    'Status',
    'Herkunft',
    'Zahlung',
    'Beleg-Nr.',
    'Preis pro Person (EUR)',
    'Notiz',
  ]
  const lines = [header.map(csvCell).join(';')]
  for (const a of appointments) {
    for (const b of a.bookings) {
      for (const seat of b.seats) {
        lines.push(
          [
            a.date,
            a.time,
            a.workshopTitle,
            seat.name,
            b.buyer,
            b.email,
            seatStatusLabel(seat.status).label,
            ORIGIN_INFO[b.origin].label,
            PAYMENT[b.payment].label,
            b.invoiceNumber,
            b.pricePerPerson.toFixed(2).replace('.', ','),
            b.notes.replace(/\s+/g, ' '),
          ]
            .map(csvCell)
            .join(';'),
        )
      }
    }
  }
  return lines.join('\r\n')
}

function downloadCsv(filename: string, text: string) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const selectStyle: React.CSSProperties = {
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid var(--theme-elevation-150)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-text)',
  fontSize: '14px',
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--theme-text)',
  opacity: 0.5,
  borderBottom: '1px solid var(--theme-elevation-100)',
}
const td: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: '13px',
  color: 'var(--theme-text)',
  borderBottom: '1px solid var(--theme-elevation-100)',
  verticalAlign: 'top',
}

export function ArchiveView() {
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [data, setData] = useState<ArchiveResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<Set<string>>(new Set())

  const load = useCallback(async (y: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/roster/archive?year=${y}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      setData((await res.json()) as ArchiveResponse)
    } catch {
      setError('Das Archiv konnte nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(year)
  }, [load, year])

  const titles = useMemo(
    () => Array.from(new Set((data?.appointments ?? []).map((a) => a.workshopTitle))).sort(),
    [data],
  )

  const visible = useMemo(
    () => (data?.appointments ?? []).filter((a) => filter === 'all' || a.workshopTitle === filter),
    [data, filter],
  )

  const months = useMemo(() => {
    const map = new Map<string, ArchiveAppointment[]>()
    for (const a of visible) {
      const key = monthKeyOf(a.dateTime)
      map.set(key, [...(map.get(key) ?? []), a])
    }
    return Array.from(map.entries()).sort((x, y) => y[0].localeCompare(x[0]))
  }, [visible])

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const totalSeats = visible.reduce((sum, a) => sum + a.seatsHeld, 0)
  const noShows = visible.reduce((sum, a) => sum + a.noShows, 0)

  return (
    <div className="ff-page">
      <PageHeader
        title="Archiv"
        subtitle="Vergangene Workshops: wer gebucht hatte, wie bezahlt wurde und welche Belege es gibt."
        action={
          <button
            type="button"
            style={primaryButtonStyle}
            disabled={visible.length === 0}
            onClick={() => downloadCsv(`fermentfreude-archiv-${year}.csv`, buildCsv(visible))}
          >
            CSV für die Buchhaltung
          </button>
        }
      />

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        <select
          aria-label="Jahr"
          style={selectStyle}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {(data?.years ?? [year]).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select aria-label="Workshop" style={selectStyle} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Alle Workshops</option>
          {titles.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.6 }}>
          {visible.length} Workshops · {totalSeats} Plätze · {noShows} nicht erschienen
        </span>
      </div>

      {loading && <p style={{ color: 'var(--theme-text)', opacity: 0.6 }}>Lade Archiv …</p>}
      {error && <p style={{ color: STATUS.danger.color }}>{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p style={{ color: 'var(--theme-text)', opacity: 0.6 }}>Keine vergangenen Workshops in diesem Jahr.</p>
      )}

      {months.map(([key, list]) => (
        <section key={key} style={{ marginBottom: '28px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 700, color: 'var(--theme-text)', textTransform: 'capitalize' }}>
            {monthLabel(key)}
            <span style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 500, opacity: 0.55 }}>
              {list.length} Workshops · {list.reduce((sum, a) => sum + a.seatsHeld, 0)} Plätze
            </span>
          </h2>

          {list.map((a) => {
            const color = workshopColor(a.workshopTitle)
            const isOpen = open.has(a.id)
            return (
              <div
                key={a.id}
                style={{
                  marginBottom: '10px',
                  border: '1px solid var(--theme-elevation-100)',
                  borderLeft: `4px solid ${color.accent}`,
                  borderRadius: '12px',
                  background: 'var(--theme-elevation-0)',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(a.id)}
                  aria-expanded={isOpen}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    width: '100%',
                    padding: '14px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--theme-text)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '15px', fontWeight: 700 }}>{a.workshopTitle}</span>
                    <span style={{ display: 'block', fontSize: '12px', opacity: 0.6 }}>
                      {a.date} · {a.time}
                      {a.location ? ` · ${a.location}` : ''}
                    </span>
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    {a.seatsHeld}/{a.capacity} Plätze
                  </span>
                  {a.noShows > 0 && <Pill label={`${a.noShows} nicht erschienen`} tone="neutral" />}
                  <span style={{ opacity: 0.5, fontSize: '12px' }}>{isOpen ? 'Zuklappen' : 'Teilnehmer'}</span>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 16px 14px', overflowX: 'auto' }}>
                    {a.bookings.length === 0 ? (
                      <p style={{ fontSize: '13px', opacity: 0.6 }}>Keine bestätigten Buchungen.</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                        <thead>
                          <tr>
                            <th style={th}>Name</th>
                            <th style={th}>Gebucht von</th>
                            <th style={th}>Status</th>
                            <th style={th}>Herkunft</th>
                            <th style={th}>Zahlung</th>
                            <th style={th}>Beleg</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.bookings.flatMap((b) =>
                            b.seats.map((seat, i) => {
                              const status = seatStatusLabel(seat.status)
                              const pay = PAYMENT[b.payment]
                              return (
                                <tr key={`${b.id}-${i}`}>
                                  <td style={{ ...td, fontWeight: 600 }}>{seat.name}</td>
                                  <td style={td}>
                                    {b.buyer}
                                    <span style={{ display: 'block', fontSize: '11px', opacity: 0.55 }}>{b.email}</span>
                                  </td>
                                  <td style={td}>
                                    <Pill label={status.label} tone={status.tone} />
                                  </td>
                                  <td style={td}>
                                    <OriginBadge origin={b.origin} />
                                  </td>
                                  <td style={td}>
                                    <Pill label={pay.label} tone={pay.tone} title={pay.hint} />
                                  </td>
                                  <td style={td}>{b.invoiceNumber || '—'}</td>
                                </tr>
                              )
                            }),
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
