/**
 * Home: Product Showcase reduced to two slides — Käferbohnen-Tempeh + a
 * "Workshops" slide that leads to /workshops — and the scrolling workshop
 * calendar (workshopSlider block) removed from the Home layout.
 *
 * Run:  npx tsx src/scripts/patch-home-showcase-workshops.ts
 * Staging DB only — refuses to run against anything else. Idempotent.
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

const workshops = {
  de: {
    bigWord: 'Workshops',
    label: 'Workshops',
    text: 'Fermentieren lernen, Schritt für Schritt – in unseren Workshops in Graz.',
    buttonLabel: 'Alle Workshops',
  },
  en: {
    bigWord: 'Workshops',
    label: 'Workshops',
    text: 'Learn to ferment, step by step – in our workshops in Graz.',
    buttonLabel: 'All workshops',
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

  // DE first, then EN with the same row IDs. Sequential writes only.
  for (const locale of ['de', 'en'] as const) {
    const doc = await payload.findByID({ collection: 'pages', id: home.id, locale, depth: 0 })
    const layout = (doc.layout ?? [])
      .filter((b) => b.blockType !== 'workshopSlider')
      .map((b) => {
        if (b.blockType !== 'productShowcase') return b
        const [first, second] = b.slides ?? []
        if (!first) return b
        const w = workshops[locale]
        return {
          ...b,
          slides: [
            { ...first, slideType: 'product' as const },
            {
              id: second?.id,
              slideType: 'workshops' as const,
              linkUrl: '/workshops',
              eyebrow: '',
              accentColor: null,
              product: null,
              productImage: null,
              ingredientsImage: null,
              ...w,
            },
          ],
        }
      })

    await payload.update({
      collection: 'pages',
      id: home.id,
      locale,
      data: { layout } as never,
      context: ctx,
    })
    console.log(`✅ ${locale}: ${layout.length} blocks`)
  }
}

await main()
process.exit(0)
