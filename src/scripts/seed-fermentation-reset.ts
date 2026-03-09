/**
 * Reset the Fermentation page tab so the page uses code defaults.
 * Use when CMS data overrides your design and you want to see the defaults from fermentation/page.tsx.
 *
 * Run: npx tsx src/scripts/seed-fermentation-reset.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, skipAutoTranslate: true }

const EMPTY_FERMENTATION = {
  fermentationHeroBlocks: [],
  fermentationWorkshopCards: [],
  fermentationHeroImage: null,
  fermentationGuideImage: null,
  fermentationWhatImage: null,
  fermentationWhyImage: null,
  fermentationPracticeImage: null,
  fermentationCtaBackgroundImage: null,
  fermentationCtaVideo: null,
  fermentationCtaVideoUrl: null,
}

async function reset() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'fermentation' } },
    limit: 1,
    depth: 0,
  })
  const page = result.docs[0]
  if (!page) {
    console.log(
      'No fermentation page found in the database. When no page exists, /fermentation already uses code defaults.',
    )
    console.log('If you still don\'t see the design:')
    console.log('  1. Run: rm -rf .next && pnpm dev')
    console.log('  2. Hard refresh http://localhost:3000/fermentation (Cmd+Shift+R)')
    console.log('  3. Ensure you\'re on branch retouch-fermentation')
    process.exit(0)
  }
  console.log('Resetting fermentation tab so defaults show...')
  for (const locale of ['de', 'en'] as const) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale,
      data: EMPTY_FERMENTATION as Record<string, unknown>,
      context: ctx,
    })
    console.log(`  Cleared ${locale}`)
  }
  console.log('Done. Refresh /fermentation to see code defaults.')
}

reset().catch((e) => {
  console.error(e)
  process.exit(1)
})
