/**
 * Online Courses collection seed — creates course documents in the OnlineCourses collection.
 *
 * Seeds:
 *   - Basic Fermentation Course (active, with full curriculum: hero, modules/lessons, What You'll Learn)
 *   - Advanced Miso & Koji (coming soon)
 *   - Fermented Hot Sauces (coming soon)
 *   - Tempeh & Plant-Based (coming soon)
 *
 * Bilingual: DE first → read IDs → EN with same IDs.
 * Non-destructive: skips if courses already exist. Use --force to overwrite.
 *
 * Run: pnpm seed online-courses
 */

import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

type LessonRow = { title: string; description?: string; durationMinutes?: number; locked?: boolean }
type ModuleRow = { title: string; description?: string; lessons: LessonRow[] }

interface CourseLocaleData {
  title: string
  description: string
  instructor?: string
  durationText?: string
  levelText?: string
  comingSoonBadge?: string
  heroEyebrow?: string
  heroSubtitle?: string
  heroDescription?: string
  heroDuration?: string
  heroLessonsCount?: string
  heroProgressHeading?: string
  curriculumHeading?: string
  modules?: ModuleRow[]
  learnHeading?: string
  learnItems?: string[]
}

interface CourseData {
  slug: string
  de: CourseLocaleData
  en: CourseLocaleData
  courseSlug?: string
  courseViewerUrl?: string
  isActive: boolean
  isComingSoon: boolean
  sortOrder: number
  productSlug?: string
}

/* ────────── Full curriculum for Basic Fermentation ────────── */

