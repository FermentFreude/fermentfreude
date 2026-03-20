import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

/**
 * Send order confirmation email via Brevo after a new order is created.
 * Orders are only created after Stripe confirms payment, so
 * operation === 'create' means the payment succeeded.
 */
export const sendOrderConfirmationEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const customerId = typeof doc.customer === 'object' ? doc.customer?.id : doc.customer
  if (!customerId) return doc

  try {
    const user = await req.payload.findByID({
      collection: 'users',
      id: customerId,
      depth: 0,
      overrideAccess: true,
    })

    if (!user?.email) return doc

    const items: { product?: string | { title?: string } | null; quantity?: number }[] =
      doc.items ?? []

    const itemSummary = items
      .map((item) => {
        const title =
          typeof item.product === 'object' ? (item.product?.title ?? 'Product') : 'Product'
        return `${title} x${item.quantity ?? 1}`
      })
      .join(', ')

    await sendTemplateEmail({
      to: [{ email: user.email, name: user.name || undefined }],
      templateId: BREVO_TEMPLATES.ORDER_CONFIRMATION,
      params: {
        ORDER_ID: String(doc.id),
        ORDER_TOTAL: String(doc.total ?? ''),
        ORDER_ITEMS: itemSummary,
        CUSTOMER_NAME: user.name || user.email,
        ORDER_DATE: new Date().toLocaleDateString('de-DE'),
      },
    })
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Order confirmation email failed for order ${doc.id}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
