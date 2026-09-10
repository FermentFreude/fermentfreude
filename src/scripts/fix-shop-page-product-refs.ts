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
 * IMPORTANT, discovered only after an earlier version of this script got
 * this backwards: `src/app/(app)/shop/page.tsx` (a dedicated route file,
 * not the generic [slug] renderer) has ALWAYS unconditionally excluded
 * `shopProductList` from rendering on this page — see its own code comment,
 * "Never render a second product catalog / bestsellers strip on /shop"
 * (git blame: alaashaheen, 2026-08-25, long before today's session). Only
 * `featuredProductCards` is ever rendered as the product section here. So:
 *
 *   shop page: ensure `featuredProductCards` exists with
 *     products = [Berglinsen-Tempeh, Kimchi] (matches production) — this is
 *     the ONLY block this page actually renders for products.
 *   shop page: remove `shopProductList` entirely — confirmed dead code on
 *     this specific page regardless of its content, and the actual source
 *     of the "confusing duplicate section" in the CMS admin.
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

  // Remove shopProductList — confirmed dead code on this specific page's own
  // route file (src/app/(app)/shop/page.tsx unconditionally filters it out),
  // so its content is irrelevant here regardless of what it's set to.
  const withoutProductList = shopLayout.filter((block) => {
    if (block.blockType === 'shopProductList') {
      console.log('  removing shopProductList block (was:', block.products, ')')
      shopChanged = true
      return false
    }
    return true
  })

  // Ensure featuredProductCards exists with the right products — this is the
  // ONLY block the shop page's route file actually renders for products.
  const hasFeatured = withoutProductList.some((b) => b.blockType === 'featuredProductCards')
  let newShopLayout: Record<string, unknown>[]
  if (hasFeatured) {
    newShopLayout = withoutProductList.map((block) => {
      if (block.blockType === 'featuredProductCards') {
        console.log('  featuredProductCards.products before:', block.products)
        shopChanged = true
        return { ...block, products: [CORRECT_BERGLINSEN_ID, KIMCHI_ID] }
      }
      return block
    })
  } else {
    // No featuredProductCards block at all — insert one right after shopHero,
    // matching production's block order.
    console.log('  inserting a new featuredProductCards block')
    shopChanged = true
    const heroIndex = withoutProductList.findIndex((b) => b.blockType === 'shopHero')
    const insertAt = heroIndex === -1 ? 0 : heroIndex + 1
    newShopLayout = [
      ...withoutProductList.slice(0, insertAt),
      {
        blockType: 'featuredProductCards',
        visible: true,
        bannerProduct: null,
        products: [CORRECT_BERGLINSEN_ID, KIMCHI_ID],
      },
      ...withoutProductList.slice(insertAt),
    ]
  }

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

  // One of the synced media docs kept its production R2 URL instead of
  // being rewritten to staging's bucket — the file itself was already
  // copied to the staging bucket (confirmed via `rclone lsf`), just this
  // doc's `url` field was never updated to point at it.
  const staleMediaId = '69e1dc6d40fa3a821a8615a1'
  const media = await payload.findByID({
    collection: 'media',
    id: staleMediaId,
    depth: 0,
    overrideAccess: true,
  })
  const currentUrl = typeof media.url === 'string' ? media.url : ''
  if (currentUrl.includes('pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev')) {
    const fixedUrl = currentUrl.replace(
      'pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev',
      'pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev',
    )
    console.log('  media url before:', currentUrl)
    await payload.update({
      collection: 'media',
      id: staleMediaId,
      data: { url: fixedUrl } as never,
      overrideAccess: true,
    })
    console.log('✅ Media URL repointed to staging bucket.')
  } else {
    console.log('Media URL: nothing to change.')
  }

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
