import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

/**
 * Send course enrollment confirmation email via Brevo.
 * Triggered when a new Enrollment document is created
 * (which happens after order payment via autoEnrollOnPurchase).
 */
export const sendEnrollmentEmail: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const userId = typeof doc.user === 'object' ? doc.user?.id : doc.user
  if (!userId) return doc

  try {
    const user = await req.payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
      overrideAccess: true,
    })

    if (!user?.email) return doc

    await sendTemplateEmail({
      to: [{ email: user.email, name: user.name || undefined }],
      templateId: BREVO_TEMPLATES.COURSE_ENROLLMENT,
      params: {
        COURSE_SLUG: String(doc.courseSlug ?? ''),
        CUSTOMER_NAME: user.name || user.email,
        COURSE_URL: `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/kurse/${doc.courseSlug}`,
      },
    })
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Enrollment email failed for enrollment ${doc.id}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
