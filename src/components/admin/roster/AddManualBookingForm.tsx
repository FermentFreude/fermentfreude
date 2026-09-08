'use client'

import React, { useState, useTransition } from 'react'

import { createManualWorkshopBooking } from './actions'
import { BRAND } from './rosterTheme'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '14px',
  border: '1px solid var(--theme-elevation-200)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-text)',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--theme-text)',
  opacity: 0.6,
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export function AddManualBookingForm({
  appointmentId,
  remainingSpots,
  onDone,
}: {
  appointmentId: string
  remainingSpots: number
  onDone: () => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isCreating, startCreate] = useTransition()

  const handleCreate = () => {
    if (!firstName.trim()) {
      setError('Bitte Vorname angeben.')
      return
    }
    if (!notes.trim()) {
      setError('Bitte einen Grund angeben (z. B. alter Gutschein, Sonderabsprache).')
      return
    }
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      setError('Anzahl der Plätze muss mindestens 1 sein.')
      return
    }
    if (guestCount > remainingSpots) {
      setError(`Nur noch ${remainingSpots} Platz/Plätze verfügbar.`)
      return
    }
    setError('')
    startCreate(async () => {
      try {
        await createManualWorkshopBooking({
          appointmentId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          guestCount,
          notes: notes.trim(),
        })
        onDone()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sitzplatz konnte nicht hinzugefügt werden.')
      }
    })
  }

  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '24px',
        borderRadius: '12px',
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-100)',
      }}
    >
      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--theme-text)' }}>
        Sitzplatz manuell hinzufügen
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55 }}>
        Für Kund:innen mit altem Gutschein oder Sonderabsprache, ohne Stripe-Zahlung. Zählt wie eine
        echte Buchung gegen die Kapazität dieses Termins.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Vorname *</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Nachname</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>E-Mail (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Telefon (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Anzahl Plätze * (max. {remainingSpots})</label>
          <input
            type="number"
            min={1}
            max={remainingSpots}
            value={guestCount}
            onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Grund *</label>
        <textarea
          placeholder="z. B. altes Wix-Gutschein-Code XY, Sonderabsprache mit David"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {error && <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#dc2626' }}>{error}</p>}

      <button
        onClick={handleCreate}
        disabled={isCreating || remainingSpots <= 0}
        style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: BRAND.gold, color: BRAND.nearBlack, fontSize: '14px', fontWeight: 700,
          opacity: isCreating || remainingSpots <= 0 ? 0.5 : 1,
        }}
      >
        {isCreating ? 'Wird hinzugefügt…' : 'Sitzplatz hinzufügen'}
      </button>
      {remainingSpots <= 0 && (
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#dc2626' }}>
          Dieser Termin hat keine freien Plätze mehr.
        </p>
      )}
    </div>
  )
}
