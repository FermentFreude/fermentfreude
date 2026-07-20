/**
 * Remove specialWorkshopBanner from home layout (DE + EN).
 * Run: npx tsx src/scripts/remove-special-workshop-banner.ts
 */
// @ts-expect-error — dotenv types
import { config as loadEnv } from 'dotenv'

loadEnv()

async function main() {
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })
  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

  const home = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })
  if (!home.docs[0]) {
    console.error('Home page not found')
    process.exit(1)
  }
  const id = home.docs[0].id

  for (const locale of ['de', 'en'] as const) {
    const doc = await payload.findByID({ collection: 'pages', id, locale, depth: 0 })
    const layout = Array.isArray(doc.layout) ? doc.layout : []
    const next = layout.filter(
      (b) => !(b && typeof b === 'object' && 'blockType' in b && b.blockType === 'specialWorkshopBanner'),
    )
    await payload.update({
      collection: 'pages',
      id,
      locale,
      context: ctx,
      data: { layout: next as never },
    })
    console.log(`✓ ${locale}: removed banner (${layout.length} → ${next.length} blocks)`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
