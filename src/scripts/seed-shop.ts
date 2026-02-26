/**
 * Shop page seed — Shop global (hero, product section, gift, featured, workshop CTA).
 *
 * Strategy:
 *   1. Upload images sequentially (MongoDB M0 = no transactions)
 *   2. Save DE locale first
 *   3. Read back to capture auto-generated array IDs
 *   4. Save EN locale reusing those exact IDs
 *
 * Run: pnpm seed shop
 * Or: set -a && source .env && set +a && npx tsx src/scripts/seed-shop.ts
 */

import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const ctx = { skipRevalidate: true, skipAutoTranslate: true }

async function seedShop() {
  const payload = await getPayload({ config })

  // Clean up stale shop media (avoid duplicates on re-run)
  for (const alt of ['Shop hero', 'Workshop CTA – fermentation', 'Featured – Kombucha', 'Featured – Lakto', 'Featured – Tempeh']) {
    await payload
      .delete({
        collection: 'media',
        where: { alt: { contains: alt } },
        context: { skipAutoTranslate: true },
      })
      .catch(() => {})
  }

  const heroDir = path.resolve(process.cwd(), 'seed-assets/media/hero')
  const workshopsDir = path.resolve(process.cwd(), 'seed-assets/media/workshops')
  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')

  // ── Upload images (reuse or create) ───────────────────────────────────────
  let heroImageId: string | null = null
  let heroSlide2Id: string | null = null
  let heroProduct1Id: string | null = null
  let heroProduct2Id: string | null = null
  let workshopCtaImageId: string | null = null
  let featuredImage1Id: string | null = null
  let featuredImage2Id: string | null = null
  let featuredImage3Id: string | null = null

  if (fs.existsSync(path.join(heroDir, 'hero-slide-1.png'))) {
    const heroMedia = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Shop hero – fermented jars and products background' },
      file: await optimizedFile(path.join(heroDir, 'hero-slide-1.png'), IMAGE_PRESETS.hero),
    })
    heroImageId = String(heroMedia.id)
  }
  if (fs.existsSync(path.join(heroDir, 'hero-slide-2.png'))) {
    const hero2 = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Shop hero slide 2 – fermentation products' },
      file: await optimizedFile(path.join(heroDir, 'hero-slide-2.png'), IMAGE_PRESETS.hero),
    })
    heroSlide2Id = String(hero2.id)
  }
  if (fs.existsSync(path.join(heroDir, 'kombucha1.png'))) {
    const p1 = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Kombucha product – hero slide 1' },
      file: await optimizedFile(path.join(heroDir, 'kombucha1.png'), IMAGE_PRESETS.card),
    })
    heroProduct1Id = String(p1.id)
  }
  if (fs.existsSync(path.join(heroDir, 'lakto1.png'))) {
    const p2 = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Lakto fermentation product – hero slide 2' },
      file: await optimizedFile(path.join(heroDir, 'lakto1.png'), IMAGE_PRESETS.card),
    })
    heroProduct2Id = String(p2.id)
  }

  if (fs.existsSync(path.join(imagesDir, 'Banner.png'))) {
    const workshopMedia = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Workshop CTA – fermentation vats industrial scene' },
      file: await optimizedFile(path.join(imagesDir, 'Banner.png'), IMAGE_PRESETS.hero),
    })
    workshopCtaImageId = String(workshopMedia.id)
  }

  if (fs.existsSync(path.join(workshopsDir, 'kombucha.png'))) {
    const f1 = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Featured – Kombucha workshop' },
      file: await optimizedFile(path.join(workshopsDir, 'kombucha.png'), IMAGE_PRESETS.card),
    })
    featuredImage1Id = String(f1.id)
  }
  if (fs.existsSync(path.join(workshopsDir, 'lakto.png'))) {
    const f2 = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Featured – Lakto fermented vegetables' },
      file: await optimizedFile(path.join(workshopsDir, 'lakto.png'), IMAGE_PRESETS.card),
    })
    featuredImage2Id = String(f2.id)
  }
  if (fs.existsSync(path.join(workshopsDir, 'tempeh.png'))) {
    const f3 = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Featured – Tempeh workshop' },
      file: await optimizedFile(path.join(workshopsDir, 'tempeh.png'), IMAGE_PRESETS.card),
    })
    featuredImage3Id = String(f3.id)
  }

  // ── DE: Save first (Payload generates IDs for featuredItems, heroSlides) ──
  await payload.updateGlobal({
    slug: 'shop',
    locale: 'de',
    data: {
      heroSlides:
        heroImageId && heroSlide2Id
          ? [
              {
                image: heroImageId,
                productImage: heroProduct1Id ?? heroImageId,
                title: 'LAKTO FERMENTATION.',
                description:
                  'Entdecke die Kunst der fermentierten Gemüse und natürlichen Konservierung.',
                ctaLabel: 'Jetzt shoppen',
                ctaUrl: '#products',
              },
              {
                image: heroSlide2Id,
                productImage: heroProduct2Id ?? heroSlide2Id,
                title: 'EINZIGARTIGE Aromen.',
                description:
                  'Erkunde unsere handgefertigten Fermente und entdecke Geschmäcker, die du noch nie gekannt hast.',
                ctaLabel: 'Entdecken',
                ctaUrl: '#products',
              },
            ]
            : heroImageId
            ? [
                {
                  image: heroImageId,
                  productImage: heroProduct1Id ?? heroImageId,
                  title: 'LAKTO FERMENTATION.',
                  description:
                    'Entdecke die Kunst der fermentierten Gemüse und natürlichen Konservierung.',
                  ctaLabel: 'Jetzt shoppen',
                  ctaUrl: '#products',
                },
              ]
            : undefined,
      heroTitleLine1: 'Entdecke',
      heroTitleLine2: 'EINZIGARTIGE Aromen.',
      heroTitleHighlight: 'EINZIGARTIGE',
      heroDescription:
        'Erkunde unsere handgefertigten Fermente und entdecke Aromen, die du noch nie gekannt hast.',
      heroBackgroundImage: heroImageId,
      heroCtaPrimaryLabel: 'Jetzt entdecken',
      heroCtaPrimaryUrl: '#products',
      heroCtaSecondaryLabel: 'Mehr erfahren',
      heroCtaSecondaryUrl: '/workshops',

      productSectionHeading: 'Entdecke EINZIGARTIG.',
      productSectionSubheading: 'AROMEN',
      productSectionIntro:
        'Tauche ein in eine Welt unglaublicher handgefertigter Fermente. Unsere sorgfältig kuratierte Kollektion bietet eine Vielzahl guter und gesunder Produkte für jeden Anlass.',
      viewAllButtonLabel: 'Alle Produkte anzeigen',
      viewAllButtonUrl: '/shop',
      loadMoreLabel: 'Mehr laden',
      addToCartLabel: 'In den Warenkorb',

      giftHeading: 'Verschenke ein besonderes Geschmackserlebnis',
      giftDescription:
        'Teile die Freude der Fermentation mit jemand Besonderem. Unsere Gutscheine ermöglichen die freie Wahl von Workshop oder Produkt.',
      giftButtonLabel: 'Mehr erfahren',
      giftButtonUrl: '/voucher',

      featuredHeading: 'Lerne EINZIGARTIGE Aromen',
      featuredHeadingHighlight: 'EINZIGARTIGE',
      featuredViewAllLabel: 'Alle anzeigen',
      featuredViewAllUrl: '/workshops',
      featuredItems: [
        {
          image: featuredImage1Id,
          title: 'Kombucha Geschichte',
          description: 'Erfahre mehr über die Ursprünge und Tradition des Kombucha.',
          readMoreLabel: 'Mehr lesen',
          url: '/workshops',
        },
        {
          image: featuredImage2Id,
          title: 'Kombucha Chemie',
          description: 'Verstehe die Wissenschaft hinter der Fermentation.',
          readMoreLabel: 'Mehr lesen',
          url: '/workshops',
        },
        {
          image: featuredImage3Id,
          title: 'Lakto-Fermentation',
          description: 'Lerne die Kunst der fermentierten Gemüse.',
          readMoreLabel: 'Mehr lesen',
          url: '/workshops',
        },
      ],

      workshopCtaHeading: 'Lerne Fermentation jederzeit und überall.',
      workshopCtaDescription:
        'Unsere Online-Kurse ermöglichen dir, in deinem eigenen Tempo zu lernen. Entdecke die Kunst der Fermentation bequem von zu Hause.',
      workshopCtaBackgroundImage: workshopCtaImageId,
      workshopCtaButtonLabel: 'Jetzt lernen',
      workshopCtaButtonUrl: '/workshops',
    },
    context: ctx,
  })

  // ── Read back DE to capture generated IDs ─────────────────────────────────
  const shopDE = await payload.findGlobal({
    slug: 'shop',
    locale: 'de',
    depth: 0,
  })

  const featuredItemsWithIds = (shopDE?.featuredItems ?? []).map((item: { id?: string | null }) => ({
    id: item.id ?? undefined,
  }))
  const heroSlidesWithIds = (shopDE?.heroSlides ?? []).map((item: { id?: string | null }) => ({
    id: item.id ?? undefined,
  }))

  // ── EN: Save reusing same IDs ─────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'shop',
    locale: 'en',
    data: {
      heroSlides:
        heroImageId && heroSlide2Id
            ? [
                {
                  id: heroSlidesWithIds[0]?.id,
                  image: heroImageId,
                  productImage: heroProduct1Id ?? heroImageId,
                  title: 'LAKTO FERMENTATION.',
                  description:
                    'Discover the art of fermented vegetables and natural preservation.',
                  ctaLabel: 'Shop Now',
                  ctaUrl: '#products',
                },
                {
                  id: heroSlidesWithIds[1]?.id,
                  image: heroSlide2Id,
                  productImage: heroProduct2Id ?? heroSlide2Id,
                  title: 'UNIQUE Flavours.',
                  description:
                    'Explore our handcrafted ferments and discover flavours you never knew existed.',
                  ctaLabel: 'Explore Now',
                  ctaUrl: '#products',
                },
              ]
          : heroImageId
            ? [
                {
                  id: heroSlidesWithIds[0]?.id,
                  image: heroImageId,
                  productImage: heroProduct1Id ?? heroImageId,
                  title: 'LAKTO FERMENTATION.',
                  description:
                    'Discover the art of fermented vegetables and natural preservation.',
                  ctaLabel: 'Shop Now',
                  ctaUrl: '#products',
                },
              ]
            : undefined,
      heroTitleLine1: 'Discover',
      heroTitleLine2: 'UNIQUE Flavours.',
      heroTitleHighlight: 'UNIQUE',
      heroDescription:
        'Explore our handcrafted ferments and discover flavours you never knew existed.',
      heroBackgroundImage: heroImageId,
      heroCtaPrimaryLabel: 'Explore Now',
      heroCtaPrimaryUrl: '#products',
      heroCtaSecondaryLabel: 'Learn More',
      heroCtaSecondaryUrl: '/workshops',

      productSectionHeading: 'Discover UNIQUE.',
      productSectionSubheading: 'FLAVOURS',
      productSectionIntro:
        'Dive into a world of incredible handcrafted Ferments. Our carefully curated collection features an array of good and healthy products for every occasion.',
      viewAllButtonLabel: 'View All Products',
      viewAllButtonUrl: '/shop',
      loadMoreLabel: 'Load More',
      addToCartLabel: 'Add to cart',

      giftHeading: 'Gift a special tasty experience',
      giftDescription:
        'Share the joy of fermentation with someone special. Our gift vouchers let them choose their own workshop or product.',
      giftButtonLabel: 'Find Out More',
      giftButtonUrl: '/voucher',

      featuredHeading: 'Learn UNIQUE Flavours',
      featuredHeadingHighlight: 'UNIQUE',
      featuredViewAllLabel: 'View all',
      featuredViewAllUrl: '/workshops',
      featuredItems: [
        {
          id: featuredItemsWithIds[0]?.id,
          image: featuredImage1Id,
          title: 'Kombucha History',
          description: 'Learn about the origins and tradition of Kombucha.',
          readMoreLabel: 'Read More',
          url: '/workshops',
        },
        {
          id: featuredItemsWithIds[1]?.id,
          image: featuredImage2Id,
          title: 'Kombucha Chemistry',
          description: 'Understand the science behind fermentation.',
          readMoreLabel: 'Read More',
          url: '/workshops',
        },
        {
          id: featuredItemsWithIds[2]?.id,
          image: featuredImage3Id,
          title: 'Lakto Fermentation',
          description: 'Learn the art of fermented vegetables.',
          readMoreLabel: 'Read More',
          url: '/workshops',
        },
      ],

      workshopCtaHeading: 'Learn Fermentation Anytime, Anywhere.',
      workshopCtaDescription:
        'Our online courses let you learn at your own pace. Discover the art of fermentation from the comfort of your home.',
      workshopCtaBackgroundImage: workshopCtaImageId,
      workshopCtaButtonLabel: 'Start Learning',
      workshopCtaButtonUrl: '/workshops',
    },
    context: ctx,
  })

  payload.logger.info('✓ Shop global seeded (DE + EN)!')

  // ── Seed Shop page in Pages collection (appears in /admin/collections/pages) ──
  const LEXICAL_ROOT = {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [{ type: 'text' as const, detail: 0, format: 0, mode: 'normal' as const, style: '', text: '', version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      textFormat: 0,
      version: 1,
    },
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }

  const shopPageDataDE = {
    heroSlides:
      heroImageId && heroSlide2Id
        ? [
            { image: heroImageId, productImage: heroProduct1Id ?? heroImageId, title: 'LAKTO FERMENTATION.', description: 'Entdecke die Kunst der fermentierten Gemüse und natürlichen Konservierung.', ctaLabel: 'Jetzt shoppen', ctaUrl: '#products' },
            { image: heroSlide2Id, productImage: heroProduct2Id ?? heroSlide2Id, title: 'EINZIGARTIGE Aromen.', description: 'Erkunde unsere handgefertigten Fermente und entdecke Geschmäcker, die du noch nie gekannt hast.', ctaLabel: 'Entdecken', ctaUrl: '#products' },
          ]
        : heroImageId
          ? [{ image: heroImageId, productImage: heroProduct1Id ?? heroImageId, title: 'LAKTO FERMENTATION.', description: 'Entdecke die Kunst der fermentierten Gemüse und natürlichen Konservierung.', ctaLabel: 'Jetzt shoppen', ctaUrl: '#products' }]
          : undefined,
    heroTitleLine1: 'Entdecke',
    heroTitleLine2: 'EINZIGARTIGE Aromen.',
    heroTitleHighlight: 'EINZIGARTIGE',
    heroDescription: 'Erkunde unsere handgefertigten Fermente und entdecke Aromen, die du noch nie gekannt hast.',
    heroBackgroundImage: heroImageId,
    heroCtaPrimaryLabel: 'Jetzt entdecken',
    heroCtaPrimaryUrl: '#products',
    heroCtaSecondaryLabel: 'Mehr erfahren',
    heroCtaSecondaryUrl: '/workshops',
    productSectionHeading: 'Entdecke EINZIGARTIG.',
    productSectionSubheading: 'AROMEN',
    productSectionIntro: 'Tauche ein in eine Welt unglaublicher handgefertigter Fermente. Unsere sorgfältig kuratierte Kollektion bietet eine Vielzahl guter und gesunder Produkte für jeden Anlass.',
    viewAllButtonLabel: 'Alle Produkte anzeigen',
    viewAllButtonUrl: '/shop',
    loadMoreLabel: 'Mehr laden',
    addToCartLabel: 'In den Warenkorb',
    benefitsHeading: 'Warum fermentierte Produkte?',
    benefitsItems: [
      { title: 'Darmgesundheit', description: 'Probiotika in fermentierten Lebensmitteln unterstützen die Verdauung und ein ausgewogenes Mikrobiom.' },
      { title: 'Nährstoff-Boost', description: 'Fermentation erhöht die Bioverfügbarkeit von Vitaminen, Mineralstoffen und Enzymen.' },
      { title: 'Natürliche Konservierung', description: 'Keine Zusatzstoffe nötig – Fermentation konserviert Lebensmittel natürlich mit lebenden Kulturen.' },
    ],
    giftHeading: 'Verschenke ein besonderes Geschmackserlebnis',
    giftDescription: 'Teile die Freude der Fermentation mit jemand Besonderem. Unsere Gutscheine ermöglichen die freie Wahl von Workshop oder Produkt.',
    giftButtonLabel: 'Mehr erfahren',
    giftButtonUrl: '/voucher',
    featuredHeading: 'Lerne EINZIGARTIGE Aromen',
    featuredHeadingHighlight: 'EINZIGARTIGE',
    featuredViewAllLabel: 'Alle anzeigen',
    featuredViewAllUrl: '/workshops',
    featuredItems: [
      { image: featuredImage1Id, title: 'Kombucha Geschichte', description: 'Erfahre mehr über die Ursprünge und Tradition des Kombucha.', readMoreLabel: 'Mehr lesen', url: '/workshops' },
      { image: featuredImage2Id, title: 'Kombucha Chemie', description: 'Verstehe die Wissenschaft hinter der Fermentation.', readMoreLabel: 'Mehr lesen', url: '/workshops' },
      { image: featuredImage3Id, title: 'Lakto-Fermentation', description: 'Lerne die Kunst der fermentierten Gemüse.', readMoreLabel: 'Mehr lesen', url: '/workshops' },
    ],
    workshopCtaHeading: 'Lerne Fermentation jederzeit und überall.',
    workshopCtaDescription: 'Unsere Online-Kurse ermöglichen dir, in deinem eigenen Tempo zu lernen. Entdecke die Kunst der Fermentation bequem von zu Hause.',
    workshopCtaBackgroundImage: workshopCtaImageId,
    workshopCtaButtonLabel: 'Jetzt lernen',
    workshopCtaButtonUrl: '/workshops',
  }

  const existingShopPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'shop' } },
    limit: 1,
    depth: 0,
  })

  const pageCtx = { ...ctx, disableRevalidate: true }

  if (existingShopPage.docs.length > 0) {
    const pageId = existingShopPage.docs[0].id
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      context: pageCtx,
      data: {
        title: 'Shop',
        slug: 'shop',
        _status: 'published',
        hero: { type: 'lowImpact' as const, richTextLowImpact: LEXICAL_ROOT },
        layout: [],
        shop: shopPageDataDE,
      },
    })
    const freshDE = (await payload.findByID({ collection: 'pages', id: pageId, locale: 'de', depth: 0 })) as { shop?: { featuredItems?: { id?: string }[]; heroSlides?: { id?: string }[] } }
    const shopDE = freshDE?.shop ?? {}
    const featuredIds = (shopDE.featuredItems ?? []).map((i) => i.id)
    const heroIds = (shopDE.heroSlides ?? []).map((i) => i.id)
    const shopPageDataEN = {
      ...shopPageDataDE,
      heroSlides: shopPageDataDE.heroSlides?.map((s, i) => ({ ...s, id: heroIds[i] })),
      featuredItems: [
        { id: featuredIds[0], image: featuredImage1Id, title: 'Kombucha History', description: 'Learn about the origins and tradition of Kombucha.', readMoreLabel: 'Read More', url: '/workshops' },
        { id: featuredIds[1], image: featuredImage2Id, title: 'Kombucha Chemistry', description: 'Understand the science behind fermentation.', readMoreLabel: 'Read More', url: '/workshops' },
        { id: featuredIds[2], image: featuredImage3Id, title: 'Lakto Fermentation', description: 'Learn the art of fermented vegetables.', readMoreLabel: 'Read More', url: '/workshops' },
      ],
      heroTitleLine1: 'Discover',
      heroTitleLine2: 'UNIQUE Flavours.',
      heroTitleHighlight: 'UNIQUE',
      heroDescription: 'Explore our handcrafted ferments and discover flavours you never knew existed.',
      heroCtaPrimaryLabel: 'Explore Now',
      heroCtaSecondaryLabel: 'Learn More',
      productSectionHeading: 'Discover UNIQUE.',
      productSectionSubheading: 'FLAVOURS',
      productSectionIntro: 'Dive into a world of incredible handcrafted Ferments. Our carefully curated collection features an array of good and healthy products for every occasion.',
      viewAllButtonLabel: 'View All Products',
      loadMoreLabel: 'Load More',
      addToCartLabel: 'Add to cart',
      benefitsHeading: 'Why fermented products?',
      benefitsItems: [
        { title: 'Gut health', description: 'Probiotics in fermented foods support digestive health and a balanced microbiome.' },
        { title: 'Nutrient boost', description: 'Fermentation enhances bioavailability of vitamins, minerals, and enzymes.' },
        { title: 'Natural preservation', description: 'No additives needed—fermentation preserves food naturally with live cultures.' },
      ],
      giftHeading: 'Gift a special tasty experience',
      giftDescription: 'Share the joy of fermentation with someone special. Our gift vouchers let them choose their own workshop or product.',
      giftButtonLabel: 'Find Out More',
      featuredHeading: 'Learn UNIQUE Flavours',
      featuredHeadingHighlight: 'UNIQUE',
      featuredViewAllLabel: 'View all',
      workshopCtaHeading: 'Learn Fermentation Anytime, Anywhere.',
      workshopCtaDescription: 'Our online courses let you learn at your own pace. Discover the art of fermentation from the comfort of your home.',
      workshopCtaButtonLabel: 'Start Learning',
    }
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'en',
      context: pageCtx,
      data: {
        title: 'Shop',
        slug: 'shop',
        _status: 'published',
        hero: { type: 'lowImpact' as const, richTextLowImpact: LEXICAL_ROOT },
        layout: [],
        shop: shopPageDataEN,
      },
    })
    payload.logger.info('✓ Shop page in Pages collection updated (DE + EN). Edit at /admin/collections/pages')
  } else {
    const page = await payload.create({
      collection: 'pages',
      locale: 'de',
      context: pageCtx,
      data: {
        title: 'Shop',
        slug: 'shop',
        _status: 'published',
        hero: { type: 'lowImpact' as const, richTextLowImpact: LEXICAL_ROOT },
        layout: [],
        shop: shopPageDataDE,
      },
    })
    const freshDE = (await payload.findByID({ collection: 'pages', id: page.id, locale: 'de', depth: 0 })) as { shop?: { featuredItems?: { id?: string }[]; heroSlides?: { id?: string }[] } }
    const shopDE = freshDE?.shop ?? {}
    const featuredIds = (shopDE.featuredItems ?? []).map((i) => i.id)
    const heroIds = (shopDE.heroSlides ?? []).map((i) => i.id)
    const shopPageDataEN = {
      ...shopPageDataDE,
      heroSlides: shopPageDataDE.heroSlides?.map((s, i) => ({ ...s, id: heroIds[i] })),
      featuredItems: [
        { id: featuredIds[0], image: featuredImage1Id, title: 'Kombucha History', description: 'Learn about the origins and tradition of Kombucha.', readMoreLabel: 'Read More', url: '/workshops' },
        { id: featuredIds[1], image: featuredImage2Id, title: 'Kombucha Chemistry', description: 'Understand the science behind fermentation.', readMoreLabel: 'Read More', url: '/workshops' },
        { id: featuredIds[2], image: featuredImage3Id, title: 'Lakto Fermentation', description: 'Learn the art of fermented vegetables.', readMoreLabel: 'Read More', url: '/workshops' },
      ],
      heroTitleLine1: 'Discover',
      heroTitleLine2: 'UNIQUE Flavours.',
      heroTitleHighlight: 'UNIQUE',
      heroDescription: 'Explore our handcrafted ferments and discover flavours you never knew existed.',
      heroCtaPrimaryLabel: 'Explore Now',
      heroCtaSecondaryLabel: 'Learn More',
      productSectionHeading: 'Discover UNIQUE.',
      productSectionSubheading: 'FLAVOURS',
      productSectionIntro: 'Dive into a world of incredible handcrafted Ferments. Our carefully curated collection features an array of good and healthy products for every occasion.',
      viewAllButtonLabel: 'View All Products',
      loadMoreLabel: 'Load More',
      addToCartLabel: 'Add to cart',
      benefitsHeading: 'Why fermented products?',
      benefitsItems: [
        { title: 'Gut health', description: 'Probiotics in fermented foods support digestive health and a balanced microbiome.' },
        { title: 'Nutrient boost', description: 'Fermentation enhances bioavailability of vitamins, minerals, and enzymes.' },
        { title: 'Natural preservation', description: 'No additives needed—fermentation preserves food naturally with live cultures.' },
      ],
      giftHeading: 'Gift a special tasty experience',
      giftDescription: 'Share the joy of fermentation with someone special. Our gift vouchers let them choose their own workshop or product.',
      giftButtonLabel: 'Find Out More',
      featuredHeading: 'Learn UNIQUE Flavours',
      featuredHeadingHighlight: 'UNIQUE',
      featuredViewAllLabel: 'View all',
      workshopCtaHeading: 'Learn Fermentation Anytime, Anywhere.',
      workshopCtaDescription: 'Our online courses let you learn at your own pace. Discover the art of fermentation from the comfort of your home.',
      workshopCtaButtonLabel: 'Start Learning',
    }
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      context: pageCtx,
      data: {
        title: 'Shop',
        slug: 'shop',
        _status: 'published',
        hero: { type: 'lowImpact' as const, richTextLowImpact: LEXICAL_ROOT },
        layout: [],
        shop: shopPageDataEN,
      },
    })
    payload.logger.info('✓ Shop page in Pages collection created (DE + EN). Edit at /admin/collections/pages')
  }

  process.exit(0)
}

seedShop().catch((err) => {
  console.error(err)
  process.exit(1)
})
