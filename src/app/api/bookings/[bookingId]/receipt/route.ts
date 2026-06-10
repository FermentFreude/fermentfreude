import { generateWorkshopReceiptPDF } from '@/lib/generateWorkshopReceiptPDF'
import type { WorkshopBooking } from '@/payload-types'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

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
      return NextResponse.json({ error: 'Download token is required.' }, { status: 401 })
    }

    const payload = await getPayload({ config: await configPromise })

    // ── Fetch booking ──────────────────────────────────────────────────────
    let booking: WorkshopBooking | null = null
    try {
      booking = await payload.findByID({
        collection: 'workshop-bookings',
        id: bookingId,
        depth: 0,
        overrideAccess: true, // token is the auth — no cookie required
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

    // Look up the invoice number from the linked order.
    // booking.orderId may be absent if the charge.succeeded webhook confirmed
    // the booking before confirmWorkshopBookings ran — fall back to a cartSlug search.
    let invoiceNumber: string | null = null
    const orderId = booking.orderId ?? null
    if (orderId) {
      try {
        const order = await payload.findByID({
          collection: 'orders',
          id: orderId,
          depth: 0,
          overrideAccess: true,
        })
        invoiceNumber =
          ((order as unknown as Record<string, unknown>).invoiceNumber as string | null) ?? null
      } catch {
        // Non-fatal — fall back below
      }
    }
    // Fallback: find the order via cartSlug → transaction
    if (!invoiceNumber && booking.cartSlug) {
      try {
        const txs = await payload.find({
          collection: 'transactions',
          where: { cart: { equals: booking.cartSlug } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        const txDoc = txs.docs[0]
        const txOrder = txDoc ? (txDoc as unknown as Record<string, unknown>).order : null
        const txOrderId = txOrder
          ? typeof txOrder === 'object'
            ? (txOrder as Record<string, unknown>)?.id
            : txOrder
          : null
        if (txOrderId) {
          const orderRaw = await payload.findByID({
            collection: 'orders',
            id: String(txOrderId),
            depth: 0,
            overrideAccess: true,
          })
          const orderData = orderRaw as unknown as Record<string, unknown> | null
          invoiceNumber = (orderData?.invoiceNumber as string | null) ?? null
        }
      } catch {
        // Non-fatal — PDF will show booking reference as fallback
      }
    }

    // ── Resolve live business info (single source of truth) ───────────────
    let business:
      | {
          name?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          website?: string | null
          vatRate?: number | null
          isKleinunternehmer?: boolean
          uid?: string | null
          fn?: string | null
          court?: string | null
        }
      | undefined
    try {
      const biz = (await payload.findGlobal({
        slug: 'business-info' as never,
        depth: 0,
      })) as unknown as Record<string, unknown> | null
      if (biz) {
        const cityVal = (biz.city as string | undefined) || ''
        const postalVal = (biz.postalCode as string | undefined) || ''
        business = {
          name: biz.companyName as string | undefined,
          address: biz.addressLine1 as string | undefined,
          city: [postalVal, cityVal].filter(Boolean).join(' '),
          country: biz.country as string | undefined,
          email: biz.email as string | undefined,
          website: biz.website as string | undefined,
          vatRate: typeof biz.vatRate === 'number' ? (biz.vatRate as number) : null,
          isKleinunternehmer: biz.isKleinunternehmer === true,
          uid: (biz.uid as string | undefined) || null,
          fn: (biz.fn as string | undefined) || null,
          court: (biz.court as string | undefined) || null,
        }
      }
    } catch (bizErr) {
      console.warn('[booking-receipt] Could not load business-info global:', bizErr)
    }

    const pdfBuffer = generateWorkshopReceiptPDF({
      bookingId: String(booking.id),
      invoiceNumber,
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
      business,
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
