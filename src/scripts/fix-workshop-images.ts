/**
 * Repair script — re-uploads corrupted workshop slider images.
 *
 * The `clientUploads: true` S3 plugin setting caused seed-uploaded images
 * to be stored as tiny placeholder files in R2. This script:
 *   1. Disables clientUploads via PAYLOAD_SEED env var
 *   2. Reads the home page to find workshop slider image IDs
 *   3. Re-uploads the proper images from seed-assets to each media doc
 *
 * Run: npx tsx src/scripts/fix-workshop-images.ts
 */

// Must be set BEFORE payload config is loaded
process.env.PAYLOAD_SEED = 'true'

// Load .env (dotenv is ok as a static import — it doesn't depend on env vars)
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadDotenv } from 'dotenv'
loadDotenv()

// Dynamic imports so @payload-config loads AFTER dotenv
const { default: payloadConfig } = await import('@payload-config')
const { getPayload } = await import('payload')

import type { Page } from '@/payload-types'
import path from 'path'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const workshopsDir = path.resolve(process.cwd(), 'seed-assets/media/workshops')
const heroDir = path.resolve(process.cwd(), 'seed-assets/media/hero')
const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')

// Map: source file path → { alt, field description }
const WORKSHOP_IMAGES: Record<
  string,
  { source: string; alt: string; preset: { maxWidth: number; quality: number } }
> = {
  lakto: {
    source: path.join(workshopsDir, 'lakto.png'),
    alt: 'Lakto-Gemüse workshop – fermented vegetables in glass jars',
    preset: IMAGE_PRESETS.card,
  },
  kombucha: {
    source: path.join(workshopsDir, 'kombucha.png'),
    alt: 'Kombucha workshop – kombucha SCOBY and fermented tea in jar',
    preset: IMAGE_PRESETS.card,
  },
  tempeh: {
    source: path.join(workshopsDir, 'tempeh.png'),
    alt: 'Tempeh workshop – homemade tempeh on ceramic plate',
    preset: IMAGE_PRESETS.card,
  },
  lakto2: {
    source: path.join(heroDir, 'lakto1.png'),
    alt: 'workshop-lakto-secondary – Sauerkraut Jar product image',
    preset: IMAGE_PRESETS.card,
  },
  kombucha2: {
    source: path.join(heroDir, 'kombucha1.png'),
    alt: 'workshop-kombucha-secondary – Kombucha Apple & Carrot product image',
    preset: IMAGE_PRESETS.card,
  },
  tempeh2: {
    source: path.join(heroDir, 'tempeh1.png'),
    alt: 'workshop-tempeh-secondary – Tempeh Slices product image',
    preset: IMAGE_PRESETS.card,
  },
}

// Also re-upload team photos, hero banner, and gallery images
const TEAM_IMAGES = {
  david: {
    source: path.join(imagesDir, 'david-heider.jpg'),
    alt: 'David Heider – FermentFreude co-founder and instructor',
    preset: IMAGE_PRESETS.card,
  },
  marcel: {
    source: path.join(imagesDir, 'marcel-rauminger.jpg'),
    alt: 'Marcel Rauminger – FermentFreude co-founder and instructor',
    preset: IMAGE_PRESETS.card,
  },
}

