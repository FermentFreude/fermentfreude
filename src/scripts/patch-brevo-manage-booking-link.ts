/**
 * One-shot script: replaces the static "reply to this email to cancel or
 * reschedule" sentence in Brevo template 65 (Workshop Booking Confirmation)
 * with a real link to the booking's manage-booking magic link
 * (MANAGE_BOOKING_URL — already sent as a param by confirmWorkshopBookings.ts
 * and, after the accompanying code fix, by voucher/place-order/route.ts too).
 *
 * Falls back to the original "reply to this email" text if MANAGE_BOOKING_URL
 * is ever empty, so no email can ever render a dead/missing link.
 *
 * Run once (needs BREVO_API_KEY in .env / .env.local):
 *   npx tsx src/scripts/patch-brevo-manage-booking-link.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// ── Load .env / .env.local ─────────────────────────────────────────────────
function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    const full = path.join(process.cwd(), name)
    if (!fs.existsSync(full)) continue
    for (const line of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const m = t.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (!m) continue
      let val = m[2].trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      )
        val = val.slice(1, -1)
      if (!process.env[m[1]]) process.env[m[1]] = val
    }
  }
}
loadEnv()

const BREVO_API = 'https://api.brevo.com/v3'
const BREVO_KEY = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || ''
const TEMPLATE_ID = 65

const ORIGINAL_SENTENCE =
  'Du musst absagen oder verschieben? Antworte auf diese E-Mail — wir helfen dir gerne weiter.'

const NEW_SENTENCE_BLOCK =
  '{% if params.MANAGE_BOOKING_URL and params.MANAGE_BOOKING_URL != "" %}' +
  'Musst du absagen oder verschieben? ' +
  '<a href="{{ params.MANAGE_BOOKING_URL }}" style="color:#1a1a1a;text-decoration:underline;font-weight:600;">Verwalte deine Buchung hier</a>' +
  '.' +
  '{% else %}' +
  ORIGINAL_SENTENCE +
  '{% endif %}'

async function getTemplate(id: number): Promise<{ htmlContent?: string; name?: string } | null> {
  const res = await fetch(`${BREVO_API}/smtp/templates/${id}`, {
    headers: { 'api-key': BREVO_KEY, accept: 'application/json' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GET template ${id} failed: ${await res.text()}`)
  return res.json() as Promise<{ htmlContent?: string; name?: string }>
}

async function updateTemplate(id: number, htmlContent: string): Promise<void> {
  const res = await fetch(`${BREVO_API}/smtp/templates/${id}`, {
    method: 'PUT',
    headers: {
      'api-key': BREVO_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ htmlContent }),
  })
  if (!res.ok) throw new Error(`PUT template ${id} failed: ${await res.text()}`)
}

async function main() {
  if (!BREVO_KEY) {
    console.error('BREVO_API_KEY not found in environment. Add it to .env.local and retry.')
    process.exit(1)
  }

  console.log(`Fetching Brevo template ${TEMPLATE_ID}…`)
  const tpl = await getTemplate(TEMPLATE_ID)
  if (!tpl) {
    console.error(`Template ${TEMPLATE_ID} not found in Brevo.`)
    process.exit(1)
  }

  const html = tpl.htmlContent ?? ''
  const occurrences = html.split(ORIGINAL_SENTENCE).length - 1

  if (occurrences === 0) {
    console.error('Original sentence not found — template may have already been updated, or the text changed. Aborting without changes.')
    process.exit(1)
  }
  if (occurrences > 1) {
    console.error(`Original sentence found ${occurrences} times (expected exactly 1) — aborting to avoid an ambiguous replacement.`)
    process.exit(1)
  }

  const patched = html.replace(ORIGINAL_SENTENCE, NEW_SENTENCE_BLOCK)

  await updateTemplate(TEMPLATE_ID, patched)
  console.log(`✓ Template ${TEMPLATE_ID} updated.`)

  // Verify
  const verify = await getTemplate(TEMPLATE_ID)
  const verifyHtml = verify?.htmlContent ?? ''
  console.log('Contains MANAGE_BOOKING_URL now:', verifyHtml.includes('MANAGE_BOOKING_URL'))
  console.log('Still contains fallback sentence:', verifyHtml.includes(ORIGINAL_SENTENCE))
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
