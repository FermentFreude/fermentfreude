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
 * Generates the RECHNUNG MAN document — a manually-created / offline-paid
 * order (bank transfer, phone, in-person, corporate). Matches the
 * "Fermentfreude – Rechnung MAN – Standard" master template: no online
 * payment/order-status boxes (that's WEB-only) — instead Zahlungsbedingungen
 * and Bankverbindung, since the customer still needs to pay by transfer.
 */
export async function generateRechnungManPDF(data: OrderDocumentData): Promise<Buffer> {
  const biz = resolveBusinessInfo(data.business)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const rightX = PAGE_WIDTH - MARGIN_R

  let y = await drawLetterhead(doc, { titleText: 'RECHNUNG' })
  y += 4

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
    value: data.invoiceNumber ?? `MAN-${data.orderNumber}`,
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

  // ─── Left: Rechnungsempfänger (+ optional Ansprechperson) · Right: Referenz
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
  if (data.contactPersonName) {
    doc.text(data.contactPersonName, MARGIN_L, y)
    y += 4
  }
  if (data.shippingAddress) {
    const fullName = `${data.customerFirstName} ${data.customerLastName}`.trim().toLowerCase()
    const addrLines = data.shippingAddress
      .split('\n')
      .filter((line) => line.trim() && line.trim().toLowerCase() !== fullName)
    for (const line of addrLines) {
      doc.text(line, MARGIN_L, y)
      y += 4
    }
  }

  let ry2 = billToStartY
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text('REFERENZ / BESTELLNUMMER', rightX, ry2, { align: 'right' })
  ry2 += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkText)
  doc.text(data.referenceNote ?? '—', rightX, ry2, { align: 'right' })

  y += 10

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

  y += 6

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

  // ─── Zahlungsbedingungen (left) · Bankverbindung (right) ───────────────
  const boxColW = CONTENT_WIDTH / 2 - 5
  const boxStartY = y

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  doc.text('ZAHLUNGSBEDINGUNGEN', MARGIN_L, y)
  let ly = y + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.darkText)
  const termsLines = doc.splitTextToSize(
    'Zahlbar innerhalb von 14 Kalendertagen ab Ausstellungsdatum ohne Abzug.',
    boxColW,
  )
  doc.text(termsLines, MARGIN_L, ly)
  ly += termsLines.length * 4.2 + 1
  doc.setFont('helvetica', 'bold')
  const refLines = doc.splitTextToSize(
    'Bitte die Rechnungsnummer als Zahlungsreferenz anführen.',
    boxColW,
  )
  doc.text(refLines, MARGIN_L, ly)
  ly += refLines.length * 4.2

  const rightColX = MARGIN_L + CONTENT_WIDTH / 2 + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  doc.text('BANKVERBINDUNG', rightColX, boxStartY)
  let ry3 = boxStartY + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.darkText)
  if (biz.bankName) {
    doc.text(biz.bankName, rightColX, ry3)
    ry3 += 4.2
  }
  doc.setFont('helvetica', 'bold')
  doc.text(`IBAN ${biz.iban ?? '—'}`, rightColX, ry3)
  ry3 += 4.2
  doc.setFont('helvetica', 'normal')
  doc.text(`BIC ${biz.bic ?? '—'}`, rightColX, ry3)

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
