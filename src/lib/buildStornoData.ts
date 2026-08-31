import type { Payload } from 'payload'

import type { CancellationDocumentData } from '@/lib/pdf/primitives'

/** Assembles the CancellationDocumentData needed by generateStornoPDF() from a CancellationInvoices doc. */
export async function buildStornoData(
  payload: Payload,
  cancellation: Record<string, unknown>,
): Promise<CancellationDocumentData> {
  const rawItems = (cancellation.items as Record<string, unknown>[] | undefined) ?? []
  const items = rawItems.map((item) => ({
    title: (item.title as string) ?? '',
    qty: typeof item.quantity === 'number' ? item.quantity : 1,
    unitPrice: typeof item.unitPriceCents === 'number' ? item.unitPriceCents : 0,
  }))

  let business: CancellationDocumentData['business']
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
    console.warn('[buildStornoData] Could not load business-info global:', bizErr)
  }

  return {
    cancellationNumber: (cancellation.cancellationNumber as string) ?? '',
    originalSeries: (cancellation.originalSeries as 'MAN' | 'WEB') ?? 'WEB',
    originalInvoiceNumber: (cancellation.originalInvoiceNumber as string) ?? '',
    originalIssueDate: cancellation.originalIssueDate
      ? new Date(cancellation.originalIssueDate as string)
      : new Date(),
    issueDate: cancellation.issueDate ? new Date(cancellation.issueDate as string) : new Date(),
    clientName: (cancellation.clientName as string) ?? '',
    clientAddress: (cancellation.clientAddress as string | undefined) || undefined,
    reason: (cancellation.reason as string | undefined) || undefined,
    items,
    totalCents: typeof cancellation.totalCents === 'number' ? cancellation.totalCents : 0,
    refundStatus: (cancellation.refundStatus as CancellationDocumentData['refundStatus']) ?? 'offen',
    refundDate: cancellation.refundDate ? new Date(cancellation.refundDate as string) : undefined,
    refundMethodOrReference: (cancellation.refundMethodOrReference as string | undefined) || undefined,
    locale: 'de',
    business,
  }
}
