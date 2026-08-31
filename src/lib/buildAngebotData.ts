import type { Payload } from 'payload'

import type { QuoteDocumentData } from '@/lib/pdf/primitives'

/** Assembles the QuoteDocumentData needed by generateAngebotPDF() from a Quotes doc. */
export async function buildAngebotData(
  payload: Payload,
  quote: Record<string, unknown>,
): Promise<QuoteDocumentData> {
  const rawItems = (quote.items as Record<string, unknown>[] | undefined) ?? []
  const items = rawItems.map((item) => ({
    title: (item.title as string) ?? '',
    note: (item.note as string | undefined) || undefined,
    qty: typeof item.quantity === 'number' ? item.quantity : 1,
    unitPrice: typeof item.unitPriceCents === 'number' ? item.unitPriceCents : 0,
  }))

  const totalCents = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)

  let business: QuoteDocumentData['business']
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
    console.warn('[buildAngebotData] Could not load business-info global:', bizErr)
  }

  return {
    quoteNumber: (quote.quoteNumber as string) ?? '',
    issueDate: quote.issueDate ? new Date(quote.issueDate as string) : new Date(),
    validUntil: quote.validUntil ? new Date(quote.validUntil as string) : new Date(),
    clientName: (quote.clientName as string) ?? '',
    contactPersonName: (quote.contactPersonName as string | undefined) || undefined,
    clientAddress: (quote.clientAddress as string | undefined) || undefined,
    projectName: (quote.projectName as string) ?? '',
    clientReference: (quote.clientReference as string | undefined) || undefined,
    items,
    totalCents,
    eventDateText: (quote.eventDateText as string | undefined) || undefined,
    eventLocationText: (quote.eventLocationText as string | undefined) || undefined,
    participantCountText: (quote.participantCountText as string | undefined) || undefined,
    cancellationTermsText: (quote.cancellationTermsText as string | undefined) || undefined,
    locale: 'de',
    business,
  }
}
