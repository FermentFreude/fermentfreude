/**
 * Footer texts: "FermentFreude" → "Fermentfreude" (brand spelling rule). Only the three
 * saved texts that carry it: copyrightText (de + en) and newsletterHeading (en).
 * Nothing else in the footer is touched.
 *
 * Run:  npx tsx src/scripts/patch-footer-brand-spelling.ts                (staging DB)
 *       npx tsx src/scripts/patch-footer-brand-spelling.ts --production   (production DB, explicit)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const PRODUCTION = process.argv.includes('--production')
const dbName = (uri: string) =>
  (uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/)?.[1] ?? '').trim()
if (PRODUCTION) process.env.DATABASE_URL = process.env.PROD_DATABASE_URL ?? ''
const expected = PRODUCTION ? 'fermentfreude' : 'fermentfreude-staging'
if (dbName(process.env.DATABASE_URL ?? '') !== expected) {
  console.error(`🚫 REFUSING TO RUN: the database must be ${expected}.`)
  process.exit(1)
}

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const fix = (s?: string | null) =>
  typeof s === 'string' ? s.replace(/FermentFreude/g, 'Fermentfreude') : s

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })
console.log(`Footer on ${expected}:`)
for (const locale of ['de', 'en'] as const) {
  const f = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
  const data: Record<string, string> = {}
  if (f.copyrightText && fix(f.copyrightText) !== f.copyrightText)
    data.copyrightText = fix(f.copyrightText)!
  if (f.newsletterHeading && fix(f.newsletterHeading) !== f.newsletterHeading)
    data.newsletterHeading = fix(f.newsletterHeading)!
  if (!Object.keys(data).length) {
    console.log(`  ${locale}: nothing to change`)
    continue
  }
  await payload.updateGlobal({ slug: 'footer', locale, data: data as never, context: ctx })
  console.log(`  ${locale}: ${JSON.stringify(data)}`)
}
process.exit(0)
