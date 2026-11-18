import type { Payload } from 'payload'

import { capacityOf, FALLBACK_CAPACITY } from '@/lib/appointmentCapacity'
import { releaseSpotsAtomic, reserveSpotsAtomic } from '@/lib/atomicSpots'
import { addBookingHistory } from '@/lib/bookingHistory'
import { isValidEmail } from '@/lib/workshopSeats'
import { CHANNEL_LABEL, isChannel, type ManualChannel } from '@/lib/manualBooking'
import { seatHoldsPlace, seatsHoldingPlace, seatStatusAt } from '@/lib/seatCapacity'

/**
 * Editing a booking after it was added: phone, price, how it came in, and the
 * number of seats. Price and seat count only for bookings WITHOUT an online
 * order — what a customer paid online stays as it was. Not network-callable;
 * the server actions in bookingEditActions.ts check the admin role first.
 *
 * Sequential writes only (MongoDB Atlas M0).
 */

const MAX_SEATS = 50 // sanity limit only; the date's own capacity is what really limits a booking

async function loadCapacity(payload: Payload, appointmentId: string): Promise<number> {
  try {
    return capacityOf(await payload.findByID({ collection: 'workshop-appointments', id: appointmentId, depth: 1, overrideAccess: true }))
  } catch {
    return FALLBACK_CAPACITY
  }
}

export async function editBookingDetails(
  payload: Payload,
  bookingId: string,
  input: { phone?: string; pricePerPerson?: number; channel?: ManualChannel | '' },
  by: string,
): Promise<void> {
  const booking = await payload.findByID({ collection: 'workshop-bookings', id: bookingId, depth: 0, overrideAccess: true })
  const data: Record<string, unknown> = {}
  const changes: string[] = []

  if (input.phone !== undefined) {
    const phone = input.phone.trim().slice(0, 40)
    if (phone !== (booking.phone ?? '')) {
      data.phone = phone || null
      changes.push(`Telefon ${booking.phone || '(leer)'} → ${phone || '(leer)'}`)
    }
  }

  if (input.pricePerPerson !== undefined && input.pricePerPerson !== (booking.pricePerPerson ?? 0)) {
    if (booking.orderId) throw new Error('Der Preis einer Buchung mit Rechnung oder Online-Bestellung kann hier nicht geändert werden.')
    const price = Number(input.pricePerPerson)
    if (!Number.isFinite(price) || price < 0 || price > 1000) throw new Error('Bitte einen gültigen Preis pro Person angeben.')
    data.pricePerPerson = price
    data.totalPrice = Math.round(price * seatsHoldingPlace(booking) * 100) / 100
    changes.push(`Preis pro Person ${booking.pricePerPerson ?? 0} € → ${price} €`)
  }

  if (input.channel !== undefined && input.channel !== '') {
    if (!isChannel(input.channel)) throw new Error('Ungültige Herkunft der Buchung.')
    const info = (booking as { manualInfo?: { channel?: string } }).manualInfo ?? {}
    if (info.channel !== input.channel) {
      data.manualInfo = { ...info, channel: input.channel }
      changes.push(`Herkunft: ${CHANNEL_LABEL[input.channel]}`)
    }
  }

  if (changes.length === 0) return
  await payload.update({ collection: 'workshop-bookings', id: bookingId, data: data as never, overrideAccess: true, context: { skipAutoTranslate: true } })
  await addBookingHistory(payload, bookingId, { type: 'details_edited', summary: changes.join(' · '), by })
}

/** Add `count` seats to a hand-entered booking (reserves them on the date first). */
export async function addSeats(payload: Payload, bookingId: string, count: number, by: string): Promise<void> {
  const booking = await payload.findByID({ collection: 'workshop-bookings', id: bookingId, depth: 0, overrideAccess: true })
  if (booking.orderId) throw new Error('Plätze einer Buchung mit Rechnung oder Online-Bestellung können hier nicht dazugebucht werden.')
  if (!booking.appointmentId) throw new Error('Diese Buchung hat keinen zugeordneten Termin.')
  if (!Number.isInteger(count) || count < 1) throw new Error('Bitte eine Anzahl von mindestens 1 angeben.')
  const current = Math.max(booking.guestCount ?? 1, booking.seats?.length ?? 0)
  if (current + count > MAX_SEATS) throw new Error(`Eine Buchung kann höchstens ${MAX_SEATS} Plätze haben.`)

  const reserve = await reserveSpotsAtomic(payload, booking.appointmentId, count)
  if (!reserve.success) throw new Error(`Nur noch ${reserve.availableSpots ?? 0} Platz/Plätze frei.`)
  try {
    const seats = Array.from({ length: current }, (_, i) => ({ ...(booking.seats?.[i] ?? { seatStatus: 'active' as const }) }))
    for (let i = 0; i < count; i++) seats.push({ seatStatus: 'active' })
    const holding = seats.filter((_, i) => seatHoldsPlace(seats[i].seatStatus ?? 'active')).length
    await payload.update({
      collection: 'workshop-bookings',
      id: bookingId,
      data: { guestCount: current + count, seats, totalPrice: Math.round((booking.pricePerPerson ?? 0) * holding * 100) / 100 } as never,
      overrideAccess: true,
      context: { skipAutoTranslate: true },
    })
  } catch (err) {
    await releaseSpotsAtomic(payload, booking.appointmentId, count, await loadCapacity(payload, booking.appointmentId))
    throw err
  }
  await addBookingHistory(payload, bookingId, { type: 'seats_changed', summary: `${count} ${count === 1 ? 'Platz' : 'Plätze'} dazugebucht (jetzt ${current + count})`, by })
}

