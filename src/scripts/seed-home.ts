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

import { buildHeroBanner, mergeHeroBannerEN } from '../blocks/HeroBanner/seed'
import { buildFeatureCards, mergeFeatureCardsEN } from '../blocks/FeatureCards/seed'
import { buildSponsorsBar, mergeSponsorsBarEN } from '../blocks/SponsorsBar/seed'
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

  // Clean up stale media
  for (const contains of ['workshop', 'hero', 'slide-', 'Gallery', 'icon-feature']) {
    await payload
      .delete({ collection: 'media', where: { alt: { contains } }, context: { skipAutoTranslate: true } })
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

  // ── Hero carousel background images ──────────────────────────────────────
  const heroImage1 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 1' },
    file: await optimizedFile(path.join(heroDir, 'hero-slide-1.png'), IMAGE_PRESETS.card),
  })
  const heroImage2 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 2' },
    file: await optimizedFile(path.join(heroDir, 'hero-slide-2.png'), IMAGE_PRESETS.card),
  })
  const heroImage3 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 3' },
    file: await optimizedFile(path.join(heroDir, 'hero-slide-3.png'), IMAGE_PRESETS.card),
  })
  const heroImage4 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 4' },
    file: await optimizedFile(path.join(heroDir, 'hero-slide-4.png'), IMAGE_PRESETS.card),
  })

  // ── Per-slide product images ──────────────────────────────────────────────
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

  // ── VoucherCta gallery (8 images) ─────────────────────────────────────────
  const galleryImageConfigs = [
    { file: path.join(galleryDir, 'gallery-1.png'), alt: 'Gallery – workshop scene, people laughing' },
    { file: path.join(galleryDir, 'gallery-2.png'), alt: 'Gallery – fermented food bowls on slate' },
    { file: path.join(galleryDir, 'gallery-5.png'), alt: 'Gallery – overhead dinner with FF logo' },
    { file: path.join(galleryDir, 'gallery-4.png'), alt: 'Gallery – chopping fresh ingredients' },
    { file: path.join(galleryDir, 'gallery-3.png'), alt: 'Gallery – workshop preparation scene' },
    { file: path.join(galleryDir, 'gallery-6.png'), alt: 'Gallery – table with bottles and flowers' },
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

  // ── Sponsor logos ─────────────────────────────────────────────────────────
  const sponsorLogo1 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Sponsor logo 1' },
    file: await optimizedFile(path.join(imagesDir, 'sponsor-logo.png'), IMAGE_PRESETS.logo),
  })
  const sponsorLogo2 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Sponsor logo 2' },
    file: await optimizedFile(path.join(imagesDir, 'sponsor-logo-2.png'), IMAGE_PRESETS.logo),
  })
  const sponsorLogo3 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Sponsor logo 3' },
    file: await optimizedFile(path.join(imagesDir, 'sponsor-logo-3.png'), IMAGE_PRESETS.logo),
  })
  const sponsorLogo4 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Sponsor logo 4' },
    file: await optimizedFile(path.join(imagesDir, 'sponsor-logo-4.png'), IMAGE_PRESETS.logo),
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
    heroImage1Id: String(heroImage1.id),
    heroImage2Id: String(heroImage2.id),
    heroImage3Id: String(heroImage3.id),
    heroImage4Id: String(heroImage4.id),
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
    laktoImage2Id: String(laktoSlideLeft.id),
    kombuchaImage2Id: String(kombuchaSlideLeft.id),
    tempehImage2Id: String(tempehSlideLeft.id),
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

  const { de: sponsorsBarDE, en: sponsorsBarEN } = buildSponsorsBar({
    sponsorLogo1Id: String(sponsorLogo1.id),
    sponsorLogo2Id: String(sponsorLogo2.id),
    sponsorLogo3Id: String(sponsorLogo3.id),
    sponsorLogo4Id: String(sponsorLogo4.id),
  })

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
    featureCardsDE,
    heroBannerDE,
    workshopSliderDE,
    teamPreviewDE,
    testimonialsDE,
    sponsorsBarDE,
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
  const freshLinks = (freshHero.links || []) as { id?: string }[]
  const freshHeroImages = (freshHero.heroImages || []) as { id?: string }[]
  const freshHeroSlides = (freshHero.heroSlides || []) as {
    id?: string
    attributes?: { id?: string }[]
  }[]
  const freshLayout = Array.isArray(freshDoc.layout) ? freshDoc.layout : []

  const findBlock = (type: string) =>
    freshLayout.find((b: unknown) => !!b && typeof b === 'object' && 'blockType' in b && (b as BlockItem).blockType === type) as BlockItem | undefined

  const wsBlock = findBlock('workshopSlider')
  const vcBlock = findBlock('voucherCta')
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
    mergeFeatureCardsEN(featureCardsEN, fcBlock ?? {}),
    mergeHeroBannerEN(heroBannerEN, hbBlock ?? {}),
    mergeWorkshopSliderEN(workshopSliderEN, wsBlock),
    mergeTeamPreviewEN(teamPreviewEN, tpBlock ?? {}),
    mergeTestimonialsEN(testimonialsEN, tmBlock ?? {}),
    mergeSponsorsBarEN(sponsorsBarEN, sbBlock ?? {}),
  ]

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      _status: 'published',
      title: 'Home',
      hero: mergeHeroSliderEN(heroEN, freshLinks, freshHeroImages, freshHeroSlides),
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
  payload.logger.info('   • Testimonials  • Sponsors Bar')
  process.exit(0)
}

seedHome().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
