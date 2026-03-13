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
  // 1. Extract existing image IDs (preserve admin-uploaded images!)
  // ══════════════════════════════════════════════════════════════════════════

  const workshopsDir = path.resolve(process.cwd(), 'seed-assets/media/workshops')
  const heroDir = path.resolve(process.cwd(), 'seed-assets/media/hero')
  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')
  const galleryDir = path.resolve(process.cwd(), 'seed-assets/images/gallery')
  const iconsDir = path.resolve(process.cwd(), 'seed-assets/images/icons')

  // Extract existing image IDs from current page if it exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingImageIds: Record<string, any> = {}

  if (existingCheck.docs.length > 0 && forceRecreate) {
    payload.logger.info('Extracting existing image IDs to preserve admin-uploaded images...')
    const existingPage = (await payload.findByID({
      collection: 'pages',
      id: existingCheck.docs[0].id,
      locale: 'de',
      depth: 2,
    })) as Page

    // Extract hero slide images
    if (
      existingPage.hero &&
      typeof existingPage.hero === 'object' &&
      'heroSlides' in existingPage.hero
    ) {
      const heroSlides = existingPage.hero.heroSlides as unknown[]
      if (Array.isArray(heroSlides)) {
        for (const slide of heroSlides) {
          if (slide && typeof slide === 'object' && 'slideId' in slide) {
            const slideObj = slide as {
              slideId?: string
              leftImage?: unknown
              rightImage?: unknown
            }
            const slideId = slideObj.slideId
            if (
              slideObj.leftImage &&
              typeof slideObj.leftImage === 'object' &&
              'id' in slideObj.leftImage
            ) {
              existingImageIds[`${slideId}SlideLeft`] = String(
                (slideObj.leftImage as { id: string }).id,
              )
            }
            if (
              slideObj.rightImage &&
              typeof slideObj.rightImage === 'object' &&
              'id' in slideObj.rightImage
            ) {
              existingImageIds[`${slideId}SlideRight`] = String(
                (slideObj.rightImage as { id: string }).id,
              )
            }
          }
        }
      }
    }

    // Extract workshop slider images
    const layout = Array.isArray(existingPage.layout) ? existingPage.layout : []
    const workshopBlock = layout.find(
      (b: unknown) =>
        b &&
        typeof b === 'object' &&
        'blockType' in b &&
        (b as { blockType: string }).blockType === 'workshopSlider',
    )
    if (workshopBlock && typeof workshopBlock === 'object' && 'workshops' in workshopBlock) {
      const workshops = (workshopBlock as { workshops?: unknown[] }).workshops
      if (Array.isArray(workshops)) {
        for (const w of workshops) {
          if (w && typeof w === 'object' && 'slug' in w) {
            const workshop = w as { slug?: string; image?: unknown; images?: unknown[] }
            // Main image
            if (workshop.image && typeof workshop.image === 'object' && 'id' in workshop.image) {
              if (workshop.slug === 'lakto-gemuese') {
                existingImageIds.laktoImage = String((workshop.image as { id: string }).id)
              } else if (workshop.slug === 'kombucha') {
                existingImageIds.kombuchaImage = String((workshop.image as { id: string }).id)
              } else if (workshop.slug === 'tempeh') {
                existingImageIds.tempehImage = String((workshop.image as { id: string }).id)
              }
            }
            // Secondary images array
            if (Array.isArray(workshop.images) && workshop.images.length > 0) {
              const firstImg = workshop.images[0]
              if (firstImg && typeof firstImg === 'object' && 'image' in firstImg) {
                const imgObj = (firstImg as { image?: unknown }).image
                if (imgObj && typeof imgObj === 'object' && 'id' in imgObj) {
                  if (workshop.slug === 'lakto-gemuese') {
                    existingImageIds.workshopLaktoImage2 = String((imgObj as { id: string }).id)
                  } else if (workshop.slug === 'kombucha') {
                    existingImageIds.workshopKombuchaImage2 = String((imgObj as { id: string }).id)
                  } else if (workshop.slug === 'tempeh') {
                    existingImageIds.workshopTempehImage2 = String((imgObj as { id: string }).id)
                  }
                }
              }
            }
          }
        }
      }
    }

    // Extract gallery images (VoucherCta)
    const voucherBlock = layout.find(
      (b: unknown) =>
        b &&
        typeof b === 'object' &&
        'blockType' in b &&
        (b as { blockType: string }).blockType === 'voucherCta',
    )
    if (voucherBlock && typeof voucherBlock === 'object' && 'galleryImages' in voucherBlock) {
      const galleryImages = (voucherBlock as { galleryImages?: unknown[] }).galleryImages
      if (Array.isArray(galleryImages)) {
        existingImageIds.galleryMediaIds = galleryImages
          .filter((img: unknown) => img && typeof img === 'object' && 'image' in img)
          .map((img: unknown) => {
            const imgObj = (img as { image?: unknown }).image
            return imgObj && typeof imgObj === 'object' && 'id' in imgObj
              ? String((imgObj as { id: string }).id)
              : null
          })
          .filter((id: string | null): id is string => id !== null)
      }
    }

    // Extract HeroBanner background
    const heroBannerBlock = layout.find(
      (b: unknown) =>
        b &&
        typeof b === 'object' &&
        'blockType' in b &&
        (b as { blockType: string }).blockType === 'heroBanner',
    )
    if (
      heroBannerBlock &&
      typeof heroBannerBlock === 'object' &&
      'backgroundImage' in heroBannerBlock
    ) {
      const bgImg = (heroBannerBlock as { backgroundImage?: unknown }).backgroundImage
      if (bgImg && typeof bgImg === 'object' && 'id' in bgImg) {
        existingImageIds.bannerImage = String((bgImg as { id: string }).id)
      }
    }

    // Extract team photos
    const teamBlock = layout.find(
      (b: unknown) =>
        b &&
        typeof b === 'object' &&
        'blockType' in b &&
        (b as { blockType: string }).blockType === 'teamPreview',
    )
    if (teamBlock && typeof teamBlock === 'object' && 'members' in teamBlock) {
      const members = (teamBlock as { members?: unknown[] }).members
      if (Array.isArray(members)) {
        for (const member of members) {
          if (member && typeof member === 'object' && 'name' in member && 'photo' in member) {
            const m = member as { name?: string; photo?: unknown }
            const photo = m.photo
            if (photo && typeof photo === 'object' && 'id' in photo) {
              if (m.name === 'David Heider') {
                existingImageIds.davidPhoto = String((photo as { id: string }).id)
              } else if (m.name === 'Marcel Rauminger') {
                existingImageIds.marcelPhoto = String((photo as { id: string }).id)
              }
            }
          }
        }
      }
    }

    // Extract feature card icons
    const featureCardsBlock = layout.find(
      (b: unknown) =>
        b &&
        typeof b === 'object' &&
        'blockType' in b &&
        (b as { blockType: string }).blockType === 'featureCards',
    )
    if (
      featureCardsBlock &&
      typeof featureCardsBlock === 'object' &&
      'cards' in featureCardsBlock
    ) {
      const cards = (featureCardsBlock as { cards?: unknown[] }).cards
      if (Array.isArray(cards)) {
        for (const card of cards) {
          if (card && typeof card === 'object' && 'titleDe' in card && 'icon' in card) {
            const c = card as { titleDe?: string; icon?: unknown }
            const icon = c.icon
            if (icon && typeof icon === 'object' && 'id' in icon) {
              if (c.titleDe?.includes('Probiotika')) {
                existingImageIds.iconProbiotics = String((icon as { id: string }).id)
              } else if (c.titleDe?.includes('Nährstoffe')) {
                existingImageIds.iconNutrients = String((icon as { id: string }).id)
              } else if (c.titleDe?.includes('Geschmack')) {
                existingImageIds.iconFlavour = String((icon as { id: string }).id)
              }
            }
          }
        }
      }
    }

    const preserved = Object.keys(existingImageIds).filter(
      (k) => existingImageIds[k as keyof typeof existingImageIds],
    ).length
    payload.logger.info(`✅ Preserved ${preserved} existing image reference(s).`)
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. Upload images ONLY if they don't already exist
  //    Sequential writes — MongoDB Atlas M0 has no transactions.
  // ══════════════════════════════════════════════════════════════════════════

  payload.logger.info('Checking which images need to be uploaded...')

  // ── Workshop cover images ─────────────────────────────────────────────────
  let laktoImageId: string | undefined = existingImageIds.laktoImage
  if (!laktoImageId) {
    const laktoImage = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'Lakto-Gemüse workshop – fermented vegetables in glass jars' },
      file: await optimizedFile(path.join(workshopsDir, 'lakto.png'), IMAGE_PRESETS.card),
    })
    laktoImageId = String(laktoImage.id)
    payload.logger.info('  ✓ Uploaded lakto workshop image')
  } else {
    payload.logger.info('  → Reusing existing lakto workshop image')
  }

  let kombuchaImageId: string | undefined = existingImageIds.kombuchaImage
  if (!kombuchaImageId) {
    const kombuchaImage = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'Kombucha workshop – kombucha SCOBY and fermented tea in jar' },
      file: await optimizedFile(path.join(workshopsDir, 'kombucha.png'), IMAGE_PRESETS.card),
    })
    kombuchaImageId = String(kombuchaImage.id)
    payload.logger.info('  ✓ Uploaded kombucha workshop image')
  } else {
    payload.logger.info('  → Reusing existing kombucha workshop image')
  }

  let tempehImageId: string | undefined = existingImageIds.tempehImage
  if (!tempehImageId) {
    const tempehImage = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'Tempeh workshop – homemade tempeh on ceramic plate' },
      file: await optimizedFile(path.join(workshopsDir, 'tempeh.png'), IMAGE_PRESETS.card),
    })
    tempehImageId = String(tempehImage.id)
    payload.logger.info('  ✓ Uploaded tempeh workshop image')
  } else {
    payload.logger.info('  → Reusing existing tempeh workshop image')
  }

  // ── Per-slide product images (Hero Slider) ─────────────────────────────────
  let laktoSlideLeftId: string | undefined = existingImageIds.laktoSlideLeft
  if (!laktoSlideLeftId) {
    const laktoSlideLeft = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'slide-lakto-left – FermentFreude Sauerkraut Jar' },
      file: await optimizedFile(path.join(heroDir, 'lakto1.png'), IMAGE_PRESETS.card),
    })
    laktoSlideLeftId = String(laktoSlideLeft.id)
    payload.logger.info('  ✓ Uploaded lakto slide left image')
  } else {
    payload.logger.info('  → Reusing existing lakto slide left image')
  }

  let laktoSlideRightId: string | undefined = existingImageIds.laktoSlideRight
  if (!laktoSlideRightId) {
    const laktoSlideRight = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'slide-lakto-right – FermentFreude Sauerkraut Jar' },
      file: await optimizedFile(path.join(heroDir, 'lakto2.png'), IMAGE_PRESETS.card),
    })
    laktoSlideRightId = String(laktoSlideRight.id)
    payload.logger.info('  ✓ Uploaded lakto slide right image')
  } else {
    payload.logger.info('  → Reusing existing lakto slide right image')
  }

  let kombuchaSlideLeftId: string | undefined = existingImageIds.kombuchaSlideLeft
  if (!kombuchaSlideLeftId) {
    const kombuchaSlideLeft = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'slide-kombucha-left – FermentFreude Kombucha Apple & Carrot' },
      file: await optimizedFile(path.join(heroDir, 'kombucha1.png'), IMAGE_PRESETS.card),
    })
    kombuchaSlideLeftId = String(kombuchaSlideLeft.id)
    payload.logger.info('  ✓ Uploaded kombucha slide left image')
  } else {
    payload.logger.info('  → Reusing existing kombucha slide left image')
  }

  let kombuchaSlideRightId: string | undefined = existingImageIds.kombuchaSlideRight
  if (!kombuchaSlideRightId) {
    const kombuchaSlideRight = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'slide-kombucha-right – FermentFreude Kombucha Coffee Flavour' },
      file: await optimizedFile(path.join(heroDir, 'kombucha2.png'), IMAGE_PRESETS.card),
    })
    kombuchaSlideRightId = String(kombuchaSlideRight.id)
    payload.logger.info('  ✓ Uploaded kombucha slide right image')
  } else {
    payload.logger.info('  → Reusing existing kombucha slide right image')
  }

  let tempehSlideLeftId: string | undefined = existingImageIds.tempehSlideLeft
  if (!tempehSlideLeftId) {
    const tempehSlideLeft = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'slide-tempeh-left – FermentFreude Tempeh Slices' },
      file: await optimizedFile(path.join(heroDir, 'tempeh1.png'), IMAGE_PRESETS.card),
    })
    tempehSlideLeftId = String(tempehSlideLeft.id)
    payload.logger.info('  ✓ Uploaded tempeh slide left image')
  } else {
    payload.logger.info('  → Reusing existing tempeh slide left image')
  }

  let tempehSlideRightId: string | undefined = existingImageIds.tempehSlideRight
  if (!tempehSlideRightId) {
    const tempehSlideRight = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'slide-tempeh-right – FermentFreude Black Bean Tempeh' },
      file: await optimizedFile(path.join(heroDir, 'tempeh2.png'), IMAGE_PRESETS.card),
    })
    tempehSlideRightId = String(tempehSlideRight.id)
    payload.logger.info('  ✓ Uploaded tempeh slide right image')
  } else {
    payload.logger.info('  → Reusing existing tempeh slide right image')
  }

  let basicsSlideLeftId: string | undefined = existingImageIds.basicsSlideLeft
  if (!basicsSlideLeftId) {
    const basicsSlideLeft = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'slide-basics-left – David Heider, FermentFreude founder' },
      file: await optimizedFile(path.join(heroDir, 'DavidHeroCopy.png'), IMAGE_PRESETS.card),
    })
    basicsSlideLeftId = String(basicsSlideLeft.id)
    payload.logger.info('  ✓ Uploaded basics slide left image')
  } else {
    payload.logger.info('  → Reusing existing basics slide left image')
  }

  let basicsSlideRightId: string | undefined = existingImageIds.basicsSlideRight
  if (!basicsSlideRightId) {
    const basicsSlideRight = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'slide-basics-right – Marcel Rauminger, FermentFreude founder' },
      file: await optimizedFile(path.join(heroDir, 'MarcelHero.png'), IMAGE_PRESETS.card),
    })
    basicsSlideRightId = String(basicsSlideRight.id)
    payload.logger.info('  ✓ Uploaded basics slide right image')
  } else {
    payload.logger.info('  → Reusing existing basics slide right image')
  }

  // ── Workshop slider secondary images (SEPARATE uploads, not shared with hero) ──
  let workshopLaktoImage2Id: string | undefined = existingImageIds.workshopLaktoImage2
  if (!workshopLaktoImage2Id) {
    const workshopLaktoImage2 = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'workshop-lakto-secondary – Sauerkraut Jar product image' },
      file: await optimizedFile(path.join(heroDir, 'lakto1.png'), IMAGE_PRESETS.card),
    })
    workshopLaktoImage2Id = String(workshopLaktoImage2.id)
    payload.logger.info('  ✓ Uploaded workshop lakto secondary image')
  } else {
    payload.logger.info('  → Reusing existing workshop lakto secondary image')
  }

  let workshopKombuchaImage2Id: string | undefined = existingImageIds.workshopKombuchaImage2
  if (!workshopKombuchaImage2Id) {
    const workshopKombuchaImage2 = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'workshop-kombucha-secondary – Kombucha Apple & Carrot product image' },
      file: await optimizedFile(path.join(heroDir, 'kombucha1.png'), IMAGE_PRESETS.card),
    })
    workshopKombuchaImage2Id = String(workshopKombuchaImage2.id)
    payload.logger.info('  ✓ Uploaded workshop kombucha secondary image')
  } else {
    payload.logger.info('  → Reusing existing workshop kombucha secondary image')
  }

  let workshopTempehImage2Id: string | undefined = existingImageIds.workshopTempehImage2
  if (!workshopTempehImage2Id) {
    const workshopTempehImage2 = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'workshop-tempeh-secondary – Tempeh Slices product image' },
      file: await optimizedFile(path.join(heroDir, 'tempeh1.png'), IMAGE_PRESETS.card),
    })
    workshopTempehImage2Id = String(workshopTempehImage2.id)
    payload.logger.info('  ✓ Uploaded workshop tempeh secondary image')
  } else {
    payload.logger.info('  → Reusing existing workshop tempeh secondary image')
  }

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
  let galleryMediaIds: string[] = []

  if (
    existingImageIds.galleryMediaIds &&
    Array.isArray(existingImageIds.galleryMediaIds) &&
    existingImageIds.galleryMediaIds.length === 8
  ) {
    galleryMediaIds = existingImageIds.galleryMediaIds as string[]
    payload.logger.info('  → Reusing existing gallery images (8 images)')
  } else {
    payload.logger.info('  ✓ Uploading gallery images...')
    for (const cfg of galleryImageConfigs) {
      const m = await payload.create({
        collection: 'media',
        context: { skipAutoTranslate: true, skipRevalidate: true },
        data: { alt: cfg.alt },
        file: await optimizedFile(cfg.file, IMAGE_PRESETS.card),
      })
      galleryMediaIds.push(String(m.id))
    }
    payload.logger.info(`  ✓ Uploaded ${galleryMediaIds.length} gallery images`)
  }

  // ── HeroBanner background ─────────────────────────────────────────────────
  let bannerImageId: string | undefined = existingImageIds.bannerImage
  if (!bannerImageId) {
    const bannerImage = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'FermentFreude chefs banner – professional kitchen scene' },
      file: await optimizedFile(path.join(imagesDir, 'Banner.png'), IMAGE_PRESETS.hero),
    })
    bannerImageId = String(bannerImage.id)
    payload.logger.info('  ✓ Uploaded banner image')
  } else {
    payload.logger.info('  → Reusing existing banner image')
  }

  // ── Team photos ───────────────────────────────────────────────────────────
  let davidPhotoId: string | undefined = existingImageIds.davidPhoto
  if (!davidPhotoId) {
    const davidPhoto = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'David Heider – FermentFreude co-founder and instructor' },
      file: await optimizedFile(path.join(imagesDir, 'david-heider.jpg'), IMAGE_PRESETS.card),
    })
    davidPhotoId = String(davidPhoto.id)
    payload.logger.info('  ✓ Uploaded David photo')
  } else {
    payload.logger.info('  → Reusing existing David photo')
  }

  let marcelPhotoId: string | undefined = existingImageIds.marcelPhoto
  if (!marcelPhotoId) {
    const marcelPhoto = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'Marcel Rauminger – FermentFreude co-founder and instructor' },
      file: await optimizedFile(path.join(imagesDir, 'marcel-rauminger.jpg'), IMAGE_PRESETS.card),
    })
    marcelPhotoId = String(marcelPhoto.id)
    payload.logger.info('  ✓ Uploaded Marcel photo')
  } else {
    payload.logger.info('  → Reusing existing Marcel photo')
  }

  // ── FeatureCards icons (SVGs) ─────────────────────────────────────────────
  let iconProbioticsId: string | undefined = existingImageIds.iconProbiotics
  if (!iconProbioticsId) {
    const iconProbiotics = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'icon-feature – probiotics test tube and DNA' },
      file: await optimizedFile(path.join(iconsDir, 'probiotics.svg'), IMAGE_PRESETS.logo),
    })
    iconProbioticsId = String(iconProbiotics.id)
    payload.logger.info('  ✓ Uploaded probiotics icon')
  } else {
    payload.logger.info('  → Reusing existing probiotics icon')
  }

  let iconNutrientsId: string | undefined = existingImageIds.iconNutrients
  if (!iconNutrientsId) {
    const iconNutrients = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'icon-feature – nutrients bowl with vegetables' },
      file: await optimizedFile(path.join(iconsDir, 'nutrients.svg'), IMAGE_PRESETS.logo),
    })
    iconNutrientsId = String(iconNutrients.id)
    payload.logger.info('  ✓ Uploaded nutrients icon')
  } else {
    payload.logger.info('  → Reusing existing nutrients icon')
  }

  let iconFlavourId: string | undefined = existingImageIds.iconFlavour
  if (!iconFlavourId) {
    const iconFlavour = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'icon-feature – taste wine glasses' },
      file: await optimizedFile(path.join(iconsDir, 'taste.svg'), IMAGE_PRESETS.logo),
    })
    iconFlavourId = String(iconFlavour.id)
    payload.logger.info('  ✓ Uploaded flavour icon')
  } else {
    payload.logger.info('  → Reusing existing flavour icon')
  }

  payload.logger.info('✅ Image handling complete.')

  // ══════════════════════════════════════════════════════════════════════════
  // 3. Build block data (content lives in each block's seed.ts)
  // ══════════════════════════════════════════════════════════════════════════

  const { de: heroDE, en: heroEN } = buildHeroSlider({
    laktoSlideLeftId,
    laktoSlideRightId,
    kombuchaSlideLeftId,
    kombuchaSlideRightId,
    tempehSlideLeftId,
    tempehSlideRightId,
    basicsSlideLeftId,
    basicsSlideRightId,
  })

  const { de: workshopSliderDE, en: workshopSliderEN } = buildWorkshopSlider({
    laktoImageId,
    kombuchaImageId,
    tempehImageId,
    laktoImage2Id: workshopLaktoImage2Id,
    kombuchaImage2Id: workshopKombuchaImage2Id,
    tempehImage2Id: workshopTempehImage2Id,
  })

  const { de: voucherCtaDE, en: voucherCtaEN } = buildVoucherCta({ galleryMediaIds })

  const { de: heroBannerDE, en: heroBannerEN } = buildHeroBanner({
    backgroundImageId: bannerImageId,
  })

  const { de: featureCardsDE, en: featureCardsEN } = buildFeatureCards({
    iconProbioticsId,
    iconNutrientsId,
    iconFlavourId,
  })

  const { de: teamPreviewDE, en: teamPreviewEN } = buildTeamPreview({
    davidPhotoId,
    marcelPhotoId,
  })

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
  // 4. Find or create the Home page
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
  // 5. Save DE
  // ══════════════════════════════════════════════════════════════════════════

  payload.logger.info('Saving DE locale...')

  const layoutDE = [
    voucherCtaDE,
    productSliderDE,
    featureCardsDE,
    heroBannerDE,
    workshopSliderDE,
    teamPreviewDE,
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
