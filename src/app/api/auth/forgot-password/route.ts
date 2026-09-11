import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { sendPasswordResetEmail } from '@/auth/brevoAuthEmails'
import { getBrevoApiKey } from '@/lib/brevo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Password reset that does not pretend the mail was sent.
 *
 * Payload's built-in `/api/users/forgot-password` still returns 200 when Brevo
 * is missing, so local recovery was silently dropped. This route creates the
 * token, tries Brevo, and in development returns a clickable reset URL when
 * email cannot be delivered.
 */
export async function POST(request: NextRequest) {
  let email = ''
  try {
    const body = (await request.json()) as { email?: unknown }
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const isDev = process.env.NODE_ENV === 'development'

  const token = await payload.forgotPassword({
    collection: 'users',
    data: { email },
    disableEmail: true,
  })

  // Unknown email — same generic success as Payload, so we do not leak accounts.
  if (!token) {
    return NextResponse.json({ ok: true, emailSent: true })
  }

  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })
  const user = found.docs[0]

  const sent = await sendPasswordResetEmail({
    email,
    name: typeof user?.name === 'string' ? user.name : undefined,
    token,
  })

  if (sent.success) {
    payload.logger.info(`[Brevo] Password reset email sent to ${email}`)
    return NextResponse.json({ ok: true, emailSent: true })
  }

  payload.logger.error(
    `[Brevo] Password reset email failed for ${email}${getBrevoApiKey() ? '' : ' (BREVO_API_KEY is not set)'}`,
  )

  if (isDev) {
    payload.logger.info(`[Brevo] Dev reset URL: ${sent.resetUrl}`)
    return NextResponse.json({
      ok: true,
      emailSent: false,
      resetUrl: sent.resetUrl,
      reason: getBrevoApiKey() ? 'brevo_send_failed' : 'brevo_not_configured',
    })
  }

  return NextResponse.json(
    { error: 'There was a problem while attempting to send you a password reset email. Please try again.' },
    { status: 502 },
  )
}
