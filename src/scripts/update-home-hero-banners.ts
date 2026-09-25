/**
 * update-home-hero-banners.ts
 *
 * Replaces the Home page's top `productSlider` block with the new
 * `productHeroSlider` banner (Käferbohnen-Tempeh → Berglinsen-Tempeh →
 * Kimchi, full-bleed hero style), and inserts the reactivated
 * `specialWorkshopBanner` (Vom Feld ins Glas) right after it.
 *
 * Slide images are intentionally left empty (renders a plain placeholder) —
 * Rafaela adds them herself in /admin per slide, same as any other block.
 *
 * Whichever DB your .env points at is the one this touches — check the
 * printed DATABASE_URL before running with --force. Non-destructive to
 * everything else on the page: only the layout array position/contents
 * for these two blocks change.
 *
 * Usage:
 *   npx tsx -r dotenv/config src/scripts/update-home-hero-banners.ts          ← dry-run
 *   npx tsx -r dotenv/config src/scripts/update-home-hero-banners.ts --force  ← actually apply
 */

import config from '@payload-config'
import { getPayload } from 'payload'

import {
  buildProductHeroSliderDE,
  buildProductHeroSliderEN,
  type ProductHeroSliderSlideSeed,
} from '@/blocks/ProductHeroSlider/seed'
import { buildSpecialWorkshopBannerDE, buildSpecialWorkshopBannerEN } from '@/blocks/SpecialWorkshopBanner/seed'

const DRY_RUN = !process.argv.includes('--force')

const PRODUCT_SLUGS = {
  kaefer: 'kaeferbohnen-tempeh',
  berglinsen: 'berglinsen-tempeh',
  kimchi: 'classic-kimchi',
} as const

type Ctx = { skipRevalidate: true; disableRevalidate: true; skipAutoTranslate: true }
const ctx: Ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

async function findProductId(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
): Promise<string | null> {
  const result = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0]?.id ? String(result.docs[0].id) : null
}

async function main() {
  const payload = await getPayload({ config })
  console.log(`DB: ${process.env.DATABASE_URL?.replace(/\/\/.*@/, '//<creds>@')}`)
  console.log(DRY_RUN ? 'DRY RUN — no writes will be made.\n' : 'LIVE RUN — writing changes.\n')

  const [kaeferId, berglinsenId, kimchiId] = await Promise.all([
    findProductId(payload, PRODUCT_SLUGS.kaefer),
    findProductId(payload, PRODUCT_SLUGS.berglinsen),
    findProductId(payload, PRODUCT_SLUGS.kimchi),
  ])

  if (!kaeferId || !berglinsenId || !kimchiId) {
    console.error('Missing product(s):', {
      kaeferId,
      berglinsenId,
      kimchiId,
    })
    process.exit(1)
  }

  const slidesBase: ProductHeroSliderSlideSeed[] = [
    { product: kaeferId, badgeLabel: 'Signature' },
    { product: berglinsenId },
    { product: kimchiId },
  ]

  const home = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })
  const homeId = home.docs[0]?.id
  if (!homeId) {
    console.error('Home page not found.')
    process.exit(1)
  }

  // NOTE: the `layout` blocks array itself is not a localized field — only the
  // text fields *inside* each block are. So the DE save already mutates the
  // shared block structure that the subsequent EN read sees too. This filter
  // must strip every block type this script owns (old + new), regardless of
  // whether a previous run of this script already inserted them.
  const OWNED_BLOCK_TYPES = new Set(['productSlider', 'productHeroSlider', 'specialWorkshopBanner'])
  function buildNextLayout(
    currentLayout: unknown[],
    productHeroSliderBlock: unknown,
    specialWorkshopBannerBlock: unknown,
  ) {
    const rest = currentLayout.filter(
      (b) =>
        !(
          b &&
          typeof b === 'object' &&
          'blockType' in b &&
          OWNED_BLOCK_TYPES.has(b.blockType as string)
        ),
    )
    return [productHeroSliderBlock, specialWorkshopBannerBlock, ...rest]
  }

  // ── DE ──────────────────────────────────────────────────────────
  const deDoc = await payload.findByID({ collection: 'pages', id: homeId, locale: 'de', depth: 0 })
  const deLayout = Array.isArray(deDoc.layout) ? deDoc.layout : []
  const deProductBanner = buildProductHeroSliderDE(slidesBase)
  const deSpecialBanner = buildSpecialWorkshopBannerDE()
  const deNextLayout = buildNextLayout(deLayout, deProductBanner, deSpecialBanner)

  console.log('Planned DE layout order:')
  deNextLayout.forEach((b: any, i) => console.log(`  ${i}. ${b.blockType}`))

  if (DRY_RUN) {
    console.log('\nDry run complete. Re-run with --force to apply.')
    process.exit(0)
  }

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    context: ctx,
    data: { layout: deNextLayout as never },
  })
  console.log('✓ DE saved.')

  // ── Read back generated IDs, then save EN reusing them ───────────
  const savedDe = await payload.findByID({ collection: 'pages', id: homeId, locale: 'de', depth: 0 })
  const savedLayout = Array.isArray(savedDe.layout) ? savedDe.layout : []
  const savedProductBanner = savedLayout.find((b: any) => b.blockType === 'productHeroSlider') as any
  const savedSpecialBanner = savedLayout.find((b: any) => b.blockType === 'specialWorkshopBanner') as any

  const enProductBanner = {
    ...buildProductHeroSliderEN(slidesBase),
    id: savedProductBanner.id,
    slides: slidesBase.map((s, i) => ({ ...s, id: savedProductBanner.slides[i].id })),
  }
  const enSpecialBanner = { ...buildSpecialWorkshopBannerEN(), id: savedSpecialBanner.id }

  const enDoc = await payload.findByID({ collection: 'pages', id: homeId, locale: 'en', depth: 0 })
  const enLayout = Array.isArray(enDoc.layout) ? enDoc.layout : []
  const enNextLayout = buildNextLayout(enLayout, enProductBanner, enSpecialBanner)

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    context: ctx,
    data: { layout: enNextLayout as never },
  })
  console.log('✓ EN saved.')

  process.exit(0)
}

main()
