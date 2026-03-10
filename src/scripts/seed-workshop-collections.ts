/**
 * Workshop Collections seed — creates workshops, location, and sample appointments
 *
 * This seeds:
 * - 4 workshops (Basics, Kombucha, Lakto, Tempeh) with descriptions & images
 * - 1 default location (Ginery, Graz — their real location from ferment-freude.at)
 * - Sample appointments for testing (only if --with-dates flag is used)
 *
 * Run: pnpm seed workshop-collections
 * Run with sample dates: pnpm seed workshop-collections --with-dates
 */

import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

function buildRichText(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [
            {
              type: 'text' as const,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              text,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export async function seedWorkshopCollections() {
  console.log('\n🌱 Seeding workshops, location & appointments...\n')

  const payload = await getPayload({ config })

  /* ─────────────────────────────────────────────────────────────
   *  1. Upload workshop images to Media collection
   * ───────────────────────────────────────────────────────────── */

  console.log('📸 Uploading workshop images...')

  const imageMap: Record<string, string> = {}

  const workshops = [
    {
      name: 'Kombucha',
      path: path.resolve('seed-assets/media/workshops/kombucha.png'),
      alt: 'Kombucha brewing workshop',
    },
    {
      name: 'Lakto',
      path: path.resolve('seed-assets/media/workshops/lakto.png'),
      alt: 'Lakto-fermentation workshop',
    },
    {
      name: 'Tempeh',
      path: path.resolve('seed-assets/media/workshops/tempeh.png'),
      alt: 'Tempeh making workshop',
    },
  ]

  for (const { name, path: imagePath, alt } of workshops) {
    // Check if file exists before trying to optimize
    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️  Missing image: ${imagePath} — skipping ${name}`)
      continue
    }

    const file = await optimizedFile(imagePath, IMAGE_PRESETS.card)
    if (!file) {
      console.warn(`⚠️  Failed to optimize: ${imagePath} — skipping ${name}`)
      continue
    }

    const media = await payload.create({
      collection: 'media',
      locale: 'de',
      data: { alt },
      file,
      context: ctx,
    })

    imageMap[name] = media.id as string
    console.log(`✓ ${name} image uploaded (${media.id})`)

    // Save English alt text
    await payload.update({
      collection: 'media',
      id: media.id as string,
      locale: 'en',
      data: { alt },
      context: ctx,
    })
  }

  /* ─────────────────────────────────────────────────────────────
   *  2. Create workshops
   * ───────────────────────────────────────────────────────────── */

  console.log('\n🎓 Creating workshops...')

  const workshopData = [
    {
      slug: 'basics',
      titleDe: 'Fermentations-Basics',
      titleEn: 'Fermentation Basics',
      descriptionDe:
        'Der perfekte Einstieg — lerne die grundlegende Fermentationswissenschaft, Sicherheit und Techniken, um zu Hause selbstbewusst alles zu fermentieren.',
      descriptionEn:
        'The perfect starting point — learn fundamental fermentation science, safety, and techniques to confidently ferment anything at home.',
      image: null, // No image yet for basics
    },
    {
      slug: 'kombucha',
      titleDe: 'Kombucha',
      titleEn: 'Kombucha',
      descriptionDe:
        'Lerne von Grund auf, deinen eigenen Kombucha zu brauen — vom Anbau des SCOBY bis zur Abfüllung deines perfekten prickelnden, probiotischen Tees.',
      descriptionEn:
        'Learn to brew your own kombucha from scratch — from growing the SCOBY to bottling your perfect fizzy, probiotic tea.',
      image: imageMap['Kombucha'],
    },
    {
      slug: 'lakto',
      titleDe: 'Lakto-fermentiertes Gemüse',
      titleEn: 'Lacto-Fermented Vegetables',
      descriptionDe:
        'Unser praktischer Workshop führt dich auf eine Reise durch die traditionelle Lakto-Fermentation und verwandelt einfaches Gemüse in probiotikareiche Delikatessen.',
      descriptionEn:
        'Our hands-on workshop takes you on a journey through traditional lacto-fermentation, turning simple vegetables into probiotic-rich delicacies.',
      image: imageMap['Lakto'],
    },
    {
      slug: 'tempeh',
      titleDe: 'Tempeh',
      titleEn: 'Tempeh',
      descriptionDe:
        'Erkunde die indonesische Tradition des Tempeh — kultiviere deine eigenen lebenden Kulturen und stelle protereiches, fermentiertes Gut zu Hause her.',
      descriptionEn:
        'Explore the Indonesian tradition of tempeh — cultivate your own live cultures and create protein-rich, fermented goodness at home.',
      image: imageMap['Tempeh'],
    },
  ]

  const workshopIds: Record<string, string> = {}

  for (const ws of workshopData) {
    // Check if workshop already exists
    const existing = await payload.find({
      collection: 'workshops',
      where: { slug: { equals: ws.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`⚠️  Workshop "${ws.slug}" already exists — skipping`)
      workshopIds[ws.slug] = existing.docs[0].id as string
      continue
    }

    const created = await payload.create({
      collection: 'workshops',
      locale: 'de',
      data: {
        slug: ws.slug,
        title: ws.titleDe,
        description: buildRichText(ws.descriptionDe),
        basePrice: 99,
        maxCapacityPerSlot: 12,
        image: ws.image || null,
        isActive: true,
      },
      context: ctx,
    })

    workshopIds[ws.slug] = created.id as string
    console.log(`✓ Created workshop: ${ws.titleEn} (${created.id})`)

    // Save English version with same ID
    await payload.update({
      collection: 'workshops',
      id: created.id as string,
      locale: 'en',
      data: {
        title: ws.titleEn,
        description: buildRichText(ws.descriptionEn),
      },
      context: ctx,
    })
  }

  /* ─────────────────────────────────────────────────────────────
   *  3. Create default location (Berlin Studio)
   * ───────────────────────────────────────────────────────────── */

  console.log('\n📍 Creating default location...')

  const existingLocation = await payload.find({
    collection: 'workshop-locations',
    where: { name: { equals: 'Ginery' } },
    limit: 1,
  })

  let locationId: string

  if (existingLocation.docs.length > 0) {
    console.log(`⚠️  Location "Ginery" already exists — skipping`)
    locationId = existingLocation.docs[0].id as string
  } else {
    const location = await payload.create({
      collection: 'workshop-locations',
      locale: 'de',
      data: {
        name: 'Ginery',
        address: 'Grabenstraße 15, 8010 Graz, Österreich',
        timezone: 'Europe/Vienna',
        isActive: true,
      },
      context: ctx,
    })

    locationId = location.id as string
    console.log(`✓ Created location: Ginery (${location.id})`)

    // Save English version
    await payload.update({
      collection: 'workshop-locations',
      id: location.id as string,
      locale: 'en',
      data: {
        name: 'Ginery',
      },
      context: ctx,
    })
  }

  /* ─────────────────────────────────────────────────────────────
   *  4. Create sample appointments (OPTIONAL — only if --with-dates flag)
   * ───────────────────────────────────────────────────────────── */

  const withDates = process.argv.includes('--with-dates')

  if (withDates) {
    console.log('\n📅 Creating sample appointments...')

    const sampleAppointments = [
      {
        workshopSlug: 'kombucha',
        dateTime: new Date('2026-04-15T14:00:00+02:00').toISOString(),
        availableSpots: 8,
      },
      {
        workshopSlug: 'lakto',
        dateTime: new Date('2026-04-20T10:00:00+02:00').toISOString(),
        availableSpots: 5,
      },
      {
        workshopSlug: 'tempeh',
        dateTime: new Date('2026-04-25T14:00:00+02:00').toISOString(),
        availableSpots: 10,
      },
      {
        workshopSlug: 'basics',
        dateTime: new Date('2026-05-01T14:00:00+02:00').toISOString(),
        availableSpots: 12,
      },
    ]

    for (const apt of sampleAppointments) {
      const workshopId = workshopIds[apt.workshopSlug]
      if (!workshopId) {
        console.warn(`⚠️  Workshop "${apt.workshopSlug}" not found — skipping appointment`)
        continue
      }

      await payload.create({
        collection: 'workshop-appointments',
        data: {
          workshop: workshopId,
          location: locationId,
          dateTime: apt.dateTime,
          availableSpots: apt.availableSpots,
          isPublished: true,
          notes: `Sample appointment for ${apt.workshopSlug}`,
        },
        context: ctx,
      })

      console.log(`✓ Created appointment for ${apt.workshopSlug}: ${apt.dateTime.split('T')[0]}`)
    }
  } else {
    console.log('\n⏭️  Skipping sample appointments (use --with-dates to create them)')
  }

  console.log('\n✅ Workshops seed complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Visit http://localhost:3000/admin')
  console.log('   2. Go to "Workshop Appointments"')
  console.log('   3. Click "Create New"')
  console.log('   4. Select:')
  console.log('      - Workshop: Kombucha / Lakto / Tempeh')
  console.log('      - Location: Ginery (Grabenstraße 15, 8010 Graz)')
  console.log('      - Date & Time: Pick a future date')
  console.log('      - Available Spots: 1-12')
  console.log('      - Published: ✓ Check to show on website')
  console.log('   5. Click "Save"')
  console.log('\n💡 Tip: You only create workshops & locations ONCE.')
  console.log('   Every time you add a workshop date, create a new Workshop Appointment.')
  console.log('\n🌐 OLD WEBSITE (for reference): https://www.ferment-freude.at/')
  console.log('   They have booking calendars showing availability — check for current dates!')
}

// Run the seed function if this file is executed directly
seedWorkshopCollections().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
