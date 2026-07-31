import type { Payload } from 'payload'

import type { OrderReceiptData } from '@/lib/generateOrderReceiptPDF'

/* ═══════════════════════════════════════════════════════════════
 *  buildOrderReceiptData — Assembles the OrderReceiptData needed by
 *  generateOrderReceiptPDF() from a raw order document.
 *
 *  Shared by the customer-facing token route
 *  (/api/orders/[orderId]/receipt) and the admin-only session route
 *  (/api/admin/orders/[orderId]/receipt) — both need the exact same PDF
 *  content, just gated by different auth/status rules. Extracted here so
 *  that logic lives in exactly one place.
 * ═══════════════════════════════════════════════════════════════ */

type ReceiptItem = { title: string; sku?: string; qty: number; unitPrice: number }

function bookingToReceiptItem(b: Record<string, unknown>): ReceiptItem {
  const titleParts = [b.workshopTitle ? `${b.workshopTitle}` : '', b.date, b.time].filter(Boolean)
  return {
    title: titleParts.join(' · '),
    qty: typeof b.guestCount === 'number' ? b.guestCount : 1,
    unitPrice: Math.round(((b.pricePerPerson as number | undefined) ?? 0) * 100),
  }
}

export async function buildOrderReceiptData(
  payload: Payload,
  order: Record<string, unknown>,
): Promise<OrderReceiptData> {
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
  let receiptItems: ReceiptItem[] = []

  try {
    const bookings = await payload.find({
      collection: 'workshop-bookings',
      where: {
        and: [{ orderId: { equals: String(order.id) } }, { status: { equals: 'confirmed' } }],
      },
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })

    if (bookings.totalDocs > 0) {
      receiptItems = bookings.docs.map((b) => bookingToReceiptItem(b as unknown as Record<string, unknown>))
    }
  } catch {
    // Non-fatal — try fallback below
  }

  // Fallback: voucher orders placed before the orderId fix — find confirmed bookings
  // by customer email + workshop slugs resolved from the order items.
  if (receiptItems.length === 0 && customerEmail) {
    try {
      const rawItems = (order.items as Record<string, unknown>[] | undefined) ?? []
      const workshopSlugs: string[] = []
      for (const item of rawItems) {
        const productRef = item.product
        let slug: string | null = null
        if (productRef && typeof productRef === 'object') {
          slug = ((productRef as Record<string, unknown>).slug as string | undefined) ?? null
        } else if (typeof productRef === 'string') {
          try {
            const p = await payload.findByID({
              collection: 'products',
              id: productRef,
              depth: 0,
              overrideAccess: true,
            })
            slug = (p as unknown as { slug?: string })?.slug ?? null
          } catch {
            /* ignore */
          }
        }
        if (slug?.startsWith('workshop-')) workshopSlugs.push(slug.replace(/^workshop-/, ''))
      }

      if (workshopSlugs.length > 0) {
        const fallback = await payload.find({
          collection: 'workshop-bookings',
          where: {
            and: [
              { email: { equals: customerEmail } },
              { status: { equals: 'confirmed' } },
              { workshopSlug: { in: workshopSlugs } },
            ],
          },
          sort: '-createdAt',
          limit: 50,
          depth: 0,
          overrideAccess: true,
        })
        if (fallback.totalDocs > 0) {
          receiptItems = fallback.docs.map((b) => bookingToReceiptItem(b as unknown as Record<string, unknown>))
        }
      }
    } catch {
      // Non-fatal — fall through to product-based items below
    }
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
  let business: OrderReceiptData['business']
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
    console.warn('[buildOrderReceiptData] Could not load business-info global:', bizErr)
  }

  const invoiceNumber = (order as { invoiceNumber?: string | null }).invoiceNumber || null

  return {
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
  }
}
