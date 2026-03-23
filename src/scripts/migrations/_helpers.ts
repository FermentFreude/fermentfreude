/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Migration helpers — shared utilities for surgical DB + R2 migrations.
 *
 * Rule: migrations ONLY touch what they declare. Everything else is untouched.
 *
 * Media patterns:
 *
 *   A) Image uploaded via admin UI (staged in staging R2 + staging DB):
 *      → call requireMediaByFilename(payload, 'photo.webp')
 *      → if missing in target, prints exact rclone + mongoimport commands → stops
 *      → once you run those commands, re-run the migration — it proceeds
 *
 *   B) Image available as a local file (seed-assets/ or local path):
 *      → call uploadLocalMedia(payload, '/abs/path.jpg', 'Alt text', 'card')
 *      → converts to WebP, uploads to R2 + Media collection, idempotent
 *
 *   C) Block helper for page layouts:
 *      → call appendBlockToPage(payload, 'shop', 'featuredProductCards', blockData)
 *      → checks if blockType already exists — skips if yes, appends if no
 * ─────────────────────────────────────────────────────────────────────────────
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as dotenvConfig } from 'dotenv'
import path from 'path'
import type { Payload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from '../seed-image-utils'

// ── Make sure .env is loaded even when called from the runner ────────────────
dotenvConfig()

type ImagePreset = keyof typeof IMAGE_PRESETS

// ── Shared context: never trigger revalidation or auto-translate ─────────────
export const CTX = {
  skipRevalidate: true,
  disableRevalidate: true,
  skipAutoTranslate: true,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Media — admin-uploaded images (live in staging R2 / staging DB only)
// ─────────────────────────────────────────────────────────────────────────────

/** Find a media document by filename. Returns its ID or null if not found. */
export async function findMediaByFilename(
  payload: Payload,
  filename: string,
): Promise<string | null> {
  const result = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })
  return result.docs.length > 0 ? String(result.docs[0].id) : null
}

/**
 * Require a media document in the current target DB.
 *
 * Call this at the TOP of your migration for every image that was uploaded via
 * admin UI on local/staging (i.e. it only lives in staging R2 + staging DB).
 *
 * If the media doc is missing, this prints the exact rclone + mongoimport
 * commands needed and THROWS — stopping the migration cleanly before any
 * writes happen.
 *
 * After running those commands, simply re-run the migration — it will proceed.
 *
 * Prerequisites (one-time setup):
 *   - rclone configured: ~/.config/rclone/rclone.conf with r2-staging + r2-prod
 *   - mongoimport installed: brew install mongodb-database-tools
 *   - STAGING_DATABASE_URL in your .env (see .env.example)
 */
