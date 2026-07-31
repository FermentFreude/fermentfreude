import { buildOrderReceiptData } from '@/lib/buildOrderReceiptData'
import { generateOrderReceiptPDF } from '@/lib/generateOrderReceiptPDF'
import configPromise from '@payload-config'
import JSZip from 'jszip'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/admin/orders/receipt-bulk?status=<all|completed|processing|cancelled|refunded>
 *
 *  Session-authenticated endpoint for founders/admins: bundles every
 *  matching order's invoice PDF into a single ZIP for download. No status
 *  restriction beyond the requested filter — includes cancelled/refunded
 *  orders when status=all or status=cancelled/refunded, same as the
 *  single-order admin receipt route.
 *
 *  Security: same as /api/admin/orders/[orderId]/receipt — requires an
 *  authenticated admin session.
 * ═══════════════════════════════════════════════════════════════ */

const VALID_STATUSES = ['all', 'processing', 'completed', 'cancelled', 'refunded'] as const

export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get('status') ?? 'all'
    const status = (VALID_STATUSES as readonly string[]).includes(statusParam) ? statusParam : 'all'

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

    // ── Fetch matching orders ───────────────────────────────────────────────
    const result = await payload.find({
      collection: 'orders',
      where: status === 'all' ? {} : { status: { equals: status } },
      sort: '-createdAt',
      limit: 1000,
      depth: 1,
      overrideAccess: true,
    })

    if (result.docs.length === 0) {
      return NextResponse.json({ error: 'No orders match this filter.' }, { status: 404 })
    }

    // ── Assemble each PDF and add it to the zip (sequential — keeps memory
    // bounded and matches the project's MongoDB Atlas M0 sequential-write
    // convention; PDF generation here is read-only but there's no need to
    // race dozens of jsPDF instances concurrently in one serverless invocation) ──
    const zip = new JSZip()
    const usedNames = new Set<string>()

    for (const order of result.docs) {
      const orderRecord = order as unknown as Record<string, unknown>
      try {
        const receiptData = await buildOrderReceiptData(payload, orderRecord)
        const pdfBuffer = await generateOrderReceiptPDF(receiptData)

        let filename = `fermentfreude-bestellung-${receiptData.orderNumber}.pdf`
        if (usedNames.has(filename)) {
          filename = `fermentfreude-bestellung-${receiptData.orderNumber}-${String(order.id).slice(-4)}.pdf`
        }
        usedNames.add(filename)

        zip.file(filename, pdfBuffer)
      } catch (err) {
        console.error(`[orders/receipt-bulk] Failed to build receipt for order ${order.id}:`, err)
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

    const dateStr = new Date().toISOString().slice(0, 10)
    const zipFilename = `fermentfreude-rechnungen-${status}-${dateStr}.zip`

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': String(zipBuffer.length),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[admin-orders-receipt-bulk] Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
