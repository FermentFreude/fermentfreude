/**
 * clear-voucher-cta-eyebrow.ts
 *
 * Removes the "Special Workshop" eyebrow text from the Home page's
 * Voucher CTA block (DE + EN) per Rafaela's request — the gold line
 * above "Verschenke Fermentation als Erlebnis" / "Give the gift of
 * fermentation as an experience" shouldn't say "Special Workshop".
 *
 * Usage:
 *   npx tsx -r dotenv/config src/scripts/clear-voucher-cta-eyebrow.ts          ← dry-run
 *   npx tsx -r dotenv/config src/scripts/clear-voucher-cta-eyebrow.ts --force  ← actually apply
 */

import config from '@payload-config'
import { getPayload } from 'payload'

const DRY_RUN = !process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

async function clearForLocale(
  payload: Awaited<ReturnType<typeof getPayload>>,
  homeId: string,
  locale: 'de' | 'en',
) {
  const doc = await payload.findByID({ collection: 'pages', id: homeId, locale, depth: 0 })
  const layout = Array.isArray(doc.layout) ? doc.layout : []
  const block = layout.find((b: any) => b.blockType === 'voucherCta') as any
  if (!block) {
    console.log(`[${locale}] No voucherCta block found — skipping.`)
    return
  }

  console.log(`[${locale}] current eyebrow: ${JSON.stringify(block.eyebrow)}`)
  if (DRY_RUN) return

  const nextLayout = layout.map((b: any) =>
    b.blockType === 'voucherCta' ? { ...b, eyebrow: '' } : b,
  )
  await payload.update({
    collection: 'pages',
    id: homeId,
    locale,
    context: ctx,
    data: { layout: nextLayout as never },
  })
  console.log(`[${locale}] ✓ cleared.`)
}

async function main() {
  const payload = await getPayload({ config })
  console.log(`DB: ${process.env.DATABASE_URL?.replace(/\/\/.*@/, '//<creds>@')}`)
  console.log(DRY_RUN ? 'DRY RUN — no writes will be made.\n' : 'LIVE RUN — writing changes.\n')

  const home = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })
  const homeId = home.docs[0]?.id
  if (!homeId) {
    console.error('Home page not found.')
    process.exit(1)
  }

  await clearForLocale(payload, String(homeId), 'de')
  await clearForLocale(payload, String(homeId), 'en')

  if (DRY_RUN) console.log('\nDry run complete. Re-run with --force to apply.')
  process.exit(0)
}

main()
