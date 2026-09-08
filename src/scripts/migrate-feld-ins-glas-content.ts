/**
 * migrate-feld-ins-glas-content.ts
 *
 * Brings Vom Feld ins Glas content from staging to production, EXCLUDING
 * hero, conceptImage, and booking fields — Rafaela already edited those
 * directly in production admin and they must not be overwritten.
 *
 * Steps:
 *   1. Download 7 images from staging's public R2 URLs, re-create them as
 *      fresh Media docs in production (new IDs — safer than trying to force
 *      matching IDs across two separate databases).
 *   2. Re-create the 6 "how-to" Posts referenced by howToArticles, pointing
 *      their heroImage at the newly-created production media.
 *   3. Update the production Page's workshopDetail with every OTHER field
 *      from staging (schedule, includedItems, whyPoints, calendarMonths,
 *      voucher*, faq*, howToArticles, slider*, etc.), using the new
 *      production post IDs for howToArticles and the new media ID for
 *      voucherBackgroundImage. Hero/conceptImage/booking fields are simply
 *      omitted from the update payload, so Payload's partial-update merge
 *      leaves Rafaela's existing values untouched.
 *
 * Usage:
 *   npx tsx -r dotenv/config src/scripts/migrate-feld-ins-glas-content.ts          ← dry-run
 *   npx tsx -r dotenv/config src/scripts/migrate-feld-ins-glas-content.ts --force  ← actually apply
 */

import config from '@payload-config'
import fs from 'fs'
import { getPayload } from 'payload'

const DRY_RUN = !process.argv.includes('--force')

function assertProductionDatabase() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  if (dbUrl.includes('-staging') || !dbUrl.includes('fermentfreude')) {
    console.error('🚫 REFUSING TO RUN: DATABASE_URL does not look like production.')
    process.exit(1)
  }
}

const PAGE_ID = '6a86a32f56c16a9856302569' // vom-feld-ins-glas, production

const MEDIA_TO_COPY = [
  {
    stagingId: '6a96c995bc2c873cf78e2f71',
    filename: 'feld-ins-glas-voucher-bg-1788266899871.webp',
    alt: 'feld-ins-glas-voucher-bg – Gurken fermentieren',
    url: 'https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev/media/feld-ins-glas-voucher-bg-1788266899871.webp',
    role: 'voucherBackgroundImage' as const,
  },
  {
    stagingId: '6a5e3cce74f2d6b5edf48ff6',
    filename: 'feld-ins-glas-hero-1.webp',
    alt: 'tipps-cover-frisches-gemuese-am-feld-erkennen – Frisches Gemüse wird im Marktgarten geerntet',
    url: 'https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev/media/feld-ins-glas-hero-1.webp',
    role: 'postHero' as const,
    postId: '6a59fdaae1eb358d59c9b412',
  },
  {
    stagingId: '6a5e3cd074f2d6b5edf4900d',
    filename: 'feld-ins-glas-jars-1.webp',
    alt: 'tipps-cover-milchsaure-zucchini-pickels – Zucchini-Pickels in einem Einmachglas',
    url: 'https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev/media/feld-ins-glas-jars-1.webp',
    role: 'postHero' as const,
    postId: '6a59fdabe1eb358d59c9b45b',
  },
  {
    stagingId: '6a5e3cd274f2d6b5edf49025',
    filename: 'feld-ins-glas-jars-2.webp',
    alt: 'tipps-cover-fermentiertes-gurken-relish – Fermentiertes Gurken-Relish in einem Glas',
    url: 'https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev/media/feld-ins-glas-jars-2.webp',
    role: 'postHero' as const,
    postId: '6a59fdace1eb358d59c9b46b',
  },
  {
    stagingId: '6a5e3cd474f2d6b5edf4903c',
    filename: 'feld-ins-glas-hands-1.webp',
    alt: 'tipps-cover-karfiol-kimchi-anleitung – Karfiol-Kimchi in einem Fermentationsglas',
    url: 'https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev/media/feld-ins-glas-hands-1.webp',
    role: 'postHero' as const,
    postId: '6a59fdace1eb358d59c9b479',
  },
  {
    stagingId: '6a5e3cd674f2d6b5edf49054',
    filename: 'feld-ins-glas-hero-2.webp',
    alt: 'tipps-cover-marktgarten-workshop-vorbereitung – Teilnehmer beim Workshop im Marktgarten',
    url: 'https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev/media/feld-ins-glas-hero-2.webp',
    role: 'postHero' as const,
    postId: '6a59fdace1eb358d59c9b484',
  },
  {
    stagingId: '6a5e3cd974f2d6b5edf4906c',
    filename: 'feld-ins-glas-hands-2.webp',
    alt: 'tipps-cover-vom-feld-ins-glas-ablauf – Gemüse von der Ernte bis zum Fermentationsglas',
    url: 'https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev/media/feld-ins-glas-hands-2.webp',
    role: 'postHero' as const,
    postId: '6a59fdace1eb358d59c9b48b',
  },
]

