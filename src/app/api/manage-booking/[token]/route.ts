import { NextRequest, NextResponse } from 'next/server'

import { getAllSeatBundles, resolveMagicLink } from '@/lib/manageBooking'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/manage-booking/[token]
 *
 *  Token-secured, no-login. Returns the booking summary + per-seat
 *  action options, freshly computed against the current server time —
 *  the client re-fetches this after every mutation rather than trying
 *  to compute the next state itself.
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const resolved = await resolveMagicLink(token)

  if (!resolved.ok) {
    const status = resolved.reason === 'expired' ? 410 : 404
    return NextResponse.json({ success: false, error: resolved.reason }, { status })
  }

  const { booking, appointment, magicLink } = resolved
  const seats = getAllSeatBundles(booking, appointment, new Date())

  return NextResponse.json({
    success: true,
    scope: magicLink.scope,
    booking: {
      id: booking.id,
      workshopTitle: booking.workshopTitle,
      workshopSlug: booking.workshopSlug,
      date: booking.date,
      time: booking.time,
      guestCount: booking.guestCount,
    },
    appointment: appointment
      ? {
          id: appointment.id,
          dateTime: appointment.dateTime,
        }
      : null,
    seats,
  })
}
