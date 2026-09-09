/**
 * Attach gastronomy page photos in CMS Media (DE + EN).
 * Reuses existing media by filename. Does not change copy.
 *
 * Run: npx tsx src/scripts/patch-gastronomy-images.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

import type { Page } from '@/payload-types'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const db = process.env.DATABASE_URL ?? ''
if (!/staging/i.test(db)) {
  console.error('Refusing to run: DATABASE_URL does not look like staging.')
  process.exit(1)
}

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const SHOP = path.resolve(process.cwd(), 'public/shop')

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const { uploadLocalMedia } = await import('./migrations/_helpers')

type Row = { id?: string; image?: string; title?: string; text?: string }

function withImage(rows: unknown, images: string[]): Row[] {
  const existing = Array.isArray(rows) ? (rows as Row[]) : []
  return images.map((image, i) => {
    const row = existing[i] ?? {}
    return {
      ...(row.id ? { id: row.id } : {}),
      title: row.title,
      text: row.text,
      image,
    }
  })
}

async function setMediaAlts(
  payload: Awaited<ReturnType<typeof getPayload>>,
  id: string,
  de: string,
  en: string,
) {
  await payload.update({
    collection: 'media',
    id,
    locale: 'de',
    data: { alt: de },
    context: ctx,
    overrideAccess: true,
  })
  await payload.update({
    collection: 'media',
    id,
    locale: 'en',
    data: { alt: en },
    context: ctx,
    overrideAccess: true,
  })
}

async function patch() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 0,
  })
  const page = result.docs[0]
  if (!page) {
    payload.logger.error('Gastronomy page not found')
    process.exit(1)
  }

  const heroId = await uploadLocalMedia(
    payload,
    path.join(SHOP, 'hero-kaefer-plate.webp'),
    'Gebratener Käferbohnen-Tempeh',
    'hero',
  )
  const slideIds = [
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer-plate.webp'), 'Tempeh als Hauptkomponente', 'hero'),
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer-alt.webp'), 'Tempeh Burger', 'hero'),
    await uploadLocalMedia(payload, path.join(SHOP, 'berglinsen-plated.webp'), 'Tempeh Bowl', 'card'),
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer-left.webp'), 'Tempeh Salat', 'hero'),
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer.webp'), 'Österreichischer Klassiker', 'hero'),
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer-v3.webp'), 'Gebratener Tempeh', 'hero'),
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'automaten-loc-david-kaefer.webp'),
      'Tempeh als Beilage',
      'card',
    ),
  ]
  const audienceIds = [
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'gastronomy-audience-restaurants.webp'),
      'Restaurantküche',
      'card',
    ),
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'gastronomy-audience-hotels.webp'),
      'Hotelküche',
      'card',
    ),
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'gastronomy-audience-catering.webp'),
      'Catering',
      'card',
    ),
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'gastronomy-audience-feinkost-plain.webp'),
      'Feinkosttheke',
      'card',
    ),
  ]
  const productId = await uploadLocalMedia(
    payload,
    path.join(SHOP, 'kaefer-packaging.webp'),
    'Käferbohnen-Tempeh Verpackung',
    'card',
  )
  const proofId = await uploadLocalMedia(
    payload,
    path.join(SHOP, 'hero-kaefer-v3.webp'),
    'Käferbohnen-Tempeh',
    'hero',
  )

  const alts: Array<[string, string, string]> = [
    [heroId, 'Gebratener Käferbohnen-Tempeh', 'Pan-fried runner bean tempeh'],
    [slideIds[1]!, 'Tempeh Burger', 'Tempeh burger'],
    [slideIds[2]!, 'Tempeh Bowl', 'Tempeh bowl'],
    [slideIds[3]!, 'Tempeh Salat', 'Tempeh salad'],
    [slideIds[4]!, 'Österreichischer Klassiker', 'Austrian classic'],
    [slideIds[5]!, 'Gebratener Tempeh', 'Pan-fried tempeh'],
    [slideIds[6]!, 'Tempeh als Beilage', 'Tempeh as a side'],
    [audienceIds[0]!, 'Restaurantküche', 'Restaurant kitchen'],
    [audienceIds[1]!, 'Hotelküche', 'Hotel kitchen'],
    [audienceIds[2]!, 'Catering', 'Catering'],
    [audienceIds[3]!, 'Feinkosttheke', 'Delicatessen counter'],
    [productId, 'Käferbohnen-Tempeh Verpackung', 'Runner bean tempeh packaging'],
  ]
  const seen = new Set<string>()
  for (const [id, de, en] of alts) {
    if (seen.has(id)) continue
    seen.add(id)
    await setMediaAlts(payload, id, de, en)
  }

  const deDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    fallbackLocale: false,
    depth: 0,
  })
  const gDe = (deDoc.gastronomy ?? {}) as Record<string, unknown>

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    context: ctx,
    data: {
      gastronomy: {
        ...gDe,
        gastronomyHeroImage: heroId,
        gastronomyProductImage: productId,
        gastronomyProofImage: proofId,
        gastronomyUsageBanners: withImage(gDe.gastronomyUsageBanners, slideIds),
        gastronomyAudienceCards: withImage(gDe.gastronomyAudienceCards, audienceIds),
      } as Page['gastronomy'],
    },
  })

  const enDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })
  const gEn = (enDoc.gastronomy ?? {}) as Record<string, unknown>

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    context: ctx,
    data: {
      gastronomy: {
        ...gEn,
        gastronomyHeroImage: heroId,
        gastronomyProductImage: productId,
        gastronomyProofImage: proofId,
        gastronomyUsageBanners: withImage(gEn.gastronomyUsageBanners, slideIds),
        gastronomyAudienceCards: withImage(gEn.gastronomyAudienceCards, audienceIds),
      } as Page['gastronomy'],
    },
  })

  payload.logger.info('Gastronomy images synced to CMS Media (DE + EN).')
  process.exit(0)
}

patch().catch((err) => {
  console.error(err)
  process.exit(1)
})
