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
  // 1. Upload images (or reuse existing)
  // ============================================================
  const workshopsDir = path.resolve(process.cwd(), 'public/media/workshops')
  const heroDir = path.resolve(process.cwd(), 'public/media/hero')

  // Delete any existing workshop / hero media to avoid duplicates
  await payload
    .delete({
      collection: 'media',
      where: { alt: { contains: 'workshop' } },
      context: { skipAutoTranslate: true },
    })
    .catch(() => {})
  await payload
    .delete({
      collection: 'media',
      where: { alt: { contains: 'hero' } },
      context: { skipAutoTranslate: true },
    })
    .catch(() => {})
  await payload
    .delete({
      collection: 'media',
      where: { alt: { contains: 'slide-' } },
      context: { skipAutoTranslate: true },
    })
    .catch(() => {})

  // Workshop images
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

  // Hero carousel images (from Figma design)
  const heroImage1 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 1' },
    file: readLocalFile(path.join(heroDir, 'hero-slide-1.png')),
  })

  const heroImage2 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 2' },
    file: readLocalFile(path.join(heroDir, 'hero-slide-2.png')),
  })

  const heroImage3 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 3' },
    file: readLocalFile(path.join(heroDir, 'hero-slide-3.png')),
  })

  const heroImage4 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 4' },
    file: readLocalFile(path.join(heroDir, 'hero-slide-4.png')),
  })

  // ── Per-slide product images (uploaded to Media / Vercel Blob) ──

  // Lakto slide images
  const laktoSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-lakto-left – FermentFreude Sauerkraut Jar' },
    file: readLocalFile(path.join(heroDir, 'lakto1.png')),
  })
  const laktoSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-lakto-right – FermentFreude Sauerkraut Jar' },
    file: readLocalFile(path.join(heroDir, 'lakto2.png')),
  })

  // Kombucha slide images
  const kombuchaSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-kombucha-left – FermentFreude Kombucha Apple & Carrot' },
    file: readLocalFile(path.join(heroDir, 'kombucha1.png')),
  })
  const kombuchaSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-kombucha-right – FermentFreude Kombucha Coffee Flavour' },
    file: readLocalFile(path.join(heroDir, 'kombucha2.png')),
  })

  // Tempeh slide images
  const tempehSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-tempeh-left – FermentFreude Tempeh Slices' },
    file: readLocalFile(path.join(heroDir, 'tempeh1.png')),
  })
  const tempehSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-tempeh-right – FermentFreude Black Bean Tempeh' },
    file: readLocalFile(path.join(heroDir, 'tempeh2.png')),
  })

  // Basics slide images (David + Marcel)
  const basicsSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-basics-left – David Heider, FermentFreude founder' },
    file: readLocalFile(path.join(heroDir, 'DavidHeroCopy.png')),
  })
  const basicsSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-basics-right – Marcel Rauminger, FermentFreude founder' },
    file: readLocalFile(path.join(heroDir, 'MarcelHero.png')),
  })

  payload.logger.info('✅ All images uploaded to Media collection.')

  // ============================================================
  // 2. Prepare content data
  // ============================================================

  // ── Hero (DE) ──
  const heroDE = {
    type: 'heroSlider' as const,
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
                text: 'Gutes Essen',
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
                text: 'Bessere Gesundheit',
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
                text: 'Echte Freude',
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
                text: 'Wir machen Fermentation genussvoll & zugänglich und stärken die Darmgesundheit durch Geschmack, Bildung und hochwertige handgemachte Lebensmittel.',
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
          label: 'Workshop',
          url: '/workshops',
          appearance: 'default' as const,
        },
      },
      {
        link: {
          type: 'custom' as const,
          label: 'Produkte',
          url: '/shop',
          appearance: 'outline' as const,
        },
      },
    ],
    heroImages: [
      { image: heroImage1.id },
      { image: heroImage2.id },
      { image: heroImage3.id },
      { image: heroImage4.id },
      { image: heroImage1.id },
    ],
    heroSlides: [
      {
        slideId: 'lakto',
        eyebrow: 'Workshop-Erlebnis',
        title: 'Entdecke die Kunst der\nLakto-Fermentation!',
        description: 'Unser Hands-on-Workshop nimmt dich mit auf eine Reise durch die traditionelle Milchsäure-Fermentation und verwandelt einfaches Gemüse in probiotische Köstlichkeiten.',
        attributes: [{ text: 'Natürlich' }, { text: 'Probiotisch' }, { text: 'Mit Liebe gemacht' }],
        ctaLabel: 'Mehr erfahren',
        ctaHref: '/workshops/lakto',
        panelColor: '#555954',
        bgColor: '#D2DFD7',
        leftImage: laktoSlideLeft.id,
        rightImage: laktoSlideRight.id,
      },
      {
        slideId: 'kombucha',
        eyebrow: 'Workshop-Erlebnis',
        title: 'Tauche ein in die Welt des\nKombucha-Brauens!',
        description: 'Lerne, deinen eigenen Kombucha von Grund auf zu brauen — vom Züchten des SCOBY bis zum Abfüllen deines perfekten, sprudelnden Probiotik-Tees.',
        attributes: [{ text: 'Lebende Kulturen' }, { text: 'Natürlich spritzig' }, { text: 'Handgemacht' }],
        ctaLabel: 'Mehr erfahren',
        ctaHref: '/workshops/kombucha',
        panelColor: '#555954',
        bgColor: '#F6F0E8',
        leftImage: kombuchaSlideLeft.id,
        rightImage: kombuchaSlideRight.id,
      },
      {
        slideId: 'tempeh',
        eyebrow: 'Workshop-Erlebnis',
        title: 'Meistere die Kunst der\nTempeh-Herstellung!',
        description: 'Entdecke die indonesische Tradition des Tempeh — züchte deine eigenen Lebendkulturen und stelle proteinreiche, fermentierte Köstlichkeiten her.',
        attributes: [{ text: 'Proteinreich' }, { text: 'Traditionell' }, { text: 'Pflanzenbasiert' }],
        ctaLabel: 'Mehr erfahren',
        ctaHref: '/workshops/tempeh',
        panelColor: '#737672',
        bgColor: '#F6F3F0',
        leftImage: tempehSlideLeft.id,
        rightImage: tempehSlideRight.id,
      },
      {
        slideId: 'basics',
        eyebrow: 'Workshop-Erlebnis',
        title: 'Starte deine Reise mit den\nFermentations-Grundlagen!',
        description: 'Der perfekte Einstieg — lerne die grundlegende Fermentationswissenschaft, Sicherheit und Techniken, um zu Hause alles sicher zu fermentieren.',
        attributes: [{ text: 'Anfängerfreundlich' }, { text: 'Wissenschaftlich fundiert' }, { text: 'Praktisch' }],
        ctaLabel: 'Mehr erfahren',
        ctaHref: '/workshops/basics',
        panelColor: '#000000',
        bgColor: '#AEB1AE',
        leftImage: basicsSlideLeft.id,
        rightImage: basicsSlideRight.id,
      },
    ],
  }

  // ── Hero (EN) ──
  const heroEN = {
    type: 'heroSlider' as const,
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
                text: 'Good food',
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
                text: 'Better Health',
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
                text: 'Real Joy',
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
                text: 'We make fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods.',
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
          label: 'Workshop',
          url: '/workshops',
          appearance: 'default' as const,
        },
      },
      {
        link: {
          type: 'custom' as const,
          label: 'Products',
          url: '/shop',
          appearance: 'outline' as const,
        },
      },
    ],
    heroImages: [
      { image: heroImage1.id },
      { image: heroImage2.id },
      { image: heroImage3.id },
      { image: heroImage4.id },
      { image: heroImage1.id },
    ],
    heroSlides: [
      {
        slideId: 'lakto',
        eyebrow: 'Workshop Experience',
        title: 'Discover the Art of\nLakto-Fermentation!',
        description: 'Our hands-on workshop takes you on a journey through traditional lacto-fermentation, turning simple vegetables into probiotic-rich delicacies.',
        attributes: [{ text: 'All-natural' }, { text: 'Probiotic-rich' }, { text: 'Made with Love' }],
        ctaLabel: 'Learn More',
        ctaHref: '/workshops/lakto',
        panelColor: '#555954',
        bgColor: '#D2DFD7',
        leftImage: laktoSlideLeft.id,
        rightImage: laktoSlideRight.id,
      },
      {
        slideId: 'kombucha',
        eyebrow: 'Workshop Experience',
        title: 'Immerse Yourself in\nKombucha Brewing!',
        description: 'Learn to brew your own kombucha from scratch — from growing the SCOBY to bottling your perfect fizzy, probiotic tea.',
        attributes: [{ text: 'Live cultures' }, { text: 'Naturally fizzy' }, { text: 'Handcrafted' }],
        ctaLabel: 'Learn More',
        ctaHref: '/workshops/kombucha',
        panelColor: '#555954',
        bgColor: '#F6F0E8',
        leftImage: kombuchaSlideLeft.id,
        rightImage: kombuchaSlideRight.id,
      },
      {
        slideId: 'tempeh',
        eyebrow: 'Workshop Experience',
        title: 'Master the Craft of\nTempeh Making!',
        description: 'Explore the Indonesian tradition of tempeh — cultivate your own live cultures and create protein-rich, fermented goodness at home.',
        attributes: [{ text: 'High protein' }, { text: 'Traditional' }, { text: 'Plant-based' }],
        ctaLabel: 'Learn More',
        ctaHref: '/workshops/tempeh',
        panelColor: '#737672',
        bgColor: '#F6F3F0',
        leftImage: tempehSlideLeft.id,
        rightImage: tempehSlideRight.id,
      },
      {
        slideId: 'basics',
        eyebrow: 'Workshop Experience',
        title: 'Begin Your Journey with\nFermentation Basics!',
        description: 'The perfect starting point — learn fundamental fermentation science, safety, and techniques to confidently ferment anything at home.',
        attributes: [{ text: 'Beginner-friendly' }, { text: 'Science-based' }, { text: 'Practical' }],
        ctaLabel: 'Learn More',
        ctaHref: '/workshops/basics',
        panelColor: '#000000',
        bgColor: '#AEB1AE',
        leftImage: basicsSlideLeft.id,
        rightImage: basicsSlideRight.id,
      },
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
        title: 'FermentFreude — Gutes Essen, bessere Gesundheit, echte Freude',
        description: 'Wir machen Fermentation genussvoll & zugänglich und stärken die Darmgesundheit durch Geschmack, Bildung und handgemachte Lebensmittel.',
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
  const freshHeroImages = (freshHero.heroImages || []) as WithId[]
  const freshHeroSlides = (freshHero.heroSlides || []) as (WithId & { attributes?: WithId[] })[]
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
    heroImages: heroEN.heroImages.map((img, i) => ({
      ...img,
      id: freshHeroImages[i]?.id,
    })),
    heroSlides: heroEN.heroSlides.map((s, i) => ({
      ...s,
      id: freshHeroSlides[i]?.id,
      attributes: s.attributes.map((a: { text: string }, j: number) => ({
        ...a,
        id: freshHeroSlides[i]?.attributes?.[j]?.id,
      })),
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
        title: 'FermentFreude — Good food, better health, real joy',
        description: 'We make fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods.',
      },
    },
  })

  payload.logger.info('✅ EN saved.')
  payload.logger.info('')
  payload.logger.info('🎉 Home page fully seeded (DE + EN) with hero slides + workshop slider.')
  payload.logger.info('   All slide images uploaded to Media (Vercel Blob ready).')
  payload.logger.info('   Switch locale in admin to verify both languages.')
  process.exit(0)
}

seedHome().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
