import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Send voucher purchase confirmation email via Brevo after a new voucher is created.
 * Sends to the purchaser, and optionally to the recipient if email delivery is selected.
 * Includes PDF download link in email.
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
    // Build PDF download URL (can be clicked in email to download)
    const baseUrl = getServerSideURL().replace(/\/$/, '')
    const pdfUrl = `${baseUrl}/api/voucher/generate-pdf?code=${encodeURIComponent(String(doc.code ?? ''))}`

    // Calculate expiry (12 months from creation)
    const expiryDate = new Date(doc.createdAt)
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    const voucherExpiry = expiryDate.toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    // Derive first name: prefer explicit purchaserName, fall back to email local-part
    const purchaserNameValue =
      typeof doc.purchaserName === 'string' && doc.purchaserName.trim().length > 0
        ? doc.purchaserName.trim()
        : ''
    const purchaserFirstName = purchaserNameValue
      ? purchaserNameValue.split(/\s+/)[0]
      : (purchaserEmail.split('@')[0] ?? '')

    // Standard URLs for template buttons/links
    const shopUrl = `${baseUrl}/workshops`
    const voucherUrl = `${baseUrl}/workshops/voucher`
    const privacyUrl = `${baseUrl}/datenschutz`
    const agbUrl = `${baseUrl}/agb`

    // Send purchase confirmation to buyer
    await sendTemplateEmail({
      to: [{ email: purchaserEmail }],
      templateId: BREVO_TEMPLATES.VOUCHER_PURCHASED,
      params: {
        FIRST_NAME: purchaserFirstName,
        VOUCHER_CODE: String(doc.code ?? ''),
        VOUCHER_AMOUNT: String(doc.value ?? 99),
        VOUCHER_EXPIRY: voucherExpiry,
        DELIVERY_METHOD: doc.deliveryMethod === 'email' ? 'E-Mail' : 'Abholung',
        RECIPIENT_EMAIL: doc.recipientEmail || '',
        PDF_DOWNLOAD_URL: pdfUrl,
        SHOP_URL: shopUrl,
        VOUCHER_URL: voucherUrl,
        PRIVACY_URL: privacyUrl,
        AGB_URL: agbUrl,
      },
    })

    // If email delivery and there's a different recipient, send the voucher code to them too
    if (
      doc.deliveryMethod === 'email' &&
      doc.recipientEmail &&
      doc.recipientEmail !== purchaserEmail
    ) {
      await sendTemplateEmail({
        to: [{ email: doc.recipientEmail }],
        templateId: BREVO_TEMPLATES.VOUCHER_PURCHASED,
        params: {
          FIRST_NAME: doc.recipientEmail.split('@')[0] ?? purchaserFirstName,
          VOUCHER_CODE: String(doc.code ?? ''),
          VOUCHER_AMOUNT: String(doc.value ?? 99),
          VOUCHER_EXPIRY: voucherExpiry,
          DELIVERY_METHOD: 'E-Mail',
          RECIPIENT_EMAIL: doc.recipientEmail,
          PDF_DOWNLOAD_URL: pdfUrl,
          SHOP_URL: shopUrl,
          VOUCHER_URL: voucherUrl,
          PRIVACY_URL: privacyUrl,
          AGB_URL: agbUrl,
        },
      })
    }
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Voucher purchase email failed for voucher ${doc.code}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
