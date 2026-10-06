/**
 * Seed the "Cinematic Slider" hero (heroCinematic) with the new dark founders photo.
 *
 * DEFAULT: writes to a throwaway page `hero-preview` (visit /hero-preview) so the
 * live home page is never touched while testing.
 * `--home`: switches the HOME page's hero to the cinematic slider. The old
 * heroSlides data is left in the document, so switching back in /admin
 * (Hero Style → Home Page Slider) restores the previous hero.
 *
 * Run:  npx tsx src/scripts/patch-home-hero-cinematic.ts          (preview page)
 *       npx tsx src/scripts/patch-home-hero-cinematic.ts --home   (home page)
 *
 * Image source (gitignored, local only): seed-assets/media/hero/hero-cinematic-1.jpg
 * Staging DB only — refuses to run against anything else.
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

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const IMAGE_PATH = path.resolve(process.cwd(), 'seed-assets/media/hero/hero-cinematic-1.jpg')
const IMAGE_ALT_DE =
  'Zwei lächelnde Männer in dunkler Kleidung an einem Holztisch, hinter ihnen Regale mit Fermentiergläsern'
const IMAGE_ALT_EN =
  'Two smiling men in dark clothing at a wooden table, shelves of fermentation jars behind them'

const TARGET_HOME = process.argv.includes('--home')
const SLUG = TARGET_HOME ? 'home' : 'hero-preview'

const copy = {
  de: {
    eyebrow: 'Fermentation Studio · Graz',
    title: 'Fermentation,\nmit Hand gemacht.',
    titleAccent: 'Lebendig im Geschmack.',
    description:
      'Workshops, Ferments und Wissen aus unserem Studio in Graz — natürlich, probiotisch und mit Geduld gemacht.',
    ctaLabel: 'Workshops entdecken',
    secondaryCtaLabel: 'Zum Shop',
  },
  en: {
    eyebrow: 'Fermentation Studio · Graz',
    title: 'Fermentation,\nmade by hand.',
    titleAccent: 'Alive with flavour.',
    description:
      'Workshops, ferments and know-how from our studio in Graz — natural, probiotic and made with patience.',
    ctaLabel: 'Discover workshops',
    secondaryCtaLabel: 'Visit the shop',
  },
}

async function main() {
  const payload = await getPayload({ config })

  // 1. Image → Media (→ R2). Reuse if this script already uploaded it.
  const existingMedia = await payload.find({
    collection: 'media',
    where: { alt: { equals: IMAGE_ALT_DE } },
    limit: 1,
    depth: 0,
  })
  const media =
    existingMedia.docs[0] ??
    (await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: IMAGE_ALT_DE },
      file: await optimizedFile(IMAGE_PATH, IMAGE_PRESETS.hero),
    }))
  // English alt text on the same media doc
  await payload.update({
    collection: 'media',
    id: media.id,
    locale: 'en',
    data: { alt: IMAGE_ALT_EN },
    context: ctx,
  })

  // 2. Find or create the target page
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: SLUG } },
    limit: 1,
    depth: 0,
  })
  let pageId = found.docs[0]?.id
  if (!pageId && TARGET_HOME) throw new Error('Home page not found — run `pnpm seed home` first.')
  if (!pageId) {
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      context: ctx,
      data: {
        title: 'Hero Preview',
        slug: SLUG,
        _status: 'published',
        hero: { type: 'heroCinematic' },
        layout: [],
      },
    })
    pageId = created.id
  }

  // `title` is localized + required — the preview page needs it in both locales
  const previewTitle = TARGET_HOME ? {} : { title: 'Hero Preview' }

  const buildSlide = (c: (typeof copy)['de'], id?: string) => ({
    ...(id ? { id } : {}),
    image: media.id,
    ...c,
    ctaHref: '/workshops',
    secondaryCtaHref: '/shop',
  })

  // 3. DE first → read back generated IDs → EN with the same IDs
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    context: ctx,
    data: {
      ...previewTitle,
      hero: { type: 'heroCinematic', cinematicSlides: [buildSlide(copy.de)] },
    },
  })
  const saved = await payload.findByID({ collection: 'pages', id: pageId, locale: 'de', depth: 0 })
  const slideId = saved.hero?.cinematicSlides?.[0]?.id
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    context: ctx,
    data: {
      ...previewTitle,
      hero: { type: 'heroCinematic', cinematicSlides: [buildSlide(copy.en, slideId ?? undefined)] },
    },
  })

  payload.logger.info(
    `✓ Cinematic hero seeded (DE + EN) on "${SLUG}" → http://localhost:3000/${TARGET_HOME ? '' : SLUG}`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err?.message ?? err, JSON.stringify(err?.data?.errors ?? err?.cause?.errors ?? [], null, 2))
  process.exit(1)
})
