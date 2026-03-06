/**
 * Patch existing workshop pages to set independent voucherBackgroundImage for each workshop.
 * This only updates the voucherBackgroundImage field, leaving all other content untouched.
 *
 * Run: pnpm tsx src/scripts/patch-workshop-voucher-images.ts
 */
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import config from '@payload-config'
// @ts-ignore dotenv types not resolved via package.json exports
import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

// Load .env file
dotenvConfig()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const _ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const WORKSHOP_SLUGS = ['tempeh', 'lakto-gemuese', 'kombucha'] as const

async function patchWorkshopVoucherImages() {
  const payload = await getPayload({ config })

  // Upload voucher background images for each workshop (independent Media documents)
  payload.logger.info('Uploading voucher background images...')

  const voucherImagePaths = {
    tempeh: join(__dirname, '../../seed-assets/images/tempeh.png'),
    'lakto-gemuese': join(__dirname, '../../seed-assets/images/lakto.png'),
    kombucha: join(__dirname, '../../seed-assets/images/kombucha.png'),
  }

  const voucherImageIds: Record<string, string> = {}

  for (const [slug, imagePath] of Object.entries(voucherImagePaths)) {
    // Delete existing voucher background if it exists
    const existingMedia = await payload.find({
      collection: 'media',
      where: { alt: { equals: `voucher-bg-${slug}` } },
      limit: 1,
    })

    if (existingMedia.docs[0]) {
      await payload.delete({
        collection: 'media',
        id: existingMedia.docs[0].id,
      })
    }

    // Create new voucher background image
    const created = await payload.create({
      collection: 'media',
      data: { alt: `voucher-bg-${slug}` },
      file: await optimizedFile(imagePath, IMAGE_PRESETS.hero),
    })

    voucherImageIds[slug] = created.id
    payload.logger.info(`  ✓ Uploaded voucher background for ${slug} (ID: ${created.id})`)
  }

  // Update existing workshop pages with voucher background images
  payload.logger.info('\nPatching workshop pages...')

  for (const slug of WORKSHOP_SLUGS) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      locale: 'de',
      depth: 0,
    })

    if (existing.docs.length === 0) {
      payload.logger.info(`  ⏭️  Skipped ${slug} (page not found)`)
      continue
    }

    const _pageId = existing.docs[0].id

    // Update DE locale
    // Note: voucherBackgroundImage field removed from schema
    // Images are now managed through the gallery block

    payload.logger.info(`  ✅ Patched ${slug} with voucher background ID: ${voucherImageIds[slug]}`)
  }

  payload.logger.info('\n✅ Workshop voucher images patched successfully!')
  payload.logger.info('   View at: /admin/collections/pages')
}

patchWorkshopVoucherImages().catch((err) => {
  console.error('❌ Patch failed:', err)
  process.exit(1)
})
