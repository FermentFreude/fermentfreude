import { jsPDF } from 'jspdf'

import {
  COLORS,
  CONTENT_WIDTH,
  MARGIN_L,
  MARGIN_R,
  PAGE_WIDTH,
  drawCaptionValue,
  drawFooterBox,
  drawKleinunternehmerNote,
  drawLetterhead,
  drawLineItemsTable,
  formatCurrency,
  formatDate,
  resolveBusinessInfo,
  type OrderDocumentData,
} from './primitives'

/**
 * Generates the RECHNUNG WEB document — a Stripe-paid website order.
 * Matches the "Fermentfreude – Rechnung WEB – Designvorlage" master template:
 * Online-Referenzen (Bestellnummer/Kundennummer/Zahlungsstatus),
 * Zahlungsinformationen, and Bestellinformationen boxes. No VAT line is
 * shown anywhere — Fermentfreude is VAT-exempt (Kleinunternehmerregelung).
 */
export async function generateRechnungWebPDF(data: OrderDocumentData): Promise<Buffer> {
  const biz = resolveBusinessInfo(data.business)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const rightX = PAGE_WIDTH - MARGIN_R

  let y = await drawLetterhead(doc, { titleText: 'RECHNUNG' })
  y += 4

  // ─── Left: issuer · Right: Rechnungsnummer / Ausstellungsdatum / Lieferdatum
  const leftStartY = y
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text('RECHNUNGSAUSSTELLER', MARGIN_L, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  doc.text(biz.name, MARGIN_L, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(biz.address, MARGIN_L, y)
  y += 4.5
  doc.text(`${biz.city}, ${biz.country}`, MARGIN_L, y)
  y += 4.5
  doc.text(biz.email, MARGIN_L, y)

  let ry = leftStartY
  ry = drawCaptionValue(doc, {
    x: rightX,
    y: ry,
    caption: 'RECHNUNGSNUMMER',
    value: data.invoiceNumber ?? `WEB-${data.orderNumber}`,
    align: 'right',
  })
  ry += 3
  ry = drawCaptionValue(doc, {
    x: rightX,
    y: ry,
    caption: 'AUSSTELLUNGSDATUM',
    value: formatDate(data.issueDate, data.locale),
    align: 'right',
  })
  ry += 3
  drawCaptionValue(doc, {
    x: rightX,
    y: ry,
    caption: 'LIEFER-/LEISTUNGSDATUM',
    value: formatDate(data.deliveryDate ?? data.issueDate, data.locale),
    align: 'right',
  })

  y += 10
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_L, y, rightX, y)
  y += 10

  // ─── Left: Rechnungsempfänger · Right: Online-Referenzen
  const billToStartY = y
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text('RECHNUNGSEMPFÄNGER', MARGIN_L, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`${data.customerFirstName} ${data.customerLastName}`, MARGIN_L, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  if (data.shippingAddress) {
    const fullName = `${data.customerFirstName} ${data.customerLastName}`.trim().toLowerCase()
    // The formatted address's first line often repeats the customer name
    // (already printed bold above) — skip it to avoid a duplicate line.
    const addrLines = data.shippingAddress
      .split('\n')
      .filter((line) => line.trim() && line.trim().toLowerCase() !== fullName)
    for (const line of addrLines) {
      doc.text(line, MARGIN_L, y)
      y += 4
    }
  }
  doc.text(data.customerEmail, MARGIN_L, y)

  let ry2 = billToStartY
  ry2 = drawCaptionValue(doc, {
    x: rightX,
    y: ry2,
    caption: 'BESTELLNUMMER',
    value: data.orderNumber,
    align: 'right',
  })
  ry2 += 3
  ry2 = drawCaptionValue(doc, {
    x: rightX,
    y: ry2,
    caption: 'KUNDENNUMMER',
    value: `CUST-${data.orderId.slice(-8).toUpperCase()}`,
    align: 'right',
  })
  ry2 += 3
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text('ZAHLUNGSSTATUS', rightX, ry2, { align: 'right' })
  ry2 += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(34, 139, 34)
  doc.text('Bezahlt', rightX, ry2, { align: 'right' })
  doc.setTextColor(...COLORS.darkText)

  y += 12

  // ─── Line items ────────────────────────────────────────────────────────
  y = drawLineItemsTable(doc, { y, items: data.items, locale: data.locale })

  if (data.shippingCents > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.darkText)
    doc.text('Versand', MARGIN_L + 3, y)
    doc.text(formatCurrency(data.shippingCents), rightX - 3, y, { align: 'right' })
    y += 6
    doc.setDrawColor(...COLORS.divider)
    doc.setLineWidth(0.3)
    doc.line(MARGIN_L, y, rightX, y)
    y += 6
  }

  if (data.voucherDiscountCents && data.voucherDiscountCents > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.darkText)
    doc.text('Gutschein', MARGIN_L + 3, y)
    doc.text(`-${formatCurrency(data.voucherDiscountCents)}`, rightX - 3, y, { align: 'right' })
    y += 6
    doc.setDrawColor(...COLORS.divider)
    doc.setLineWidth(0.3)
    doc.line(MARGIN_L, y, rightX, y)
    y += 6
  }

  y += 6

  // ─── GESAMTBETRAG (no VAT line — Kleinunternehmer) ─────────────────────
  doc.setDrawColor(...COLORS.darkText)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_L + CONTENT_WIDTH - 65, y, rightX, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.darkText)
  doc.text('GESAMTBETRAG', MARGIN_L + CONTENT_WIDTH - 65, y)
  doc.text(formatCurrency(data.totalCents), rightX, y, { align: 'right' })
  y += 8

  if (biz.isKleinunternehmer) {
    y = drawKleinunternehmerNote(doc, { y, locale: data.locale, alignX: rightX })
  }

  y += 10

  // ─── Zahlungsinformationen (left) · Bestellinformationen (right) ───────
  const boxColW = CONTENT_WIDTH / 2 - 5
  const boxStartY = y

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  doc.text('ZAHLUNGSINFORMATIONEN', MARGIN_L, y)
  let ly = y + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.darkText)
  const paidLine = `Bezahlt am ${formatDate(data.issueDate, data.locale)} über ${data.paymentMethodLabel ?? 'Stripe'}.`
  const paidLines = doc.splitTextToSize(paidLine, boxColW)
  doc.text(paidLines, MARGIN_L, ly)
  ly += paidLines.length * 4.2 + 1
  doc.text(`Zahlungsreferenz: ${data.paymentReference ?? data.orderNumber}`, MARGIN_L, ly)

  const rightColX = MARGIN_L + CONTENT_WIDTH / 2 + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  doc.text('BESTELLINFORMATIONEN', rightColX, boxStartY)
  let ry3 = boxStartY + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`Bestellt am ${formatDate(data.orderedAt, data.locale)}.`, rightColX, ry3)
  ry3 += 4.2
  doc.text(`Erfüllungsart: ${data.fulfilmentType ?? 'Versand'}.`, rightColX, ry3)
  ry3 += 4.2
  doc.text(`Bestellreferenz: ${data.orderNumber}`, rightColX, ry3)

  y = Math.max(ly, ry3) + 10

  drawFooterBox(doc, {
    startY: y,
    biz,
    locale: data.locale,
    thankYouText:
      data.locale === 'de' ? 'Vielen Dank für deinen Einkauf!' : 'Thank you for your order!',
  })

  return Buffer.from(doc.output('arraybuffer'))
}
