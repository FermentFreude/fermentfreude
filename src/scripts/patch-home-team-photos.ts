/**
 * Home, team section ("Das steckt hinter Fermentfreude"): new portraits of
 * David and Marcel (Rafaela's originals, 2026-11-04, white background).
 * Uploads NEW media docs (HEAD-checked) and sets them on the matching member
 * by name; the old portraits stay in the library. DE then EN, same row IDs.
 *
 * Run:  npx tsx src/scripts/patch-home-team-photos.ts   (staging DB only)
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

const DOWNLOADS = path.join(os.homedir(), 'Downloads')
const PORTRAITS = [
  {
    match: /david/i,
    file: path.join(DOWNLOADS, 'David.jpg'),
    name: 'team-david-portrait.webp',
    altDe: 'David Haider von FermentFreude im schwarzen Hemd, lächelnd',
    altEn: 'David Haider of FermentFreude in a black shirt, smiling',
  },
  {
    match: /marcel/i,
    file: path.join(DOWNLOADS, 'Marcel.jpg'),
    name: 'team-marcel-portrait.webp',
    altDe: 'Marcel Raunnigger von FermentFreude in dunkelblauer Kochjacke, lächelnd',
    altEn: 'Marcel Raunnigger of FermentFreude in a navy chef jacket, smiling',
  },
]

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })

  // Upload (or reuse from an earlier run) — sequential, never in parallel
  const ids: { match: RegExp; id: string }[] = []
  for (const p of PORTRAITS) {
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { equals: p.altDe } },
      limit: 1,
      depth: 0,
      locale: 'de',
    })
    if (existing.docs[0]) {
      ids.push({ match: p.match, id: existing.docs[0].id })
      console.log('Already uploaded:', p.name)
      continue
    }
    // Portrait: limit the height-relevant width to the card preset (1200px wide)
    const file = await optimizedFile(p.file, IMAGE_PRESETS.card)
    const doc = await payload.create({
      collection: 'media',
      locale: 'de',
      context: ctx,
      data: { alt: p.altDe },
      file: { ...file, name: p.name },
    })
    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'en',
      data: { alt: p.altEn },
      context: ctx,
    })
    // Don't trust the exit code: check the file is really being served
    const url = (doc as { url?: string }).url
    if (url) {
      const res = await fetch(url, { method: 'HEAD' })
      console.log(`${p.name}: HEAD ${res.status}`)
      if (!res.ok) throw new Error(`Upload not reachable: ${url}`)
    }
    ids.push({ match: p.match, id: doc.id })
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
    let matched = 0
    const layout = (doc.layout ?? []).map((b) => {
      if (b.blockType !== 'teamPreview') return b
      return {
        ...b,
        members: (b.members ?? []).map((m) => {
          const hit = ids.find((x) => x.match.test(m.name ?? ''))
          if (!hit) return m
          matched++
          console.log(`${locale}: ${m.name}`, m.image, '→', hit.id)
          return { ...m, image: hit.id }
        }),
      }
    })
    if (matched !== PORTRAITS.length)
      throw new Error(`Expected ${PORTRAITS.length} members, matched ${matched}`)
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
