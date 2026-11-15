'use client'

import React, { useState, useTransition } from 'react'

import { deleteManualWorkshopBooking } from './actions'

export function DeleteBookingControl({
  bookingId,
  onDone,
}: {
  bookingId: string
  onDone: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [isDeleting, startDelete] = useTransition()

  const handleDelete = () => {
    setError('')
    startDelete(async () => {
      try {
        await deleteManualWorkshopBooking(bookingId)
        onDone()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen.')
        setConfirming(false)
      }
    })
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        style={{
          marginTop: '6px', padding: '5px 10px', borderRadius: '6px',
          border: '1px solid #D9D3C4', background: 'transparent',
          cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--ff-alert)',
        }}
      >
        Sitzplatz löschen
      </button>
    )
  }

  return (
    <div style={{
      marginTop: '6px', padding: '10px', borderRadius: '8px',
      background: '#F0EDE5', border: '1px solid #D9D3C4',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--ff-alert)' }}>
        Wirklich löschen? Das kann nicht rückgängig gemacht werden.
      </p>
      {error && <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--ff-alert)' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            background: 'var(--ff-bad-bg)', color: 'var(--ff-bad-fg)', fontSize: '12px', fontWeight: 700,
            opacity: isDeleting ? 0.5 : 1,
          }}
        >
          {isDeleting ? 'Wird gelöscht…' : 'Ja, endgültig löschen'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isDeleting}
          style={{
            padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--theme-text)', opacity: isDeleting ? 0.3 : 0.6, fontSize: '12px',
          }}
        >
          Abbrechen
        </button>
      </div>
    </div>
  )
}
