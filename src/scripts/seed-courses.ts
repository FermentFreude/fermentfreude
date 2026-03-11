/**
 * Seed the Online Courses page in the Pages collection.
 * Seeds both DE and EN locales. Content is under Pages → Online Courses Page tab.
 *
 * Rules: Sequential DB writes only (no Promise.all). Seed DE first, read back IDs, then EN with same IDs.
 * Always context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }.
 *
 * Run: pnpm seed courses
 *
 * Uses PAYLOAD_SKIP_ONLINE_COURSES_CONDITION=1 during seed so the slug condition passes.
 */
import type { Media } from '@/payload-types'
import { IMAGE_PRESETS, optimizedFile, readLocalFile } from '@/scripts/seed-image-utils'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const LEXICAL_ROOT_WITH_PARAGRAPH = {
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
            text: '',
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

type CoursesMedia = {
  whyIcon1?: Media
  whyIcon2?: Media
  whyIcon3?: Media
  whyIcon4?: Media
  whyIcon5?: Media
  whyIcon6?: Media
  heroVeg?: Media
  heroBread?: Media
  heroKimchi?: Media
  team1?: Media
  team2?: Media
  workshop1?: Media
  comingSoonImage?: Media
  workshopHotSauce?: Media
  workshopTempeh?: Media
  cardMiso?: Media
  cardCarboy?: Media
  cardPeanuts?: Media
}

function coursesDataDE(media: CoursesMedia, productId?: string) {
  return {
    onlineCoursesHeroEyebrow: 'Online-Kurse',
    onlineCoursesHeroTitle: 'Lerne Fermentation jederzeit, überall',
    onlineCoursesHeroDescription:
      'Meistere die Kunst der Fermentation von zu Hause aus. Unsere Online-Kurse bringen praktische Techniken, fachkundige Anleitung und eine Gemeinschaft von Lernenden—wann und wo du willst.',
    onlineCoursesHeroCtaLabel: 'Mehr über Fermentation erfahren',
    onlineCoursesHeroCtaUrl: '/fermentation',
    onlineCoursesHeroCtaHint: '',
    onlineCoursesHeroCta2Label: 'Workshops entdecken',
    onlineCoursesHeroCta2Url: '/workshops',
    onlineCoursesHeroImage: media.heroVeg?.id ?? media.workshop1?.id ?? undefined,
    onlineCoursesHeroImageBread: media.heroBread?.id ?? undefined,
    onlineCoursesHeroImageVeg: media.heroVeg?.id ?? undefined,
    onlineCoursesHeroImageKimchi: media.heroKimchi?.id ?? undefined,
    onlineCoursesHeroStatsLessons: '15',
    onlineCoursesHeroStatsStudents: '12.847',
    onlineCoursesHeroStatsRating: '4.5',
    onlineCoursesLearnEyebrow: 'Überblick',
    onlineCoursesWhyHeading: 'Was du lernst',
    onlineCoursesWhyDescription: 'Eine umfassende Reise durch alle Aspekte der Fermentation.',
    onlineCoursesWhyCards: [
      { icon: media.whyIcon1?.id, title: 'Gemüsefermentation', description: 'Meistere Sauerkraut, Kimchi und eingelegtes Gemüse mit traditionellen und modernen Techniken.' },
      { icon: media.whyIcon2?.id, title: 'Fermentierte Getränke', description: 'Braue Kombucha, Wasserkefir und andere probiotische Getränke zu Hause.' },
      { icon: media.whyIcon3?.id, title: 'Sauerteigbrot', description: 'Erstelle und pflege einen Sauerteig, backe handwerkliche Brote mit perfekter Kruste.' },
      { icon: media.whyIcon4?.id, title: 'Milchfermentation', description: 'Stelle Joghurt, Kefir und kultivierte Milchprodukte mit optimalem Probiotikgehalt her.' },
      { icon: media.whyIcon5?.id, title: 'Sicherheit & Wissenschaft', description: 'Verstehe Fermentationswissenschaft, Ausrüstungsbedarf und Lebensmittelsicherheit.' },
      { icon: media.whyIcon6?.id, title: 'Fehlerbehebung', description: 'Erkenne und löse häufige Fermentationsprobleme mit fachkundiger Anleitung.' },
    ],
    onlineCoursesModulesEyebrow: 'Kursübersicht',
    onlineCoursesModulesHeading: 'Kursmodule',
    onlineCoursesModules: [
      {
        title: 'Grundkurs Fermentation',
        lessons: [
          { title: 'Willkommen und Übersicht', locked: false },
          { title: 'Was ist Fermentation?', locked: false },
          { title: 'Grundausrüstung', locked: true },
        ],
      },
    ],
    onlineCoursesModulesButtonLabel: 'Alle Lektionen anzeigen',
    onlineCoursesModulesButtonUrl: '/products/basic-fermentation-course',
    onlineCoursesCurriculumProgressHeading: 'Dein Fortschritt',
    onlineCoursesHowHeading: 'So funktioniert es',
    onlineCoursesHowSteps: [
      {
        title: 'Wähle deinen Kurs',
        description: 'Durchstöbere unsere Auswahl und wähle den Workshop, der zu deinen Zielen passt.',
      },
      {
        title: 'Lerne in deinem Tempo',
        description: 'Schau Videos und absolviere Module, wann immer es dir passt.',
      },
      {
        title: 'Werde zertifiziert',
        description: 'Erhalte dein Zertifikat und starte fermentierend mit Selbstvertrauen.',
      },
    ],
    onlineCoursesExploreEyebrow: 'Entdecken',
    onlineCoursesWorkshopsHeading: 'Weitere Kurse in Arbeit',
    onlineCoursesWorkshopsDescription: 'Erweitere dein Fermentationswissen mit diesen bald verfügbaren Spezialkursen.',
    onlineCoursesComingSoonSectionBadge: 'Demnächst',
    onlineCoursesWorkshopCards: [
      {
        image: media.workshop1?.id ?? media.comingSoonImage?.id ?? undefined,
        title: 'Fortgeschrittene Miso- & Koji-Meisterschaft',
        description: 'Tauche ein in japanische Fermentationstechniken, Koji-Anbau und traditionelle Miso-Herstellung.',
        durationText: '10 Stunden Inhalt',
        instructor: 'David Heider & Marcel Rauminger',
        levelText: 'Fortgeschritten',
        comingSoonBadge: 'Sommer 2026',
      },
      {
        image: media.cardCarboy?.id ?? media.workshopHotSauce?.id ?? undefined,
        title: 'Fermentierte scharfe Saucen & Gewürze',
        description: 'Erstelle einzigartige fermentierte scharfe Saucen, Senf und Gewürze mit kräftigen Aromen.',
        durationText: '5 Stunden Inhalt',
        instructor: 'David Heider & Marcel Rauminger',
        levelText: 'Mittelstufe',
        comingSoonBadge: 'Herbst 2026',
      },
      {
        image: media.cardPeanuts?.id ?? media.workshopTempeh?.id ?? undefined,
        title: 'Tempeh & pflanzenbasierte Fermentation',
        description: 'Meistere die Tempeh-Produktion und erkunde innovative pflanzenbasierte Fermentationstechniken.',
        durationText: '6 Stunden Inhalt',
        instructor: 'David Heider & Marcel Rauminger',
        levelText: 'Mittelstufe',
        comingSoonBadge: 'Winter 2027',
      },
    ],
    onlineCoursesComingSoonImage: media.comingSoonImage?.id ?? undefined,
    onlineCoursesComingSoonBadge: 'Sommer 2026',
    onlineCoursesGiftHeading: 'Gönne ein besonderes Geschmackserlebnis',
    onlineCoursesGiftDescription:
      'Verschenke die Gabe der Fermentation mit einem FermentFreude-Gutschein.',
    onlineCoursesGiftButtonLabel: 'Kurse entdecken',
    onlineCoursesGiftButtonUrl: '#workshops',
    onlineCoursesGiftCta2Label: 'Kontakt',
    onlineCoursesGiftCta2Url: '/contact',
    onlineCoursesInstructorEyebrow: 'Dozent',
    onlineCoursesTeamHeading: 'Sarah Chen',
    onlineCoursesTeamDescription:
      'Sarah ist zertifizierte Fermentations-Expertin mit über 10 Jahren Erfahrung. Sie hat Tausende von Schülern durch die Welt der Fermentation geführt.',
    onlineCoursesInstructorStats: '23.124 Teilnehmer',
    onlineCoursesTeamImages: [
      { image: media.team1?.id ?? undefined },
      { image: media.team2?.id ?? undefined },
    ],
    onlineCoursesTeamButtonLabel: 'Mehr erfahren',
    onlineCoursesTeamButtonUrl: '/about',
    onlineCoursesTestimonialsEyebrow: 'Erfahrungsberichte',
    onlineCoursesTestimonialsHeading: 'Was Teilnehmer sagen',
    onlineCoursesTestimonials: [
      { quote: 'Ein fantastischer Kurs! Ich habe endlich gelernt, wie man zu Hause fermentiert.', name: 'Anna Müller', location: 'Berlin' },
      { quote: 'Die Anleitung war klar und die Ergebnisse übertreffen meine Erwartungen.', name: 'Thomas Weber', location: 'München' },
      { quote: 'Perfekt für Einsteiger. Ich empfehle den Kurs jedem, der fermentieren lernen möchte.', name: 'Lisa Schmidt', location: 'Hamburg' },
    ],
    onlineCoursesBottomItems: [
      { icon: undefined, text: 'Sicherer Checkout' },
      { icon: undefined, text: 'Online-Support' },
      { icon: undefined, text: 'Community' },
      { icon: undefined, text: 'Lebenslanger Zugang' },
    ],
  }
}

function coursesDataEN(media: CoursesMedia, productId?: string) {
  return {
    onlineCoursesHeroEyebrow: 'Online Courses',
    onlineCoursesHeroTitle: 'Learn Fermentation Anytime, Anywhere',
    onlineCoursesHeroDescription:
      'Master the art of fermentation from home. Our online courses bring hands-on techniques, expert guidance, and a community of learners—whenever and wherever you are.',
    onlineCoursesHeroCtaLabel: 'Learn About Fermentation',
    onlineCoursesHeroCtaUrl: '/fermentation',
    onlineCoursesHeroCtaHint: '',
    onlineCoursesHeroCta2Label: 'Browse Workshops',
    onlineCoursesHeroCta2Url: '/workshops',
    onlineCoursesHeroImage: media.heroVeg?.id ?? media.workshop1?.id ?? undefined,
    onlineCoursesHeroImageBread: media.heroBread?.id ?? undefined,
    onlineCoursesHeroImageVeg: media.heroVeg?.id ?? undefined,
    onlineCoursesHeroImageKimchi: media.heroKimchi?.id ?? undefined,
    onlineCoursesHeroStatsLessons: '15',
    onlineCoursesHeroStatsStudents: '12,847',
    onlineCoursesHeroStatsRating: '4.5',
    onlineCoursesLearnEyebrow: 'Overview',
    onlineCoursesWhyHeading: 'What You\'ll Learn',
    onlineCoursesWhyDescription: 'A comprehensive journey through all aspects of fermentation.',
    onlineCoursesWhyCards: [
      { icon: media.whyIcon1?.id, title: 'Vegetable Fermentation', description: 'Master sauerkraut, kimchi, and pickled vegetables with traditional and modern techniques.' },
      { icon: media.whyIcon2?.id, title: 'Fermented Beverages', description: 'Brew kombucha, water kefir, and other probiotic-rich drinks at home.' },
      { icon: media.whyIcon3?.id, title: 'Sourdough Bread', description: 'Create and maintain a sourdough starter, bake artisan loaves with perfect crust.' },
      { icon: media.whyIcon4?.id, title: 'Dairy Fermentation', description: 'Make yogurt, kefir, and cultured dairy products with optimal probiotic content.' },
      { icon: media.whyIcon5?.id, title: 'Safety & Science', description: 'Understand fermentation science, equipment needs, and food safety practices.' },
      { icon: media.whyIcon6?.id, title: 'Troubleshooting', description: 'Identify and solve common fermentation problems with expert guidance.' },
    ],
    onlineCoursesModulesEyebrow: 'Course Overview',
    onlineCoursesModulesHeading: 'Course Modules',
    onlineCoursesModules: [
      {
        title: 'Basic Fermentation Course',
        lessons: [
          { title: 'Welcome and Overview', locked: false },
          { title: 'What is Fermentation?', locked: false },
          { title: 'Essential Equipment', locked: true },
        ],
      },
    ],
    onlineCoursesModulesButtonLabel: 'See all lessons',
    onlineCoursesModulesButtonUrl: '/products/basic-fermentation-course',
    onlineCoursesCurriculumProgressHeading: 'Your Progress',
    onlineCoursesHowHeading: 'How It Works',
    onlineCoursesHowSteps: [
      {
        title: 'Choose Your Course',
        description: 'Browse our selection and pick the workshop that fits your goals.',
      },
      {
        title: 'Learn at Your Pace',
        description: 'Watch videos and complete modules whenever it suits you.',
      },
      {
        title: 'Get Certified',
        description: 'Earn your certificate and start fermenting with confidence.',
      },
    ],
    onlineCoursesExploreEyebrow: 'Explore',
    onlineCoursesWorkshopsHeading: 'More Courses on the Way',
    onlineCoursesWorkshopsDescription: 'Expand your fermentation expertise with these upcoming specialized courses.',
    onlineCoursesComingSoonSectionBadge: 'Coming Soon',
    onlineCoursesWorkshopCards: [
      {
        image: media.cardMiso?.id ?? media.comingSoonImage?.id ?? undefined,
        title: 'Advanced Miso & Koji Mastery',
        description: 'Deep dive into Japanese fermentation techniques, koji cultivation, and traditional miso making.',
        durationText: '10 hours of content',
        instructor: 'David Heider & Marcel Rauminger',
        levelText: 'Advanced Level',
        comingSoonBadge: 'Summer 2026',
      },
      {
        image: media.cardCarboy?.id ?? media.workshopHotSauce?.id ?? undefined,
        title: 'Fermented Hot Sauces & Condiments',
        description: 'Create unique fermented hot sauces, mustards, and condiments with bold flavors.',
        durationText: '5 hours of content',
        instructor: 'David Heider & Marcel Rauminger',
        levelText: 'Intermediate Level',
        comingSoonBadge: 'Fall 2026',
      },
      {
        image: media.cardPeanuts?.id ?? media.workshopTempeh?.id ?? undefined,
        title: 'Tempeh & Plant-Based Fermentation',
        description: 'Master tempeh production and explore innovative plant-based fermentation techniques.',
        durationText: '6 hours of content',
        instructor: 'David Heider & Marcel Rauminger',
        levelText: 'Intermediate Level',
        comingSoonBadge: 'Winter 2027',
      },
    ],
    onlineCoursesComingSoonImage: media.comingSoonImage?.id ?? undefined,
    onlineCoursesComingSoonBadge: 'Summer 2026',
    onlineCoursesGiftHeading: 'Start Your Fermentation Journey Today',
    onlineCoursesGiftDescription:
      'Join thousands of students who have transformed their kitchens with the power of fermentation.',
    onlineCoursesGiftButtonLabel: 'Explore Courses',
    onlineCoursesGiftButtonUrl: '#workshops',
    onlineCoursesGiftCta2Label: 'Contact Us',
    onlineCoursesGiftCta2Url: '/contact',
    onlineCoursesInstructorEyebrow: 'Instructor',
    onlineCoursesTeamHeading: 'Sarah Chen',
    onlineCoursesTeamDescription:
      'Sarah is a certified fermentation expert with over 10 years of experience. She has guided thousands of students through the world of fermentation.',
    onlineCoursesInstructorStats: '23,124 Students',
    onlineCoursesTeamImages: [
      { image: media.team1?.id ?? undefined },
      { image: media.team2?.id ?? undefined },
    ],
    onlineCoursesTeamButtonLabel: 'Learn more',
    onlineCoursesTeamButtonUrl: '/about',
    onlineCoursesTestimonialsEyebrow: 'Testimonials',
    onlineCoursesTestimonialsHeading: 'What Students Say',
    onlineCoursesTestimonials: [
      { quote: 'An amazing course! I finally learned how to ferment at home.', name: 'John Doe', location: 'USA' },
      { quote: 'The instructions were clear and the results exceeded my expectations.', name: 'Jane Smith', location: 'UK' },
      { quote: 'Perfect for beginners. I recommend this course to anyone wanting to learn fermentation.', name: 'Mike Johnson', location: 'Canada' },
    ],
    onlineCoursesBottomItems: [
      { icon: undefined, text: 'Secure Checkout' },
      { icon: undefined, text: 'Online Support' },
      { icon: undefined, text: 'Community' },
      { icon: undefined, text: 'Lifetime Access' },
    ],
  }
}

async function seedCourses() {
  const payload = await getPayload({ config })
  payload.logger.info('Seeding Online Courses page…')

  // Find product for Add to cart (e.g. Lacto online course)
  let productId: string | undefined
  try {
    const productResult = await payload.find({
      collection: 'products',
      where: { slug: { equals: 'basic-fermentation-course' } },
      limit: 1,
      depth: 0,
    })
    productId = productResult.docs[0]?.id
  } catch {
    // Products may not exist yet
  }

  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')
  const media: CoursesMedia = {}

  const imagePaths: Record<keyof CoursesMedia, string> = {
    whyIcon1: 'icons/icon-nutrition.svg',
    whyIcon2: 'icons/icon-probiotics.svg',
    whyIcon3: 'icons/icon-enzymes.svg',
    whyIcon4: 'icons/icon-preservation.svg',
    whyIcon5: 'icons/icon-nutrition.svg',
    whyIcon6: 'icons/icon-probiotics.svg',
    heroVeg: 'courses/hero-veg.png',
    heroBread: 'courses/hero-bread.png',
    heroKimchi: 'courses/hero-kimchi.png',
    team1: 'gastronomy/gastronomy-slide-professional-training.png',
    team2: 'gastronomy/gastronomy-slide-01-cutting-board.png',
    workshop1: 'courses/lakto-fermented-jars.png',
    comingSoonImage: 'courses/coming-soon-fermentation.png',
    workshopHotSauce: 'courses/coming-soon-hot-sauce.png',
    workshopTempeh: 'courses/coming-soon-tempeh.png',
    cardMiso: 'courses/coming-soon-miso.png',
    cardCarboy: 'courses/coming-soon-carboy.png',
    cardPeanuts: 'courses/coming-soon-peanuts.png',
  }

  const altTexts: Record<keyof CoursesMedia, string> = {
    whyIcon1: 'Kombucha icon',
    whyIcon2: 'Kimchi icon',
    whyIcon3: 'Yogurt icon',
    whyIcon4: 'Sourdough icon',
    whyIcon5: 'Tempeh icon',
    whyIcon6: 'Tofu icon',
    heroVeg: 'Hero collage – vegetables in jar',
    heroBread: 'Hero collage – sourdough bread',
    heroKimchi: 'Hero collage – kimchi bowls',
    team1: 'Instructor 1',
    team2: 'Instructor 2',
    workshop1: 'Lacto-fermented vegetables',
    comingSoonImage: 'Course coming soon',
    workshopHotSauce: 'Fermented hot sauces carboy',
    workshopTempeh: 'Tempeh and plant-based fermentation jar',
    cardMiso: 'Japanese-style dish – Miso & Koji course',
    cardCarboy: 'Fermenting carboy – hot sauces course',
    cardPeanuts: 'Jar of peanuts – tempeh course',
  }

  try {
    for (const [key, relPath] of Object.entries(imagePaths) as [keyof CoursesMedia, string][]) {
      const fullPath = path.join(imagesDir, relPath)
      if (!fs.existsSync(fullPath)) {
        payload.logger.warn(`Courses image not found: ${fullPath}`)
        continue
      }
      const isSvg = relPath.endsWith('.svg')
      const file = isSvg
        ? readLocalFile(fullPath)
        : await optimizedFile(fullPath, IMAGE_PRESETS.card)
      const created = await payload.create({
        collection: 'media',
        data: { alt: altTexts[key] },
        file,
        context: ctx,
      })
      ;(media as Record<string, Media>)[key] = created as Media
      // Copy to public/media so images work locally when R2 is used (url fallback /media/filename)
      if (created?.filename && !isSvg && typeof file === 'object' && file !== null && 'data' in file && Buffer.isBuffer((file as { data: unknown }).data)) {
        try {
          const publicMedia = path.join(process.cwd(), 'public', 'media')
          if (!fs.existsSync(publicMedia)) fs.mkdirSync(publicMedia, { recursive: true })
          fs.writeFileSync(path.join(publicMedia, created.filename), (file as { data: Buffer }).data)
        } catch {
          // ignore
        }
      }
    }

    // Static fallback: write fixed-name hero images to public/courses-hero so /courses always has images
    const heroFallbackDir = path.join(process.cwd(), 'public', 'courses-hero')
    const heroSources: Array<{ key: keyof CoursesMedia; name: string }> = [
      { key: 'heroBread', name: 'bread.webp' },
      { key: 'heroVeg', name: 'veg.webp' },
      { key: 'heroKimchi', name: 'kimchi.webp' },
    ]
    if (!fs.existsSync(heroFallbackDir)) fs.mkdirSync(heroFallbackDir, { recursive: true })
    for (const { key, name } of heroSources) {
      const relPath = imagePaths[key]
      if (!relPath) continue
      const fullPath = path.join(imagesDir, relPath)
      if (!fs.existsSync(fullPath)) continue
      try {
        const file = await optimizedFile(fullPath, IMAGE_PRESETS.card)
        if (typeof file === 'object' && file !== null && 'data' in file && Buffer.isBuffer((file as { data: Buffer }).data)) {
          fs.writeFileSync(path.join(heroFallbackDir, name), (file as { data: Buffer }).data)
        }
      } catch {
        // ignore
      }
    }
  } catch {
    payload.logger.warn('Image upload skipped. Seeding text only.')
  }

  const seedEnv = { ...process.env, PAYLOAD_SKIP_ONLINE_COURSES_CONDITION: '1' }
  process.env.PAYLOAD_SKIP_ONLINE_COURSES_CONDITION = '1'

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'courses' } },
    limit: 1,
    depth: 0,
  })

  const basePageData = {
    title: 'Online Courses',
    slug: 'courses',
    _status: 'published' as const,
    hero: { type: 'lowImpact' as const, richTextLowImpact: LEXICAL_ROOT_WITH_PARAGRAPH },
    layout: [],
  }

  if (existing.docs.length > 0) {
    const pageId = existing.docs[0].id
    const forceRecreate = process.argv.includes('--force')
    if (forceRecreate) {
      await payload.delete({
        collection: 'pages',
        id: pageId,
        context: ctx,
      })
      payload.logger.info('Deleted existing Courses page. Recreating…')
    } else {
      await payload.update({
        collection: 'pages',
        id: pageId,
        locale: 'de',
        context: ctx,
        data: {
          ...basePageData,
          title: 'Online-Kurse',
          onlineCourses: coursesDataDE(media, productId),
        },
      })

      const freshDE = (await payload.findByID({
        collection: 'pages',
        id: pageId,
        locale: 'de',
        depth: 0,
      })) as unknown as Record<string, unknown>
      const ocDE = (freshDE.onlineCourses ?? {}) as Record<string, unknown>
      const whyCardsDE = (ocDE.onlineCoursesWhyCards as Array<{ id?: string }>) ?? []
      const howStepsDE = (ocDE.onlineCoursesHowSteps as Array<{ id?: string }>) ?? []
      const workshopCardsDE = (ocDE.onlineCoursesWorkshopCards as Array<{ id?: string }>) ?? []
      const teamImagesDE = (ocDE.onlineCoursesTeamImages as Array<{ id?: string }>) ?? []
      const bottomItemsDE = (ocDE.onlineCoursesBottomItems as Array<{ id?: string }>) ?? []
      const modulesDE = (ocDE.onlineCoursesModules as Array<{ id?: string; lessons?: Array<{ id?: string }> }>) ?? []
      const testimonialsDE = (ocDE.onlineCoursesTestimonials as Array<{ id?: string }>) ?? []

      const dataEN = coursesDataEN(media, productId)
      const dataENWithIds = {
        ...dataEN,
        onlineCoursesWhyCards: dataEN.onlineCoursesWhyCards.map((c, i) => ({
          ...c,
          id: whyCardsDE[i]?.id,
        })),
        onlineCoursesHowSteps: dataEN.onlineCoursesHowSteps.map((s, i) => ({
          ...s,
          id: howStepsDE[i]?.id,
        })),
        onlineCoursesWorkshopCards: dataEN.onlineCoursesWorkshopCards.map((c, i) => ({
          ...c,
          id: workshopCardsDE[i]?.id,
        })),
        onlineCoursesTeamImages: dataEN.onlineCoursesTeamImages.map((t, i) => ({
          ...t,
          id: teamImagesDE[i]?.id,
        })),
        onlineCoursesBottomItems: dataEN.onlineCoursesBottomItems.map((b, i) => ({
          ...b,
          id: bottomItemsDE[i]?.id,
        })),
        onlineCoursesModules: dataEN.onlineCoursesModules?.map((m, i) => {
          const modDE = modulesDE[i]
          const lessonsDE = modDE?.lessons ?? []
          return {
            ...m,
            id: modDE?.id,
            lessons: m.lessons?.map((l, j) => ({ ...l, id: lessonsDE[j]?.id })),
          }
        }),
        onlineCoursesTestimonials: dataEN.onlineCoursesTestimonials?.map((t, i) => ({
          ...t,
          id: testimonialsDE[i]?.id,
        })),
      }

      await payload.update({
        collection: 'pages',
        id: pageId,
        locale: 'en',
        context: ctx,
        data: {
          ...basePageData,
          title: 'Online Courses',
          onlineCourses: dataENWithIds,
        },
      })
      if (productId && media.workshop1?.id) {
        try {
          await payload.update({
            collection: 'products',
            id: productId,
            context: ctx,
            data: { gallery: [{ image: media.workshop1.id }] },
          })
          payload.logger.info('Basic Fermentation Course product gallery updated with course image.')
        } catch {
          // ignore
        }
      }
      payload.logger.info('Online Courses page updated (DE + EN). Edit at /admin/collections/pages')
      process.exit(0)
      return
    }
  }

  const page = await payload.create({
    collection: 'pages',
    locale: 'de',
    context: ctx,
    data: {
      ...basePageData,
      title: 'Online-Kurse',
      onlineCourses: coursesDataDE(media, productId),
    },
  })

  const pageId = page.id
  const freshDE = (await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
  })) as unknown as Record<string, unknown>
  const ocDE = (freshDE.onlineCourses ?? {}) as Record<string, unknown>
  const whyCardsDE = (ocDE.onlineCoursesWhyCards as Array<{ id?: string }>) ?? []
  const howStepsDE = (ocDE.onlineCoursesHowSteps as Array<{ id?: string }>) ?? []
  const workshopCardsDE = (ocDE.onlineCoursesWorkshopCards as Array<{ id?: string }>) ?? []
  const teamImagesDE = (ocDE.onlineCoursesTeamImages as Array<{ id?: string }>) ?? []
  const bottomItemsDE = (ocDE.onlineCoursesBottomItems as Array<{ id?: string }>) ?? []
  const modulesDE = (ocDE.onlineCoursesModules as Array<{ id?: string; lessons?: Array<{ id?: string }> }>) ?? []
  const testimonialsDE = (ocDE.onlineCoursesTestimonials as Array<{ id?: string }>) ?? []

  const dataEN = coursesDataEN(media, productId)
  const dataENWithIds = {
    ...dataEN,
    onlineCoursesWhyCards: dataEN.onlineCoursesWhyCards.map((c, i) => ({
      ...c,
      id: whyCardsDE[i]?.id,
    })),
    onlineCoursesHowSteps: dataEN.onlineCoursesHowSteps.map((s, i) => ({
      ...s,
      id: howStepsDE[i]?.id,
    })),
    onlineCoursesWorkshopCards: dataEN.onlineCoursesWorkshopCards.map((c, i) => ({
      ...c,
      id: workshopCardsDE[i]?.id,
    })),
    onlineCoursesTeamImages: dataEN.onlineCoursesTeamImages.map((t, i) => ({
      ...t,
      id: teamImagesDE[i]?.id,
    })),
    onlineCoursesBottomItems: dataEN.onlineCoursesBottomItems.map((b, i) => ({
      ...b,
      id: bottomItemsDE[i]?.id,
    })),
    onlineCoursesModules: dataEN.onlineCoursesModules?.map((m, i) => {
      const modDE = modulesDE[i]
      const lessonsDE = modDE?.lessons ?? []
      return {
        ...m,
        id: modDE?.id,
        lessons: m.lessons?.map((l, j) => ({ ...l, id: lessonsDE[j]?.id })),
      }
    }),
    onlineCoursesTestimonials: dataEN.onlineCoursesTestimonials?.map((t, i) => ({
      ...t,
      id: testimonialsDE[i]?.id,
    })),
  }

  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    context: ctx,
    data: {
      ...basePageData,
      title: 'Online Courses',
      onlineCourses: dataENWithIds,
    },
  })

  // Ensure Basic Fermentation Course product has the course image (lakto-fermented jars)
  if (productId && media.workshop1?.id) {
    try {
      await payload.update({
        collection: 'products',
        id: productId,
        context: ctx,
        data: { gallery: [{ image: media.workshop1.id }] },
      })
      payload.logger.info('Basic Fermentation Course product gallery updated with course image.')
    } catch (e) {
      payload.logger.warn(`Could not update Basic Fermentation Course product gallery: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  payload.logger.info('Online Courses page created (DE + EN). Edit at /admin/collections/pages')
  process.exit(0)
}

seedCourses().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
