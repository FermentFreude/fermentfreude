'use client'

import React, { useMemo, useState } from 'react'

import { seatMismatch, seatMismatchText } from './seatCheck'
import { BRAND, PageHeader, STATUS, fillLevel, workshopColor } from './rosterTheme'
import type { AppointmentRow } from './types'

interface Props {
  appointments: AppointmentRow[]
  onSelectAppointment: (id: string) => void
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const TZ = 'Europe/Vienna'

const dayKey = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: TZ })

function shortTitle(title: string): string {
  const t = (title || '').toLowerCase()
  if (t.includes('kombucha')) return 'Kombucha'
  if (t.includes('lakto')) return 'Lakto'
  if (t.includes('tempeh')) return 'Tempeh'
  if (t.includes('vom feld')) return 'Vom Feld ins Glas'
  return title
}

const navButton: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  border: '1px solid var(--theme-elevation-150)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-text)',
  fontSize: '18px',
  cursor: 'pointer',
  lineHeight: 1,
}

export function CalendarView({ appointments, onSelectAppointment }: Props) {
  const todayKey = new Date().toLocaleDateString('sv-SE', { timeZone: TZ })
  const [cursor, setCursor] = useState(() => {
    const [y, m] = todayKey.split('-').map(Number)
    return { y: y as number, m: (m as number) - 1 }
  })

  const byDay = useMemo(() => {
    const map = new Map<string, AppointmentRow[]>()
    for (const a of appointments) {
      if (!a.dateTime) continue
      const key = dayKey(a.dateTime)
      const list = map.get(key) ?? []
      list.push(a)
      map.set(key, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.dateTime.localeCompare(b.dateTime))
    return map
  }, [appointments])

  const first = new Date(Date.UTC(cursor.y, cursor.m, 1))
  const lead = (first.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate()
  const weeks = Math.ceil((lead + daysInMonth) / 7)
  const cells = Array.from({ length: weeks * 7 }, (_, i) => new Date(Date.UTC(cursor.y, cursor.m, 1 - lead + i)))

  const monthKey = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}`
  const inMonth = appointments.filter((a) => a.dateTime && dayKey(a.dateTime).startsWith(monthKey))
  const seatsBooked = inMonth.reduce((sum, a) => sum + a.totalBooked, 0)
  const seatsTotal = inMonth.reduce((sum, a) => sum + a.capacity, 0)
  const mismatches = inMonth.filter((a) => seatMismatch(a) !== null).length

  const monthTitle = first.toLocaleDateString('de-AT', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(cursor.y, cursor.m + delta, 1))
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() })
  }
  const goToday = () => {
    const [y, m] = todayKey.split('-').map(Number)
    setCursor({ y: y as number, m: (m as number) - 1 })
  }

  const legend = ['Kombucha', 'Lakto', 'Tempeh', 'Vom Feld ins Glas']

  return (
    <div style={{ padding: '32px 40px 48px', maxWidth: '1200px' }}>
      <PageHeader
        title="Kalender"
        subtitle="Alle Termine auf einen Blick — ein Klick öffnet den Workshop mit allen Teilnehmern."
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button type="button" aria-label="Vorheriger Monat" style={navButton} onClick={() => shift(-1)}>
          ‹
        </button>
        <button type="button" aria-label="Nächster Monat" style={navButton} onClick={() => shift(1)}>
          ›
        </button>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--theme-text)', textTransform: 'capitalize' }}>
          {monthTitle}
        </h2>
        <button
          type="button"
          onClick={goToday}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-0)',
            color: 'var(--theme-text)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Heute
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.6 }}>
          {inMonth.length} {inMonth.length === 1 ? 'Workshop' : 'Workshops'} · {seatsBooked} von {seatsTotal} Plätzen gebucht
        </span>
      </div>

      {mismatches > 0 && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: STATUS.warning.bg,
            color: STATUS.warning.color,
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {mismatches === 1 ? 'Bei einem Termin' : `Bei ${mismatches} Terminen`} weicht die Platzzahl auf der Buchungsseite
          von den Buchungen ab (mit ! markiert). Fahr mit der Maus darüber für Details.
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            minWidth: '760px',
            border: '1px solid var(--theme-elevation-100)',
            borderRadius: '14px',
            overflow: 'hidden',
            background: 'var(--theme-elevation-0)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                style={{
                  padding: '10px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--theme-text)',
                  opacity: 0.5,
                  borderBottom: '1px solid var(--theme-elevation-100)',
                }}
              >
                {d}
              </div>
            ))}
            {cells.map((date) => {
              const key = date.toISOString().slice(0, 10)
              const inThisMonth = date.getUTCMonth() === cursor.m
              const isToday = key === todayKey
              const list = byDay.get(key) ?? []
              return (
                <div
                  key={key}
                  style={{
                    minHeight: '112px',
                    padding: '8px',
                    borderRight: '1px solid var(--theme-elevation-100)',
                    borderBottom: '1px solid var(--theme-elevation-100)',
                    background: inThisMonth ? 'transparent' : 'var(--theme-elevation-50)',
                    opacity: inThisMonth ? 1 : 0.55,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '24px',
                      height: '24px',
                      padding: '0 6px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: isToday ? 800 : 500,
                      background: isToday ? BRAND.gold : 'transparent',
                      color: isToday ? BRAND.nearBlack : 'var(--theme-text)',
                    }}
                  >
                    {date.getUTCDate()}
                  </span>
                  {list.map((a) => {
                    const color = workshopColor(a.workshopTitle)
                    const level = fillLevel(a.totalBooked, a.capacity)
                    const mismatch = seatMismatch(a)
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => onSelectAppointment(a.id)}
                        title={`${a.workshopTitle} · ${a.time} · ${a.totalBooked} von ${a.capacity} Plätzen`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          width: '100%',
                          marginTop: '4px',
                          padding: '5px 6px',
                          borderRadius: '6px',
                          border: 'none',
                          borderLeft: `3px solid ${color.accent}`,
                          background: color.bg,
                          color: BRAND.nearBlack,
                          fontSize: '11px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          opacity: a.isPast ? 0.6 : 1,
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{a.time.replace(' Uhr', '')}</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {shortTitle(a.workshopTitle)}
                        </span>
                        <span style={{ fontWeight: 700, color: level.color }}>
                          {a.totalBooked}/{a.capacity}
                        </span>
                        {mismatch && (
                          <span title={seatMismatchText(mismatch)} style={{ fontWeight: 800, color: STATUS.warning.accent }}>
                            !
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
        {legend.map((name) => {
          const color = workshopColor(name)
          return (
            <span
              key={name}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.7 }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color.accent }} />
              {name}
            </span>
          )
        })}
        <span style={{ fontSize: '12px', color: 'var(--theme-text)', opacity: 0.5 }}>
          Ältere Termine stehen im Archiv.
        </span>
      </div>
    </div>
  )
}
