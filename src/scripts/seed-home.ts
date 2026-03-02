/**
 * Home page seed — images + page composition only.
 *
 * Block content lives colocated with each block component:
 *   src/blocks/<BlockName>/seed.ts
 *   src/heros/HeroSlider/seed.ts
 *
 * Strategy:
 *   1. Upload images sequentially (MongoDB M0 = no transactions)
 *   2. Build block data by calling imported builder functions
 *   3. Save DE locale
 *   4. Read back to capture auto-generated array/block IDs
 *   5. Save EN locale reusing those exact IDs
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-home.ts
 */

import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

import type { Page } from '@/payload-types'

import { buildFeatureCards, mergeFeatureCardsEN } from '../blocks/FeatureCards/seed'
import { buildHeroBanner, mergeHeroBannerEN } from '../blocks/HeroBanner/seed'
import { buildProductSlider, mergeProductSliderEN } from '../blocks/ProductSlider/seed'

import { buildTeamPreview, mergeTeamPreviewEN } from '../blocks/TeamPreview/seed'
import { buildTestimonials, mergeTestimonialsEN } from '../blocks/Testimonials/seed'
import { buildVoucherCta, mergeVoucherCtaEN } from '../blocks/VoucherCta/seed'
import { buildWorkshopSlider, mergeWorkshopSliderEN } from '../blocks/WorkshopSlider/seed'
import { buildHeroSlider, mergeHeroSliderEN } from '../heros/HeroSlider/seed'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

// ── Shared type for reading back fresh IDs ─────────────────────────────────
interface WithId {
  id?: string
  [key: string]: unknown
}
interface BlockItem extends WithId {
  blockType?: string
  workshops?: { id?: string; features?: { id?: string }[] }[]
  cards?: WithId[]
  members?: WithId[]
  testimonials?: WithId[]
  sponsors?: WithId[]
  galleryImages?: WithId[]
}

