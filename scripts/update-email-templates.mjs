#!/usr/bin/env node
/**
 * One-shot script: update Brevo templates 65 and 72 from the local HTML files.
 * Run: node scripts/update-email-templates.mjs
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function getApiKey() {
  try {
    const env = readFileSync(path.join(root, '.env'), 'utf8')
    const m = env.match(/BREVO_API_KEY=(.+)/)
    if (m) return m[1].trim()
  } catch { /* fall through */ }
  if (process.env.BREVO_API_KEY) return process.env.BREVO_API_KEY
  throw new Error('BREVO_API_KEY not found in .env or environment')
}

async function updateTemplate(apiKey, templateId, htmlFile, subject) {
  const html = readFileSync(path.join(root, 'public/email-templates', htmlFile), 'utf8')
  const res = await fetch(`https://api.brevo.com/v3/smtp/templates/${templateId}`, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({ htmlContent: html, subject, isActive: true }),
  })
  const text = await res.text()
  if (res.ok) {
    console.log(`✅ Template ${templateId} (${htmlFile}) updated`)
  } else {
    console.error(`❌ Template ${templateId} failed (${res.status}): ${text}`)
  }
}

const apiKey = getApiKey()
console.log(`Using API key: ${apiKey.slice(0, 20)}...`)

await updateTemplate(apiKey, 65, '05-workshop-booking-confirmation.html', 'Workshop Buchung bestätigt — {{params.BOOKING_REF}}')
await updateTemplate(apiKey, 72, '10-order-confirmation.html', 'Deine Bestellung bei FermentFreude — {{params.ORDER_ID}}')
