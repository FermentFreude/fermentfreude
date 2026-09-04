import { buildStornoData } from '@/lib/buildStornoData'
import { generateStornoPDF } from '@/lib/pdf/generateStornoPDF'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/admin/cancellations/[id]/receipt
 *
 *  Session-authenticated endpoint for founders/admins: returns the
 *  STORNORECHNUNG PDF for a CancellationInvoices doc. Same auth pattern as
 *  /api/admin/orders/[orderId]/receipt.
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json({ error: 'Cancellation ID is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config: await configPromise })

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

    let cancellation: Record<string, unknown> | null = null
    try {
      cancellation = (await payload.findByID({
        collection: 'cancellation-invoices',
        id,
        depth: 0,
        overrideAccess: true,
      })) as unknown as Record<string, unknown> | null
    } catch {
      return NextResponse.json({ error: 'Cancellation invoice not found.' }, { status: 404 })
    }

    if (!cancellation) {
      return NextResponse.json({ error: 'Cancellation invoice not found.' }, { status: 404 })
    }

    const stornoData = await buildStornoData(payload, cancellation)
    const pdfBuffer = await generateStornoPDF(stornoData)

    const filename = `fermentfreude-storno-${stornoData.cancellationNumber}.pdf`

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
    console.error('[admin-cancellation-receipt] Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
