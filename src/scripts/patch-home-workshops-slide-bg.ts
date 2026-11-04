/**
 * Home showcase, Workshops slide: background photo → a workshop in the studio
 * (Marcel, David and two guests at the long table, FF-Vorschau-60.jpg —
 * Rafaela, 2026-11-04). A bright photo, so the light cream shade + dark text
 * stays. Uploads a NEW media doc (HEAD-checked); earlier backgrounds stay in
 * the library.
 *
 * Run:  npx tsx src/scripts/patch-home-workshops-slide-bg.ts   (staging DB only)
 *       … --restore → back to the earlier studio photo, light cream look
 *       (Rafaela, 2026-11-04: the pan photo moved to the Tempeh slide)
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
  file: path.join(os.homedir(), 'Downloads', 'FF-Vorschau-60.jpg'),
  name: 'home-showcase-bg-workshops-studio.webp',
  altDe:
    'Workshop im FermentFreude-Studio: Marcel und David mit zwei Teilnehmerinnen am langen Holztisch, dahinter Regale mit Gläsern',
  altEn:
    'Workshop in the FermentFreude studio: Marcel and David with two guests at the long wooden table, shelves of jars behind',
}

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })

  // --restore: back to the studio photo it had before, with the light cream look
  const restore = process.argv.includes('--restore')
  const RESTORE_ID = '6aea040f35c9915903ef4ab2' // home-showcase-bg-workshops.webp
  let imageId: string
  if (restore) {
    imageId = RESTORE_ID
    const old = await payload.findByID({ collection: 'media', id: RESTORE_ID, depth: 0 })
    console.log('Restoring', old.filename)
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
    const layout = (doc.layout ?? []).map((b) => {
      if (b.blockType !== 'productShowcase') return b
      return {
        ...b,
        slides: (b.slides ?? []).map((s) => {
          if (s.slideType !== 'workshops') return s
          console.log(
            `${locale}: Workshops background`,
            s.backgroundImage,
            s.textTone,
            '→',
            imageId,
            'light',
          )
          return {
            ...s,
            backgroundImage: imageId,
            textTone: 'dark',
            backgroundVeil: 35,
          }
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
