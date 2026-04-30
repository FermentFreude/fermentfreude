/**
 * Repair script — re-uploads corrupted fermentation page images.
 *
 * Background: clientUploads: true caused seed-uploaded images to be stored as
 * tiny placeholder files in R2. This script:
 *   1. Disables clientUploads via PAYLOAD_SEED env var
 *   2. Reads the fermentation page to find all image media IDs
 *   3. Re-uploads the correct file ONLY if the existing one is corrupted (< threshold bytes)
 *
 * SAFE: Does NOT modify any text, blocks, or page structure — only replaces
 *       broken image files in the Media collection.
 *
 * Run: npx tsx src/scripts/fix-fermentation-images.ts
 */

// Must be set BEFORE payload config is loaded
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadDotenv } from 'dotenv'
loadDotenv()

const { default: payloadConfig } = await import('@payload-config')
const { getPayload } = await import('payload')

import fs from 'fs'
import path from 'path'
import { IMAGE_PRESETS, optimizedFile, readLocalFile } from './seed-image-utils'

const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')

type ImageSpec = {
  source: string
  alt: string
  isSvg?: boolean
  preset: { maxWidth: number; quality: number }
  /** Filesize below this means the stored file is a corrupted placeholder */
  corruptThreshold: number
}

const IMAGE_SPECS: Record<string, ImageSpec> = {
  hero: {
    source: 'gastronomy/gastronomy-cutting-board-fermentation.png',
    alt: 'Fermentation hero – founders at workshop',
    preset: IMAGE_PRESETS.hero,
    corruptThreshold: 5000,
  },
  guide: {
    source: 'gastronomy/gastronomy-slide-fermentation-jars.png',
    alt: 'Fermentation guide – jars and process',
    preset: IMAGE_PRESETS.card,
    corruptThreshold: 5000,
  },
  what: {
    source: 'gastronomy/gastronomy-slide-flatlay-fermentation.png',
    alt: 'What is fermentation – flatlay',
    preset: IMAGE_PRESETS.card,
    corruptThreshold: 5000,
  },
  why: {
    source: 'gastronomy/gastronomy-slide-01-cutting-board.png',
    alt: 'Why fermentation – benefits',
    preset: IMAGE_PRESETS.card,
    corruptThreshold: 5000,
  },
  practice: {
    source: 'gastronomy/gastronomy-cutting-board-fermentation.png',
    alt: 'Practice not trend – traditional fermentation',
    preset: IMAGE_PRESETS.card,
    corruptThreshold: 5000,
  },
  ctaBackground: {
    source: 'gastronomy/gastronomy-slide-professional-training.png',
    alt: 'CTA – ready to learn',
    preset: IMAGE_PRESETS.hero,
    corruptThreshold: 5000,
  },
  heroIcon1: {
    source: 'icons/probiotics.svg',
    alt: 'Health & well-being icon',
    isSvg: true,
    preset: IMAGE_PRESETS.logo,
    corruptThreshold: 500,
  },
  heroIcon2: {
    source: 'icons/taste.svg',
    alt: 'Unique flavours icon',
    isSvg: true,
    preset: IMAGE_PRESETS.logo,
    corruptThreshold: 500,
  },
  heroIcon3: {
    source: 'icons/nutrients.svg',
    alt: 'Simple processes icon',
    isSvg: true,
    preset: IMAGE_PRESETS.logo,
    corruptThreshold: 500,
  },
  heroIcon4: {
    source: 'icons/probiotics.svg',
    alt: 'Learn & share icon',
    isSvg: true,
    preset: IMAGE_PRESETS.logo,
    corruptThreshold: 500,
  },
  workshop1: {
    source: 'gastronomy/gastronomy-slide-fermentation-jars.png',
    alt: 'Lakto-Gemüse workshop',
    preset: IMAGE_PRESETS.card,
    corruptThreshold: 5000,
  },
  workshop2: {
    source: 'gastronomy/gastronomy-slide-flatlay-fermentation.png',
    alt: 'Kombucha workshop',
    preset: IMAGE_PRESETS.card,
    corruptThreshold: 5000,
  },
  workshop3: {
    source: 'gastronomy/gastronomy-slide-01-cutting-board.png',
    alt: 'Tempeh workshop',
    preset: IMAGE_PRESETS.card,
    corruptThreshold: 5000,
  },
}

