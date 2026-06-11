/**
 * One-shot script: converts logo-invoice.svg to PNG, uploads it to the production
 * R2 bucket, then patches Brevo email templates 65 + 72 to use it as the header
 * logo and fixes "FermentFreude" → "Fermentfreude" in the footer.
 *
 * Run once (needs R2 + Brevo credentials in .env / .env.local):
 *   pnpm patch:email-visuals
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

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

// ── Constants ──────────────────────────────────────────────────────────────
const BREVO_API = 'https://api.brevo.com/v3'
const BREVO_KEY = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || ''

// Always upload logo to the PRODUCTION bucket so the URL is stable for emails
const PROD_BUCKET = 'fermentfreude-media'
const PROD_PUBLIC_URL = 'https://pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev'
const LOGO_R2_KEY = 'media/fermentfreude-logo-email.png'
const LOGO_URL = `${PROD_PUBLIC_URL}/${LOGO_R2_KEY}`

// All active V2 transactional templates
const TEMPLATE_IDS = [65, 66, 68, 69, 70, 71, 72, 73, 93, 94]

// ── Step 1: Convert logo-invoice.svg → PNG ─────────────────────────────────
async function buildLogoPng(): Promise<Buffer> {
  const svgPath = path.join(process.cwd(), 'public', 'logo-invoice.svg')
  if (!fs.existsSync(svgPath)) throw new Error(`logo-invoice.svg not found at ${svgPath}`)
  const svg = fs.readFileSync(svgPath)
  // 300 × 289 px — crisp on retina, well within email limits
  return sharp(svg).resize(300).png({ compressionLevel: 9 }).toBuffer()
}

// ── Step 2: Upload PNG to R2 production ────────────────────────────────────
async function uploadToR2(pngBuffer: Buffer): Promise<void> {
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2_ENDPOINT, R2_ACCESS_KEY_ID or R2_SECRET_ACCESS_KEY in env')
  }

  const s3 = new S3Client({
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    region: 'auto',
    forcePathStyle: true, // required for Cloudflare R2
  })

  await s3.send(
    new PutObjectCommand({
      Bucket: PROD_BUCKET,
      Key: LOGO_R2_KEY,
      Body: pngBuffer,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000',
    }),
  )
}

// ── Step 3: Brevo helpers ──────────────────────────────────────────────────
async function getTemplate(id: number): Promise<{ htmlContent?: string }> {
  const res = await fetch(`${BREVO_API}/smtp/templates/${id}`, {
    headers: { 'api-key': BREVO_KEY, accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`GET template ${id} failed: ${await res.text()}`)
  return res.json() as Promise<{ htmlContent?: string }>
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

// ── Step 4: HTML patching ──────────────────────────────────────────────────
function patchHtml(html: string, logoUrl: string): string {
  let out = html

  // a) Replace any existing logo/submark img with the invoice logo PNG
  //    Catches <img ... src="...submark..." ...> and similar icon patterns
  out = out.replace(
    /<img\s[^>]*src="[^"]*(?:submark|icon[-_]?logo|fermentfreude[-_]logo)[^"]*"[^>]*>/gi,
    `<img src="${logoUrl}" alt="Fermentfreude" width="120" height="116" style="width:120px;height:auto;display:block;margin:0 auto;" />`,
  )

  // b) Fix copyright capitalisation wherever it appears in the footer
  out = out.replace(/©\s*FermentFreude\b/g, '© Fermentfreude')

  // c) Fix any remaining brand-name capitalisation in visible text
  //    (avoids touching template variable names like {{ params.FIRST_NAME }})
  out = out.replace(/(?<!\{[^}]{0,50})FermentFreude\b(?![^{]{0,50}\})/g, 'Fermentfreude')
  out = out.replace(/FermentFreude GmbH/g, 'Fermentfreude OG')

  return out
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  if (!BREVO_KEY) {
    console.error('BREVO_API_KEY not found in environment. Add it to .env.local and retry.')
    process.exit(1)
  }

  // 1. Convert SVG → PNG
  console.log('Converting logo-invoice.svg to PNG…')
  const pngBuffer = await buildLogoPng()
  console.log(`  PNG size: ${pngBuffer.length} bytes`)

  // 2. Upload to R2
  console.log(`Uploading to R2 production bucket (${PROD_BUCKET})…`)
  await uploadToR2(pngBuffer)
  console.log(`  ✓ Uploaded → ${LOGO_URL}`)

  // 3. Patch Brevo templates
  for (const id of TEMPLATE_IDS) {
    console.log(`\nPatching Brevo template ${id}…`)
    const tpl = await getTemplate(id)
    const original = tpl.htmlContent ?? ''
    if (!original) {
      console.warn(`  Template ${id} has no htmlContent — skipping`)
      continue
    }
    const patched = patchHtml(original, LOGO_URL)
    if (patched === original) {
      console.log(`  No changes needed for template ${id}`)
      continue
    }
    await updateTemplate(id, patched)
    console.log(`  ✓ Template ${id} updated`)
  }

  console.log('\nDone. Send a test booking to verify the email looks correct.')
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
