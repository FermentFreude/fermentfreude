/**
 * Sync Kimchi seasonal notice + ingredients with CMS (staging only).
 *
 * - Sets editable seasonalNotice on Classic Kimchi (DE/EN)
 * - Clears placeholder ingredients that mentioned “CMS” / duplicated the notice
 * - Patches Product Detail Labels seasonalNotice fallback
 *
 * Run: pnpm exec tsx src/scripts/patch-kimchi-seasonal-cms.ts
 */
import path from 'path'
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

const CTX = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const NOTICE_DE =
  'Unsere Kimchis sind saisonal. Je nach verfügbarer Gemüseauswahl variiert die Rezeptur — Zutaten und Allergene der aktuellen Variante folgen vor Verkaufsstart.'
const NOTICE_EN =
  'Our kimchis are seasonal. The recipe varies with available vegetables — ingredients and allergens for the current batch will appear here before it goes on sale.'

function assertStagingDatabase() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  if (!dbUrl.includes('-staging')) {
    console.error(
      '\n🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.\n' +
        '   This patch updates product content — it must never run against production.\n',
    )
    process.exit(1)
  }
}

async function main() {
  assertStagingDatabase()

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  payload.logger.info('📝 Syncing Kimchi seasonal notice + Product Detail Labels…')

  const found = await payload.find({
    collection: 'products',
    where: {
      or: [{ slug: { equals: 'kimchi' } }, { slug: { equals: 'classic-kimchi' } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const kimchi = found.docs[0]
  if (!kimchi) {
    throw new Error('kimchi product not found (also checked classic-kimchi)')
  }

  await payload.update({
    collection: 'products',
    id: kimchi.id,
    locale: 'de',
    data: {
      isSeasonal: true,
      seasonalNotice: NOTICE_DE,
      ingredients: '',
    },
    context: CTX,
    overrideAccess: true,
  })

  await payload.update({
    collection: 'products',
    id: kimchi.id,
    locale: 'en',
    data: {
      seasonalNotice: NOTICE_EN,
      ingredients: '',
    },
    context: CTX,
    overrideAccess: true,
  })

  payload.logger.info(`  ✔ Kimchi (${kimchi.id}): seasonalNotice set, ingredients cleared`)

  await payload.updateGlobal({
    slug: 'product-detail-labels-global',
    locale: 'de',
    data: { seasonalNotice: NOTICE_DE },
    context: CTX,
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'product-detail-labels-global',
    locale: 'en',
    data: { seasonalNotice: NOTICE_EN },
    context: CTX,
    overrideAccess: true,
  })

  payload.logger.info('  ✔ Product Detail Labels: seasonalNotice fallback set')
  payload.logger.info(
    '✅ Done. Edit in /admin → Products → Kimchi → Saison-Hinweis, or Globals → Product Detail Labels.',
  )
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