/** Drop one person from a hand-entered booking: the seat is marked cancelled and its place is freed. */
export async function cancelSeat(payload: Payload, bookingId: string, seatIndex: number, by: string): Promise<void> {
  const booking = await payload.findByID({ collection: 'workshop-bookings', id: bookingId, depth: 0, overrideAccess: true })
  if (booking.orderId) throw new Error('Plätze einer Buchung mit Rechnung oder Online-Bestellung laufen über Erstattung oder Umbuchung.')
  const total = Math.max(booking.guestCount ?? 1, booking.seats?.length ?? 0)
  if (!Number.isInteger(seatIndex) || seatIndex < 0 || seatIndex >= total) throw new Error('Diesen Platz gibt es nicht.')
  if (!seatHoldsPlace(seatStatusAt(booking, seatIndex))) throw new Error('Dieser Platz ist schon frei.')
  if (seatsHoldingPlace(booking) <= 1) throw new Error('Das ist der letzte Platz. Bitte die ganze Buchung entfernen.')

  const seats = Array.from({ length: total }, (_, i) => ({ ...(booking.seats?.[i] ?? { seatStatus: 'active' as const }) }))
  seats[seatIndex] = { ...seats[seatIndex], seatStatus: 'cancelled_no_refund', cancelledAt: new Date().toISOString(), cancelledReason: 'other' }
  const holding = seats.filter((s) => seatHoldsPlace(s.seatStatus ?? 'active')).length
  await payload.update({
    collection: 'workshop-bookings',
    id: bookingId,
    data: { seats, totalPrice: Math.round((booking.pricePerPerson ?? 0) * holding * 100) / 100 } as never,
    overrideAccess: true,
    context: { skipAutoTranslate: true },
  })
  if (booking.appointmentId) {
    try {
      await releaseSpotsAtomic(payload, booking.appointmentId, 1, await loadCapacity(payload, booking.appointmentId))
    } catch (err) {
      payload.logger.error(`[cancelSeat] Seat ${seatIndex} of ${bookingId} cancelled, but freeing the place failed: ${err instanceof Error ? err.message : err}`)
    }
  }
  await addBookingHistory(payload, bookingId, { type: 'seats_changed', summary: `Platz ${seatIndex + 1} gestrichen (jetzt ${holding} ${holding === 1 ? 'Platz' : 'Plätze'})`, by })
}

/**
 * One person's name, email and note (seat 0 = the buyer, stored on the booking;
 * other seats inside the seat entry). Every change is written to the history,
 * including the old and new value.
 */
export async function editSeatCore(
  payload: Payload,
  params: { bookingId: string; seatIndex: number; name: string; notes: string; email: string },
  by: string,
): Promise<void> {
  const booking = await payload.findByID({ collection: 'workshop-bookings', id: params.bookingId, depth: 0, overrideAccess: true })
  const name = params.name.trim()
  const notes = params.notes.trim()
  const email = params.email.trim()
  if (email && !isValidEmail(email)) throw new Error('Bitte eine gültige E-Mail-Adresse angeben.')

  const seat = params.seatIndex === 0 ? undefined : booking.seats?.[params.seatIndex]
  const before = {
    name: params.seatIndex === 0 ? [booking.firstName, booking.lastName].filter(Boolean).join(' ').trim() : (seat?.recipientName ?? '').trim(),
    email: ((params.seatIndex === 0 ? booking.email : seat?.email) ?? '').trim(),
    notes: ((params.seatIndex === 0 ? booking.notes : seat?.giftNote) ?? '').trim(),
  }

  if (params.seatIndex === 0) {
    // Only re-split the name when it was actually changed — otherwise saving
    // just an email would turn "Anna Maria" + "Müller" into "Anna" + "Maria Müller".
    const [firstName, ...rest] = name.split(' ')
    const nameData = name === before.name ? {} : { firstName: firstName ?? '', lastName: rest.join(' ') }
    await payload.update({
      collection: 'workshop-bookings',
      id: params.bookingId,
      data: { ...nameData, notes, email: email || null },
      overrideAccess: true,
    })
  } else {
    const seats = Array.isArray(booking.seats) ? [...booking.seats] : []
    while (seats.length <= params.seatIndex) seats.push({ seatStatus: 'active' })
    seats[params.seatIndex] = { ...seats[params.seatIndex], recipientName: name, email: email || null, giftNote: notes }
    await payload.update({ collection: 'workshop-bookings', id: params.bookingId, data: { seats } as never, overrideAccess: true })
  }

  // History: what changed, old → new.
  const q = (v: string) => v || '(leer)'
  const changes: string[] = []
  if (name !== before.name) changes.push(`Name ${q(before.name)} → ${q(name)}`)
  if (email.toLowerCase() !== before.email.toLowerCase()) changes.push(`E-Mail ${q(before.email)} → ${q(email)}`)
  if (notes !== before.notes) changes.push(`Notiz: ${q(before.notes)} → ${q(notes)}`)
  if (changes.length === 0) return
  await addBookingHistory(payload, params.bookingId, {
    type: email.toLowerCase() !== before.email.toLowerCase() && changes.length === 1 ? 'email_changed' : 'details_edited',
    summary: `Platz ${params.seatIndex + 1}: ${changes.join(' · ')}`,
    by,
  })
}

