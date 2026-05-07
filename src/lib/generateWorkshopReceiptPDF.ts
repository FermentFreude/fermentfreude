import { jsPDF } from 'jspdf'
import fs from 'fs'
import path from 'path'

// ─── Company Details (update when official data is confirmed) ───────────────
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
export interface WorkshopReceiptBusinessInfo {
  name?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  email?: string | null
  website?: string | null
  uid?: string | null
  fn?: string | null
  court?: string | null
  iban?: string | null
  bic?: string | null
  bank?: string | null
  /** Reduced rate (%) applied when not Kleinunternehmer. Default 10 for AT workshops. */
  vatRate?: number | null
  /** § 6 Abs. 1 Z 27 UStG — small business: no VAT shown. */
  isKleinunternehmer?: boolean | null
}

export interface WorkshopReceiptData {
  bookingId: string
  workshopTitle: string
  workshopDate: string // e.g. "15. März 2025"
  workshopTime: string // e.g. "10:00 – 13:00 Uhr"
  workshopLocation?: string
  guestCount: number
  pricePerPerson: number
  totalPrice: number
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  issueDate: Date
  locale: 'de' | 'en'
  /** Resolved live from the BusinessInfo global. Falls back to COMPANY constants. */
  business?: WorkshopReceiptBusinessInfo
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return `€ ${amount.toFixed(2).replace('.', ',')}`
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
export function generateWorkshopReceiptPDF(data: WorkshopReceiptData): Buffer {  const b = data.business ?? {}
  const biz = {
    name: b.name || COMPANY.name,
    address: b.address || COMPANY.address,
    city: b.city || COMPANY.city,
    country: b.country || COMPANY.country,
    email: b.email || COMPANY.email,
    website: b.website || COMPANY.website,
    uid: b.uid || COMPANY.uid,
    fn: b.fn || COMPANY.fn,
    court: b.court || COMPANY.handelsgericht,
    iban: b.iban || COMPANY.iban,
    bic: b.bic || COMPANY.bic,
    bank: b.bank || COMPANY.bank,
    // Workshops are an educational service in AT → reduced 10 % rate by default.
    vatRate: typeof b.vatRate === 'number' && b.vatRate >= 0 ? b.vatRate / 100 : 0.1,
    isKleinunternehmer: b.isKleinunternehmer === true,
  }
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // A4: 210mm wide × 297mm tall
  const pageWidth = 210
  const marginL = 20
  const marginR = 20
  const contentWidth = pageWidth - marginL - marginR

  // ─── Load logo ────────────────────────────────────────────────────────────
  let logoBase64: string | null = null
  try {
    const logoPath = path.join(process.cwd(), 'public', 'submark-dark.png')
    const logoBuf = fs.readFileSync(logoPath)
    logoBase64 = logoBuf.toString('base64')
  } catch {
    // logo not critical — continue without it
  }

  // ─── HEADER SECTION ───────────────────────────────────────────────────────

  // Gold top accent bar
  doc.setFillColor(...COLORS.gold)
  doc.rect(0, 0, pageWidth, 4, 'F')

  let y = 18

  // Logo (square, top-left)
  if (logoBase64) {
    doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', marginL, y, 18, 18)
  } else {
    // Fallback: dark square with "FF"
    doc.setFillColor(...COLORS.darkText)
    doc.rect(marginL, y, 18, 18, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.white)
    doc.text('FF', marginL + 9, y + 11, { align: 'center' })
  }

  // "RECHNUNG" / "RECEIPT" title (top-right, large)
  const titleText = data.locale === 'de' ? 'RECHNUNG' : 'RECEIPT'
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...COLORS.darkText)
  doc.text(titleText, pageWidth - marginR, y + 14, { align: 'right' })

  y += 26

  // Company info (left) | Invoice meta (right)
  const colMid = pageWidth / 2

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

