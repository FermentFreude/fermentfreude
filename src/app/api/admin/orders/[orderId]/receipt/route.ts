import { buildOrderReceiptData } from '@/lib/buildOrderReceiptData'
import { generateOrderReceiptPDF } from '@/lib/generateOrderReceiptPDF'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/admin/orders/[orderId]/receipt
 *
 *  Session-authenticated endpoint for founders/admins: returns the same
 *  invoice PDF as the customer-facing token route, but with no status
 *  restriction — works for cancelled/refunded orders too, since founders
 *  need a record for every order for accounting purposes.
 *
 *  Security:
 *  - Requires an authenticated admin session (Payload admin cookie)
 *  - Returns 401 if not authenticated, 403 if authenticated but not admin
 *  - Returns 404 for unknown orderId
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params

    if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config: await configPromise })

    // ── Auth: must be a logged-in admin ────────────────────────────────────
    const { user } = await payload.auth({ headers: request.headers })
    const userAny = user as { role?: string; roles?: string[] } | null
    const isAdmin =
      userAny?.role === 'admin' ||
      userAny?.roles?.includes('admin') ||
      (user as Record<string, unknown> | null)?.['admin'] === true

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── Fetch order — no status restriction (founders need every order) ───
    let order: Record<string, unknown> | null = null
    try {
      order = (await payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 1,
        overrideAccess: true,
      })) as unknown as Record<string, unknown> | null
    } catch {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    // ── Assemble receipt data + generate PDF ───────────────────────────────
    const receiptData = await buildOrderReceiptData(payload, order)
    const pdfBuffer = await generateOrderReceiptPDF(receiptData)

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
    console.error('[admin-order-receipt] Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
