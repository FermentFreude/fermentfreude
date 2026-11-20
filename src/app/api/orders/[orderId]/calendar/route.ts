import { generateBookingICS } from '@/lib/generateBookingICS'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/orders/[orderId]/calendar?token=<downloadToken>&booking=<bookingId>
 *
 *  Token-secured endpoint: returns an .ics calendar file for ONE workshop
 *  booking of a paid order (date, time and location of its appointment), so
 *  customers can add it to Apple / Google / Outlook calendar with one tap.
 *  Same protection as /receipt: the order's downloadToken is the credential.
 *
 *  Read-only — never changes any booking or order.
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params
    const token = request.nextUrl.searchParams.get('token')
    const bookingId = request.nextUrl.searchParams.get('booking')

    if (!orderId?.trim()) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 })
    }
    if (!token?.trim()) {
      return NextResponse.json({ error: 'Download token is required.' }, { status: 401 })
    }
    if (!bookingId?.trim()) {
      return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config: await configPromise })

    // ── Order + token ──────────────────────────────────────────────────────
    let order: Record<string, unknown> | null = null
    try {
      order = (await payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
        overrideAccess: true, // token is the auth — no cookie required
      })) as unknown as Record<string, unknown> | null
    } catch {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })

    const storedToken = order.downloadToken as string | undefined | null
    if (!storedToken || storedToken !== token) {
      return NextResponse.json({ error: 'Invalid or expired download token.' }, { status: 401 })
    }

    const status = (order.orderstatus ?? order.status ?? order.paymentStatus) as string | undefined
    if (status === 'cancelled' || status === 'refunded' || status === 'failed') {
      return NextResponse.json(
        { error: 'Calendar file is not available for cancelled or refunded orders.' },
        { status: 403 },
      )
    }

    // ── Booking must belong to this order ──────────────────────────────────
    let booking: Record<string, unknown> | null = null
    try {
      booking = (await payload.findByID({
        collection: 'workshop-bookings',
        id: bookingId,
        depth: 0,
        overrideAccess: true,
      })) as unknown as Record<string, unknown> | null
    } catch {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }
    if (!booking || String(booking.orderId ?? '') !== String(orderId)) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }

    // ── Date / time / location from the appointment (Europe/Vienna) ───────
    // booking.date is a German display string ("4. Mai 2026") the iCal builder
    // can't parse, so — like the confirmation email — use the appointment's dateTime.
    let icsDate = ''
    let icsTime = String(booking.time ?? '')
    let location = ''
    const appointmentId = booking.appointmentId as string | null | undefined
    if (appointmentId) {
      try {
        const appointment = (await payload.findByID({
          collection: 'workshop-appointments',
          id: appointmentId,
          depth: 1,
          overrideAccess: true,
        })) as unknown as Record<string, unknown> | null
        const loc = appointment?.location
        if (typeof loc === 'object' && loc !== null) {
          const l = loc as { name?: string; address?: string }
          location = [l.name, l.address].filter(Boolean).join(', ')
        }
        const raw = appointment?.dateTime
        if (typeof raw === 'string' || raw instanceof Date) {
          const dt = new Date(raw as string | Date)
          if (!Number.isNaN(dt.getTime())) {
            const parts = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Europe/Vienna',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).formatToParts(dt)
            const y = parts.find((p) => p.type === 'year')?.value
            const m = parts.find((p) => p.type === 'month')?.value
            const d = parts.find((p) => p.type === 'day')?.value
            if (y && m && d) icsDate = `${y}-${m}-${d}`
            const timeOpts: Intl.DateTimeFormatOptions = {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Vienna',
              hour12: false,
            }
            const start = dt.toLocaleTimeString('de-DE', timeOpts)
            const end = new Date(dt.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString('de-DE', timeOpts)
            icsTime = `${start} – ${end}`
          }
        }
      } catch {
        // best-effort — fall back to the booking's own date/time
      }
    }

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'
    const ics = generateBookingICS({
      bookingId: String(booking.id),
      title: `${String(booking.workshopTitle ?? 'Workshop')} – Fermentfreude`,
      date: icsDate || String(booking.date ?? ''),
      time: icsTime,
      location: location || undefined,
      url: `${serverUrl}/account/orders/${orderId}`,
    })

    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="fermentfreude-workshop.ics"',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('[calendar] Failed to build calendar file:', error)
    return NextResponse.json({ error: 'Could not create calendar file.' }, { status: 500 })
  }
}
