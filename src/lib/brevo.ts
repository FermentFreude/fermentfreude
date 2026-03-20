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
 * 3. Add your API key to .env as BREVO_API_KEY
 *
 * Required env: BREVO_API_KEY
 * Optional env: BREVO_SENDER_EMAIL, BREVO_SENDER_NAME
 */

const BREVO_API_URL = 'https://api.brevo.com/v3'

// Default sender — override with env vars
const DEFAULT_SENDER = {
  email: process.env.BREVO_SENDER_EMAIL || 'hello@fermentfreude.com',
  name: process.env.BREVO_SENDER_NAME || 'FermentFreude',
}

/**
 * Template IDs — create these in Brevo's dashboard.
 * Start with ID 1 and increment. Update these numbers
 * after creating the templates in Brevo.
 */
export const BREVO_TEMPLATES = {
  /** Sent after successful Stripe payment for any order */
  ORDER_CONFIRMATION: 1,
  /** Sent when a workshop booking is confirmed */
  WORKSHOP_BOOKING_CONFIRMATION: 2,
  /** Sent when a user is enrolled in an online course */
  COURSE_ENROLLMENT: 3,
  /** Sent when a gift voucher is purchased */
  VOUCHER_PURCHASED: 4,
  /** Welcome email for new user registration */
  WELCOME: 5,
  /** Password reset email */
  PASSWORD_RESET: 6,
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
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('[Brevo] BREVO_API_KEY not set — skipping email send')
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
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('[Brevo] BREVO_API_KEY not set — skipping email send')
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
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('[Brevo] BREVO_API_KEY not set — skipping contact sync')
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
      console.error('[Brevo] Contact upsert failed:', error)
      return { success: false }
    }

    console.log(`[Brevo] Contact synced: ${email}`)
    return { success: true }
  } catch (error) {
    console.error('[Brevo] Contact sync error:', error)
    return { success: false }
  }
}