function buildModulesDE(): ModuleRow[] {
  return [
    {
      title: 'Einführung in die Fermentation',
      description: 'Grundlagen der Fermentation und ihre Geschichte.',
      lessons: [
        {
          title: 'Willkommen und Kursüberblick',
          description: 'Was dich in diesem Kurs erwartet.',
          durationMinutes: 3,
          locked: false,
        },
        {
          title: 'Was ist Fermentation?',
          description: 'Definition und Grundprinzipien.',
          durationMinutes: 4,
          locked: false,
        },
        {
          title: 'Warum fermentieren?',
          description: 'Gesundheit, Geschmack und Haltbarkeit.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Kurze Geschichte der Fermentation',
          description: 'Von der Tradition zur modernen Küche.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Sicherheit im Überblick',
          description: 'Warum Fermentation bei richtiger Anwendung sicher ist.',
          durationMinutes: 2,
          locked: true,
        },
      ],
    },
    {
      title: 'Erste Schritte mit Gemüsefermentation',
      description: 'Ausstattung und Grundtechniken.',
      lessons: [
        {
          title: 'Benötigte Ausrüstung',
          description: 'Gläser, Gewichte, Deckel.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Welches Gemüse eignet sich?',
          description: 'Kohlenhydratgehalt und Textur.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Salz und Salzmenge',
          description: 'Richtige Salzkonzentration für Sicherheit und Geschmack.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Lakto-Fermentation erklärt',
          description: 'Die Rolle der Milchsäurebakterien.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Vorbereitung der Arbeitsfläche',
          description: 'Hygiene und Ablauf.',
          durationMinutes: 2,
          locked: true,
        },
      ],
    },
    {
      title: 'Salz, Lake und Techniken',
      description: 'Trockensalzen vs. Lake.',
      lessons: [
        {
          title: 'Trockensalzen: Methode und Rechnung',
          description: 'Salzmenge pro Gemüsegewicht.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Lake herstellen',
          description: 'Prozentsatz und Auflösung.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Gemüse schneiden und vorbereiten',
          description: 'Größe und Oberfläche.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Einkochen vs. Fermentieren',
          description: 'Unterschiede verstehen.',
          durationMinutes: 2,
          locked: true,
        },
        {
          title: 'Gärgefäße befüllen',
          description: 'Schichten, Druck, Kopfraum.',
          durationMinutes: 4,
          locked: true,
        },
      ],
    },
    {
      title: 'Dein erstes Ferment',
      description: 'Schritt für Schritt durch das erste Glas.',
      lessons: [
        {
          title: 'Rezept: Einfaches Sauerkraut',
          description: 'Zutaten und Mengen.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Schritt 1: Schneiden und Salzen',
          description: 'Hands-on Anleitung.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Schritt 2: Massieren und Ruhen',
          description: 'Zellflüssigkeit gewinnen.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Schritt 3: Abfüllen und Beschweren',
          description: 'Alles unter der Flüssigkeit.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Schritt 4: Verschließen und Lagern',
          description: 'Deckel, Ort, Dauer.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Erste Woche: Was beobachten?',
          description: 'Bläschen, Trübung, Geruch.',
          durationMinutes: 3,
          locked: true,
        },
      ],
    },
    {
      title: 'Erfolg erkennen',
      description: 'Wie ein gutes Ferment aussieht, riecht und schmeckt.',
      lessons: [
        {
          title: 'Normale Anzeichen der Gärung',
          description: 'Bläschen, Trübung, leichter Druck.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Geruch: gut vs. verdorben',
          description: 'Sauber-sauer vs. faulig.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Aussehen: Farbe und Textur',
          description: 'Wann ist es fertig?',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Geschmackstest',
          description: 'Salzig, sauer, knackig.',
          durationMinutes: 2,
          locked: true,
        },
        {
          title: 'Wann fermentieren lassen, wann stoppen?',
          description: 'Temperatur und Zeit.',
          durationMinutes: 4,
          locked: true,
        },
      ],
    },
    {
      title: 'Fehlerbehebung und Sicherheit',
      description: 'Häufige Probleme und wie du sie vermeidest.',
      lessons: [
        {
          title: 'Kahmhefe: Was ist das?',
          description: 'Weißer Film auf der Oberfläche.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Schimmel: Erkennen und handeln',
          description: 'Nie umrühren, lieber verwerfen.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Zu salzig oder zu weich',
          description: 'Korrektur beim nächsten Mal.',
          durationMinutes: 2,
          locked: true,
        },
        {
          title: 'Keine Gärung?',
          description: 'Temperatur, Salz, Gemüse prüfen.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Hygiene-Checkliste',
          description: 'Saubere Hände, saubere Gefäße.',
          durationMinutes: 2,
          locked: true,
        },
      ],
    },
    {
      title: 'Nächste Schritte und Tipps',
      description: 'Weiter experimentieren und vertiefen.',
      lessons: [
        {
          title: 'Andere Gemüse ausprobieren',
          description: 'Möhren, Rüben, Bohnen.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Gewürze und Kräuter',
          description: 'Dill, Knoblauch, Chili.',
          durationMinutes: 2,
          locked: true,
        },
        {
          title: 'Lagerung und Haltbarkeit',
          description: 'Kühl lagern, wann verbrauchen.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Weitere Kurse: Kombucha, Tempeh',
          description: 'Ausblick auf andere Fermente.',
          durationMinutes: 2,
          locked: true,
        },
      ],
    },
  ]
}

