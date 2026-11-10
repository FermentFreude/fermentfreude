/**
 * Home, press banner: give each slide a small picture — the same picture the
 * press page (/presse) already shows for that article, matched by the article
 * URL. No uploads; only references to existing media docs. DE then EN, same
 * row IDs.
 *
 * Run:  npx tsx src/scripts/patch-home-press-slide-images.ts   (staging DB only)
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

async function main() {
  const payload = await getPayload({ config })

  // Article URL → picture, from the press page
  const press = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'presse' } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })
  const block = (press.docs[0]?.layout ?? []).find((b) => b.blockType === 'pressMediaAwards')
  if (!block || block.blockType !== 'pressMediaAwards')
    throw new Error('Press page block not found')
  const imageByUrl = new Map<string, string>()
  for (const item of block.items ?? []) {
    const img = typeof item.image === 'string' ? item.image : item.image?.id
    if (item.url && img) imageByUrl.set(item.url.trim(), img)
  }

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
      if (b.blockType !== 'pressBanner') return b
      return {
        ...b,
        slides: (b.slides ?? []).map((s) => {
          const img = s.url ? imageByUrl.get(s.url.trim()) : undefined
          console.log(`${locale}: ${s.outlet}`, img ? `→ ${img}` : '— no picture on the press page')
          return img ? { ...s, image: img } : s
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
