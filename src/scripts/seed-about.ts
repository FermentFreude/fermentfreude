/**
 * Seed the About page with the AboutBlock.
 * Creates an "Über uns" / "About Us" page with all sections:
 * hero image, our story, team, sponsors, contact, and CTA.
 *
 * Seeds both DE (default) and EN locales, reusing array IDs.
 *
 * Following the rules:
 * - Schema first: all about fields are in the CMS schema (AboutBlock)
 * - Seed both languages: DE first, read back IDs, then EN with same IDs
 * - Context flags: skipRevalidate, disableRevalidate, skipAutoTranslate
 * - Sequential DB writes (no Promise.all) for MongoDB Atlas M0
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-about.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { aboutDataDE, aboutDataEN } from '@/endpoints/seed/about'

async function seedAbout() {
  const payload = await getPayload({ config })

  console.log('🧪 Seeding About page…')

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

  // ── 2. Create the About page in DE (default locale) ────────
  const deData = aboutDataDE()

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

  // ── 3. Read back the layout to get array IDs ──────────────
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

  // ── 4. Build EN data with same array IDs ──────────────────
  const enData = aboutDataEN()

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
  if (
    enData.contactForm?.subjectOptions?.options &&
    optionIds.length > 0
  ) {
    enData.contactForm.subjectOptions.options = enData.contactForm.subjectOptions.options.map(
      (o: { label: string }, idx: number) => ({
        ...o,
        id: optionIds[idx],
      }),
    )
  }

  // ── 5. Update EN locale ───────────────────────────────────
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

  process.exit(0)
}

seedAbout().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
