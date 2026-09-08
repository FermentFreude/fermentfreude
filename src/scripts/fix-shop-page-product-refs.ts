/**
 * fix-shop-page-product-refs.ts
 *
 * One-off: repoints two blocks on the staging Shop page that were left
 * referencing product IDs deleted by sync-prod-to-staging.ts's --import
 * step. That script deletes staging products with no production
 * counterpart (or a diverged id) and recreates the correct ones under
 * production's id — but it only touches the `products`/`workshops`/etc.
 * collections, never `pages`, so any Shop-page block still pointing at the
 * old id was left dangling.
 *
 * Confirmed by comparing staging vs production directly (mongoexport):
 * the Products collection itself is byte-identical between the two
 * environments — this script only fixes the Shop page's own curated
 * product lists, nothing else.
 *
 *   shop page featuredProductCards.products: [OLD deleted Berglinsen id, Kimchi]
 *     -> [current Berglinsen id, Kimchi]  (matches production exactly)
 *   shop page shopProductList.products: [Käferbohnen, OLD deleted Curryzwiebel, OLD deleted Rote Rüben]
 *     -> [Kimchi, Käferbohnen]  (matches production exactly)
 *   home page productHeroSlider slide 3 `product`: OLD deleted Berglinsen id
 *     -> current Berglinsen id (this block doesn't exist on production yet —
 *        it's staging-only new content — so this one has no prod value to
 *        match against, just the same dangling-id bug to fix)
 *
 * Run against staging only: npx tsx src/scripts/fix-shop-page-product-refs.ts
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import type { getPayload as GetPayload } from 'payload'

loadEnv()

// Guard: refuse to run unless DATABASE_URL clearly points at staging — this
// script only ever intends to fix staging's own dangling references.
const dbUrl = process.env.DATABASE_URL || ''
if (!dbUrl.includes('staging')) {
  console.error(
    `❌ DATABASE_URL does not look like staging (no "staging" in the connection string). Refusing to run — this script must never touch production. Current: ${dbUrl.replace(/\/\/.*@/, '//<redacted>@')}`,
  )
  process.exit(1)
}

const OLD_STALE_BERGLINSEN_ID = '6a8824c3f6af04b208a112df'
const CORRECT_BERGLINSEN_ID = '6a9af5c6047eee1587b17b3b'
const KIMCHI_ID = '69bc80514889efa4f93c7ae0'
const KAEFERBOHNEN_ID = '69bc80524889efa4f93c7ae9'

async function run() {
  const { getPayload } = (await import('payload')) as { getPayload: typeof GetPayload }
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const shopResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'shop' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const shopPage = shopResult.docs[0]
  if (!shopPage) {
    console.error('❌ No page with slug "shop" found.')
    process.exit(1)
  }

  const shopLayout = (shopPage.layout ?? []) as unknown as Record<string, unknown>[]
  let shopChanged = false

  const newShopLayout = shopLayout.map((block) => {
    if (block.blockType === 'featuredProductCards') {
      console.log('  featuredProductCards.products before:', block.products)
      shopChanged = true
      return { ...block, products: [CORRECT_BERGLINSEN_ID, KIMCHI_ID] }
    }
    if (block.blockType === 'shopProductList') {
      console.log('  shopProductList.products before:', block.products)
      shopChanged = true
      return { ...block, products: [KIMCHI_ID, KAEFERBOHNEN_ID] }
    }
    return block
  })

  if (shopChanged) {
    await payload.update({
      collection: 'pages',
      id: shopPage.id,
      data: { layout: newShopLayout } as never,
      overrideAccess: true,
      context: { skipAutoTranslate: true },
    })
    console.log('✅ Shop page product references fixed.')
  } else {
    console.log('Shop page: nothing to change.')
  }

  const homeResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const homePage = homeResult.docs[0]
  if (!homePage) {
    console.error('❌ No page with slug "home" found.')
    process.exit(1)
  }

  const homeLayout = (homePage.layout ?? []) as unknown as Record<string, unknown>[]
  let homeChanged = false

  const newHomeLayout = homeLayout.map((block) => {
    if (block.blockType === 'productHeroSlider' && Array.isArray(block.slides)) {
      const newSlides = (block.slides as unknown as Record<string, unknown>[]).map((slide) => {
        const productId =
          typeof slide.product === 'object' && slide.product !== null
            ? String((slide.product as { $oid?: string; id?: string }).$oid ?? (slide.product as { id?: string }).id ?? slide.product)
            : String(slide.product)
        if (productId === OLD_STALE_BERGLINSEN_ID) {
          console.log('  productHeroSlider slide product before:', productId)
          homeChanged = true
          return { ...slide, product: CORRECT_BERGLINSEN_ID }
        }
        return slide
      })
      return { ...block, slides: newSlides }
    }
    return block
  })

  if (homeChanged) {
    await payload.update({
      collection: 'pages',
      id: homePage.id,
      data: { layout: newHomeLayout } as never,
      overrideAccess: true,
      context: { skipAutoTranslate: true },
    })
    console.log('✅ Home page product-hero-slider reference fixed.')
  } else {
    console.log('Home page: nothing to change.')
  }

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
