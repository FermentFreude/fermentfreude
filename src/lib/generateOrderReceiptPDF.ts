import { jsPDF } from 'jspdf'
import fs from 'fs'
import path from 'path'

// ─── Company Details ────────────────────────────────────────────────────────
const COMPANY = {
  name: 'FermentFreude OG',
  address: 'Schottenring 16',
  city: '1010 Wien',
  country: 'Österreich',
  uid: 'ATU[XXXXXXXX]', // TODO: Replace with official UID number
  fn: 'FN [XXXXXXXX]', // TODO: Replace with Firmenbuchnummer
  handelsgericht: 'Handelsgericht Wien',
  iban: 'AT[XX XXXX XXXX XXXX XXXX]', // TODO: Replace with official IBAN
  bic: '[BICXXXXXXXX]', // TODO: Replace with official BIC
  bank: '[Bank Name]', // TODO: Replace with bank name
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
  doc.text(COMPANY.name, marginL, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(COMPANY.address, marginL, y)
  y += 4.5
  doc.text(`${COMPANY.city}, ${COMPANY.country}`, marginL, y)
  y += 4.5
  doc.text(COMPANY.email, marginL, y)

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
  let ry2 = y - (data.shippingAddress ? data.shippingAddress.split('\n').filter(Boolean).length * 4 + 10 : 10)
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
  // Austrian standard VAT for physical goods: 20%
  const vatRate = 0.2
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

  labelLine(data.locale === 'de' ? 'Nettobetrag' : 'Subtotal', formatCurrency(Math.round(netAmount)))
  labelLine(data.locale === 'de' ? 'MwSt. 20%' : 'VAT 20%', formatCurrency(Math.round(vatAmount)))

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

  y += 14

  // ─── FOOTER BOX ──────────────────────────────────────────────────────────
  const footerBoxY = Math.max(y, 220)
  const footerBoxH = 30
  const footerBoxPad = 5

  doc.setFillColor(...COLORS.lightGray)
  doc.rect(marginL, footerBoxY, contentWidth, footerBoxH, 'F')

  const fc1X = marginL + footerBoxPad
  const fc2X = marginL + contentWidth / 3 + footerBoxPad
  const fc3X = marginL + (contentWidth * 2) / 3 + footerBoxPad
  let fy = footerBoxY + footerBoxPad + 3

  // Column 1: Payment Details
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'ZAHLUNGSDETAILS' : 'PAYMENT DETAILS', fc1X, fy)
  fy += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`IBAN: ${COMPANY.iban}`, fc1X, fy)
  fy += 4
  doc.text(`BIC: ${COMPANY.bic}`, fc1X, fy)
  fy += 4
  doc.text(COMPANY.bank, fc1X, fy)

  // Column 2: Legal
  let fy2 = footerBoxY + footerBoxPad + 3
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'RECHTLICHE INFORMATIONEN' : 'LEGAL INFORMATION', fc2X, fy2)
  fy2 += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.darkText)
  doc.text(COMPANY.uid, fc2X, fy2)
  fy2 += 4
  doc.text(COMPANY.fn, fc2X, fy2)
  fy2 += 4
  doc.text(COMPANY.handelsgericht, fc2X, fy2)

  // Column 3: Thank you
  let fy3 = footerBoxY + footerBoxPad + 3
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'KONTAKT' : 'CONTACT', fc3X, fy3)
  fy3 += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.darkText)
  doc.text(COMPANY.email, fc3X, fy3)
  fy3 += 4
  doc.text(COMPANY.website, fc3X, fy3)
  fy3 += 4
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'Vielen Dank für deinen Einkauf!' : 'Thank you for your order!', fc3X, fy3)

  // Bottom page number
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(`${data.locale === 'de' ? 'Seite' : 'Page'} 1/1`, pageWidth / 2, 290, { align: 'center' })

  return Buffer.from(doc.output('arraybuffer'))
}
