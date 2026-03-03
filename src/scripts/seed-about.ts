/**
 * Seed the About page with decomposed blocks.
 * Creates an "Über uns" / "About Us" page composed from:
 *   Hero (highImpact) + OurStory + TeamCards + SponsorsBar + ReadyToLearnCTA
 *
 * Uploads images to Payload Media (Cloudflare R2) so they're editable from /admin.
 * Seeds both DE (default) and EN locales, reusing array IDs.
 *
 * Following the rules:
 * - Schema first: all fields are CMS block fields
 * - Seed both languages: DE first → read back IDs → EN with same IDs
 * - Context flags: skipRevalidate, disableRevalidate, skipAutoTranslate
 * - Sequential DB writes (no Promise.all) for MongoDB Atlas M0
 * - Images uploaded via Payload Media collection (stored in Cloudflare R2)
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-about.ts
 */
import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

import {
  aboutHeroSlidesDE,
  aboutHeroSlidesEN,
  closingTaglineDE,
  closingTaglineEN,
  ourStoryDE,
  ourStoryEN,
  readyToLearnDE,
  readyToLearnEN,
  sponsorsBarDE,
  sponsorsBarEN,
  statsDE,
  statsEN,
  teamCardsDE,
  teamCardsEN,
  valuesDE,
  valuesEN,
} from './data/about'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

