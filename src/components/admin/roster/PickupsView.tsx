'use client'

import React, { useState, useTransition } from 'react'

import { updatePickupStatus } from './actions'
import type { PickupOrderRow } from './types'

interface Props {
  orders: PickupOrderRow[]
  onRefresh: () => Promise<void>
}

const STATUS_CONFIG = {
  pending: { label: 'In Bearbeitung', bg: '#fef3c7', color: '#92400e', dotColor: '#f59e0b' },
  ready: { label: 'Abholbereit', bg: '#dbeafe', color: '#1e40af', dotColor: '#3b82f6' },
  collected: { label: 'Abgeholt', bg: '#dcfce7', color: '#166534', dotColor: '#22c55e' },
}

type Filter = 'all' | 'pending' | 'ready'

function StatusBadge({ status }: { status: PickupOrderRow['pickupStatus'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dotColor, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

function OrderCard({ order, onRefresh }: { order: PickupOrderRow; onRefresh: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition()

  const handleStatus = (next: PickupOrderRow['pickupStatus']) => {
    startTransition(async () => {
      await updatePickupStatus(order.id, next)
      await onRefresh()
    })
  }

  return (
    <div style={{
      background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
      borderRadius: '12px', padding: '20px', opacity: isPending ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--theme-text)' }}>
            {order.invoiceNumber}
          </span>
          <StatusBadge status={order.pickupStatus} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--theme-text)' }}>
          €{order.totalAmount.toFixed(2).replace('.', ',')}
        </span>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.45 }}>
        Bestellt am {order.createdAt}
      </p>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Customer info */}
        <div>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--theme-text)', opacity: 0.45 }}>
            Kundeninformation
          </p>
          <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '14px', color: 'var(--theme-text)' }}>
            {[order.customerFirstName, order.customerLastName].filter(Boolean).join(' ') || '—'}
          </p>
          {order.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href={`mailto:${order.email}`} style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.7, textDecoration: 'none' }}>{order.email}</a>
            </div>
          )}
          {order.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z"/></svg>
              <span style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.7 }}>{order.phone}</span>
            </div>
          )}
        </div>

        {/* Order items */}
        <div>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--theme-text)', opacity: 0.45 }}>
            Bestelldetails
          </p>
          {order.items.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text)', opacity: 0.5 }}>—</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--theme-text)', opacity: 0.75 }}>{item.qty}x {item.title}</span>
                  {item.price > 0 && (
                    <span style={{ color: 'var(--theme-text)', opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>
                      €{item.price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {order.pickupDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontSize: '12px', color: 'var(--theme-text)', opacity: 0.55 }}>
                Abholung: {order.pickupDate}{order.pickupTime ? ` · ${order.pickupTime}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      {order.notes && (
        <div style={{
          padding: '10px 12px', borderRadius: '6px', background: '#fffbeb',
          border: '1px solid #fbbf24', marginBottom: '16px',
          display: 'flex', alignItems: 'flex-start', gap: '8px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span style={{ fontSize: '13px', color: '#92400e' }}>Notiz: {order.notes}</span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {order.pickupStatus === 'pending' && (
          <button
            onClick={() => handleStatus('ready')}
            disabled={isPending}
            style={{
              padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: '#111827', color: '#fff', fontSize: '13px', fontWeight: 600,
              opacity: isPending ? 0.5 : 1,
            }}
          >
            Als abholbereit markieren
          </button>
        )}
        {order.pickupStatus === 'ready' && (
          <button
            onClick={() => handleStatus('collected')}
            disabled={isPending}
            style={{
              padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: '#111827', color: '#fff', fontSize: '13px', fontWeight: 600,
              opacity: isPending ? 0.5 : 1,
            }}
          >
            Als abgeholt markieren
          </button>
        )}
        {order.pickupStatus === 'collected' && (
          <button
            onClick={() => handleStatus('pending')}
            disabled={isPending}
            style={{
              padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
              fontWeight: 500, background: 'transparent', border: '1px solid var(--theme-elevation-200)',
              color: 'var(--theme-text)', opacity: isPending ? 0.5 : 0.7,
            }}
          >
            Zurücksetzen
          </button>
        )}
      </div>
    </div>
  )
}

export function PickupsView({ orders, onRefresh }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const inProgress = orders.filter((o) => o.pickupStatus === 'pending').length
  const ready = orders.filter((o) => o.pickupStatus === 'ready').length
  const collected = orders.filter((o) => o.pickupStatus === 'collected').length
  const collectedRevenue = orders
    .filter((o) => o.pickupStatus === 'collected')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const filtered = orders.filter((o) => {
    if (filter === 'pending' && o.pickupStatus !== 'pending') return false
    if (filter === 'ready' && o.pickupStatus !== 'ready') return false
    if (query.trim()) {
      const q = query.toLowerCase()
      const name = [o.customerFirstName, o.customerLastName].join(' ').toLowerCase()
      if (!name.includes(q) && !o.invoiceNumber.toLowerCase().includes(q) && !o.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div style={{ padding: '40px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 }}>Abholbestellungen</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55 }}>
          Verwalte Produktbestellungen zur Abholung
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        {[
          { label: 'In Bearbeitung', value: inProgress, accent: 'orange' },
          { label: 'Abholbereit', value: ready, accent: 'blue' },
          { label: 'Abgeholt', value: collected, accent: 'green' },
          { label: 'Umsatz (abgeholt)', value: `€${collectedRevenue.toFixed(2).replace('.', ',')}`, accent: 'none' },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{
            background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
            borderRadius: '10px', padding: '16px 18px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', marginBottom: '10px',
              background: accent === 'orange' ? '#fef3c7' : accent === 'blue' ? '#dbeafe' : accent === 'green' ? '#dcfce7' : 'var(--theme-elevation-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {accent === 'orange' && <span style={{ fontSize: '16px' }}>🕐</span>}
              {accent === 'blue' && <span style={{ fontSize: '16px' }}>📦</span>}
              {accent === 'green' && <span style={{ fontSize: '16px' }}>✓</span>}
              {accent === 'none' && <span style={{ fontSize: '14px', color: 'var(--theme-text)', fontWeight: 700 }}>€</span>}
            </div>
            <p style={{ margin: '0 0 2px', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.55 }}>{label}</p>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--theme-text)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--theme-elevation-100)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {([['all', 'Alle'], ['pending', 'In Bearbeitung'], ['ready', 'Abholbereit']] as [Filter, string][]).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: filter === val ? 600 : 400,
                background: filter === val ? 'var(--theme-elevation-0)' : 'transparent',
                color: 'var(--theme-text)',
                boxShadow: filter === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--theme-elevation-100)', borderRadius: '8px', padding: '8px 12px', flex: 1, minWidth: '200px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche nach Kunde oder Bestellnummer..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--theme-text)', width: '100%' }}
          />
        </div>
      </div>

      {/* Order cards */}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--theme-text)', opacity: 0.5 }}>
          {orders.length === 0 ? 'Noch keine Abholbestellungen.' : 'Keine Ergebnisse für diesen Filter.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  )
}
