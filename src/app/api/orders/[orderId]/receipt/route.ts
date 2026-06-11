import { generateOrderReceiptPDF } from '@/lib/generateOrderReceiptPDF'
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

    // ── Resolve customer info ──────────────────────────────────────────────
    let customerFirstName = ''
    let customerLastName = ''
    let customerEmail = ''
    let shippingAddress: string | undefined

    const customerRef = order.customer
    if (customerRef && typeof customerRef === 'object') {
      const u = customerRef as Record<string, unknown>
      const fullName = (u.name as string | undefined) ?? ''
      const parts = fullName.split(' ')
      customerFirstName = parts[0] ?? ''
      customerLastName = parts.slice(1).join(' ')
      customerEmail = (u.email as string | undefined) ?? ''
    } else if (order.customerEmail) {
      customerEmail = order.customerEmail as string
    }

    // Try to split customerName if provided
    if (!customerFirstName && order.customerName) {
      const parts = (order.customerName as string).split(' ')
      customerFirstName = parts[0] ?? ''
      customerLastName = parts.slice(1).join(' ')
    }

    // Build shipping address string
    const addr = order.shippingAddress as Record<string, string | null | undefined> | undefined
    if (addr) {
      const lines = [
        [addr.firstName, addr.lastName].filter(Boolean).join(' '),
        addr.company,
        addr.addressLine1,
        addr.addressLine2,
        [addr.postalCode, addr.city].filter(Boolean).join(' '),
        addr.country,
      ].filter((l) => l && String(l).trim())
      if (lines.length > 0) shippingAddress = lines.join('\n')
    }

    // ── Resolve line items ─────────────────────────────────────────────────
    // For workshop orders the ecommerce plugin stores items with unitPrice=0
    // because pricing lives on the workshop-booking, not the product.
    // Look up confirmed bookings by orderId — the direct, precise link.
    type ReceiptItem = { title: string; sku?: string; qty: number; unitPrice: number }
    let receiptItems: ReceiptItem[] = []

    try {
      const bookings = await payload.find({
        collection: 'workshop-bookings',
        where: {
          and: [
            { orderId: { equals: String(order.id) } },
            { status: { equals: 'confirmed' } },
          ],
        },
        limit: 50,
        depth: 0,
        overrideAccess: true,
      })

      if (bookings.totalDocs > 0) {
        receiptItems = bookings.docs.map((b) => {
          const titleParts = [b.workshopTitle ? `${b.workshopTitle}-Workshop` : '', b.date, b.time].filter(Boolean)
          return {
            title: titleParts.join(' · '),
            qty: b.guestCount ?? 1,
            // pricePerPerson is in euros — convert to cents for the PDF generator
            unitPrice: Math.round((b.pricePerPerson ?? 0) * 100),
          }
        })
      }
    } catch {
      // Non-fatal — fall through to product-based items below
    }

    // Fall back to order.items for non-workshop purchases
    if (receiptItems.length === 0) {
      const rawItems = (order.items as Record<string, unknown>[] | undefined) ?? []
      receiptItems = rawItems.map((item) => {
        const productRef = item.product
        let title = 'Product'
        let sku: string | undefined

        if (productRef && typeof productRef === 'object') {
          const p = productRef as Record<string, unknown>
          title = (p.title as string | undefined) ?? title
          sku = (p.sku as string | undefined) ?? undefined
        }

        const qty = typeof item.quantity === 'number' ? item.quantity : 1
        const unitPrice =
          typeof item.price === 'number'
            ? item.price
            : typeof item.unitPrice === 'number'
              ? item.unitPrice
              : 0

        return { title, sku, qty, unitPrice }
      })
    }

    // ── Monetary totals ────────────────────────────────────────────────────
    const totalCents = typeof order.amount === 'number' ? order.amount : 0
    const shippingCents =
      typeof order.shippingAmount === 'number'
        ? order.shippingAmount
        : typeof order.shipping === 'number'
          ? order.shipping
          : 0
    const subtotalCents = totalCents - shippingCents

    // Voucher discount: if items sum to more than the order total a gift voucher
    // was redeemed. The discount is the difference so the totals section shows
    // a "Gutschein − €X" line and the €0 grand total makes sense at a glance.
    const itemsGrossCents = receiptItems.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
    const grossBeforeDiscount = itemsGrossCents + shippingCents
    const voucherDiscountCents = grossBeforeDiscount > totalCents ? grossBeforeDiscount - totalCents : 0

    // ── Generate PDF ───────────────────────────────────────────────────────
    // Always prefer the frozen invoiceIssuedAt — never updatedAt, since the
    // order may be touched long after issuance (status changes, refunds, etc).
    const issuedRaw = (order as { invoiceIssuedAt?: string | null }).invoiceIssuedAt
    const issueDate = issuedRaw
      ? new Date(issuedRaw)
      : order.createdAt
        ? new Date(order.createdAt as string)
        : new Date()
    const orderNumber = String(order.id).slice(-8).toUpperCase()

    // ── Resolve live business info (single source of truth) ───────────────
    let business:
      | {
          name?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          website?: string | null
          phone?: string | null
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
          phone: biz.phone as string | undefined,
          vatRate: typeof biz.vatRate === 'number' ? (biz.vatRate as number) : null,
          isKleinunternehmer: biz.isKleinunternehmer === true,
          uid: (biz.uid as string | undefined) || null,
          fn: (biz.fn as string | undefined) || null,
          court: (biz.court as string | undefined) || null,
        }
      }
    } catch (bizErr) {
      // Non-fatal — PDF will fall back to hardcoded COMPANY constants.
      console.warn('[order-receipt] Could not load business-info global:', bizErr)
    }

    const invoiceNumber = (order as { invoiceNumber?: string | null }).invoiceNumber || null

    const pdfBuffer = await generateOrderReceiptPDF({
      orderId: String(order.id),
      orderNumber,
      invoiceNumber,
      items: receiptItems,
      subtotalCents: Math.max(subtotalCents, 0),
      shippingCents: Math.max(shippingCents, 0),
      totalCents,
      voucherDiscountCents: voucherDiscountCents > 0 ? voucherDiscountCents : undefined,
      shippingAddress,
      customerFirstName,
      customerLastName,
      customerEmail,
      issueDate,
      locale: 'de',
      business,
    })

    // ── Stream PDF ─────────────────────────────────────────────────────────
    const filename = `fermentfreude-bestellung-${orderNumber}.pdf`

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
