/**
 * Brevo-backed senders for Payload's built-in `auth.forgotPassword` and `auth.verify` flows.
 *
 * Payload calls `generateEmailHTML` with the generated token after creating a forgot-password
 * or verification request. We send the real email via Brevo here, then return a tiny placeholder
 * so Payload's console email adapter (no SMTP is configured) has something to hand to `sendEmail`.
 */
import type { PayloadRequest } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail, sendTransactionalEmail } from '@/lib/brevo'
import { getServerSideURL } from '@/utilities/getURL'

const PLACEHOLDER_HTML =
  '<p>Diese E-Mail wurde über FermentFreude (Brevo) versendet.</p>' +
  '<p>This email was sent via FermentFreude (Brevo).</p>'

type AuthEmailArgs = {
  req?: PayloadRequest
  token?: string
  user?: { email?: string; name?: string }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Site URL used in password-reset links. Keep localhost in local so the token hits this DB. */
function emailAppUrl(): string {
  const raw =
    process.env.EMAIL_LINK_BASE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    getServerSideURL() ||
    'https://www.fermentfreude.at'
  return raw.replace(/\/$/, '')
}

export function buildPasswordResetUrl(token: string): string {
  return `${emailAppUrl()}/recover-password?token=${encodeURIComponent(token)}`
}

export async function sendPasswordResetEmail(args: {
  email: string
  name?: string | null
  token: string
}): Promise<{ success: boolean; resetUrl: string }> {
  const firstName = args.name?.split(' ')[0] || args.name || 'liebe Genießer:in'
  const resetUrl = buildPasswordResetUrl(args.token)
  const html = passwordResetEmailHTML({ firstName, resetUrl })

  const sent = await sendTransactionalEmail({
    to: [{ email: args.email, name: args.name || undefined }],
    subject: forgotPasswordEmailSubject(),
    htmlContent: html,
    textContent: [
      `Hi ${firstName},`,
      '',
      'wir haben deine Anfrage erhalten. Öffne diesen Link, um ein neues Passwort zu wählen:',
      resetUrl,
      '',
      'Der Link ist 1 Stunde gültig.',
      '',
      'Du hast keine Passwort-Zurücksetzung angefordert? Dann ignoriere diese Nachricht.',
    ].join('\n'),
  })

  return { success: sent.success, resetUrl }
}

/**
 * Gmail-safe password-reset HTML.
 *
 * The branded Brevo template (#70) is button-only and identical across retries, so Gmail
 * threads the messages and hides the body as "trimmed content" — including the unique token
 * in the button href. A visible copy-paste URL makes each send unique and recoverable.
 */
function passwordResetEmailHTML({ firstName, resetUrl }: { firstName: string; resetUrl: string }): string {
  const safeName = escapeHtml(firstName)
  const safeUrl = escapeHtml(resetUrl)

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Passwort zurücksetzen</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;color:#1a1a1a;font-family:Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;">
    Setze dein FermentFreude-Passwort zurück. ${safeUrl}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="border-collapse:collapse;max-width:600px;width:100%;">
          <tr>
            <td style="padding:0 0 24px 0;border-bottom:3px solid #E5B765;">
              <p style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#8a8783;font-weight:700;">FermentFreude</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 0 12px 0;">
              <h1 style="margin:0;font-size:26px;line-height:1.25;color:#1a1a1a;">Passwort zurücksetzen</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px 0;font-size:16px;line-height:1.6;color:#555251;">
              Hi ${safeName}, wir haben deine Anfrage erhalten. Klicke auf den Button oder kopiere den Link darunter, um ein neues Passwort zu wählen. Der Link ist 1 Stunde gültig.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 0 24px 0;">
              <a href="${safeUrl}" style="display:inline-block;padding:14px 32px;background-color:#E5B765;color:#1a1a1a;text-decoration:none;font-size:15px;font-weight:700;border-radius:6px;">Neues Passwort setzen</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 8px 0;font-size:12px;line-height:1.4;color:#8a8783;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">
              Falls der Button nicht funktioniert, kopiere diesen Link:
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 28px 0;font-size:14px;line-height:1.6;color:#1a1a1a;word-break:break-all;">
              <a href="${safeUrl}" style="color:#1a1a1a;text-decoration:underline;">${safeUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px 0;font-size:13px;line-height:1.6;color:#c2410c;">
              Du hast keine Passwort-Zurücksetzung angefordert? Dann ignoriere diese Nachricht — dein Konto bleibt unverändert.
            </td>
          </tr>
          <tr>
            <td style="padding:20px 0 0 0;border-top:3px solid #E5B765;font-size:12px;line-height:1.6;color:#8a8783;">
              Fermentfreude OG · Grabenstraße 15, 8010 Graz · <a href="mailto:kontakt@fermentfreude.at" style="color:#1a1a1a;text-decoration:none;">kontakt@fermentfreude.at</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Forgot password. Sent as inline HTML (not Brevo template #70).
 *
 * Template #70 is button-only and identical across retries, so Gmail threads the
 * messages and hides the body as "trimmed content" — including the unique token.
 * A visible copy-paste URL keeps the link recoverable even when the button is hidden.
 */
export const forgotPasswordEmailHTML = async (args?: AuthEmailArgs): Promise<string> => {
  const token = args?.token
  const user = args?.user
  const email = user?.email
  const req = args?.req

  if (!email || !token) {
    throw new Error('Password reset email is missing the user email or reset token')
  }

  const sent = await sendPasswordResetEmail({
    email,
    name: user?.name,
    token,
  })

  if (!sent.success) {
    const message = `Password reset email failed for ${email}`
    req?.payload?.logger?.error(`[Brevo] ${message}`)
    if (process.env.NODE_ENV === 'development') {
      req?.payload?.logger?.info(`[Brevo] Dev reset URL: ${sent.resetUrl}`)
    }
    throw new Error(message)
  }

  req?.payload?.logger?.info(`[Brevo] Password reset email sent to ${email}`)
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
        VERIFICATION_URL: `${emailAppUrl()}/verify-email?token=${token}`,
        PRIVACY_URL: `${emailAppUrl()}/datenschutz`,
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

/** Unique per send so Gmail does not thread+hide the body (and the reset token with it). */
export const forgotPasswordEmailSubject = () => {
  const stamp = new Date().toLocaleString('de-AT', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Vienna',
  })
  return `Dein Passwort-Link — FermentFreude (${stamp})`
}
export const verifyEmailSubject = () => 'Bitte bestätige deine E-Mail-Adresse — FermentFreude'