export const RELEASE_REASONS = {
  no_show: 'Nicht erschienen',
  late_cancel: 'Zu spät abgesagt (keine Erstattung)',
  never_paid: 'Zahlung nie eingegangen',
  test: 'Test-Buchung',
  other: 'Sonstiges',
} as const
export type ReleaseReason = keyof typeof RELEASE_REASONS

/**
 * "Platz freigeben": the person is not coming. The chosen seats are marked
 * cancelled (no refund) and their places go back on sale. The booking, its
 * order and any invoice stay untouched — invoices are never deleted here, and
 * a refund is a separate step (Erstattungen). Works for every kind of booking.
 */
export async function releaseSeats(
  payload: Payload,
  params: { bookingId: string; seatIndexes: number[]; reason: ReleaseReason; note?: string },
  by: string,
): Promise<{ released: number }> {
  if (!(params.reason in RELEASE_REASONS)) throw new Error('Bitte einen Grund wählen.')
  const booking = await payload.findByID({ collection: 'workshop-bookings', id: params.bookingId, depth: 0, overrideAccess: true })
  const total = Math.max(booking.guestCount ?? 1, booking.seats?.length ?? 0)
  const picked = [...new Set(params.seatIndexes)].filter((i) => Number.isInteger(i) && i >= 0 && i < total).sort((a, b) => a - b)
  if (picked.length === 0) throw new Error('Bitte mindestens eine Person auswählen.')
  for (const i of picked) {
    if (!seatHoldsPlace(seatStatusAt(booking, i))) throw new Error(`Platz ${i + 1} ist schon frei.`)
  }

  const now = new Date().toISOString()
  const seats = Array.from({ length: total }, (_, i) => ({ ...(booking.seats?.[i] ?? { seatStatus: 'active' as const }) }))
  for (const i of picked) seats[i] = { ...seats[i], seatStatus: 'cancelled_no_refund', cancelledAt: now, cancelledReason: 'other' }
  const holding = seats.filter((s) => seatHoldsPlace(s.seatStatus ?? 'active')).length
  await payload.update({
    collection: 'workshop-bookings',
    id: params.bookingId,
    data: {
      seats,
      // What a customer paid online stays as it was; hand-entered bookings follow the remaining seats.
      ...(booking.orderId ? {} : { totalPrice: Math.round((booking.pricePerPerson ?? 0) * holding * 100) / 100 }),
    } as never,
    overrideAccess: true,
    context: { skipAutoTranslate: true },
  })
  if (booking.appointmentId) {
    try {
      await releaseSpotsAtomic(payload, booking.appointmentId, picked.length, await loadCapacity(payload, booking.appointmentId))
    } catch (err) {
      payload.logger.error(`[releaseSeats] Seats of ${params.bookingId} cancelled, but freeing the places failed: ${err instanceof Error ? err.message : err}`)
    }
  }
  const names = picked.map((i) => (i === 0 ? [booking.firstName, booking.lastName].filter(Boolean).join(' ') : booking.seats?.[i]?.recipientName) || `Platz ${i + 1}`)
  await addBookingHistory(payload, params.bookingId, {
    type: 'seat_released',
    summary: `Platz ${picked.map((i) => i + 1).join(', ')} freigegeben (${names.join(', ')}) · ${RELEASE_REASONS[params.reason]}${params.note?.trim() ? ` · ${params.note.trim().slice(0, 200)}` : ''}${booking.orderId ? ' · Rechnung und Bestellung bleiben bestehen, keine Erstattung' : ''}`,
    by,
  })
  return { released: picked.length }
}
