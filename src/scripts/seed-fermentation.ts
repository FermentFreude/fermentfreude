/**
 * Seed the Fermentation page in the Pages collection with all sections.
 * Seeds both DE and EN locales. Content is under Pages → Fermentation page.
 * Uploads images to Payload Media (R2) for hero, guide, what, why, practice, CTA, hero blocks, workshop cards.
 *
 * Run: pnpm seed fermentation
 *
 * Before first run: pnpm seed:placeholders (generates placeholder images if seed-assets is empty)
 */
import type { Media } from '@/payload-types'
import { IMAGE_PRESETS, optimizedFile, readLocalFile } from '@/scripts/seed-image-utils'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

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

type FermentationMedia = {
  hero?: Media
  guide?: Media
  what?: Media
  why?: Media
  practice?: Media
  ctaBackground?: Media
  heroIcon1?: Media
  heroIcon2?: Media
  heroIcon3?: Media
  heroIcon4?: Media
  workshop1?: Media
  workshop2?: Media
  workshop3?: Media
}

function fermentationDataDE(media: FermentationMedia) {
  return {
    fermentationHeroTitle: 'Innovation trifft Tradition',
    fermentationHeroDescription:
      'Fermentation ist mehr als Sauerkraut oder Joghurt. Es ist eine Welt voller Geschmack, Kreativität und überraschender Aromen.',
    fermentationHeroImage: media.hero?.id ?? null,
    fermentationHeroBenefitsTitle: 'WARUM FERMENTATION?',
    fermentationHeroBlocks: [
      {
        icon: media.heroIcon1?.id ?? null,
        title: 'Gesundheit & Wohlbefinden',
        description: 'Unterstütze dein Darmmikrobiom mit probiotischen Lebensmitteln.',
      },
      {
        icon: media.heroIcon2?.id ?? null,
        title: 'Einzigartige Aromen',
        description: 'Entdecke komplexe Umami- und würzige Geschmacksprofile.',
      },
      {
        icon: media.heroIcon3?.id ?? null,
        title: 'Einfache Prozesse',
        description: 'Keine Spezialausrüstung—nur Salz, Zeit und Geduld.',
      },
      {
        icon: media.heroIcon4?.id ?? null,
        title: 'Lernen & Teilen',
        description: 'Nimm an Workshops teil und vernetze dich mit Fermentations-Enthusiasten.',
      },
    ],
    fermentationGuideTag: 'Schnellstart',
    fermentationGuideTitle: 'Ein kompletter Leitfaden zur Fermentation',
    fermentationGuideBody:
      'Entdecke die Geheimnisse traditioneller Konservierung und erstelle deine eigenen fermentierten Köstlichkeiten.',
    fermentationGuideImage: media.guide?.id ?? null,
    fermentationWhatTitle: 'Was ist Fermentation?',
    fermentationWhatBody:
      'Fermentation ist ein natürlicher Stoffwechselprozess, bei dem Mikroorganismen wie Bakterien, Hefen und Pilze organische Verbindungen—meist Kohlenhydrate—in Alkohol, Gase oder organische Säuren umwandeln.',
    fermentationWhatMotto: 'Keine Zusatzstoffe. Keine Abkürzungen. Nur Geduld und Sorgfalt.',
    fermentationWhatImage: media.what?.id ?? null,
    fermentationWhyTitle: 'Warum ist es so besonders?',
    fermentationWhyItems: [
      { title: 'Verbessert Darmflora und Wohlbefinden', description: 'Fermentierte Lebensmittel unterstützen ein gesundes Mikrobiom.' },
      { title: 'Einfach und kostengünstig', description: 'Keine Spezialausrüstung nötig—nur Salz, Zeit und Geduld.' },
      { title: 'Umweltfreundlich und nachhaltig', description: 'Reduziert Lebensmittelverschwendung und verlängert die Haltbarkeit natürlich.' },
      { title: 'Reich an Aromen und Duft', description: 'Schafft komplexe Umami- und würzige Profile.' },
      { title: 'Unterstützt einen ausgewogenen Lebensstil', description: 'Verbindet traditionelles Wissen mit moderner Ernährung.' },
      { title: 'Vielfältige Anwendungen', description: 'Von Gemüse über Milch bis zu Getreide und Getränken.' },
    ],
    fermentationWhyImage: media.why?.id ?? null,
    fermentationDangerTitle: 'Ist es gefährlich?',
    fermentationDangerIntro:
      'Fermentation ist eine der sichersten Methoden der Lebensmittelkonservierung, wenn sie richtig durchgeführt wird. Das saure Milieu bei der Milchsäuregärung verhindert das Wachstum schädlicher Bakterien.',
    fermentationDangerConcernsHeading: 'Häufige Bedenken angesprochen:',
    fermentationDangerConcerns: [
      {
        title: 'Schimmel',
        description:
          'Häufiger Schimmel bildet typischerweise eine pelzige, grüne, schwarze oder weiße Schicht auf der Oberfläche. Er ist meist harmlos, wenn entfernt—Fermentation schafft ein saures Milieu, das schädlichen Schimmel am Eindringen hindert.',
      },
      {
        title: 'Botulismus',
        description:
          'Clostridium botulinum kann in sauren Umgebungen (pH unter 4,6) nicht wachsen. Milchsauer fermentiertes Gemüse liegt deutlich darunter und ist daher sicher.',
      },
      {
        title: 'Pathogene',
        description:
          'Fermentation erhöht den Säuregehalt, der schädliche Bakterien hemmt. Richtige Salzverhältnisse und Hygiene reduzieren das Risiko weiter.',
      },
      {
        title: 'Kreuzkontamination',
        description:
          'Sauberes Besteck und saubere Geräte sowie das Untertauchen des Gemüses in der Lake verhindern Kontamination.',
      },
    ],
    fermentationDangerClosing:
      'Mit richtiger Hygiene, qualitativ hochwertigen Zutaten und korrekten Salzverhältnissen ist Fermentation eine zuverlässige und bewährte Praxis.',
    fermentationPracticeTitle: 'Eine Praxis, kein Trend',
    fermentationPracticeBody: null,
    fermentationPracticeImage: media.practice?.id ?? null,
    fermentationCtaTitle: 'Bereit zu lernen?',
    fermentationCtaDescription:
      'Nimm an unseren Workshops und Online-Kursen teil, um praktische Fermentationstechniken zu erlernen, Fragen zu stellen und dich mit einer Gemeinschaft von Lernenden zu verbinden.',
    fermentationCtaPrimaryLabel: 'Workshops ansehen',
    fermentationCtaPrimaryUrl: '/workshops',
    fermentationCtaSecondaryLabel: 'Online-Kurse durchsuchen',
    fermentationCtaSecondaryUrl: '/workshops',
    fermentationCtaVideoUrl: null,
    fermentationCtaBackgroundImage: media.ctaBackground?.id ?? null,
    fermentationWorkshopTitle: 'Lerne EINZIGARTIGE.',
    fermentationWorkshopTitleSuffix: 'AROMEN',
    fermentationWorkshopSubtitle:
      'Lerne Fermentation durch Geschmack—praktische Workshops, die frische Zutaten in lebendige, lebhafte Lebensmittel verwandeln.',
    fermentationWorkshopViewAllLabel: 'Alle Termine anzeigen',
    fermentationWorkshopViewAllUrl: '/workshops',
    fermentationWorkshopNextDateLabel: 'Nächster Termin:',
    fermentationWorkshopCards: [
      {
        image: media.workshop1?.id ?? null,
        title: 'Lakto-Gemüse',
        description:
          'Gemüse fermentieren, Aromen erleben – jeden Monat anders. Live online Session.',
        price: '€99',
        priceSuffix: 'pro Person',
        buttonLabel: 'Mehr Infos & Buchen',
        buttonUrl: '/workshops/lakto-gemuese',
        nextDate: '15. Februar 2026',
      },
      {
        image: media.workshop2?.id ?? null,
        title: 'Kombucha',
        description:
          'Tauche ein in die Welt des fermentierten Tees – voller Charakter und Aromen. Interaktiv online.',
        price: '€99',
        priceSuffix: 'pro Person',
        buttonLabel: 'Mehr Infos & Buchen',
        buttonUrl: '/workshops/kombucha',
        nextDate: '18. Februar 2026',
      },
      {
        image: media.workshop3?.id ?? null,
        title: 'Tempeh',
        description:
          'Entdecke eine pflanzliche Proteinquelle neu – mild, nussig und vielseitig. Online-Meisterklasse.',
        price: '€99',
        priceSuffix: 'pro Person',
        buttonLabel: 'Mehr Infos & Buchen',
        buttonUrl: '/workshops/tempeh',
        nextDate: '20. Februar 2026',
      },
    ],
    fermentationFaqTitle: 'Häufig gestellte Fragen',
    fermentationFaqSubtitle: 'Häufige Fragen zur Fermentation beantwortet',
    fermentationFaqItems: [
      {
        question: 'Tötet Fermentation Bakterien?',
        answer:
          'Fermentation fördert nützliche Bakterien (Laktobazillen) und schafft ein saures Milieu, das schädliche Krankheitserreger hemmt.',
      },
      {
        question: 'Kann ich bei Raumtemperatur fermentieren?',
        answer:
          'Ja. Die meisten Milchsäuregärungen funktionieren am besten bei 18–24°C. Kühler verlangsamt den Prozess; wärmer beschleunigt ihn.',
      },
      {
        question: 'Wie lange dauert Fermentation?',
        answer:
          'Es variiert. Sauerkraut kann in 1–2 Wochen fertig sein; Kimchi in 3–5 Tagen. Schmecke regelmäßig, um deine Präferenz zu finden.',
      },
      {
        question: 'Ist Fermentation dasselbe wie Einlegen?',
        answer:
          'Nicht ganz. Einlegen verwendet oft Essig (zugesetzte Säure). Fermentation erzeugt Säure natürlich durch Bakterien.',
      },
      {
        question: 'Kann ich täglich fermentierte Lebensmittel essen?',
        answer:
          'Ja. Viele Kulturen konsumieren täglich fermentierte Lebensmittel. Fang klein an und steigere allmählich, damit sich dein Darm anpasst.',
      },
      {
        question: 'Verderben fermentierte Lebensmittel?',
        answer:
          'Sie können. Anzeichen: Schimmel, unangenehmer Geruch, schleimige Textur. Richtig fermentierte und gekühlte Lebensmittel halten Monate.',
      },
    ],
    fermentationFaqCtaTitle: 'Bereit mit dem Fermentieren zu starten?',
    fermentationFaqCtaBody:
      'Beginne mit einfachem Gemüse wie Kohl oder Gurken, verwende das richtige Salzverhältnis (2–3 % nach Gewicht) und vertraue dem Prozess!',
    fermentationFaqMoreText: 'Keine Antwort gefunden?',
    fermentationFaqContactLabel: 'Kontakt',
    fermentationFaqContactUrl: '/contact',
  }
}

