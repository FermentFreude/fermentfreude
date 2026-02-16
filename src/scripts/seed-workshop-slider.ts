/**
 * Seed the Home page layout with the WorkshopSlider block.
 * Adds the block to the existing home page layout (does not overwrite hero).
 * Seeds both DE (default) and EN locales.
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-workshop-slider.ts
 */
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import type { Page } from '@/payload-types'

/** Read a local file and return a Payload-compatible File object */
function readLocalFile(filePath: string) {
  const data = fs.readFileSync(filePath)
  const ext = path.extname(filePath).slice(1).toLowerCase()
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  }
  return {
    name: path.basename(filePath),
    data,
    mimetype: mimeMap[ext] || 'image/png',
    size: data.byteLength,
  }
}

async function seedWorkshopSlider() {
  const payload = await getPayload({ config })

  // ---------- Find home page ----------
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length === 0) {
    payload.logger.error('❌ Home page not found. Run seed-home-hero.ts first.')
    process.exit(1)
  }

  const homeId = existing.docs[0].id
  payload.logger.info(
    `Home page found (id: ${homeId}). Uploading images & adding WorkshopSlider...`,
  )

  // ---------- Upload workshop images ----------
  const workshopsDir = path.resolve(process.cwd(), 'public/media/workshops')

  // Delete any existing workshop media to avoid duplicates on re-run
  await payload
    .delete({
      collection: 'media',
      where: { alt: { contains: 'workshop' } },
    })
    .catch(() => {
      // Ignore – none found
    })

  const [laktoImage, kombuchaImage, tempehImage] = await Promise.all([
    payload.create({
      collection: 'media',
      data: { alt: 'Lakto-Gemüse workshop – fermented vegetables in glass jars' },
      file: readLocalFile(path.join(workshopsDir, 'lakto.png')),
    }),
    payload.create({
      collection: 'media',
      data: { alt: 'Kombucha workshop – kombucha SCOBY and fermented tea in jar' },
      file: readLocalFile(path.join(workshopsDir, 'kombucha.png')),
    }),
    payload.create({
      collection: 'media',
      data: { alt: 'Tempeh workshop – homemade tempeh on ceramic plate' },
      file: readLocalFile(path.join(workshopsDir, 'tempeh.png')),
    }),
  ])

  payload.logger.info(
    `✅ Images uploaded: lakto=${laktoImage.id}, kombucha=${kombuchaImage.id}, tempeh=${tempehImage.id}`,
  )

  // ---------- Workshop data ----------
  const workshopSliderDE = {
    blockType: 'workshopSlider' as const,
    eyebrow: 'Workshop-Erlebnis',
    allWorkshopsButtonLabel: 'Alle Workshops',
    allWorkshopsLink: '/workshops',
    workshops: [
      {
        title: 'Lakto-Gemüse',
        description:
          'Gemüse fermentieren und jeden Monat neue Geschmacksrichtungen erleben. Hast du saisonales Gemüse übrig und möchtest es in echte Geschmackserlebnisse verwandeln?',
        features: [
          { text: 'Dauer: ca. 3 Stunden' },
          { text: 'Für alle – vom Anfänger bis zum Profi.' },
          { text: 'Zutaten, Gläser und Gewürze werden gestellt.' },
          { text: 'Nimm alle Gläser mit nach Hause.' },
        ],
        image: laktoImage.id,
        ctaLink: '/workshops/lakto-gemuese',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Kombucha',
        description:
          'Tee fermentieren und mit jedem Brauvorgang ausgewogene Aromen kreieren. Neugierig, wie Kombucha natürlich spritzig, frisch und komplex wird?',
        features: [
          { text: 'Dauer: ca. 3 Stunden' },
          { text: 'Für alle – vom Anfänger bis zum Profi.' },
          { text: 'Tee, Flaschen und Aromen werden gestellt.' },
          { text: 'Nimm deinen selbst gebrauten Kombucha mit nach Hause.' },
        ],
        image: kombuchaImage.id,
        ctaLink: '/workshops/kombucha',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Tempeh',
        description:
          'Von Bohnen zu Tempeh – Textur, Geschmack und Technik verstehen. Lerne, wie diese traditionelle Fermentation zu einem vielseitigen, gesunden Protein wird.',
        features: [
          { text: 'Dauer: ca. 3 Stunden' },
          { text: 'Für Hobbyköche und Profis geeignet.' },
          { text: 'Bohnen, Starterkulturen und alles wird gestellt.' },
          { text: 'Nimm frisch zubereitetes Tempeh mit nach Hause.' },
        ],
        image: tempehImage.id,
        ctaLink: '/workshops/tempeh',
        detailsButtonLabel: 'Workshop Details',
      },
    ],
  }

  const workshopSliderEN = {
    blockType: 'workshopSlider' as const,
    eyebrow: 'Workshop Experience',
    allWorkshopsButtonLabel: 'All Workshops',
    allWorkshopsLink: '/workshops',
    workshops: [
      {
        title: 'Lacto-Vegetables',
        description:
          'Fermenting vegetables, experiencing different flavours every month. Do you have leftover seasonal vegetables and want to transform them into real taste sensations?',
        features: [
          { text: 'Duration: approx. 3 hours' },
          { text: 'For everyone from beginner to pro.' },
          { text: 'Ingredients, jars, and spices are all provided.' },
          { text: 'Take all the jars home with you afterward.' },
        ],
        image: laktoImage.id,
        ctaLink: '/workshops/lakto-gemuese',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Kombucha',
        description:
          'Fermenting tea, creating balanced flavours with every brew. Curious how kombucha becomes naturally fizzy, fresh, and complex?',
        features: [
          { text: 'Duration: approx. 3 hours' },
          { text: 'For everyone from beginner to pro.' },
          { text: 'Tea, bottles, and flavourings are all provided.' },
          { text: 'Take home your own brewed kombucha.' },
        ],
        image: kombuchaImage.id,
        ctaLink: '/workshops/kombucha',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Tempeh',
        description:
          'From beans to tempeh, understanding texture, taste, and technique. Learn how this traditional fermentation becomes a versatile, healthy protein.',
        features: [
          { text: 'Duration: approx. 3 hours' },
          { text: 'Suitable for home cooks and professionals.' },
          { text: 'Beans, starter cultures, and all are provided.' },
          { text: 'Take home freshly made tempeh.' },
        ],
        image: tempehImage.id,
        ctaLink: '/workshops/tempeh',
        detailsButtonLabel: 'Workshop Details',
      },
    ],
  }

  // ---------- Update DE layout ----------
  // Get existing layout to append (not overwrite)
  const homeDe = await payload.findByID({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    depth: 2,
  }) as Page

  const existingLayoutDE = Array.isArray(homeDe.layout) ? homeDe.layout : []
  // Remove any existing workshopSlider blocks to avoid duplicates
  const cleanLayoutDE = existingLayoutDE.filter(
    (b: { blockType?: string }) => b.blockType !== 'workshopSlider',
  )

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      _status: 'published',
      hero: homeDe.hero,
      layout: [...cleanLayoutDE, workshopSliderDE],
    },
  })

  payload.logger.info('✅ DE layout updated with WorkshopSlider block (with images).')

  // ---------- Update EN layout ----------
  const homeEn = await payload.findByID({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    depth: 2,
  }) as Page

  const existingLayoutEN = Array.isArray(homeEn.layout) ? homeEn.layout : []
  const cleanLayoutEN = existingLayoutEN.filter(
    (b: { blockType?: string }) => b.blockType !== 'workshopSlider',
  )

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      _status: 'published',
      hero: homeEn.hero,
      layout: [...cleanLayoutEN, workshopSliderEN],
    },
  })

  payload.logger.info('✅ EN layout updated with WorkshopSlider block (with images).')
  payload.logger.info('Done. Exiting.')
  process.exit(0)
}

seedWorkshopSlider().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