async function fixFermentationImages() {
  const payload = await getPayload({ config: payloadConfig })
  const ctx = { skipAutoTranslate: true, skipRevalidate: true }

  // ── Find the fermentation page ─────────────────────────────────────
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'fermentation' } },
    limit: 1,
    locale: 'de',
    depth: 2,
  })

  if (result.docs.length === 0) {
    payload.logger.error('Fermentation page not found!')
    process.exit(1)
  }

  const page = result.docs[0] as unknown as Record<string, unknown>
  const fermentation = (page.fermentation ?? {}) as Record<string, unknown>

  let fixedCount = 0
  let skippedCount = 0

  async function tryFix(mediaObj: unknown, specKey: string) {
    if (!mediaObj || typeof mediaObj !== 'object') {
      payload.logger.info(`  — ${specKey}: no image set, skipping`)
      return
    }
    const img = mediaObj as { id: string; filesize?: number; filename?: string }
    if (!img.id) return

    const spec = IMAGE_SPECS[specKey]
    if (!spec) return

    const filesize = img.filesize ?? 0
    if (filesize >= spec.corruptThreshold) {
      payload.logger.info(`  ✓ ${specKey} OK (${filesize} bytes — ${img.filename})`)
      skippedCount++
      return
    }

    const fullPath = path.join(imagesDir, spec.source)
    if (!fs.existsSync(fullPath)) {
      payload.logger.warn(`  ⚠ Source not found for ${specKey}: ${fullPath}`)
      return
    }

    payload.logger.info(
      `  🔧 Re-uploading ${specKey} (was ${filesize} bytes: ${img.filename})`,
    )
    const file = spec.isSvg ? readLocalFile(fullPath) : await optimizedFile(fullPath, spec.preset)
    await payload.update({
      collection: 'media',
      id: img.id,
      data: { alt: spec.alt },
      file,
      context: ctx,
    })
    fixedCount++
  }

  payload.logger.info('Checking fermentation page images…\n')

  // ── Top-level image fields ─────────────────────────────────────────
  await tryFix(fermentation.fermentationHeroImage, 'hero')
  await tryFix(fermentation.fermentationGuideImage, 'guide')
  await tryFix(fermentation.fermentationWhatImage, 'what')
  await tryFix(fermentation.fermentationWhyImage, 'why')
  await tryFix(fermentation.fermentationPracticeImage, 'practice')
  await tryFix(fermentation.fermentationCtaBackgroundImage, 'ctaBackground')

  // ── Hero benefit block icons ───────────────────────────────────────
  const heroBlocks =
    (fermentation.fermentationHeroBlocks as Array<Record<string, unknown>>) ?? []
  const iconKeys = ['heroIcon1', 'heroIcon2', 'heroIcon3', 'heroIcon4']
  for (let i = 0; i < heroBlocks.length; i++) {
    await tryFix(heroBlocks[i]?.icon, iconKeys[i] ?? `heroIcon${i + 1}`)
  }

  // ── Workshop card images ───────────────────────────────────────────
  const workshopCards =
    (fermentation.fermentationWorkshopCards as Array<Record<string, unknown>>) ?? []
  const workshopKeys = ['workshop1', 'workshop2', 'workshop3']
  for (let i = 0; i < workshopCards.length; i++) {
    await tryFix(workshopCards[i]?.image, workshopKeys[i] ?? `workshop${i + 1}`)
  }

  payload.logger.info('')
  if (fixedCount > 0) {
    payload.logger.info(
      `✅ Fixed ${fixedCount} corrupted image(s). ${skippedCount} were already OK.`,
    )
    payload.logger.info('Refresh the admin to see the updated images.')
  } else {
    payload.logger.info(`✓ All fermentation images look OK — nothing to fix.`)
  }

  process.exit(0)
}

fixFermentationImages()
