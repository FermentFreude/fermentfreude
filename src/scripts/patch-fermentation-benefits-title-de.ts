/**
 * Fix DE locale fermentationHeroBenefitsTitle when it was saved as English.
 * Run: npx tsx src/scripts/patch-fermentation-benefits-title-de.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const ENGLISH_BLEED = /^why fermentation\?$/i

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function patch() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'fermentation' } },
    limit: 1,
    depth: 0,
  })

  if (!result.docs[0]) {
    payload.logger.error('Fermentation page not found')
    process.exit(1)
  }

  const pageId = result.docs[0].id

  const deDoc = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    fallbackLocale: false,
    depth: 0,
  })

  const current = deDoc.fermentation?.fermentationHeroBenefitsTitle?.trim()
  payload.logger.info(`Current DE fermentationHeroBenefitsTitle: ${JSON.stringify(current)}`)

  if (current && !ENGLISH_BLEED.test(current)) {
    payload.logger.info('DE title already looks German — no patch needed')
    return
  }

  const dePage = deDoc as { fermentation?: Record<string, unknown> }

  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    context: ctx,
    data: {
      fermentation: {
        ...(dePage.fermentation ?? {}),
        fermentationHeroBenefitsTitle: 'WARUM FERMENTATION?',
      },
    },
  })

  payload.logger.info('✅ Set DE fermentationHeroBenefitsTitle to "WARUM FERMENTATION?"')
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
