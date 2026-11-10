/**
 * Home storytelling pass (2026-11-04):
 *  - Hero: copy about Marcel & David (same photo, same two buttons)
 *  - Showcase slide 1 (Tempeh): light text on a dark shade
 *  - Showcase slide 2 (Workshops): dark text on an ivory shade, "Saisonal" label
 *
 * Run:  npx tsx src/scripts/patch-home-story-flow.ts   (staging DB only, idempotent)
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

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const hero = {
  de: {
    eyebrow: 'Marcel & David · Graz',
    title: 'Wir sind Fermentfreude.',
    titleAccent: 'Fermentation von Hand, mit Geduld.',
    description:
      'Kulinarik trifft Wissenschaft: In unserer Fermentküche in Graz machen wir Käferbohnen-Tempeh und zeigen in Workshops, wie Fermentieren zu Hause gelingt.',
    ctaLabel: 'Workshops entdecken',
    ctaHref: '/workshops',
    secondaryCtaLabel: 'Zum Shop',
    secondaryCtaHref: '/shop',
  },
  en: {
    eyebrow: 'Marcel & David · Graz',
    title: 'We are Fermentfreude.',
    titleAccent: 'Fermentation by hand, with patience.',
    description:
      'Cooking meets science: in our fermentation kitchen in Graz we make runner-bean tempeh and show in our workshops how fermenting at home succeeds.',
    ctaLabel: 'Discover workshops',
    ctaHref: '/workshops',
    secondaryCtaLabel: 'Visit the shop',
    secondaryCtaHref: '/shop',
  },
}

const workshopsSlide = {
  de: {
    text: 'Fermentieren lernen, Schritt für Schritt – in unserer Küche in Graz.',
    buttonLabel: 'Alle Termine & Buchung',
    seasonalLabel: 'Saisonal',
  },
  en: {
    text: 'Learn to ferment, step by step – in our kitchen in Graz.',
    buttonLabel: 'All dates & booking',
    seasonalLabel: 'Seasonal',
  },
}

async function main() {
  const payload = await getPayload({ config })
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
    const h = doc.hero as { cinematicSlides?: Record<string, unknown>[] } & Record<string, unknown>
    const [first, ...rest] = h.cinematicSlides ?? []
    const heroData = first
      ? { ...h, cinematicSlides: [{ ...first, ...hero[locale] }, ...rest] }
      : h
    const layout = (doc.layout ?? []).map((b) => {
      if (b.blockType !== 'productShowcase') return b
      return {
        ...b,
        slides: (b.slides ?? []).map((s, i) =>
          i === 0
            ? { ...s, textTone: 'light' as const, backgroundVeil: 30 }
            : s.slideType === 'workshops'
              ? { ...s, textTone: 'dark' as const, backgroundVeil: 35, ...workshopsSlide[locale] }
              : s,
        ),
      }
    })
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale,
      data: { hero: heroData, layout } as never,
      context: ctx,
    })
    console.log(`✅ ${locale}`)
  }
}

await main()
process.exit(0)