function buildModulesEN(): ModuleRow[] {
  return [
    {
      title: 'Introduction to Fermentation',
      description: 'Learn the basics of fermentation and its history.',
      lessons: [
        {
          title: 'Welcome and Course Overview',
          description: 'What to expect in this course.',
          durationMinutes: 3,
          locked: false,
        },
        {
          title: 'What is Fermentation?',
          description: 'Definition and core principles.',
          durationMinutes: 4,
          locked: false,
        },
        {
          title: 'Why Ferment?',
          description: 'Health, flavour, and preservation.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'A Short History of Fermentation',
          description: 'From tradition to modern kitchen.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Safety at a Glance',
          description: 'Why fermentation is safe when done right.',
          durationMinutes: 2,
          locked: true,
        },
      ],
    },
    {
      title: 'Getting Started with Vegetable Fermentation',
      description: 'Equipment and basic techniques.',
      lessons: [
        {
          title: 'Essential Equipment',
          description: 'Jars, weights, lids.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Which Vegetables Work Best?',
          description: 'Carbohydrates and texture.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Salt and Salt Ratios',
          description: 'Right concentration for safety and taste.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Lacto-Fermentation Explained',
          description: 'The role of lactic acid bacteria.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Preparing Your Workspace',
          description: 'Hygiene and workflow.',
          durationMinutes: 2,
          locked: true,
        },
      ],
    },
    {
      title: 'Salt, Brine & Techniques',
      description: 'Dry salting vs. brine.',
      lessons: [
        {
          title: 'Dry Salting: Method and Math',
          description: 'Salt amount per vegetable weight.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Making a Brine',
          description: 'Percentage and dissolving.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Cutting and Preparing Vegetables',
          description: 'Size and surface area.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Canning vs. Fermenting',
          description: 'Understanding the difference.',
          durationMinutes: 2,
          locked: true,
        },
        {
          title: 'Filling Your Ferment Vessel',
          description: 'Layering, weighting, headspace.',
          durationMinutes: 4,
          locked: true,
        },
      ],
    },
    {
      title: 'Your First Ferment',
      description: 'Step by step through your first jar.',
      lessons: [
        {
          title: 'Recipe: Simple Sauerkraut',
          description: 'Ingredients and quantities.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Step 1: Cutting and Salting',
          description: 'Hands-on guide.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Step 2: Massaging and Resting',
          description: 'Drawing out liquid.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Step 3: Packing and Weighting',
          description: 'Keeping everything submerged.',
          durationMinutes: 4,
          locked: true,
        },
        {
          title: 'Step 4: Sealing and Storing',
          description: 'Lid, location, duration.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'First Week: What to Watch',
          description: 'Bubbles, cloudiness, smell.',
          durationMinutes: 3,
          locked: true,
        },
      ],
    },
    {
      title: 'Recognizing Success',
      description: 'What a good ferment looks, smells, and tastes like.',
      lessons: [
        {
          title: 'Normal Signs of Fermentation',
          description: 'Bubbles, cloudiness, slight pressure.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Smell: Good vs. Spoiled',
          description: 'Clean-tangy vs. rotten.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Appearance: Colour and Texture',
          description: 'When is it done?',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Taste Test',
          description: 'Salty, tangy, crunchy.',
          durationMinutes: 2,
          locked: true,
        },
        {
          title: 'When to Let It Run, When to Stop',
          description: 'Temperature and time.',
          durationMinutes: 4,
          locked: true,
        },
      ],
    },
    {
      title: 'Troubleshooting & Safety',
      description: 'Common issues and how to avoid them.',
      lessons: [
        {
          title: 'Kahm Yeast: What Is It?',
          description: 'White film on the surface.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Mold: Spot It and Act',
          description: 'Never stir in; discard when in doubt.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Too Salty or Too Soft',
          description: 'Adjusting next time.',
          durationMinutes: 2,
          locked: true,
        },
        {
          title: 'No Fermentation?',
          description: 'Check temperature, salt, vegetables.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Hygiene Checklist',
          description: 'Clean hands, clean vessels.',
          durationMinutes: 2,
          locked: true,
        },
      ],
    },
    {
      title: 'Next Steps & Tips',
      description: 'Keep experimenting and deepening your practice.',
      lessons: [
        {
          title: 'Trying Other Vegetables',
          description: 'Carrots, beets, green beans.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'Spices and Herbs',
          description: 'Dill, garlic, chilli.',
          durationMinutes: 2,
          locked: true,
        },
        {
          title: 'Storage and Shelf Life',
          description: 'Store cool; when to consume.',
          durationMinutes: 3,
          locked: true,
        },
        {
          title: 'More Courses: Kombucha, Tempeh',
          description: 'A look at other ferments.',
          durationMinutes: 2,
          locked: true,
        },
      ],
    },
  ]
}