async function seedHome() {
  const payload = await getPayload({ config })
  const forceRecreate = process.argv.includes('--force')

  // ══════════════════════════════════════════════════════════════════════════
  // 0. Non-destructive check — skip if page already has content
  // ══════════════════════════════════════════════════════════════════════════

  const existingCheck = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })

  if (existingCheck.docs.length > 0 && !forceRecreate) {
    const doc = existingCheck.docs[0]
    const layout = Array.isArray(doc.layout) ? doc.layout : []
    if (layout.length > 0) {
      payload.logger.info(
        '⏭️  Home page already has content (%d blocks). Skipping seed to protect admin changes.',
        layout.length,
      )
      payload.logger.info('   To overwrite, run: pnpm seed home --force')
      process.exit(0)
    }
  }

  if (forceRecreate) {
    payload.logger.info('🔄 --force flag detected. Will overwrite existing home page content.')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. Upload images
  //    Sequential writes — MongoDB Atlas M0 has no transactions.
  //    Delete stale copies first to avoid duplicates.
  // ══════════════════════════════════════════════════════════════════════════

  const workshopsDir = path.resolve(process.cwd(), 'seed-assets/media/workshops')
  const heroDir = path.resolve(process.cwd(), 'seed-assets/media/hero')
  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')
  const galleryDir = path.resolve(process.cwd(), 'seed-assets/images/gallery')
  const iconsDir = path.resolve(process.cwd(), 'seed-assets/images/icons')

  // Clean up stale media (prevents duplicates on --force re-runs)
  for (const contains of [
    'workshop',
    'hero',
    'slide-',
    'Gallery',
    'icon-feature',
    'Banner',
    'David Heider',
    'Marcel Rauminger',
  ]) {
    await payload
      .delete({
        collection: 'media',
        where: { alt: { contains } },
        context: { skipAutoTranslate: true },
      })
      .catch(() => {})
  }

  // ── Workshop cover images ─────────────────────────────────────────────────
  const laktoImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Lakto-Gemüse workshop – fermented vegetables in glass jars' },
    file: await optimizedFile(path.join(workshopsDir, 'lakto.png'), IMAGE_PRESETS.card),
  })
  const kombuchaImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Kombucha workshop – kombucha SCOBY and fermented tea in jar' },
    file: await optimizedFile(path.join(workshopsDir, 'kombucha.png'), IMAGE_PRESETS.card),
  })
  const tempehImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Tempeh workshop – homemade tempeh on ceramic plate' },
    file: await optimizedFile(path.join(workshopsDir, 'tempeh.png'), IMAGE_PRESETS.card),
  })

  // ── Per-slide product images (Hero Slider) ─────────────────────────────────
  const laktoSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-lakto-left – FermentFreude Sauerkraut Jar' },
    file: await optimizedFile(path.join(heroDir, 'lakto1.png'), IMAGE_PRESETS.card),
  })
  const laktoSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-lakto-right – FermentFreude Sauerkraut Jar' },
    file: await optimizedFile(path.join(heroDir, 'lakto2.png'), IMAGE_PRESETS.card),
  })
  const kombuchaSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-kombucha-left – FermentFreude Kombucha Apple & Carrot' },
    file: await optimizedFile(path.join(heroDir, 'kombucha1.png'), IMAGE_PRESETS.card),
  })
  const kombuchaSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-kombucha-right – FermentFreude Kombucha Coffee Flavour' },
    file: await optimizedFile(path.join(heroDir, 'kombucha2.png'), IMAGE_PRESETS.card),
  })
  const tempehSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-tempeh-left – FermentFreude Tempeh Slices' },
    file: await optimizedFile(path.join(heroDir, 'tempeh1.png'), IMAGE_PRESETS.card),
  })
  const tempehSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-tempeh-right – FermentFreude Black Bean Tempeh' },
    file: await optimizedFile(path.join(heroDir, 'tempeh2.png'), IMAGE_PRESETS.card),
  })
  const basicsSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-basics-left – David Heider, FermentFreude founder' },
    file: await optimizedFile(path.join(heroDir, 'DavidHeroCopy.png'), IMAGE_PRESETS.card),
  })
  const basicsSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-basics-right – Marcel Rauminger, FermentFreude founder' },
    file: await optimizedFile(path.join(heroDir, 'MarcelHero.png'), IMAGE_PRESETS.card),
  })

  // ── Workshop slider secondary images (SEPARATE uploads, not shared with hero) ──
  const workshopLaktoImage2 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'workshop-lakto-secondary – Sauerkraut Jar product image' },
    file: await optimizedFile(path.join(heroDir, 'lakto1.png'), IMAGE_PRESETS.card),
  })
  const workshopKombuchaImage2 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'workshop-kombucha-secondary – Kombucha Apple & Carrot product image' },
    file: await optimizedFile(path.join(heroDir, 'kombucha1.png'), IMAGE_PRESETS.card),
  })
  const workshopTempehImage2 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'workshop-tempeh-secondary – Tempeh Slices product image' },
    file: await optimizedFile(path.join(heroDir, 'tempeh1.png'), IMAGE_PRESETS.card),
  })

  // ── VoucherCta gallery (8 images) ─────────────────────────────────────────
  const galleryImageConfigs = [
    {
      file: path.join(galleryDir, 'gallery-1.png'),
      alt: 'Gallery – workshop scene, people laughing',
    },
    {
      file: path.join(galleryDir, 'gallery-2.png'),
      alt: 'Gallery – fermented food bowls on slate',
    },
    { file: path.join(galleryDir, 'gallery-5.png'), alt: 'Gallery – overhead dinner with FF logo' },
    { file: path.join(galleryDir, 'gallery-4.png'), alt: 'Gallery – chopping fresh ingredients' },
    { file: path.join(galleryDir, 'gallery-3.png'), alt: 'Gallery – workshop preparation scene' },
    {
      file: path.join(galleryDir, 'gallery-6.png'),
      alt: 'Gallery – table with bottles and flowers',
    },
    { file: path.join(galleryDir, 'gallery-7.png'), alt: 'Gallery – kombucha SCOBY jar closeup' },
    { file: path.join(galleryDir, 'gallery-8.png'), alt: 'Gallery – workshop table with chairs' },
  ]
  const galleryMediaIds: string[] = []
  for (const cfg of galleryImageConfigs) {
    const m = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: cfg.alt },
      file: await optimizedFile(cfg.file, IMAGE_PRESETS.card),
    })
    galleryMediaIds.push(String(m.id))
  }

  // ── HeroBanner background ─────────────────────────────────────────────────
  const bannerImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude chefs banner – professional kitchen scene' },
    file: await optimizedFile(path.join(imagesDir, 'Banner.png'), IMAGE_PRESETS.hero),
  })

  // ── Team photos ───────────────────────────────────────────────────────────
  const davidPhoto = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'David Heider – FermentFreude co-founder and instructor' },
    file: await optimizedFile(path.join(imagesDir, 'david-heider.jpg'), IMAGE_PRESETS.card),
  })
  const marcelPhoto = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Marcel Rauminger – FermentFreude co-founder and instructor' },
    file: await optimizedFile(path.join(imagesDir, 'marcel-rauminger.jpg'), IMAGE_PRESETS.card),
  })

  // ── FeatureCards icons (SVGs) ─────────────────────────────────────────────
  const iconProbiotics = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'icon-feature – probiotics test tube and DNA' },
    file: await optimizedFile(path.join(iconsDir, 'probiotics.svg'), IMAGE_PRESETS.logo),
  })
  const iconNutrients = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'icon-feature – nutrients bowl with vegetables' },
    file: await optimizedFile(path.join(iconsDir, 'nutrients.svg'), IMAGE_PRESETS.logo),
  })
  const iconFlavour = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'icon-feature – taste wine glasses' },
    file: await optimizedFile(path.join(iconsDir, 'taste.svg'), IMAGE_PRESETS.logo),
  })

  payload.logger.info('✅ All images uploaded.')

  // ══════════════════════════════════════════════════════════════════════════
  // 2. Build block data (content lives in each block's seed.ts)
  // ══════════════════════════════════════════════════════════════════════════

  const { de: heroDE, en: heroEN } = buildHeroSlider({
    laktoSlideLeftId: String(laktoSlideLeft.id),
    laktoSlideRightId: String(laktoSlideRight.id),
    kombuchaSlideLeftId: String(kombuchaSlideLeft.id),
    kombuchaSlideRightId: String(kombuchaSlideRight.id),
    tempehSlideLeftId: String(tempehSlideLeft.id),
    tempehSlideRightId: String(tempehSlideRight.id),
    basicsSlideLeftId: String(basicsSlideLeft.id),
    basicsSlideRightId: String(basicsSlideRight.id),
  })

  const { de: workshopSliderDE, en: workshopSliderEN } = buildWorkshopSlider({
    laktoImageId: String(laktoImage.id),
    kombuchaImageId: String(kombuchaImage.id),
    tempehImageId: String(tempehImage.id),
    laktoImage2Id: String(workshopLaktoImage2.id),
    kombuchaImage2Id: String(workshopKombuchaImage2.id),
    tempehImage2Id: String(workshopTempehImage2.id),
  })

  const { de: voucherCtaDE, en: voucherCtaEN } = buildVoucherCta({ galleryMediaIds })

  const { de: heroBannerDE, en: heroBannerEN } = buildHeroBanner({
    backgroundImageId: String(bannerImage.id),
  })

  const { de: featureCardsDE, en: featureCardsEN } = buildFeatureCards({
    iconProbioticsId: String(iconProbiotics.id),
    iconNutrientsId: String(iconNutrients.id),
    iconFlavourId: String(iconFlavour.id),
  })

  const { de: teamPreviewDE, en: teamPreviewEN } = buildTeamPreview({
    davidPhotoId: String(davidPhoto.id),
    marcelPhotoId: String(marcelPhoto.id),
  })

  const { de: testimonialsDE, en: testimonialsEN } = buildTestimonials()

  // ── SponsorsBar: grab the exact block from the About page ───────────────
  payload.logger.info('Reading SponsorsBar from About page...')
  const aboutPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    locale: 'de',
    limit: 1,
    depth: 0,
  })
  let sponsorsBarDE: Record<string, unknown> | null = null
  let sponsorsBarEN: Record<string, unknown> | null = null
  if (aboutPage.docs.length > 0) {
    const aboutDoc = aboutPage.docs[0]
    const aboutLayout = Array.isArray(aboutDoc.layout) ? aboutDoc.layout : []
    sponsorsBarDE =
      (aboutLayout.find((b) => b && b.blockType === 'sponsorsBar') as unknown as Record<
        string,
        unknown
      >) ?? null

    // Also read EN locale
    const aboutEN = await payload.findByID({
      collection: 'pages',
      id: aboutDoc.id,
      locale: 'en',
      depth: 0,
    })
    const aboutLayoutEN = Array.isArray(aboutEN.layout) ? aboutEN.layout : []
    sponsorsBarEN =
      (aboutLayoutEN.find((b) => b && b.blockType === 'sponsorsBar') as unknown as Record<
        string,
        unknown
      >) ?? null
  }

  if (!sponsorsBarDE || !sponsorsBarEN) {
    payload.logger.warn('⚠️  About page SponsorsBar not found. Skipping sponsors block on Home.')
  } else {
    payload.logger.info('✅ SponsorsBar copied from About page.')
  }

  // ── ProductSlider: use existing placeholder products ─────────────────────
  payload.logger.info('Fetching placeholder products for ProductSlider...')
  const existingProducts = await payload.find({
    collection: 'products',
    limit: 10,
    depth: 0,
  })
  const productIds = existingProducts.docs.map((p) => String(p.id))

  if (productIds.length === 0) {
    payload.logger.warn('No products found. Run "pnpm seed placeholders" first.')
  }

  const { de: productSliderDE, en: productSliderEN } = buildProductSlider({ productIds })

  // ══════════════════════════════════════════════════════════════════════════
  // 3. Find or create the Home page
  // ══════════════════════════════════════════════════════════════════════════

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })

  let homeId: string | number

  if (existing.docs.length > 0) {
    homeId = existing.docs[0].id
    payload.logger.info(`Home page found (id: ${homeId}). Updating...`)
  } else {
    payload.logger.info('No home page found. Creating...')
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      draft: true,
      context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
      data: { title: 'Home', slug: 'home', hero: { type: 'lowImpact' as const }, layout: [] },
    })
    homeId = created.id
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. Save DE
  // ══════════════════════════════════════════════════════════════════════════

  payload.logger.info('Saving DE locale...')

  const layoutDE = [
    voucherCtaDE,
    productSliderDE,
    featureCardsDE,
    heroBannerDE,
    workshopSliderDE,
    teamPreviewDE,
    testimonialsDE,
    ...(sponsorsBarDE
      ? [
          {
            ...sponsorsBarDE,
            id: undefined,
            sponsors: (sponsorsBarDE.sponsors as Record<string, unknown>[])?.map(
              (s: Record<string, unknown>) => ({ ...s, id: undefined }),
            ),
          },
        ]
      : []),
  ]

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      _status: 'published',
      title: 'Home',
      hero: heroDE,
      layout: layoutDE,
      meta: {
        title: 'FermentFreude — Gutes Essen, bessere Gesundheit, echte Freude',
        description:
          'Wir machen Fermentation genussvoll & zugänglich und stärken die Darmgesundheit durch Geschmack, Bildung und handgemachte Lebensmittel.',
      },
    },
  })

  payload.logger.info('✅ DE saved.')

  // Small delay to avoid WriteConflict on MongoDB Atlas M0
  await new Promise((r) => setTimeout(r, 2000))

  // ══════════════════════════════════════════════════════════════════════════
  // 5. Read back to capture auto-generated IDs
  // ══════════════════════════════════════════════════════════════════════════

  payload.logger.info('Reading back generated IDs...')

  const freshDoc = (await payload.findByID({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    depth: 0,
  })) as Page

  const freshHero = (freshDoc.hero || {}) as Record<string, unknown>
  const freshHeroSlides = (freshHero.heroSlides || []) as {
    id?: string
    attributes?: { id?: string }[]
  }[]
  const freshLayout = Array.isArray(freshDoc.layout) ? freshDoc.layout : []

  const findBlock = (type: string) =>
    freshLayout.find(
      (b: unknown) =>
        !!b && typeof b === 'object' && 'blockType' in b && (b as BlockItem).blockType === type,
    ) as BlockItem | undefined

  const wsBlock = findBlock('workshopSlider')
  const vcBlock = findBlock('voucherCta')
  const psBlock = findBlock('productSlider')
  const hbBlock = findBlock('heroBanner')
  const fcBlock = findBlock('featureCards')
  const tpBlock = findBlock('teamPreview')
  const tmBlock = findBlock('testimonials')
  const sbBlock = findBlock('sponsorsBar')

  if (!wsBlock) {
    payload.logger.error('❌ workshopSlider block not found after DE save.')
    process.exit(1)
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 6. Save EN reusing exact same IDs
  // ══════════════════════════════════════════════════════════════════════════

  payload.logger.info('Saving EN locale (reusing IDs from DE)...')

  const layoutEN = [
    mergeVoucherCtaEN(voucherCtaEN, vcBlock ?? {}),
    mergeProductSliderEN(productSliderEN, psBlock ?? {}),
    mergeFeatureCardsEN(featureCardsEN, fcBlock ?? {}),
    mergeHeroBannerEN(heroBannerEN, hbBlock ?? {}),
    mergeWorkshopSliderEN(workshopSliderEN, wsBlock),
    mergeTeamPreviewEN(teamPreviewEN, tpBlock ?? {}),
    mergeTestimonialsEN(testimonialsEN, tmBlock ?? {}),
    ...(sponsorsBarEN && sbBlock
      ? [
          {
            ...sponsorsBarEN,
            id: sbBlock.id,
            sponsors: (sponsorsBarEN.sponsors as Record<string, unknown>[])?.map(
              (s: Record<string, unknown>, i: number) => ({
                ...s,
                id: sbBlock.sponsors?.[i]?.id,
              }),
            ),
          },
        ]
      : []),
  ]

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      _status: 'published',
      title: 'Home',
      hero: mergeHeroSliderEN(heroEN, freshHeroSlides),
      layout: layoutEN,
      meta: {
        title: 'FermentFreude — Good food, better health, real joy',
        description:
          'We make fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods.',
      },
    },
  })

  payload.logger.info('✅ EN saved.')
  payload.logger.info('')
  payload.logger.info('🎉 Home page fully seeded (DE + EN):')
  payload.logger.info('   • Hero Slider   • Workshop Slider   • Voucher CTA')
  payload.logger.info('   • Hero Banner   • Feature Cards     • Team Preview')
  payload.logger.info('   • Testimonials  • Sponsors Bar      • Product Slider')
  process.exit(0)
}

seedHome().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
