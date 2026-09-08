/**
 * Shop page seed — creates a "shop" page in the Pages collection
 * with ShopHero, ShopProductList, VoucherCta, WorkshopSlider, Testimonials, and SponsorsBar blocks.
 *
 * Strategy:
 *   1. Non-destructive: if shop exists, only fill EMPTY new labels (never overwrite copy)
 *   2. Seed DE locale first → read back IDs → seed EN with same IDs
 *   3. Sequential writes only (MongoDB M0 = no transactions)
 *   4. Reuse existing Media from DB for workshop/voucher/sponsor images
 *
 * Run: pnpm seed shop-new
 * Force: pnpm seed shop-new --force
 */

import { buildSponsorsBar, mergeSponsorsBarEN } from '@/blocks/SponsorsBar/seed'
import { buildTestimonials, mergeTestimonialsEN } from '@/blocks/Testimonials/seed'
import { buildWorkshopSlider, mergeWorkshopSliderEN } from '@/blocks/WorkshopSlider/seed'
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

interface WithId {
  id?: string
  [key: string]: unknown
}
interface BlockItem extends WithId {
  blockType?: string
  slides?: WithId[]
  collections?: WithId[]
  galleryImages?: WithId[]
  workshops?: (WithId & { features?: WithId[] })[]
  testimonials?: WithId[]
  sponsors?: WithId[]
}

const HERO_CHROME_DE = {
  soldOutLabel: 'Ausverkauft',
  signatureBrand: 'FermentFreude',
  signatureLabel: 'Signature',
  signatureSubtitle: 'Handgemacht in Graz',
  priceLabel: 'Preis',
  addToCartLabel: 'In den Warenkorb',
  detailsLabel: 'Produktdetails',
  viewDetailsLabel: 'Details ansehen',
}
const HERO_CHROME_EN = {
  soldOutLabel: 'Sold out',
  signatureBrand: 'FermentFreude',
  signatureLabel: 'Signature',
  signatureSubtitle: 'Handmade in Graz',
  priceLabel: 'Price',
  addToCartLabel: 'Add to cart',
  detailsLabel: 'Product details',
  viewDetailsLabel: 'View details',
}
const FEATURED_CHROME_DE = { soldOutLabel: 'Ausverkauft', seasonalLabel: 'Saisonal' }
const FEATURED_CHROME_EN = { soldOutLabel: 'Sold out', seasonalLabel: 'Seasonal' }
const AUTOMATEN_CHROME_DE = {
  featuredOverlayLabel: 'Graz · 24/7',
  tipLabel: 'Insider',
  tipKindLabel: 'Restaurant',
  tipCity: 'Graz',
  tipAddress: 'Grüne Gasse 17, 8020 Graz',
  tipProducts: 'Käferbohnen-Tempeh',
}
const AUTOMATEN_CHROME_EN = {
  featuredOverlayLabel: 'Graz · 24/7',
  tipLabel: 'Insider tip',
  tipKindLabel: 'Restaurant',
  tipCity: 'Graz',
  tipAddress: 'Grüne Gasse 17, 8020 Graz',
  tipProducts: 'Käferbohnen Tempeh',
}

function fillEmptyStrings(
  block: Record<string, unknown>,
  defaults: Record<string, string>,
): { next: Record<string, unknown>; changed: boolean } {
  let changed = false
  const next = { ...block }
  for (const [key, value] of Object.entries(defaults)) {
    const current = next[key]
    if (typeof current === 'string' && current.trim()) continue
    next[key] = value
    changed = true
  }
  return { next, changed }
}

function asTrimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function fillRequiredLocationNames(
  targetLayout: BlockItem[],
  sourceLayout: BlockItem[],
): { next: BlockItem[]; changed: boolean } {
  const sourceAuto = sourceLayout.find((b) => b.blockType === 'shopAutomaten') as
    | (BlockItem & { locations?: Record<string, unknown>[] })
    | undefined
  const sourceLocs = sourceAuto?.locations ?? []
  let changed = false
  const next = targetLayout.map((block) => {
    if (block.blockType !== 'shopAutomaten') return block
    const targetLocs = ((block as BlockItem & { locations?: Record<string, unknown>[] }).locations ??
      []) as Record<string, unknown>[]
    const source = targetLocs.length > 0 ? targetLocs : sourceLocs
    const locations = source.map((loc, i) => {
      const fromOther = sourceLocs[i] ?? {}
      const name = asTrimmed(loc.name) || asTrimmed(fromOther.name)
      const address = asTrimmed(loc.address) || asTrimmed(fromOther.address)
      if (name !== asTrimmed(loc.name) || address !== asTrimmed(loc.address)) changed = true
      return { ...fromOther, ...loc, name, address }
    })
    return { ...block, locations }
  })
  return { next, changed }
}

