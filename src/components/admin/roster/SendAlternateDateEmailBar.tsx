'use client'

import React, { useEffect, useState, useTransition } from 'react'

import { getAlternateAppointments, sendAlternateDateEmail } from './actions'
import { BRAND } from './rosterTheme'

type Alternate = { id: string; date: string; time: string; totalBooked: number; capacity: number }

export function SendAlternateDateEmailBar({
  selectedBookingIds,
  currentAppointmentId,
  onSent,
}: {
  selectedBookingIds: string[]
  currentAppointmentId: string
  onSent: () => void
}) {
  const [alternates, setAlternates] = useState<Alternate[] | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ sent: string[]; skippedNoEmail: string[] } | null>(null)
  const [isLoading, startLoad] = useTransition()
  const [isSending, startSend] = useTransition()

  useEffect(() => {
    if (selectedBookingIds.length === 0 || alternates !== null) return
    startLoad(async () => {
      try {
        const result = await getAlternateAppointments(currentAppointmentId)
        setAlternates(result)
        if (result.length > 0) setSelectedId(result[0].id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Termine konnten nicht geladen werden.')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBookingIds.length])

  if (selectedBookingIds.length === 0) return null

  const handleSend = () => {
    if (!selectedId) {
      setError('Bitte einen Termin auswählen.')
      return
    }
    setError('')
    setResult(null)
    startSend(async () => {
      try {
        const res = await sendAlternateDateEmail({
          bookingIds: selectedBookingIds,
          newAppointmentId: selectedId,
        })
        setResult(res)
        onSent()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Versand fehlgeschlagen.')
      }
    })
  }

  return (
    <div
      style={{
        marginBottom: '20px', padding: '16px', borderRadius: '10px',
        background: '#fffbeb', border: '1px solid #fbbf24',
      }}
    >
      <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
        {selectedBookingIds.length} {selectedBookingIds.length === 1 ? 'Buchung' : 'Buchungen'} ausgewählt
      </p>

      {isLoading ? (
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.6 }}>Termine werden geladen…</p>
      ) : alternates && alternates.length === 0 ? (
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.6 }}>
          Keine weiteren Termine für diesen Workshop gefunden — leg zuerst einen neuen Termin an.
        </p>
      ) : alternates ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              padding: '7px 10px', borderRadius: '6px', fontSize: '13px',
              border: '1px solid var(--theme-elevation-200)', background: 'var(--theme-elevation-0)',
              color: 'var(--theme-text)',
            }}
          >
            {alternates.map((a) => (
              <option key={a.id} value={a.id}>
                {a.date} · {a.time} — {a.totalBooked}/{a.capacity} belegt
              </option>
            ))}
          </select>
          <button
            onClick={handleSend}
            disabled={isSending}
            style={{
              padding: '7px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: BRAND.gold, color: BRAND.nearBlack, fontSize: '13px', fontWeight: 700,
              opacity: isSending ? 0.5 : 1,
            }}
          >
            {isSending ? 'Wird gesendet…' : `E-Mail an ${selectedBookingIds.length} senden`}
          </button>
        </div>
      ) : null}

      {error && <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#dc2626' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '10px', fontSize: '13px', color: '#92400e' }}>
          {result.sent.length > 0 && <p style={{ margin: '0 0 4px' }}>✅ Gesendet an: {result.sent.join(', ')}</p>}
          {result.skippedNoEmail.length > 0 && (
            <p style={{ margin: 0 }}>⚠️ Übersprungen (keine E-Mail oder Fehler): {result.skippedNoEmail.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  )
}
