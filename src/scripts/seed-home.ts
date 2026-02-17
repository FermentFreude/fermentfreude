/**
 * Combined seed script for the Home page.
 * Seeds hero (heroSlider) + layout (workshopSlider block) in both DE and EN.
 *
 * Strategy:
 *   1. Seed DE first (Payload auto-generates IDs for arrays, blocks, etc.)
 *   2. Read back the saved doc to capture all generated IDs
 *   3. Seed EN reusing those exact IDs — so localized text fields
 *      are correctly stored against the same array/block items
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-home.ts
 */
import type { Page } from '@/payload-types'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

interface WithId {
  id?: string
  [key: string]: unknown
}

interface WorkshopItem extends WithId {
  features: WithId[]
  workshops?: WorkshopItem[]
}

interface BlockItem extends WithId {
  blockType?: string
  workshops?: WorkshopItem[]
}

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

async function seedHome() {
  const payload = await getPayload({ config })

  // ============================================================
  // 1. Upload workshop images (or reuse existing)
  // ============================================================
  const workshopsDir = path.resolve(process.cwd(), 'public/media/workshops')

  // Delete any existing workshop media to avoid duplicates
  await payload
    .delete({
      collection: 'media',
      where: { alt: { contains: 'workshop' } },
      context: { skipAutoTranslate: true },
    })
    .catch(() => {})

  const laktoImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Lakto-Gemüse workshop – fermented vegetables in glass jars' },
    file: readLocalFile(path.join(workshopsDir, 'lakto.png')),
  })

  const kombuchaImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Kombucha workshop – kombucha SCOBY and fermented tea in jar' },
    file: readLocalFile(path.join(workshopsDir, 'kombucha.png')),
  })

  const tempehImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Tempeh workshop – homemade tempeh on ceramic plate' },
    file: readLocalFile(path.join(workshopsDir, 'tempeh.png')),
  })

  payload.logger.info(
    `✅ Images uploaded: lakto=${laktoImage.id}, kombucha=${kombuchaImage.id}, tempeh=${tempehImage.id}`,
  )

  // ============================================================
  // 2. Prepare content data
  // ============================================================

  // ── Hero (DE) ──
  const heroDE = {
    type: 'heroSlider' as const,
    showWordmark: true,
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Lerne mit uns',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Kreiere deinen eigenen Geschmack zu Hause',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Wir stellen fermentierte Lebensmittel her und teilen das Wissen dahinter. Durch Workshops, Produkte und Bildung machen wir Fermentation zugänglich und genussvoll.',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
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
    },
    links: [
      {
        link: {
          type: 'custom' as const,
          label: 'Mehr entdecken',
          url: '/about',
          appearance: 'default' as const,
        },
      },
    ],
    socialLinks: [
      { platform: 'facebook' as const, url: 'https://facebook.com/fermentfreude' },
      { platform: 'twitter' as const, url: 'https://twitter.com/fermentfreude' },
      { platform: 'pinterest' as const, url: 'https://pinterest.com/fermentfreude' },
      { platform: 'youtube' as const, url: 'https://youtube.com/@fermentfreude' },
    ],
  }

  // ── Hero (EN) ──
  const heroEN = {
    type: 'heroSlider' as const,
    showWordmark: true,
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Learn with us',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Create your own flavour at home',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'We create fermented foods and share the knowledge behind them. Through workshops, products, and education, we make fermentation accessible and enjoyable.',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
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
    },
    links: [
      {
        link: {
          type: 'custom' as const,
          label: 'Discover More',
          url: '/about',
          appearance: 'default' as const,
        },
      },
    ],
    socialLinks: [
      { platform: 'facebook' as const, url: 'https://facebook.com/fermentfreude' },
      { platform: 'twitter' as const, url: 'https://twitter.com/fermentfreude' },
      { platform: 'pinterest' as const, url: 'https://pinterest.com/fermentfreude' },
      { platform: 'youtube' as const, url: 'https://youtube.com/@fermentfreude' },
    ],
  }

  // ── Workshop slider (DE) ──
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

  // ── Workshop slider (EN) ──
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

  // ============================================================
  // 3. Find or create home page
  // ============================================================
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })

  let homeId: string | number

  if (existing.docs.length > 0) {
    homeId = existing.docs[0].id
    payload.logger.info(`Home page found (id: ${homeId}). Updating...`)
  } else {
    payload.logger.info('No home page found. Creating...')
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      draft: true, // Create as draft first to avoid validation issues
      context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
      data: {
        title: 'Home',
        slug: 'home',
        hero: { type: 'lowImpact' as const },
        layout: [],
      },
    })
    homeId = created.id
  }

  // ============================================================
  // 4. Update DE: hero + layout together (single save)
  // ============================================================
  payload.logger.info('Saving DE locale (hero + workshopSlider)...')

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      _status: 'published',
      title: 'Home',
      hero: heroDE,
      layout: [workshopSliderDE],
      meta: {
        title: 'FermentFreude — Lerne mit uns, kreiere deinen eigenen Geschmack',
        description: 'Wir stellen fermentierte Lebensmittel her und teilen das Wissen dahinter.',
      },
    },
  })

  payload.logger.info('✅ DE saved.')

  // ============================================================
  // 5. Read back to capture ALL auto-generated IDs
  // ============================================================
  payload.logger.info('Reading back to capture generated IDs...')

  const freshDoc = (await payload.findByID({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    depth: 0,
  })) as Page

  const freshHero = (freshDoc.hero || {}) as Record<string, unknown>
  const freshLinks = (freshHero.links || []) as WithId[]
  const freshSocialLinks = (freshHero.socialLinks || []) as WithId[]
  const freshLayout = Array.isArray(freshDoc.layout) ? freshDoc.layout : []
  const wsBlock = freshLayout.find((b) => 'blockType' in b && b.blockType === 'workshopSlider') as
    | BlockItem
    | undefined

  if (!wsBlock) {
    payload.logger.error('❌ workshopSlider block not found after DE save.')
    process.exit(1)
  }

  // ============================================================
  // 6. Build EN data with same IDs from DE
  // ============================================================
  const heroEN_withIds = {
    ...heroEN,
    links: heroEN.links.map((l, i) => ({
      ...l,
      id: freshLinks[i]?.id,
    })),
    socialLinks: heroEN.socialLinks.map((s, i) => ({
      ...s,
      id: freshSocialLinks[i]?.id,
    })),
  }

  const workshopSliderEN_withIds = {
    ...workshopSliderEN,
    id: wsBlock.id,
    workshops: workshopSliderEN.workshops.map((w, i) => ({
      ...w,
      id: wsBlock.workshops?.[i]?.id,
      features: w.features.map((f, j) => ({
        ...f,
        id: wsBlock.workshops?.[i]?.features?.[j]?.id,
      })),
    })),
  }

  // ============================================================
  // 7. Update EN: hero + layout together (single save, same IDs)
  // ============================================================
  payload.logger.info('Saving EN locale (hero + workshopSlider with matching IDs)...')

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      _status: 'published',
      title: 'Home',
      hero: heroEN_withIds,
      layout: [workshopSliderEN_withIds],
      meta: {
        title: 'FermentFreude — Learn with us, create your own flavour at home',
        description: 'We create fermented foods and share the knowledge behind them.',
      },
    },
  })

  payload.logger.info('✅ EN saved.')
  payload.logger.info('')
  payload.logger.info('🎉 Home page fully seeded (DE + EN) with hero + workshop slider.')
  payload.logger.info('   Switch locale in admin to verify both languages.')
  process.exit(0)
}

seedHome().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
