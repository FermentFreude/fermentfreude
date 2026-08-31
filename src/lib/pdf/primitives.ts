import fs from 'fs'
import { jsPDF } from 'jspdf'
import path from 'path'
import sharp from 'sharp'

/**
 * Shared drawing primitives for the 4 Fermentfreude document types
 * (Angebot, Rechnung MAN, Rechnung WEB, Stornorechnung) — the letterhead
 * (gold bar, logo, title), footer box, line-items table, and currency/date
 * formatting are pixel-identical across all four master templates. Each
 * document's own unique boxes (Bankverbindung, Veranstaltungsdaten,
 * Erstattung/Verrechnung, etc.) are drawn by that document's own generator.
 */

export const PAGE_WIDTH = 210
export const MARGIN_L = 20
export const MARGIN_R = 20
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_L - MARGIN_R

// Bank details (IBAN/BIC) are read from BusinessInfo for MAN invoices —
// every WEB order is paid through Stripe, so customers never need bank info.
export const COMPANY = {
  name: 'Fermentfreude OG',
  address: 'Grabenstraße 15',
  city: '8010 Graz',
  country: 'Österreich',
  email: 'kontakt@fermentfreude.at',
  website: 'fermentfreude.at',
  phone: '+43 (0) 660 49 43 577',
}

export const COLORS = {
  gold: [200, 146, 42] as [number, number, number],
  darkText: [26, 26, 26] as [number, number, number],
  grayLabel: [107, 107, 107] as [number, number, number],
  lightGray: [245, 245, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  tableHeaderBg: [245, 245, 240] as [number, number, number],
  divider: [220, 210, 190] as [number, number, number],
}

export interface ResolvedBusinessInfo {
  name: string
  address: string
  city: string
  country: string
  email: string
  website: string
  phone?: string | null
  vatRate: number
  isKleinunternehmer: boolean
  uid: string | null
  fn: string | null
  court: string | null
  bankName?: string | null
  iban?: string | null
  bic?: string | null
}

export interface RawBusinessInfo {
  name?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  email?: string | null
  website?: string | null
  phone?: string | null
  vatRate?: number | null
  isKleinunternehmer?: boolean | null
  uid?: string | null
  fn?: string | null
  court?: string | null
  bankName?: string | null
  iban?: string | null
  bic?: string | null
}

/** Resolves a raw BusinessInfo global (or undefined) against COMPANY fallbacks. */
export function resolveBusinessInfo(b?: RawBusinessInfo | null): ResolvedBusinessInfo {
  const src = b ?? {}
  return {
    name: src.name || COMPANY.name,
    address: src.address || COMPANY.address,
    city: src.city || COMPANY.city,
    country: src.country || COMPANY.country,
    email: src.email || COMPANY.email,
    website: src.website || COMPANY.website,
    phone: src.phone || COMPANY.phone,
    vatRate: typeof src.vatRate === 'number' && src.vatRate >= 0 ? src.vatRate / 100 : 0.2,
    isKleinunternehmer: src.isKleinunternehmer === true,
    uid: src.uid || null,
    fn: src.fn || null,
    court: src.court || null,
    bankName: src.bankName || null,
    iban: src.iban || null,
    bic: src.bic || null,
  }
}

export function formatCurrency(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  return `${sign}€ ${(Math.abs(cents) / 100).toFixed(2).replace('.', ',')}`
}

export function formatDate(date: Date, locale: 'de' | 'en'): string {
  return date.toLocaleDateString(locale === 'de' ? 'de-AT' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function splitLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth)
}

let cachedLogoBase64: string | null | undefined

/** Loads and caches the invoice logo (SVG -> PNG) for the lifetime of the process. */
export async function loadLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64 !== undefined) return cachedLogoBase64
  try {
    const svgPath = path.join(process.cwd(), 'public', 'logo-invoice.svg')
    const svgBuf = fs.readFileSync(svgPath)
    const pngBuf = await sharp(svgBuf).resize(180, 180).png().toBuffer()
    cachedLogoBase64 = pngBuf.toString('base64')
  } catch {
    cachedLogoBase64 = null
  }
  return cachedLogoBase64
}

/**
 * Draws the gold accent bar, logo (or "FF" monogram fallback), and document
 * title. Returns the y position to continue drawing from.
 */