/* ────────── Course definitions ────────── */

const COURSES: CourseData[] = [
  {
    slug: 'basic-fermentation',
    de: {
      title: 'Grundkurs Fermentation',
      description:
        'Lerne die Grundlagen der Fermentation von zu Hause aus. Sauerkraut, Kimchi, Kombucha und mehr — mit Schritt-für-Schritt-Anleitungen.',
      instructor: 'David Heider & Marcel Rauminger',
      durationText: '6 Stunden Inhalt',
      levelText: 'Anfänger',
      heroEyebrow: 'Kurs',
      heroSubtitle: 'Meistere die Kunst des Fermentierens von Lebensmitteln und Getränken zu Hause',
      heroDescription:
        'Lerne alles, was du über Fermentation wissen musst – von einfachem Gemüseferment bis zu fortgeschrittenen Techniken. Dieser Grundkurs konzentriert sich auf lakto-fermentiertes Gemüse und führt dich Schritt für Schritt vom Verständnis der Fermentation bis zur sicheren Beurteilung deines Ferments.',
      heroDuration: '1h 45m',
      heroLessonsCount: '35 Lektionen',
      heroProgressHeading: 'Dein Fortschritt',
      curriculumHeading: 'Kurslehrplan',
      modules: buildModulesDE(),
      learnHeading: 'Was du lernst',
      learnItems: [
        'Wissenschaft und Techniken der Fermentation verstehen',
        'Leckere, probiotische Lebensmittel und Getränke herstellen',
        'Häufige Fermentationsprobleme erkennen und lösen',
        'Solo fermentiertes Gemüse wie Sauerkraut und Kimchi herstellen',
        'Joghurt, Sauerteigbrot und Käse zu Hause machen',
        'Einschätzen, ob dein Ferment gut gelungen ist',
      ],
    },
    en: {
      title: 'Basic Fermentation Course',
      description:
        'Learn the fundamentals of fermentation from home. Sauerkraut, kimchi, kombucha, and more — with step-by-step guidance.',
      instructor: 'David Heider & Marcel Rauminger',
      durationText: '6 hours of content',
      levelText: 'Beginner',
      heroEyebrow: 'Course',
      heroSubtitle: 'Master the Art of Fermenting Foods and Beverages at Home',
      heroDescription:
        'Learn everything you need to know about fermentation, from basic vegetable ferments to advanced techniques. This foundational course focuses on lacto-fermented vegetables and guides you step by step—from understanding what fermentation is to recognizing what a successful ferment looks, smells, and tastes like.',
      heroDuration: '1h 45m',
      heroLessonsCount: '35 Lessons',
      heroProgressHeading: 'Your Progress',
      curriculumHeading: 'Course Curriculum',
      modules: buildModulesEN(),
      learnHeading: "What You'll Learn",
      learnItems: [
        'Understand the science and techniques of fermentation',
        'Create delicious, probiotic-rich foods and beverages',
        'Troubleshoot common fermentation problems',
        'Create solo fermented vegetables, like sauerkraut and kimchi',
        'Make homemade yogurt, sourdough bread, and artisanal cheeses',
        'Understand how to judge if your ferment is good',
      ],
    },
    courseSlug: 'basic-fermentation',
    courseViewerUrl: '/courses/basic-fermentation#curriculum',
    isActive: true,
    isComingSoon: false,
    sortOrder: 0,
    productSlug: 'basic-fermentation-course',
  },
  {
    slug: 'advanced-miso-koji',
    de: {
      title: 'Fortgeschrittene Miso & Koji Meisterklasse',
      description:
        'Tauche ein in japanische Fermentationstechniken, Koji-Kultivierung und traditionelle Miso-Herstellung.',
      instructor: 'David Heider & Marcel Rauminger',
      durationText: '10 Stunden Inhalt',
      levelText: 'Fortgeschritten',
      comingSoonBadge: 'Sommer 2026',
    },
    en: {
      title: 'Advanced Miso & Koji Mastery',
      description:
        'Deep dive into Japanese fermentation techniques, koji cultivation, and traditional miso making.',
      instructor: 'David Heider & Marcel Rauminger',
      durationText: '10 hours of content',
      levelText: 'Advanced Level',
      comingSoonBadge: 'Summer 2026',
    },
    isActive: true,
    isComingSoon: true,
    sortOrder: 1,
  },
  {
    slug: 'fermented-hot-sauces',
    de: {
      title: 'Fermentierte Scharfe Saucen & Würzmittel',
      description:
        'Kreiere einzigartige fermentierte scharfe Saucen, Senf und Würzmittel mit intensiven Aromen.',
      instructor: 'Maria Rodriguez',
      durationText: '5 Stunden Inhalt',
      levelText: 'Mittelstufe',
      comingSoonBadge: 'Herbst 2026',
    },
    en: {
      title: 'Fermented Hot Sauces & Condiments',
      description:
        'Create unique fermented hot sauces, mustards, and condiments with bold flavors.',
      instructor: 'Maria Rodriguez',
      durationText: '5 hours of content',
      levelText: 'Intermediate Level',
      comingSoonBadge: 'Fall 2026',
    },
    isActive: true,
    isComingSoon: true,
    sortOrder: 2,
  },
  {
    slug: 'tempeh-plant-based',
    de: {
      title: 'Tempeh & Pflanzliche Fermentation',
      description:
        'Meistere die Tempeh-Herstellung und entdecke innovative pflanzliche Fermentationstechniken.',
      instructor: 'Emma Green',
      durationText: '6 Stunden Inhalt',
      levelText: 'Mittelstufe',
      comingSoonBadge: 'Winter 2027',
    },
    en: {
      title: 'Tempeh & Plant-Based Fermentation',
      description:
        'Master tempeh production and explore innovative plant-based fermentation techniques.',
      instructor: 'Emma Green',
      durationText: '6 hours of content',
      levelText: 'Intermediate Level',
      comingSoonBadge: 'Winter 2027',
    },
    isActive: true,
    isComingSoon: true,
    sortOrder: 3,
  },
]

