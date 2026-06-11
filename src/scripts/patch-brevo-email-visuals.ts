/**
 * One-shot script: patches Brevo email templates 65 + 72 to fix:
 *   1. Copyright text "FermentFreude" → "Fermentfreude"
 *   2. Logo: replaces any submark/icon img with the full dark-bg logo
 *   3. Header background: ensures dark (#0D0A06) on the logo row
 *
 * Run once from a machine that has BREVO_API_KEY in the environment:
 *   pnpm ts-node --transpile-only src/scripts/patch-brevo-email-visuals.ts
 *
 * Safe to run multiple times — patches are idempotent.
 */

import * as fs from 'fs'
import * as path from 'path'

// ── Load env manually (same approach as lib/brevo.ts) ─────────────────────
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      if (!process.env[m[1]]) process.env[m[1]] = val
    }
  }
}
loadEnv()

const BREVO_API = 'https://api.brevo.com/v3'
const API_KEY = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || ''

// Production full-logo URL (light/beige logo on dark background, same as invoice style)
const FULL_LOGO_URL =
  'https://pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev/media/fermentfreude-logo-light.png'

// Template IDs to patch
const TEMPLATE_IDS = [65, 72] // workshop booking confirmation, order confirmation

async function getTemplate(id: number): Promise<{ htmlContent?: string; subject?: string }> {
  const res = await fetch(`${BREVO_API}/smtp/templates/${id}`, {
    headers: { 'api-key': API_KEY, accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`GET template ${id} failed: ${await res.text()}`)
  return res.json() as Promise<{ htmlContent?: string; subject?: string }>
}

async function updateTemplate(id: number, htmlContent: string): Promise<void> {
  const res = await fetch(`${BREVO_API}/smtp/templates/${id}`, {
    method: 'PUT',
    headers: {
      'api-key': API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ htmlContent }),
  })
  if (!res.ok) throw new Error(`PUT template ${id} failed: ${await res.text()}`)
}

function patchHtml(html: string): string {
  let out = html

  // 1. Fix copyright capitalisation
  out = out.replace(/©\s*FermentFreude(?!\s*OG)/g, '© Fermentfreude')
  out = out.replace(/FermentFreude GmbH/g, 'Fermentfreude OG')

  // 2. Fix any remaining "FermentFreude" in footer/body text
  //    (careful: don't touch template variable names like {{ params.X }})
  out = out.replace(/(?<!\{[^}]*)FermentFreude(?![^{]*\})/g, 'Fermentfreude')

  // 3. Replace submark / icon logo with full wordmark logo
  //    Matches <img ... src="...submark..." ...> or "...icon-logo..."
  out = out.replace(
    /<img\s[^>]*src="[^"]*(?:submark|icon)[^"]*"[^>]*>/gi,
    `<img src="${FULL_LOGO_URL}" alt="Fermentfreude" width="160" style="max-width:160px;height:auto;display:block;margin:0 auto;" />`,
  )

  // 4. Ensure the logo header row has the dark background matching the invoice
  //    Replace any light-coloured table-cell/div that wraps the logo img
  //    Pattern: background[-color]: #f... or #FAF... near the logo header
  //    We look for the typical header cell that contains the logo area.
  //    This is safe because we only replace within a 200-char window around "logo-light.png"
  const logoPos = out.indexOf('logo-light.png')
  if (logoPos !== -1) {
    const searchStart = Math.max(0, logoPos - 500)
    const searchEnd = Math.min(out.length, logoPos + 200)
    const before = out.slice(0, searchStart)
    let segment = out.slice(searchStart, searchEnd)
    const after = out.slice(searchEnd)

    // Replace light background colors in this segment with the dark invoice color
    segment = segment.replace(
      /background(?:-color)?:\s*#(?:f9f0dc|faf2e0|ffffff|f5f5f5|fffaf5|f8f4ed)/gi,
      'background-color: #0D0A06',
    )
    segment = segment.replace(
      /background(?:-color)?:\s*(?:white|#fff\b)/gi,
      'background-color: #0D0A06',
    )

    out = before + segment + after
  }

  return out
}

async function main() {
  if (!API_KEY) {
    console.error('BREVO_API_KEY not set. Export it or add it to .env.local')
    process.exit(1)
  }

  for (const id of TEMPLATE_IDS) {
    console.log(`\nPatching template ${id}…`)
    const tpl = await getTemplate(id)
    const original = tpl.htmlContent ?? ''
    if (!original) {
      console.warn(`  Template ${id} has no htmlContent — skipping`)
      continue
    }

    const patched = patchHtml(original)
    if (patched === original) {
      console.log(`  No changes needed for template ${id}`)
      continue
    }

    await updateTemplate(id, patched)
    console.log(`  ✓ Template ${id} updated`)
  }

  console.log('\nDone. Send a test booking to verify the email looks correct.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
