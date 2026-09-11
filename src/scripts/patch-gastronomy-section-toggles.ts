/**
 * Set gastronomy section visibility toggles to on (existing page has no values yet).
 * Run: npx tsx src/scripts/patch-gastronomy-section-toggles.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const db = process.env.DATABASE_URL ?? ''
if (!/staging/i.test(db)) {
  console.error('Refusing to run: DATABASE_URL does not look like staging.')
  process.exit(1)
}

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const SHOWN = {
  gastronomyShowHero: true,
  gastronomyShowShowcase: true,
  gastronomyShowBenefits: true,
  gastronomyShowAudience: true,
  gastronomyShowProduct: true,
  gastronomyShowProof: true,
  gastronomyShowInquiry: true,
}

async function patch() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 0,
  })
  const page = result.docs[0]
  if (!page) {
    payload.logger.error('Gastronomy page not found')
    process.exit(1)
  }

  for (const locale of ['de', 'en'] as const) {
    const doc = await payload.findByID({
      collection: 'pages',
      id: page.id,
      locale,
      fallbackLocale: false,
      depth: 0,
    })
    const g = (doc.gastronomy ?? {}) as Record<string, unknown>
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale,
      context: ctx,
      data: {
        gastronomy: {
          ...g,
          ...SHOWN,
        },
      },
    })
  }

  payload.logger.info('Gastronomy section toggles set to Show.')
  process.exit(0)
}

patch().catch((err) => {
  console.error(err)
  process.exit(1)
})