/* ────────── Seed function ────────── */

async function seedOnlineCourses() {
  const payload = await getPayload({ config })
  const forceRecreate = process.argv.includes('--force')

  const existing = await payload.find({
    collection: 'online-courses',
    limit: 100,
    depth: 0,
  })

  if (existing.docs.length > 0 && !forceRecreate) {
    payload.logger.info(
      '⏭️  OnlineCourses already has %d docs. Skipping. Use --force to overwrite.',
      existing.docs.length,
    )
    process.exit(0)
  }

  if (forceRecreate && existing.docs.length > 0) {
    payload.logger.info('🔄 --force: deleting %d existing online courses...', existing.docs.length)
    for (const doc of existing.docs) {
      await payload.delete({ collection: 'online-courses', id: doc.id, context: ctx })
    }
  }

  // Resolve product ID for basic fermentation course
  let basicCourseProductId: string | undefined
  const productResult = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'basic-fermentation-course' } },
    limit: 1,
    depth: 0,
  })
  if (productResult.docs.length > 0) {
    basicCourseProductId = String(productResult.docs[0].id)
    payload.logger.info('✅ Found product: basic-fermentation-course → %s', basicCourseProductId)
  } else {
    payload.logger.warn('⚠️  Product "basic-fermentation-course" not found. Skipping product link.')
  }

  for (const course of COURSES) {
    payload.logger.info('📚 Creating course: %s (DE)...', course.slug)

    // 1. Create DE
    const created = await payload.create({
      collection: 'online-courses',
      locale: 'de',
      data: {
        slug: course.slug,
        title: course.de.title,
        description: course.de.description,
        isActive: course.isActive,
        isComingSoon: course.isComingSoon,
        sortOrder: course.sortOrder,
        instructor: course.de.instructor,
        durationText: course.de.durationText,
        levelText: course.de.levelText,
        comingSoonBadge: course.de.comingSoonBadge,
        ...(course.courseSlug ? { courseSlug: course.courseSlug } : {}),
        ...(course.courseViewerUrl ? { courseViewerUrl: course.courseViewerUrl } : {}),
        ...(course.productSlug && basicCourseProductId ? { product: basicCourseProductId } : {}),
        // Hero viewer fields
        heroEyebrow: course.de.heroEyebrow,
        heroSubtitle: course.de.heroSubtitle,
        heroDescription: course.de.heroDescription,
        heroDuration: course.de.heroDuration,
        heroLessonsCount: course.de.heroLessonsCount,
        heroProgressHeading: course.de.heroProgressHeading,
        curriculumHeading: course.de.curriculumHeading,
        // Full modules with descriptions, durations, and locked flag
        ...(course.de.modules
          ? {
              modules: course.de.modules.map((mod) => ({
                title: mod.title,
                description: mod.description,
                lessons: mod.lessons.map((l) => ({
                  title: l.title,
                  description: l.description,
                  durationMinutes: l.durationMinutes,
                  locked: l.locked ?? true,
                })),
              })),
            }
          : {}),
        // What You'll Learn
        learnHeading: course.de.learnHeading,
        ...(course.de.learnItems
          ? { learnItems: course.de.learnItems.map((text) => ({ text })) }
          : {}),
      },
      context: ctx,
    })

    // 2. Read back DE to get generated IDs
    const fresh = await payload.findByID({
      collection: 'online-courses',
      id: created.id,
      locale: 'de',
      depth: 0,
    })

    // 3. Build EN with same IDs
    const freshModules = (fresh.modules ?? []) as Array<{
      id?: string
      lessons?: Array<{ id?: string }>
    }>
    const freshLearnItems = (fresh.learnItems ?? []) as Array<{ id?: string }>

    const enModules = course.en.modules
      ? course.en.modules.map((mod, mi) => ({
          id: freshModules[mi]?.id,
          title: mod.title,
          description: mod.description,
          lessons: mod.lessons.map((l, li) => ({
            id: freshModules[mi]?.lessons?.[li]?.id,
            title: l.title,
            description: l.description,
            durationMinutes: l.durationMinutes,
            locked: l.locked ?? true,
          })),
        }))
      : undefined

    const enLearnItems = course.en.learnItems
      ? course.en.learnItems.map((text, i) => ({
          id: freshLearnItems[i]?.id,
          text,
        }))
      : undefined

    // 4. Save EN
    payload.logger.info('📚 Saving EN for: %s...', course.slug)
    await payload.update({
      collection: 'online-courses',
      id: created.id,
      locale: 'en',
      data: {
        title: course.en.title,
        description: course.en.description,
        instructor: course.en.instructor,
        durationText: course.en.durationText,
        levelText: course.en.levelText,
        comingSoonBadge: course.en.comingSoonBadge,
        heroEyebrow: course.en.heroEyebrow,
        heroSubtitle: course.en.heroSubtitle,
        heroDescription: course.en.heroDescription,
        heroDuration: course.en.heroDuration,
        heroLessonsCount: course.en.heroLessonsCount,
        heroProgressHeading: course.en.heroProgressHeading,
        curriculumHeading: course.en.curriculumHeading,
        learnHeading: course.en.learnHeading,
        ...(enModules ? { modules: enModules } : {}),
        ...(enLearnItems ? { learnItems: enLearnItems } : {}),
      },
      context: ctx,
    })

    payload.logger.info('✅ %s created (ID: %s)', course.slug, created.id)
  }

  payload.logger.info('\n🎉 All online courses seeded!')
  process.exit(0)
}

seedOnlineCourses()