export async function requireMediaByFilename(
  payload: Payload,
  filename: string,
): Promise<string> {
  const existingId = await findMediaByFilename(payload, filename)
  if (existingId) return existingId

  const stagingUri =
    process.env.STAGING_DATABASE_URL ??
    '<STAGING_DATABASE_URL — add this to your .env (see CLAUDE.md)>'
  const prodUri = process.env.DATABASE_URL ?? '<DATABASE_URL>'
  const isTargetProd = !prodUri.includes('fermentfreude-staging')
  const targetDb = isTargetProd ? 'fermentfreude' : 'fermentfreude-staging'
  const stagingDb = 'fermentfreude-staging'
  const destBucket = isTargetProd ? 'fermentfreude-media' : 'fermentfreude-media-staging'
  const srcBucket = 'fermentfreude-media-staging'

  process.stderr.write(`
╔═══════════════════════════════════════════════════════════════════════╗
║  ❌  MEDIA MISSING: "${filename}"
║
║  This file exists in staging R2 + staging DB but not in the target.
║  Run these 3 commands FIRST, then re-run the migration.
╚═══════════════════════════════════════════════════════════════════════╝

# 1. Copy R2 file (staging → target bucket):
rclone copy r2-staging:${srcBucket}/media/${filename} \\
  r2-prod:${destBucket}/media/

# 2. Export media document from staging DB:
mongoexport \\
  --uri="${stagingUri}" \\
  --db=${stagingDb} --collection=media \\
  --query='{"filename":"${filename}"}' \\
  --out=/tmp/media-${filename}.json

# 3. Import into target DB:
mongoimport \\
  --uri="${prodUri.replace(/\?.*/, '')}" \\
  --db=${targetDb} --collection=media \\
  --mode=upsert \\
  --file=/tmp/media-${filename}.json

rm /tmp/media-${filename}.json
→ Then re-run: pnpm migrate

`)
  throw new Error(`[migration] Media "${filename}" is missing in target DB. See commands above.`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Media — local file upload (idempotent)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload a local image file to Media + Cloudflare R2. Safe to call multiple
 * times — skips if a media doc with the same filename already exists.
 *
 * @param localPath  Absolute filesystem path to the source image.
 * @param altText    Alt text for the image (German text preferred — localized later).
 * @param preset     Resize preset: 'hero' (1920px) | 'card' (1200px) | 'logo' (600px).
 */
export async function uploadLocalMedia(
  payload: Payload,
  localPath: string,
  altText: string,
  preset: ImagePreset = 'card',
): Promise<string> {
  const base = path.basename(localPath)
  const expectedFilename = base.replace(/\.(png|jpe?g)$/i, '.webp')

  const existing = await findMediaByFilename(payload, expectedFilename)
  if (existing) {
    payload.logger.info(`  ↩ Media already exists: ${expectedFilename} (${existing}) — skipped`)
    return existing
  }

  const file = await optimizedFile(localPath, IMAGE_PRESETS[preset])
  const media = await payload.create({
    collection: 'media',
    data: { alt: altText },
    file,
    overrideAccess: true,
  })
  payload.logger.info(`  ✔ Uploaded: ${expectedFilename} → ${media.id}`)
  return String(media.id)
}

// ─────────────────────────────────────────────────────────────────────────────
// Pages — surgical block patching
// ─────────────────────────────────────────────────────────────────────────────

interface BlockLike {
  blockType?: string
  id?: string
  [key: string]: unknown
}

/**
 * Append a block to a page's layout IF a block with that blockType doesn't
 * already exist. Leaves every other block completely unchanged.
 *
 * @param payload    Payload instance.
 * @param pageSlug   The slug of the page to patch (e.g. 'shop', 'home').
 * @param blockType  The block slug to look for (e.g. 'featuredProductCards').
 * @param blockData  The full block data object to append (for both DE + EN).
 * @param enBlockData  If different for EN locale, pass separately. Otherwise reuses blockData.
 *
 * @returns 'added' | 'skipped' (already existed)
 */
export async function appendBlockToPage(
  payload: Payload,
  pageSlug: string,
  blockType: string,
  blockData: Record<string, unknown>,
  enBlockData?: Record<string, unknown>,
): Promise<'added' | 'skipped'> {
  // Find the page
  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: pageSlug } },
    limit: 1,
    overrideAccess: true,
  })

  if (!pageResult.docs.length || !pageResult.docs[0]) {
    throw new Error(`[migration] Page with slug "${pageSlug}" not found.`)
  }
  const page = pageResult.docs[0]
  const pageId = page.id

  // Read current layout (DE locale, depth 0 so IDs are preserved)
  const current = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })

  const layout = ((current.layout as BlockLike[]) ?? [])

  // Check if block already exists
  const exists = layout.some((b) => b.blockType === blockType)
  if (exists) {
    payload.logger.info(`  ↩ Block "${blockType}" already exists on "${pageSlug}" — skipped`)
    return 'skipped'
  }

  // Append DE locale
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (payload.update as any)({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    data: {
      layout: [...layout, { ...blockData, blockType }],
    },
    context: CTX,
    overrideAccess: true,
  })

  // Read back to get the generated block ID
  const afterDE = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })
  const newLayout = (afterDE.layout as BlockLike[]) ?? []
  const addedBlock = newLayout.find((b) => b.blockType === blockType)
  const blockId = addedBlock?.id

  // Append EN locale, reusing same block ID
  const enData = enBlockData ?? blockData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (payload.update as any)({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    data: {
      layout: [
        ...newLayout.slice(0, newLayout.length - 1),
        { ...enData, blockType, ...(blockId ? { id: blockId } : {}) },
      ],
    },
    context: CTX,
    overrideAccess: true,
  })

  payload.logger.info(`  ✔ Block "${blockType}" added to page "${pageSlug}"`)
  return 'added'
}

/**
 * Patch specific fields on ONE block inside a page layout, without touching
 * any other blocks or fields.
 *
 * @param payload    Payload instance.
 * @param pageSlug   The slug of the page.
 * @param blockType  The block to patch.
 * @param deFields   Fields to update in DE locale.
 * @param enFields   Fields to update in EN locale (defaults to deFields).
 *
 * @returns 'patched' | 'not-found'
 */
export async function patchBlockInPage(
  payload: Payload,
  pageSlug: string,
  blockType: string,
  deFields: Record<string, unknown>,
  enFields?: Record<string, unknown>,
): Promise<'patched' | 'not-found'> {
  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: pageSlug } },
    limit: 1,
    overrideAccess: true,
  })

  if (!pageResult.docs.length || !pageResult.docs[0]) {
    throw new Error(`[migration] Page with slug "${pageSlug}" not found.`)
  }
  const page = pageResult.docs[0]
  const pageId = page.id

  const current = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })

  const layout = ((current.layout as BlockLike[]) ?? [])
  const blockIndex = layout.findIndex((b) => b.blockType === blockType)

  if (blockIndex === -1) {
    payload.logger.warn(`  ⚠ Block "${blockType}" not found on "${pageSlug}" — skipped`)
    return 'not-found'
  }

  const updatedLayout = layout.map((b, i) =>
    i === blockIndex ? { ...b, ...deFields } : b
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (payload.update as any)({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    data: { layout: updatedLayout },
    context: CTX,
    overrideAccess: true,
  })

  // Read back to preserve IDs, then apply EN patch
  const afterDE = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })
  const layoutAfter = ((afterDE.layout as BlockLike[]) ?? [])
  const enPatch = enFields ?? deFields
  const updatedLayoutEN = layoutAfter.map((b) =>
    b.blockType === blockType ? { ...b, ...enPatch } : b
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (payload.update as any)({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    data: { layout: updatedLayoutEN },
    context: CTX,
    overrideAccess: true,
  })

  payload.logger.info(`  ✔ Block "${blockType}" patched on page "${pageSlug}"`)
  return 'patched'
}

// ─────────────────────────────────────────────────────────────────────────────
// Products — safe lookup helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find a product by slug. Throws if not found (so the migration fails clearly).
 * Pass `required: false` to return null instead of throwing.
 */
export async function findProductBySlug(
  payload: Payload,
  slug: string,
  required = true,
): Promise<string | null> {
  const result = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (!result.docs.length) {
    if (required) throw new Error(`[migration] Product with slug "${slug}" not found.`)
    return null
  }
  return String(result.docs[0].id)
}
