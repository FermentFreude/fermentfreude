'use client'

import React, { useState, useTransition } from 'react'

import { updateBookingSeatDetails } from './actions'
import { BRAND } from './rosterTheme'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  fontSize: '13px',
  border: '1px solid var(--theme-elevation-200)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-text)',
  outline: 'none',
  boxSizing: 'border-box',
}

export function EditSeatControl({
  bookingId,
  seatIndex,
  currentName,
  currentNotes,
  onDone,
}: {
  bookingId: string
  seatIndex: number
  currentName: string
  currentNotes: string
  onDone: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentName)
  const [notes, setNotes] = useState(currentNotes)
  const [error, setError] = useState('')
  const [isSaving, startSave] = useTransition()

  const handleOpen = () => {
    setName(currentName)
    setNotes(currentNotes)
    setError('')
    setEditing(true)
  }

  const handleSave = () => {
    if (!name.trim()) {
      setError('Bitte einen Namen angeben.')
      return
    }
    setError('')
    startSave(async () => {
      try {
        await updateBookingSeatDetails({ bookingId, seatIndex, name, notes })
        setEditing(false)
        onDone()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
      }
    })
  }

  if (!editing) {
    return (
      <button
        onClick={handleOpen}
        style={{
          marginTop: '6px', padding: '5px 10px', borderRadius: '6px',
          border: '1px solid var(--theme-elevation-200)', background: 'transparent',
          cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--theme-text)', opacity: 0.75,
        }}
      >
        Bearbeiten
      </button>
    )
  }

  return (
    <div style={{
      marginTop: '6px', padding: '10px', borderRadius: '8px',
      background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
    }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, opacity: 0.6, marginBottom: '4px' }}>
        Name
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ ...inputStyle, marginBottom: '8px' }}
      />
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, opacity: 0.6, marginBottom: '4px' }}>
        Ernährungshinweise / Notizen
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        style={{ ...inputStyle, resize: 'vertical', marginBottom: '8px' }}
      />
      {error && <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#dc2626' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            background: BRAND.gold, color: BRAND.nearBlack, fontSize: '12px', fontWeight: 700,
            opacity: isSaving ? 0.5 : 1,
          }}
        >
          {isSaving ? 'Wird gespeichert…' : 'Speichern'}
        </button>
        <button
          onClick={() => setEditing(false)}
          disabled={isSaving}
          style={{
            padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--theme-text)', opacity: isSaving ? 0.3 : 0.6, fontSize: '12px',
          }}
        >
          Abbrechen
        </button>
      </div>
    </div>
  )
}
