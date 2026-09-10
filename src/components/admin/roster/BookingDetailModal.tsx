'use client'

import React from 'react'

import type { BookingRow } from './types'
import { BRAND, STATUS } from './rosterTheme'

interface Props {
  booking: BookingRow
  onClose: () => void
}

const SEAT_STATUS_LABELS: Record<string, { label: string; tone: keyof typeof STATUS }> = {
  active: { label: 'Aktiv', tone: 'success' },
  cancelled_no_refund: { label: 'Storniert — keine Rückerstattung', tone: 'danger' },
  rebooking_pending: { label: 'Umbuchung ausstehend', tone: 'warning' },
  rebooked: { label: 'Umgebucht', tone: 'info' },
  refund_requested: { label: 'Rückerstattung angefragt', tone: 'warning' },
  refunded: { label: 'Rückerstattet', tone: 'danger' },
  voucher_issued: { label: 'Gutschein ausgestellt', tone: 'purple' },
  organiser_cancelled_pending: { label: 'Von uns storniert — wartet auf Kunde', tone: 'warning' },
  no_show: { label: 'Nicht erschienen', tone: 'neutral' },
}

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

export function BookingDetailModal({ booking, onClose }: Props) {
  const buyerName = [booking.firstName, booking.lastName].filter(Boolean).join(' ') || booking.email || '—'
  const seatCount = Math.max(booking.guestCount, 1)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--theme-elevation-0)', borderRadius: '14px',
          padding: '28px 32px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--theme-text)' }}>{buyerName}</p>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.6 }}>
              {booking.workshopTitle} · {booking.date} · {booking.time}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            style={{
              border: 'none', background: 'var(--theme-elevation-100)', borderRadius: '8px',
              width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: 'var(--theme-text)',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <SectionTitle>Käufer</SectionTitle>
        <Row label="E-Mail">
          {booking.email ? <a href={`mailto:${booking.email}`} style={{ color: 'var(--theme-text)' }}>{booking.email}</a> : '—'}
        </Row>
        <Row label="Telefon">{booking.phone || '—'}</Row>

        <SectionTitle>Buchung</SectionTitle>
        <Row label="Status">
          <span style={{
            display: 'inline-flex', padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
            background: STATUS.success.bg, color: STATUS.success.color,
          }}>
            {booking.status}
          </span>
        </Row>
        <Row label="Gebucht am">{fmtDateTime(booking.createdAt) || '—'}</Row>
        <Row label="Bestellung">{booking.orderId ? `#${booking.orderId}` : '—'}</Row>
        <Row label="Personen">{booking.guestCount}</Row>
        <Row label="Preis">
          {booking.pricePerPerson} € × {booking.guestCount} = {booking.totalPrice} €
        </Row>
        {booking.notes && <Row label="Anmerkungen">{booking.notes}</Row>}

        <SectionTitle>Gäste ({seatCount})</SectionTitle>
        {Array.from({ length: seatCount }).map((_, si) => {
          const isBuyer = si === 0
          const seat = booking.seats[si]
          const name = seat?.recipientName || (isBuyer ? buyerName : `Gast von ${buyerName}`)
          const statusInfo = seat?.seatStatus ? SEAT_STATUS_LABELS[seat.seatStatus] : null
          return (
            <div
              key={si}
              style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px',
                padding: '10px 0', borderBottom: '1px solid var(--theme-elevation-100)',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'var(--theme-text)' }}>
                  Platz {si + 1}: {name}{isBuyer && <span style={{ opacity: 0.5, fontWeight: 400 }}> (Käufer)</span>}
                </p>
                {seat?.giftNote && (
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.7 }}>
                    {seat.giftNote}
                  </p>
                )}
                {seat?.cancelledReason && (
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.5 }}>
                    Grund: {seat.cancelledReason}
                  </p>
                )}
              </div>
              {statusInfo && (
                <span style={{
                  flexShrink: 0, padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                  background: STATUS[statusInfo.tone].bg, color: STATUS[statusInfo.tone].color,
                }}>
                  {statusInfo.label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
