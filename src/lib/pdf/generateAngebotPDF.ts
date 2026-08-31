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
  type QuoteDocumentData,
} from './primitives'

/**
 * Generates the ANGEBOT (quote) document. Matches "Fermentfreude – Angebot
 * ANG – Standard" master template: no Bestellnummer anywhere (nothing has
 * been paid/booked yet), fixed Angebotsbedingungen boilerplate, and a
 * Veranstaltungsdaten box for event logistics still to be confirmed.
 */
export async function generateAngebotPDF(data: QuoteDocumentData): Promise<Buffer> {
  const biz = resolveBusinessInfo(data.business)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const rightX = PAGE_WIDTH - MARGIN_R

  let y = await drawLetterhead(doc, { titleText: 'ANGEBOT' })
  y += 4

  const leftStartY = y
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text('ANGEBOTSAUSSTELLER', MARGIN_L, y)
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
    caption: 'ANGEBOTSNUMMER',
    value: data.quoteNumber,
    align: 'right',
  })
  ry += 3
  ry = drawCaptionValue(doc, {
    x: rightX,
    y: ry,
    caption: 'ANGEBOTSDATUM',
    value: formatDate(data.issueDate, data.locale),
    align: 'right',
  })
  ry += 3
  drawCaptionValue(doc, {
    x: rightX,
    y: ry,
    caption: 'GÜLTIG BIS',
    value: formatDate(data.validUntil, data.locale),
    align: 'right',
  })

  y += 10
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_L, y, rightX, y)
  y += 10

  // ─── Left: Angebotsempfänger · Right: Projekt/Referenz ─────────────────
  const recipientStartY = y
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  doc.text('ANGEBOTSEMPFÄNGER', MARGIN_L, y)
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

  let ry2 = recipientStartY
  ry2 = drawCaptionValue(doc, {
    x: rightX,
    y: ry2,
    caption: 'PROJEKT',
    value: data.projectName,
    align: 'right',
  })
  if (data.clientReference) {
    ry2 += 3
    drawCaptionValue(doc, {
      x: rightX,
      y: ry2,
      caption: 'KUNDENREFERENZ',
      value: data.clientReference,
      align: 'right',
    })
  }

  y += 8

  // ─── Line items ────────────────────────────────────────────────────────
  y = drawLineItemsTable(doc, { y, items: data.items, locale: data.locale })
  y += 6

  doc.setDrawColor(...COLORS.darkText)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_L + CONTENT_WIDTH - 65, y, rightX, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.darkText)
  doc.text('ANGEBOTSSUMME', MARGIN_L + CONTENT_WIDTH - 65, y)
  doc.text(formatCurrency(data.totalCents), rightX, y, { align: 'right' })
  y += 8

  if (biz.isKleinunternehmer) {
    y = drawKleinunternehmerNote(doc, { y, locale: data.locale, alignX: rightX })
  }

  y += 10

  // ─── Angebotsbedingungen (left) · Veranstaltungsdaten (right) ──────────
  const boxColW = CONTENT_WIDTH / 2 - 5
  const boxStartY = y

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  doc.text('ANGEBOTSBEDINGUNGEN', MARGIN_L, y)
  let ly = y + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.darkText)
  const conditions = [
    'Dieses Angebot ist 14 Kalendertage ab Angebotsdatum gültig.',
    'Der gewünschte Termin wird erst nach schriftlicher Annahme und Bestätigung durch Fermentfreude verbindlich reserviert.',
    'Zahlbar innerhalb von 14 Kalendertagen ab Rechnungsdatum, sofern nichts anderes schriftlich vereinbart wurde.',
  ]
  for (const cond of conditions) {
    const lines = splitLines(doc, cond, boxColW)
    doc.text(lines, MARGIN_L, ly)
    ly += lines.length * 4.2 + 2
  }

  const rightColX = MARGIN_L + CONTENT_WIDTH / 2 + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.gold)
  doc.text('VERANSTALTUNGSDATEN', rightColX, boxStartY)
  let ry3 = boxStartY + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.darkText)
  const eventLines: string[] = [
    `Termin / Zeitraum: ${data.eventDateText ?? '[eintragen]'}`,
    `Veranstaltungsort: ${data.eventLocationText ?? '[eintragen]'}`,
    `Teilnehmerzahl: ${data.participantCountText ?? '[eintragen]'}`,
    `Storno / Umbuchung: ${data.cancellationTermsText ?? '[individuelle Vereinbarung]'}`,
  ]
  for (const line of eventLines) {
    const wrapped = splitLines(doc, line, boxColW)
    doc.text(wrapped, rightColX, ry3)
    ry3 += wrapped.length * 4.2
  }

  y = Math.max(ly, ry3) + 6

  // ─── Vertragliche Grundlage (closing paragraph, full width) ────────────
  doc.setDrawColor(...COLORS.divider)
  doc.setLineWidth(0.3)
  doc.line(MARGIN_L, y, rightX, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.grayLabel)
  const legalNote =
    'Vertragliche Grundlage: Es gelten die gemeinsam mit diesem Angebot bereitgestellten AGB der Fermentfreude OG (Stand 14. Juli 2026). Für Sonder-, Partner- oder Privatveranstaltungen gelten zusätzlich die in diesem Angebot angeführten individuellen Vereinbarungen.'
  const legalLines = splitLines(doc, legalNote, CONTENT_WIDTH)
  doc.text(legalLines, MARGIN_L, y)
  y += legalLines.length * 3.8 + 8

  drawFooterBox(doc, {
    startY: y,
    biz,
    locale: data.locale,
    thankYouText:
      data.locale === 'de'
        ? 'Wir freuen uns auf die Zusammenarbeit!'
        : 'We look forward to working with you!',
  })

  return Buffer.from(doc.output('arraybuffer'))
}
