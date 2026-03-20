import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

/**
 * Send workshop booking confirmation email via Brevo.
 * Triggered when a new WorkshopBooking document is created.
 *
 * Note: Requires 'email' field on WorkshopBookings collection.
 * If the field doesn't exist yet, this hook safely skips.
 * TODO: Add email + firstName fields to WorkshopBookings when
 * the checkout flow captures customer info.
 */
export const sendWorkshopBookingEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const email = doc.email as string | undefined
  if (!email) return doc

  try {
    await sendTemplateEmail({
      to: [{ email, name: (doc.firstName as string) || undefined }],
      templateId: BREVO_TEMPLATES.WORKSHOP_BOOKING_CONFIRMATION,
      params: {
        WORKSHOP_TITLE: String(doc.workshopTitle ?? 'Workshop'),
        WORKSHOP_DATE: String(doc.date ?? ''),
        GUEST_COUNT: String(doc.guestCount ?? 1),
        TOTAL_PRICE: String(doc.totalPrice ?? ''),
        CUSTOMER_NAME: String(doc.firstName ?? email),
        BOOKING_ID: String(doc.id),
      },
    })
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Workshop booking email failed for booking ${doc.id}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
