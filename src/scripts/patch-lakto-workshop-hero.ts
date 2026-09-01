/**
 * Upload Lakto-Gemüse workshop hero from seed-assets.
 *
 * Run: npx tsx src/scripts/patch-lakto-workshop-hero.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const PAGE_SLUG = 'lakto-gemuese'
const IMAGE_PATH = path.resolve(
  process.cwd(),
  'seed-assets/images/workshops/lakto-workshop-hero.png',
)

async function patch() {
  const payload = await getPayload({ config })

  const file = await optimizedFile(IMAGE_PATH, IMAGE_PRESETS.card)
  const media = await payload.create({
    collection: 'media',
    data: {
      alt: 'Lakto-Gemüse workshop – preparing fermented vegetables with fresh ingredients',
    },
    file,
    context: { skipAutoTranslate: true },
  })

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: PAGE_SLUG } },
    limit: 1,
    depth: 0,
  })

  if (!result.docs[0]) {
    payload.logger.error(`Page "${PAGE_SLUG}" not found`)
    process.exit(1)
  }

  const page = result.docs[0]
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: {
      workshopDetail: {
        ...(typeof page.workshopDetail === 'object' && page.workshopDetail ? page.workshopDetail : {}),
        heroImage: media.id,
      },
    },
    context: ctx,
  })

  payload.logger.info(`✅ Lakto-Gemüse hero set (${media.id}) — visible on /gastronomy card automatically`)
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
