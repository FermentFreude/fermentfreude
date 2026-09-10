'use client'

import React, { useState } from 'react'

import { AddManualBookingForm } from './AddManualBookingForm'
import { BookingDetailModal } from './BookingDetailModal'
import { DeleteBookingControl } from './DeleteBookingControl'
import { EditSeatControl } from './EditSeatControl'
import { MoveBookingControl } from './MoveBookingControl'
import { SendAlternateDateEmailBar } from './SendAlternateDateEmailBar'
import type { AppointmentRow, BookingRow } from './types'
import { BRAND, STATUS, workshopColor } from './rosterTheme'

interface Props {
  appointment: AppointmentRow
  bookings: BookingRow[]
  onBack: () => void
  onRefresh: () => void
}

function statusBadgeLabel(totalBooked: number, capacity: number): { label: string; bg: string; color: string } | null {
  if (capacity === 0) return null
  if (totalBooked > capacity) return { label: 'Überbucht', bg: STATUS.warning.bg, color: STATUS.warning.color }
  if (totalBooked >= capacity) return { label: 'Ausgebucht', bg: STATUS.danger.bg, color: STATUS.danger.color }
  return { label: 'Verfügbar', bg: STATUS.success.bg, color: STATUS.success.color }
}

function fmtBookingDate(iso: string): string {
  if (!iso) return ''
  return 'Gebucht am ' + new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Vienna',
  })
}

