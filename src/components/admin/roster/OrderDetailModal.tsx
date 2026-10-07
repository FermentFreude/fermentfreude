'use client'

import React, { useEffect, useState } from 'react'

import { getOrderDetail, type OrderDetail } from './actions'
import { BookingDetailModal } from './BookingDetailModal'
import { BRAND, STATUS } from './rosterTheme'
import { seatStatusLabel } from './seatStatusLabels'
import type { BookingRow } from './types'

interface Props {
  orderId: string
  onClose: () => void
}

const ORDER_STATUS: Record<string, { label: string; tone: keyof typeof STATUS }> = {
  completed: { label: 'Abgeschlossen', tone: 'success' },
  processing: { label: 'In Bearbeitung', tone: 'info' },
  cancelled: { label: 'Storniert', tone: 'danger' },
  refunded: { label: 'Rückerstattet', tone: 'danger' },
}

const TX_STATUS: Record<string, string> = {
  succeeded: 'Bezahlt',
  pending: 'Offen / abgebrochen',
  failed: 'Fehlgeschlagen',
  cancelled: 'Abgebrochen',
  expired: 'Abgelaufen',
  refunded: 'Erstattet',
}

const VOUCHER_DELIVERY: Record<string, string> = {
  'email-recipient': 'Per E-Mail an die beschenkte Person',
  'email-self': 'Per E-Mail an die käufende Person',
  pdf: 'PDF zum Ausdrucken',
  email: 'Per E-Mail',
  pickup: 'Abholung',
}

const fmtMoney = (cents: number) =>
  (cents / 100).toLocaleString('de-AT', { style: 'currency', currency: 'EUR' })

function fmtDateTime(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Vienna',
  })
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--theme-elevation-100)' }}>
      <span style={{ width: '140px', flexShrink: 0, fontSize: '12px', fontWeight: 600, color: 'var(--theme-text)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', color: 'var(--theme-text)', flex: 1 }}>{children}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ margin: '24px 0 4px', fontSize: '13px', fontWeight: 700, color: BRAND.goldDark, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}
    </h3>
  )
}

function Pill({ text, tone }: { text: string; tone: keyof typeof STATUS }) {
  return (
    <span style={{ display: 'inline-flex', padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: STATUS[tone].bg, color: STATUS[tone].color }}>
      {text}
    </span>
  )
}

