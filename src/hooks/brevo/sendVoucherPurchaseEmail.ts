import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail, sendTransactionalEmail } from '@/lib/brevo'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Send voucher purchase confirmation email via Brevo after a new voucher is created.
 * Branches by deliveryMethod:
 *   - email-recipient: primary email to the recipient + copy to the purchaser
 *   - email-self:      purchaser only (so they can forward)
 *   - pdf:             purchaser only (PDF emphasis)
 *   - email (legacy):  purchaser + recipient (legacy 2-send behavior)
 *   - pickup (legacy): purchaser only
 */
export const sendVoucherPurchaseEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc
  if (req?.context?.skipVoucherEmail) return doc

  const purchaserEmail = doc.purchaserEmail
  if (!purchaserEmail) return doc

  try {
    const baseUrl = getServerSideURL().replace(/\/$/, '')
    const pdfUrl = `${baseUrl}/api/voucher/generate-pdf?code=${encodeURIComponent(String(doc.code ?? ''))}`

    const expiryDate = new Date(doc.createdAt)
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    const voucherExpiry = expiryDate.toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const purchaserNameValue =
      typeof doc.purchaserName === 'string' && doc.purchaserName.trim().length > 0
        ? doc.purchaserName.trim()
        : ''
    const purchaserFirstName = purchaserNameValue
      ? purchaserNameValue.split(/\s+/)[0]
      : (purchaserEmail.split('@')[0] ?? '')

    const recipientNameValue =
      typeof doc.recipientName === 'string' && doc.recipientName.trim().length > 0
        ? doc.recipientName.trim()
        : ''
    const recipientFirstName = recipientNameValue
      ? recipientNameValue.split(/\s+/)[0]
      : doc.recipientEmail
        ? (doc.recipientEmail.split('@')[0] ?? '')
        : ''

    const personalNote = typeof doc.personalNote === 'string' ? doc.personalNote.trim() : ''

    const shopUrl = `${baseUrl}/workshops`
    const voucherUrl = `${baseUrl}/workshops/voucher`
    const privacyUrl = `${baseUrl}/datenschutz`
    const agbUrl = `${baseUrl}/agb`

    const deliveryLabel = (() => {
      switch (doc.deliveryMethod) {
        case 'email-recipient':
          return 'Direkt an Empf\u00e4nger:in'
        case 'email-self':
          return 'An mich (zum Weiterleiten)'
        case 'pdf':
          return 'PDF zum Ausdrucken'
        case 'pickup':
          return 'Abholung'
        case 'email':
        default:
          return 'E-Mail'
      }
    })()

    const baseParams = {
      VOUCHER_CODE: String(doc.code ?? ''),
      VOUCHER_AMOUNT: String(doc.value ?? 99),
      VOUCHER_EXPIRY: voucherExpiry,
      DELIVERY_METHOD: deliveryLabel,
      RECIPIENT_NAME: recipientNameValue,
      RECIPIENT_EMAIL: doc.recipientEmail || '',
      PERSONAL_NOTE: personalNote,
      PURCHASER_NAME: purchaserNameValue,
      PDF_DOWNLOAD_URL: pdfUrl,
      SHOP_URL: shopUrl,
      VOUCHER_URL: voucherUrl,
      PRIVACY_URL: privacyUrl,
      AGB_URL: agbUrl,
    }

    const sendToPurchaser = (extra: Record<string, string> = {}) =>
      sendTemplateEmail({
        to: [{ email: purchaserEmail }],
        templateId: BREVO_TEMPLATES.VOUCHER_PURCHASED,
        params: { ...baseParams, FIRST_NAME: purchaserFirstName, ...extra },
      })

    const sendToRecipient = (extra: Record<string, string> = {}) => {
      if (!doc.recipientEmail) return Promise.resolve({ success: true as const })
      return sendTemplateEmail({
        to: [{ email: doc.recipientEmail }],
        templateId: BREVO_TEMPLATES.VOUCHER_PURCHASED,
        params: {
          ...baseParams,
          FIRST_NAME: recipientFirstName || purchaserFirstName,
          ...extra,
        },
      })
    }

    // Sequential awaits — never Promise.all (MongoDB Atlas M0 has no transactions)
    // Track whether the customer-facing send actually succeeded — a non-throwing
    // { success: false } from Brevo must not be mistaken for a delivered email.
    let customerSendFailed = false
    switch (doc.deliveryMethod) {
      case 'email-recipient': {
        const r1 = await sendToRecipient({ IS_RECIPIENT: 'true' })
        if (!r1.success) customerSendFailed = true
        if (doc.recipientEmail && doc.recipientEmail !== purchaserEmail) {
          const r2 = await sendToPurchaser({ IS_PURCHASER_COPY: 'true' })
          if (!r2.success) customerSendFailed = true
        } else if (!doc.recipientEmail) {
          const r2 = await sendToPurchaser()
          if (!r2.success) customerSendFailed = true
        }
        break
      }
      case 'email-self': {
        const r = await sendToPurchaser({ IS_FORWARD: 'true' })
        if (!r.success) customerSendFailed = true
        break
      }
      case 'pdf': {
        const r = await sendToPurchaser({ IS_PDF: 'true' })
        if (!r.success) customerSendFailed = true
        break
      }
      case 'email': {
        const r1 = await sendToPurchaser()
        if (!r1.success) customerSendFailed = true
        if (doc.recipientEmail && doc.recipientEmail !== purchaserEmail) {
          const r2 = await sendToRecipient()
          if (!r2.success) customerSendFailed = true
        }
        break
      }
      case 'pickup':
      default: {
        const r = await sendToPurchaser()
        if (!r.success) customerSendFailed = true
        break
      }
    }

    if (customerSendFailed) {
      req.payload.logger.error(
        `[Brevo] Voucher purchase email FAILED to send for voucher ${doc.code} (purchaser ${purchaserEmail}) — see prior [Brevo] log line for the API error.`,
      )
      doc.emailDeliveryFailed = true
      try {
        await req.payload.update({
          collection: 'vouchers',
          id: doc.id,
          data: { emailDeliveryFailed: true },
          overrideAccess: true,
        })
      } catch {
        // Non-fatal — doc.emailDeliveryFailed is still set on the in-memory
        // doc returned to the caller of payload.create() this one time.
      }
    }

    // ─── Admin notification — always sent, success or failure ───────
    try {
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'kontakt@fermentfreude.at'
      const recipientLine = doc.recipientEmail
        ? `<tr><td style="padding:4px 12px 4px 0;color:#555">Empfänger:in</td><td style="padding:4px 0">${recipientNameValue || ''} ${doc.recipientEmail ? `&lt;${doc.recipientEmail}&gt;` : ''}</td></tr>`
        : ''
      const warningBlock = customerSendFailed
        ? `<p style="font-family:sans-serif;background:#FEF3C7;color:#92400E;padding:12px 16px;border-radius:8px;margin:0 0 16px">
             ⚠️ Die Bestätigungs-E-Mail an den/die Käufer:in konnte NICHT gesendet werden (Brevo-Fehler). Bitte manuell nachfassen.
           </p>`
        : ''
      const htmlContent = `
${warningBlock}
<h2 style="font-family:sans-serif;margin-bottom:16px">Neuer Gutschein-Kauf: ${String(doc.code ?? '')}</h2>
<table style="font-family:sans-serif;border-collapse:collapse;font-size:14px">
  <tr><td style="padding:4px 12px 4px 0;color:#555;white-space:nowrap">Betrag</td><td style="padding:4px 0"><strong>€${String(doc.value ?? 99)}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Käufer:in</td><td style="padding:4px 0">${purchaserNameValue || ''} <a href="mailto:${purchaserEmail}">${purchaserEmail}</a></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Zustellart</td><td style="padding:4px 0">${deliveryLabel}</td></tr>
  ${recipientLine}
  <tr><td style="padding:16px 12px 4px 0;color:#555;border-top:1px solid #eee">Gutschein-Code</td><td style="padding:16px 0 4px;border-top:1px solid #eee;font-family:monospace">${String(doc.code ?? '')}</td></tr>
</table>`

      await sendTransactionalEmail({
        to: [{ email: adminEmail, name: 'FermentFreude Admin' }],
        subject: `Neuer Gutschein-Kauf: €${String(doc.value ?? 99)} · ${String(doc.code ?? '')}`,
        htmlContent,
      })
      req.payload.logger.info(
        `[Brevo] Sent admin notification email for voucher ${doc.code}`,
      )
    } catch (adminError) {
      req.payload.logger.error(
        `[Brevo] Failed to send admin notification for voucher ${doc.code}: ${adminError instanceof Error ? adminError.message : String(adminError)}`,
      )
    }
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Voucher purchase email failed for voucher ${doc.code}: ${error instanceof Error ? error.message : String(error)}`,
    )
    doc.emailDeliveryFailed = true
  }

  return doc
}
