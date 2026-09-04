/**
 * Set Vom Feld ins Glas Workshop Slider primary image (garden signpost).
 * Also updates workshop page heroImage for card sync.
 *
 * Run: npx tsx src/scripts/patch-feld-ins-glas-slider-image.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const FELD_HREF = '/workshops/vom-feld-ins-glas'
const SLUG = 'vom-feld-ins-glas'
const ALT =
  'feld-ins-glas-slider-primary – Biohof Ernteschwung garden signpost for Workshop Slider'
const SOURCE = path.resolve(
  process.cwd(),
  'seed-assets/images/feld-ins-glas/feld-ins-glas-garden-signpost.png',
)

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

type WorkshopRow = {
  id?: string
  ctaLink?: string | null
  image?: string | null
  [key: string]: unknown
}

async function uploadImage(payload: Awaited<ReturnType<typeof getPayload>>) {
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: ALT } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs[0]) {
    payload.logger.info(`Reusing media ${existing.docs[0].id}`)
    const file = await optimizedFile(SOURCE, IMAGE_PRESETS.hero)
    await payload.update({
      collection: 'media',
      id: existing.docs[0].id,
      data: { alt: ALT },
      file,
      context: ctx,
    })
    return existing.docs[0].id as string
  }

  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Missing source image: ${SOURCE}`)
  }

  const file = await optimizedFile(SOURCE, IMAGE_PRESETS.hero)
  const media = await payload.create({
    collection: 'media',
    data: { alt: ALT },
    file,
    context: { skipAutoTranslate: true },
  })

  return media.id
}

function patchWorkshops(workshops: WorkshopRow[] | null | undefined, mediaId: string) {
  if (!workshops?.length) return { changed: false, workshops: workshops ?? [] }

  let changed = false
  const next = workshops.map((w) => {
    if (w.ctaLink?.includes(SLUG)) {
      changed = true
      return { ...w, image: mediaId }
    }
    return w
  })

  return { changed, workshops: next }
}

async function patchGlobal(
  payload: Awaited<ReturnType<typeof getPayload>>,
  mediaId: string,
  locale: 'de' | 'en',
) {
  const global = await payload.findGlobal({
    slug: 'workshop-slider-global',
    locale,
    depth: 0,
  })

  const workshops = (global.workshops ?? []) as WorkshopRow[]
  const { changed, workshops: patched } = patchWorkshops(workshops, mediaId)

  if (changed) {
    await payload.updateGlobal({
      slug: 'workshop-slider-global',
      locale,
      data: { workshops: patched },
      context: ctx,
    })
    payload.logger.info(`✓ workshop-slider-global (${locale}) primary image updated`)
    return
  }

  const jars = await payload.find({
    collection: 'media',
    where: { alt: { contains: 'feld-ins-glas-jars-v2' } },
    limit: 1,
    depth: 0,
  })
  const image2Id = jars.docs[0]?.id ?? null

  const feldCardDE = {
    title: locale === 'en' ? 'From Field to Jar' : 'Vom Feld ins Glas',
    audienceTag: locale === 'en' ? 'Market Garden Edition' : 'Marktgarten Edition',
    theme: 'light' as const,
    description:
      locale === 'en'
        ? 'Harvest in the field, fermentation in practice, three jars to take home — at the market garden “Unser Bauerngarten”.'
        : 'Ernte am Feld, Fermentation in der Praxis, drei Gläser zum Mitnehmen — im Marktgarten „Unser Bauerngarten“.',
    features:
      locale === 'en'
        ? [
            { text: 'Duration: approx. 4 hours' },
            { text: 'Not in the studio — outdoors at the market garden' },
            { text: 'Three ferments incl. jars to take home' },
            { text: 'For everyone — from beginner to pro' },
          ]
        : [
            { text: 'Dauer: ca. 4 Stunden' },
            { text: 'Nicht im Studio — draußen im Marktgarten' },
            { text: 'Drei Fermente inkl. Gläser zum Mitnehmen' },
            { text: 'Für alle — vom Anfänger bis zum Profi' },
          ],
    image: mediaId,
    ...(image2Id ? { image2: image2Id } : {}),
    ctaLink: FELD_HREF,
    detailsButtonLabel: locale === 'en' ? 'Workshop Details' : 'Zum Workshop',
  }

  await payload.updateGlobal({
    slug: 'workshop-slider-global',
    locale,
    data: {
      workshops: [...workshops, feldCardDE],
    },
    context: ctx,
  })

  payload.logger.info(`✓ workshop-slider-global (${locale}) — added Vom Feld ins Glas slide`)
}

async function patchHomeLayout(
  payload: Awaited<ReturnType<typeof getPayload>>,
  mediaId: string,
  locale: 'de' | 'en',
) {
  const home = (
    await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      limit: 1,
      locale,
      depth: 0,
    })
  ).docs[0]

  if (!home?.layout || !Array.isArray(home.layout)) return

  let changed = false
  const layout = home.layout.map((block) => {
    if (
      typeof block !== 'object' ||
      block === null ||
      !('blockType' in block) ||
      block.blockType !== 'workshopSlider'
    ) {
      return block
    }

    const { changed: rowChanged, workshops } = patchWorkshops(
      (block as { workshops?: WorkshopRow[] }).workshops,
      mediaId,
    )

    if (!rowChanged) return block
    changed = true
    return { ...block, workshops }
  })

  if (!changed) return

  await payload.update({
    collection: 'pages',
    id: home.id,
    locale,
    data: { layout },
    context: ctx,
  })

  payload.logger.info(`✓ home page workshopSlider (${locale}) primary image updated`)
}

async function patchWorkshopPageHero(
  payload: Awaited<ReturnType<typeof getPayload>>,
  mediaId: string,
) {
  const page = (
    await payload.find({
      collection: 'pages',
      where: { slug: { equals: SLUG } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (!page) {
    payload.logger.warn(`Page "${SLUG}" not found`)
    return
  }

  for (const locale of ['de', 'en'] as const) {
    const doc = await payload.findByID({
      collection: 'pages',
      id: page.id,
      locale,
      fallbackLocale: false,
      depth: 0,
    })

    await payload.update({
      collection: 'pages',
      id: page.id,
      locale,
      data: {
        workshopDetail: {
          ...(typeof doc.workshopDetail === 'object' && doc.workshopDetail ? doc.workshopDetail : {}),
          heroImage: mediaId,
        },
      },
      context: ctx,
    })
  }

  payload.logger.info(`✓ ${SLUG} workshopDetail.heroImage updated (DE + EN)`)
}

async function patch() {
  const payload = await getPayload({ config })
  const mediaId = await uploadImage(payload)
  payload.logger.info(`Using media ${mediaId}`)

  await patchGlobal(payload, mediaId, 'de')
  await patchGlobal(payload, mediaId, 'en')
  await patchHomeLayout(payload, mediaId, 'de')
  await patchHomeLayout(payload, mediaId, 'en')
  await patchWorkshopPageHero(payload, mediaId)

  payload.logger.info('✅ Vom Feld ins Glas slider image patched')
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