// Fields intentionally OMITTED from the workshopDetail update — Rafaela already
// edited these directly in production admin. Everything else in the staging
// dump is copied over.
const EXCLUDED_FIELDS = new Set([
  'heroEyebrow',
  'heroTitle',
  'heroDescription',
  'heroImage',
  'heroAttributes',
  'conceptImage',
  'bookingEyebrow',
  'bookingTitle',
  'bookingPrice',
  'bookingPriceSuffix',
  'bookingCurrency',
  'bookingImage',
  'bookingAttributes',
  'bookingViewDatesLabel',
  'bookingHideDatesLabel',
  'bookingMoreDetailsLabel',
  'bookingBookLabel',
  'bookingSpotsLabel',
])

// Post order matters (drag-to-reorder "Articles (pick 6)") — must match
// staging's howToArticles array order exactly, by staging post ID.
const HOWTO_ORDER = [
  '6a59fdaae1eb358d59c9b412',
  '6a59fdabe1eb358d59c9b45b',
  '6a59fdace1eb358d59c9b46b',
  '6a59fdace1eb358d59c9b479',
  '6a59fdace1eb358d59c9b484',
  '6a59fdace1eb358d59c9b48b',
]

async function main() {
  assertProductionDatabase()
  console.log(DRY_RUN ? '🔍 DRY RUN\n' : '🔥 LIVE RUN\n')

  const payload = await getPayload({ config })
  const mediaIdMap = new Map<string, string>() // stagingId -> productionId

  console.log('── Step 1: copying 7 images ──')
  for (const item of MEDIA_TO_COPY) {
    if (DRY_RUN) {
      console.log(`  would download+create: ${item.filename}`)
      continue
    }
    const res = await fetch(item.url)
    if (!res.ok) throw new Error(`Failed to download ${item.url}: ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const created = await payload.create({
      collection: 'media',
      data: { alt: item.alt },
      file: { data: buffer, mimetype: 'image/webp', name: item.filename, size: buffer.length },
    })
    mediaIdMap.set(item.stagingId, String(created.id))
    console.log(`  ✔ ${item.filename} -> ${created.id}`)
  }

  console.log('\n── Step 2: recreating 6 posts ──')
  const postsFull = JSON.parse(fs.readFileSync('/tmp/staging-posts-full.json', 'utf-8')) as Array<
    Record<string, unknown>
  >
  const postIdMap = new Map<string, string>() // stagingId -> productionId

  for (const stagingId of HOWTO_ORDER) {
    const post = postsFull.find((p) => p.id === stagingId)
    if (!post) throw new Error(`Post ${stagingId} not found in staging dump`)
    const newHeroImageId = mediaIdMap.get(post.heroImage as string)

    if (DRY_RUN) {
      console.log(`  would create post: ${post.slug} (heroImage -> ${newHeroImageId ?? '[dry-run: unresolved]'})`)
      continue
    }

    const { id, createdAt, updatedAt, ...rest } = post
    const created = await payload.create({
      collection: 'posts',
      locale: 'de',
      data: { ...rest, heroImage: newHeroImageId } as never,
    })
    postIdMap.set(stagingId, String(created.id))
    console.log(`  ✔ ${post.slug} -> ${created.id}`)
  }

  console.log('\n── Step 3: updating page workshopDetail (excluding hero/conceptImage/booking) ──')
  const stagingDetail = JSON.parse(
    fs.readFileSync('/tmp/staging-feld-detail-clean.json', 'utf-8'),
  ) as Record<string, unknown>

  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(stagingDetail)) {
    if (EXCLUDED_FIELDS.has(key)) continue
    updateData[key] = value
  }

  if (DRY_RUN) {
    console.log('  would update fields:', Object.keys(updateData).join(', '))
    console.log('\n✅ Dry run complete. Re-run with --force to apply.')
    process.exit(0)
  }

  updateData.voucherBackgroundImage = mediaIdMap.get('6a96c995bc2c873cf78e2f71')
  updateData.howToArticles = HOWTO_ORDER.map((id) => postIdMap.get(id))

  await payload.update({
    collection: 'pages',
    id: PAGE_ID,
    locale: 'de',
    data: { workshopDetail: updateData },
  })
  console.log('  ✔ page updated')

  console.log('\n✅ Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('[ERROR]', err)
  process.exit(1)
})