export async function drawLetterhead(
  doc: jsPDF,
  opts: { titleText: string },
): Promise<number> {
  doc.setFillColor(...COLORS.gold)
  doc.rect(0, 0, PAGE_WIDTH, 4, 'F')

  const y = 18
  const logoBase64 = await loadLogoBase64()

  if (logoBase64) {
    doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', MARGIN_L, y, 18, 18)
  } else {
    doc.setFillColor(...COLORS.darkText)
    doc.rect(MARGIN_L, y, 18, 18, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(246, 240, 232)
    doc.text('FF', MARGIN_L + 9, y + 11, { align: 'center' })
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...COLORS.darkText)
  doc.text(opts.titleText, PAGE_WIDTH - MARGIN_R, y + 14, { align: 'right' })

  return y + 26
}

/** Draws a small gray caption above a bold value, left- or right-aligned. Returns new y. */
export function drawCaptionValue(
  doc: jsPDF,
  opts: { x: number; y: number; caption: string; value: string; align?: 'left' | 'right' },
): number {
  const align = opts.align ?? 'left'
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(opts.caption, opts.x, opts.y, { align })
  const y = opts.y + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  doc.text(opts.value, opts.x, y, { align })
  return y
}

export interface ReceiptLikeItem {
  title: string
  sku?: string
  /** Free-text sub-line under the title (e.g. Leistungsumfang for an Angebot). Takes priority over sku when both are set. */
  note?: string
  qty: number
  unitPrice: number // in cents; negative for Stornorechnung
}

/** Data shared by both Orders-backed documents (Rechnung WEB and Rechnung MAN). */
export interface OrderDocumentData {
  orderId: string
  orderNumber: string
  invoiceNumber?: string | null
  items: ReceiptLikeItem[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  /** Voucher/gift-card discount in cents. When > 0 a "Gutschein − €X" line is shown. */
  voucherDiscountCents?: number
  shippingAddress?: string // formatted multi-line string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  issueDate: Date
  /** Date the order was placed — usually the same day as issueDate, kept distinct for clarity. */
  orderedAt: Date
  /** Liefer-/Leistungsdatum — falls back to issueDate when not otherwise known. */
  deliveryDate?: Date
  /** How the order was paid, e.g. "Kreditkarte" / "Stripe". WEB only. */
  paymentMethodLabel?: string
  /** Stripe payment/charge reference. WEB only. */
  paymentReference?: string
  /** Workshop / Abholung / Versand — how the order is fulfilled. */
  fulfilmentType?: string
  /** Ansprechperson — optional, Rechnung MAN only. */
  contactPersonName?: string
  /** Freeform customer-supplied reference — optional, Rechnung MAN only. */
  referenceNote?: string
  locale: 'de' | 'en'
  /** Resolved live from the BusinessInfo global. Falls back to COMPANY constants. */
  business?: RawBusinessInfo
}

/** Draws the LEISTUNGSBESCHREIBUNG / ANZ. / EINZELPREIS / GESAMT table. Returns new y. */
export function drawLineItemsTable(
  doc: jsPDF,
  opts: { y: number; items: ReceiptLikeItem[]; locale: 'de' | 'en' },
): number {
  let y = opts.y
  const tableHeaderH = 9
  doc.setFillColor(...COLORS.tableHeaderBg)
  doc.rect(MARGIN_L, y, CONTENT_WIDTH, tableHeaderH, 'F')
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.8)
  doc.line(MARGIN_L, y + tableHeaderH, PAGE_WIDTH - MARGIN_R, y + tableHeaderH)

  const col = {
    descX: MARGIN_L + 3,
    qtyX: MARGIN_L + CONTENT_WIDTH * 0.58,
    unitX: MARGIN_L + CONTENT_WIDTH * 0.73,
    totalX: PAGE_WIDTH - MARGIN_R - 3,
    descW: CONTENT_WIDTH * 0.55,
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  const headerY = y + 6
  doc.text(opts.locale === 'de' ? 'LEISTUNGSBESCHREIBUNG' : 'ITEM DESCRIPTION', col.descX, headerY)
  doc.text(opts.locale === 'de' ? 'ANZ.' : 'QTY', col.qtyX, headerY, { align: 'center' })
  doc.text(opts.locale === 'de' ? 'EINZELPREIS' : 'UNIT PRICE', col.unitX + 8, headerY, {
    align: 'right',
  })
  doc.text(opts.locale === 'de' ? 'GESAMT' : 'TOTAL', col.totalX, headerY, { align: 'right' })

  y += tableHeaderH + 8

  for (const item of opts.items) {
    const titleLines = splitLines(doc, item.title, col.descW)
    const lineTotal = item.unitPrice * item.qty

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.darkText)
    doc.text(titleLines, col.descX, y)

    const subLine = item.note || (item.sku ? `SKU: ${item.sku}` : undefined)
    let subLineHeight = 0
    if (subLine) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(...COLORS.grayLabel)
      const subLines = splitLines(doc, subLine, col.descW)
      doc.text(subLines, col.descX, y + titleLines.length * 4.5 + 1)
      subLineHeight = subLines.length * 4
    }

    const rowHeight = Math.max(titleLines.length * 4.5 + (subLine ? subLineHeight + 3 : 2), 10)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.darkText)
    doc.text(String(item.qty), col.qtyX, y, { align: 'center' })
    doc.text(formatCurrency(item.unitPrice), col.unitX + 8, y, { align: 'right' })
    doc.text(formatCurrency(lineTotal), col.totalX, y, { align: 'right' })

    y += rowHeight

    doc.setDrawColor(...COLORS.divider)
    doc.setLineWidth(0.3)
    doc.line(MARGIN_L, y, PAGE_WIDTH - MARGIN_R, y)
    y += 6
  }

  return y
}

