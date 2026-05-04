import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type { WorkshopBooking } from '@/payload-types'
import { generateWorkshopReceiptPDF } from '@/lib/generateWorkshopReceiptPDF'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/bookings/[bookingId]/receipt?token=<downloadToken>
 *
 *  Token-secured endpoint: returns a PDF receipt for a confirmed
 *  workshop booking. No authentication cookie required — the
 *  downloadToken (UUID stored on the booking) acts as the credential.
 *
 *  Security:
 *  - Token must match the stored downloadToken exactly
 *  - Returns 401 for missing/invalid token
 *  - Returns 404 for unknown bookingId
 *  - Returns 403 if booking is not confirmed
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    const { bookingId } = await params
    const token = request.nextUrl.searchParams.get('token')

    // ── Input validation ──────────────────────────────────────────────────
    if (!bookingId || typeof bookingId !== 'string' || bookingId.trim().length === 0) {
      return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 })
    }

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { error: 'Download token is required.' },
        { status: 401 },
      )
    }

    const payload = await getPayload({ config: await configPromise })

    // ── Fetch booking ──────────────────────────────────────────────────────
    let booking: WorkshopBooking | null = null
    try {
      booking = await payload.findByID({
        collection: 'workshop-bookings',
        id: bookingId,
        depth: 0,
        overrideAccess: false,
      })
    } catch {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }

    // ── Token validation ───────────────────────────────────────────────────
    const storedToken = booking.downloadToken

    if (!storedToken || storedToken !== token) {
      return NextResponse.json({ error: 'Invalid or expired download token.' }, { status: 401 })
    }

    // ── Status check ───────────────────────────────────────────────────────
    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Receipt is only available for confirmed bookings.' },
        { status: 403 },
      )
    }

    // ── Build receipt data ─────────────────────────────────────────────────
    const issueDate = booking.updatedAt ? new Date(booking.updatedAt as string) : new Date()

    const pdfBuffer = generateWorkshopReceiptPDF({
      bookingId: String(booking.id),
      workshopTitle: booking.workshopTitle ?? 'Workshop',
      workshopDate: booking.date ?? '',
      workshopTime: booking.time ?? '',
      workshopLocation: undefined, // Location data not stored on booking — add if needed
      guestCount: booking.guestCount ?? 1,
      pricePerPerson: booking.pricePerPerson ?? 0,
      totalPrice: booking.totalPrice ?? 0,
      customerFirstName: booking.firstName ?? '',
      customerLastName: booking.lastName ?? '',
      customerEmail: booking.email ?? '',
      issueDate,
      locale: 'de', // Receipts default to German (Austrian market)
    })

    // ── Stream PDF ─────────────────────────────────────────────────────────
    const safeBookingRef = `BOOKING-${String(booking.id).slice(-8).toUpperCase()}`
    const filename = `fermentfreude-${safeBookingRef}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[receipt] Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
