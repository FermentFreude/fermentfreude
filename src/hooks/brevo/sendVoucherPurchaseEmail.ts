import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

/**
 * Send voucher purchase confirmation email via Brevo after a new voucher is created.
 * Sends to the purchaser, and optionally to the recipient if email delivery is selected.
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
    // Send purchase confirmation to buyer
    await sendTemplateEmail({
      to: [{ email: purchaserEmail }],
      templateId: BREVO_TEMPLATES.VOUCHER_PURCHASED,
      params: {
        VOUCHER_CODE: String(doc.code ?? ''),
        VOUCHER_VALUE: String(doc.value ?? 99),
        DELIVERY_METHOD: doc.deliveryMethod === 'email' ? 'E-Mail' : 'Abholung',
        RECIPIENT_EMAIL: doc.recipientEmail || '',
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
          VOUCHER_CODE: String(doc.code ?? ''),
          VOUCHER_VALUE: String(doc.value ?? 99),
          DELIVERY_METHOD: 'E-Mail',
          RECIPIENT_EMAIL: doc.recipientEmail,
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
