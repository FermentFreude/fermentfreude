/**
 * Home showcase, Tempeh slide: three points under the button, same look as the
 * chefs banner (title + optional short line). Replaces the six small labels.
 *
 * Run:  npx tsx src/scripts/patch-home-showcase-trust-points.ts   (staging DB only)
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

const POINTS = {
  de: [
    { text: 'Aus nur 3 Zutaten', detail: 'Vakuumiert, 6 Wochen haltbar.' },
    { text: 'Proteinreich', detail: null },
    { text: 'Vegan & Bio', detail: '100 % pflanzlich.' },
  ],
  en: [
    { text: 'Just 3 ingredients', detail: 'Vacuum-packed, keeps for 6 weeks.' },
    { text: 'High in protein', detail: null },
    { text: 'Vegan & organic', detail: '100% plant-based.' },
  ],
}

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

  // DE first: new rows get their IDs here
  const de = await payload.findByID({ collection: 'pages', id: home.id, locale: 'de', depth: 0 })
  await payload.update({
    collection: 'pages',
    id: home.id,
    locale: 'de',
    data: {
      layout: (de.layout ?? []).map((b) =>
        b.blockType === 'productShowcase' ? { ...b, trustPoints: POINTS.de } : b,
      ),
    } as never,
    context: ctx,
  })
  console.log('✅ de')

  // EN reuses the DE row IDs
  const saved = await payload.findByID({ collection: 'pages', id: home.id, locale: 'en', depth: 0 })
  await payload.update({
    collection: 'pages',
    id: home.id,
    locale: 'en',
    data: {
      layout: (saved.layout ?? []).map((b) => {
        if (b.blockType !== 'productShowcase') return b
        const ids = (b.trustPoints ?? []).map((t) => t.id)
        if (ids.length !== POINTS.en.length) throw new Error(`Expected 3 DE rows, got ${ids.length}`)
        return { ...b, trustPoints: POINTS.en.map((p, i) => ({ ...p, id: ids[i] })) }
      }),
    } as never,
    context: ctx,
  })
  console.log('✅ en')
}

await main()
process.exit(0)
