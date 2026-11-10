/**
 * Home: set the icons of the points rows that had none yet — the Tempeh slide
 * (bean / flexed arm / vegan leaf) and the chefs banner (chef hat / graduation
 * cap / cutlery). Icons aren't localized, but both locales are saved so the
 * array rows stay identical.
 *
 * Run:  npx tsx src/scripts/patch-home-point-icons.ts   (staging DB only)
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

const SHOWCASE_ICONS = ['bean', 'muscle', 'vegan']
const BANNER_ICONS = ['chefHat', 'graduationCap', 'utensils']

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

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
    const layout = (doc.layout ?? []).map((b) => {
      if (b.blockType === 'productShowcase') {
        return {
          ...b,
          trustPoints: (b.trustPoints ?? []).map((t, i) => ({ ...t, icon: SHOWCASE_ICONS[i] ?? t.icon })),
        }
      }
      if (b.blockType === 'heroBanner') {
        return {
          ...b,
          points: (b.points ?? []).map((p, i) => ({ ...p, icon: BANNER_ICONS[i] ?? p.icon })),
        }
      }
      return b
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
