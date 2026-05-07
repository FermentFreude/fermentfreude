import type { CollectionAfterLoginHook } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'

/**
 * Send a security notification email after every successful login.
 * Uses Brevo template #71 (LOGIN_NOTIFICATION).
 *
 * Template params:
 * - FIRST_NAME, LOGIN_DATE, DEVICE, LOCATION, RESET_URL, PRIVACY_URL
 */
export const sendLoginNotificationEmail: CollectionAfterLoginHook = async ({ user, req }) => {
  // Skip for admin users (founders log in often; avoid noise) — only notify customers.
  const roles = (user as { roles?: string[] }).roles ?? []
  if (roles.includes('admin')) return user

  const email = (user as { email?: string }).email
  if (!email) return user

  // Skip during seed / scripted operations.
  if (req.context?.skipAutoTranslate || req.context?.skipRevalidate) return user

  try {
    const name = (user as { name?: string }).name
    const firstName = name?.split(' ')[0] || name || email
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'

    // Best-effort device + IP detection from headers.
    const headers: Headers | undefined = (req as unknown as { headers?: Headers }).headers
    const ua = headers?.get('user-agent') || ''
    const ip =
      headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers?.get('x-real-ip') ||
      'Unbekannt'

    const device = parseDevice(ua)
    const loginDate = new Intl.DateTimeFormat('de-AT', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Europe/Vienna',
    }).format(new Date())

    await sendTemplateEmail({
      to: [{ email, name: name || undefined }],
      templateId: BREVO_TEMPLATES.LOGIN_NOTIFICATION,
      params: {
        FIRST_NAME: firstName,
        LOGIN_DATE: loginDate,
        DEVICE: device,
        LOCATION: ip,
        RESET_URL: `${serverUrl}/forgot-password`,
        PRIVACY_URL: `${serverUrl}/datenschutz`,
      },
    })
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Login notification failed for ${email}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return user
}

function parseDevice(ua: string): string {
  if (!ua) return 'Unbekanntes Gerät'
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Safari\//.test(ua)
        ? 'Safari'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : 'Browser'
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Mac OS X/.test(ua)
      ? 'macOS'
      : /Android/.test(ua)
        ? 'Android'
        : /iPhone|iPad|iOS/.test(ua)
          ? 'iOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Unbekannt'
  return `${browser} auf ${os}`
}
