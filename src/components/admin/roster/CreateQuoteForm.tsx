'use client'

import React, { useState, useTransition } from 'react'

import { createQuote } from './actions'

interface FormItem {
  key: string
  title: string
  note: string
  quantity: string
  unitPriceEuro: string
}

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

let keyCounter = 0
const newItem = (): FormItem => ({
  key: `item-${keyCounter++}`,
  title: '',
  note: '',
  quantity: '1',
  unitPriceEuro: '',
})

export function CreateQuoteForm({ onDone }: { onDone: () => void }) {
  const [clientName, setClientName] = useState('')
  const [contactPersonName, setContactPersonName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [projectName, setProjectName] = useState('')
  const [clientReference, setClientReference] = useState('')
  const [eventDateText, setEventDateText] = useState('')
  const [eventLocationText, setEventLocationText] = useState('')
  const [participantCountText, setParticipantCountText] = useState('')
  const [items, setItems] = useState<FormItem[]>([newItem()])
  const [error, setError] = useState('')
  const [isCreating, startCreate] = useTransition()

  const updateItem = (key: string, patch: Partial<FormItem>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)))
  }

  const handleCreate = () => {
    if (!clientName.trim() || !projectName.trim()) {
      setError('Bitte Firma/Name und Projekt angeben.')
      return
    }
    const parsedItems = items
      .filter((i) => i.title.trim())
      .map((i) => ({
        title: i.title.trim(),
        note: i.note.trim() || undefined,
        quantity: parseInt(i.quantity, 10) || 1,
        unitPriceCents: Math.round((parseFloat(i.unitPriceEuro) || 0) * 100),
      }))
    if (parsedItems.length === 0) {
      setError('Bitte mindestens eine Position mit Bezeichnung angeben.')
      return
    }
    setError('')
    startCreate(async () => {
      await createQuote({
        clientName: clientName.trim(),
        contactPersonName: contactPersonName.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        projectName: projectName.trim(),
        clientReference: clientReference.trim() || undefined,
        items: parsedItems,
        eventDateText: eventDateText.trim() || undefined,
        eventLocationText: eventLocationText.trim() || undefined,
        participantCountText: participantCountText.trim() || undefined,
      })
      onDone()
    })
  }

  return (
    <div
      style={{
        marginBottom: '32px',
        padding: '24px',
        borderRadius: '12px',
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-100)',
      }}
    >
      <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: 'var(--theme-text)' }}>
        Neues Angebot erstellen
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Firma / Name *</label>
          <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Ansprechperson (optional)</label>
          <input type="text" value={contactPersonName} onChange={(e) => setContactPersonName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Projekt *</label>
          <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Kundenreferenz (optional)</label>
          <input type="text" value={clientReference} onChange={(e) => setClientReference(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Adresse</label>
        <textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Positionen</label>
        {items.map((item) => (
          <div key={item.key} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 80px 100px 32px', gap: '8px', marginBottom: '8px' }}>
            <input placeholder="Leistung" value={item.title} onChange={(e) => updateItem(item.key, { title: e.target.value })} style={inputStyle} />
            <input placeholder="Beschreibung (optional)" value={item.note} onChange={(e) => updateItem(item.key, { note: e.target.value })} style={inputStyle} />
            <input type="number" min={1} placeholder="Anz." value={item.quantity} onChange={(e) => updateItem(item.key, { quantity: e.target.value })} style={inputStyle} />
            <input type="number" min={0} step="0.01" placeholder="€ Einzelpreis" value={item.unitPriceEuro} onChange={(e) => updateItem(item.key, { unitPriceEuro: e.target.value })} style={inputStyle} />
            <button
              onClick={() => setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.key !== item.key) : prev))}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', fontSize: '18px' }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => setItems((prev) => [...prev, newItem()])}
          style={{ marginTop: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px dashed var(--theme-elevation-200)', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.7 }}
        >
          + Position hinzufügen
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Termin / Zeitraum</label>
          <input type="text" value={eventDateText} onChange={(e) => setEventDateText(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Veranstaltungsort</label>
          <input type="text" value={eventLocationText} onChange={(e) => setEventLocationText(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Teilnehmerzahl</label>
          <input type="text" value={participantCountText} onChange={(e) => setParticipantCountText(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {error && <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#dc2626' }}>{error}</p>}

      <button
        onClick={handleCreate}
        disabled={isCreating}
        style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: '#111827', color: '#fff', fontSize: '14px', fontWeight: 600,
          opacity: isCreating ? 0.5 : 1,
        }}
      >
        {isCreating ? 'Wird erstellt…' : 'Angebot erstellen'}
      </button>
    </div>
  )
}
