import fs from 'fs'
import { jsPDF } from 'jspdf'
import path from 'path'

// ─── Company Details ────────────────────────────────────────────────────────
// Bank details (IBAN/BIC) are intentionally not printed on invoices —
// every order is paid through Stripe, so customers never need bank info.
// UID / FN are not shown until founders provide official numbers.
const COMPANY = {
  name: 'Fermentfreude OG',
  address: 'Grabenstraße 15',
  city: '8010 Graz',
  country: 'Österreich',
  email: 'hello@fermentfreude.at',
  website: 'www.fermentfreude.at',
}

// ─── Color Palette ──────────────────────────────────────────────────────────
const COLORS = {
  gold: [200, 146, 42] as [number, number, number],
  darkText: [26, 26, 26] as [number, number, number],
  grayLabel: [107, 107, 107] as [number, number, number],
  lightGray: [245, 245, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  tableHeaderBg: [245, 245, 240] as [number, number, number],
  divider: [220, 210, 190] as [number, number, number],
}

// ─── Input Interface ────────────────────────────────────────────────────────
export interface OrderReceiptItem {
  title: string
  sku?: string
  qty: number
  unitPrice: number // in cents
}

export interface OrderReceiptBusinessInfo {
  name?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  email?: string | null
  website?: string | null
  phone?: string | null
  vatRate?: number | null
  /** § 6 Abs. 1 Z 27 UStG — small business: no VAT shown on invoices. */
  isKleinunternehmer?: boolean | null
}

export interface OrderReceiptData {
  orderId: string
  orderNumber: string
  items: OrderReceiptItem[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  shippingAddress?: string // formatted multi-line string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  issueDate: Date
  locale: 'de' | 'en'
  /** Resolved live from the BusinessInfo global. Falls back to COMPANY constants. */
  business?: OrderReceiptBusinessInfo
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatCurrency(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace('.', ',')}`
}

function formatDate(date: Date, locale: 'de' | 'en'): string {
  return date.toLocaleDateString(locale === 'de' ? 'de-AT' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function splitLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth)
}

// ─── Main Generator ─────────────────────────────────────────────────────────
export function generateOrderReceiptPDF(data: OrderReceiptData): Buffer {
  // Resolve business info: every field falls back to the COMPANY constant so
  // the PDF still renders even if the BusinessInfo global has not been filled
  // out yet (e.g. on first deploy, or for legacy orders saved before launch).
  const b = data.business ?? {}
  const biz = {
    name: b.name || COMPANY.name,
    address: b.address || COMPANY.address,
    city: b.city || COMPANY.city,
    country: b.country || COMPANY.country,
    email: b.email || COMPANY.email,
    website: b.website || COMPANY.website,
    vatRate: typeof b.vatRate === 'number' && b.vatRate >= 0 ? b.vatRate / 100 : 0.2,
    isKleinunternehmer: b.isKleinunternehmer === true,
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = 210
  const marginL = 20
  const marginR = 20
  const contentWidth = pageWidth - marginL - marginR

  // ─── Load logo ──────────────────────────────────────────────────────────
  let logoBase64: string | null = null
  try {
    const logoPath = path.join(process.cwd(), 'public', 'submark-dark.png')
    const logoBuf = fs.readFileSync(logoPath)
    logoBase64 = logoBuf.toString('base64')
  } catch {
    // logo not critical — continue without it
  }

  // ─── HEADER ─────────────────────────────────────────────────────────────

  // Gold accent bar
  doc.setFillColor(...COLORS.gold)
  doc.rect(0, 0, pageWidth, 4, 'F')

  let y = 18

  if (logoBase64) {
    doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', marginL, y, 18, 18)
  } else {
    doc.setFillColor(...COLORS.darkText)
    doc.rect(marginL, y, 18, 18, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.white)
    doc.text('FF', marginL + 9, y + 11, { align: 'center' })
  }

  const titleText = data.locale === 'de' ? 'RECHNUNG' : 'RECEIPT'
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...COLORS.darkText)
  doc.text(titleText, pageWidth - marginR, y + 14, { align: 'right' })

  y += 26

  const rightX = pageWidth - marginR

  // Left: company name + address
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'RECHNUNGSAUSSTELLER' : 'INVOICED BY', marginL, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  doc.text(biz.name, marginL, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(biz.address, marginL, y)
  y += 4.5
  doc.text(`${biz.city}, ${biz.country}`, marginL, y)
  y += 4.5
  doc.text(biz.email, marginL, y)

  // Right: order number + issue date
  let ry = y - 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'BESTELLNUMMER' : 'ORDER NUMBER', rightX, ry, { align: 'right' })
  ry += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`#${data.orderNumber}`, rightX, ry, { align: 'right' })

  ry += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'AUSSTELLUNGSDATUM' : 'DATE OF ISSUE', rightX, ry, {
    align: 'right',
  })
  ry += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  doc.text(formatDate(data.issueDate, data.locale), rightX, ry, { align: 'right' })

  y += 10

  // Divider
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.5)
  doc.line(marginL, y, pageWidth - marginR, y)
  y += 10

  // ─── BILL TO ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'RECHNUNGSEMPFÄNGER' : 'BILL TO', marginL, y)

  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`${data.customerFirstName} ${data.customerLastName}`, marginL, y)

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(data.customerEmail, marginL, y)

  // Shipping address if provided
  if (data.shippingAddress) {
    const addrLines = data.shippingAddress.split('\n').filter(Boolean)
    for (const line of addrLines) {
      y += 4
      doc.text(line, marginL, y)
    }
  }

  // Right: order ID + payment status
  let ry2 =
    y -
    (data.shippingAddress ? data.shippingAddress.split('\n').filter(Boolean).length * 4 + 10 : 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'KUNDENNUMMER' : 'CUSTOMER ID', rightX, ry2, { align: 'right' })
  ry2 += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`CUST-${data.orderId.slice(-8).toUpperCase()}`, rightX, ry2, { align: 'right' })

  ry2 += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'ZAHLUNGSSTATUS' : 'PAYMENT STATUS', rightX, ry2, {
    align: 'right',
  })
  ry2 += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(34, 139, 34)
  doc.text(data.locale === 'de' ? 'Bezahlt' : 'Paid', rightX, ry2, { align: 'right' })
  doc.setTextColor(...COLORS.darkText)

  y += 12

  // ─── LINE ITEMS TABLE ────────────────────────────────────────────────────
  const tableHeaderH = 9
  doc.setFillColor(...COLORS.tableHeaderBg)
  doc.rect(marginL, y, contentWidth, tableHeaderH, 'F')
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.8)
  doc.line(marginL, y + tableHeaderH, pageWidth - marginR, y + tableHeaderH)

  const col = {
    descX: marginL + 3,
    qtyX: marginL + contentWidth * 0.58,
    unitX: marginL + contentWidth * 0.73,
    totalX: pageWidth - marginR - 3,
    descW: contentWidth * 0.55,
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  const headerY = y + 6
  doc.text(data.locale === 'de' ? 'LEISTUNGSBESCHREIBUNG' : 'ITEM DESCRIPTION', col.descX, headerY)
  doc.text(data.locale === 'de' ? 'ANZ.' : 'QTY', col.qtyX, headerY, { align: 'center' })
  doc.text(data.locale === 'de' ? 'EINZELPREIS' : 'UNIT PRICE', col.unitX + 8, headerY, {
    align: 'right',
  })
  doc.text(data.locale === 'de' ? 'GESAMT' : 'TOTAL', col.totalX, headerY, { align: 'right' })

  y += tableHeaderH + 8

  // Render each item row
  for (const item of data.items) {
    const titleLines = splitLines(doc, item.title, col.descW)
    const lineTotal = item.unitPrice * item.qty

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.darkText)
    doc.text(titleLines, col.descX, y)

    if (item.sku) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(...COLORS.grayLabel)
      doc.text(`SKU: ${item.sku}`, col.descX, y + titleLines.length * 4.5 + 1)
    }

    const rowHeight = Math.max(titleLines.length * 4.5 + (item.sku ? 5 : 2), 10)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.darkText)
    doc.text(String(item.qty), col.qtyX, y, { align: 'center' })
    doc.text(formatCurrency(item.unitPrice), col.unitX + 8, y, { align: 'right' })
    doc.text(formatCurrency(lineTotal), col.totalX, y, { align: 'right' })

    y += rowHeight

    // Row divider
    doc.setDrawColor(...COLORS.divider)
    doc.setLineWidth(0.3)
    doc.line(marginL, y, pageWidth - marginR, y)
    y += 6
  }

  // Shipping row (if non-zero)
  if (data.shippingCents > 0) {
    const shippingLabel = data.locale === 'de' ? 'Versand' : 'Shipping'
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.darkText)
    doc.text(shippingLabel, col.descX, y)
    doc.text(formatCurrency(data.shippingCents), col.totalX, y, { align: 'right' })
    y += 6
    doc.setDrawColor(...COLORS.divider)
    doc.setLineWidth(0.3)
    doc.line(marginL, y, pageWidth - marginR, y)
    y += 6
  }

  y += 2

  // ─── TOTALS SECTION ──────────────────────────────────────────────────────
  // Austrian standard VAT for physical goods (configurable via BusinessInfo).
  const vatRate = biz.vatRate
  const netAmount = data.totalCents / (1 + vatRate)
  const vatAmount = data.totalCents - netAmount

  const totalsLabelX = pageWidth - marginR - 60
  const totalsValueX = pageWidth - marginR

  const labelLine = (label: string, value: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.grayLabel)
    doc.text(label, totalsLabelX, y)
    doc.setTextColor(...COLORS.darkText)
    doc.text(value, totalsValueX, y, { align: 'right' })
    y += 6
  }

  labelLine(
    data.locale === 'de' ? 'Nettobetrag' : 'Subtotal',
    formatCurrency(Math.round(netAmount)),
  )
  labelLine(
    data.locale === 'de'
      ? `MwSt. ${Math.round(vatRate * 100)}%`
      : `VAT ${Math.round(vatRate * 100)}%`,
    formatCurrency(Math.round(vatAmount)),
  )

  y += 2
  doc.setDrawColor(...COLORS.darkText)
  doc.setLineWidth(0.5)
  doc.line(totalsLabelX - 5, y, pageWidth - marginR, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.darkText)
  doc.text(data.locale === 'de' ? 'GESAMTBETRAG' : 'TOTAL AMOUNT', totalsLabelX - 5, y)
  doc.text(formatCurrency(data.totalCents), totalsValueX, y, { align: 'right' })

  y += 8

  if (biz.isKleinunternehmer) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.grayLabel)
    const kuNote =
      data.locale === 'de'
        ? 'Gemäß § 6 Abs. 1 Z 27 UStG keine Umsatzsteuer ausgewiesen (Kleinunternehmer).'
        : 'No VAT charged — small business exemption (§ 6 Abs. 1 Z 27 Austrian VAT Act).'
    const kuLines = splitLines(doc, kuNote, contentWidth - 40)
    kuLines.forEach((line: string) => {
      doc.text(line, totalsValueX, y, { align: 'right' })
      y += 4
    })
    y += 2
  }

  y += 6

  // ─── FOOTER BOX ──────────────────────────────────────────────────────────
  // Single contact band — no bank details (Stripe-only payments) and no
  // placeholder legal numbers. Will be expanded once founders provide UID/FN.
  const footerBoxY = Math.max(y, 240)
  const footerBoxH = 22
  const footerBoxPad = 5

  doc.setFillColor(...COLORS.lightGray)
  doc.rect(marginL, footerBoxY, contentWidth, footerBoxH, 'F')

  const centerX = marginL + contentWidth / 2
  let fy = footerBoxY + footerBoxPad + 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'KONTAKT' : 'CONTACT', centerX, fy, { align: 'center' })
  fy += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`${biz.email}   ·   ${biz.website}`, centerX, fy, { align: 'center' })
  fy += 5
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(
    data.locale === 'de' ? 'Vielen Dank für deinen Einkauf!' : 'Thank you for your order!',
    centerX,
    fy,
    { align: 'center' },
  )

  // Bottom page number
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(`${data.locale === 'de' ? 'Seite' : 'Page'} 1/1`, pageWidth / 2, 290, {
    align: 'center',
  })

  return Buffer.from(doc.output('arraybuffer'))
}