/**
 * Fill NEW empty chrome fields only. Never overwrites existing DE/EN copy.
 */
async function fillEmptyShopChrome(
  payload: Awaited<ReturnType<typeof getPayload>>,
  pageId: string,
) {
  const deDoc = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    fallbackLocale: false,
    depth: 0,
  })
  const enDoc = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })

  const apply = (
    layout: BlockItem[],
    hero: Record<string, string>,
    featured: Record<string, string>,
    automaten: Record<string, string>,
  ) => {
    let changed = false
    const next = layout.map((block) => {
      if (block.blockType === 'shopHero') {
        const filled = fillEmptyStrings(block, hero)
        const existing =
          typeof filled.next.signatureBadge === 'object' && filled.next.signatureBadge !== null
            ? (filled.next.signatureBadge as Record<string, unknown>)
            : {}
        const subtitleDefault = hero.signatureSubtitle || ''
        const nextBadge = {
          ...existing,
          show: typeof existing.show === 'boolean' ? existing.show : true,
          brand:
            asTrimmed(existing.brand) ||
            asTrimmed(filled.next.signatureBrand) ||
            'FermentFreude',
          title:
            asTrimmed(existing.title) || asTrimmed(filled.next.signatureLabel) || 'Signature',
          subtitle:
            asTrimmed(existing.subtitle) ||
            asTrimmed(filled.next.signatureSubtitle) ||
            subtitleDefault,
        }
        const badgeChanged =
          asTrimmed(existing.brand) !== nextBadge.brand ||
          asTrimmed(existing.title) !== nextBadge.title ||
          asTrimmed(existing.subtitle) !== nextBadge.subtitle ||
          existing.show !== nextBadge.show
        if (badgeChanged) {
          filled.next.signatureBadge = nextBadge
          filled.changed = true
        }
        if (typeof filled.next.showSignatureBadge !== 'boolean') {
          filled.next.showSignatureBadge = true
          filled.changed = true
        }
        if (filled.changed) changed = true
        return filled.next
      }
      if (block.blockType === 'featuredProductCards') {
        const filled = fillEmptyStrings(block, featured)
        if (filled.changed) changed = true
        return filled.next
      }
      if (block.blockType === 'shopAutomaten') {
        const filled = fillEmptyStrings(block, automaten)
        if (filled.changed) changed = true
        return filled.next
      }
      return block
    })
    return { next, changed }
  }

  const deLayout = (deDoc.layout ?? []) as BlockItem[]
  const enLayout = (enDoc.layout ?? []) as BlockItem[]

  const deLocs = fillRequiredLocationNames(deLayout, enLayout)
  const deFilled = apply(deLocs.next, HERO_CHROME_DE, FEATURED_CHROME_DE, AUTOMATEN_CHROME_DE)
  if (deFilled.changed || deLocs.changed) {
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      data: { layout: deFilled.next as never },
      context: ctx,
    })
    payload.logger.info('  ✓ Filled empty DE shop chrome labels (existing copy untouched)')
  }

  const enLocs = fillRequiredLocationNames(enLayout, deLayout)
  const enFilled = apply(enLocs.next, HERO_CHROME_EN, FEATURED_CHROME_EN, AUTOMATEN_CHROME_EN)
  if (enFilled.changed || enLocs.changed) {
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'en',
      data: { layout: enFilled.next as never },
      context: ctx,
    })
    payload.logger.info('  ✓ Filled empty EN shop chrome labels (existing copy untouched)')
  }

  if (!deFilled.changed && !enFilled.changed && !deLocs.changed && !enLocs.changed) {
    payload.logger.info('  ✓ Shop chrome labels already populated — nothing overwritten')
  }
}

