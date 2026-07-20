/**
 * Upload Feld section image (tomato harvest) for Vom Feld ins Glas.
 * Run: npx tsx src/scripts/seed-feld-ins-glas-feld-image.ts [--force]
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

loadEnv()

import { IMAGE_PRESETS, optimizedFile } from '@/scripts/seed-image-utils'
import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

const ALT =
  'feld-ins-glas-feld – tomato harvest basket in the market garden for Feld section'
const FILE = 'seed-assets/images/feld-ins-glas/feld-ins-glas-feld.jpg'

async function main() {
  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { contains: 'feld-ins-glas-feld' } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs[0] && !process.argv.includes('--force')) {
    payload.logger.info('Feld image already exists — reuse. Pass --force to re-upload.')
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
    file: await optimizedFile(abs, IMAGE_PRESETS.card),
  })

  payload.logger.info(`✓ Feld image uploaded: ${doc.id}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
