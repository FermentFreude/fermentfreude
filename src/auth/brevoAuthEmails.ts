/**
 * Brevo-backed senders for Payload's built-in `auth.forgotPassword` and `auth.verify` flows.
 *
 * Payload calls `generateEmailHTML` with the generated token after creating a forgot-password
 * or verification request. We hijack that callback to send the email via Brevo (using the
 * branded templates #69 and #70) and return a tiny placeholder HTML so Payload's own
 * email adapter — if any is configured — has something to send. Since this project does
 * NOT configure an email adapter, the placeholder is never actually sent.
 */
import type { PayloadRequest } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

const SERVER_URL = () => process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'

const PLACEHOLDER_HTML =
  '<p>Diese E-Mail wurde über FermentFreude (Brevo) versendet.</p>' +
  '<p>This email was sent via FermentFreude (Brevo).</p>'

type AuthEmailArgs = {
  req?: PayloadRequest
  token?: string
  user?: { email?: string; name?: string }
}

/** Forgot password — Brevo template #70 */
export const forgotPasswordEmailHTML = async (args?: AuthEmailArgs): Promise<string> => {
  const token = args?.token
  const user = args?.user
  const email = user?.email
  const req = args?.req

  if (!email || !token) return PLACEHOLDER_HTML

  try {
    const firstName = user?.name?.split(' ')[0] || user?.name || email
    await sendTemplateEmail({
      to: [{ email, name: user?.name || undefined }],
      templateId: BREVO_TEMPLATES.PASSWORD_RESET,
      params: {
        FIRST_NAME: firstName,
        RESET_URL: `${SERVER_URL()}/recover-password?token=${token}`,
        EXPIRY_TIME: '1 Stunde',
        PRIVACY_URL: `${SERVER_URL()}/datenschutz`,
        AGB_URL: `${SERVER_URL()}/agb`,
      },
    })
    req?.payload?.logger?.info(`[Brevo] Password reset email sent to ${email}`)
  } catch (error) {
    req?.payload?.logger?.error(
      `[Brevo] Password reset email failed for ${email}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return PLACEHOLDER_HTML
}

/** Email verification — Brevo template #69 */
export const verifyEmailHTML = async (args?: AuthEmailArgs): Promise<string> => {
  const token = args?.token
  const user = args?.user
  const email = user?.email
  const req = args?.req

  if (!email || !token) return PLACEHOLDER_HTML

  try {
    const firstName = user?.name?.split(' ')[0] || user?.name || email
    await sendTemplateEmail({
      to: [{ email, name: user?.name || undefined }],
      templateId: BREVO_TEMPLATES.EMAIL_VERIFICATION,
      params: {
        FIRST_NAME: firstName,
        VERIFICATION_URL: `${SERVER_URL()}/verify-email?token=${token}`,
        PRIVACY_URL: `${SERVER_URL()}/datenschutz`,
      },
    })
    req?.payload?.logger?.info(`[Brevo] Verification email sent to ${email}`)
  } catch (error) {
    req?.payload?.logger?.error(
      `[Brevo] Verification email failed for ${email}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return PLACEHOLDER_HTML
}

export const forgotPasswordEmailSubject = () => 'Passwort zurücksetzen — FermentFreude'
export const verifyEmailSubject = () => 'Bitte bestätige deine E-Mail-Adresse — FermentFreude'