function fermentationDataEN(media: FermentationMedia) {
  return {
    fermentationHeroTitle: 'Innovation meets Tradition',
    fermentationHeroDescription:
      'Fermentation is more than sauerkraut or yogurt. It is a world full of taste, creativity and surprising aromas.',
    fermentationHeroImage: media.hero?.id ?? null,
    fermentationHeroBenefitsTitle: 'WHY FERMENTATION?',
    fermentationHeroBlocks: [
      {
        icon: media.heroIcon1?.id ?? null,
        title: 'Health & Well-being',
        description: 'Support your gut microbiome with probiotic-rich foods.',
      },
      {
        icon: media.heroIcon2?.id ?? null,
        title: 'Unique Flavours',
        description: 'Discover complex umami and tangy taste profiles.',
      },
      {
        icon: media.heroIcon3?.id ?? null,
        title: 'Simple Processes',
        description: 'No special equipment—just salt, time, and patience.',
      },
      {
        icon: media.heroIcon4?.id ?? null,
        title: 'Learn & Share',
        description: 'Join workshops and connect with fermentation enthusiasts.',
      },
    ],
    fermentationGuideTag: 'Quick Guide',
    fermentationGuideTitle: 'A complete guide to fermentation',
    fermentationGuideBody:
      'Unlock the secrets of traditional preservation and create your own fermented delights.',
    fermentationGuideImage: media.guide?.id ?? null,
    fermentationWhatTitle: 'What is fermentation?',
    fermentationWhatBody:
      'Fermentation is a natural metabolic process where microorganisms like bacteria, yeast, and fungi convert organic compounds—usually carbohydrates—into alcohol, gases, or organic acids.',
    fermentationWhatMotto: 'No additives. No shortcuts. Just patience and care.',
    fermentationWhatImage: media.what?.id ?? null,
    fermentationWhyTitle: 'Why is it so special?',
    fermentationWhyItems: [
      { title: 'Improves gut flora and overall well-being', description: 'Fermented foods support a healthy microbiome.' },
      { title: 'Easy and cost-effective', description: 'No special equipment needed—just salt, time, and patience.' },
      { title: 'Eco-friendly and sustainable', description: 'Reduces food waste and extends shelf life naturally.' },
      { title: 'Rich in flavors and aromas', description: 'Creates complex umami and tangy profiles.' },
      { title: 'Supports a balanced lifestyle', description: 'Integrates traditional wisdom with modern nutrition.' },
      { title: 'Diverse applications', description: 'From vegetables to dairy, grains to beverages.' },
    ],
    fermentationWhyImage: media.why?.id ?? null,
    fermentationDangerTitle: 'Is it dangerous?',
    fermentationDangerIntro:
      'Fermentation is one of the safest food preservation methods when done correctly. The acidic environment created during lacto-fermentation prevents harmful bacteria from growing.',
    fermentationDangerConcernsHeading: 'Common concerns addressed:',
    fermentationDangerConcerns: [
      {
        title: 'Mold',
        description:
          "Common mold generally forms a fuzzy, green, black, or white layer on the surface. It's usually harmless if removed—fermentation creates an acidic environment that prevents harmful mold from penetrating.",
      },
      {
        title: 'Botulism',
        description:
          'Clostridium botulinum cannot grow in acidic environments (pH below 4.6). Lacto-fermented vegetables are well below that, making them safe.',
      },
      {
        title: 'Pathogens',
        description:
          'Fermentation increases acidity, which inhibits harmful bacteria. Proper salt ratios and hygiene further reduce risk.',
      },
      {
        title: 'Cross-contamination',
        description:
          'Using clean utensils and equipment, and keeping vegetables submerged in brine, prevents contamination.',
      },
    ],
    fermentationDangerClosing:
      'With proper hygiene, quality ingredients, and correct salt ratios, fermentation is a reliable and time-tested practice.',
    fermentationPracticeTitle: 'A practice, not a trend',
    fermentationPracticeBody: null,
    fermentationPracticeImage: media.practice?.id ?? null,
    fermentationCtaTitle: 'Ready to learn?',
    fermentationCtaDescription:
      'Join our workshops and online courses to learn hands-on fermentation techniques, ask questions, and connect with a community of learners.',
    fermentationCtaPrimaryLabel: 'View workshops',
    fermentationCtaPrimaryUrl: '/workshops',
    fermentationCtaSecondaryLabel: 'Browse online courses',
    fermentationCtaSecondaryUrl: '/workshops',
    fermentationCtaVideoUrl: null,
    fermentationCtaBackgroundImage: media.ctaBackground?.id ?? null,
    fermentationWorkshopTitle: 'Learn UNIQUE.',
    fermentationWorkshopTitleSuffix: 'FLAVOURS',
    fermentationWorkshopSubtitle:
      'Learn fermentation through taste—hands-on workshops that turn fresh ingredients into vibrant, living food.',
    fermentationWorkshopViewAllLabel: 'View All Dates',
    fermentationWorkshopViewAllUrl: '/workshops',
    fermentationWorkshopNextDateLabel: 'Next Date:',
    fermentationWorkshopCards: [
      {
        image: media.workshop1?.id ?? null,
        title: 'Lakto-Gemüse',
        description:
          'Ferment vegetables, experience flavours – different every month. Live online session.',
        price: '€99',
        priceSuffix: 'per person',
        buttonLabel: 'More Info & Book',
        buttonUrl: '/workshops/lakto-gemuese',
        nextDate: 'February 15, 2026',
      },
      {
        image: media.workshop2?.id ?? null,
        title: 'Kombucha',
        description:
          'Dive into the world of fermented tea – full of character and aromas. Interactive online.',
        price: '€99',
        priceSuffix: 'per person',
        buttonLabel: 'More Info & Book',
        buttonUrl: '/workshops/kombucha',
        nextDate: 'February 18, 2026',
      },
      {
        image: media.workshop3?.id ?? null,
        title: 'Tempeh',
        description:
          'Rediscover a plant-based protein source – mild, nutty and versatile. Online masterclass.',
        price: '€99',
        priceSuffix: 'per person',
        buttonLabel: 'More Info & Book',
        buttonUrl: '/workshops/tempeh',
        nextDate: 'February 20, 2026',
      },
    ],
    fermentationFaqTitle: 'Frequently Asked Questions',
    fermentationFaqSubtitle: 'Common questions about fermentation answered',
    fermentationFaqItems: [
      {
        question: 'Does fermentation kill bacteria?',
        answer:
          'Fermentation encourages beneficial bacteria (lactobacilli) while creating an acidic environment that inhibits harmful pathogens.',
      },
      {
        question: 'Can I ferment at room temperature?',
        answer:
          'Yes. Most lacto-fermentation works best at 18–24°C (65–75°F). Cooler slows the process; warmer speeds it up.',
      },
      {
        question: 'How long does fermentation take?',
        answer:
          'It varies. Sauerkraut can be ready in 1–2 weeks; kimchi in 3–5 days. Taste regularly to find your preference.',
      },
      {
        question: 'Is fermentation the same as pickling?',
        answer:
          'Not exactly. Pickling often uses vinegar (acid added). Fermentation creates acid naturally through bacteria.',
      },
      {
        question: 'Can I eat fermented foods every day?',
        answer:
          'Yes. Many cultures consume fermented foods daily. Start small and increase gradually to let your gut adjust.',
      },
      {
        question: 'Do fermented foods go bad?',
        answer:
          'They can. Signs: mold, off smell, slimy texture. Properly fermented foods stored in the fridge last months.',
      },
    ],
    fermentationFaqCtaTitle: 'Ready to Start Fermenting?',
    fermentationFaqCtaBody:
      'Begin with simple vegetables like cabbage or cucumbers, use the proper salt ratio (2-3% by weight), and trust the process!',
    fermentationFaqMoreText: "Can't find your answer?",
    fermentationFaqContactLabel: 'Contact Us',
    fermentationFaqContactUrl: '/contact',
  }
}

