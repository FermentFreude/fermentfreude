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
  { id: 65, slug: 'workshop-booking' },
  { id: 66, slug: 'account-creation' },
  { id: 68, slug: 'newsletter-welcome' },
  { id: 69, slug: 'email-verification' },
  { id: 70, slug: 'password-reset' },
  { id: 71, slug: 'login-notification' },
  { id: 72, slug: 'order-confirmation' },
  { id: 73, slug: 'voucher-purchased' },
]

// Mock params per template for test sends
const MOCK = {
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
    WORKSHOP_BOOKINGS: [
      {
        title: 'Tempeh Basics',
        dateTime: 'Sa, 6. Juni 2026 · 10:00 – 14:00',
        location: 'Studio Wien, Schönbrunner Str. 12, 1050',
        guests: 2,
        price: '€ 178,00',
      },
    ],
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
    ITEMS: [
      {
        title: 'Tempeh Starter Kit',
        sku: 'TMP-001',
        shortDesc: 'Alles für deinen ersten Tempeh',
        qty: 2,
        thumbUrl: '',
        unitPrice: '€ 24,00',
        lineTotal: '€ 48,00',
      },
      {
        title: 'Kombucha SCOBY',
        sku: 'KBC-002',
        shortDesc: '',
        qty: 1,
        thumbUrl: '',
        unitPrice: '€ 6,00',
        lineTotal: '€ 6,00',
      },
    ],
    WORKSHOP_BOOKINGS: [],
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

function loadHtml(id) {
  const files = readdirSync(TEMPLATES_DIR)
  const match = files.find((f) => f.startsWith(`${id}-`) && f.endsWith('.html'))
  if (!match) throw new Error(`No HTML file for template ${id} in ${TEMPLATES_DIR}`)
  return readFileSync(path.join(TEMPLATES_DIR, match), 'utf8')
}

// =============================================================================
// Main
// =============================================================================
const args = process.argv.slice(2)
const dryRun = args.includes('--dry')
const testMode = args.includes('--test')
const idArg = args.find((a) => /^\d+$/.test(a))
const targetIds = idArg
  ? [Number(idArg)]
  : V2_TEMPLATES.map((t) => t.id)

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
    const html = loadHtml(id)
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
