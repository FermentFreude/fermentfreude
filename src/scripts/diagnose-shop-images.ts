/**
 * Force-fix Berglinsen (+ Käfer packaging) galleries and verify R2 URLs.
 * Run: pnpm exec tsx src/scripts/diagnose-shop-images.ts
 */
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import fs from 'fs'
import path from 'path'
import config from '@payload-config'
import { getPayload } from 'payload'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'
import { CTX, findProductBySlug } from './migrations/_helpers'

const ROOT = process.cwd()

async function upload(
  payload: Awaited<ReturnType<typeof getPayload>>,
  localPath: string,
  filename: string,
  altDe: string,
  altEn: string,
) {
  const abs = path.resolve(ROOT, localPath)
  if (!fs.existsSync(abs)) throw new Error(`Missing file: ${abs}`)
  const file = await optimizedFile(abs, IMAGE_PRESETS.card)
  file.name = filename

  const media = await payload.create({
    collection: 'media',
    locale: 'de',
    data: { alt: altDe },
    file,
    context: CTX,
    overrideAccess: true,
  })
  await payload.update({
    collection: 'media',
    id: media.id,
    locale: 'en',
    data: { alt: altEn },
    context: CTX,
    overrideAccess: true,
  })

  const url = (media as { url?: string }).url
  payload.logger.info(`  uploaded ${filename} → ${url}`)
  return { id: String(media.id), url }
}

async function main() {
  const payload = await getPayload({ config })
  const stamp = Date.now()

  const bergSrc = fs.existsSync(
    path.resolve(ROOT, 'tmp/tempeh-drive/Kopie von Ferment_KLZ-6872.jpg'),
  )
    ? 'tmp/tempeh-drive/Kopie von Ferment_KLZ-6872.jpg'
    : 'public/shop/berglinsen-plated.webp'

  const berg = await upload(
    payload,
    bergSrc,
    `berglinsen-shop-${stamp}.webp`,
    'Berglinsen-Tempeh, angerichtet',
    'Mountain lentil tempeh, plated',
  )

  const bergId = await findProductBySlug(payload, 'berglinsen-tempeh', true)
  if (!bergId) throw new Error('berglinsen-tempeh product missing')

  await payload.update({
    collection: 'products',
    id: bergId,
    data: {
      gallery: [{ image: berg.id }],
      shortDescription:
        'Tempeh aus österreichischen Berglinsen — nussig, proteinreich, handgemacht.',
    } as never,
    context: CTX,
    overrideAccess: true,
  })
  await payload.update({
    collection: 'products',
    id: bergId,
    locale: 'en',
    data: {
      shortDescription:
        'Tempeh from Austrian mountain lentils — nutty, protein-rich, handmade.',
    } as never,
    context: CTX,
    overrideAccess: true,
  })

  // Verify R2
  if (berg.url) {
    const res = await fetch(berg.url, { method: 'HEAD' })
    payload.logger.info(`  HEAD ${berg.url} → ${res.status}`)
    if (!res.ok) {
      throw new Error(`Berglinsen upload not publicly reachable (${res.status})`)
    }
  }

  payload.logger.info('✅ Berglinsen gallery fixed. Hard-refresh /shop')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
