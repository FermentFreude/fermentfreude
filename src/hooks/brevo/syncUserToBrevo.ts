import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail, upsertContact } from '@/lib/brevo'

/**
 * Sync new users to Brevo contacts and send welcome email.
 * Triggered when a new User document is created.
 */
export const syncUserToBrevo: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  // Skip if created during seed
  if (req.context?.skipAutoTranslate || req.context?.skipRevalidate) return doc

  const email = doc.email as string | undefined
  if (!email) return doc

  try {
    // Sync contact to Brevo
    await upsertContact({
      email,
      firstName: doc.name?.split(' ')[0],
      lastName: doc.name?.split(' ').slice(1).join(' '),
    })

    // Send welcome email
    await sendTemplateEmail({
      to: [{ email, name: doc.name || undefined }],
      templateId: BREVO_TEMPLATES.WELCOME,
      params: {
        CUSTOMER_NAME: doc.name || email,
      },
    })
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] User sync/welcome email failed for ${email}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
