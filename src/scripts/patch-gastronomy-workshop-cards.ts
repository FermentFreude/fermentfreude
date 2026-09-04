/**
 * One-off patch: Kombucha hero image + 4 workshop cards on /gastronomy (DE + EN).
 *
 * 1. Uploads seed-assets/images/workshops/kombucha-workshop-hero.png → Kombucha page hero
 * 2. Updates gastronomy page with all 4 workshop cards (hero images from workshop pages)
 *
 * Run: npx tsx src/scripts/patch-gastronomy-workshop-cards.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { getWorkshopHeroImageIdsByHref } = await import('@/utilities/workshopHeroImages')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function patch() {
  const payload = await getPayload({ config })

  // ── 1. Upload Kombucha hero ─────────────────────────────────────────────
  const kombuchaImagePath = path.resolve(
    process.cwd(),
    'seed-assets/images/workshops/kombucha-workshop-hero.png',
  )
  let kombuchaHeroId: string | null = null

  try {
    const file = await optimizedFile(kombuchaImagePath, IMAGE_PRESETS.card)
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Kombucha workshop – tasting and brewing at the table',
      },
      file,
      context: { skipAutoTranslate: true },
    })
    kombuchaHeroId = media.id
    payload.logger.info(`✓ Uploaded Kombucha hero: ${kombuchaHeroId}`)
  } catch (err) {
    payload.logger.error(`Failed to upload Kombucha hero from ${kombuchaImagePath}`)
    throw err
  }

  const kombuchaPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'kombucha' } },
    limit: 1,
    depth: 0,
  })

  if (kombuchaPage.docs[0]) {
    const page = kombuchaPage.docs[0]
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        workshopDetail: {
          ...(typeof page.workshopDetail === 'object' && page.workshopDetail ? page.workshopDetail : {}),
          heroImage: kombuchaHeroId,
        },
      },
      context: ctx,
    })
    payload.logger.info('✓ Set Kombucha page workshopDetail.heroImage')
  } else {
    payload.logger.warn('Kombucha page not found — hero uploaded to Media only')
  }

  // ── 2. Update gastronomy workshop cards (4 workshops) ───────────────────
  const workshopHeroIds = await getWorkshopHeroImageIdsByHref(payload)
  if (kombuchaHeroId) {
    workshopHeroIds['/workshops/kombucha'] = kombuchaHeroId
  }

  const gastronomyPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })

  if (!gastronomyPage.docs[0]) {
    payload.logger.error('Gastronomy page not found — run seed-gastronomy.ts first')
    process.exit(1)
  }

  const pageId = gastronomyPage.docs[0].id

  const workshopCardsDE = [
    {
      image: workshopHeroIds['/workshops/lakto-gemuese'] ?? null,
      title: 'Lakto-Gemüse',
      description:
        'Gemüse fermentieren, Aromen erleben – jeden Monat anders. Live online Session.',
      price: '€99',
      priceSuffix: 'pro Person',
      buttonLabel: 'Mehr Infos & Buchen',
      buttonUrl: '/workshops/lakto-gemuese',
    },
    {
      image: workshopHeroIds['/workshops/kombucha'] ?? null,
      title: 'Kombucha',
      description: 'Lernen Sie, zu Hause köstlichen und gesunden Kombucha zu brauen.',
      price: '€99',
      priceSuffix: 'pro Person',
      buttonLabel: 'Mehr Infos & Buchen',
      buttonUrl: '/workshops/kombucha',
    },
    {
      image: workshopHeroIds['/workshops/tempeh'] ?? null,
      title: 'Tempeh',
      description:
        'Entdecken Sie die Vielseitigkeit von Tempeh und wie Sie es in Ihre Küche integrieren.',
      price: '€99',
      priceSuffix: 'pro Person',
      buttonLabel: 'Mehr Infos & Buchen',
      buttonUrl: '/workshops/tempeh',
    },
    {
      image: workshopHeroIds['/workshops/vom-feld-ins-glas'] ?? null,
      title: 'Vom Feld ins Glas',
      description:
        'Fermentation beginnt am Feld. Ernte, Handwerk und drei Lakto-Fermente im Marktgarten „Unser Bauerngarten“.',
      price: '€99',
      priceSuffix: 'pro Person',
      buttonLabel: 'Mehr Infos & Buchen',
      buttonUrl: '/workshops/vom-feld-ins-glas',
    },
  ]

  const pageDE = (await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
  })) as { gastronomy?: Record<string, unknown> }

  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    context: ctx,
    data: {
      gastronomy: {
        ...(pageDE.gastronomy ?? {}),
        gastronomyWorkshopCards: workshopCardsDE,
      },
    },
  })

  const savedDE = (await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
  })) as { gastronomy?: { gastronomyWorkshopCards?: Array<{ id?: string }> } }

  const cardIds = (savedDE.gastronomy?.gastronomyWorkshopCards ?? []).map((c) => c.id)

  const workshopCardsEN = [
    {
      id: cardIds[0],
      image: workshopHeroIds['/workshops/lakto-gemuese'] ?? null,
      title: 'Lakto-Gemüse',
      description:
        'Ferment vegetables, experience aromas – different every month. Live online session.',
      price: '€99',
      priceSuffix: 'per Person',
      buttonLabel: 'More Info & Book',
      buttonUrl: '/workshops/lakto-gemuese',
    },
    {
      id: cardIds[1],
      image: workshopHeroIds['/workshops/kombucha'] ?? null,
      title: 'Kombucha',
      description: 'Learn to brew delicious and healthy kombucha at home.',
      price: '€99',
      priceSuffix: 'per Person',
      buttonLabel: 'More Info & Book',
      buttonUrl: '/workshops/kombucha',
    },
    {
      id: cardIds[2],
      image: workshopHeroIds['/workshops/tempeh'] ?? null,
      title: 'Tempeh',
      description:
        'Discover the versatility of tempeh and how to incorporate it into your cooking.',
      price: '€99',
      priceSuffix: 'per Person',
      buttonLabel: 'More Info & Book',
      buttonUrl: '/workshops/tempeh',
    },
    {
      id: cardIds[3],
      image: workshopHeroIds['/workshops/vom-feld-ins-glas'] ?? null,
      title: 'Vom Feld ins Glas',
      description:
        'Fermentation starts in the field. Harvest, craft, and three lacto-ferments at the “Unser Bauerngarten” market garden.',
      price: '€99',
      priceSuffix: 'per Person',
      buttonLabel: 'More Info & Book',
      buttonUrl: '/workshops/vom-feld-ins-glas',
    },
  ]

  const pageEN = (await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    depth: 0,
  })) as { gastronomy?: Record<string, unknown> }

  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    context: ctx,
    data: {
      gastronomy: {
        ...(pageEN.gastronomy ?? {}),
        gastronomyWorkshopCards: workshopCardsEN,
      },
    },
  })

  const heroCount = Object.values(workshopHeroIds).filter(Boolean).length
  payload.logger.info(
    `✅ Gastronomy workshop cards patched — 4 cards (DE + EN), ${heroCount} hero images linked`,
  )
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