async function seedAbout() {
  const payload = await getPayload({ config })

  console.log('🧪 Seeding About page…')

  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')

  // ── 1. Delete any existing about page ──────────────────────
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    limit: 10,
    depth: 0,
  })

  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'pages',
      id: doc.id,
      context: { skipRevalidate: true, disableRevalidate: true },
    })
    console.log(`  🗑️  Deleted existing about page ${doc.id}`)
  }

  // ── 2. Delete old about-related media to avoid duplicates ──
  await payload
    .delete({
      collection: 'media',
      where: { alt: { contains: 'about-' } },
    })
    .catch(() => {
      /* none found */
    })

  // ── 3. Upload images to Payload Media (Cloudflare R2) ────────
  console.log('  📸 Uploading images to Media collection…')

  const heroImage = await payload.create({
    collection: 'media',
    data: { alt: 'about-hero – FermentFreude about page banner' },
    file: await optimizedFile(path.join(imagesDir, 'Banner.png'), IMAGE_PRESETS.hero),
    context: { skipAutoTranslate: true },
  })
  console.log(`    ✅ Hero banner: ${heroImage.id}`)

  const marcelImage = await payload.create({
    collection: 'media',
    data: { alt: 'about-team – Marcel Rauminger, Fermentation Specialist & Chef' },
    file: await optimizedFile(path.join(imagesDir, 'marcel-rauminger.jpg'), IMAGE_PRESETS.card),
    context: { skipAutoTranslate: true },
  })
  console.log(`    ✅ Marcel photo: ${marcelImage.id}`)

  const davidImage = await payload.create({
    collection: 'media',
    data: { alt: 'about-team – David Heider, Nutrition Specialist & Food Developer' },
    file: await optimizedFile(path.join(imagesDir, 'david-heider.jpg'), IMAGE_PRESETS.card),
    context: { skipAutoTranslate: true },
  })
  console.log(`    ✅ David photo: ${davidImage.id}`)

  // Upload sponsor logos
  const sponsorImages = []
  const sponsorFiles = [
    { file: 'sponsor-logo.png', alt: 'about-sponsor – Sponsor Logo 1' },
    { file: 'sponsor-logo-2.png', alt: 'about-sponsor – Sponsor Logo 2' },
    { file: 'sponsor-logo-3.png', alt: 'about-sponsor – Sponsor Logo 3' },
    { file: 'sponsor-logo-4.png', alt: 'about-sponsor – Sponsor Logo 4' },
  ]

  for (const s of sponsorFiles) {
    const img = await payload.create({
      collection: 'media',
      data: { alt: s.alt },
      file: await optimizedFile(path.join(imagesDir, s.file), IMAGE_PRESETS.logo),
      context: { skipAutoTranslate: true },
    })
    sponsorImages.push(img)
    console.log(`    ✅ ${s.file}: ${img.id}`)
  }

  // ── 4. Build block data ────────────────────────────────────
  const imgArgs = {
    heroImage,
    marcelImage,
    davidImage,
    sponsorLogos: sponsorImages,
  }

  // ── 5. Create the About page in DE (default locale) ────────
  const heroSlidesDE = aboutHeroSlidesDE(imgArgs)
  const heroSlidesEN = aboutHeroSlidesEN(imgArgs)

  const aboutPage = await payload.create({
    collection: 'pages',
    locale: 'de',
    context: {
      skipRevalidate: true,
      disableRevalidate: true,
      skipAutoTranslate: true,
    },
    data: {
      title: 'Über uns',
      slug: 'about',
      _status: 'published',
      hero:
        heroSlidesDE.length > 0
          ? ({ type: 'heroCarousel' as const, slides: heroSlidesDE } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
          : ({ type: 'highImpact' as const, media: imgArgs.heroImage?.id } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
      layout: [
        ourStoryDE(),
        valuesDE(),
        statsDE(),
        teamCardsDE(imgArgs),
        sponsorsBarDE(imgArgs),
        readyToLearnDE(),
        closingTaglineDE(),
      ] as any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  })

  console.log(`  ✅ Created About page ${aboutPage.id} (DE)`)

  // ── 6. Read back the layout and hero to get array IDs ──────────────
  const created = await payload.findByID({
    collection: 'pages',
    id: aboutPage.id,
    depth: 0,
    locale: 'de',
  })

  const blocks = created.layout ?? []
  if (blocks.length < 7) {
    console.error(`  ❌ Expected 7 layout blocks, got ${blocks.length}`)
    process.exit(1)
  }

  const freshHero = (created.hero ?? {}) as { slides?: Array<{ id?: string }> }
  const slideIds = (freshHero.slides ?? []).map((s) => s.id)

  // Block IDs
  const ourStoryBlockId = blocks[0]!.id
  const valuesBlockId = blocks[1]!.id
  const statsBlockId = blocks[2]!.id
  const teamCardsBlockId = blocks[3]!.id
  const sponsorsBarBlockId = blocks[4]!.id
  const readyToLearnBlockId = blocks[5]!.id
  const closingTaglineBlockId = blocks[6]!.id

  // Extract array IDs from OurStory paragraphs
  const ourStoryBlock = blocks[0] as unknown as Record<string, unknown>
  const paragraphIds = ((ourStoryBlock?.paragraphs ?? []) as Array<{ id?: string }>).map(
    (p) => p.id,
  )

  // Extract array IDs from Values items
  const valuesBlock = blocks[1] as unknown as Record<string, unknown>
  const valuesItemIds = ((valuesBlock?.items ?? []) as Array<{ id?: string }>).map((i) => i.id)

  // Extract array IDs from Stats items
  const statsBlock = blocks[2] as unknown as Record<string, unknown>
  const statsItemIds = ((statsBlock?.items ?? []) as Array<{ id?: string }>).map((i) => i.id)

  // Extract array IDs from TeamCards members
  const teamCardsBlock = blocks[3] as unknown as Record<string, unknown>
  const memberIds = ((teamCardsBlock?.members ?? []) as Array<{ id?: string }>).map((m) => m.id)

  // Extract array IDs from SponsorsBar sponsors
  const sponsorsBarBlock = blocks[4] as unknown as Record<string, unknown>
  const sponsorIds = ((sponsorsBarBlock?.sponsors ?? []) as Array<{ id?: string }>).map((s) => s.id)

  // ── 7. Build EN data with same array IDs ──────────────────
  const enOurStory = ourStoryEN()
  enOurStory.paragraphs = enOurStory.paragraphs.map((p, idx) => ({
    ...p,
    id: paragraphIds[idx],
  }))

  const enValues = valuesEN()
  if (enValues.items && valuesItemIds.length > 0) {
    enValues.items = enValues.items.map((item, idx) => ({
      ...item,
      id: valuesItemIds[idx],
    }))
  }

  const enStats = statsEN()
  if (enStats.items && statsItemIds.length > 0) {
    enStats.items = enStats.items.map((item, idx) => ({
      ...item,
      id: statsItemIds[idx],
    }))
  }

  const enTeamCards = teamCardsEN(imgArgs)
  enTeamCards.members = enTeamCards.members.map((m, idx) => ({
    ...m,
    id: memberIds[idx],
  }))

  const enSponsorsBar = sponsorsBarEN(imgArgs)
  if (enSponsorsBar.sponsors && sponsorIds.length > 0) {
    enSponsorsBar.sponsors = enSponsorsBar.sponsors.map((s, idx) => ({
      ...s,
      id: sponsorIds[idx],
    }))
  }

  // ── 8. Update EN locale ───────────────────────────────────
  const enSlides =
    heroSlidesEN.length > 0 && slideIds.length === heroSlidesEN.length
      ? heroSlidesEN.map((s, i) => ({ ...s, id: slideIds[i] }))
      : heroSlidesEN

  await payload.update({
    collection: 'pages',
    id: aboutPage.id,
    locale: 'en',
    context: {
      skipRevalidate: true,
      disableRevalidate: true,
      skipAutoTranslate: true,
    },
    data: {
      title: 'About Us',
      _status: 'published',
      hero:
        enSlides.length > 0
          ? ({ type: 'heroCarousel' as const, slides: enSlides } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
          : ({ type: 'highImpact' as const, media: imgArgs.heroImage?.id } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
      layout: [
        { id: ourStoryBlockId, ...enOurStory },
        { id: valuesBlockId, ...enValues },
        { id: statsBlockId, ...enStats },
        { id: teamCardsBlockId, ...enTeamCards },
        { id: sponsorsBarBlockId, ...enSponsorsBar },
        { id: readyToLearnBlockId, ...readyToLearnEN() },
        { id: closingTaglineBlockId, ...closingTaglineEN() },
      ] as any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  })

  console.log(`  ✅ Updated About page ${aboutPage.id} (EN)`)
  console.log('🎉 About page seeded successfully!')
  console.log('   Hero: carousel with 3 slides | Blocks: OurStory → Values → Stats → TeamCards → SponsorsBar → ReadyToLearnCTA → ClosingTagline')
  console.log('   All images stored in Payload Media (Cloudflare R2) — editable from /admin')

  process.exit(0)
}

seedAbout().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
