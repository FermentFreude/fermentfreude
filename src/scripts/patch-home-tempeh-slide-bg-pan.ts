/**
 * Home showcase, Tempeh slide: background → the tempeh-in-the-pan photo
 * (home-showcase-bg-workshops-pan.webp, uploaded by patch-home-workshops-slide-bg.ts).
 * Rafaela, 2026-11-04: "use the image I'm using on Workshops on Tempeh". The
 * Workshops slide gets its own new photo separately.
 *
 * Run:  npx tsx src/scripts/patch-home-tempeh-slide-bg-pan.ts   (staging DB only)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
  console.error('🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.')
  process.exit(1)
}

const FILENAME = 'home-showcase-bg-workshops-pan.webp'

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })
  const media = await payload.find({
    collection: 'media',
    where: { filename: { equals: FILENAME } },
    limit: 1,
    depth: 0,
  })
  const imageId = media.docs[0]?.id
  if (!imageId) throw new Error(`Media not found: ${FILENAME}`)

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
      if (b.blockType !== 'productShowcase') return b
      return {
        ...b,
        slides: (b.slides ?? []).map((s) => {
          if (s.slideType === 'workshops') return s
          console.log(`${locale}: Tempeh background`, s.backgroundImage, '→', imageId)
          return { ...s, backgroundImage: imageId }
        }),
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