// Extra guests on a booking rarely have their own name/order reference — pull
// whatever order number the buyer's card has (either the real orderId, or the
// "#..." embedded in an import note like "[Wix Import — Order #10301]") so an
// unnamed guest can still be traced back to the order they belong to.
function extractOrderRef(notes: string, orderId: string): string {
  if (orderId) return orderId
  const match = notes.match(/Order #([\w-]+)/)
  return match ? match[1] : ''
}

export function WorkshopDetailView({ appointment, bookings, onBack, onRefresh }: Props) {
  const badge = statusBadgeLabel(appointment.totalBooked, appointment.capacity)
  const wc = workshopColor(appointment.workshopTitle)
  const [showForm, setShowForm] = useState(false)
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([])
  const [detailBooking, setDetailBooking] = useState<BookingRow | null>(null)
  const remainingSpots = Math.max(appointment.capacity - appointment.totalBooked, 0)

  const toggleSelected = (bookingId: string) => {
    setSelectedBookingIds((prev) =>
      prev.includes(bookingId) ? prev.filter((id) => id !== bookingId) : [...prev, bookingId],
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px' }}>
        <div>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55,
              padding: '0 0 10px', marginLeft: '-2px',
            }}
          >
            ← Zurück
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '40px', height: '40px', borderRadius: '11px', background: wc.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
              }}
              aria-hidden
            >
              {wc.icon}
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 }}>
              {appointment.workshopTitle}
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55 }}>
            {appointment.date}
          </p>
        </div>
        {badge && (
          <span style={{
            padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
            background: badge.bg, color: badge.color, whiteSpace: 'nowrap', flexShrink: 0, marginTop: '28px',
          }}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Participant list */}
      <div style={{
        background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
        borderRadius: '12px', padding: '24px', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--theme-text)' }}>Teilnehmerliste</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              {bookings.length} bestätigt
            </span>
            <button
              onClick={() => setShowForm((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: BRAND.gold, color: BRAND.nearBlack, fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>{showForm ? '×' : '+'}</span>
              {showForm ? 'Abbrechen' : 'Sitzplatz manuell hinzufügen'}
            </button>
          </div>
        </div>

        {showForm && (
          <AddManualBookingForm
            appointmentId={appointment.id}
            remainingSpots={remainingSpots}
            onDone={() => {
              setShowForm(false)
              onRefresh()
            }}
          />
        )}

        <SendAlternateDateEmailBar
          selectedBookingIds={selectedBookingIds}
          currentAppointmentId={appointment.id}
          onSent={() => setSelectedBookingIds([])}
        />

        {bookings.length === 0 ? (
          <p style={{ color: 'var(--theme-text)', opacity: 0.5, margin: 0 }}>Noch keine bestätigten Buchungen.</p>
        ) : (() => {
          // Expand each booking into one card per seat so dietary notes are shown individually.
          type SeatCard = {
            key: string
            bookingId: string
            booking: BookingRow
            guestCount: number
            seatNumber: number
            seatIndex: number
            name: string
            editableName: string
            email: string
            phone: string
            notes: string
            createdAt: string
            isBuyer: boolean
            guestOfName: string
            orderRef: string
          }
          const cards: SeatCard[] = []
          let seatCounter = 0

          for (const booking of bookings) {
            const buyerName = [booking.firstName, booking.lastName].filter(Boolean).join(' ') || booking.email || '—'
            const orderRef = extractOrderRef(booking.notes, booking.orderId)
            const count = Math.max(booking.guestCount, 1)

            for (let si = 0; si < count; si++) {
              seatCounter++
              const seat = booking.seats[si]
              const isBuyer = si === 0
              // Seat 0 = buyer (recipientName is empty when buyer attends themselves).
              // An unnamed extra guest is shown as "Gast von {buyer}" — never a bare
              // "Gast N" — so it's always traceable back to who booked them in.
              const seatName = seat?.recipientName || (isBuyer ? buyerName : `Gast von ${buyerName}`)
              const seatNotes = seat?.giftNote || (isBuyer ? booking.notes : '')

              cards.push({
                key: `${booking.id}-${si}`,
                bookingId: booking.id,
                booking,
                guestCount: booking.guestCount,
                seatNumber: seatCounter,
                seatIndex: si,
                name: seatName,
                editableName: seat?.recipientName || (isBuyer ? buyerName : ''),
                email: isBuyer ? booking.email : '',
                phone: isBuyer ? booking.phone : '',
                notes: seatNotes,
                createdAt: booking.createdAt,
                isBuyer,
                guestOfName: !isBuyer && !seat?.recipientName ? buyerName : '',
                orderRef: !isBuyer ? orderRef : '',
              })
            }
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {cards.map((card) => (
                <div
                  key={card.key}
                  onClick={() => setDetailBooking(card.booking)}
                  style={{
                    background: 'var(--theme-elevation-0)', border: '1px solid var(--theme-elevation-100)',
                    borderRadius: '10px', padding: '18px', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {card.isBuyer && (
                        <input
                          type="checkbox"
                          checked={selectedBookingIds.includes(card.bookingId)}
                          onChange={() => toggleSelected(card.bookingId)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Für E-Mail-Versand auswählen"
                          style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                        />
                      )}
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%', background: wc.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700, color: wc.accent, flexShrink: 0,
                      }}>
                        {card.seatNumber}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--theme-text)' }}>{card.name}</span>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px',
                      background: STATUS.success.bg, color: STATUS.success.color,
                    }}>
                      Bestätigt
                    </span>
                  </div>

                  {card.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <a href={`mailto:${card.email}`} style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.75, textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none' }}
                      >
                        {card.email}
                      </a>
                    </div>
                  )}

                  {card.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z"/></svg>
                      <span style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.75 }}>{card.phone}</span>
                    </div>
                  )}

                  {!card.isBuyer && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <span style={{ fontSize: '13px', color: 'var(--theme-text)', opacity: 0.75 }}>
                        {card.guestOfName ? `Begleitung von ${card.guestOfName}` : 'Begleitung'}
                        {card.orderRef && ` · Bestellung #${card.orderRef}`}
                      </span>
                    </div>
                  )}

                  {card.notes && (
                    <div style={{
                      marginTop: '10px', padding: '10px 12px', borderRadius: '6px',
                      background: '#fffbeb', border: '1px solid #fbbf24',
                      display: 'flex', alignItems: 'flex-start', gap: '8px',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <span style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.4 }}>{card.notes}</span>
                    </div>
                  )}

                  <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.4 }}>
                    {fmtBookingDate(card.createdAt)}
                  </p>

                  <div onClick={(e) => e.stopPropagation()}>
                    <EditSeatControl
                      bookingId={card.bookingId}
                      seatIndex={card.seatIndex}
                      currentName={card.editableName}
                      currentNotes={card.notes}
                      onDone={onRefresh}
                    />
                  </div>

                  {card.isBuyer && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <MoveBookingControl
                        bookingId={card.bookingId}
                        guestCount={card.guestCount}
                        currentAppointmentId={appointment.id}
                        onDone={onRefresh}
                      />
                      {!card.booking.orderId && (
                        <DeleteBookingControl bookingId={card.bookingId} onDone={onRefresh} />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Teilnehmer', value: `${appointment.totalBooked}/${appointment.capacity}`, icon: '👤', bg: badge?.bg ?? STATUS.success.bg },
          { label: 'Uhrzeit', value: appointment.time, icon: '🕐', bg: STATUS.info.bg },
          { label: 'Preis', value: `€${appointment.pricePerPerson}`, icon: '€', bg: BRAND.goldTint },
          { label: 'Ort', value: appointment.locationName, icon: '📍', bg: wc.bg },
        ].map(({ label, value, icon, bg }) => (
          <div key={label} style={{
            background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
            borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px', background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
            }}>
              {icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--theme-text)', opacity: 0.5 }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 700, color: 'var(--theme-text)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      {appointment.workshopDescription && (
        <div style={{
          background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
          borderRadius: '12px', padding: '24px',
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: 'var(--theme-text)' }}>Beschreibung</h3>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--theme-text)', opacity: 0.75, lineHeight: 1.6 }}>
            {appointment.workshopDescription.replace(/<[^>]+>/g, '')}
          </p>
        </div>
      )}

      {detailBooking && <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />}
    </div>
  )
}
