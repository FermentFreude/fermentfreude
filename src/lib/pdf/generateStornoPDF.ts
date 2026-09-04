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
  splitLines,
  type CancellationDocumentData,
} from './primitives'

const REFUND_STATUS_LABEL: Record<CancellationDocumentData['refundStatus'], string> = {
  offen: 'offen',
  erstattet: 'erstattet',
  verrechnet: 'verrechnet',
}

/**
 * Generates the STORNORECHNUNG (cancellation/credit note) document. Matches
 * "Fermentfreude – Stornorechnung – Standard" master template: negative
 * line-item amounts, references the original invoice, and never mutates or
 * replaces it — both documents are kept together per the Hinweis box.
 */
export async function generateStornoPDF(data: CancellationDocumentData): Promise<Buffer> {
  const biz = resolveBusinessInfo(data.business)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const rightX = PAGE_WIDTH - MARGIN_R

  let y = await drawLetterhead(doc, { titleText: 'STORNORECHNUNG' })
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
    caption: 'STORNONUMMER',
    value: data.cancellationNumber,
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
    caption: 'BEZUGSRECHNUNG',
    value: `${data.originalInvoiceNumber} vom ${formatDate(data.originalIssueDate, data.locale)}`,
    align: 'right',
  })

  y += 10
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_L, y, rightX, y)
  y += 10

  // ─── Left: Rechnungsempfänger · Right: Stornoreferenz ──────────────────
  const billToStartY = y
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text('RECHNUNGSEMPFÄNGER', MARGIN_L, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.darkText)
  doc.text(data.clientName, MARGIN_L, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  if (data.contactPersonName) {
    doc.text(data.contactPersonName, MARGIN_L, y)
    y += 4
  }
  if (data.clientAddress) {
    for (const line of data.clientAddress.split('\n').filter(Boolean)) {
      doc.text(line, MARGIN_L, y)
      y += 4
    }
  }

  let ry2 = billToStartY
  ry2 = drawCaptionValue(doc, {
    x: rightX,
    y: ry2,
    caption: 'ORIGINALRECHNUNG',
    value: data.originalInvoiceNumber,
    align: 'right',
  })
  if (data.reason) {
    ry2 += 3
    drawCaptionValue(doc, {
      x: rightX,
      y: ry2,
      caption: 'STORNOANLASS',
      value: data.reason,
      align: 'right',
    })
  }

  y += 10

  // ─── Line items (negated) ──────────────────────────────────────────────
  const negatedItems = data.items.map((item) => ({ ...item, unitPrice: -Math.abs(item.unitPrice) }))
  y = drawLineItemsTable(doc, { y, items: negatedItems, locale: data.locale })
  y += 6

  doc.setDrawColor(...COLORS.darkText)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_L + CONTENT_WIDTH - 65, y, rightX, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.darkText)
  doc.text('STORNOBETRAG', MARGIN_L + CONTENT_WIDTH - 65, y)
  doc.text(formatCurrency(-Math.abs(data.totalCents)), rightX, y, { align: 'right' })
  y += 8

  if (biz.isKleinunternehmer) {
    y = drawKleinunternehmerNote(doc, { y, locale: data.locale, alignX: rightX })
  }

  y += 10

  // ─── Hinweis (left) · Erstattung/Verrechnung (right) ───────────────────
  const boxColW = CONTENT_WIDTH / 2 - 5
  const boxStartY = y

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  doc.text('HINWEIS', MARGIN_L, y)
  let ly = y + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.darkText)
  const notes = [
    'Diese Stornorechnung storniert die oben angeführte Originalrechnung vollständig.',
    'Die Originalrechnung und diese Stornorechnung sind gemeinsam aufzubewahren.',
  ]
  for (const note of notes) {
    const lines = splitLines(doc, note, boxColW)
    doc.text(lines, MARGIN_L, ly)
    ly += lines.length * 4.2 + 2
  }

  const rightColX = MARGIN_L + CONTENT_WIDTH / 2 + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  doc.text('ERSTATTUNG / VERRECHNUNG', rightColX, boxStartY)
  let ry3 = boxStartY + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.darkText)
  doc.text(`Status: ${REFUND_STATUS_LABEL[data.refundStatus]}`, rightColX, ry3)
  ry3 += 4.2
  doc.text(`Datum: ${data.refundDate ? formatDate(data.refundDate, data.locale) : '—'}`, rightColX, ry3)
  ry3 += 4.2
  doc.text(`Zahlungsart / Referenz: ${data.refundMethodOrReference ?? '—'}`, rightColX, ry3)
  ry3 += 4.2
  const refundNote = splitLines(
    doc,
    'Die Erstattung erfolgt grundsätzlich auf das ursprünglich verwendete Zahlungsmittel, sofern nichts anderes vereinbart wurde.',
    boxColW,
  )
  doc.text(refundNote, rightColX, ry3)
  ry3 += refundNote.length * 4.2

  y = Math.max(ly, ry3) + 10

  drawFooterBox(doc, {
    startY: y,
    biz,
    locale: data.locale,
    thankYouText:
      data.locale === 'de'
        ? 'Vielen Dank für dein Verständnis.'
        : 'Thank you for your understanding.',
  })

  return Buffer.from(doc.output('arraybuffer'))
}
