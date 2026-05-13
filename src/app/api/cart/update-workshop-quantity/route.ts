import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type { WorkshopBooking } from '@/payload-types'
 
type Body = {
  appointmentId?: string
  bookingId?: string | null
  nextGuestCount?: number
}
 
function isIntInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}
 
/* ═══════════════════════════════════════════════════════════════
 *  POST /api/cart/update-workshop-quantity
 *
 *  Adjusts guest count for a pending workshop booking and reserves /
 *  releases appointment spots accordingly.
 *
 *  Body: { appointmentId, bookingId?, nextGuestCount }
 *  - Updates WorkshopAppointment.availableSpots (delta-based).
 *  - Updates WorkshopBooking.guestCount (+ totalPrice, seats length) when bookingId is provided.
 *  - Rejects updates for non-pending bookings.
 *  - Sequential writes only (Atlas M0).
 * ═══════════════════════════════════════════════════════════════ */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const { appointmentId, bookingId, nextGuestCount } = body
 
    if (!appointmentId || typeof appointmentId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid appointmentId.' },
        { status: 400 },
      )
    }
 
    if (!isIntInRange(nextGuestCount, 1, 12)) {
      return NextResponse.json(
        { success: false, error: 'Invalid nextGuestCount (must be 1–12).' },
        { status: 400 },
      )
    }
 
    const config = await configPromise
    const payload = await getPayload({ config })
 
    const appointment = await payload.findByID({
      collection: 'workshop-appointments',
      id: appointmentId,
      depth: 1,
      overrideAccess: true,
    })
 
    const maxCapacity =
      typeof appointment.workshop === 'object' && appointment.workshop !== null
        ? (appointment.workshop.maxCapacityPerSlot ?? 12)
        : 12
 
    let booking: WorkshopBooking | null = null
 
    if (bookingId && typeof bookingId === 'string') {
      try {
        booking = await payload.findByID({
          collection: 'workshop-bookings',
          id: bookingId,
          depth: 0,
          overrideAccess: true,
        })
      } catch {
        booking = null
      }
    }
 
    const prev =
      booking && typeof booking.guestCount === 'number' && Number.isFinite(booking.guestCount)
        ? booking.guestCount
        : null
 
    if (!prev || !isIntInRange(prev, 1, 12)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to determine current guest count.',
        },
        { status: 409 },
      )
    }
 
    if (booking && booking.status && booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Booking already confirmed; quantity can no longer be edited.' },
        { status: 409 },
      )
    }
 
    const delta = nextGuestCount - prev
    if (delta === 0) return NextResponse.json({ success: true, nextGuestCount, delta: 0 })
 
    if (delta > 0) {
      if (appointment.availableSpots < delta) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not enough spots available.',
            availableSpots: appointment.availableSpots,
            requestedAdditional: delta,
          },
          { status: 409 },
        )
      }
 
      await payload.update({
        collection: 'workshop-appointments',
        id: appointmentId,
        data: { availableSpots: appointment.availableSpots - delta },
        overrideAccess: true,
      })
    } else {
      const restore = Math.abs(delta)
      const restoredSpots = Math.min(appointment.availableSpots + restore, maxCapacity)
      await payload.update({
        collection: 'workshop-appointments',
        id: appointmentId,
        data: { availableSpots: restoredSpots },
        overrideAccess: true,
      })
    }
 
    if (booking && bookingId && typeof bookingId === 'string') {
      const pricePerPerson = typeof booking.pricePerPerson === 'number' ? booking.pricePerPerson : 99
      const totalPrice = pricePerPerson * nextGuestCount
 
    const prevSeats = Array.isArray(booking.seats) ? booking.seats : []
      const nextSeats =
        prevSeats.length === 0
          ? prevSeats
          : prevSeats.slice(0, nextGuestCount).concat(
              Array.from({ length: Math.max(0, nextGuestCount - prevSeats.length) }).map(() => ({})),
            )
 
      await payload.update({
        collection: 'workshop-bookings',
        id: bookingId,
        data: {
          guestCount: nextGuestCount,
          totalPrice,
          seats: nextSeats.length > 0 ? (nextSeats as WorkshopBooking['seats']) : undefined,
        },
        overrideAccess: true,
      })
    }
 
    return NextResponse.json({
      success: true,
      nextGuestCount,
      delta,
    })
  } catch (error) {
    console.error('[update-workshop-quantity]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

