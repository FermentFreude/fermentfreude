/**
 * Seed the Contact page with the ContactBlock.
 * Creates a "Kontakt" / "Contact" page with hero, contact form card, CTA banner, and map.
 *
 * Uploads contact image to Payload Media (Cloudflare R2) so it's editable from /admin.
 * Seeds both DE (default) and EN locales, reusing array IDs.
 *
 * Following the rules:
 * - Schema first: all contact fields are in the CMS schema (ContactBlock)
 * - Seed both languages: DE first, read back IDs, then EN with same IDs
 * - Context flags: skipRevalidate, disableRevalidate, skipAutoTranslate
 * - Sequential DB writes (no Promise.all) for MongoDB Atlas M0
 * - Images uploaded via Payload Media collection (stored in Cloudflare R2)
 *
 * Run: pnpm seed contact --force   (full seed with uploads)
 *       pnpm seed contact --quick  (update hero slides only, ~2s)
 */
import type { Media } from '@/payload-types'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { contactDataDE, contactDataEN } from './data/contact'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

async function seedContact() {
  const payload = await getPayload({ config })
  const forceRecreate = process.argv.includes('--force')
  const quick = process.argv.includes('--quick')

  console.log('🧪 Seeding Contact page…')

  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')

  // ── QUICK: Reuse existing media, update hero slides only (no uploads) ──
  if (quick) {
    const pageRes = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'contact' } },
      limit: 1,
      depth: 2,
    })
    const page = pageRes.docs[0]
    if (!page) {
      console.log('❌ No contact page found. Run without --quick first.')
      process.exit(1)
    }
    const hero = page.hero as { slides?: Array<{ image?: string | { id: string } }> } | undefined
    const getId = (img: unknown) => (typeof img === 'object' && img && 'id' in img ? (img as { id: string }).id : typeof img === 'string' ? img : null)
    const contactHeroId = getId(hero?.slides?.[0]?.image)
    const voucherId = getId(hero?.slides?.[1]?.image)
    const companyId = getId(hero?.slides?.[2]?.image)
    if (!contactHeroId || !voucherId || !companyId) {
      console.log('❌ Quick mode needs existing hero slides. Run: pnpm seed contact --force')
      process.exit(1)
    }
    const heroSlidesDE = [
      { image: contactHeroId, title: 'Workshops', description: 'Du möchtest einen Workshop buchen oder hast Fragen? Wir freuen uns auf deine Nachricht.', buttonLabel: 'Workshops entdecken', buttonUrl: '/workshops' },
      { image: voucherId, title: 'Gutschein', description: 'Das perfekte Geschenk für Foodies und Gesundheitsbewusste. Verschenke einen Workshop oder ein Starter-Set.', buttonLabel: 'Gutschein kaufen', buttonUrl: '/workshops/voucher' },
      { image: companyId, title: 'Für Firmen', description: 'Fermentierte, pflanzliche Optionen für professionelle Küchen. Wir liefern Produkte und Wissen.', buttonLabel: 'Mehr erfahren', buttonUrl: '/gastronomy' },
    ]
    const heroSlidesEN = [
      { image: contactHeroId, title: 'Workshops', description: 'Would you like to book a workshop or have questions? We look forward to hearing from you.', buttonLabel: 'Explore Workshops', buttonUrl: '/workshops' },
      { image: voucherId, title: 'Gift Voucher', description: 'The perfect gift for foodies and the health-conscious. Gift a workshop or a starter set.', buttonLabel: 'Buy Voucher', buttonUrl: '/workshops/voucher' },
      { image: companyId, title: 'For Businesses', description: 'Fermented, plant-based options for professional kitchens. We supply products and knowledge.', buttonLabel: 'Learn More', buttonUrl: '/gastronomy' },
    ]
    const fresh = await payload.findByID({ collection: 'pages', id: page.id, depth: 0, locale: 'de' })
    const ids = ((fresh.hero as { slides?: Array<{ id?: string }> })?.slides ?? []).map((s) => s.id)
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'de',
      context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
      data: { hero: { type: 'heroCarousel' as const, slides: heroSlidesDE.map((s, i) => ({ ...s, id: ids[i] })) } },
    })
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
      data: { hero: { type: 'heroCarousel' as const, slides: heroSlidesEN.map((s, i) => ({ ...s, id: ids[i] })) } },
    })
    console.log('✅ Quick update done (hero slides only)')
    process.exit(0)
  }

  // ── 0. Non-destructive check — skip if page already has content ──
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'contact' } },
    limit: 10,
    depth: 0,
  })

  if (existing.docs.length > 0 && !forceRecreate) {
    const doc = existing.docs[0]
    const layout = Array.isArray(doc.layout) ? doc.layout : []
    if (layout.length > 0) {
      console.log(
        `⏭️  Contact page already has content (${layout.length} blocks). Skipping seed to protect admin changes.`,
      )
      console.log('   To overwrite, run: pnpm seed contact --force')
      process.exit(0)
    }
  }

  if (forceRecreate) {
    console.log('🔄 --force flag detected. Will overwrite existing contact page content.')
  }

  // ── 1. Delete any existing contact page ──────────────────────
  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'pages',
      id: doc.id,
      context: { skipRevalidate: true, disableRevalidate: true },
    })
    console.log(`  🗑️  Deleted existing contact page ${doc.id}`)
  }

  // ── 2. Upload images to Payload Media (Cloudflare R2) ─
  let contactFormImage: Media | undefined // for contact form card (left side)
  let sliderBannerImage: Media | undefined // for hero slider (Banner.png – previous)
  let workshopImage: Media | undefined
  const contactFormImagePath = path.join(imagesDir, 'contact-form.png')
  const contactHeroPath = path.join(imagesDir, 'contact-hero.png')
  const bannerPath = path.join(imagesDir, 'Banner.png')
  const workshopImagePath = path.join(imagesDir, 'workshop-slider.png')

  let contactHeroImage: Media | undefined
  if (fs.existsSync(contactHeroPath)) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'Contact hero – FermentFreude fermented foods and workshop' },
      file: await optimizedFile(contactHeroPath, IMAGE_PRESETS.hero),
      context: { skipAutoTranslate: true },
    })
    contactHeroImage = created as Media
    console.log(`  📸 Contact hero image: ${contactHeroImage.id}`)
  }

  if (fs.existsSync(contactFormImagePath)) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'contact-card – FermentFreude team at workshop' },
      file: await optimizedFile(contactFormImagePath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    contactFormImage = created as Media
    console.log(`  📸 Contact form image: ${contactFormImage.id}`)
  }

  if (fs.existsSync(bannerPath)) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'Hero slider – FermentFreude workshop banner' },
      file: await optimizedFile(bannerPath, IMAGE_PRESETS.hero),
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
      data: {
        alt: 'Fermentation workshop – table with ingredients, jars, and fermentation station',
      },
      file: await optimizedFile(workshopImagePath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    workshopImage = created as Media
    console.log(`  📸 Workshop slider image: ${workshopImage.id}`)
  }

  if (fs.existsSync(kombuchaWorkshopPath)) {
    const created = await payload.create({
      collection: 'media',
      data: {
        alt: 'Kombucha workshop – workstations with SCOBYs, teas, and flavoring ingredients',
      },
      file: await optimizedFile(kombuchaWorkshopPath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    kombuchaWorkshopImage = created as Media
    console.log(`  📸 Kombucha workshop image: ${kombuchaWorkshopImage.id}`)
  }

  if (fs.existsSync(companyImagePath)) {
    const created = await payload.create({
      collection: 'media',
      data: {
        alt: 'B2B product display – fermented products in professional packaging on shelf in commercial kitchen',
      },
      file: await optimizedFile(companyImagePath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    companyImage = created as Media
    console.log(`  📸 Company/B2B slide image: ${companyImage.id}`)
  }

  const giftSetImagePath = path.join(imagesDir, 'Image (Gift Set).png')
  const voucherImagePath = path.join(imagesDir, 'voucher.png')
  let voucherImage: Media | undefined
  const voucherSourcePath = fs.existsSync(voucherImagePath)
    ? voucherImagePath
    : fs.existsSync(giftSetImagePath)
      ? giftSetImagePath
      : null
  if (voucherSourcePath) {
    const created = await payload.create({
      collection: 'media',
      data: { alt: 'Gift voucher – FermentFreude gift set for workshops' },
      file: await optimizedFile(voucherSourcePath, IMAGE_PRESETS.card),
      context: { skipAutoTranslate: true },
    })
    voucherImage = created as Media
    console.log(`  📸 Voucher slide image: ${voucherImage.id}`)
  }

  // ── 3. Create the Contact page in DE (default locale) ─────────
  // Hero image: prefer contact-hero (generated), then Banner, then others
  const heroImageForBlock =
    contactHeroImage ?? sliderBannerImage ?? contactFormImage ?? workshopImage ?? kombuchaWorkshopImage ?? companyImage

  const deData = contactDataDE({
    contactImage: contactFormImage,
    heroImage: heroImageForBlock,
  })

  const heroSlidesDE =
    (contactHeroImage ?? sliderBannerImage) &&
    (voucherImage ?? companyImage ?? workshopImage ?? kombuchaWorkshopImage) &&
    companyImage
      ? [
          {
            image: (contactHeroImage ?? sliderBannerImage)!.id,
            title: 'Workshops',
            description:
              'Du möchtest einen Workshop buchen oder hast Fragen? Wir freuen uns auf deine Nachricht.',
            buttonLabel: 'Workshops entdecken',
            buttonUrl: '/workshops',
          },
          {
            image: (voucherImage ?? companyImage ?? workshopImage ?? kombuchaWorkshopImage)!.id,
            title: 'Gutschein',
            description:
              'Das perfekte Geschenk für Foodies und Gesundheitsbewusste. Verschenke einen Workshop oder ein Starter-Set.',
            buttonLabel: 'Gutschein kaufen',
            buttonUrl: '/workshops/voucher',
          },
          {
            image: companyImage.id,
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
          hideHeroSection: heroSlidesDE.length > 0, // Hide block hero when page carousel is shown
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
  const enData = contactDataEN({ contactImage: contactFormImage, heroImage: heroImageForBlock })

  const heroSlidesEN =
    (contactHeroImage ?? sliderBannerImage) &&
    (voucherImage ?? companyImage ?? workshopImage ?? kombuchaWorkshopImage) &&
    companyImage
      ? [
          {
            image: (contactHeroImage ?? sliderBannerImage)!.id,
            title: 'Workshops',
            description:
              'Would you like to book a workshop or have questions? We look forward to hearing from you.',
            buttonLabel: 'Explore Workshops',
            buttonUrl: '/workshops',
          },
          {
            image: (voucherImage ?? companyImage ?? workshopImage ?? kombuchaWorkshopImage)!.id,
            title: 'Gift Voucher',
            description:
              'The perfect gift for foodies and the health-conscious. Gift a workshop or a starter set.',
            buttonLabel: 'Buy Voucher',
            buttonUrl: '/workshops/voucher',
          },
          {
            image: companyImage.id,
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
  console.log('   Images stored in Payload Media (Cloudflare R2) — editable from /admin')

  process.exit(0)
}

seedContact().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
