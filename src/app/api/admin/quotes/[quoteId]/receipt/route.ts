import { buildAngebotData } from '@/lib/buildAngebotData'
import { generateAngebotPDF } from '@/lib/pdf/generateAngebotPDF'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/admin/quotes/[quoteId]/receipt
 *
 *  Session-authenticated endpoint for founders/admins: returns the ANGEBOT
 *  PDF for a Quotes doc. Same auth pattern as /api/admin/orders/[orderId]/receipt.
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> },
) {
  try {
    const { quoteId } = await params

    if (!quoteId || typeof quoteId !== 'string' || quoteId.trim().length === 0) {
      return NextResponse.json({ error: 'Quote ID is required.' }, { status: 400 })
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

    let quote: Record<string, unknown> | null = null
    try {
      quote = (await payload.findByID({
        collection: 'quotes',
        id: quoteId,
        depth: 0,
        overrideAccess: true,
      })) as unknown as Record<string, unknown> | null
    } catch {
      return NextResponse.json({ error: 'Quote not found.' }, { status: 404 })
    }

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found.' }, { status: 404 })
    }

    const angebotData = await buildAngebotData(payload, quote)
    const pdfBuffer = await generateAngebotPDF(angebotData)

    const filename = `fermentfreude-angebot-${angebotData.quoteNumber}.pdf`

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
    console.error('[admin-quote-receipt] Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
