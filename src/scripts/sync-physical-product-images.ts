/**
 * sync-physical-product-images.ts
 *
 * One-off: staging's Kimchi and Käferbohnen-Tempeh products had a
 * different, partially-broken gallery (some Media docs referenced
 * "-sync-<timestamp>-..." filenames that never actually existed in EITHER
 * bucket — an artifact of some earlier, incomplete sync/import, unrelated
 * to today's work). Production's gallery for these two products is
 * complete and real. Berglinsen-Tempeh's gallery IDs already matched
 * production exactly; only the actual file for one of its two images
 * (`berglinsen-packaging-nobg.webp`) was missing from the staging R2
 * bucket (copied separately via rclone before this script — see below).
 *
 * This script:
 *   1. Creates the Media docs (on staging) for production's real gallery
 *      images that don't exist on staging yet — URLs rewritten to the
 *      staging bucket domain. The actual files were already copied via
 *      `rclone copy r2:fermentfreude-media/media/ r2:fermentfreude-media-staging/media/ --s3-no-check-bucket --include "<filename>*"`
 *      for each missing filename, run manually before this script.
 *   2. Replaces staging's `gallery` field on both products with an exact
 *      copy of production's (same media ids, same order).
 *
 * Products/media themselves are otherwise untouched — no other fields on
 * either product are modified.
 *
 * Run against staging only: npx tsx src/scripts/sync-physical-product-images.ts
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'
import type { getPayload as GetPayload } from 'payload'

loadEnv()

const dbUrl = process.env.DATABASE_URL || ''
if (!dbUrl.includes('staging')) {
  console.error(
    `❌ DATABASE_URL does not look like staging. Refusing to run. Current: ${dbUrl.replace(/\/\/.*@/, '//<redacted>@')}`,
  )
  process.exit(1)
}

const STAGING_BUCKET_DOMAIN = 'pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev'
const PROD_BUCKET_DOMAIN = 'pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev'

// Media docs exported from production (via mongoexport) for the ids that
// were missing from staging's `media` collection — dumped to
// src/scripts/data/prod-media-dump/<id>.json (gitignored, same convention
// as sync-prod-to-staging.ts's dump.json).
const DUMP_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), 'data/prod-media-dump')

const KIMCHI_ID = '69bc80514889efa4f93c7ae0'
const KAEFERBOHNEN_ID = '69bc80524889efa4f93c7ae9'

const KIMCHI_GALLERY_IDS = [
  '6a9b2e554e2e3dd8a9667c78',
  '6a9b2ec08ef45a857e6aea6e',
  '69c14502013349be01faea18',
  '6a9b32828ef45a857e6aebad',
  '69c14510013349be01faea37',
]
const KAEFERBOHNEN_GALLERY_IDS = [
  '6a8ff817535d83e4ba524a76',
  '69fd81c7bba9c5ef9a689b6d',
  '6a8ff80d535d83e4ba524a48',
  '69fd83925870aa04d330cb64',
  '69fd83c25870aa04d330cb75',
  '69fd8535bba9c5ef9a689c6d',
  '6a8ff806535d83e4ba524a2b',
  '69e52791ac3f19fe6525c824',
]

function rewriteUrl(url: unknown): unknown {
  return typeof url === 'string' ? url.replace(PROD_BUCKET_DOMAIN, STAGING_BUCKET_DOMAIN) : url
}

async function run() {
  const { getPayload } = (await import('payload')) as { getPayload: typeof GetPayload }
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const dumpFiles = fs.existsSync(DUMP_DIR) ? fs.readdirSync(DUMP_DIR) : []
  console.log(`Found ${dumpFiles.length} media dump file(s) in ${DUMP_DIR}`)

  for (const file of dumpFiles) {
    const doc = JSON.parse(fs.readFileSync(path.join(DUMP_DIR, file), 'utf-8'))
    const id = doc._id?.$oid ?? doc.id
    const existing = await payload
      .findByID({ collection: 'media', id, depth: 0, overrideAccess: true })
      .catch(() => null)
    if (existing) {
      console.log(`  media already present: ${doc.filename}`)
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = doc
    const data = {
      ...rest,
      url: rewriteUrl(rest.url),
      sizes: rest.sizes
        ? Object.fromEntries(
            Object.entries(rest.sizes as Record<string, Record<string, unknown>>).map(([k, v]) => [
              k,
              { ...v, url: rewriteUrl(v.url) },
            ]),
          )
        : rest.sizes,
    }
    console.log(`  creating media: ${doc.filename} (${id})`)
    try {
      await payload.db.create({ collection: 'media', data, customID: id })
    } catch (err) {
      console.error(`  ❌ failed to create ${doc.filename}:`, err instanceof Error ? err.message : err)
    }
  }

  // Raw collection update, not payload.update() — the Local API's update()
  // validates the ENTIRE document, and these products have pre-existing,
  // unrelated required-field gaps elsewhere (e.g. Food Details PDP labels)
  // that would block a full-document save. This only touches `gallery`.
  for (const [productId, galleryIds, label] of [
    [KIMCHI_ID, KIMCHI_GALLERY_IDS, 'Kimchi'],
    [KAEFERBOHNEN_ID, KAEFERBOHNEN_GALLERY_IDS, 'Käferbohnen-Tempeh'],
  ] as const) {
    const model = payload.db.collections['products']
    await model.updateOne(
      { _id: productId },
      { $set: { gallery: galleryIds.map((imageId) => ({ image: imageId })) } },
    )
    console.log(`✅ ${label} gallery updated to production's ${galleryIds.length} images.`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
