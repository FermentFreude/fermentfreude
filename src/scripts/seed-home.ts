/**
 * Combined seed script for the Home page.
 * Seeds hero (heroSlider) + layout blocks in both DE and EN.
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
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

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
  cards?: WithId[]
  members?: WithId[]
  testimonials?: WithId[]
  sponsors?: WithId[]
  links?: WithId[]
}

// readLocalFile + optimizedFile imported from ./seed-image-utils

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
    file: await optimizedFile(path.join(workshopsDir, 'lakto.png'), IMAGE_PRESETS.card),
  })

  const kombuchaImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Kombucha workshop – kombucha SCOBY and fermented tea in jar' },
    file: await optimizedFile(path.join(workshopsDir, 'kombucha.png'), IMAGE_PRESETS.card),
  })

  const tempehImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Tempeh workshop – homemade tempeh on ceramic plate' },
    file: await optimizedFile(path.join(workshopsDir, 'tempeh.png'), IMAGE_PRESETS.card),
  })

  // Hero carousel images (from Figma design)
  const heroImage1 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 1' },
    file: await optimizedFile(path.join(heroDir, 'hero-slide-1.png'), IMAGE_PRESETS.card),
  })

  const heroImage2 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 2' },
    file: await optimizedFile(path.join(heroDir, 'hero-slide-2.png'), IMAGE_PRESETS.card),
  })

  const heroImage3 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 3' },
    file: await optimizedFile(path.join(heroDir, 'hero-slide-3.png'), IMAGE_PRESETS.card),
  })

  const heroImage4 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude hero – fermented foods arrangement slide 4' },
    file: await optimizedFile(path.join(heroDir, 'hero-slide-4.png'), IMAGE_PRESETS.card),
  })

  // ── Per-slide product images (uploaded to Media / Cloudflare R2) ──

  // Lakto slide images
  const laktoSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-lakto-left – FermentFreude Sauerkraut Jar' },
    file: await optimizedFile(path.join(heroDir, 'lakto1.png'), IMAGE_PRESETS.card),
  })
  const laktoSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-lakto-right – FermentFreude Sauerkraut Jar' },
    file: await optimizedFile(path.join(heroDir, 'lakto2.png'), IMAGE_PRESETS.card),
  })

  // Kombucha slide images
  const kombuchaSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-kombucha-left – FermentFreude Kombucha Apple & Carrot' },
    file: await optimizedFile(path.join(heroDir, 'kombucha1.png'), IMAGE_PRESETS.card),
  })
  const kombuchaSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-kombucha-right – FermentFreude Kombucha Coffee Flavour' },
    file: await optimizedFile(path.join(heroDir, 'kombucha2.png'), IMAGE_PRESETS.card),
  })

  // Tempeh slide images
  const tempehSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-tempeh-left – FermentFreude Tempeh Slices' },
    file: await optimizedFile(path.join(heroDir, 'tempeh1.png'), IMAGE_PRESETS.card),
  })
  const tempehSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-tempeh-right – FermentFreude Black Bean Tempeh' },
    file: await optimizedFile(path.join(heroDir, 'tempeh2.png'), IMAGE_PRESETS.card),
  })

  // Basics slide images (David + Marcel)
  const basicsSlideLeft = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-basics-left – David Heider, FermentFreude founder' },
    file: await optimizedFile(path.join(heroDir, 'DavidHeroCopy.png'), IMAGE_PRESETS.card),
  })
  const basicsSlideRight = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'slide-basics-right – Marcel Rauminger, FermentFreude founder' },
    file: await optimizedFile(path.join(heroDir, 'MarcelHero.png'), IMAGE_PRESETS.card),
  })

  // ── New block images ──
  const imagesDir = path.resolve(process.cwd(), 'public/assets/images')

  // VoucherCta image (Gift Set)
  const voucherImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude Gift Set – fermentation starter kit in box' },
    file: await optimizedFile(path.join(imagesDir, 'Image (Gift Set).png'), IMAGE_PRESETS.card),
  })

  // HeroBanner background (Banner)
  const bannerImage = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'FermentFreude chefs banner – professional kitchen scene' },
    file: await optimizedFile(path.join(imagesDir, 'Banner.png'), IMAGE_PRESETS.hero),
  })

  // TeamPreview – David & Marcel photos
  const davidPhoto = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'David Heider – FermentFreude co-founder and instructor' },
    file: await optimizedFile(path.join(imagesDir, 'david-heider.jpg'), IMAGE_PRESETS.card),
  })
  const marcelPhoto = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Marcel Rauminger – FermentFreude co-founder and instructor' },
    file: await optimizedFile(path.join(imagesDir, 'marcel-rauminger.jpg'), IMAGE_PRESETS.card),
  })

  // SponsorsBar logos
  const sponsorLogo1 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Sponsor logo 1' },
    file: await optimizedFile(path.join(imagesDir, 'sponsor-logo.png'), IMAGE_PRESETS.logo),
  })
  const sponsorLogo2 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Sponsor logo 2' },
    file: await optimizedFile(path.join(imagesDir, 'sponsor-logo-2.png'), IMAGE_PRESETS.logo),
  })
  const sponsorLogo3 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Sponsor logo 3' },
    file: await optimizedFile(path.join(imagesDir, 'sponsor-logo-3.png'), IMAGE_PRESETS.logo),
  })
  const sponsorLogo4 = await payload.create({
    collection: 'media',
    context: { skipAutoTranslate: true, skipRevalidate: true },
    data: { alt: 'Sponsor logo 4' },
    file: await optimizedFile(path.join(imagesDir, 'sponsor-logo-4.png'), IMAGE_PRESETS.logo),
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
        description:
          'Unser Hands-on-Workshop nimmt dich mit auf eine Reise durch die traditionelle Milchsäure-Fermentation und verwandelt einfaches Gemüse in probiotische Köstlichkeiten.',
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
        description:
          'Lerne, deinen eigenen Kombucha von Grund auf zu brauen — vom Züchten des SCOBY bis zum Abfüllen deines perfekten, sprudelnden Probiotik-Tees.',
        attributes: [
          { text: 'Lebende Kulturen' },
          { text: 'Natürlich spritzig' },
          { text: 'Handgemacht' },
        ],
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
        description:
          'Entdecke die indonesische Tradition des Tempeh — züchte deine eigenen Lebendkulturen und stelle proteinreiche, fermentierte Köstlichkeiten her.',
        attributes: [
          { text: 'Proteinreich' },
          { text: 'Traditionell' },
          { text: 'Pflanzenbasiert' },
        ],
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
        description:
          'Der perfekte Einstieg — lerne die grundlegende Fermentationswissenschaft, Sicherheit und Techniken, um zu Hause alles sicher zu fermentieren.',
        attributes: [
          { text: 'Anfängerfreundlich' },
          { text: 'Wissenschaftlich fundiert' },
          { text: 'Praktisch' },
        ],
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
        description:
          'Our hands-on workshop takes you on a journey through traditional lacto-fermentation, turning simple vegetables into probiotic-rich delicacies.',
        attributes: [
          { text: 'All-natural' },
          { text: 'Probiotic-rich' },
          { text: 'Made with Love' },
        ],
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
        description:
          'Learn to brew your own kombucha from scratch — from growing the SCOBY to bottling your perfect fizzy, probiotic tea.',
        attributes: [
          { text: 'Live cultures' },
          { text: 'Naturally fizzy' },
          { text: 'Handcrafted' },
        ],
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
        description:
          'Explore the Indonesian tradition of tempeh — cultivate your own live cultures and create protein-rich, fermented goodness at home.',
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
        description:
          'The perfect starting point — learn fundamental fermentation science, safety, and techniques to confidently ferment anything at home.',
        attributes: [
          { text: 'Beginner-friendly' },
          { text: 'Science-based' },
          { text: 'Practical' },
        ],
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

  // ── VoucherCta (DE) ──
  const voucherCtaDE = {
    blockType: 'voucherCta' as const,
    eyebrow: 'Workshops · Gutscheine · Genuss',
    heading: 'Verschenke Fermentation als Erlebnis',
    description:
      'Ob zum Geburtstag, als Überraschung oder einfach so – mit einem GUTSCHEIN verschenkst du Genuss und ein Erlebnis, das in Erinnerung bleibt.',
    buttonLabel: 'Mehr erfahren',
    buttonLink: '/voucher',
    backgroundImage: voucherImage.id,
  }

  // ── VoucherCta (EN) ──
  const voucherCtaEN = {
    blockType: 'voucherCta' as const,
    eyebrow: 'Workshops · Vouchers · Flavour',
    heading: 'Give fermentation as an experience',
    description:
      'For a birthday, a surprise, or just because — with a GIFT VOUCHER you share great taste and a memory that lasts.',
    buttonLabel: 'Learn more',
    buttonLink: '/voucher',
    backgroundImage: voucherImage.id,
  }

  // ── HeroBanner (DE) ──
  const heroBannerDE = {
    blockType: 'heroBanner' as const,
    heading: 'Für Köche und Lebensmittel-Profis',
    description:
      'Wir arbeiten mit Restaurants, Hotels und Catering-Unternehmen zusammen, um fermentierte Produkte in professionelle Küchen zu bringen.',
    buttonLabel: 'Erfahre hier mehr',
    buttonLink: '/gastronomy',
    backgroundImage: bannerImage.id,
  }

  // ── HeroBanner (EN) ──
  const heroBannerEN = {
    blockType: 'heroBanner' as const,
    heading: 'For Chefs and Food Professionals',
    description:
      'We work with restaurants, hotels, and catering companies to bring fermented products into professional kitchens.',
    buttonLabel: 'Get to know more here',
    buttonLink: '/gastronomy',
    backgroundImage: bannerImage.id,
  }

  // ── FeatureCards (DE) ──
  const featureCardsDE = {
    blockType: 'featureCards' as const,
    eyebrow: 'FERMENTATION',
    heading: 'Warum Fermentation?',
    description:
      'Fermentation ist eine der ältesten und natürlichsten Methoden der Lebensmittelkonservierung. Sie verbessert Geschmack, Nährwert und Verdaulichkeit.',
    cards: [
      {
        title: 'Probiotika',
        description:
          'Fermentierte Lebensmittel sind reich an lebenden Kulturen, die deine Darmgesundheit und dein Immunsystem stärken.',
      },
      {
        title: 'Nährstoffe',
        description:
          'Der Fermentationsprozess erhöht die Bioverfügbarkeit von Vitaminen und Mineralstoffen in deiner Nahrung.',
      },
      {
        title: 'Geschmack',
        description:
          'Fermentation erzeugt komplexe Umami-Aromen und einzigartige Geschmacksprofile, die kein anderes Verfahren erreicht.',
      },
    ],
    buttonLabel: 'Mehr erfahren',
    buttonLink: '/about',
  }

  // ── FeatureCards (EN) ──
  const featureCardsEN = {
    blockType: 'featureCards' as const,
    eyebrow: 'FERMENTATION',
    heading: 'Why Fermentation?',
    description:
      'Fermentation is one of the oldest and most natural methods of food preservation. It enhances flavour, nutritional value, and digestibility.',
    cards: [
      {
        title: 'Probiotics',
        description:
          'Fermented foods are rich in live cultures that strengthen your gut health and immune system.',
      },
      {
        title: 'Nutrients',
        description:
          'The fermentation process increases the bioavailability of vitamins and minerals in your food.',
      },
      {
        title: 'Flavour',
        description:
          'Fermentation creates complex umami flavours and unique taste profiles that no other process can achieve.',
      },
    ],
    buttonLabel: 'Read more about it',
    buttonLink: '/about',
  }

  // ── TeamPreview (DE) ──
  const teamPreviewDE = {
    blockType: 'teamPreview' as const,
    eyebrow: 'Unser Team',
    heading: 'Nur die besten Instruktoren',
    description:
      'Unsere Gründer David und Marcel bringen jahrelange Erfahrung in Fermentation, Lebensmittelwissenschaft und kulinarischer Ausbildung mit. Jeder Workshop wird persönlich von ihnen geleitet.',
    buttonLabel: 'Über uns',
    buttonLink: '/about',
    members: [
      {
        name: 'David Heider',
        role: 'Gründer & Instruktor',
        image: davidPhoto.id,
      },
      {
        name: 'Marcel Rauminger',
        role: 'Gründer & Instruktor',
        image: marcelPhoto.id,
      },
    ],
  }

  // ── TeamPreview (EN) ──
  const teamPreviewEN = {
    blockType: 'teamPreview' as const,
    eyebrow: 'Our Team',
    heading: 'Only The Best Instructors',
    description:
      'Our founders David and Marcel bring years of experience in fermentation, food science, and culinary education. Every workshop is personally led by them.',
    buttonLabel: 'About us',
    buttonLink: '/about',
    members: [
      {
        name: 'David Heider',
        role: 'Founder & Instructor',
        image: davidPhoto.id,
      },
      {
        name: 'Marcel Rauminger',
        role: 'Founder & Instructor',
        image: marcelPhoto.id,
      },
    ],
  }

  // ── Testimonials (DE) ──
  const testimonialsDE = {
    blockType: 'testimonials' as const,
    eyebrow: 'Testimonials',
    heading: 'Was ihnen an unserem Fermentationskurs gefällt',
    buttonLabel: 'Alle Bewertungen',
    buttonLink: '/reviews',
    testimonials: [
      {
        quote:
          'Der Kombucha-Workshop war ein absolutes Highlight! David und Marcel erklären alles so verständlich und mit so viel Leidenschaft. Mein selbstgebrauter Kombucha schmeckt fantastisch.',
        authorName: 'Sophie M.',
        authorRole: 'Künstlerin',
        rating: 5,
      },
      {
        quote:
          'Als Koch war ich beeindruckt von der Tiefe des Wissens. Die Lakto-Fermentation hat meine Speisekarte komplett verändert. Absolute Empfehlung für Profis und Hobbyköche.',
        authorName: 'Thomas K.',
        authorRole: 'Koch',
        rating: 5,
      },
      {
        quote:
          'Ich habe den Tempeh-Workshop als Geschenk bekommen und es war das beste Geschenk überhaupt. Die Atmosphäre war warm und einladend, und ich habe so viel gelernt.',
        authorName: 'Anna L.',
        authorRole: 'Bloggerin',
        rating: 5,
      },
      {
        quote:
          'Super organisiert, tolle Materialien und ein wunderbares Team. Mein Mann und ich machen jetzt jede Woche eigenes Sauerkraut. Danke FermentFreude!',
        authorName: 'Maria B.',
        authorRole: 'Lehrerin',
        rating: 4,
      },
    ],
  }

  // ── Testimonials (EN) ──
  const testimonialsEN = {
    blockType: 'testimonials' as const,
    eyebrow: 'Testimonials',
    heading: 'What They Like About Our Fermentation Class',
    buttonLabel: 'View All Reviews',
    buttonLink: '/reviews',
    testimonials: [
      {
        quote:
          'The kombucha workshop was an absolute highlight! David and Marcel explain everything so clearly and with so much passion. My home-brewed kombucha tastes fantastic.',
        authorName: 'Sophie M.',
        authorRole: 'Artist',
        rating: 5,
      },
      {
        quote:
          'As a chef, I was impressed by the depth of knowledge. The lacto-fermentation completely changed my menu. Absolutely recommended for professionals and home cooks alike.',
        authorName: 'Thomas K.',
        authorRole: 'Chef',
        rating: 5,
      },
      {
        quote:
          'I received the tempeh workshop as a gift and it was the best gift ever. The atmosphere was warm and welcoming, and I learned so much.',
        authorName: 'Anna L.',
        authorRole: 'Blogger',
        rating: 5,
      },
      {
        quote:
          'Super organised, great materials, and a wonderful team. My husband and I now make our own sauerkraut every week. Thank you FermentFreude!',
        authorName: 'Maria B.',
        authorRole: 'Teacher',
        rating: 4,
      },
    ],
  }

  // ── SponsorsBar (DE) ──
  const sponsorsBarDE = {
    blockType: 'sponsorsBar' as const,
    heading: 'Dieses Projekt wird unterstützt von:',
    sponsors: [
      { name: 'Partner 1', logo: sponsorLogo1.id, url: '' },
      { name: 'Partner 2', logo: sponsorLogo2.id, url: '' },
      { name: 'Partner 3', logo: sponsorLogo3.id, url: '' },
      { name: 'Partner 4', logo: sponsorLogo4.id, url: '' },
    ],
  }

  // ── SponsorsBar (EN) ──
  const sponsorsBarEN = {
    blockType: 'sponsorsBar' as const,
    heading: 'This project is supported by:',
    sponsors: [
      { name: 'Partner 1', logo: sponsorLogo1.id, url: '' },
      { name: 'Partner 2', logo: sponsorLogo2.id, url: '' },
      { name: 'Partner 3', logo: sponsorLogo3.id, url: '' },
      { name: 'Partner 4', logo: sponsorLogo4.id, url: '' },
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
  payload.logger.info('Saving DE locale (hero + all layout blocks)...')

  const layoutDE = [
    workshopSliderDE,
    voucherCtaDE,
    heroBannerDE,
    featureCardsDE,
    teamPreviewDE,
    testimonialsDE,
    sponsorsBarDE,
  ]

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      _status: 'published',
      title: 'Home',
      hero: heroDE,
      layout: layoutDE,
      meta: {
        title: 'FermentFreude — Gutes Essen, bessere Gesundheit, echte Freude',
        description:
          'Wir machen Fermentation genussvoll & zugänglich und stärken die Darmgesundheit durch Geschmack, Bildung und handgemachte Lebensmittel.',
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

  // Helper to find blocks by type
  const findBlock = (type: string) =>
    freshLayout.find((b) => 'blockType' in b && b.blockType === type) as BlockItem | undefined

  const wsBlock = findBlock('workshopSlider')
  const vcBlock = findBlock('voucherCta')
  const hbBlock = findBlock('heroBanner')
  const fcBlock = findBlock('featureCards')
  const tpBlock = findBlock('teamPreview')
  const tmBlock = findBlock('testimonials')
  const sbBlock = findBlock('sponsorsBar')

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

  const voucherCtaEN_withIds = {
    ...voucherCtaEN,
    id: vcBlock?.id,
  }

  const heroBannerEN_withIds = {
    ...heroBannerEN,
    id: hbBlock?.id,
  }

  const featureCardsEN_withIds = {
    ...featureCardsEN,
    id: fcBlock?.id,
    cards: featureCardsEN.cards.map((c, i) => ({
      ...c,
      id: fcBlock?.cards?.[i]?.id,
    })),
  }

  const teamPreviewEN_withIds = {
    ...teamPreviewEN,
    id: tpBlock?.id,
    members: teamPreviewEN.members.map((m, i) => ({
      ...m,
      id: tpBlock?.members?.[i]?.id,
    })),
  }

  const testimonialsEN_withIds = {
    ...testimonialsEN,
    id: tmBlock?.id,
    testimonials: testimonialsEN.testimonials.map((t, i) => ({
      ...t,
      id: tmBlock?.testimonials?.[i]?.id,
    })),
  }

  const sponsorsBarEN_withIds = {
    ...sponsorsBarEN,
    id: sbBlock?.id,
    sponsors: sponsorsBarEN.sponsors.map((s, i) => ({
      ...s,
      id: sbBlock?.sponsors?.[i]?.id,
    })),
  }

  const layoutEN = [
    workshopSliderEN_withIds,
    voucherCtaEN_withIds,
    heroBannerEN_withIds,
    featureCardsEN_withIds,
    teamPreviewEN_withIds,
    testimonialsEN_withIds,
    sponsorsBarEN_withIds,
  ]

  // ============================================================
  // 7. Update EN: hero + layout together (single save, same IDs)
  // ============================================================
  payload.logger.info('Saving EN locale (hero + all blocks with matching IDs)...')

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      _status: 'published',
      title: 'Home',
      hero: heroEN_withIds,
      layout: layoutEN,
      meta: {
        title: 'FermentFreude — Good food, better health, real joy',
        description:
          'We make fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods.',
      },
    },
  })

  payload.logger.info('✅ EN saved.')
  payload.logger.info('')
  payload.logger.info('🎉 Home page fully seeded (DE + EN) with all blocks:')
  payload.logger.info('   • Hero Slider (4 slides with product images)')
  payload.logger.info('   • Workshop Slider (Lakto, Kombucha, Tempeh)')
  payload.logger.info('   • Voucher CTA (gift experience)')
  payload.logger.info('   • Hero Banner (for chefs)')
  payload.logger.info('   • Feature Cards (why fermentation)')
  payload.logger.info('   • Team Preview (David & Marcel)')
  payload.logger.info('   • Testimonials (4 reviews)')
  payload.logger.info('   • Sponsors Bar (4 logos)')
  payload.logger.info('   All images uploaded to Media (Cloudflare R2).')
  payload.logger.info('   Switch locale in admin to verify both languages.')
  process.exit(0)
}

seedHome().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
