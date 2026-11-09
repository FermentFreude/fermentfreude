/**
 * Home: take the old Tempeh carousel (`homeTempehStory`) off the page — it
 * isn't shown anyway while the Showcase slides exist, it only cluttered the
 * admin. A copy of the block (DE + EN) is saved to a JSON file first, and
 * `--restore <file>` puts it back in its old place (after the Showcase).
 *
 * Also: the gift slide picture (gutschein.webp, swapped in admin 2026-11-04)
 * gets a description that matches the new studio photo.
 *
 * Run:  npx tsx src/scripts/patch-home-remove-tempeh-carousel.ts [--restore <file>]   (staging DB only)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import os from 'os'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
  console.error('🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.')
  process.exit(1)
}

const GIFT_PHOTO = {
  filename: 'gutschein.webp',
  altDe:
    'Gutschein – im Fermentfreude-Studio: Gläser mit Gewürzen und Fermenten, Kochplatte mit Topf auf dem Holztisch',
  altEn:
    'Voucher – in the Fermentfreude studio: jars of spices and ferments, a hot plate with a pot on the wooden counter',
}

const restoreIdx = process.argv.indexOf('--restore')
const restoreFile = restoreIdx > -1 ? process.argv[restoreIdx + 1] : null

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const home = found.docs[0]
  if (!home) throw new Error('Home page not found')
  console.log('Home updatedAt before this run:', home.updatedAt)

  // An admin autosave draft newer than the published page: a write here would
  // build on that draft and save Home as a draft — i.e. take it offline
  const latest = await payload.findVersions({
    collection: 'pages',
    where: { parent: { equals: home.id }, latest: { equals: true } },
    limit: 1,
    depth: 0,
  })
  if (latest.docs[0]?.version._status === 'draft') {
    console.error('🚫 Home has an unpublished draft from the admin — publish or discard it first.')
    process.exit(1)
  }

  if (restoreFile) {
    const saved = JSON.parse(fs.readFileSync(restoreFile, 'utf8')) as Record<'de' | 'en', unknown>
    for (const locale of ['de', 'en'] as const) {
      const doc = await payload.findByID({ collection: 'pages', id: home.id, locale, depth: 0 })
      const layout = [...(doc.layout ?? [])]
      if (layout.some((b) => b.blockType === 'homeTempehStory')) {
        console.log(`${locale}: carousel already there`)
        continue
      }
      const at = layout.findIndex((b) => b.blockType === 'productShowcase') + 1
      layout.splice(at, 0, saved[locale] as (typeof layout)[number])
      await payload.update({ collection: 'pages', id: home.id, locale, data: { layout } as never, context: ctx })
      console.log(`✅ ${locale}: carousel restored`)
    }
    return
  }

  // 1. Save a copy of the carousel in both languages
  const copy: Record<string, unknown> = {}
  for (const locale of ['de', 'en'] as const) {
    const doc = await payload.findByID({ collection: 'pages', id: home.id, locale, depth: 0 })
    copy[locale] = (doc.layout ?? []).find((b) => b.blockType === 'homeTempehStory') ?? null
  }
  if (!copy.de) {
    console.log('No old Tempeh carousel on Home — nothing to remove.')
  } else {
    const backup = path.join(os.tmpdir(), `home-tempeh-carousel-${Date.now()}.json`)
    fs.writeFileSync(backup, JSON.stringify(copy, null, 2))
    console.log('Copy saved:', backup)

    // 2. Remove it (the block list is shared by both languages — one write)
    const doc = await payload.findByID({ collection: 'pages', id: home.id, locale: 'de', depth: 0 })
    const layout = (doc.layout ?? []).filter((b) => b.blockType !== 'homeTempehStory')
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale: 'de',
      data: { layout } as never,
      context: ctx,
    })
    const check = await payload.findByID({ collection: 'pages', id: home.id, locale: 'en', depth: 0 })
    console.log(
      '✅ carousel removed — blocks now:',
      (check.layout ?? []).map((b) => b.blockType).join(', '),
    )
  }

  // 3. Gift photo description
  const media = await payload.find({
    collection: 'media',
    where: { filename: { equals: GIFT_PHOTO.filename } },
    limit: 1,
    depth: 0,
  })
  const photo = media.docs[0]
  if (!photo) throw new Error(`${GIFT_PHOTO.filename} not found`)
  for (const [locale, alt] of [
    ['de', GIFT_PHOTO.altDe],
    ['en', GIFT_PHOTO.altEn],
  ] as const) {
    await payload.update({ collection: 'media', id: photo.id, locale, data: { alt }, context: ctx })
    console.log(`✅ ${locale}: photo description updated`)
  }
}

await main()
process.exit(0)
