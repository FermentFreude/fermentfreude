/**
 * Seed the Contact page with the ContactBlock.
 * Creates a "Kontakt" / "Contact" page with hero, contact form card, CTA banner, and map.
 *
 * Uploads contact image to Payload Media (Vercel Blob) so it's editable from /admin.
 * Seeds both DE (default) and EN locales, reusing array IDs.
 *
 * Following the rules:
 * - Schema first: all contact fields are in the CMS schema (ContactBlock)
 * - Seed both languages: DE first, read back IDs, then EN with same IDs
 * - Context flags: skipRevalidate, disableRevalidate, skipAutoTranslate
 * - Sequential DB writes (no Promise.all) for MongoDB Atlas M0
 * - Images uploaded via Payload Media collection (stored in Vercel Blob)
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-contact.ts
 */
import type { Media } from '@/payload-types'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { contactDataDE, contactDataEN } from '@/endpoints/seed/contact'

/** Read a local file and return a Payload-compatible File object */
function readLocalFile(filePath: string) {
  const data = fs.readFileSync(filePath)
  const ext = path.extname(filePath).slice(1).toLowerCase()
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }
  return {
    name: path.basename(filePath),
    data,
    mimetype: mimeMap[ext] || 'application/octet-stream',
    size: data.byteLength,
  }
}

async function seedContact() {
  const payload = await getPayload({ config })

  console.log('🧪 Seeding Contact page…')

  const imagesDir = path.resolve(process.cwd(), 'public/assets/images')

  // ── 1. Delete any existing contact page ──────────────────────
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'contact' } },
    limit: 10,
    depth: 0,
  })

  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'pages',
      id: doc.id,
      context: { skipRevalidate: true, disableRevalidate: true },
    })
    console.log(`  🗑️  Deleted existing contact page ${doc.id}`)
  }

  // ── 2. Upload contact card image to Payload Media (Vercel Blob) ─
  let contactImage: Media | undefined
  const teamImagePath = path.join(imagesDir, 'Banner.png') // Use banner as placeholder; replace with team image when available

  if (fs.existsSync(teamImagePath)) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'contact-card – FermentFreude team at workshop' },
      file: readLocalFile(teamImagePath),
      context: { skipAutoTranslate: true },
    })
    contactImage = created as Media
    console.log(`  📸 Contact card image: ${contactImage.id}`)
  } else {
    console.log('  ⚠️  Banner.png not found, contact card will show placeholder')
  }

  // ── 3. Create the Contact page in DE (default locale) ─────────
  const deData = contactDataDE({
    contactImage,
    heroImage: contactImage,
  })

  const contactPage = await payload.create({
    collection: 'pages',
    locale: 'de',
    context: {
      skipRevalidate: true,
      disableRevalidate: true,
      skipAutoTranslate: true,
    },
    data: {
      title: 'Kontakt',
      slug: 'contact',
      _status: 'published',
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'contactBlock',
          ...deData,
        },
      ],
    },
  })

  console.log(`  ✅ Created Contact page ${contactPage.id} (DE)`)

  // ── 4. Read back the layout to get array IDs ──────────────────
  const created = await payload.findByID({
    collection: 'pages',
    id: contactPage.id,
    depth: 0,
    locale: 'de',
  })

  const layoutBlock = (created.layout ?? [])[0]
  if (!layoutBlock) {
    console.error('  ❌ No layout block found after creation')
    process.exit(1)
  }

  const blockId = layoutBlock.id
  const deBlock = layoutBlock as unknown as Record<string, unknown>

  // Extract subject option IDs
  const contactForm = deBlock.contactForm as Record<string, unknown> | undefined
  const subjectOptions = contactForm?.subjectOptions as Record<string, unknown> | undefined
  const optionIds = ((subjectOptions?.options ?? []) as Array<{ id?: string }>).map((o) => o.id)

  // ── 5. Build EN data ──────────────────────────────────────────
  const enData = contactDataEN({ contactImage, heroImage: contactImage })

  if (enData.contactForm?.subjectOptions?.options && optionIds.length > 0) {
    enData.contactForm.subjectOptions.options = enData.contactForm.subjectOptions.options.map(
      (o: { label: string }, idx: number) => ({
        ...o,
        id: optionIds[idx],
      }),
    )
  }

  // ── 6. Update EN locale ─────────────────────────────────────
  await payload.update({
    collection: 'pages',
    id: contactPage.id,
    locale: 'en',
    context: {
      skipRevalidate: true,
      disableRevalidate: true,
      skipAutoTranslate: true,
    },
    data: {
      title: 'Contact',
      _status: 'published',
      layout: [
        {
          id: blockId,
          blockType: 'contactBlock',
          ...enData,
        },
      ],
    },
  })

  console.log(`  ✅ Updated Contact page ${contactPage.id} (EN)`)
  console.log('🎉 Contact page seeded successfully!')
  console.log('   Images stored in Payload Media (Vercel Blob) — editable from /admin')

  process.exit(0)
}

seedContact().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
