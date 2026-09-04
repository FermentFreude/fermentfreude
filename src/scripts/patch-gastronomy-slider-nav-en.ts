/**
 * Fix EN gastronomy hero slider nav labels when they were saved as German.
 *
 * Run: npx tsx src/scripts/patch-gastronomy-slider-nav-en.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const GERMAN_PREV = /^(zurück|zurueck)$/i
const GERMAN_NEXT = /^(vor|weiter)$/i

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

  const enDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })

  const g = enDoc.gastronomy ?? ({} as NonNullable<typeof enDoc.gastronomy>)
  const prev = g.gastronomyHeroSliderPrevLabel?.trim()
  const next = g.gastronomyHeroSliderNextLabel?.trim()

  const updates: Record<string, string> = {}
  if (!prev || GERMAN_PREV.test(prev)) updates.gastronomyHeroSliderPrevLabel = 'PREV'
  if (!next || GERMAN_NEXT.test(next)) updates.gastronomyHeroSliderNextLabel = 'NEXT'

  if (Object.keys(updates).length === 0) {
    payload.logger.info('EN slider nav labels already look English — no patch needed')
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    data: {
      gastronomy: {
        ...(g as Record<string, unknown>),
        ...updates,
      },
    },
    context: ctx,
  })

  payload.logger.info(`✅ Updated EN slider nav: ${JSON.stringify(updates)}`)
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
