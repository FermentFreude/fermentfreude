#!/usr/bin/env node
/**
 * Push V2 HTML templates to Brevo via REST API.
 *
 * - PUT /v3/smtp/templates/{id}  — updates ONLY htmlContent (keeps subject, sender, name)
 * - POST /v3/smtp/email           — sends a test render to kontakt@fermentfreude.at
 *
 * Usage:
 *   node --env-file=.env scripts/push-brevo-templates.mjs           # push all 8
 *   node --env-file=.env scripts/push-brevo-templates.mjs 72        # push one
 *   node --env-file=.env scripts/push-brevo-templates.mjs --dry     # show what would happen
 *   node --env-file=.env scripts/push-brevo-templates.mjs --test 72 # send test
 *   node --env-file=.env scripts/push-brevo-templates.mjs --test    # send test of all
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = path.join(__dirname, '..', 'public', 'email-templates', 'v2')

const API_KEY = process.env.BREVO_API_KEY
if (!API_KEY) {
  console.error('Missing BREVO_API_KEY in env')
  process.exit(1)
}

const TEST_EMAIL = 'kontakt@fermentfreude.at'

// Templates we manage (V2 only). Order = founder edit priority.
const V2_TEMPLATES = [
  { id: 32, slug: 'workshop-7day-reminder' },
  { id: 33, slug: 'workshop-1day-reminder' },
  { id: 34, slug: 'post-workshop-followup' },
  { id: 35, slug: 'feedback-request' },
  { id: 37, slug: 'shipping-notification' },
  { id: 38, slug: 'review-request' },
  { id: 39, slug: 'abandoned-cart' },
  { id: 41, slug: 'course-enrollment' },
  { id: 42, slug: 'b2b-inquiry' },
  { id: 43, slug: 're-engagement' },
  { id: 44, slug: 'referral-program' },
  { id: 65, slug: 'workshop-booking' },
  { id: 66, slug: 'account-creation' },
  { id: 68, slug: 'newsletter-welcome' },
  { id: 69, slug: 'email-verification' },
  { id: 70, slug: 'password-reset' },
  { id: 71, slug: 'login-notification' },
  { id: 72, slug: 'order-confirmation' },
  { id: 73, slug: 'voucher-purchased' },
  { id: 93, slug: 'workshop-gift' },
]

// Mock params per template for test sends
const MOCK = {
  32: {
    FIRST_NAME: 'Max',
    WORKSHOP_TITLE: 'Tempeh Basics',
    WORKSHOP_DATE: 'Sa, 30. Juni 2026',
    WORKSHOP_TIME: '10:00 – 14:00',
    WORKSHOP_LOCATION: 'Studio Wien, Schönbrunner Str. 12, 1050',
    PREP_TIPS: 'Bitte denk daran, ein sauberes 500ml Glas mitzubringen.',
    BOOKING_URL: 'https://www.fermentfreude.at/account/orders',
  },
  33: {
    FIRST_NAME: 'Max',
    WORKSHOP_TITLE: 'Tempeh Basics',
    WORKSHOP_DATE: 'Morgen, Sa, 23. Juni 2026',
    WORKSHOP_TIME: '10:00 – 14:00',
    WORKSHOP_LOCATION: 'Studio Wien, Schönbrunner Str. 12, 1050',
    BOOKING_URL: 'https://www.fermentfreude.at/account/orders',
  },
  34: {
    FIRST_NAME: 'Max',
    WORKSHOP_TITLE: 'Tempeh Basics',
  },
  35: {
    FIRST_NAME: 'Max',
    WORKSHOP_TITLE: 'Tempeh Basics',
    FEEDBACK_URL: 'https://www.fermentfreude.at/feedback/abc123',
  },
  37: {
    FIRST_NAME: 'Max',
    ORDER_NUMBER: 'AB12CD34',
    CARRIER: 'Österreichische Post',
    TRACKING_NUMBER: 'JJ123456789AT',
    ESTIMATED_DELIVERY: 'Dienstag, 26. Mai',
    TRACKING_URL: 'https://www.post.at/s/sendungsdetails?sn=JJ123456789AT',
  },
  38: {
    FIRST_NAME: 'Max',
    ORDER_NUMBER: 'AB12CD34',
    REVIEW_URL: 'https://www.fermentfreude.at/account/orders',
  },
  39: {
    FIRST_NAME: 'Max',
    WORKSHOP_TITLE: 'Tempeh Basics',
  },
  41: {
    FIRST_NAME: 'Max',
    COURSE_TITLE: 'Kombucha Meistern',
    COURSE_URL: 'https://www.fermentfreude.at/account/courses',
  },
  42: {
    COMPANY_NAME: 'Bio-Markt Sonnenschein',
  },
  43: {
    FIRST_NAME: 'Max',
  },
  44: {
    FIRST_NAME: 'Max',
    REWARD_AMOUNT: '€ 10,- Gutschein',
    REFERRAL_URL: 'https://www.fermentfreude.at/account/referral',
  },
  65: {
    FIRST_NAME: 'Max',
    BOOKING_ID: 'abc123def456',
    BOOKING_REF: 'DEF456',
    BOOKING_URL: 'https://www.fermentfreude.at/account/orders',
    WORKSHOP_TITLE: 'Tempeh Basics',
    WORKSHOP_DATE: 'Sa, 6. Juni 2026',
    WORKSHOP_TIME: '10:00 – 14:00',
    WORKSHOP_LOCATION: 'Studio Wien, Schönbrunner Str. 12, 1050',
    GUEST_COUNT: '2',
    TOTAL_PRICE: '€ 178,00',
    WHAT_TO_BRING: 'Schürze · ein Glas (500 ml) · Lust auf gute Gespräche',
    RECEIPT_URL: 'https://www.fermentfreude.at/api/bookings/abc123/receipt?token=test-token',
    TICKETS_URL: 'https://www.fermentfreude.at/orders/order_abc123/tickets?token=test-token',
    WORKSHOP_BOOKINGS_HTML: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:#fff;border:1px solid #E8DFD0;border-radius:8px;margin:8px 0;"><tr><td style="padding:18px 20px 8px;"><div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8a8783;text-transform:uppercase;letter-spacing:.06em;font-weight:600;">Workshop</div><div style="font-family:Helvetica,Arial,sans-serif;font-size:18px;color:#1a1a1a;font-weight:700;margin-top:4px;">Tempeh Basics</div></td></tr><tr><td style="padding:8px 20px 18px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#555251;line-height:1.6;">Sa, 6. Juni 2026 · 10:00 – 14:00 · Studio Wien · 2 Plätze · € 178,00</td></tr></table>`,
    PRIVACY_URL: 'https://www.fermentfreude.at/datenschutz',
    AGB_URL: 'https://www.fermentfreude.at/agb',
  },
  66: {
    FIRST_NAME: 'Max',
    CUSTOMER_NAME: 'Max Mustermann',
    DASHBOARD_URL: 'https://www.fermentfreude.at/account',
  },
  68: {
    FIRST_NAME: 'Max',
    WORKSHOPS_URL: 'https://www.fermentfreude.at/workshops',
    UNSUBSCRIBE_URL: 'https://www.fermentfreude.at/newsletter/unsubscribe?token=xyz',
    PRIVACY_URL: 'https://www.fermentfreude.at/datenschutz',
  },
  69: {
    FIRST_NAME: 'Max',
    VERIFICATION_URL: 'https://www.fermentfreude.at/verify?token=abc123',
    PRIVACY_URL: 'https://www.fermentfreude.at/datenschutz',
  },
  70: {
    FIRST_NAME: 'Max',
    RESET_URL: 'https://www.fermentfreude.at/recover-password?token=abc123',
    EXPIRY_TIME: '1 Stunde',
    PRIVACY_URL: 'https://www.fermentfreude.at/datenschutz',
  },
  71: {
    FIRST_NAME: 'Max',
    LOGIN_DATE: '4. Mai 2026, 09:42',
    DEVICE: 'Safari auf macOS',
    LOCATION: 'Wien, Österreich',
    RESET_URL: 'https://www.fermentfreude.at/forgot-password',
    PRIVACY_URL: 'https://www.fermentfreude.at/datenschutz',
  },
  72: {
    FIRST_NAME: 'Max',
    ORDER_ID: 'order_abc123',
    ORDER_NUMBER: 'AB12CD34',
    ORDER_DATE: '4. Mai 2026',
    ORDER_URL: 'https://www.fermentfreude.at/account/orders',
    SUBTOTAL: '€ 54,00',
    SHIPPING: '€ 5,90',
    TOTAL: '€ 59,90',
    SHIPPING_ADDRESS: 'Max Mustermann\nMusterstraße 1\n1010 Wien\nÖsterreich',
    RECEIPT_URL: 'https://www.fermentfreude.at/api/orders/order_abc123/receipt?token=test-token',
    ITEMS: [
      {
        IMAGE_URL: 'https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev/media/email/shopping-cart-white.png', // Placeholder
        TITLE: 'Tempeh Starter Kit',
        QUANTITY: '2',
        PRICE: '€ 48,00',
      },
      {
        IMAGE_URL: 'https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev/media/email/shopping-cart-white.png', // Placeholder
        TITLE: 'Kombucha SCOBY',
        QUANTITY: '1',
        PRICE: '€ 6,00',
      },
    ],
    ORDER_ITEMS_HTML: `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr><td style="padding:14px 0;border-bottom:1px solid #E8DFD0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.5;">Tempeh Starter Kit<br><span style="color:#8a8783;font-size:12px;">2 × € 24,00</span></td>
      <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;font-weight:600;white-space:nowrap;">€ 48,00</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:14px 0;border-bottom:1px solid #E8DFD0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.5;">Kombucha SCOBY<br><span style="color:#8a8783;font-size:12px;">1 × € 6,00</span></td>
      <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;font-weight:600;white-space:nowrap;">€ 6,00</td>
    </tr></table>
  </td></tr>
</table>`,
    WORKSHOP_BOOKINGS_HTML: '',
    PRIVACY_URL: 'https://www.fermentfreude.at/datenschutz',
    AGB_URL: 'https://www.fermentfreude.at/agb',
  },
  93: {
    RECIPIENT_NAME: 'Lena',
    SENDER_NAME: 'Max',
    GIFT_NOTE: 'Ich dachte mir, das ist genau dein Ding — viel Spaß damit!',
    WORKSHOP_TITLE: 'Tempeh Basics',
    WORKSHOP_DATE: 'Sa, 6. Juni 2026',
    WORKSHOP_TIME: '10:00 – 14:00',
    WORKSHOP_LOCATION: 'Studio Wien, Schönbrunner Str. 12, 1050',
    WHAT_TO_BRING: 'Schürze · ein Glas (500 ml) · Lust auf gute Gespräche',
    PRIVACY_URL: 'https://www.fermentfreude.at/datenschutz',
    AGB_URL: 'https://www.fermentfreude.at/agb',
  },
  73: {
    FIRST_NAME: 'Max',
    VOUCHER_CODE: 'FFXMAS2026',
    VOUCHER_AMOUNT: '99',
    VOUCHER_EXPIRY: '31. Dezember 2027',
    VOUCHER_URL: 'https://www.fermentfreude.at/workshops/voucher',
    SHOP_URL: 'https://www.fermentfreude.at/workshops',
    PRIVACY_URL: 'https://www.fermentfreude.at/datenschutz',
    AGB_URL: 'https://www.fermentfreude.at/agb',
  },
}

// =============================================================================
// API helpers
// =============================================================================

async function brevoFetch(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': API_KEY,
      ...(init.headers || {}),
    },
  })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    json = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(`Brevo ${res.status}: ${JSON.stringify(json)}`)
    err.status = res.status
    err.body = json
    throw err
  }
  return json
}

async function getTemplate(id) {
  return brevoFetch(`https://api.brevo.com/v3/smtp/templates/${id}`)
}

async function updateTemplateHtml(id, html) {
  // PUT only htmlContent — Brevo preserves subject/sender/name when omitted? Actually
  // it MERGES; we explicitly send only htmlContent and tag to be safe.
  return brevoFetch(`https://api.brevo.com/v3/smtp/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      htmlContent: html,
      tag: 'v2-2026-05',
    }),
  })
}

async function createTemplate({ name, subject, htmlContent, replyTo, tag }) {
  return brevoFetch(`https://api.brevo.com/v3/smtp/templates`, {
    method: 'POST',
    body: JSON.stringify({
      templateName: name,
      subject,
      sender: { name: 'FermentFreude', email: 'kontakt@fermentfreude.at' },
      replyTo: replyTo || 'kontakt@fermentfreude.at',
      htmlContent,
      isActive: true,
      tag: tag || 'v2-2026-05',
    }),
  })
}

async function sendTestEmail(id, params) {
  const tpl = await getTemplate(id)
  return brevoFetch(`https://api.brevo.com/v3/smtp/email`, {
    method: 'POST',
    body: JSON.stringify({
      to: [{ email: TEST_EMAIL }],
      templateId: id,
      params,
      headers: { 'X-Test-Source': 'push-brevo-templates.mjs' },
      // Override subject so test sends are obvious
      subject: `[TEST] ${tpl.subject || 'V2 template ' + id}`,
    }),
  })
}

function loadHtml(id, slug) {
  const files = readdirSync(TEMPLATES_DIR)
  let match = files.find((f) => f.startsWith(`${id}-`) && f.endsWith('.html'))
  if (!match && slug) {
    match = files.find((f) => f.endsWith(`-${slug}.html`) || f === `${slug}.html`)
  }
  if (!match)
    throw new Error(`No HTML file for template ${id} (slug=${slug ?? '?'}) in ${TEMPLATES_DIR}`)
  return readFileSync(path.join(TEMPLATES_DIR, match), 'utf8')
}

// =============================================================================
// Main
// =============================================================================
const args = process.argv.slice(2)
const dryRun = args.includes('--dry')
const testMode = args.includes('--test')
const createMode = args.includes('--create')
const idArg = args.find((a) => /^\d+$/.test(a))
const targetIds = idArg ? [Number(idArg)] : V2_TEMPLATES.map((t) => t.id)

if (createMode) {
  // Usage: --create <slug> --name "..." --subject "..."
  // Reads HTML from public/email-templates/v2/<slug>.html (without numeric prefix)
  const slugIdx = args.indexOf('--create')
  const slug = args[slugIdx + 1]
  if (!slug) {
    console.error('Usage: --create <slug> [--name "..."] [--subject "..."]')
    process.exit(1)
  }
  const nameIdx = args.indexOf('--name')
  const subjIdx = args.indexOf('--subject')
  const name = nameIdx > -1 ? args[nameIdx + 1] : `FermentFreude — ${slug}`
  const subject = subjIdx > -1 ? args[subjIdx + 1] : 'FermentFreude'

  // Find a file matching <id>-<slug>.html OR <slug>.html
  const files = readdirSync(TEMPLATES_DIR)
  const file = files.find(
    (f) => f.endsWith('.html') && (f === `${slug}.html` || f.endsWith(`-${slug}.html`)),
  )
  if (!file) {
    console.error(`No HTML file matching slug "${slug}" in ${TEMPLATES_DIR}`)
    process.exit(1)
  }
  const html = readFileSync(path.join(TEMPLATES_DIR, file), 'utf8')
  console.log(`\n📨 CREATE mode — slug=${slug}, file=${file}, ${html.length} bytes`)
  console.log(`     name:    ${name}`)
  console.log(`     subject: ${subject}\n`)
  if (dryRun) {
    console.log('(dry-run, not created)')
    process.exit(0)
  }
  const r = await createTemplate({ name, subject, htmlContent: html })
  console.log(`✓ Created Brevo template — ID = ${r.id}`)
  console.log(`\n  → Add to .env / Vercel:`)
  console.log(`     BREVO_TEMPLATE_WORKSHOP_GIFT_NOTIFICATION=${r.id}\n`)
  process.exit(0)
}

if (testMode) {
  console.log(`\n🧪 TEST MODE — sending preview emails to ${TEST_EMAIL}\n`)
  for (const id of targetIds) {
    const params = MOCK[id]
    if (!params) {
      console.warn(`  ⚠️  no MOCK data for ${id}, skipping`)
      continue
    }
    try {
      const r = await sendTestEmail(id, params)
      console.log(`  ✓ #${id} test sent → messageId ${r.messageId}`)
    } catch (e) {
      console.error(`  ✗ #${id} FAILED: ${e.message}`)
    }
  }
  console.log()
  process.exit(0)
}

console.log(`\n📧 ${dryRun ? 'DRY-RUN' : 'PUSH'} — ${targetIds.length} V2 template(s)\n`)
for (const id of targetIds) {
  try {
    const slug = V2_TEMPLATES.find((t) => t.id === id)?.slug
    const html = loadHtml(id, slug)
    const before = await getTemplate(id)
    console.log(`  #${id} ${before.name}`)
    console.log(`     subject: ${before.subject}`)
    console.log(`     before:  ${before.htmlContent?.length || 0} bytes`)
    console.log(`     new:     ${html.length} bytes`)
    if (dryRun) {
      console.log(`     (dry-run, not pushed)`)
    } else {
      await updateTemplateHtml(id, html)
      const after = await getTemplate(id)
      console.log(`     ✓ pushed — ${after.htmlContent?.length || 0} bytes live`)
    }
    console.log()
  } catch (e) {
    console.error(`  ✗ #${id} FAILED: ${e.message}\n`)
  }
}
console.log('Done.')
