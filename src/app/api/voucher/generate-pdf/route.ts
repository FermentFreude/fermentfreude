import { jsPDF } from 'jspdf'
import { NextRequest, NextResponse } from 'next/server'

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

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const width = pdf.internal.pageSize.getWidth()
    const height = pdf.internal.pageSize.getHeight()

    // Define colors (matching brand)
    const goldAccent = '#D4A574' // ff-gold-accent
    const nearBlack = '#1A1612' // ff-near-black
    const cream = '#FFFBF7' // ff-cream
    const grayText = '#5A5450' // ff-gray-text

    // Background color (cream)
    pdf.setFillColor(255, 251, 247) // cream RGB
    pdf.rect(0, 0, width, height, 'F')

    // Top decoration bar
    pdf.setFillColor(212, 165, 116) // gold accent
    pdf.rect(0, 0, width, 30, 'F')

    // Header text
    pdf.setTextColor(255, 251, 247) // white/cream on gold
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FERMENTFREUDE', width / 2, 18, { align: 'center' })

    // Main content area
    pdf.setTextColor(26, 22, 18) // near-black

    // Section 1: Title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Workshop-Erlebnis Gutschein', width / 2, 50, { align: 'center' })

    // Section 2: Decorative separator
    pdf.setDrawColor(212, 165, 116)
    pdf.setLineWidth(0.5)
    pdf.line(30, 62, width - 30, 62)

    // Section 3: Voucher Code Box
    const boxX = 20
    const boxY = 70
    const boxWidth = width - 40
    const boxHeight = 50

    // Draw box border (gold)
    pdf.setDrawColor(212, 165, 116) // gold
    pdf.setLineWidth(2)
    pdf.rect(boxX, boxY, boxWidth, boxHeight)

    // Background of code box (very light)
    pdf.setFillColor(244, 238, 230)
    pdf.rect(boxX, boxY, boxWidth, boxHeight, 'F')

    // Code label
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(90, 84, 80) // gray-text
    pdf.text('GUTSCHEIN-CODE', width / 2, boxY + 10, { align: 'center' })

    // The actual code (large and bold)
    pdf.setFontSize(20)
    pdf.setFont('courier', 'bold')
    pdf.setTextColor(26, 22, 18)
    pdf.text(sanitizedCode, width / 2, boxY + 28, { align: 'center' })

    // Section 4: Information section
    const infoY = boxY + boxHeight + 20

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(212, 165, 116)
    pdf.text('Details:', 20, infoY)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(26, 22, 18)
    const lineHeight = 7

    // Extract value from code if needed, or use placeholder
    // In real usage, this would come from the voucher record
    const detailsLines = [
      '• Gültig für ein Workshop-Erlebnis',
      '• Kurs kann online auf www.fermentfreude.at ausgewählt werden',
      '• Nach Erwerb wird der Gutschein per E-Mail zugestellt',
      '• Der Gutschein ist 12 Monate gültig',
    ]

    let currentY = infoY + 8
    detailsLines.forEach((line) => {
      pdf.text(line, 25, currentY)
      currentY += lineHeight
    })

    // Section 5: How to redeem
    const redeemY = currentY + 10
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(212, 165, 116)
    pdf.text('So löst du deinen Gutschein ein:', 20, redeemY)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(26, 22, 18)
    const redeemSteps = [
      '1. Besuche www.fermentfreude.at/redeem-voucher',
      '2. Gib deinen Gutschein-Code ein',
      '3. Wähle deinen Workshop',
      '4. Gib den Code beim Checkout ein – die Gebühr wird abgezogen',
    ]

    let currentRedeemY = redeemY + 8
    redeemSteps.forEach((step) => {
      pdf.text(step, 25, currentRedeemY)
      currentRedeemY += lineHeight
    })

    // Section 6: Footer
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

    // Generate PDF
    const pdfBuffer = pdf.output('arraybuffer')

    // Return as downloadable PDF
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
 *  POST /api/voucher/generate-pdf (returns buffer, not download)
 *
 *  Same as GET but returns JSON with base64 PDF for email attachment.
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

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const width = pdf.internal.pageSize.getWidth()
    const height = pdf.internal.pageSize.getHeight()

    // Define colors (matching brand)
    const goldAccent = '#D4A574'
    const nearBlack = '#1A1612'
    const cream = '#FFFBF7'

    // Background color (cream)
    pdf.setFillColor(255, 251, 247)
    pdf.rect(0, 0, width, height, 'F')

    // Top decoration bar
    pdf.setFillColor(212, 165, 116)
    pdf.rect(0, 0, width, 30, 'F')

    // Header text
    pdf.setTextColor(255, 251, 247)
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FERMENTFREUDE', width / 2, 18, { align: 'center' })

    // Main content area
    pdf.setTextColor(26, 22, 18)

    // Section 1: Title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Workshop-Erlebnis Gutschein', width / 2, 50, { align: 'center' })

    // Section 2: Decorative separator
    pdf.setDrawColor(212, 165, 116)
    pdf.setLineWidth(0.5)
    pdf.line(30, 62, width - 30, 62)

    // Section 3: Voucher Code Box
    const boxX = 20
    const boxY = 70
    const boxWidth = width - 40
    const boxHeight = 50

    pdf.setDrawColor(212, 165, 116)
    pdf.setLineWidth(2)
    pdf.rect(boxX, boxY, boxWidth, boxHeight)

    pdf.setFillColor(244, 238, 230)
    pdf.rect(boxX, boxY, boxWidth, boxHeight, 'F')

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(90, 84, 80)
    pdf.text('GUTSCHEIN-CODE', width / 2, boxY + 10, { align: 'center' })

    pdf.setFontSize(20)
    pdf.setFont('courier', 'bold')
    pdf.setTextColor(26, 22, 18)
    pdf.text(sanitizedCode, width / 2, boxY + 28, { align: 'center' })

    // Section 4: Information section
    const infoY = boxY + boxHeight + 20

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(212, 165, 116)
    pdf.text('Details:', 20, infoY)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(26, 22, 18)
    const lineHeight = 7

    const detailsLines = [
      '• Gültig für ein Workshop-Erlebnis',
      '• Kurs kann online auf www.fermentfreude.at ausgewählt werden',
      '• Nach Erwerb wird der Gutschein per E-Mail zugestellt',
      '• Der Gutschein ist 12 Monate gültig',
    ]

    let currentY = infoY + 8
    detailsLines.forEach((line) => {
      pdf.text(line, 25, currentY)
      currentY += lineHeight
    })

    // Section 5: How to redeem
    const redeemY = currentY + 10
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(212, 165, 116)
    pdf.text('So löst du deinen Gutschein ein:', 20, redeemY)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(26, 22, 18)
    const redeemSteps = [
      '1. Besuche www.fermentfreude.at/redeem-voucher',
      '2. Gib deinen Gutschein-Code ein',
      '3. Wähle deinen Workshop',
      '4. Gib den Code beim Checkout ein – die Gebühr wird abgezogen',
    ]

    let currentRedeemY = redeemY + 8
    redeemSteps.forEach((step) => {
      pdf.text(step, 25, currentRedeemY)
      currentRedeemY += lineHeight
    })

    // Section 6: Footer
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

    // Generate PDF and convert to base64
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
