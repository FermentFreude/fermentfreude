/**
 * Seed the About page with the AboutBlock.
 * Creates an "Über uns" / "About Us" page with all sections:
 * hero image, our story, team, sponsors, contact, and CTA.
 *
 * Uploads images to Payload Media (Cloudflare R2) so they're editable from /admin.
 * Seeds both DE (default) and EN locales, reusing array IDs.
 *
 * Following the rules:
 * - Schema first: all about fields are in the CMS schema (AboutBlock)
 * - Seed both languages: DE first, read back IDs, then EN with same IDs
 * - Context flags: skipRevalidate, disableRevalidate, skipAutoTranslate
 * - Sequential DB writes (no Promise.all) for MongoDB Atlas M0
 * - Images uploaded via Payload Media collection (stored in Cloudflare R2)
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-about.ts
 */
import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

import { aboutDataDE, aboutDataEN } from '@/endpoints/seed/about'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

async function seedAbout() {
  const payload = await getPayload({ config })

  console.log('🧪 Seeding About page…')

  const imagesDir = path.resolve(process.cwd(), 'public/assets/images')

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

  // Upload sponsor logos (use PNG versions — smaller & more compatible)
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

  // ── 4. Create the About page in DE (default locale) ────────
  const deData = aboutDataDE({
    heroImage: heroImage,
    marcelImage: marcelImage,
    davidImage: davidImage,
    sponsorLogos: sponsorImages,
  })

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
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'aboutBlock',
          ...deData,
        },
      ],
    },
  })

  console.log(`  ✅ Created About page ${aboutPage.id} (DE)`)

  // ── 5. Read back the layout to get array IDs ──────────────
  const created = await payload.findByID({
    collection: 'pages',
    id: aboutPage.id,
    depth: 0,
    locale: 'de',
  })

  const layoutBlock = (created.layout ?? [])[0]
  if (!layoutBlock) {
    console.error('  ❌ No layout block found after creation')
    process.exit(1)
  }

  // Extract array IDs to reuse for EN locale
  const blockId = layoutBlock.id
  const deBlock = layoutBlock as unknown as Record<string, unknown>

  // Extract description array IDs
  const ourStory = deBlock.ourStory as Record<string, unknown> | undefined
  const descriptionIds = ((ourStory?.description ?? []) as Array<{ id?: string }>).map(
    (d) => d.id,
  )

  // Extract team member IDs
  const team = deBlock.team as Record<string, unknown> | undefined
  const memberIds = ((team?.members ?? []) as Array<{ id?: string }>).map((m) => m.id)

  // Extract sponsor logo IDs
  const sponsors = deBlock.sponsors as Record<string, unknown> | undefined
  const logoIds = ((sponsors?.logos ?? []) as Array<{ id?: string }>).map((l) => l.id)

  // Extract subject option IDs
  const contactForm = deBlock.contactForm as Record<string, unknown> | undefined
  const subjectOptions = contactForm?.subjectOptions as Record<string, unknown> | undefined
  const optionIds = ((subjectOptions?.options ?? []) as Array<{ id?: string }>).map((o) => o.id)

  // ── 6. Build EN data with same array IDs ──────────────────
  const enData = aboutDataEN({
    heroImage: heroImage,
    marcelImage: marcelImage,
    davidImage: davidImage,
    sponsorLogos: sponsorImages,
  })

  // Patch description IDs
  if (enData.ourStory?.description) {
    enData.ourStory.description = enData.ourStory.description.map(
      (d: { paragraph: string }, idx: number) => ({
        ...d,
        id: descriptionIds[idx],
      }),
    )
  }

  // Patch team member IDs
  if (enData.team?.members) {
    ;(enData.team as Record<string, unknown>).members = enData.team.members.map(
      (m: { name: string; role: string; description: string; image?: unknown }, idx: number) => ({
        ...m,
        id: memberIds[idx],
      }),
    )
  }

  // Patch sponsor logo IDs
  if (enData.sponsors?.logos && logoIds.length > 0) {
    ;(enData.sponsors as Record<string, unknown>).logos = enData.sponsors.logos.map(
      (l: { image?: unknown; alt: string }, idx: number) => ({
        ...l,
        id: logoIds[idx],
      }),
    )
  }

  // Patch subject option IDs
  if (enData.contactForm?.subjectOptions?.options && optionIds.length > 0) {
    enData.contactForm.subjectOptions.options = enData.contactForm.subjectOptions.options.map(
      (o: { label: string }, idx: number) => ({
        ...o,
        id: optionIds[idx],
      }),
    )
  }

  // ── 7. Update EN locale ───────────────────────────────────
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
      layout: [
        {
          id: blockId,
          blockType: 'aboutBlock',
          ...enData,
        },
      ],
    },
  })

  console.log(`  ✅ Updated About page ${aboutPage.id} (EN)`)
  console.log('🎉 About page seeded successfully!')
  console.log('   All images stored in Payload Media (Cloudflare R2) — editable from /admin')

  process.exit(0)
}

seedAbout().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
