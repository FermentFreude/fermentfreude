/**
 * Home, gift (Gutschein) slide: Rafaela's photo of friends clinking glasses
 * (kombucha-coloured drinks) as the full background, like the Tempeh slide
 * (dark shade, big "GUTSCHEIN" word, light text). Uploads a NEW media doc
 * (HEAD-checked); the GUTSCHEIN illustration stays in the library.
 *
 * Run:  npx tsx src/scripts/patch-home-voucher-slide-photo.ts   (staging DB only)
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

const IMAGE = {
  file: path.join(
    os.homedir(),
    'Downloads',
    'close-up-photo-of-friends-clinking-glasses-having-2026-01-08-05-28-45-utc.jpg',
  ),
  name: 'home-gift-slide-cheers.webp',
  altDe: 'Freunde stoßen an einem Holztisch mit Gläsern voller Kombucha und Limonade an',
  altEn: 'Friends clinking glasses of kombucha and lemonade at a wooden table',
}

const BIG_WORD = { de: 'GUTSCHEIN', en: 'VOUCHER' }

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })

  let imageId: string
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: IMAGE.altDe } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })
  if (existing.docs[0]) {
    imageId = existing.docs[0].id
    console.log('Photo already uploaded:', imageId)
  } else {
    const file = await optimizedFile(IMAGE.file, IMAGE_PRESETS.hero)
    const doc = await payload.create({
      collection: 'media',
      locale: 'de',
      context: ctx,
      data: { alt: IMAGE.altDe },
      file: { ...file, name: IMAGE.name },
    })
    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'en',
      data: { alt: IMAGE.altEn },
      context: ctx,
    })
    // Don't trust the exit code: check the file is really being served
    const url = (doc as { url?: string }).url
    if (url) {
      const res = await fetch(url, { method: 'HEAD' })
      console.log(`${IMAGE.name}: HEAD ${res.status}`)
      if (!res.ok) throw new Error(`Upload not reachable: ${url}`)
    }
    imageId = doc.id
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
    const layout = (doc.layout ?? []).map((b) => {
      if (b.blockType !== 'voucherCta') return b
      console.log(`${locale}: gift picture`, b.giftSlide?.backgroundImage, '→', imageId)
      return {
        ...b,
        giftSlide: {
          ...b.giftSlide,
          backgroundImage: imageId,
          pictureLayout: 'background',
          bigWord: BIG_WORD[locale],
        },
      }
    })
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
