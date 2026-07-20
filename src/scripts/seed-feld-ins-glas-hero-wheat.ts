/**
 * Upload Figma-style wheat hero for Vom Feld ins Glas.
 * Run: npx tsx src/scripts/seed-feld-ins-glas-hero-wheat.ts
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

loadEnv()

import { IMAGE_PRESETS, optimizedFile } from '@/scripts/seed-image-utils'
import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

const ALT = 'feld-ins-glas-hero-wheat – golden wheat field close-up for Marktgarten hero'
const FILE = 'seed-assets/images/feld-ins-glas/feld-ins-glas-hero-wheat.jpg'

async function main() {
  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { contains: 'feld-ins-glas-hero-wheat' } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs[0] && !process.argv.includes('--force')) {
    payload.logger.info('Wheat hero already exists — reuse. Pass --force to re-upload.')
    process.exit(0)
  }

  if (existing.docs[0] && process.argv.includes('--force')) {
    await payload.delete({ collection: 'media', id: existing.docs[0].id })
  }

  const abs = path.resolve(process.cwd(), FILE)
  const doc = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: ALT },
    file: await optimizedFile(abs, IMAGE_PRESETS.hero),
  })

  payload.logger.info(`✓ Wheat hero uploaded: ${doc.id}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
