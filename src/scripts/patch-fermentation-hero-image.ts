/**
 * Re-upload fermentation hero image when R2 file is missing (404) but MongoDB metadata exists.
 *
 * Run: npx tsx src/scripts/patch-fermentation-hero-image.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const DAVID_PATH = path.resolve(process.cwd(), 'seed-assets/media/hero/DavidHeroCopy.png')
const MARCEL_PATH = path.resolve(process.cwd(), 'seed-assets/media/hero/MarcelHero.png')
const FALLBACK_PATH = path.resolve(
  process.cwd(),
  'seed-assets/images/gastronomy-cutting-board-fermentation.png',
)
const COMPOSITE_PATH = path.resolve(process.cwd(), 'seed-assets/images/hero-founders-composite.png')

async function buildFoundersComposite(): Promise<string> {
  if (fs.existsSync(DAVID_PATH) && fs.existsSync(MARCEL_PATH)) {
    const david = sharp(DAVID_PATH).resize(960, 1200, { fit: 'cover' })
    const marcel = sharp(MARCEL_PATH).resize(960, 1200, { fit: 'cover' })
    const [davidBuf, marcelBuf] = await Promise.all([david.toBuffer(), marcel.toBuffer()])

    await sharp({
      create: {
        width: 1920,
        height: 1200,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .composite([
        { input: davidBuf, left: 0, top: 0 },
        { input: marcelBuf, left: 960, top: 0 },
      ])
      .png()
      .toFile(COMPOSITE_PATH)

    return COMPOSITE_PATH
  }

  if (fs.existsSync(FALLBACK_PATH)) return FALLBACK_PATH

  throw new Error(
    'No source image found. Run: pnpm seed:placeholders (needs DavidHeroCopy + MarcelHero or gastronomy fallback)',
  )
}

async function patch() {
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
  const hero = page?.fermentation?.fermentationHeroImage

  if (!hero || typeof hero !== 'object' || !('id' in hero)) {
    payload.logger.error('Fermentation hero image not set on page')
    process.exit(1)
  }

  const heroId = hero.id as string
  const currentUrl = typeof hero.url === 'string' ? hero.url : null
  payload.logger.info(`Current hero media: ${heroId} → ${currentUrl ?? '(no url)'}`)

  if (currentUrl) {
    try {
      const res = await fetch(currentUrl, { method: 'HEAD' })
      if (res.ok) {
        payload.logger.info('Hero image already reachable on R2 — no patch needed')
        return
      }
      payload.logger.warn(`Hero URL returned ${res.status} — re-uploading`)
    } catch {
      payload.logger.warn('Hero URL check failed — re-uploading')
    }
  }

  const sourcePath = await buildFoundersComposite()
  payload.logger.info(`Using source: ${sourcePath}`)

  const file = await optimizedFile(sourcePath, IMAGE_PRESETS.hero)
  await payload.update({
    collection: 'media',
    id: heroId,
    data: {
      alt: 'Fermentation – David and Marcel at workshop',
    },
    file,
    context: ctx,
  })

  const updated = await payload.findByID({ collection: 'media', id: heroId, depth: 0 })
  payload.logger.info(`✅ Re-uploaded fermentation hero → ${updated.url}`)
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
