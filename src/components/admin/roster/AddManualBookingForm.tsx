'use client'

import React, { useState, useTransition } from 'react'

import { createManualWorkshopBooking } from './actions'
import { CHANNELS, EMPTY_PAYMENT, MP, PaymentFields, toPaymentInput, validatePayment, type PaymentForm } from './ManualPayment'
import type { Lang } from './rosterI18n'

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
  lang = 'de',
}: {
  appointmentId: string
  remainingSpots: number
  /** Called after saving; the message lists what was done (and any warnings). */
  onDone: (message?: string) => void
  lang?: Lang
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [notes, setNotes] = useState('')
  const [channel, setChannel] = useState('')
  const [pay, setPay] = useState<PaymentForm>(EMPTY_PAYMENT)
  const [error, setError] = useState('')
  const [exceptionOk, setExceptionOk] = useState(false)
  const [isCreating, startCreate] = useTransition()
  // More people than free seats: only as an explicit exception (the date's capacity is raised by the missing seats).
  const missing = Math.max(guestCount - remainingSpots, 0)
  const needsException = missing > 0

  const handleCreate = () => {
    if (!firstName.trim()) {
      setError('Bitte Vorname angeben.')
      return
    }
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      setError('Anzahl der Plätze muss mindestens 1 sein.')
      return
    }
    if (needsException && !exceptionOk) {
      setError(lang === 'de' ? 'Bitte die Ausnahme bestätigen (siehe oben) oder weniger Plätze eintragen.' : 'Please confirm the exception (see above) or enter fewer seats.')
      return
    }
    if (!channel) {
      setError(lang === 'de' ? 'Bitte angeben, wie die Buchung zustande gekommen ist.' : 'Please say how the booking came in.')
      return
    }
    const payProblem = validatePayment(pay, lang)
    if (payProblem) {
      setError(payProblem)
      return
    }
    setError('')
    startCreate(async () => {
      try {
        const result = await createManualWorkshopBooking({
          appointmentId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          guestCount,
          notes: notes.trim() || undefined,
          channel: channel as never,
          allowException: needsException && exceptionOk,
          payment: toPaymentInput(pay),
          createInvoice: pay.invoice,
          sendConfirmation: pay.confirm,
        })
        const parts = [
          lang === 'de' ? 'Gespeichert.' : 'Saved.',
          result.invoiceNumber ? `${lang === 'de' ? 'Rechnung' : 'Invoice'} ${result.invoiceNumber}` : '',
          ...result.warnings.map((w) => `⚠ ${w}`),
        ].filter(Boolean)
        onDone(parts.join(' · '))
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
          <label style={labelStyle}>Anzahl Plätze * {remainingSpots > 0 ? `(frei: ${remainingSpots})` : '(Termin voll)'}</label>
          <input
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Notizen (optional)</label>
        <textarea
          placeholder="Ernährungshinweise/Allergien, Grund für manuelle Buchung (alter Gutschein, Sonderabsprache), o. Ä."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: '16px', display: 'grid', gap: '12px' }}>
        <label className="ff-field"><span>{MP[lang].channel} *</span>
          <select className="ff-input" value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="">{MP[lang].pick}</option>
            {CHANNELS.map((c) => <option key={c} value={c}>{MP[lang].channels[c]}</option>)}
          </select>
        </label>
        <PaymentFields value={pay} onChange={setPay} lang={lang} hasEmail={Boolean(email.trim())} />
      </div>

      {needsException && (
        <div style={{ margin: '0 0 16px', padding: '12px 14px', borderRadius: '8px', background: 'var(--ff-warn-bg, #fbf1dd)', color: 'var(--ff-warn-fg, #7a540c)', fontSize: '13px', lineHeight: 1.5 }}>
          <b>{lang === 'de' ? (remainingSpots <= 0 ? 'Dieser Termin ist voll.' : `Es ${remainingSpots === 1 ? 'ist nur noch 1 Platz' : `sind nur noch ${remainingSpots} Plätze`} frei.`) : (remainingSpots <= 0 ? 'This date is full.' : `Only ${remainingSpots} seat${remainingSpots === 1 ? '' : 's'} left.`)}</b>{' '}
          {lang === 'de'
            ? `Als Ausnahme wird die Kapazität dieses Termins um ${missing} erhöht, damit die Person noch dazukommt. Das steht im Verlauf der Buchung und in den Notizen des Termins.`
            : `As an exception the capacity of this date is raised by ${missing} so the person fits. This is written into the booking history and the date's notes.`}
          <label className="ff-chk" style={{ marginTop: 8 }}>
            <input type="checkbox" checked={exceptionOk} onChange={(e) => setExceptionOk(e.target.checked)} />
            <span><b>{lang === 'de' ? 'Ja, Ausnahme eintragen' : 'Yes, add as an exception'}</b></span>
          </label>
        </div>
      )}

      {error && <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--ff-alert)' }}>{error}</p>}

      <button
        onClick={handleCreate}
        disabled={isCreating || (needsException && !exceptionOk)}
        style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: 'var(--ff-btn, #555954)', color: 'var(--ff-btn-fg, #FFFFFF)', fontSize: '14px', fontWeight: 700,
          opacity: isCreating || (needsException && !exceptionOk) ? 0.5 : 1,
        }}
      >
        {isCreating ? 'Wird hinzugefügt…' : 'Sitzplatz hinzufügen'}
      </button>
    </div>
  )
}