async function seedShopNew() {
  const payload = await getPayload({ config })
  const forceRecreate = process.argv.includes('--force')

  // ── Non-destructive check ──────────────────────────────────────────────
  const existingCheck = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'shop' } },
    limit: 1,
  })

  const existingPage = existingCheck.docs?.[0]
  const hasContent = existingPage?.layout && (existingPage.layout as unknown[]).length > 0

  if (hasContent && !forceRecreate) {
    payload.logger.info(
      '\u2705 Shop page already has block content — filling empty new labels only (no overwrite).',
    )
    await fillEmptyShopChrome(payload, String(existingPage.id))
    return
  }

  payload.logger.info(
    forceRecreate ? '\ud83d\udd04 Force-seeding shop page...' : '\ud83c\udf31 Seeding shop page...',
  )

  // ════════════════════════════════════════════════════════════════════════
  // 0. Preserve admin-managed images from existing page
  // ════════════════════════════════════════════════════════════════════════

  const existingSlideImages: Record<number, string | object> = {}

  if (existingPage && forceRecreate) {
    const existingDoc = await payload.findByID({
      collection: 'pages',
      id: existingPage.id,
      locale: 'de',
      depth: 1,
    })
    const existingBlocks = (existingDoc.layout ?? []) as BlockItem[]
    const heroBlock = existingBlocks.find((b) => b.blockType === 'shopHero')
    if (heroBlock?.slides) {
      heroBlock.slides.forEach((slide, i) => {
        if (slide.image) {
          const img = slide.image as string | { id?: string }
          existingSlideImages[i] = typeof img === 'object' && img?.id ? img.id : img
        }
      })
    }
    payload.logger.info(
      `  \u2713 Preserved ${Object.keys(existingSlideImages).length} admin-managed images`,
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  // 0b. Pull exact images from existing pages (home, about)
  // ════════════════════════════════════════════════════════════════════════

  // Workshop slider images — copy from home page
  const home = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const homeBlocks = (home.docs[0]?.layout ?? []) as BlockItem[]
  const homeWsBlock = homeBlocks.find((b) => b.blockType === 'workshopSlider') as
    | (BlockItem & { workshops?: { image?: string; image2?: string }[] })
    | undefined

  const wsImages = {
    laktoImageId: homeWsBlock?.workshops?.[0]?.image ?? '',
    kombuchaImageId: homeWsBlock?.workshops?.[1]?.image ?? '',
    tempehImageId: homeWsBlock?.workshops?.[2]?.image ?? '',
    laktoImage2Id: homeWsBlock?.workshops?.[0]?.image2 ?? '',
    kombuchaImage2Id: homeWsBlock?.workshops?.[1]?.image2 ?? '',
    tempehImage2Id: homeWsBlock?.workshops?.[2]?.image2 ?? '',
  }
  payload.logger.info(`  ✓ Copied workshop images from home page`)

  // Lakto voucher background image — copy from lakto-gemuese workshop detail page
  const laktoPages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'lakto-gemuese' } },
    limit: 1,
    depth: 0,
  })
  const laktoDetail = laktoPages.docs[0]?.workshopDetail as
    | { voucherBackgroundImage?: string }
    | undefined
  const laktoVoucherBgId =
    typeof laktoDetail?.voucherBackgroundImage === 'string'
      ? laktoDetail.voucherBackgroundImage
      : undefined
  payload.logger.info(
    `  ✓ Lakto voucher background image: ${laktoVoucherBgId ? 'found' : 'none (will use fallback)'}`,
  )

  // Sponsors bar images — copy from about page
  const about = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    limit: 1,
    depth: 0,
  })
  const aboutBlocks = (about.docs[0]?.layout ?? []) as BlockItem[]
  const aboutSponsorsBlock = aboutBlocks.find((b) => b.blockType === 'sponsorsBar') as
    | (BlockItem & { sponsors?: { logo?: string; name?: string; url?: string }[] })
    | undefined

  const sponsorLogos = (aboutSponsorsBlock?.sponsors ?? []).map((s, i) => ({
    logo: typeof s.logo === 'string' ? s.logo : '',
    name: s.name ?? `Partner ${i + 1}`,
    url: s.url ?? '',
  }))

  // ════════════════════════════════════════════════════════════════════════
  // 1. Build DE block data
  // ════════════════════════════════════════════════════════════════════════

  // Resolve the three shop products (hero + supporting)
  const findProductId = async (slug: string): Promise<string | null> => {
    const found = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    return found.docs[0]?.id ? String(found.docs[0].id) : null
  }

  const kaferId = await findProductId('kaeferbohnen-tempeh')
  const berglinsenId = await findProductId('berglinsen-tempeh')
  const kimchiId = await findProductId('classic-kimchi')

  // Block 1: ShopHero — Käfer as visual hero product
  const shopHeroDE = {
    blockType: 'shopHero' as const,
    blockName: 'Shop Hero',
    ...(kaferId ? { heroProduct: kaferId } : {}),
    heroPanelColor: '#403c39',
    heroTitle: 'Unsere handgemachten Produkte aus unserem Pick-Up Shop.',
    ctaPrimaryLabel: 'Jetzt bestellen',
    ctaPrimaryUrl: '/products/kaeferbohnen-tempeh',
    slides: [],
    bottomTagline: 'Fermentierte Lebensmittel, mit Sorgfalt hergestellt.',
    bottomSubtitle: 'Abholung in Graz, jede Woche frisch.',
    bottomDisclaimer: 'Wir arbeiten an einem Lieferservice, f\u00fcr garantierte Frische.',
    showSignatureBadge: true,
    signatureBadge: {
      show: true,
      brand: 'FermentFreude',
      title: 'Signature',
      subtitle: 'Handgemacht in Graz',
    },
    ...HERO_CHROME_DE,
  }

  // Block 2: Supporting products only (Berglinsen + Kimchi)
  const featuredCardsDE = {
    blockType: 'featuredProductCards' as const,
    blockName: 'Shop Products',
    visible: true,
    heading: 'Weitere Produkte',
    subheading: 'Berglinsen-Tempeh und saisonales Kimchi.',
    products: [berglinsenId, kimchiId].filter(Boolean),
    cardColors: [{ color: '#4b4f4a' }, { color: '#555954' }],
    bannerProduct: null,
    ctaLabel: 'Jetzt bestellen',
    ...FEATURED_CHROME_DE,
  }

  // Block 3: ShopProductList — hidden to avoid repeating the same 3 products
  const shopProductListDE = {
    blockType: 'shopProductList' as const,
    blockName: 'Produkt-Anzeige',
    visible: false,
    heading: 'Unsere Produkte',
  }

  // Block 3: LaktoVoucherCta (voucher CTA with background image, like the lakto-gemuese workshop page)
  const laktoVoucherDE = {
    blockType: 'laktoVoucherCta' as const,
    blockName: 'Gutschein CTA',
    eyebrow: 'GEMEINSAM FERMENTIEREN',
    title: 'Go with a friend.',
    description:
      'Schenke jemandem ein besonderes Erlebnis. Unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und neugierige Köpfe.',
    primaryLabel: 'Gutschein kaufen',
    primaryHref: '/voucher',
    secondaryLabel: 'Zum Shop',
    secondaryHref: '/shop',
    pills: [
      { text: 'Sofort einlösbar' },
      { text: 'Für alle Workshops' },
      { text: 'Digital oder gedruckt' },
    ],
    ...(laktoVoucherBgId ? { backgroundImage: laktoVoucherBgId } : {}),
  }

  // Block 4: WorkshopSlider (with exact images from home page)
  const workshopData = buildWorkshopSlider(wsImages)

  // Block 5: Testimonials
  const testimonialsData = buildTestimonials()

  // Block 6: SponsorsBar (with logos from about page)
  const sponsorsData =
    sponsorLogos.length >= 4
      ? buildSponsorsBar({
          sponsorLogo1Id: sponsorLogos[0].logo,
          sponsorLogo2Id: sponsorLogos[1].logo,
          sponsorLogo3Id: sponsorLogos[2].logo,
          sponsorLogo4Id: sponsorLogos[3].logo,
        })
      : buildSponsorsBar({
          sponsorLogo1Id: '',
          sponsorLogo2Id: '',
          sponsorLogo3Id: '',
          sponsorLogo4Id: '',
        })

  const deLayout = [
    shopHeroDE,
    featuredCardsDE,
    shopProductListDE,
    laktoVoucherDE,
    workshopData.de,
    testimonialsData.de,
    sponsorsData.de,
  ]

  // ════════════════════════════════════════════════════════════════════════
  // 2. Save / create page with DE data
  // ════════════════════════════════════════════════════════════════════════

  let pageId: string

  if (existingPage && forceRecreate) {
    await payload.update({
      collection: 'pages',
      id: existingPage.id,
      locale: 'de',
      data: {
        title: 'Shop',
        slug: 'shop',
        layout: deLayout,
        _status: 'published',
      } as never,
      context: ctx,
    })
    pageId = existingPage.id as string
    payload.logger.info(`  \u2713 Updated shop page (${pageId}) with DE content`)
  } else {
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      data: {
        title: 'Shop',
        slug: 'shop',
        layout: deLayout,
        _status: 'published',
      } as never,
      context: ctx,
    })
    pageId = created.id as string
    payload.logger.info(`  \u2713 Created shop page (${pageId}) with DE content`)
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. Read back to get auto-generated IDs
  // ════════════════════════════════════════════════════════════════════════

  const doc = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
  })

  const savedBlocks = (doc.layout ?? []) as BlockItem[]

  // ════════════════════════════════════════════════════════════════════════
  // 4. Build EN layout reusing IDs from DE
  // ════════════════════════════════════════════════════════════════════════

  const shopHeroBlock = savedBlocks.find((b) => b.blockType === 'shopHero')!
  const featuredCardsBlock = savedBlocks.find((b) => b.blockType === 'featuredProductCards')!
  const productListBlock = savedBlocks.find((b) => b.blockType === 'shopProductList')!
  const voucherBlock = savedBlocks.find((b) => b.blockType === 'laktoVoucherCta')!
  const workshopBlock = savedBlocks.find((b) => b.blockType === 'workshopSlider')!
  const testimonialsBlock = savedBlocks.find((b) => b.blockType === 'testimonials')!
  const sponsorsBlock = savedBlocks.find((b) => b.blockType === 'sponsorsBar')!

  const enLayout = [
    // ShopHero EN
    {
      ...shopHeroBlock,
      heroTitle: 'Our handmade products from our pick-up shop.',
      ctaPrimaryLabel: 'Order Now',
      ctaPrimaryUrl: '/products/kaeferbohnen-tempeh',
      slides: [],
      bottomTagline: 'Fermented foods, crafted with care.',
      bottomSubtitle: 'Pickup in Graz, freshly made every week.',
      bottomDisclaimer: 'Delivery coming soon, to ensure the freshest quality.',
      showSignatureBadge: true,
      signatureBadge: {
        show: true,
        brand: 'FermentFreude',
        title: 'Signature',
        subtitle: 'Handmade in Graz',
      },
      ...HERO_CHROME_EN,
    },
    // FeaturedProductCards EN
    {
      ...featuredCardsBlock,
      heading: 'More products',
      subheading: 'Mountain lentil tempeh and seasonal kimchi.',
      ctaLabel: 'Order Now',
      ...FEATURED_CHROME_EN,
    },
    // ShopProductList EN (kept hidden — avoids repeating the same 3 products)
    {
      ...productListBlock,
      visible: false,
      heading: 'Our Products',
    },
    // LaktoVoucherCta EN
    {
      ...voucherBlock,
      eyebrow: 'FERMENT TOGETHER',
      title: 'Go with a friend.',
      description:
        'Give someone a special experience. Our vouchers are the perfect gift for foodies and curious minds.',
      primaryLabel: 'Buy Voucher',
      primaryHref: '/voucher',
      secondaryLabel: 'Visit Shop',
      secondaryHref: '/shop',
      pills:
        (voucherBlock.pills as WithId[] | undefined)?.map((p, i) => ({
          ...p,
          text: ['Instantly redeemable', 'For all workshops', 'Digital or printed'][i] ?? p.text,
        })) ?? [],
    },
    // WorkshopSlider EN
    mergeWorkshopSliderEN(workshopData.en, workshopBlock),
    // Testimonials EN
    mergeTestimonialsEN(testimonialsData.en, testimonialsBlock),
    // SponsorsBar EN
    mergeSponsorsBarEN(sponsorsData.en, sponsorsBlock),
  ]

  // ════════════════════════════════════════════════════════════════════════
  // 5. Save EN locale
  // ════════════════════════════════════════════════════════════════════════

  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    data: {
      title: 'Shop',
      layout: enLayout as never,
    },
    context: ctx,
  })

  payload.logger.info(`  \u2713 Saved EN content for shop page (${pageId})`)
  payload.logger.info('\u2705 Shop page seed complete!')
  process.exit(0)
}

seedShopNew()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\u274c Shop seed failed:', err)
    process.exit(1)
  })
