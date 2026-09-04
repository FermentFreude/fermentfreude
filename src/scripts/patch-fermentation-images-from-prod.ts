/**
 * Sync fermentation hero + what images from production assets into staging CMS/R2.
 *
 * Sources:
 * - Hero: production R2 fermentationHero.webp (David + Marcel)
 * - What: production static what-is-fermentation.png (kimchi)
 *
 * Run: npx tsx src/scripts/patch-fermentation-images-from-prod.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const ASSETS_DIR = path.resolve(process.cwd(), 'seed-assets/images/fermentation')
const HERO_SOURCE = path.join(ASSETS_DIR, 'fermentationHero.webp')
const WHAT_SOURCE = path.join(ASSETS_DIR, 'what-is-fermentation.png')

async function ensureSources() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true })

  if (!fs.existsSync(HERO_SOURCE)) {
    const res = await fetch(
      'https://pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev/media/fermentationHero.webp',
    )
    if (!res.ok) throw new Error(`Failed to download hero (${res.status})`)
    fs.writeFileSync(HERO_SOURCE, Buffer.from(await res.arrayBuffer()))
  }

  if (!fs.existsSync(WHAT_SOURCE)) {
    const res = await fetch(
      'https://www.fermentfreude.at/assets/images/fermentation/what-is-fermentation.png',
    )
    if (!res.ok) throw new Error(`Failed to download what image (${res.status})`)
    fs.writeFileSync(WHAT_SOURCE, Buffer.from(await res.arrayBuffer()))
  }
}

async function reuploadMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  mediaId: string,
  sourcePath: string,
  alt: string,
  preset: { maxWidth: number; quality: number },
) {
  const file = await optimizedFile(sourcePath, preset)
  await payload.update({
    collection: 'media',
    id: mediaId,
    data: { alt },
    file,
    context: ctx,
  })
}

async function patch() {
  await ensureSources()

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

  const hero = fermentation.fermentationHeroImage
  const what = fermentation.fermentationWhatImage

  if (hero && typeof hero === 'object' && hero.id) {
    payload.logger.info(`Re-uploading hero media ${hero.id}`)
    await reuploadMedia(
      payload,
      hero.id,
      HERO_SOURCE,
      'Fermentation – David and Marcel at workshop',
      IMAGE_PRESETS.hero,
    )
  } else {
    payload.logger.warn('No hero media on page — skipping hero')
  }

  if (what && typeof what === 'object' && what.id) {
    payload.logger.info(`Re-uploading what-section media ${what.id}`)
    await reuploadMedia(
      payload,
      what.id,
      WHAT_SOURCE,
      'What is fermentation – daikon kimchi with chopsticks',
      IMAGE_PRESETS.card,
    )
  } else {
    payload.logger.info('Creating what-section media and linking to page')
    const file = await optimizedFile(WHAT_SOURCE, IMAGE_PRESETS.card)
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: 'What is fermentation – daikon kimchi with chopsticks',
      },
      file,
      context: ctx,
    })

    const pageData = page as { fermentation?: Record<string, unknown> }
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'de',
      data: {
        fermentation: {
          ...(pageData.fermentation ?? {}),
          fermentationWhatImage: media.id,
        },
      },
      context: ctx,
    })

    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      data: {
        fermentation: {
          ...(pageData.fermentation ?? {}),
          fermentationWhatImage: media.id,
        },
      },
      context: ctx,
    })
  }

  payload.logger.info('✅ Fermentation hero + what images synced from production sources')
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
