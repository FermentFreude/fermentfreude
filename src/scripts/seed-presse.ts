/**
 * Seed the Presse / Press page from the client brief (docx).
 *
 * Run: pnpm seed presse --force
 */
import type { Media } from '@/payload-types'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import {
  PRESS_IMAGE_ALTS_DE,
  PRESS_IMAGE_ALTS_EN,
  PRESS_LOGO_ALTS_DE,
  PRESS_LOGO_ALTS_EN,
  presseHeroDE,
  presseHeroEN,
  presseMetaDE,
  presseMetaEN,
  pressMediaAwardsDE,
  pressMediaAwardsEN,
} from './data/presse'
import { IMAGE_PRESETS, optimizedFile, rasterizeLogoFile, readLocalFile } from './seed-image-utils'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const PRESS_CARD_FILES = [
  'card-1-kleine-zeitung.png',
  'card-2-kanal3.png',
  'card-3-elevator-pitch.png',
  'card-4-fermentationskongress.png',
  'card-5-food-masterclass.png',
]

const PRESS_LOGO_FILES = [
  'logo-kleine-zeitung.svg',
  'logo-kanal3.svg',
  'logo-junge-wirtschaft.svg',
  'logo-sfg.svg',
  'logo-food-masterclass.svg',
]

async function seedPresse() {
  const payload = await getPayload({ config })
  const forceRecreate = process.argv.includes('--force')

  console.log('🧪 Seeding Presse page…')

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'presse' } },
    limit: 10,
    depth: 0,
  })

  if (existing.docs.length > 0 && !forceRecreate) {
    const doc = existing.docs[0]
    const layout = Array.isArray(doc.layout) ? doc.layout : []
    if (layout.length > 0) {
      console.log(`⏭️  Presse page already has content. Run: pnpm seed presse --force`)
      process.exit(0)
    }
  }

  await payload
    .delete({
      collection: 'media',
      where: {
        or: [
          { alt: { contains: 'presse-' } },
          { alt: { contains: 'presse-logo-' } },
          { alt: { contains: 'presse-hero-video' } },
        ],
      },
    })
    .catch(() => undefined)

  for (const doc of existing.docs) {
    await payload.delete({ collection: 'pages', id: doc.id, context: ctx })
    console.log(`  🗑️  Deleted existing presse page ${doc.id}`)
  }

  const presseImagesDir = path.resolve(process.cwd(), 'seed-assets/images/presse')
  const presseLogosDir = path.join(presseImagesDir, 'logos')
  const pressImages: Media[] = []
  const pressLogos: Media[] = []
  let bannerImage: Media | undefined
  let heroPoster: Media | undefined
  let heroVideo: Media | undefined

  const heroVideoPath = path.resolve(
    process.cwd(),
    'public/assets/videos/presse-kanal3-hero-loop.mp4',
  )
  if (fs.existsSync(heroVideoPath)) {
    heroVideo = (await payload.create({
      collection: 'media',
      data: {
        alt: 'presse-hero-video – Kanal 3 TV-Beitrag über Fermentation (Fermentfreude)',
      },
      file: readLocalFile(heroVideoPath),
      context: { skipAutoTranslate: true },
    })) as Media
    console.log(`  🎬 Hero video (Kanal 3 MP4): ${heroVideo.id}`)
  }

  const bannerPath = path.join(presseImagesDir, 'card-1-kleine-zeitung.png')
  if (fs.existsSync(bannerPath)) {
    bannerImage = (await payload.create({
      collection: 'media',
      data: {
        alt: 'presse-hero – Die Fermentfreude-Gründer mit Käferbohnen-Tempeh und fermentiertem Gemüse',
      },
      file: await optimizedFile(bannerPath, IMAGE_PRESETS.hero),
      context: { skipAutoTranslate: true },
    })) as Media
    console.log(`  📸 Hero banner: ${bannerImage.id}`)
  }

  const heroPosterPath = path.join(presseImagesDir, 'card-2-kanal3.png')
  if (fs.existsSync(heroPosterPath)) {
    heroPoster = (await payload.create({
      collection: 'media',
      data: {
        alt: 'presse-hero-poster – Kanal 3 TV-Beitrag über Fermentation mit Fermentfreude',
      },
      file: await optimizedFile(heroPosterPath, IMAGE_PRESETS.hero),
      context: { skipAutoTranslate: true },
    })) as Media
    console.log(`  📸 Hero poster (Kanal 3): ${heroPoster.id}`)
  }

  for (let i = 0; i < PRESS_CARD_FILES.length; i++) {
    const filePath = path.join(presseImagesDir, PRESS_CARD_FILES[i]!)
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  Missing: ${PRESS_CARD_FILES[i]}`)
      continue
    }
    const created = await payload.create({
      collection: 'media',
      data: { alt: `presse-card-${i + 1} – ${PRESS_IMAGE_ALTS_DE[i] ?? 'Fermentfreude Presse'}` },
      file: await optimizedFile(filePath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    pressImages.push(created as Media)
    console.log(`  📸 Card ${i + 1}: ${created.id}`)
  }

  for (let i = 0; i < PRESS_LOGO_FILES.length; i++) {
    const filePath = path.join(presseLogosDir, PRESS_LOGO_FILES[i]!)
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  Missing logo: ${PRESS_LOGO_FILES[i]}`)
      continue
    }
    const created = await payload.create({
      collection: 'media',
      data: { alt: `presse-logo-${i + 1} ${PRESS_LOGO_ALTS_DE[i] ?? 'Outlet logo'}` },
      file: await rasterizeLogoFile(filePath),
      context: { skipAutoTranslate: true },
    })
    pressLogos.push(created as Media)
    console.log(`  🏷️  Logo ${i + 1}: ${created.id}`)
  }

  const deBlock = pressMediaAwardsDE()
  if (deBlock.intro) {
    ;(deBlock.intro as { bannerImage?: string }).bannerImage = bannerImage?.id
  }
  deBlock.items = deBlock.items.map((item, index) => ({
    ...item,
    image: pressImages[index]?.id,
    logo: pressLogos[index]?.id,
  }))

  const created = await payload.create({
    collection: 'pages',
    locale: 'de',
    context: ctx,
    data: {
      title: 'Presse',
      slug: 'presse',
      _status: 'published',
      hero: presseHeroDE({ heroVideo, heroPoster: heroPoster ?? bannerImage }),
      meta: presseMetaDE,
      layout: [deBlock],
    },
  })

  const fresh = await payload.findByID({
    collection: 'pages',
    id: created.id,
    locale: 'de',
    depth: 0,
  })

  const block = (fresh.layout ?? [])[0] as {
    id?: string
    items?: Array<{ id?: string; secondaryLinks?: Array<{ id?: string }> }>
  }

  if (!block?.id) {
    console.error('❌ No press block after create')
    process.exit(1)
  }

  const enBlock = pressMediaAwardsEN()
  if (enBlock.intro) {
    ;(enBlock.intro as { bannerImage?: string }).bannerImage = bannerImage?.id
  }
  enBlock.items = enBlock.items.map((item, index) => ({
    ...item,
    id: block.items?.[index]?.id,
    image: pressImages[index]?.id,
    logo: pressLogos[index]?.id,
    secondaryLinks: item.secondaryLinks?.map((link, linkIndex) => ({
      ...link,
      id: block.items?.[index]?.secondaryLinks?.[linkIndex]?.id,
    })),
  }))

  await payload.update({
    collection: 'pages',
    id: created.id,
    locale: 'en',
    context: ctx,
    data: {
      title: 'Press',
      _status: 'published',
      hero: presseHeroEN({ heroVideo, heroPoster: heroPoster ?? bannerImage }),
      meta: presseMetaEN,
      layout: [{ ...enBlock, id: block.id }],
    },
  })

  for (let i = 0; i < pressImages.length; i++) {
    const image = pressImages[i]
    if (!image?.id) continue
    await payload.update({
      collection: 'media',
      id: image.id,
      locale: 'en',
      context: ctx,
      data: { alt: `presse-card-${i + 1} – ${PRESS_IMAGE_ALTS_EN[i] ?? 'FermentFreude press'}` },
    })
  }

  if (heroVideo?.id) {
    await payload.update({
      collection: 'media',
      id: heroVideo.id,
      locale: 'en',
      context: ctx,
      data: {
        alt: 'presse-hero-video – Kanal 3 TV feature on fermentation (FermentFreude)',
      },
    })
  }

  if (heroPoster?.id) {
    await payload.update({
      collection: 'media',
      id: heroPoster.id,
      locale: 'en',
      context: ctx,
      data: {
        alt: 'presse-hero-poster – Kanal 3 TV feature on fermentation with FermentFreude',
      },
    })
  }

  if (bannerImage?.id) {
    await payload.update({
      collection: 'media',
      id: bannerImage.id,
      locale: 'en',
      context: ctx,
      data: {
        alt: 'presse-hero – FermentFreude founders with field-bean tempeh and fermented vegetables',
      },
    })
  }

  for (let i = 0; i < pressLogos.length; i++) {
    const logo = pressLogos[i]
    if (!logo?.id) continue
    await payload.update({
      collection: 'media',
      id: logo.id,
      locale: 'en',
      context: ctx,
      data: { alt: `presse-logo-${i + 1} ${PRESS_LOGO_ALTS_EN[i] ?? 'Outlet logo'}` },
    })
  }

  console.log('🎉 Presse page seeded → /presse')
  process.exit(0)
}

seedPresse().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
