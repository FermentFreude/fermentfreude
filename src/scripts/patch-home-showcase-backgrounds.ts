/**
 * Home Product Showcase: background photo on slide 1 (Tempeh) and slide 2 (Workshops).
 * Uploads two NEW media docs (never touches existing ones) and sets
 * `backgroundImage` on the two slides, DE then EN with the same row IDs.
 *
 * Run:  npx tsx src/scripts/patch-home-showcase-backgrounds.ts
 * Staging DB only. Sources: Rafaela's originals in ~/Downloads.
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

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const DOWNLOADS = path.join(os.homedir(), 'Downloads')
const images = [
  {
    file: 'tempehheroworkshop-1 (1).webp',
    name: 'home-showcase-bg-tempeh.webp',
    altDe: 'Tempeh auf Holzbrettern, im Hintergrund schneiden Hände weiteres Tempeh',
    altEn: 'Tempeh on wooden boards, hands cutting more tempeh in the background',
  },
  {
    file: 'lakto slide1.webp',
    name: 'home-showcase-bg-workshops.webp',
    altDe: 'Gläser mit Gewürzen und Fermentiergefäße im Studio, dahinter ein Mann am Regal',
    altEn: 'Jars of spices and fermenting vessels in the studio, a man at the shelves behind',
  },
]

async function main() {
  const payload = await getPayload({ config })

  const ids: string[] = []
  for (const img of images) {
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { equals: img.altDe } },
      limit: 1,
      depth: 0,
      locale: 'de',
    })
    if (existing.docs[0]) {
      ids.push(existing.docs[0].id)
      continue
    }
    const file = await optimizedFile(path.join(DOWNLOADS, img.file), IMAGE_PRESETS.hero)
    const doc = await payload.create({
      collection: 'media',
      locale: 'de',
      context: ctx,
      data: { alt: img.altDe },
      file: { ...file, name: img.name },
    })
    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'en',
      data: { alt: img.altEn },
      context: ctx,
    })
    // Don't trust the exit code: check the file is really being served
    const url = (doc as { url?: string }).url
    if (url) {
      const res = await fetch(url, { method: 'HEAD' })
      console.log(`${img.name}: HEAD ${res.status}`)
      if (!res.ok) throw new Error(`Upload not reachable: ${url}`)
    }
    ids.push(doc.id)
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
        slides: (b.slides ?? []).map((s, i) => (i < ids.length ? { ...s, backgroundImage: ids[i] } : s)),
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
