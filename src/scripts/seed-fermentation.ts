/**
 * Seed the Fermentation page in the Pages collection with all sections.
 * Seeds both DE and EN locales. Content is under Pages → Fermentation page.
 * Uploads hero image to Payload Media (Cloudflare R2).
 *
 * Run: pnpm seed fermentation
 */
import type { Media } from '@/payload-types'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile, readLocalFile } from '@/scripts/seed-image-utils'

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

function fermentationDataDE(media: {
  hero?: Media
  iconProbiotics?: Media
  iconEnzymes?: Media
  iconNutrition?: Media
  iconPreservation?: Media
  workshopLakto?: Media
  workshopKombucha?: Media
  workshopTempeh?: Media
}) {
  return {
    fermentationHeroTitle: 'Innovation trifft Tradition',
    fermentationHeroDescription:
      'Fermentation ist mehr als Sauerkraut oder Joghurt. Ist eine Welt voller Geschmack, Kreativität und überraschender Aromen.',
    fermentationHeroImage: media.hero?.id ?? null,
    fermentationHeroBenefitsTitle: 'WHY FERMENTATION?',
    fermentationHeroBlocks: [
      {
        icon: media.iconProbiotics?.id ?? null,
        title: 'PROBIOTICS',
        description: 'Gute Bakterien unterstützen Gesundheit und stärken das Immunsystem.',
      },
      {
        icon: media.iconEnzymes?.id ?? null,
        title: 'ENZYMES',
        description: 'Lebendige Enzyme helfen bei der Verdauung von Lebensmitteln.',
      },
      {
        icon: media.iconNutrition?.id ?? null,
        title: 'NUTRITION',
        description: 'Gute Bakterien helfen bei der Herstellung und Synthese von Vitaminen.',
      },
      {
        icon: media.iconPreservation?.id ?? null,
        title: 'PRESERVATION',
        description: 'Der Fermentationsprozess verlängert die Haltbarkeit von Lebensmitteln.',
      },
    ],
    fermentationGuideTag: 'Quick Guide',
    fermentationGuideTitle: 'Ein kompletter Leitfaden zur Fermentation',
    fermentationGuideBody:
      'Entdecke die Geheimnisse traditioneller Konservierung und erschaffe deine eigenen fermentierten Köstlichkeiten.',
    fermentationWhatTitle: 'Was ist Fermentation?',
    fermentationWhatBody:
      'Fermentation ist ein natürlicher Stoffwechselprozess, bei dem Mikroorganismen wie Bakterien, Hefen und Pilze organische Verbindungen – meist Kohlenhydrate – in Alkohol, Gase oder organische Säuren umwandeln.',
    fermentationWhatMotto: 'Keine Zusatzstoffe. Keine Abkürzungen. Nur Geduld und Sorgfalt.',
    fermentationWhatLinks: [
      { label: 'Bereit zu lernen?', url: '/workshops' },
      { label: 'Unsere Geschichte', url: '/about' },
    ],
    fermentationWhyTitle: 'Warum ist es so besonders?',
    fermentationWhyItems: [
      {
        title: 'Verbessert Verdauung und Nährstoffaufnahme',
        description:
          'Fermentierte Lebensmittel sind reich an lebenden Kulturen, die das Darmmikrobiom ins Gleichgewicht bringen – eng verbunden mit Verdauung, Immunität und mentalem Wohlbefinden.',
      },
      {
        title: 'Reduziert Lebensmittelverschwendung',
        description:
          'Fermentation verlängert die Haltbarkeit von saisonalem Gemüse und verwandelt Überschüsse in etwas Wertvolles und Nährendes.',
      },
      {
        title: 'Fördert bewusstes Essen',
        description:
          'Wenn du dein Essen selbst zubereitest, wirst du natürlicherweise langsamer. Der Geschmack wird intensiver. Deine Entscheidungen bewusster.',
      },
      {
        title: 'Unterstützt Darm- und Immungesundheit',
        description:
          'Der Fermentationsprozess baut Zucker und Ballaststoffe ab und macht Nährstoffe besser verfügbar und leichter für deinen Körper aufnehmbar.',
      },
      {
        title: 'Stärkt Selbstvertrauen und Eigenständigkeit',
        description:
          'Fermentation zu lernen gibt dir eine praktische Fähigkeit fürs Leben. Sobald du die Grundlagen verstehst, wird der Prozess intuitiv.',
      },
      {
        title: 'Verbindet dich mit Tradition',
        description:
          'Fermentation existiert seit Jahrtausenden in vielen Kulturen und verbindet dich mit ancestralem Wissen und zeitlosen Ernährungspraktiken.',
      },
    ],
    fermentationDangerTitle: 'Ist es gefährlich?',
    fermentationDangerIntro:
      'Fermentation ist eine der sichersten Methoden zur Lebensmittelkonservierung, wenn sie richtig durchgeführt wird. Das saure Milieu bei der Milchsäuregärung verhindert das Wachstum schädlicher Bakterien.',
    fermentationDangerConcernsHeading: 'Häufige Bedenken:',
    fermentationDangerConcerns: [
      {
        title: 'Schimmel',
        description:
          'Oberflächlicher Schimmel kann abgeschöpft werden. Ist er durch die gesamte Charge, wegwerfen.',
      },
      {
        title: 'Geruch',
        description:
          'Fermentierte Lebensmittel haben einen charakteristischen säuerlichen Geruch – das ist normal und gesund.',
      },
      {
        title: 'Botulismus',
        description:
          'Äußerst selten bei Gemüsefermentation aufgrund des sauren Milieus.',
      },
      {
        title: 'Vertraue deinen Sinnen',
        description:
          'Riecht es faul, sieht schleimig aus oder schmeckt falsch – nicht essen.',
      },
    ],
    fermentationDangerClosing:
      'Mit guter Hygiene, qualitativ hochwertigen Zutaten und korrekten Salzverhältnissen ist Fermentation eine zuverlässige und bewährte Praxis.',
    fermentationPracticeTitle: 'Eine Praxis, kein Trend',
    fermentationPracticeBody:
      'Fermentation existiert seit Jahrtausenden in vielen Kulturen – von koreanischem Kimchi über deutsches Sauerkraut bis zu japanischem Miso und äthiopischem Injera.\n\n' +
      'Sie verspricht keine schnellen Ergebnisse. Sie belohnt Beständigkeit, Beobachtung und Sorgfalt.\n\n' +
      'Jede Charge ist anders. Du lernst durch Tun – und durch Vertrauen in den Prozess. Temperatur, Salz, Zeit und Intuition spielen alle eine Rolle.\n\n' +
      'Das ist langsam hergestelltes Essen, mit Aufmerksamkeit. Es fordert dich auf zu beobachten, zu schmecken und anzupassen. Dafür bietet es Nährung, Geschmack und eine tiefere Beziehung zu dem, was du isst.',
    fermentationCtaTitle: 'Bereit zu lernen?',
    fermentationCtaDescription:
      'Nimm an unseren Workshops und Online-Kursen teil, um praktische Fermentationstechniken zu lernen, Fragen zu stellen und dich mit einer Community von Lernenden zu vernetzen.',
    fermentationCtaPrimaryLabel: 'Workshops ansehen',
    fermentationCtaPrimaryUrl: '/workshops',
    fermentationCtaSecondaryLabel: 'Online-Kurse durchsuchen',
    fermentationCtaSecondaryUrl: '/workshops',
    fermentationCtaVideoUrl: '/assets/videos/fermentation-cta.mp4',
    fermentationWorkshopTitle: 'Learn UNIQUE.',
    fermentationWorkshopTitleSuffix: 'FLAVOURS',
    fermentationWorkshopSubtitle:
      'Lerne Fermentation durch geschmackvolle Hands-on-Workshops, die frische Zutaten in lebendige Lebensmittel verwandeln.',
    fermentationWorkshopViewAllLabel: 'Alle Termine anzeigen',
    fermentationWorkshopViewAllUrl: '/workshops',
    fermentationWorkshopNextDateLabel: 'Nächster Termin:',
    fermentationWorkshopCards: [
      {
        image: media.workshopLakto?.id ?? null,
        title: 'Lakto-Gemüse',
        description:
          'Gemüse fermentieren, Aromen erleben – jeden Monat anders. Live online Session.',
        price: '€99',
        priceSuffix: 'pro Person',
        buttonLabel: 'Mehr Infos & Buchen',
        buttonUrl: '/workshops/lakto-gemuese',
        nextDate: 'February 15, 2026',
      },
      {
        image: media.workshopKombucha?.id ?? null,
        title: 'Kombucha',
        description:
          'Tauche ein in die Welt des fermentierten Tees – voller Charakter und Aromen. Interaktiv online.',
        price: '€99',
        priceSuffix: 'pro Person',
        buttonLabel: 'Mehr Infos & Buchen',
        buttonUrl: '/workshops/kombucha',
        nextDate: 'February 18, 2026',
      },
      {
        image: media.workshopTempeh?.id ?? null,
        title: 'Tempeh',
        description:
          'Eine pflanzliche Proteinquelle neu entdecken – mild, nussig und vielseitig. Online Masterclass.',
        price: '€99',
        priceSuffix: 'pro Person',
        buttonLabel: 'Mehr Infos & Buchen',
        buttonUrl: '/workshops/tempeh',
        nextDate: 'February 20, 2026',
      },
    ],
    fermentationFaqTitle: 'Häufig gestellte Fragen',
    fermentationFaqSubtitle: 'Häufige Fragen zur Fermentation beantwortet',
    fermentationFaqItems: [
      {
        question: 'Tötet Fermentation Bakterien ab?',
        answer:
          'Nein, Fermentation fördert das Wachstum nützlicher Bakterien. Die produzierten Säuren verhindern jedoch das Überleben schädlicher Bakterien und machen fermentierte Lebensmittel sicher.',
      },
      {
        question: 'Kann ich bei Raumtemperatur fermentieren?',
        answer:
          'Ja! Die meisten Fermentationen laufen bei 18–24°C. Wärmer beschleunigt, kühler verlangsamt. Direkte Sonne und extreme Temperaturen vermeiden.',
      },
      {
        question: 'Wie lange dauert die Fermentation?',
        answer:
          'Sehr unterschiedlich: 3–7 Tage für Sauerkraut, 24 Stunden für Joghurt, mehrere Monate für Miso. Geschmackstest für deinen bevorzugten Säuregrad.',
      },
      {
        question: 'Ist Fermentation dasselbe wie Einlegen?',
        answer:
          'Nicht ganz. Fermentation nutzt Salz und Zeit (Milchsäuregärung), Einlegen nutzt Essig. Fermentierte Gurken sind probiotisch, Essiggurken nicht.',
      },
      {
        question: 'Kann ich täglich fermentierte Lebensmittel essen?',
        answer:
          'Ja! Beginne mit kleinen Mengen, damit sich dein Darm anpassen kann, dann steigere langsam. 1–2 EL fermentiertes Gemüse täglich ist ein gutes Ziel.',
      },
      {
        question: 'Verderben fermentierte Lebensmittel?',
        answer:
          'Sie sind konserviert, können aber überfermentieren oder bei Kontamination verderben. Nach gewünschtem Fermentationsgrad im Kühlschrank lagern.',
      },
    ],
    fermentationFaqCtaTitle: 'Bereit zum Fermentieren?',
    fermentationFaqCtaBody:
      'Beginne mit einfachem Gemüse wie Kohl oder Gurken, nutze das richtige Salzverhältnis (2–3 % vom Gewicht) und vertraue dem Prozess!',
    fermentationFaqMoreText: 'Keine Antwort gefunden?',
    fermentationFaqContactLabel: 'Kontakt',
    fermentationFaqContactUrl: '/contact',
  }
}