export function OrderDetailModal({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [error, setError] = useState('')
  const [openBooking, setOpenBooking] = useState<BookingRow | null>(null)

  useEffect(() => {
    let cancelled = false
    getOrderDetail(orderId)
      .then((o) => !cancelled && setOrder(o))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'Bestellung konnte nicht geladen werden.'))
    return () => {
      cancelled = true
    }
  }, [orderId])

  if (openBooking) {
    return <BookingDetailModal booking={openBooking} onClose={() => setOpenBooking(null)} />
  }

  const status = order ? ORDER_STATUS[order.status] : null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--theme-elevation-0)', borderRadius: '14px', padding: '28px 32px',
          maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--theme-text)' }}>
              {order ? order.customer.name || order.customer.email || 'Bestellung' : 'Bestellung'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.6, fontFamily: 'monospace' }}>
              {order?.invoiceNumber}
              {order && ` · ${fmtDateTime(order.createdAt)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            style={{
              border: 'none', background: 'var(--theme-elevation-100)', borderRadius: '8px',
              width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: 'var(--theme-text)', flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {error && <p style={{ marginTop: '16px', fontSize: '13px', color: '#dc2626' }}>{error}</p>}
        {!order && !error && <p style={{ marginTop: '16px', fontSize: '13px', opacity: 0.5 }}>Wird geladen…</p>}

        {order && (
          <>
            <SectionTitle>Kund:in</SectionTitle>
            <Row label="E-Mail">
              {order.customer.email ? (
                <a href={`mailto:${order.customer.email}`} style={{ color: 'var(--theme-text)' }}>{order.customer.email}</a>
              ) : '—'}
            </Row>
            <Row label="Telefon">{order.customer.phone || '—'}</Row>
            <Row label="Konto">{order.customer.hasAccount ? 'Registriertes Kundenkonto' : 'Gast (ohne Konto)'}</Row>
            {order.customer.address && <Row label="Adresse">{order.customer.address}</Row>}
            {order.customer.notes && <Row label="Hinweise">{order.customer.notes}</Row>}

            <SectionTitle>Gekauft</SectionTitle>
            {order.items.map((item, i) => (
              <Row key={i} label={item.quantity > 1 ? `${item.quantity} ×` : 'Artikel'}>{item.title}</Row>
            ))}
            {order.voucher && (
              <>
                <Row label="Gutschein">
                  <strong>€{order.voucher.value}</strong> · <span style={{ fontFamily: 'monospace' }}>{order.voucher.code}</span>
                </Row>
                {order.voucher.recipient && <Row label="Beschenkt">{order.voucher.recipient}</Row>}
                {order.voucher.delivery && (
                  <Row label="Zustellung">{VOUCHER_DELIVERY[order.voucher.delivery] ?? order.voucher.delivery}</Row>
                )}
                <Row label="Eingelöst">
                  {order.voucher.redeemed
                    ? `Ja${order.voucher.redeemedOn ? ` · ${fmtDateTime(order.voucher.redeemedOn)}` : ''}`
                    : 'Noch nicht'}
                </Row>
              </>
            )}
            {order.items.length === 0 && !order.voucher && <Row label="Artikel">—</Row>}
            <Row label="Betrag"><strong>{fmtMoney(order.amount)}</strong></Row>
            <Row label="Status">{status ? <Pill text={status.label} tone={status.tone} /> : order.status || '—'}</Row>

            {order.bookings.length > 0 && (
              <>
                <SectionTitle>Workshop-Buchungen</SectionTitle>
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.5 }}>
                  Antippen für Gäste, Status und Verlauf.
                </p>
                {order.bookings.map((b) => {
                  const seats = Math.max(b.guestCount, 1)
                  const statuses = Array.from({ length: seats }, (_, i) => b.seats[i]?.seatStatus || 'active')
                  const leftCount = statuses.filter((s) => s !== 'active').length
                  return (
                    <button
                      key={b.id}
                      onClick={() => setOpenBooking(b)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
                        border: '1px solid var(--theme-elevation-100)', borderRadius: '8px',
                        background: 'var(--theme-elevation-50)', padding: '10px 12px', marginBottom: '8px',
                        color: 'var(--theme-text)',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{b.workshopTitle}</div>
                      <div style={{ fontSize: '13px', opacity: 0.7 }}>
                        {b.date} · {b.time} · {seats} {seats === 1 ? 'Platz' : 'Plätze'}
                      </div>
                      {leftCount > 0 && (
                        <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {statuses.map((s, i) => (s === 'active' ? null : (
                            <Pill key={i} text={`Platz ${i + 1}: ${seatStatusLabel(s).label}`} tone={seatStatusLabel(s).tone} />
                          )))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </>
            )}

            {order.pickup && (
              <>
                <SectionTitle>Abholung</SectionTitle>
                <Row label="Wann">{[order.pickup.date, order.pickup.time].filter(Boolean).join(' · ')}</Row>
                {order.pickup.location && <Row label="Wo">{order.pickup.location}</Row>}
                <Row label="Status">{order.pickup.status || '—'}</Row>
              </>
            )}

            <SectionTitle>Zahlung</SectionTitle>
            <Row label="Art">
              {order.payment.method === 'manual'
                ? 'Manuell (Überweisung, bar, telefonisch …)'
                : order.payment.method === 'stripe'
                  ? 'Online (Stripe)'
                  : order.voucher
                    ? 'Online (Stripe)'
                    : order.payment.method || '—'}
            </Row>
            {order.payment.referenceNote && <Row label="Referenz">{order.payment.referenceNote}</Row>}
            {order.payment.transactions.map((t, i) => (
              <Row key={i} label={`Zahlung ${order.payment.transactions.length > 1 ? i + 1 : ''}`.trim()}>
                {TX_STATUS[t.status] ?? t.status} · {fmtMoney(t.amount)}
                {t.voucherCode && <> · mit Gutschein <span style={{ fontFamily: 'monospace' }}>{t.voucherCode}</span></>}
                {t.stripeUrl && (
                  <>
                    {' · '}
                    <a href={t.stripeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-text)' }}>
                      in Stripe öffnen ↗
                    </a>
                  </>
                )}
              </Row>
            ))}

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={`/api/admin/orders/${order.id}/receipt`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 14px', borderRadius: '8px', background: BRAND.gold, color: BRAND.nearBlack,
                  fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                }}
              >
                Rechnung ↓
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