  // Right: invoice number + issue date
  const rightX = pageWidth - marginR
  let ry = y - 14

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'BUCHUNGSNUMMER' : 'BOOKING NUMBER', rightX, ry, {
    align: 'right',
  })
  ry += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  const bookingRef = `#BOOKING-${data.bookingId.slice(-8).toUpperCase()}`
  doc.text(bookingRef, rightX, ry, { align: 'right' })

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

  // Gold divider
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.5)
  doc.line(marginL, y, pageWidth - marginR, y)

  y += 10

  // ─── BILL TO SECTION ──────────────────────────────────────────────────────

  // Left: Bill To
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

  // Right: Customer ID + Payment status
  let ry2 = y - 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'KUNDENNUMMER' : 'CUSTOMER ID', rightX, ry2, {
    align: 'right',
  })
  ry2 += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`CUST-${data.bookingId.slice(-8).toUpperCase()}`, rightX, ry2, { align: 'right' })

  ry2 += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'ZAHLUNGSSTATUS' : 'PAYMENT STATUS', rightX, ry2, {
    align: 'right',
  })
  ry2 += 5

  // Green "Bezahlt" / "Paid" badge
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(34, 139, 34) // forest green
  doc.text(data.locale === 'de' ? 'Bezahlt' : 'Paid', rightX, ry2, { align: 'right' })
  doc.setTextColor(...COLORS.darkText)

  y += 12

  // ─── LINE ITEMS TABLE ─────────────────────────────────────────────────────

  // Table header background (light gray)
  const tableHeaderH = 9
  doc.setFillColor(...COLORS.tableHeaderBg)
  doc.rect(marginL, y, contentWidth, tableHeaderH, 'F')

  // Gold bottom border under header
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.8)
  doc.line(marginL, y + tableHeaderH, pageWidth - marginR, y + tableHeaderH)

  // Column widths (mm): Description | QTY | Unit Price | Total
  const col = {
    descX: marginL + 3,
    qtyX: marginL + contentWidth * 0.58,
    unitX: marginL + contentWidth * 0.73,
    totalX: pageWidth - marginR - 3,
    descW: contentWidth * 0.55,
  }

  // Header labels in gold
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)

  const headerY = y + 6
  doc.text(
    data.locale === 'de' ? 'LEISTUNGSBESCHREIBUNG' : 'ITEM DESCRIPTION',
    col.descX,
    headerY,
  )
  doc.text(data.locale === 'de' ? 'ANZ.' : 'QTY', col.qtyX, headerY, { align: 'center' })
  doc.text(data.locale === 'de' ? 'EINZELPREIS' : 'UNIT PRICE', col.unitX + 8, headerY, {
    align: 'right',
  })
  doc.text(data.locale === 'de' ? 'GESAMT' : 'TOTAL', col.totalX, headerY, { align: 'right' })

  y += tableHeaderH + 8

  // ─── Line Item Row ────────────────────────────────────────────────────────

  // Workshop title (bold)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  const titleLines = splitLines(doc, data.workshopTitle, col.descW)
  doc.text(titleLines, col.descX, y)

  // Workshop detail (italic gray)
  const detailParts = [data.workshopDate, data.workshopTime]
  if (data.workshopLocation) detailParts.push(data.workshopLocation)
  const detail = detailParts.join(' · ')
  const detailLines = splitLines(doc, detail, col.descW)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(detailLines, col.descX, y + titleLines.length * 4.5 + 1)

  const rowHeight = Math.max(titleLines.length * 4.5 + detailLines.length * 4 + 4, 12)

  // QTY column
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  doc.text(String(data.guestCount), col.qtyX, y, { align: 'center' })

  // Unit price column
  doc.text(formatCurrency(data.pricePerPerson), col.unitX + 8, y, { align: 'right' })

  // Total column
  doc.text(formatCurrency(data.totalPrice), col.totalX, y, { align: 'right' })

  y += rowHeight

  // Row bottom divider
  doc.setDrawColor(...COLORS.divider)
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageWidth - marginR, y)

  y += 8

  // ─── TOTALS SECTION ───────────────────────────────────────────────────────

  // Austrian VAT on workshops/education: 10%
  // Austrian law: workshop as Bildungsleistung = 10% reduced rate
  const vatRate = 0.1
  // Total price is VAT-inclusive (gross)
  const netAmount = data.totalPrice / (1 + vatRate)
  const vatAmount = data.totalPrice - netAmount

  const totalsLabelX = pageWidth - marginR - 60
  const totalsValueX = pageWidth - marginR

  const labelLine = (label: string, value: string, bold = false) => {
    if (bold) {
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.grayLabel)
    doc.text(label, totalsLabelX, y)
    doc.setTextColor(...COLORS.darkText)
    doc.text(value, totalsValueX, y, { align: 'right' })
    y += 6
  }

  labelLine(data.locale === 'de' ? 'Nettobetrag' : 'Subtotal', formatCurrency(netAmount))
  labelLine(
    data.locale === 'de' ? 'MwSt. 10%' : 'VAT 10%',
    formatCurrency(vatAmount),
  )

  // Total line — larger
  y += 2
  doc.setDrawColor(...COLORS.darkText)
  doc.setLineWidth(0.5)
  doc.line(totalsLabelX - 5, y, pageWidth - marginR, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.darkText)
  doc.text(data.locale === 'de' ? 'GESAMTBETRAG' : 'TOTAL AMOUNT', totalsLabelX - 5, y)
  doc.text(formatCurrency(data.totalPrice), totalsValueX, y, { align: 'right' })

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

  // ─── FOOTER BOX ───────────────────────────────────────────────────────────

  // Calculate remaining space for footer
  const footerBoxY = Math.max(y, 220)
  const footerBoxH = 30
  const footerBoxPad = 5

  doc.setFillColor(...COLORS.lightGray)
  doc.rect(marginL, footerBoxY, contentWidth, footerBoxH, 'F')

  // Footer columns: Payment Details | Legal Info | Thank You
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
  doc.text(`IBAN: ${biz.iban}`, fc1X, fy)
  fy += 4
  doc.text(`BIC: ${biz.bic}`, fc1X, fy)
  fy += 4
  doc.text(biz.bank, fc1X, fy)

  // Column 2: Legal Information
  let fy2 = footerBoxY + footerBoxPad + 3
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text(data.locale === 'de' ? 'RECHTLICHE INFORMATIONEN' : 'LEGAL INFORMATION', fc2X, fy2)
  fy2 += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`UID: ${biz.uid}`, fc2X, fy2)
  fy2 += 4
  doc.text(biz.fn, fc2X, fy2)
  fy2 += 4
  doc.text(biz.court, fc2X, fy2)

  // Column 3: Thank You message (italic gold)
  let fy3 = footerBoxY + footerBoxPad + 3
  doc.setFont('helvetica', 'bolditalic')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.gold)
  const thankYou =
    data.locale === 'de'
      ? 'Danke, dass du handwerkliche\nFermentationskunst unterstützt.'
      : 'Thank you for supporting\nartisanal fermentation crafts.'
  const thankLines = thankYou.split('\n')
  fy3 += 4 // align vertically to middle of box
  thankLines.forEach((line) => {
    doc.text(line, fc3X, fy3)
    fy3 += 4.5
  })

  // ─── FOOTER COPYRIGHT ─────────────────────────────────────────────────────

  const copyrightY = footerBoxY + footerBoxH + 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(...COLORS.grayLabel)
  const year = data.issueDate.getFullYear()
  doc.text(
    `© ${year} FERMENTFREUDE OG · ${biz.website}`,
    pageWidth / 2,
    copyrightY,
    { align: 'center' },
  )

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
