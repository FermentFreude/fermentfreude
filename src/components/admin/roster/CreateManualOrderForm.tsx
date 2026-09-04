'use client'

import React, { useState, useTransition } from 'react'

import { createManualOrder, searchProducts } from './actions'

interface ProductResult {
  id: string
  title: string
  priceInEUR: number
  inventory: number | null
  variants: { id: string; title: string; priceInEUR: number; inventory: number | null }[]
}

interface LineItem {
  key: string
  productId: string
  variantId?: string
  title: string
  unitPrice: number // cents
  quantity: number
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

const fmtMoney = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`

export function CreateManualOrderForm({ onDone }: { onDone: () => void }) {
  const [customerFirstName, setCustomerFirstName] = useState('')
  const [customerLastName, setCustomerLastName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [referenceNote, setReferenceNote] = useState('')
  const [items, setItems] = useState<LineItem[]>([])

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductResult[]>([])
  const [isSearching, startSearch] = useTransition()
  const [error, setError] = useState('')
  const [isCreating, startCreate] = useTransition()

  const runSearch = (q: string) => {
    setQuery(q)
    if (!q.trim()) {
      setResults([])
      return
    }
    startSearch(async () => {
      const found = await searchProducts(q)
      setResults(found)
    })
  }

  const addItem = (product: ProductResult, variant?: ProductResult['variants'][number]) => {
    const key = `${product.id}:${variant?.id ?? 'base'}`
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          variantId: variant?.id,
          title: variant ? `${product.title} — ${variant.title}` : product.title,
          unitPrice: variant ? variant.priceInEUR : product.priceInEUR,
          quantity: 1,
        },
      ]
    })
    setQuery('')
    setResults([])
  }

  const updateQty = (key: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)))
  }

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  const handleCreate = () => {
    if (!customerFirstName.trim() || !customerLastName.trim()) {
      setError('Bitte Vor- und Nachname angeben.')
      return
    }
    if (!customerEmail.trim()) {
      setError('Bitte eine E-Mail-Adresse angeben.')
      return
    }
    if (items.length === 0) {
      setError('Bitte mindestens einen Artikel hinzufügen.')
      return
    }
    setError('')
    startCreate(async () => {
      await createManualOrder({
        customerFirstName: customerFirstName.trim(),
        customerLastName: customerLastName.trim(),
        customerEmail: customerEmail.trim(),
        referenceNote: referenceNote.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
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
      <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--theme-text)' }}>
        Manuelle Bestellung erstellen
      </h2>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55 }}>
        Für Banküberweisung, telefonische oder persönliche Bestellungen. Erzeugt eine echte
        Bestellung (MAN-Rechnungsnummer) und reduziert den Lagerbestand wie bei Stripe-Bestellungen.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Vorname *</label>
          <input
            type="text"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Nachname *</label>
          <input
            type="text"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>E-Mail *</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Referenz (optional)</label>
          <input
            type="text"
            placeholder="z.B. Firmenevent August"
            value={referenceNote}
            onChange={(e) => setReferenceNote(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <label style={labelStyle}>Produkt hinzufügen</label>
        <input
          type="text"
          placeholder="Produkt suchen…"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          style={inputStyle}
        />
        {isSearching && (
          <p style={{ margin: '6px 0 0', fontSize: '12px', opacity: 0.5 }}>Suche…</p>
        )}
        {results.length > 0 && (
          <div
            style={{
              position: 'absolute',
              zIndex: 10,
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              maxHeight: '260px',
              overflowY: 'auto',
            }}
          >
            {results.map((p) => (
              <div key={p.id}>
                {p.variants.length > 0 ? (
                  p.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => addItem(p, v)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', width: '100%',
                        padding: '10px 14px', border: 'none', background: 'transparent',
                        cursor: 'pointer', textAlign: 'left', fontSize: '13px', color: 'var(--theme-text)',
                        borderBottom: '1px solid var(--theme-elevation-100)',
                      }}
                    >
                      <span>{p.title} — {v.title}</span>
                      <span style={{ opacity: 0.6 }}>{fmtMoney(v.priceInEUR)}</span>
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => addItem(p)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', width: '100%',
                      padding: '10px 14px', border: 'none', background: 'transparent',
                      cursor: 'pointer', textAlign: 'left', fontSize: '13px', color: 'var(--theme-text)',
                      borderBottom: '1px solid var(--theme-elevation-100)',
                    }}
                  >
                    <span>{p.title}</span>
                    <span style={{ opacity: 0.6 }}>{fmtMoney(p.priceInEUR)}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div
          style={{
            marginBottom: '20px', borderRadius: '8px', overflow: 'hidden',
            border: '1px solid var(--theme-elevation-100)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              {items.map((item) => (
                <tr key={item.key} style={{ borderBottom: '1px solid var(--theme-elevation-100)' }}>
                  <td style={{ padding: '10px 14px' }}>{item.title}</td>
                  <td style={{ padding: '10px 14px', width: '80px' }}>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQty(item.key, parseInt(e.target.value, 10) || 1)}
                      style={{ ...inputStyle, padding: '6px 8px' }}
                    />
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {fmtMoney(item.unitPrice * item.quantity)}
                  </td>
                  <td style={{ padding: '10px 14px', width: '32px' }}>
                    <button
                      onClick={() => removeItem(item.key)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', fontSize: '16px' }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 700 }} colSpan={2}>
                  Gesamt
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>
                  {fmtMoney(total)}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

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
        {isCreating ? 'Wird erstellt…' : 'Bestellung erstellen'}
      </button>
    </div>
  )
}
