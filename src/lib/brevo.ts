/**
 * Brevo Email Service for FermentFreude
 *
 * Strategy: Brevo Transactional API with template IDs.
 * Templates are designed and edited in Brevo's dashboard (non-coder friendly).
 * This service sends transactional emails by referencing template IDs
 * and passing dynamic parameters.
 *
 * Setup in Brevo dashboard (https://app.brevo.com):
 * 1. Create templates with the IDs listed in BREVO_TEMPLATES
 * 2. Use {{ params.VARIABLE_NAME }} in templates for dynamic content
 * 3. Add your API key to .env as BREVO_API_KEY (legacy: SENDINBLUE_API_KEY also works)
 *
 * Required env: BREVO_API_KEY (or SENDINBLUE_API_KEY)
 * Optional env: BREVO_SENDER_EMAIL, BREVO_SENDER_NAME
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const BREVO_API_URL = 'https://api.brevo.com/v3'

/**
 * Project root for reading `.env` — `process.cwd()` only (no `import.meta.url`).
 * Using `import.meta.url` here breaks some Next server bundles (ESM + `require is not defined` in `_document` chunks).
 */
function getNextProjectRoot(): string {
  return process.cwd()
}

function parseEnvFileValue(content: string, key: string): string | undefined {
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const re = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*(.*)$`)
    const m = t.match(re)
    if (!m) continue
    let val = m[1].trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    return val || undefined
  }
  return undefined
}

/**
 * Read Brevo keys straight from `.env.local` / `.env` at the project root.
 * Next’s own env merge can skip vars for some API bundles; this path does not depend on that.
 */
let brevoEnvFilesRead = false
function hydrateBrevoKeysFromEnvFiles(): void {
  if (brevoEnvFilesRead || typeof window !== 'undefined') return
  brevoEnvFilesRead = true
  if (process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY) return

  const root = getNextProjectRoot()
  let brevo: string | undefined
  let legacy: string | undefined
  // `.env.local` last so it overrides `.env` (same as Next.js).
  for (const name of ['.env', '.env.local'] as const) {
    const full = path.join(root, name)
    if (!existsSync(full)) continue
    let raw = readFileSync(full, 'utf8')
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1)
    const b = parseEnvFileValue(raw, 'BREVO_API_KEY')
    const l = parseEnvFileValue(raw, 'SENDINBLUE_API_KEY')
    if (b !== undefined) brevo = b
    if (l !== undefined) legacy = l
  }
  if (brevo) process.env.BREVO_API_KEY = brevo
  if (legacy) process.env.SENDINBLUE_API_KEY = legacy
}

/** Brevo accepts either env name; use the same key as in the Brevo dashboard (SMTP & API). */
export function getBrevoApiKey(): string | undefined {
  hydrateBrevoKeysFromEnvFiles()
  return process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY
}

// Default sender — override with env vars
const DEFAULT_SENDER = {
  email: process.env.BREVO_SENDER_EMAIL || 'hello@fermentfreude.com',
  name: process.env.BREVO_SENDER_NAME || 'FermentFreude',
}

/**
 * Template IDs — created via `pnpm brevo-setup-templates`
 * These IDs are auto-assigned by Brevo in order. Update if you rerun template setup.
 * All 19 templates across 4 categories: Transactional, Workshop, E-commerce, Marketing
 */
export const BREVO_TEMPLATES = {
  // Transactional (4)
  ACCOUNT_CREATION: 1,
  EMAIL_VERIFICATION: 2,
  PASSWORD_RESET: 3,
  LOGIN_NOTIFICATION: 4,

  // Workshop (5)
  WORKSHOP_BOOKING_CONFIRMATION: 5,
  WORKSHOP_7DAY_REMINDER: 6,
  WORKSHOP_1DAY_REMINDER: 7,
  POST_WORKSHOP_FOLLOWUP: 8,
  FEEDBACK_REQUEST: 9,

  // E-commerce (4)
  ORDER_CONFIRMATION: 10,
  SHIPPING_NOTIFICATION: 11,
  REVIEW_REQUEST: 12,
  ABANDONED_CART: 13,

  // Marketing (5)
  NEWSLETTER_WELCOME: 14,
  COURSE_ENROLLMENT: 15,
  B2B_INQUIRY: 16,
  RE_ENGAGEMENT: 17,
  REFERRAL_PROGRAM: 18,

  // Custom
  VOUCHER_PURCHASED: 19,
} as const

type BrevoRecipient = {
  email: string
  name?: string
}

type SendTemplateEmailParams = {
  to: BrevoRecipient[]
  templateId: number
  params?: Record<string, string | number | boolean>
  subject?: string
}

type SendTransactionalEmailParams = {
  to: BrevoRecipient[]
  subject: string
  htmlContent: string
}

/**
 * Send a transactional email using a Brevo template.
 * Templates are managed in Brevo's dashboard — editors can change
 * the design and text without touching code.
 */
export async function sendTemplateEmail({
  to,
  templateId,
  params,
  subject,
}: SendTemplateEmailParams): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = getBrevoApiKey()
  if (!apiKey) {
    console.warn('[Brevo] BREVO_API_KEY (or SENDINBLUE_API_KEY) not set — skipping email send')
    return { success: false }
  }

  try {
    const body: Record<string, unknown> = {
      sender: DEFAULT_SENDER,
      to,
      templateId,
    }
    if (params) body.params = params
    if (subject) body.subject = subject

    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`[Brevo] Email send failed (template ${templateId}):`, error)
      return { success: false }
    }

    const data = (await response.json()) as { messageId?: string }
    console.log(`[Brevo] Email sent (template ${templateId}) to ${to[0]?.email}`)
    return { success: true, messageId: data.messageId }
  } catch (error) {
    console.error('[Brevo] Email send error:', error)
    return { success: false }
  }
}

/**
 * Send a transactional email with inline HTML content.
 * Use for simple system emails that don't need a Brevo template.
 */
export async function sendTransactionalEmail({
  to,
  subject,
  htmlContent,
}: SendTransactionalEmailParams): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = getBrevoApiKey()
  if (!apiKey) {
    console.warn('[Brevo] BREVO_API_KEY (or SENDINBLUE_API_KEY) not set — skipping email send')
    return { success: false }
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: DEFAULT_SENDER,
        to,
        subject,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Brevo] Transactional email failed:', error)
      return { success: false }
    }

    const data = (await response.json()) as { messageId?: string }
    return { success: true, messageId: data.messageId }
  } catch (error) {
    console.error('[Brevo] Transactional email error:', error)
    return { success: false }
  }
}

type BrevoContact = {
  email: string
  firstName?: string
  lastName?: string
  listIds?: number[]
  attributes?: Record<string, string | number | boolean>
}

/**
 * Create or update a contact in Brevo.
 * Use for newsletter signups and customer sync.
 *
 * listIds: Create lists in Brevo dashboard first, then reference their IDs.
 * Suggested lists:
 *   - Newsletter subscribers
 *   - Workshop customers
 *   - Online course students
 */
export async function upsertContact({
  email,
  firstName,
  lastName,
  listIds,
  attributes,
}: BrevoContact): Promise<{ success: boolean }> {
  const apiKey = getBrevoApiKey()
  if (!apiKey) {
    console.warn(
      '[Brevo] BREVO_API_KEY (or SENDINBLUE_API_KEY) not set — contact sync skipped. Add the key to .env locally and to Vercel → Project → Environment Variables for production.',
    )
    return { success: false }
  }

  try {
    const body: Record<string, unknown> = {
      email,
      updateEnabled: true,
    }

    const contactAttributes: Record<string, string | number | boolean> = { ...attributes }
    if (firstName) contactAttributes.FIRSTNAME = firstName
    if (lastName) contactAttributes.LASTNAME = lastName

    if (Object.keys(contactAttributes).length > 0) {
      body.attributes = contactAttributes
    }
    if (listIds?.length) body.listIds = listIds

    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`[Brevo] Contact upsert failed (HTTP ${response.status}) for ${email}:`, error)
      return { success: false }
    }

    console.log(`[Brevo] Contact synced: ${email}`)
    return { success: true }
  } catch (error) {
    console.error('[Brevo] Contact sync error:', error)
    return { success: false }
  }
}

