import type { CollectionAfterChangeHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

/**
 * Send password reset email via Brevo when password reset is requested.
 * In Payload CMS, this is triggered when a password reset token is generated.
 *
 * This hook requires that password resets be tracked via a custom field or
 * triggered explicitly from the password reset endpoint.
 *
 * Email template parameters:
 * - FIRST_NAME: Customer first name
 * - RESET_URL: Password reset link with token
 * - EXPIRY_TIME: When the reset link expires (usually 1 hour)
 */
export const sendPasswordResetEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // This hook is typically triggered by a custom endpoint that handles password resets
  // We can implement this by modifying the password reset endpoint to call this logic
  // For now, this is a template for future integration

  if (operation !== 'update') return doc

  // Check if this is a password reset request (would need custom field in Users collection)
  // const passwordResetToken = doc.passwordResetToken as string | undefined
  // if (!passwordResetToken) return doc

  const email = doc.email as string | undefined
  if (!email) return doc

  try {
    const recipientFirstName = doc.name?.split(' ')[0] || doc.name || email
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.com'

    // In a real implementation, the reset token would be passed to this hook
    // via the req context or the doc itself
    const resetToken = req.context?.passwordResetToken as string | undefined
    const resetUrl = resetToken
      ? `${serverUrl}/recover-password?token=${resetToken}`
      : `${serverUrl}/forgot-password`

    await sendTemplateEmail({
      to: [{ email, name: doc.name || undefined }],
      templateId: BREVO_TEMPLATES.PASSWORD_RESET,
      params: {
        FIRST_NAME: recipientFirstName,
        RESET_URL: resetUrl,
        EXPIRY_TIME: '1 Stunde',
      },
    })

    req.payload.logger.info(`[Brevo] Password reset email sent to ${email}`)
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Password reset email failed for ${email}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
