/**
 * Remove fermentation guide section image from CMS (both locales).
 *
 * Run: npx tsx src/scripts/patch-fermentation-remove-guide-image.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

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

  const page = result.docs[0]
  if (!page) {
    payload.logger.error('Fermentation page not found')
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

    const fermentation = (doc.fermentation ?? {}) as Record<string, unknown>

    await payload.update({
      collection: 'pages',
      id: page.id,
      locale,
      data: {
        fermentation: {
          ...fermentation,
          fermentationGuideImage: null,
        },
      },
      context: ctx,
    })

    payload.logger.info(`✅ Cleared fermentationGuideImage for locale "${locale}"`)
  }
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
