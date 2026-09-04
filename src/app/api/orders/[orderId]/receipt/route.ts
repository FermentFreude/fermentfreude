import { buildOrderReceiptData } from '@/lib/buildOrderReceiptData'
import { generateRechnungManPDF } from '@/lib/pdf/generateRechnungManPDF'
import { generateRechnungWebPDF } from '@/lib/pdf/generateRechnungWebPDF'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/orders/[orderId]/receipt?token=<downloadToken>
 *
 *  Token-secured endpoint: returns a PDF receipt for a paid order.
 *  No authentication cookie required — the downloadToken (UUID stored
 *  on the order) acts as the credential. Works for guests and users.
 *
 *  Security:
 *  - Token must match the stored downloadToken exactly
 *  - Returns 401 for missing/invalid token
 *  - Returns 404 for unknown orderId
 *  - Returns 403 if order is not paid
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params
    const token = request.nextUrl.searchParams.get('token')

    // ── Input validation ──────────────────────────────────────────────────
    if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 })
    }

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json({ error: 'Download token is required.' }, { status: 401 })
    }

    const payload = await getPayload({ config: await configPromise })

    // ── Fetch order ────────────────────────────────────────────────────────
    let order: Record<string, unknown> | null = null
    try {
      order = (await payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 1,
        overrideAccess: true, // token is the auth — no cookie required
      })) as unknown as Record<string, unknown> | null
    } catch {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    // ── Token validation ───────────────────────────────────────────────────
    const storedToken = order.downloadToken as string | undefined | null
    if (!storedToken || storedToken !== token) {
      return NextResponse.json({ error: 'Invalid or expired download token.' }, { status: 401 })
    }

    // ── Status check ───────────────────────────────────────────────────────
    // Ecommerce plugin sets the status field. Accept any non-cancelled/refunded status.
    // 'processing' is the initial status assigned at order creation — Stripe redirects the
    // buyer to the confirmation page immediately after payment while the webhook (which
    // transitions the order to 'completed') may still be in transit. Blocking 'processing'
    // would cause a race condition where the download fails right after checkout.
    const status = (order.orderstatus ?? order.status ?? order.paymentStatus) as string | undefined
    const isRejected = status === 'cancelled' || status === 'refunded' || status === 'failed'

    if (isRejected) {
      return NextResponse.json(
        { error: 'Receipt is not available for cancelled or refunded orders.' },
        { status: 403 },
      )
    }

    // ── Assemble receipt data + generate PDF ───────────────────────────────
    const receiptData = await buildOrderReceiptData(payload, order)
    const pdfBuffer =
      order.paymentMethod === 'manual'
        ? await generateRechnungManPDF(receiptData)
        : await generateRechnungWebPDF(receiptData)

    // ── Stream PDF ─────────────────────────────────────────────────────────
    const filename = `fermentfreude-bestellung-${receiptData.orderNumber}.pdf`

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
    console.error('[order-receipt] Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
