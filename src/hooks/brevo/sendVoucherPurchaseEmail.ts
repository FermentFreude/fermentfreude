import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
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

    const personalNote =
      typeof doc.personalNote === 'string' ? doc.personalNote.trim() : ''

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
      if (!doc.recipientEmail) return Promise.resolve()
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
    switch (doc.deliveryMethod) {
      case 'email-recipient': {
        await sendToRecipient({ IS_RECIPIENT: 'true' })
        if (doc.recipientEmail && doc.recipientEmail !== purchaserEmail) {
          await sendToPurchaser({ IS_PURCHASER_COPY: 'true' })
        } else if (!doc.recipientEmail) {
          await sendToPurchaser()
        }
        break
      }
      case 'email-self': {
        await sendToPurchaser({ IS_FORWARD: 'true' })
        break
      }
      case 'pdf': {
        await sendToPurchaser({ IS_PDF: 'true' })
        break
      }
      case 'email': {
        await sendToPurchaser()
        if (doc.recipientEmail && doc.recipientEmail !== purchaserEmail) {
          await sendToRecipient()
        }
        break
      }
      case 'pickup':
      default: {
        await sendToPurchaser()
        break
      }
    }
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Voucher purchase email failed for voucher ${doc.code}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
