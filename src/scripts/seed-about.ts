/**
 * Seed the About page with decomposed blocks.
 * Creates an "Über uns" / "About Us" page composed from:
 *   Hero (heroSplit: text + image) + TeamCards + OurStory + SponsorsBar + ReadyToLearnCTA + ContactBlock
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
 * Testimonials are now a global (edit-once in /admin), not a per-page block.
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-about.ts
 */
import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

import {
  aboutHeroDE,
  aboutHeroEN,
  ourStoryDE,
  ourStoryEN,
  readyToLearnDE,
  readyToLearnEN,
  sponsorsBarDE,
  sponsorsBarEN,
  teamCardsDE,
  teamCardsEN,
} from './data/about'
import { contactDataDE, contactDataEN } from './data/contact'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

async function seedAbout() {
  const payload = await getPayload({ config })
  const forceRecreate = process.argv.includes('--force')

  console.log('🧪 Seeding About page…')

  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')

  // ── 0. Non-destructive check — skip if page already has content ──
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    limit: 10,
    depth: 0,
  })

  if (existing.docs.length > 0 && !forceRecreate) {
    const doc = existing.docs[0]
    const layout = Array.isArray(doc.layout) ? doc.layout : []
    if (layout.length > 0) {
      console.log(
        `⏭️  About page already has content (${layout.length} blocks). Skipping seed to protect admin changes.`,
      )
      console.log('   To overwrite, run: pnpm seed about --force')
      process.exit(0)
    }
  }

  if (forceRecreate) {
    console.log('🔄 --force flag detected. Will overwrite existing about page content.')
  }

  // ── 1. Delete any existing about page ──────────────────────
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

  const fs = await import('fs')

  const heroImage = await payload.create({
    collection: 'media',
    data: { alt: 'about-hero – FermentFreude about page banner' },
    file: await optimizedFile(path.join(imagesDir, 'Banner.png'), IMAGE_PRESETS.hero),
    context: { skipAutoTranslate: true },
  })
  console.log(`    ✅ Hero banner: ${heroImage.id}`)

  // Hero split image (apple cider still life)
  let heroSplitImage = heroImage
  const appleCiderPath = path.join(imagesDir, 'about-hero-apple-cider.png')
  if (fs.existsSync(appleCiderPath)) {
    heroSplitImage = await payload.create({
      collection: 'media',
      data: { alt: 'about-hero – apple cider and fresh apples, fermentation still life' },
      file: await optimizedFile(appleCiderPath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    console.log(`    ✅ Hero split image (apple cider): ${heroSplitImage.id}`)
  }

  const marcelImage = await payload.create({
    collection: 'media',
    data: { alt: 'about-team – Marcel Rauminger, Fermentation Specialist & Chef' },
    file: await optimizedFile(path.join(imagesDir, 'marcel-rauminger.png'), IMAGE_PRESETS.card),
    context: { skipAutoTranslate: true },
  })
  console.log(`    ✅ Marcel photo: ${marcelImage.id}`)

  const davidImage = await payload.create({
    collection: 'media',
    data: { alt: 'about-team – David Heider, Nutrition Specialist & Food Developer' },
    file: await optimizedFile(path.join(imagesDir, 'david-heider.png'), IMAGE_PRESETS.card),
    context: { skipAutoTranslate: true },
  })
  console.log(`    ✅ David photo: ${davidImage.id}`)

  let ourStoryImage1 = heroImage
  let ourStoryImage2 = marcelImage
  const vegetablesPath = path.join(imagesDir, 'our-story-vegetables.png')
  const kitchenPath = path.join(imagesDir, 'our-story-kitchen.png')
  if (fs.existsSync(vegetablesPath)) {
    ourStoryImage1 = await payload.create({
      collection: 'media',
      data: { alt: 'about-our-story – fresh vegetables in brown paper' },
      file: await optimizedFile(vegetablesPath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    console.log(`    ✅ Our Story image 1 (vegetables): ${ourStoryImage1.id}`)
  }
  if (fs.existsSync(kitchenPath)) {
    ourStoryImage2 = await payload.create({
      collection: 'media',
      data: { alt: 'about-our-story – kitchen fermentation still life' },
      file: await optimizedFile(kitchenPath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    console.log(`    ✅ Our Story image 2 (kitchen): ${ourStoryImage2.id}`)
  }

  // Upload sponsor logos — same images as Home page (public/assets/images/sponsors/)
  const sponsorImages = []
  const sponsorsDir = path.resolve(process.cwd(), 'public/assets/images/sponsors')
  const sponsorFiles: { file: string; fallback: string; alt: string }[] = [
    {
      file: 'sustainable-food.png',
      fallback: 'sponsor-logo.png',
      alt: 'about-sponsor – aws Sustainable Food Systems Initiative',
    },
    {
      file: 'aws.png',
      fallback: 'sponsor-logo-2.png',
      alt: 'about-sponsor – Austria Wirtschafts Service',
    },
    {
      file: 'science-park.png',
      fallback: 'sponsor-logo-3.png',
      alt: 'about-sponsor – Science Park Graz',
    },
    {
      file: 'sparkasse.png',
      fallback: 'sponsor-logo-4.png',
      alt: 'about-sponsor – Steiermärkische Sparkasse',
    },
  ]

  for (const s of sponsorFiles) {
    const preferredPath = path.join(sponsorsDir, s.file)
    const fallbackPath = path.join(imagesDir, s.fallback)
    const filePath = fs.existsSync(preferredPath) ? preferredPath : fallbackPath
    const img = await payload.create({
      collection: 'media',
      data: { alt: s.alt },
      file: await optimizedFile(filePath, IMAGE_PRESETS.logo),
      context: { skipAutoTranslate: true },
    })
    sponsorImages.push(img)
    console.log(`    ✅ ${s.file}: ${img.id}`)
  }

  // ── 4. Build block data ────────────────────────────────────
  const imgArgs = {
    heroImage,
    heroSplitImage,
    marcelImage,
    davidImage,
    sponsorLogos: sponsorImages,
    ourStoryImage1,
    ourStoryImage2,
  }

  // ── 5. Create the About page in DE (default locale) ────────
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
      hero: aboutHeroDE(imgArgs),
      layout: [
        teamCardsDE(imgArgs),
        ourStoryDE(),
        sponsorsBarDE(imgArgs),
        readyToLearnDE(),
        {
          blockType: 'contactBlock',
          hideHeroSection: true,
          hideCtaBanner: true,
          hideMap: true,
          ...contactDataDE({}),
        },
      ] as any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  })

  console.log(`  ✅ Created About page ${aboutPage.id} (DE)`)

  // ── 6. Read back the layout to get array IDs ──────────────
  const created = await payload.findByID({
    collection: 'pages',
    id: aboutPage.id,
    depth: 0,
    locale: 'de',
  })

  const blocks = created.layout ?? []
  if (blocks.length < 5) {
    console.error(`  ❌ Expected 5 layout blocks, got ${blocks.length}`)
    process.exit(1)
  }

  // Block IDs (order: TeamCards, OurStory, SponsorsBar, ReadyToLearnCTA, ContactBlock)
  const teamCardsBlockId = blocks[0]!.id
  const ourStoryBlockId = blocks[1]!.id
  const sponsorsBarBlockId = blocks[2]!.id
  const readyToLearnBlockId = blocks[3]!.id
  const contactBlockId = blocks[4]!.id

  // Extract subject option IDs from ContactBlock
  const contactBlock = blocks[4] as unknown as Record<string, unknown>
  const contactForm = contactBlock?.contactForm as Record<string, unknown> | undefined
  const subjectOptions = contactForm?.subjectOptions as Record<string, unknown> | undefined
  const subjectOptionIds = ((subjectOptions?.options ?? []) as Array<{ id?: string }>).map(
    (o) => o.id,
  )

  // Extract array IDs from OurStory paragraphs
  const ourStoryBlock = blocks[1] as unknown as Record<string, unknown>
  const paragraphIds = ((ourStoryBlock?.paragraphs ?? []) as Array<{ id?: string }>).map(
    (p) => p.id,
  )

  // Extract array IDs from TeamCards members
  const teamCardsBlock = blocks[0] as unknown as Record<string, unknown>
  const memberIds = ((teamCardsBlock?.members ?? []) as Array<{ id?: string }>).map((m) => m.id)

  // Extract array IDs from SponsorsBar sponsors
  const sponsorsBarBlock = blocks[2] as unknown as Record<string, unknown>
  const sponsorIds = ((sponsorsBarBlock?.sponsors ?? []) as Array<{ id?: string }>).map((s) => s.id)

  // ── 7. Build EN data with same array IDs ──────────────────
  const enOurStory = ourStoryEN(imgArgs)
  enOurStory.paragraphs = enOurStory.paragraphs.map((p, idx) => ({
    ...p,
    id: paragraphIds[idx],
  }))

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

  const enContactData = contactDataEN({})
  if (enContactData.contactForm?.subjectOptions?.options && subjectOptionIds.length > 0) {
    enContactData.contactForm.subjectOptions.options =
      enContactData.contactForm.subjectOptions.options.map((o: { label: string }, idx: number) => ({
        ...o,
        id: subjectOptionIds[idx],
      }))
  }

  // ── 8. Update EN locale ───────────────────────────────────
  const enHero = aboutHeroEN(imgArgs)

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
      hero: enHero,
      layout: [
        { id: teamCardsBlockId, ...enTeamCards },
        { id: ourStoryBlockId, ...enOurStory },
        { id: sponsorsBarBlockId, ...enSponsorsBar },
        { id: readyToLearnBlockId, ...readyToLearnEN() },
        {
          id: contactBlockId,
          blockType: 'contactBlock',
          hideHeroSection: true,
          hideCtaBanner: true,
          hideMap: true,
          ...enContactData,
        },
      ] as any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  })

  console.log(`  ✅ Updated About page ${aboutPage.id} (EN)`)
  console.log('🎉 About page seeded successfully!')
  console.log(
    '   Blocks: hero → OurStory → TeamCards → SponsorsBar → Testimonials → ReadyToLearnCTA → ContactBlock',
  )
  console.log('   All images stored in Payload Media (Cloudflare R2) — editable from /admin')

  process.exit(0)
}

seedAbout().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