/**
 * Draws the shared footer box (KONTAKT + UID/FN/court + thank-you line +
 * page number). `startY` is a minimum — the box floats to whichever is
 * lower, matching the original generator's `Math.max(y, 240)` behaviour.
 */
export function drawFooterBox(
  doc: jsPDF,
  opts: { startY: number; biz: ResolvedBusinessInfo; locale: 'de' | 'en'; thankYouText: string },
): void {
  const legalLineCount = [opts.biz.uid, opts.biz.fn, opts.biz.court].filter(Boolean).length > 0 ? 1 : 0
  const footerBoxY = Math.max(opts.startY, 240)
  const footerBoxH = 22 + legalLineCount * 4
  const footerBoxPad = 5

  doc.setFillColor(...COLORS.lightGray)
  doc.rect(MARGIN_L, footerBoxY, CONTENT_WIDTH, footerBoxH, 'F')

  const centerX = MARGIN_L + CONTENT_WIDTH / 2
  let fy = footerBoxY + footerBoxPad + 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(opts.locale === 'de' ? 'KONTAKT' : 'CONTACT', centerX, fy, { align: 'center' })
  fy += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.darkText)
  const contactParts = [opts.biz.email, opts.biz.website, opts.biz.phone].filter(Boolean)
  doc.text(contactParts.join('   ·   '), centerX, fy, { align: 'center' })
  fy += 4

  const legalParts: string[] = []
  if (opts.biz.uid) legalParts.push(`UID ${opts.biz.uid}`)
  if (opts.biz.fn) legalParts.push(`FN ${opts.biz.fn}`)
  if (opts.biz.court) legalParts.push(opts.biz.court)
  if (legalParts.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.grayLabel)
    doc.text(legalParts.join('   ·   '), centerX, fy, { align: 'center' })
    fy += 4
  }

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(opts.thankYouText, centerX, fy, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(`${opts.locale === 'de' ? 'Seite' : 'Page'} 1/1`, PAGE_WIDTH / 2, 290, {
    align: 'center',
  })
}

/** Data for the ANGEBOT (quote) document — reads from a Quotes doc, not an Order. */
export interface QuoteDocumentData {
  quoteNumber: string
  issueDate: Date
  validUntil: Date
  clientName: string
  contactPersonName?: string
  clientAddress?: string // multi-line
  projectName: string
  clientReference?: string
  items: ReceiptLikeItem[]
  totalCents: number
  eventDateText?: string
  eventLocationText?: string
  participantCountText?: string
  cancellationTermsText?: string
  locale: 'de' | 'en'
  business?: RawBusinessInfo
}

/** Data for the STORNORECHNUNG document — reads from a CancellationInvoices doc. */
export interface CancellationDocumentData {
  cancellationNumber: string
  originalSeries: 'MAN' | 'WEB'
  originalInvoiceNumber: string
  originalIssueDate: Date
  issueDate: Date
  clientName: string
  contactPersonName?: string
  clientAddress?: string
  reason?: string
  /** Positive quantities — amounts are negated at render time. */
  items: ReceiptLikeItem[]
  totalCents: number // positive; rendered negative
  refundStatus: 'offen' | 'erstattet' | 'verrechnet'
  refundDate?: Date
  refundMethodOrReference?: string
  locale: 'de' | 'en'
  business?: RawBusinessInfo
}

/** The Kleinunternehmer §6 UStG exemption sentence, right-aligned, italic, gray. */
export function drawKleinunternehmerNote(
  doc: jsPDF,
  opts: { y: number; locale: 'de' | 'en'; alignX: number },
): number {
  let y = opts.y
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.grayLabel)
  const note =
    opts.locale === 'de'
      ? 'Gemäß § 6 Abs. 1 Z 27 UStG wird aufgrund der Kleinunternehmerregelung keine Umsatzsteuer ausgewiesen.'
      : 'No VAT is shown — Austrian small-business exemption (§ 6 Abs. 1 Z 27 UStG).'
  const lines = splitLines(doc, note, CONTENT_WIDTH - 40)
  for (const line of lines) {
    doc.text(line, opts.alignX, y, { align: 'right' })
    y += 4
  }
  return y
}
