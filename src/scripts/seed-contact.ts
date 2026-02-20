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

  // ── 2. Upload images to Payload Media (Vercel Blob) ─
  let contactFormImage: Media | undefined  // for contact form card (left side)
  let sliderBannerImage: Media | undefined // for hero slider (Banner.png – previous)
  let workshopImage: Media | undefined
  const contactFormImagePath = path.join(imagesDir, 'contact-form.png')
  const bannerPath = path.join(imagesDir, 'Banner.png')
  const workshopImagePath = path.join(imagesDir, 'workshop-slider.png')

  if (fs.existsSync(contactFormImagePath)) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'contact-card – FermentFreude team at workshop' },
      file: readLocalFile(contactFormImagePath),
      context: { skipAutoTranslate: true },
    })
    contactFormImage = created as Media
    console.log(`  📸 Contact form image: ${contactFormImage.id}`)
  }

  if (fs.existsSync(bannerPath)) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'Hero slider – FermentFreude workshop banner' },
      file: readLocalFile(bannerPath),
      context: { skipAutoTranslate: true },
    })
    sliderBannerImage = created as Media
    console.log(`  📸 Slider banner image: ${sliderBannerImage.id}`)
  }

  const kombuchaWorkshopPath = path.join(imagesDir, 'workshop-kombucha.png')
  const companyImagePath = path.join(imagesDir, 'company-b2b.png')
  let kombuchaWorkshopImage: Media | undefined
  let companyImage: Media | undefined

  if (fs.existsSync(workshopImagePath)) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'Fermentation workshop – table with ingredients, jars, and fermentation station' },
      file: readLocalFile(workshopImagePath),
      context: { skipAutoTranslate: true },
    })
    workshopImage = created as Media
    console.log(`  📸 Workshop slider image: ${workshopImage.id}`)
  }

  if (fs.existsSync(kombuchaWorkshopPath)) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'Kombucha workshop – workstations with SCOBYs, teas, and flavoring ingredients' },
      file: readLocalFile(kombuchaWorkshopPath),
      context: { skipAutoTranslate: true },
    })
    kombuchaWorkshopImage = created as Media
    console.log(`  📸 Kombucha workshop image: ${kombuchaWorkshopImage.id}`)
  }

  if (fs.existsSync(companyImagePath)) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'B2B product display – fermented products in professional packaging on shelf in commercial kitchen' },
      file: readLocalFile(companyImagePath),
      context: { skipAutoTranslate: true },
    })
    companyImage = created as Media
    console.log(`  📸 Company/B2B slide image: ${companyImage.id}`)
  }

  // ── 3. Create the Contact page in DE (default locale) ─────────
  const deData = contactDataDE({
    contactImage: contactFormImage,
    heroImage: sliderBannerImage,
  })

  const heroSlidesDE = sliderBannerImage
    ? [
        {
          image: sliderBannerImage.id,
          title: 'Kontakt',
          description:
            'Du möchtest einen Workshop buchen oder hast Fragen? Wir freuen uns auf deine Nachricht.',
          buttonLabel: 'Workshops entdecken',
          buttonUrl: '/workshops',
        },
        {
          image: (kombuchaWorkshopImage ?? workshopImage ?? sliderBannerImage).id,
          title: 'Workshops',
          description:
            'Entdecke die Kunst der Fermentation. Von Lakto-Gemüse über Kombucha bis Tempeh – lerne mit uns.',
          buttonLabel: 'Workshop buchen',
          buttonUrl: '/workshops',
        },
        {
          image: (companyImage ?? workshopImage ?? sliderBannerImage).id,
          title: 'Für Firmen',
          description:
            'Fermentierte, pflanzliche Optionen für professionelle Küchen. Wir liefern Produkte und Wissen.',
          buttonLabel: 'Mehr erfahren',
          buttonUrl: '/gastronomy',
        },
      ]
    : []

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
      hero:
        heroSlidesDE.length > 0
          ? { type: 'heroCarousel' as const, slides: heroSlidesDE }
          : { type: 'none' },
      layout: [
        {
          blockType: 'contactBlock',
          hideHeroSection: heroSlidesDE.length > 0,
          ...deData,
        },
      ],
    },
  })

  console.log(`  ✅ Created Contact page ${contactPage.id} (DE)`)

  // ── 4. Read back the layout and hero to get array IDs ──────────
  const created = await payload.findByID({
    collection: 'pages',
    id: contactPage.id,
    depth: 0,
    locale: 'de',
  })

  const layoutBlock = (created.layout ?? [])[0]
  const freshHero = (created.hero ?? {}) as { slides?: Array<{ id?: string }> }
  const freshSlideIds = (freshHero.slides ?? []).map((s) => s.id)
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
  const enData = contactDataEN({ contactImage: contactFormImage, heroImage: sliderBannerImage })

  const heroSlidesEN = sliderBannerImage
    ? [
        {
          image: sliderBannerImage.id,
          title: 'Contact',
          description:
            'Would you like to book a workshop or have questions? We look forward to hearing from you.',
          buttonLabel: 'Explore Workshops',
          buttonUrl: '/workshops',
        },
        {
          image: (kombuchaWorkshopImage ?? workshopImage ?? sliderBannerImage).id,
          title: 'Workshops',
          description:
            'Discover the art of fermentation. From lacto vegetables to kombucha and tempeh – learn with us.',
          buttonLabel: 'Book Workshop',
          buttonUrl: '/workshops',
        },
        {
          image: (companyImage ?? workshopImage ?? sliderBannerImage).id,
          title: 'For Businesses',
          description:
            'Fermented, plant-based options for professional kitchens. We supply products and knowledge.',
          buttonLabel: 'Learn More',
          buttonUrl: '/gastronomy',
        },
      ]
    : []

  if (enData.contactForm?.subjectOptions?.options && optionIds.length > 0) {
    enData.contactForm.subjectOptions.options = enData.contactForm.subjectOptions.options.map(
      (o: { label: string }, idx: number) => ({
        ...o,
        id: optionIds[idx],
      }),
    )
  }

  // ── 6. Update EN locale ─────────────────────────────────────
  const heroEN =
    heroSlidesEN.length > 0
      ? {
          type: 'heroCarousel' as const,
          slides: heroSlidesEN.map((s, i) => ({ ...s, id: freshSlideIds[i] })),
        }
      : { type: 'none' as const }

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
      hero: heroEN,
      layout: [
        {
          id: blockId,
          blockType: 'contactBlock',
          hideHeroSection: heroSlidesEN.length > 0,
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
