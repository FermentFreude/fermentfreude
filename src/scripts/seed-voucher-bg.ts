/**
 * Patch script — sets the VoucherCta background image on the home page.
 *
 * Surgical update: uploads one image, then sets ONLY the backgroundImage field
 * on the voucherCta block for both DE and EN locales. All other fields are untouched.
 *
 * Run: pnpm seed voucher-bg
 */

import config from '@payload-config'
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import type { Page } from '@/payload-types'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

loadEnv()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type LayoutBlock = { blockType: string; id?: string; [key: string]: unknown }

async function seedVoucherBg() {
  const payload = await getPayload({ config })
  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')
  const imagePath = path.join(
    imagesDir,
    'close-up-photo-of-friends-clinking-glasses-having-2026-01-08-05-28-45-utc.jpg',
  )

  // ── 1. Upload the image (replace any previous version) ──────────────────
  const existingMedia = await payload.find({
    collection: 'media',
    where: { alt: { equals: 'voucher-bg – friends clinking kombucha glasses' } },
    limit: 1,
    depth: 0,
  })
  if (existingMedia.docs.length > 0) {
    await payload.delete({ collection: 'media', id: existingMedia.docs[0]!.id })
    payload.logger.info('🗑️  Removed previous voucher-bg media entry')
  }

  const mediaDoc = await payload.create({
    collection: 'media',
    data: { alt: 'voucher-bg – friends clinking kombucha glasses' },
    file: await optimizedFile(imagePath, IMAGE_PRESETS.hero),
    context: ctx,
  })
  payload.logger.info('🖼️  Uploaded voucher background image → %s', mediaDoc.id)

  // ── 2. Find the home page ────────────────────────────────────────────────
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })

  if (result.docs.length === 0) {
    payload.logger.error('❌  Home page not found. Seed the home page first.')
    process.exit(1)
  }

  const page = result.docs[0] as Page
  const layout = Array.isArray(page.layout) ? (page.layout as LayoutBlock[]) : []

  const vcBlock = layout.find((b) => b.blockType === 'voucherCta') as LayoutBlock | undefined

  if (!vcBlock?.id) {
    payload.logger.error('❌  voucherCta block not found on home page layout.')
    process.exit(1)
  }

  payload.logger.info('✅  Found voucherCta block (id: %s)', vcBlock.id)

  // ── 3. Patch DE — only the backgroundImage field ─────────────────────────
  // Payload does not support block-level partial updates via Local API directly,
  // so we read the full layout, swap only our field, and save.
  const deDoc = await payload.findByID({ collection: 'pages', id: page.id, locale: 'de', depth: 0 })
  const deLayout = (Array.isArray(deDoc.layout) ? (deDoc.layout as LayoutBlock[]) : []).map((b) =>
    b.id === vcBlock.id ? { ...b, backgroundImage: mediaDoc.id } : b,
  )

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { layout: deLayout as any },
    context: ctx,
  })
  payload.logger.info('💾  DE — backgroundImage set on voucherCta block')

  // ── 4. Patch EN ──────────────────────────────────────────────────────────
  const enDoc = await payload.findByID({ collection: 'pages', id: page.id, locale: 'en', depth: 0 })
  const enLayout = (Array.isArray(enDoc.layout) ? (enDoc.layout as LayoutBlock[]) : []).map((b) =>
    b.id === vcBlock.id ? { ...b, backgroundImage: mediaDoc.id } : b,
  )

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { layout: enLayout as any },
    context: ctx,
  })
  payload.logger.info('💾  EN — backgroundImage set on voucherCta block')

  payload.logger.info('🎉  Done — VoucherCta background image patched successfully.')
  process.exit(0)
}

seedVoucherBg().catch((err) => {
  console.error(err)
  process.exit(1)
})
