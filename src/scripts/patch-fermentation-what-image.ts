/**
 * Re-upload the "Was ist Fermentation?" kimchi image from seed-assets.
 *
 * Run: npx tsx src/scripts/patch-fermentation-what-image.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const WHAT_SOURCE = path.resolve(
  process.cwd(),
  'seed-assets/images/fermentation/what-is-fermentation.png',
)
const WHAT_ALT = 'What is fermentation – daikon kimchi with chopsticks'

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function patch() {
  if (!fs.existsSync(WHAT_SOURCE)) {
    throw new Error(`Missing source image: ${WHAT_SOURCE}`)
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'fermentation' } },
    limit: 1,
    depth: 1,
    locale: 'de',
    fallbackLocale: false,
  })

  const page = result.docs[0]
  const fermentation = page?.fermentation
  if (!page || !fermentation) {
    payload.logger.error('Fermentation page not found')
    process.exit(1)
  }

  const file = await optimizedFile(WHAT_SOURCE, IMAGE_PRESETS.card)
  const what = fermentation.fermentationWhatImage

  let mediaId: string

  if (what && typeof what === 'object' && what.id) {
    mediaId = what.id
    payload.logger.info(`Re-uploading what-section media ${mediaId}`)
    await payload.update({
      collection: 'media',
      id: mediaId,
      data: { alt: WHAT_ALT },
      file,
      context: ctx,
    })
  } else {
    payload.logger.info('Creating what-section media')
    const media = await payload.create({
      collection: 'media',
      data: { alt: WHAT_ALT },
      file,
      context: ctx,
    })
    mediaId = media.id

    const pageData = page as { fermentation?: Record<string, unknown> }
    for (const locale of ['de', 'en'] as const) {
      await payload.update({
        collection: 'pages',
        id: page.id,
        locale,
        data: {
          fermentation: {
            ...(pageData.fermentation ?? {}),
            fermentationWhatImage: mediaId,
          },
        },
        context: ctx,
      })
    }
  }

  const updated = await payload.findByID({ collection: 'media', id: mediaId, depth: 0 })
  payload.logger.info(`✅ What-section image updated → ${updated.url}`)
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