function fermentationDataEN(media: {
  hero?: Media
  iconProbiotics?: Media
  iconEnzymes?: Media
  iconNutrition?: Media
  iconPreservation?: Media
  workshopLakto?: Media
  workshopKombucha?: Media
  workshopTempeh?: Media
}) {
  return {
    fermentationHeroTitle: 'Innovation meets Tradition',
    fermentationHeroDescription:
      'Fermentation is more than sauerkraut or yogurt. It is a world full of taste, creativity and surprising aromas.',
    fermentationHeroImage: media.hero?.id ?? null,
    fermentationHeroBenefitsTitle: 'WHY FERMENTATION?',
    fermentationHeroBlocks: [
      {
        icon: media.iconProbiotics?.id ?? null,
        title: 'PROBIOTICS',
        description: 'Good bacteria supports health and boost immunity.',
      },
      {
        icon: media.iconEnzymes?.id ?? null,
        title: 'ENZYMES',
        description: 'Live enzymes help digest food.',
      },
      {
        icon: media.iconNutrition?.id ?? null,
        title: 'NUTRITION',
        description: 'Good bacteria help manufacture and synthesise vitamins.',
      },
      {
        icon: media.iconPreservation?.id ?? null,
        title: 'PRESERVATION',
        description: 'Fermentation process prolongs life of foods.',
      },
    ],
    fermentationGuideTag: 'Quick Guide',
    fermentationGuideTitle: 'A complete guide to fermentation',
    fermentationGuideBody:
      'Unlock the secrets of traditional preservation and create your own fermented delights.',
    fermentationWhatTitle: 'What is fermentation?',
    fermentationWhatBody:
      'Fermentation is a natural metabolic process where microorganisms like bacteria, yeast, and fungi convert organic compounds—usually carbohydrates—into alcohol, gases, or organic acids.',
    fermentationWhatMotto: 'No additives. No shortcuts. Just patience and care.',
    fermentationWhatLinks: [
      { label: 'Ready to Learn?', url: '/workshops' },
      { label: 'Our Story', url: '/about' },
    ],
    fermentationWhyTitle: 'Why is it so special?',
    fermentationWhyItems: [
      {
        title: 'Improves gut flora and overall well-being',
        description:
          'Probiotics support a healthy gut microbiome and can aid digestion.',
      },
      {
        title: 'Rich in flavors and aromas',
        description:
          'Fermented foods develop unique, complex flavor profiles.',
      },
      {
        title: 'Easy and cost-effective',
        description:
          'With few ingredients and simple techniques, you can ferment at home.',
      },
      {
        title: 'Supports a balanced lifestyle',
        description:
          'Fermented foods fit perfectly into a mindful diet.',
      },
      {
        title: 'Eco-friendly and sustainable',
        description:
          'Fermentation reduces food waste and extends shelf life naturally.',
      },
      {
        title: 'Diverse applications',
        description:
          'From vegetables to drinks to soy products – fermentation is versatile.',
      },
    ],
    fermentationDangerTitle: 'Is it dangerous?',
    fermentationDangerIntro:
      'Fermentation is one of the safest food preservation methods when done correctly. The acidic environment created during lacto-fermentation prevents harmful bacteria from growing.',
    fermentationDangerConcernsHeading: 'Common concerns addressed:',
    fermentationDangerConcerns: [
      {
        title: 'Mold',
        description:
          'Surface mold can be skimmed off. If it\'s throughout the batch, discard it.',
      },
      {
        title: 'Smell',
        description:
          'Fermented foods have a distinctive tangy smell—this is normal and healthy.',
      },
      {
        title: 'Botulism',
        description:
          'Extremely rare in vegetable fermentation due to the acidic environment.',
      },
      {
        title: 'Trust your senses',
        description:
          'If it smells off, looks slimy, or tastes wrong, don\'t eat it.',
      },
    ],
    fermentationDangerClosing:
      'With proper hygiene, quality ingredients, and correct salt ratios, fermentation is a reliable and time-tested practice.',
    fermentationPracticeTitle: 'A practice, not a trend',
    fermentationPracticeBody:
      'Fermentation has existed across cultures for thousands of years—from Korean kimchi to German sauerkraut, from Japanese miso to Ethiopian injera.\n\n' +
      "It doesn't promise quick results. It rewards consistency, observation, and care.\n\n" +
      'Each batch is different. You learn by doing—and by trusting the process. Temperature, salt, time, and intuition all play a role.\n\n' +
      'This is food made slowly, with attention. It asks you to observe, taste, and adjust. In return, it offers nourishment, flavor, and a deeper relationship with what you eat.',
    fermentationCtaTitle: 'Ready to learn?',
    fermentationCtaDescription:
      'Join our workshops and online courses to learn hands-on fermentation techniques, ask questions, and connect with a community of learners.',
    fermentationCtaPrimaryLabel: 'View workshops',
    fermentationCtaPrimaryUrl: '/workshops',
    fermentationCtaSecondaryLabel: 'Browse online courses',
    fermentationCtaSecondaryUrl: '/workshops',
    fermentationCtaVideoUrl: '/assets/videos/fermentation-cta.mp4',
    fermentationWorkshopTitle: 'Learn UNIQUE.',
    fermentationWorkshopTitleSuffix: 'FLAVOURS',
    fermentationWorkshopSubtitle:
      'Learn fermentation through taste hands-on workshops that turn fresh ingredients into vibrant, living food.',
    fermentationWorkshopViewAllLabel: 'View All Dates',
    fermentationWorkshopViewAllUrl: '/workshops',
    fermentationWorkshopNextDateLabel: 'Next Date:',
    fermentationWorkshopCards: [
      {
        image: media.workshopLakto?.id ?? null,
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
        image: media.workshopKombucha?.id ?? null,
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
        image: media.workshopTempeh?.id ?? null,
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
          'No, fermentation promotes beneficial bacteria growth. However, the acids produced prevent harmful bacteria from surviving, making fermented foods safe.',
      },
      {
        question: 'Can I ferment at room temperature?',
        answer:
          'Yes! Most fermentation happens at 65-75°F (18-24°C). Warmer speeds up fermentation, cooler slows it down. Avoid direct sunlight and extreme temperatures.',
      },
      {
        question: 'How long does fermentation take?',
        answer:
          'It varies widely: 3-7 days for sauerkraut, 24 hours for yogurt, several months for miso. Taste test to find your preferred level of tanginess.',
      },
      {
        question: 'Is fermentation the same as pickling?',
        answer:
          'Not exactly. Fermentation uses salt and time (lacto-fermentation), while pickling uses vinegar. Fermented pickles are probiotic; vinegar pickles are not.',
      },
      {
        question: 'Can I eat fermented foods every day?',
        answer:
          'Yes! Start with small amounts to let your gut adjust, then gradually increase. 1-2 tablespoons of fermented vegetables daily is a great goal.',
      },
      {
        question: 'Do fermented foods go bad?',
        answer:
          "They're already preserved, but they can over-ferment or spoil if contaminated. Store in the fridge after desired fermentation level to slow the process.",
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

  const gastronomyDir = path.resolve(process.cwd(), 'public/assets/images/gastronomy')
  const fermentationDir = path.resolve(process.cwd(), 'public/assets/images/fermentation')
  const media: {
    hero?: Media
    iconProbiotics?: Media
    iconEnzymes?: Media
    iconNutrition?: Media
    iconPreservation?: Media
    workshopLakto?: Media
    workshopKombucha?: Media
    workshopTempeh?: Media
  } = {}

  try {
    // 1) Prefer existing media uploaded as "Untitled Project - 1" (fermentation hero)
    const existingHero = await payload.find({
      collection: 'media',
      where: { filename: { contains: 'Untitled Project' } },
      limit: 1,
      depth: 0,
    })
    if (existingHero.docs.length > 0) {
      media.hero = existingHero.docs[0] as Media
      payload.logger.info(`Using existing hero image: ${(media.hero as Media).filename}`)
    } else {
      // 2) Prefer local file you uploaded to public/media
      const heroPaths = [
        path.join(process.cwd(), 'public/media/Untitled Project -  1.png'),
        path.join(gastronomyDir, 'gastronomy-cutting-board-fermentation.png'),
      ]
      const heroPath = heroPaths.find((p) => fs.existsSync(p))
      if (heroPath) {
        const file = await optimizedFile(heroPath, IMAGE_PRESETS.hero)
        const created = await payload.create({
          collection: 'media',
          data: { alt: 'Innovation meets Tradition – fermentation' },
          file: { name: file.name, data: file.data, mimetype: file.mimetype, size: file.size },
          context: { skipAutoTranslate: true },
        })
        media.hero = created as Media
      }
    }
    const probioticsIconPath = fs.existsSync(path.join(process.cwd(), 'public/media/Layer_2.png'))
      ? path.join(process.cwd(), 'public/media/Layer_2.png')
      : path.join(fermentationDir, 'icon-probiotics.svg')
    const enzymesIconPath = fs.existsSync(path.join(process.cwd(), 'public/media/layer1.png'))
      ? path.join(process.cwd(), 'public/media/layer1.png')
      : path.join(fermentationDir, 'icon-enzymes.svg')
    const nutritionIconPath = fs.existsSync(path.join(process.cwd(), 'public/media/Layer_3.png'))
      ? path.join(process.cwd(), 'public/media/Layer_3.png')
      : path.join(fermentationDir, 'icon-nutrition.svg')
    const preservationIconPath = fs.existsSync(path.join(process.cwd(), 'public/media/Layer_24.png'))
      ? path.join(process.cwd(), 'public/media/Layer_24.png')
      : path.join(fermentationDir, 'icon-preservation.svg')
    const iconPaths = [
      { path: probioticsIconPath, key: 'iconProbiotics', alt: 'Probiotics' },
      { path: enzymesIconPath, key: 'iconEnzymes', alt: 'Enzymes' },
      { path: nutritionIconPath, key: 'iconNutrition', alt: 'Nutrition' },
      { path: preservationIconPath, key: 'iconPreservation', alt: 'Preservation' },
    ]
    for (const { path: iconPath, key, alt } of iconPaths) {
      if (fs.existsSync(iconPath)) {
        const file =
          iconPath.endsWith('.png') || iconPath.endsWith('.jpg') || iconPath.endsWith('.jpeg')
            ? await optimizedFile(iconPath, IMAGE_PRESETS.logo)
            : readLocalFile(iconPath)
        const created = await payload.create({
          collection: 'media',
          data: { alt },
          file: { name: file.name, data: file.data, mimetype: file.mimetype, size: file.size },
          context: { skipAutoTranslate: true },
        })
        ;(media as Record<string, Media>)[key] = created as Media
      }
    }
    // Workshop card images — prefer existing gastronomy workshop images
    const workshopMedia = await payload.find({
      collection: 'media',
      where: {
        or: [
          { alt: { contains: 'Lakto' } },
          { alt: { contains: 'Kombucha' } },
          { alt: { contains: 'Tempeh' } },
          { filename: { contains: 'fermentation' } },
        ],
      },
      limit: 10,
      depth: 0,
    })
    const byAlt = (s: string) =>
      workshopMedia.docs.find((d) => (d as { alt?: string }).alt?.toLowerCase().includes(s)) as Media | undefined
    media.workshopLakto = byAlt('lakto') ?? byAlt('fermentation')
    media.workshopKombucha = byAlt('kombucha')
    media.workshopTempeh = byAlt('tempeh')
    if (!media.workshopLakto || !media.workshopKombucha || !media.workshopTempeh) {
      const gastronomyDir = path.resolve(process.cwd(), 'public/assets/images/gastronomy')
      const workshopPaths = [
        { path: path.join(gastronomyDir, 'gastronomy-slide-fermentation-jars.png'), key: 'workshopLakto' },
        { path: path.join(gastronomyDir, 'gastronomy-slide-flatlay-fermentation.png'), key: 'workshopKombucha' },
        { path: path.join(gastronomyDir, 'gastronomy-slide-01-cutting-board.png'), key: 'workshopTempeh' },
      ]
      for (const { path: wp, key } of workshopPaths) {
        if (fs.existsSync(wp) && !(media as Record<string, Media>)[key]) {
          const file = readLocalFile(wp)
          const created = await payload.create({
            collection: 'media',
            data: { alt: key.replace('workshop', '') },
            file: { name: file.name, data: file.data, mimetype: file.mimetype, size: file.size },
            context: { skipAutoTranslate: true },
          })
          ;(media as Record<string, Media>)[key] = created as Media
        }
      }
    }
  } catch (_err) {
    payload.logger.warn('Image/icon upload skipped. Seeding text only.')
  }

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'fermentation' } },
    limit: 1,
    depth: 0,
  })

  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

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
            description: 'Entdecke die Kunst der Fermentation. Workshops und Produkte.',
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
      const whatLinksDE = (fermentationDE.fermentationWhatLinks as Array<{ id?: string }>) ?? []
      const whyItemsDE = (fermentationDE.fermentationWhyItems as Array<{ id?: string }>) ?? []
      const dangerConcernsDE = (fermentationDE.fermentationDangerConcerns as Array<{ id?: string }>) ?? []
      const workshopCardsDE = (fermentationDE.fermentationWorkshopCards as Array<{ id?: string }>) ?? []
      const faqItemsDE = (fermentationDE.fermentationFaqItems as Array<{ id?: string }>) ?? []

      const dataENWithIds = {
        ...fermentationDataEN(media),
        fermentationHeroBlocks: fermentationDataEN(media).fermentationHeroBlocks.map((b, i) => ({
          ...b,
          id: heroBlocksDE[i]?.id,
        })),
        fermentationWhatLinks: fermentationDataEN(media).fermentationWhatLinks.map((l, i) => ({
          ...l,
          id: whatLinksDE[i]?.id,
        })),
        fermentationWhyItems: fermentationDataEN(media).fermentationWhyItems.map((item, i) => ({
          ...item,
          id: whyItemsDE[i]?.id,
        })),
        fermentationDangerConcerns: fermentationDataEN(media).fermentationDangerConcerns.map((item, i) => ({
          ...item,
          id: dangerConcernsDE[i]?.id,
        })),
        fermentationWorkshopCards: fermentationDataEN(media).fermentationWorkshopCards.map((item, i) => ({
          ...item,
          id: workshopCardsDE[i]?.id,
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
              description: 'Discover the art of fermentation. Workshops and products.',
            },
            fermentation: dataENWithIds,
          },
        })
        payload.logger.info('Fermentation page updated (DE + EN). Edit at /admin/collections/pages')
      } catch (_err) {
        payload.logger.warn('EN locale update failed. DE content saved.')
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
        description: 'Entdecke die Kunst der Fermentation. Workshops und Produkte.',
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
  const whatLinksDE = (fermentationDE.fermentationWhatLinks as Array<{ id?: string }>) ?? []
  const whyItemsDE = (fermentationDE.fermentationWhyItems as Array<{ id?: string }>) ?? []
  const dangerConcernsDE = (fermentationDE.fermentationDangerConcerns as Array<{ id?: string }>) ?? []
  const workshopCardsDE = (fermentationDE.fermentationWorkshopCards as Array<{ id?: string }>) ?? []
  const faqItemsDE = (fermentationDE.fermentationFaqItems as Array<{ id?: string }>) ?? []

  const dataENWithIds = {
    ...fermentationDataEN(media),
    fermentationHeroBlocks: fermentationDataEN(media).fermentationHeroBlocks.map((b, i) => ({
      ...b,
      id: heroBlocksDE[i]?.id,
    })),
    fermentationWhatLinks: fermentationDataEN(media).fermentationWhatLinks.map((l, i) => ({
      ...l,
      id: whatLinksDE[i]?.id,
    })),
    fermentationWhyItems: fermentationDataEN(media).fermentationWhyItems.map((item, i) => ({
      ...item,
      id: whyItemsDE[i]?.id,
    })),
    fermentationDangerConcerns: fermentationDataEN(media).fermentationDangerConcerns.map((item, i) => ({
      ...item,
      id: dangerConcernsDE[i]?.id,
    })),
    fermentationWorkshopCards: fermentationDataEN(media).fermentationWorkshopCards.map((item, i) => ({
      ...item,
      id: workshopCardsDE[i]?.id,
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
          description: 'Discover the art of fermentation. Workshops and products.',
        },
        fermentation: dataENWithIds,
      },
    })
    payload.logger.info('Fermentation page seeded (DE + EN). Edit at /admin/collections/pages')
  } catch (_err) {
    payload.logger.warn('EN locale update failed. DE content saved.')
  }
  process.exit(0)
}

seedFermentation().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
