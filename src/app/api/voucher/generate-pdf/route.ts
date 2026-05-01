import { readFileSync } from 'fs'
import { jsPDF } from 'jspdf'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

/* ─── shared PDF builder ─────────────────────────────────────── */
function buildVoucherPDF(sanitizedCode: string): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const width = pdf.internal.pageSize.getWidth()
  const height = pdf.internal.pageSize.getHeight()

  // Cream background
  pdf.setFillColor(255, 251, 247)
  pdf.rect(0, 0, width, height, 'F')

  // ── Submark logo ──────────────────────────────────────────────
  try {
    const submarkPath = join(process.cwd(), 'public', 'submark-dark.png')
    const submarkData = readFileSync(submarkPath)
    const submarkBase64 = `data:image/png;base64,${submarkData.toString('base64')}`
    const logoSize = 42 // mm
    const logoX = (width - logoSize) / 2
    pdf.addImage(submarkBase64, 'PNG', logoX, 10, logoSize, logoSize)
  } catch {
    // Fallback: gold box with FH text
    const logoSize = 42
    const logoX = (width - logoSize) / 2
    pdf.setFillColor(212, 165, 116)
    pdf.rect(logoX, 10, logoSize, logoSize, 'F')
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 251, 247)
    pdf.text('FH', width / 2, 10 + logoSize / 2 + 4, { align: 'center' })
  }

  // Brand name below logo
  pdf.setTextColor(26, 22, 18)
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('FERMENTFREUDE', width / 2, 60, { align: 'center' })

  // Gold separator
  pdf.setDrawColor(212, 165, 116)
  pdf.setLineWidth(0.5)
  pdf.line(30, 68, width - 30, 68)

  // Title
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(26, 22, 18)
  pdf.text('Workshop-Erlebnis Gutschein', width / 2, 80, { align: 'center' })

  // ── Voucher Code Box ──────────────────────────────────────────
  const boxX = 20
  const boxY = 90
  const boxWidth = width - 40
  const boxHeight = 48

  pdf.setDrawColor(212, 165, 116)
  pdf.setLineWidth(2)
  pdf.rect(boxX, boxY, boxWidth, boxHeight)
  pdf.setFillColor(244, 238, 230)
  pdf.rect(boxX, boxY, boxWidth, boxHeight, 'F')

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(90, 84, 80)
  pdf.text('GUTSCHEIN-CODE', width / 2, boxY + 10, { align: 'center' })

  pdf.setFontSize(20)
  pdf.setFont('courier', 'bold')
  pdf.setTextColor(26, 22, 18)
  pdf.text(sanitizedCode, width / 2, boxY + 28, { align: 'center' })

  // ── Details ───────────────────────────────────────────────────
  const infoY = boxY + boxHeight + 18
  const lineHeight = 7

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(212, 165, 116)
  pdf.text('Details:', 20, infoY)

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(26, 22, 18)
  const detailsLines = [
    '\u2022 G\u00FCltig f\u00FCr ein Workshop-Erlebnis',
    '\u2022 Kurs kann online auf www.fermentfreude.at ausgew\u00E4hlt werden',
    '\u2022 Nach Erwerb wird der Gutschein per E-Mail zugestellt',
    '\u2022 Der Gutschein ist 12 Monate g\u00FCltig',
  ]
  let currentY = infoY + 8
  detailsLines.forEach((line) => {
    pdf.text(line, 25, currentY)
    currentY += lineHeight
  })

  // ── Redemption steps ──────────────────────────────────────────
  const redeemY = currentY + 10
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(212, 165, 116)
  pdf.text('So l\u00F6st du deinen Gutschein ein:', 20, redeemY)

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(26, 22, 18)
  const redeemSteps = [
    '1. Besuche www.fermentfreude.at/workshops',
    '2. W\u00E4hle einen Workshop und lege ihn in den Warenkorb',
    '3. Beim Checkout: Gib deinen Code ein \u2013 die Geb\u00FChr wird direkt abgezogen',
  ]
  let currentRedeemY = redeemY + 8
  redeemSteps.forEach((step) => {
    pdf.text(step, 25, currentRedeemY)
    currentRedeemY += lineHeight
  })

  // ── Footer ────────────────────────────────────────────────────
  const footerY = height - 20
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(90, 84, 80)
  pdf.text(
    'Fragen? Kontaktiere uns unter kontakt@fermentfreude.at oder besuche www.fermentfreude.at',
    width / 2,
    footerY,
    { align: 'center' },
  )
  pdf.text(`Erstellt: ${new Date().toLocaleDateString('de-AT')}`, width / 2, footerY + 7, {
    align: 'center',
  })

  return pdf
}

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/voucher/generate-pdf?code=FF-GIFT-XXXXXXXX
 *
 *  Generates a beautiful PDF voucher for a given code.
 *  Returns PDF as download or can be called to get PDF buffer.
 *  Used on success page for download and in email delivery.
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Voucher code is required.' },
        { status: 400 },
      )
    }
    const sanitizedCode = code.trim().toUpperCase()
    const pdf = buildVoucherPDF(sanitizedCode)
    const pdfBuffer = pdf.output('arraybuffer')
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gutschein-${sanitizedCode}.pdf"`,
        'Cache-Control': 'no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[voucher/generate-pdf] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate PDF.' }, { status: 500 })
  }
}

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/voucher/generate-pdf
 *  Returns JSON with base64 PDF for email attachment.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Voucher code is required.' },
        { status: 400 },
      )
    }
    const sanitizedCode = code.trim().toUpperCase()
    const pdf = buildVoucherPDF(sanitizedCode)
    const pdfBuffer = pdf.output('arraybuffer')
    const base64 = Buffer.from(pdfBuffer).toString('base64')
    return NextResponse.json({
      success: true,
      pdf: {
        base64,
        filename: `gutschein-${sanitizedCode}.pdf`,
        contentType: 'application/pdf',
      },
    })
  } catch (error) {
    console.error('[voucher/generate-pdf POST] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate PDF.' }, { status: 500 })
  }
}
