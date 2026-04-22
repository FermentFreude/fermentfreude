import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

/**
 * Send account creation welcome email via Brevo when a new user registers.
 * Runs immediately after user account is created.
 *
 * Email template parameters:
 * - FIRST_NAME: Customer first name
 * - LOGIN_URL: Link to login page
 * - WELCOME_MESSAGE: Personalized welcome message
 */
export const sendAccountCreationEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  // Skip if created during seed or automated import
  if (req.context?.skipAutoTranslate || req.context?.skipRevalidate) return doc

  const email = doc.email as string | undefined
  if (!email) return doc

  try {
    const recipientFirstName = doc.name?.split(' ')[0] || doc.name || email
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.com'

    await sendTemplateEmail({
      to: [{ email, name: doc.name || undefined }],
      templateId: BREVO_TEMPLATES.ACCOUNT_CREATION,
      params: {
        FIRST_NAME: recipientFirstName,
        LOGIN_URL: `${serverUrl}/login`,
        WELCOME_MESSAGE: `Willkommen bei FermentFreude, ${recipientFirstName}! Wir freuen uns, Sie in unserer Community zu begrüßen.`,
      },
    })

    req.payload.logger.info(`[Brevo] Account creation email sent to ${email}`)
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Account creation email failed for ${email}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