async function fixImages() {
  const payload = await getPayload({ config: payloadConfig })
  const ctx = { skipAutoTranslate: true, skipRevalidate: true }

  // ── Find the home page ────────────────────────────────────
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    locale: 'de',
    depth: 2,
  })

  if (result.docs.length === 0) {
    payload.logger.error('Home page not found!')
    process.exit(1)
  }

  const page = result.docs[0] as Page
  const layout = Array.isArray(page.layout) ? page.layout : []

  // ── Find the workshop slider block ────────────────────────
  const workshopBlock = layout.find(
    (b) => b && typeof b === 'object' && 'blockType' in b && b.blockType === 'workshopSlider',
  )

  if (!workshopBlock || !('workshops' in workshopBlock)) {
    payload.logger.error('Workshop slider block not found on home page!')
    process.exit(1)
  }

  const workshops = (workshopBlock as { workshops?: unknown[] }).workshops || []

  payload.logger.info(`Found ${workshops.length} workshops. Checking images...`)

  let fixedCount = 0

  for (const w of workshops) {
    if (!w || typeof w !== 'object') continue
    const workshop = w as {
      title?: string
      image?: { id: string; filesize?: number; filename?: string } | string | number
      image2?: { id: string; filesize?: number; filename?: string } | string | number
    }

    // Fix primary image
    if (workshop.image && typeof workshop.image === 'object' && workshop.image.id) {
      const img = workshop.image
      // Check if image is corrupted (< 5KB for a photo means it's a placeholder)
      if ((img.filesize ?? 0) < 5000) {
        const key = workshop.title?.toLowerCase().includes('lakto')
          ? 'lakto'
          : workshop.title?.toLowerCase().includes('kombucha')
            ? 'kombucha'
            : workshop.title?.toLowerCase().includes('tempeh')
              ? 'tempeh'
              : null

        if (key && WORKSHOP_IMAGES[key]) {
          const spec = WORKSHOP_IMAGES[key]
          payload.logger.info(
            `  🔧 Re-uploading ${key} primary image (was ${img.filesize} bytes: ${img.filename})`,
          )
          const file = await optimizedFile(spec.source, spec.preset)
          await payload.update({
            collection: 'media',
            id: img.id,
            data: { alt: spec.alt },
            file,
            context: ctx,
          })
          fixedCount++
        }
      } else {
        payload.logger.info(
          `  ✓ ${workshop.title} primary image OK (${workshop.image.filesize} bytes)`,
        )
      }
    }

    // Fix secondary image
    if (workshop.image2 && typeof workshop.image2 === 'object' && workshop.image2.id) {
      const img = workshop.image2
      if ((img.filesize ?? 0) < 5000) {
        const key = workshop.title?.toLowerCase().includes('lakto')
          ? 'lakto2'
          : workshop.title?.toLowerCase().includes('kombucha')
            ? 'kombucha2'
            : workshop.title?.toLowerCase().includes('tempeh')
              ? 'tempeh2'
              : null

        if (key && WORKSHOP_IMAGES[key]) {
          const spec = WORKSHOP_IMAGES[key]
          payload.logger.info(
            `  🔧 Re-uploading ${key} secondary image (was ${img.filesize} bytes: ${img.filename})`,
          )
          const file = await optimizedFile(spec.source, spec.preset)
          await payload.update({
            collection: 'media',
            id: img.id,
            data: { alt: spec.alt },
            file,
            context: ctx,
          })
          fixedCount++
        }
      } else {
        payload.logger.info(
          `  ✓ ${workshop.title} secondary image OK (${workshop.image2.filesize} bytes)`,
        )
      }
    }
  }

  // ── Fix team photos ───────────────────────────────────────
  const teamBlock = layout.find(
    (b) => b && typeof b === 'object' && 'blockType' in b && b.blockType === 'teamPreview',
  )

  if (teamBlock && 'members' in teamBlock) {
    const members = (teamBlock as { members?: unknown[] }).members || []
    for (const m of members) {
      if (!m || typeof m !== 'object' || !('image' in m)) continue
      const member = m as {
        name?: string
        image?: { id: string; filesize?: number; filename?: string }
      }
      if (member.image && typeof member.image === 'object' && (member.image.filesize ?? 0) < 5000) {
        const key = member.name?.includes('David')
          ? 'david'
          : member.name?.includes('Marcel')
            ? 'marcel'
            : null
        if (key && TEAM_IMAGES[key as keyof typeof TEAM_IMAGES]) {
          const spec = TEAM_IMAGES[key as keyof typeof TEAM_IMAGES]
          payload.logger.info(
            `  🔧 Re-uploading ${member.name} photo (was ${member.image.filesize} bytes)`,
          )
          const file = await optimizedFile(spec.source, spec.preset)
          await payload.update({
            collection: 'media',
            id: member.image.id,
            data: { alt: spec.alt },
            file,
            context: ctx,
          })
          fixedCount++
        }
      }
    }
  }

  // ── Fix hero banner background ────────────────────────────
  const heroBannerBlock = layout.find(
    (b) => b && typeof b === 'object' && 'blockType' in b && b.blockType === 'heroBanner',
  )
  if (heroBannerBlock && 'backgroundImage' in heroBannerBlock) {
    const bgImg = (heroBannerBlock as { backgroundImage?: { id: string; filesize?: number } })
      .backgroundImage
    if (bgImg && typeof bgImg === 'object' && (bgImg.filesize ?? 0) < 5000) {
      const bannerSource = path.join(imagesDir, 'Banner.png')
      const fs = await import('fs')
      if (fs.existsSync(bannerSource)) {
        payload.logger.info(
          `  🔧 Re-uploading hero banner background (was ${bgImg.filesize} bytes)`,
        )
        const file = await optimizedFile(bannerSource, IMAGE_PRESETS.hero)
        await payload.update({
          collection: 'media',
          id: bgImg.id,
          data: { alt: 'FermentFreude chefs banner – professional kitchen scene' },
          file,
          context: ctx,
        })
        fixedCount++
      }
    }
  }

  if (fixedCount > 0) {
    payload.logger.info(
      `\n✅ Fixed ${fixedCount} corrupted image(s). Refresh the page to see the changes.`,
    )
  } else {
    payload.logger.info('\n✓ All images look OK (no files under 5KB detected).')
  }

  process.exit(0)
}

fixImages()
