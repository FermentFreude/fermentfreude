/**
 * Upload FeldInsGlas images + attach hero image to home Special Workshop Banner.
 *
 * Run: pnpm seed special-workshop-banner --force
 * (images are ensured inside this script when run via seed-all key, or: npx tsx …)
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

loadEnv()

async function seedSpecialWorkshopBanner() {
  const { buildSpecialWorkshopBannerDE, buildSpecialWorkshopBannerEN } = await import(
    '@/blocks/SpecialWorkshopBanner/seed'
  )
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')

  type LayoutBlock = {
    id?: string
    blockType?: string
    image?: string
    [key: string]: unknown
  }

  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
  const force = process.argv.includes('--force')
  const payload = await getPayload({ config })

  payload.logger.info('Uploading FeldInsGlas v2 images to Media / R2...')
  const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
  const path = await import('path')

  const FELD_IMAGES = [
    {
      key: 'hero' as const,
      alt: 'feld-ins-glas-hero-v2 – market garden with harvest crate and fermentation jars',
      file: 'seed-assets/images/feld-ins-glas/feld-ins-glas-hero.png',
      preset: IMAGE_PRESETS.hero,
    },
    {
      key: 'hands' as const,
      alt: 'feld-ins-glas-hands-v2 – packing cabbage into a jar outdoors',
      file: 'seed-assets/images/feld-ins-glas/feld-ins-glas-hands.png',
      preset: IMAGE_PRESETS.card,
    },
    {
      key: 'jars' as const,
      alt: 'feld-ins-glas-jars-v2 – flat lay of fermentation jars and garden produce',
      file: 'seed-assets/images/feld-ins-glas/feld-ins-glas-jars.png',
      preset: IMAGE_PRESETS.card,
    },
  ]

  async function findByAlt(altFragment: string) {
    const result = await payload.find({
      collection: 'media',
      where: { alt: { contains: altFragment } },
      limit: 1,
      depth: 0,
    })
    return result.docs[0] ?? null
  }

  const images: { hero: { id: string } | null; hands: { id: string } | null; jars: { id: string } | null } =
    { hero: null, hands: null, jars: null }

  for (const item of FELD_IMAGES) {
    const fragment = item.alt.split(' –')[0]!
    let doc = force ? null : await findByAlt(fragment)
    if (!doc) {
      // Replace previous v2 if forcing
      if (force) {
        const old = await findByAlt(fragment)
        if (old) {
          await payload.delete({
            collection: 'media',
            id: old.id,
            context: { skipAutoTranslate: true, skipRevalidate: true },
          })
        }
      }
      const abs = path.resolve(process.cwd(), item.file)
      doc = await payload.create({
        collection: 'media',
        context: { skipAutoTranslate: true, skipRevalidate: true },
        data: { alt: item.alt },
        file: await optimizedFile(abs, item.preset),
      })
      payload.logger.info(`  ✓ uploaded ${item.key}`)
    } else {
      payload.logger.info(`  · reuse ${item.key}`)
    }
    images[item.key] = doc
  }

  const bannerImageId = images.hero?.id

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })

  if (!existing.docs[0]) {
    payload.logger.error('Home page not found. Run pnpm seed home first.')
    process.exit(1)
  }

  const homeId = existing.docs[0].id
  const layoutDE = (Array.isArray(existing.docs[0].layout) ? existing.docs[0].layout : []) as LayoutBlock[]
  const already = layoutDE.find((b) => b.blockType === 'specialWorkshopBanner')

  if (already && !force && already.image) {
    payload.logger.info(
      'specialWorkshopBanner already on home with image — skipping (use --force to overwrite).',
    )
    process.exit(0)
  }

  const bannerDE = {
    ...buildSpecialWorkshopBannerDE(),
    ...(bannerImageId ? { image: bannerImageId } : {}),
  }

  const nextLayoutDE: LayoutBlock[] = already
    ? layoutDE.map((b) =>
        b.blockType === 'specialWorkshopBanner'
          ? { ...bannerDE, id: b.id }
          : b,
      )
    : (() => {
        const idx = layoutDE.findIndex((b) => b.blockType === 'workshopSlider')
        if (idx >= 0) {
          const copy = [...layoutDE]
          copy.splice(idx + 1, 0, bannerDE)
          return copy
        }
        return [bannerDE, ...layoutDE]
      })()

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    context: ctx,
    data: { layout: nextLayoutDE as never },
  })

  const fresh = await payload.findByID({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    depth: 0,
  })
  const freshLayout = (Array.isArray(fresh.layout) ? fresh.layout : []) as LayoutBlock[]
  const savedBanner = freshLayout.find((b) => b.blockType === 'specialWorkshopBanner')
  if (!savedBanner?.id) {
    payload.logger.error('Banner saved but ID missing.')
    process.exit(1)
  }

  const homeEN = await payload.findByID({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    depth: 0,
  })
  const layoutEN = (Array.isArray(homeEN.layout) ? homeEN.layout : []) as LayoutBlock[]
  const bannerEN = {
    ...buildSpecialWorkshopBannerEN(),
    id: savedBanner.id,
    ...(bannerImageId ? { image: bannerImageId } : {}),
  }

  const nextLayoutEN = layoutEN.some((b) => b.blockType === 'specialWorkshopBanner')
    ? layoutEN.map((b) => (b.blockType === 'specialWorkshopBanner' ? bannerEN : b))
    : freshLayout.map((b) => (b.blockType === 'specialWorkshopBanner' ? bannerEN : b))

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    context: ctx,
    data: { layout: nextLayoutEN as never },
  })

  payload.logger.info('✅ Special workshop banner + images seeded (DE + EN).')
  process.exit(0)
}

seedSpecialWorkshopBanner().catch((err) => {
  console.error(err)
  process.exit(1)
})