async function seedFermentation() {
  const payload = await getPayload({ config })
  payload.logger.info('Seeding Fermentation page…')

  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')
  const gastronomyDir = path.join(imagesDir, 'gastronomy')
  const media: FermentationMedia = {}

  // Reuse gastronomy images (fermentation-related) — fallback paths
  const imagePaths: Record<keyof FermentationMedia, string> = {
    hero: 'gastronomy/gastronomy-cutting-board-fermentation.png',
    guide: 'gastronomy/gastronomy-slide-fermentation-jars.png',
    what: 'gastronomy/gastronomy-slide-flatlay-fermentation.png',
    why: 'gastronomy/gastronomy-slide-01-cutting-board.png',
    practice: 'gastronomy/gastronomy-cutting-board-fermentation.png',
    ctaBackground: 'gastronomy/gastronomy-slide-professional-training.png',
    heroIcon1: 'icons/probiotics.svg',
    heroIcon2: 'icons/taste.svg',
    heroIcon3: 'icons/nutrients.svg',
    heroIcon4: 'icons/probiotics.svg',
    workshop1: 'gastronomy/gastronomy-slide-fermentation-jars.png',
    workshop2: 'gastronomy/gastronomy-slide-flatlay-fermentation.png',
    workshop3: 'gastronomy/gastronomy-slide-01-cutting-board.png',
  }

  const altTexts: Record<keyof FermentationMedia, string> = {
    hero: 'Fermentation hero – founders at workshop',
    guide: 'Fermentation guide – jars and process',
    what: 'What is fermentation – flatlay',
    why: 'Why fermentation – benefits',
    practice: 'Practice not trend – traditional fermentation',
    ctaBackground: 'CTA – ready to learn',
    heroIcon1: 'Health & well-being icon',
    heroIcon2: 'Unique flavours icon',
    heroIcon3: 'Simple processes icon',
    heroIcon4: 'Learn & share icon',
    workshop1: 'Lakto-Gemüse workshop',
    workshop2: 'Kombucha workshop',
    workshop3: 'Tempeh workshop',
  }

  try {
    for (const [key, relPath] of Object.entries(imagePaths) as [keyof FermentationMedia, string][]) {
      const fullPath = path.join(imagesDir, relPath)
      if (!fs.existsSync(fullPath)) {
        payload.logger.warn(`Fermentation image not found: ${fullPath}`)
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
        context: { skipAutoTranslate: true },
      })
      ;(media as Record<string, Media>)[key] = created as Media
    }
  } catch (err) {
    payload.logger.warn('Image upload skipped. Seeding text only.', err)
  }

  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
  const seedEnv = { ...process.env, PAYLOAD_SKIP_FERMENTATION_CONDITION: '1' }

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'fermentation' } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    const pageId = existing.docs[0].id
    const forceRecreate = process.argv.includes('--force')
    if (forceRecreate) {
      await payload.delete({
        collection: 'pages',
        id: pageId,
        context: { skipRevalidate: true, disableRevalidate: true },
      })
      payload.logger.info('Deleted existing Fermentation page. Recreating…')
    } else {
      await payload.update({
        collection: 'pages',
        id: pageId,
        locale: 'de',
        context: ctx,
        data: {
          title: 'Fermentation',
          slug: 'fermentation',
          _status: 'published',
          hero: { type: 'lowImpact' as const, richText: LEXICAL_ROOT_WITH_PARAGRAPH },
          layout: [],
          meta: {
            title: 'Fermentation | Fermentfreude',
            description: 'Entdecke die Kunst der Fermentation. Leitfaden zu Lakto-Fermentation, Kombucha und Tempeh.',
          },
          fermentation: fermentationDataDE(media),
        },
      })

      const freshDE = (await payload.findByID({
        collection: 'pages',
        id: pageId,
        locale: 'de',
        depth: 0,
      })) as unknown as Record<string, unknown>
      const fermentationDE = (freshDE.fermentation ?? {}) as Record<string, unknown>
      const heroBlocksDE = (fermentationDE.fermentationHeroBlocks as Array<{ id?: string }>) ?? []
      const workshopCardsDE = (fermentationDE.fermentationWorkshopCards as Array<{ id?: string }>) ?? []
      const whyItemsDE = (fermentationDE.fermentationWhyItems as Array<{ id?: string }>) ?? []
      const dangerConcernsDE = (fermentationDE.fermentationDangerConcerns as Array<{ id?: string }>) ?? []
      const faqItemsDE = (fermentationDE.fermentationFaqItems as Array<{ id?: string }>) ?? []

      const dataENWithIds = {
        ...fermentationDataEN(media),
        fermentationHeroBlocks: fermentationDataEN(media).fermentationHeroBlocks.map((b, i) => ({
          ...b,
          id: heroBlocksDE[i]?.id,
        })),
        fermentationWorkshopCards: fermentationDataEN(media).fermentationWorkshopCards.map((c, i) => ({
          ...c,
          id: workshopCardsDE[i]?.id,
        })),
        fermentationWhyItems: fermentationDataEN(media).fermentationWhyItems.map((item, i) => ({
          ...item,
          id: whyItemsDE[i]?.id,
        })),
        fermentationDangerConcerns: fermentationDataEN(media).fermentationDangerConcerns.map((item, i) => ({
          ...item,
          id: dangerConcernsDE[i]?.id,
        })),
        fermentationFaqItems: fermentationDataEN(media).fermentationFaqItems.map((item, i) => ({
          ...item,
          id: faqItemsDE[i]?.id,
        })),
      }

      try {
        await payload.update({
          collection: 'pages',
          id: pageId,
          locale: 'en',
          context: ctx,
          data: {
            title: 'Fermentation',
            slug: 'fermentation',
            _status: 'published',
            hero: { type: 'lowImpact' as const, richText: LEXICAL_ROOT_WITH_PARAGRAPH },
            layout: [],
            meta: {
              title: 'Fermentation | Fermentfreude',
              description: 'Discover the art of fermentation. A complete guide to lacto-fermentation, kombucha, and tempeh.',
            },
            fermentation: dataENWithIds,
          },
        })
        payload.logger.info('Fermentation page updated (DE + EN). Edit at /admin/collections/pages')
      } catch (_err) {
        payload.logger.warn('EN locale update failed. DE content saved.')
        payload.logger.info('Fermentation page updated (DE only). Edit at /admin/collections/pages')
      }
      process.exit(0)
      return
    }
  }

  const page = await payload.create({
    collection: 'pages',
    locale: 'de',
    context: ctx,
    data: {
      title: 'Fermentation',
      slug: 'fermentation',
      _status: 'published',
      hero: { type: 'lowImpact' as const, richText: LEXICAL_ROOT_WITH_PARAGRAPH },
      layout: [],
      meta: {
        title: 'Fermentation | Fermentfreude',
        description: 'Entdecke die Kunst der Fermentation. Leitfaden zu Lakto-Fermentation, Kombucha und Tempeh.',
      },
      fermentation: fermentationDataDE(media),
    },
  })

  const freshDE = (await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    depth: 0,
  })) as unknown as Record<string, unknown>
  const fermentationDE = (freshDE.fermentation ?? {}) as Record<string, unknown>
  const heroBlocksDE = (fermentationDE.fermentationHeroBlocks as Array<{ id?: string }>) ?? []
  const workshopCardsDE = (fermentationDE.fermentationWorkshopCards as Array<{ id?: string }>) ?? []
  const whyItemsDE = (fermentationDE.fermentationWhyItems as Array<{ id?: string }>) ?? []
  const dangerConcernsDE = (fermentationDE.fermentationDangerConcerns as Array<{ id?: string }>) ?? []
  const faqItemsDE = (fermentationDE.fermentationFaqItems as Array<{ id?: string }>) ?? []

  const dataENWithIds = {
    ...fermentationDataEN(media),
    fermentationHeroBlocks: fermentationDataEN(media).fermentationHeroBlocks.map((b, i) => ({
      ...b,
      id: heroBlocksDE[i]?.id,
    })),
    fermentationWorkshopCards: fermentationDataEN(media).fermentationWorkshopCards.map((c, i) => ({
      ...c,
      id: workshopCardsDE[i]?.id,
    })),
    fermentationWhyItems: fermentationDataEN(media).fermentationWhyItems.map((item, i) => ({
      ...item,
      id: whyItemsDE[i]?.id,
    })),
    fermentationDangerConcerns: fermentationDataEN(media).fermentationDangerConcerns.map((item, i) => ({
      ...item,
      id: dangerConcernsDE[i]?.id,
    })),
    fermentationFaqItems: fermentationDataEN(media).fermentationFaqItems.map((item, i) => ({
      ...item,
      id: faqItemsDE[i]?.id,
    })),
  }

  try {
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      context: ctx,
      data: {
        title: 'Fermentation',
        slug: 'fermentation',
        _status: 'published',
        hero: { type: 'lowImpact' as const, richText: LEXICAL_ROOT_WITH_PARAGRAPH },
        layout: [],
        meta: {
          title: 'Fermentation | Fermentfreude',
          description: 'Discover the art of fermentation. A complete guide to lacto-fermentation, kombucha, and tempeh.',
        },
        fermentation: dataENWithIds,
      },
    })
    payload.logger.info('Fermentation page seeded (DE + EN). Edit at /admin/collections/pages')
  } catch (_err) {
    payload.logger.warn('EN locale update failed. DE content saved.')
    payload.logger.info('Fermentation page seeded (DE only). Edit at /admin/collections/pages')
  }
  process.exit(0)
}

seedFermentation().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
