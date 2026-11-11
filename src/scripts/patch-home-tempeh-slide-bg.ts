/**
 * Home showcase, Tempeh slide: background photo → fried Käferbohnen tempeh on a
 * plate with kimchi behind (Rafaela, 2026-11-04). Reuses the media doc if the
 * library already has this file, otherwise uploads a NEW one (HEAD-checked).
 * The previous background stays in the library untouched.
 *
 * Run:  npx tsx src/scripts/patch-home-tempeh-slide-bg.ts   (staging DB only)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import os from 'os'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
  console.error('🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.')
  process.exit(1)
}

const SOURCE = 'Käferbohnentempeh gebraten mit Kimchi im Hintergrund_1200x800.webp'
const IMAGE = {
  file: path.join(os.homedir(), 'Downloads', SOURCE),
  name: 'home-showcase-bg-tempeh-plate.webp',
  altDe: 'Gebratener Käferbohnen-Tempeh auf einem dunklen Teller, dahinter Gläser mit Kimchi',
  altEn: 'Fried runner-bean tempeh on a dark plate, jars of kimchi in the background',
}

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })

  // Already in the library (founders' upload, or an earlier run of this script)?
  const existing = await payload.find({
    collection: 'media',
    where: { or: [{ filename: { equals: SOURCE } }, { alt: { equals: IMAGE.altDe } }] },
    limit: 1,
    depth: 0,
    locale: 'de',
  })
  let imageId: string
  if (existing.docs[0]) {
    imageId = existing.docs[0].id
    console.log('Reusing media doc:', existing.docs[0].filename, imageId)
  } else {
    const file = await optimizedFile(IMAGE.file, IMAGE_PRESETS.hero)
    const doc = await payload.create({
      collection: 'media',
      locale: 'de',
      context: ctx,
      data: { alt: IMAGE.altDe },
      file: { ...file, name: IMAGE.name },
    })
    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'en',
      data: { alt: IMAGE.altEn },
      context: ctx,
    })
    // Don't trust the exit code: check the file is really being served
    const url = (doc as { url?: string }).url
    if (url) {
      const res = await fetch(url, { method: 'HEAD' })
      console.log(`${IMAGE.name}: HEAD ${res.status}`)
      if (!res.ok) throw new Error(`Upload not reachable: ${url}`)
    }
    imageId = doc.id
  }

  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const home = found.docs[0]
  if (!home) throw new Error('Home page not found')
  console.log('Home updatedAt before this run:', home.updatedAt)

  for (const locale of ['de', 'en'] as const) {
    const doc = await payload.findByID({ collection: 'pages', id: home.id, locale, depth: 0 })
    const layout = (doc.layout ?? []).map((b) => {
      if (b.blockType !== 'productShowcase') return b
      return {
        ...b,
        slides: (b.slides ?? []).map((s) => {
          if (s.slideType === 'workshops') return s
          console.log(`${locale}: Tempeh background`, s.backgroundImage, '→', imageId)
          return { ...s, backgroundImage: imageId }
        }),
      }
    })
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale,
      data: { layout } as never,
      context: ctx,
    })
    console.log(`✅ ${locale}`)
  }
}

await main()
process.exit(0)
