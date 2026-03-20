/**
 * Shop page seed — creates a "shop" page in the Pages collection
 * with ShopHero, ShopProductList, VoucherCta, WorkshopSlider, Testimonials, and SponsorsBar blocks.
 *
 * Strategy:
 *   1. Non-destructive: skip if shop page already exists (use --force to overwrite)
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
      '\u2705 Shop page already has block content — skipping. Use --force to overwrite.',
    )
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

  // Block 1: ShopHero
  const shopHeroDE = {
    blockType: 'shopHero' as const,
    blockName: 'Shop Hero',
    heroTitle: 'Unsere handgemachten Produkte aus unserem Pick-Up Shop.',
    heroPrice: 'ab \u20ac8,50',
    ctaPrimaryLabel: 'Jetzt bestellen',
    ctaPrimaryUrl: '/shop#products',
    ctaSecondaryLabel: 'Mehr erfahren',
    ctaSecondaryUrl: '/fermentation',
    slides: [
      {
        categoryLabel: 'Tempeh',
        detailUrl: '/shop/tempeh',
        ...(existingSlideImages[0] ? { image: existingSlideImages[0] } : {}),
      },
      {
        categoryLabel: 'Kimchi',
        detailUrl: '/shop/kimchi',
        ...(existingSlideImages[1] ? { image: existingSlideImages[1] } : {}),
      },
      {
        categoryLabel: 'Miso',
        detailUrl: '/shop/miso',
        ...(existingSlideImages[2] ? { image: existingSlideImages[2] } : {}),
      },
    ],
    bottomTagline: 'Fermentierte Lebensmittel, mit Sorgfalt hergestellt.',
    bottomSubtitle: 'Abholung in Graz — jede Woche frisch.',
    bottomDisclaimer: 'Wir arbeiten an einem Lieferservice — f\u00fcr garantierte Frische.',
  }

  // Block 2: ShopProductList
  const shopProductListDE = {
    blockType: 'shopProductList' as const,
    blockName: 'Produkt-Anzeige',
    heading: 'Unsere Produkte',
  }

  // Block 3: LaktoVoucherCta (voucher CTA with background image, like the lakto-gemuese workshop page)
  const laktoVoucherDE = {
    blockType: 'laktoVoucherCta' as const,
    blockName: 'Gutschein CTA',
    eyebrow: 'GEMEINSAM FERMENTIEREN',
    title: 'Go with a friend.',
    description:
      'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und neugierige Köpfe.',
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
  const productListBlock = savedBlocks.find((b) => b.blockType === 'shopProductList')!
  const voucherBlock = savedBlocks.find((b) => b.blockType === 'laktoVoucherCta')!
  const workshopBlock = savedBlocks.find((b) => b.blockType === 'workshopSlider')!
  const testimonialsBlock = savedBlocks.find((b) => b.blockType === 'testimonials')!
  const sponsorsBlock = savedBlocks.find((b) => b.blockType === 'sponsorsBar')!

  const enLayout = [
    // ShopHero EN
    {
      ...shopHeroBlock,
      heroTitle: 'Our Handmade Products From Our Pick-Up Shop.',
      heroPrice: 'from \u20ac8.50',
      ctaPrimaryLabel: 'Order Now',
      ctaPrimaryUrl: '/shop#products',
      ctaSecondaryLabel: 'Learn More',
      ctaSecondaryUrl: '/fermentation',
      slides: (shopHeroBlock.slides ?? []).map((slide, i) => {
        const enSlides = [
          { categoryLabel: 'Tempeh', detailUrl: '/shop/tempeh' },
          { categoryLabel: 'Kimchi', detailUrl: '/shop/kimchi' },
          { categoryLabel: 'Miso', detailUrl: '/shop/miso' },
        ]
        return { ...slide, ...(enSlides[i] ?? {}) }
      }),
      bottomTagline: 'Fermented foods, crafted with care.',
      bottomSubtitle: 'Pickup in Graz — freshly made every week.',
      bottomDisclaimer: 'Delivery coming soon — to ensure the freshest quality.',
    },
    // ShopProductList EN
    {
      ...productListBlock,
      heading: 'Our Products',
    },
    // LaktoVoucherCta EN
    {
      ...voucherBlock,
      eyebrow: 'FERMENT TOGETHER',
      title: 'Go with a friend.',
      description:
        'Give someone a special experience — our vouchers are the perfect gift for foodies and curious minds.',
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
}

seedShopNew().catch((err) => {
  console.error('\u274c Shop seed failed:', err)
  process.exit(1)
})
