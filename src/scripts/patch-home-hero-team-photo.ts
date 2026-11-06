/**
 * Home hero (cinematic, first slide): set the team photo of Marcel & David.
 *
 *   npx tsx src/scripts/patch-home-hero-team-photo.ts           → upload + use the new
 *       Canva export (NEW media doc, HEAD-checked; the old one is left as it is)
 *   npx tsx src/scripts/patch-home-hero-team-photo.ts --restore → back to the
 *       original hero-cinematic-1.webp (Rafaela, 2026-11-04: "use the same as before")
 *
 * DE then EN, same row IDs. Staging DB only.
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

const IMAGE = {
  file: path.join(
    os.homedir(),
    'Downloads',
    'Fermentfreude Team 1200x800 bearbeitet_Qualität Hoch Canva (1).png',
  ),
  name: 'home-hero-marcel-david.webp',
  altDe:
    'Marcel und David von FermentFreude an einem Holztisch, dahinter ein Regal mit Fermentgläsern',
  altEn:
    'Marcel and David of FermentFreude at a wooden table, a shelf of fermentation jars behind them',
}

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })

  const RESTORE_ID = '6abf67490b4dfda4993c24b5' // hero-cinematic-1.webp
  let imageId: string
  if (process.argv.includes('--restore')) {
    const old = await payload.findByID({ collection: 'media', id: RESTORE_ID, depth: 0 })
    console.log('Restoring', old.filename)
    imageId = RESTORE_ID
  } else {
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { equals: IMAGE.altDe } },
      limit: 1,
      depth: 0,
      locale: 'de',
    })
    if (existing.docs[0]) {
      imageId = existing.docs[0].id
      console.log('Photo already uploaded:', imageId)
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
    const hero = doc.hero
    if (!hero?.cinematicSlides?.length) throw new Error('No cinematic hero slides found')
    console.log(`${locale}: replacing hero image`, hero.cinematicSlides[0]?.image, '→', imageId)
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale,
      data: {
        hero: {
          ...hero,
          cinematicSlides: hero.cinematicSlides.map((s, i) =>
            i === 0 ? { ...s, image: imageId } : s,
          ),
        },
      } as never,
      context: ctx,
    })
    console.log(`✅ ${locale}`)
  }
}

await main()
process.exit(0)
