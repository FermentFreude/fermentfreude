'use client'

import React, { useState, useTransition } from 'react'

import { getAlternateAppointments, moveWorkshopBooking } from './actions'
import { BRAND } from './rosterTheme'

type Alternate = { id: string; date: string; time: string; totalBooked: number; capacity: number }

export function MoveBookingControl({
  bookingId,
  guestCount,
  currentAppointmentId,
  onDone,
}: {
  bookingId: string
  guestCount: number
  currentAppointmentId: string
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [alternates, setAlternates] = useState<Alternate[] | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, startLoad] = useTransition()
  const [isMoving, startMove] = useTransition()

  const handleOpen = () => {
    setOpen(true)
    setError('')
    startLoad(async () => {
      try {
        const result = await getAlternateAppointments(currentAppointmentId)
        setAlternates(result)
        if (result.length > 0) setSelectedId(result[0].id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Termine konnten nicht geladen werden.')
      }
    })
  }

  const handleMove = () => {
    if (!selectedId) {
      setError('Bitte einen Termin auswählen.')
      return
    }
    setError('')
    startMove(async () => {
      try {
        await moveWorkshopBooking({ bookingId, newAppointmentId: selectedId })
        setOpen(false)
        onDone()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verschieben fehlgeschlagen.')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        style={{
          marginTop: '10px', padding: '5px 10px', borderRadius: '6px',
          border: '1px solid var(--theme-elevation-200)', background: 'transparent',
          cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--theme-text)', opacity: 0.75,
        }}
      >
        Auf anderen Termin verschieben ({guestCount} {guestCount === 1 ? 'Platz' : 'Plätze'})
      </button>
    )
  }

  return (
    <div style={{
      marginTop: '10px', padding: '10px', borderRadius: '8px',
      background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
    }}>
      {isLoading ? (
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>Termine werden geladen…</p>
      ) : alternates && alternates.length === 0 ? (
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>
          Keine weiteren Termine für diesen Workshop gefunden.
        </p>
      ) : alternates ? (
        <>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              width: '100%', padding: '6px 8px', borderRadius: '6px', fontSize: '13px',
              border: '1px solid var(--theme-elevation-200)', background: 'var(--theme-elevation-0)',
              color: 'var(--theme-text)', marginBottom: '8px',
            }}
          >
            {alternates.map((a) => (
              <option key={a.id} value={a.id}>
                {a.date} · {a.time} — {a.totalBooked}/{a.capacity} belegt
              </option>
            ))}
          </select>
          {error && <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#dc2626' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleMove}
              disabled={isMoving}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: BRAND.gold, color: BRAND.nearBlack, fontSize: '12px', fontWeight: 700,
                opacity: isMoving ? 0.5 : 1,
              }}
            >
              {isMoving ? 'Wird verschoben…' : 'Bestätigen'}
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={isMoving}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: 'transparent', color: 'var(--theme-text)', opacity: 0.6, fontSize: '12px',
              }}
            >
              Abbrechen
            </button>
          </div>
        </>
      ) : (
        error && <p style={{ margin: 0, fontSize: '12px', color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}
