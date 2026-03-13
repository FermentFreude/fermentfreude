/**
 * Seed the Basic Fermentation Course global (curriculum page at /courses/basic-fermentation).
 * Hero, 7 modules with lessons, and What You'll Learn. Bilingual DE + EN.
 *
 * Rules: Sequential DB writes only (no Promise.all). Seed DE first, read back IDs, then EN with same IDs.
 * Always context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }.
 *
 * Run: pnpm seed basic-fermentation-course
 * Or run after courses: pnpm seed courses && pnpm seed basic-fermentation-course
 */

import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

type LessonRow = { title: string; description?: string; durationMinutes?: number }
type ModuleRow = { title: string; description?: string; lessons: LessonRow[] }

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
        },
        {
          title: 'Was ist Fermentation?',
          description: 'Definition und Grundprinzipien.',
          durationMinutes: 4,
        },
        {
          title: 'Warum fermentieren?',
          description: 'Gesundheit, Geschmack und Haltbarkeit.',
          durationMinutes: 3,
        },
        {
          title: 'Kurze Geschichte der Fermentation',
          description: 'Von der Tradition zur modernen Küche.',
          durationMinutes: 3,
        },
        {
          title: 'Sicherheit im Überblick',
          description: 'Warum Fermentation bei richtiger Anwendung sicher ist.',
          durationMinutes: 2,
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
        },
        {
          title: 'Welches Gemüse eignet sich?',
          description: 'Kohlenhydratgehalt und Textur.',
          durationMinutes: 3,
        },
        {
          title: 'Salz und Salzmenge',
          description: 'Richtige Salzkonzentration für Sicherheit und Geschmack.',
          durationMinutes: 4,
        },
        {
          title: 'Lakto-Fermentation erklärt',
          description: 'Die Rolle der Milchsäurebakterien.',
          durationMinutes: 3,
        },
        {
          title: 'Vorbereitung der Arbeitsfläche',
          description: 'Hygiene und Ablauf.',
          durationMinutes: 2,
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
        },
        { title: 'Lake herstellen', description: 'Prozentsatz und Auflösung.', durationMinutes: 3 },
        {
          title: 'Gemüse schneiden und vorbereiten',
          description: 'Größe und Oberfläche.',
          durationMinutes: 3,
        },
        {
          title: 'Einkochen vs. Fermentieren',
          description: 'Unterschiede verstehen.',
          durationMinutes: 2,
        },
        {
          title: 'Gärgefäße befüllen',
          description: 'Schichten, Druck, Kopfraum.',
          durationMinutes: 4,
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
        },
        {
          title: 'Schritt 1: Schneiden und Salzen',
          description: 'Hands-on Anleitung.',
          durationMinutes: 4,
        },
        {
          title: 'Schritt 2: Massieren und Ruhen',
          description: 'Zellflüssigkeit gewinnen.',
          durationMinutes: 3,
        },
        {
          title: 'Schritt 3: Abfüllen und Beschweren',
          description: 'Alles unter der Flüssigkeit.',
          durationMinutes: 4,
        },
        {
          title: 'Schritt 4: Verschließen und Lagern',
          description: 'Deckel, Ort, Dauer.',
          durationMinutes: 3,
        },
        {
          title: 'Erste Woche: Was beobachten?',
          description: 'Bläschen, Trübung, Geruch.',
          durationMinutes: 3,
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
        },
        {
          title: 'Geruch: gut vs. verdorben',
          description: 'Sauber-sauer vs. faulig.',
          durationMinutes: 3,
        },
        {
          title: 'Aussehen: Farbe und Textur',
          description: 'Wann ist es fertig?',
          durationMinutes: 3,
        },
        { title: 'Geschmackstest', description: 'Salzig, sauer, knackig.', durationMinutes: 2 },
        {
          title: 'Wann fermentieren lassen, wann stoppen?',
          description: 'Temperatur und Zeit.',
          durationMinutes: 4,
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
        },
        {
          title: 'Schimmel: Erkennen und handeln',
          description: 'Nie umrühren, lieber verwerfen.',
          durationMinutes: 3,
        },
        {
          title: 'Zu salzig oder zu weich',
          description: 'Korrektur beim nächsten Mal.',
          durationMinutes: 2,
        },
        {
          title: 'Keine Gärung?',
          description: 'Temperatur, Salz, Gemüse prüfen.',
          durationMinutes: 3,
        },
        {
          title: 'Hygiene-Checkliste',
          description: 'Saubere Hände, saubere Gefäße.',
          durationMinutes: 2,
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
        },
        {
          title: 'Gewürze und Kräuter',
          description: 'Dill, Knoblauch, Chili.',
          durationMinutes: 2,
        },
        {
          title: 'Lagerung und Haltbarkeit',
          description: 'Kühl lagern, wann verbrauchen.',
          durationMinutes: 3,
        },
        {
          title: 'Weitere Kurse: Kombucha, Tempeh',
          description: 'Ausblick auf andere Fermente.',
          durationMinutes: 2,
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
        },
        {
          title: 'What is Fermentation?',
          description: 'Definition and core principles.',
          durationMinutes: 4,
        },
        {
          title: 'Why Ferment?',
          description: 'Health, flavour, and preservation.',
          durationMinutes: 3,
        },
        {
          title: 'A Short History of Fermentation',
          description: 'From tradition to modern kitchen.',
          durationMinutes: 3,
        },
        {
          title: 'Safety at a Glance',
          description: 'Why fermentation is safe when done right.',
          durationMinutes: 2,
        },
      ],
    },
    {
      title: 'Getting Started with Vegetable Fermentation',
      description: 'Equipment and basic techniques.',
      lessons: [
        { title: 'Essential Equipment', description: 'Jars, weights, lids.', durationMinutes: 4 },
        {
          title: 'Which Vegetables Work Best?',
          description: 'Carbohydrates and texture.',
          durationMinutes: 3,
        },
        {
          title: 'Salt and Salt Ratios',
          description: 'Right concentration for safety and taste.',
          durationMinutes: 4,
        },
        {
          title: 'Lacto-Fermentation Explained',
          description: 'The role of lactic acid bacteria.',
          durationMinutes: 3,
        },
        {
          title: 'Preparing Your Workspace',
          description: 'Hygiene and workflow.',
          durationMinutes: 2,
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
        },
        { title: 'Making a Brine', description: 'Percentage and dissolving.', durationMinutes: 3 },
        {
          title: 'Cutting and Preparing Vegetables',
          description: 'Size and surface area.',
          durationMinutes: 3,
        },
        {
          title: 'Canning vs. Fermenting',
          description: 'Understanding the difference.',
          durationMinutes: 2,
        },
        {
          title: 'Filling Your Ferment Vessel',
          description: 'Layering, weighting, headspace.',
          durationMinutes: 4,
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
        },
        {
          title: 'Step 1: Cutting and Salting',
          description: 'Hands-on guide.',
          durationMinutes: 4,
        },
        {
          title: 'Step 2: Massaging and Resting',
          description: 'Drawing out liquid.',
          durationMinutes: 3,
        },
        {
          title: 'Step 3: Packing and Weighting',
          description: 'Keeping everything submerged.',
          durationMinutes: 4,
        },
        {
          title: 'Step 4: Sealing and Storing',
          description: 'Lid, location, duration.',
          durationMinutes: 3,
        },
        {
          title: 'First Week: What to Watch',
          description: 'Bubbles, cloudiness, smell.',
          durationMinutes: 3,
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
        },
        {
          title: 'Smell: Good vs. Spoiled',
          description: 'Clean-tangy vs. rotten.',
          durationMinutes: 3,
        },
        {
          title: 'Appearance: Colour and Texture',
          description: 'When is it done?',
          durationMinutes: 3,
        },
        { title: 'Taste Test', description: 'Salty, tangy, crunchy.', durationMinutes: 2 },
        {
          title: 'When to Let It Run, When to Stop',
          description: 'Temperature and time.',
          durationMinutes: 4,
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
        },
        {
          title: 'Mold: Spot It and Act',
          description: 'Never stir in; discard when in doubt.',
          durationMinutes: 3,
        },
        { title: 'Too Salty or Too Soft', description: 'Adjusting next time.', durationMinutes: 2 },
        {
          title: 'No Fermentation?',
          description: 'Check temperature, salt, vegetables.',
          durationMinutes: 3,
        },
        {
          title: 'Hygiene Checklist',
          description: 'Clean hands, clean vessels.',
          durationMinutes: 2,
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
        },
        { title: 'Spices and Herbs', description: 'Dill, garlic, chilli.', durationMinutes: 2 },
        {
          title: 'Storage and Shelf Life',
          description: 'Store cool; when to consume.',
          durationMinutes: 3,
        },
        {
          title: 'More Courses: Kombucha, Tempeh',
          description: 'A look at other ferments.',
          durationMinutes: 2,
        },
      ],
    },
  ]
}

function learnItemsDE(): string[] {
  return [
    'Wissenschaft und Techniken der Fermentation verstehen',
    'Leckere, probiotische Lebensmittel und Getränke herstellen',
    'Häufige Fermentationsprobleme erkennen und lösen',
    'Solo fermentiertes Gemüse wie Sauerkraut und Kimchi herstellen',
    'Joghurt, Sauerteigbrot und Käse zu Hause machen',
    'Einschätzen, ob dein Ferment gut gelungen ist',
  ]
}

function learnItemsEN(): string[] {
  return [
    'Understand the science and techniques of fermentation',
    'Create delicious, probiotic-rich foods and beverages',
    'Troubleshoot common fermentation problems',
    'Create solo fermented vegetables, like sauerkraut and kimchi',
    'Make homemade yogurt, sourdough bread, and artisanal cheeses',
    'Understand how to judge if your ferment is good',
  ]
}

async function seedBasicFermentationCourse() {
  const payload = await getPayload({ config })

  // Optional: reuse hero image from media (e.g. from courses seed)
  const mediaResult = await payload.find({
    collection: 'media',
    where: { filename: { contains: 'lakto-fermented' } },
    limit: 1,
    depth: 0,
  })
  const heroImageId = mediaResult.docs[0]?.id ? String(mediaResult.docs[0].id) : undefined

  const modulesDE = buildModulesDE()
  const modulesEN = buildModulesEN()

  const dataDE = {
    heroEyebrow: 'Kurs',
    heroTitle: 'Grundlagen der Fermentation',
    heroSubtitle: 'Meistere die Kunst des Fermentierens von Lebensmitteln und Getränken zu Hause',
    heroDescription:
      'Lerne alles, was du über Fermentation wissen musst – von einfachem Gemüseferment bis zu fortgeschrittenen Techniken. Dieser Grundkurs konzentriert sich auf lakto-fermentiertes Gemüse und führt dich Schritt für Schritt vom Verständnis der Fermentation bis zur sicheren Beurteilung deines Ferments.',
    heroRating: '4,8 Bewertung',
    heroStudentsCount: '12.847+ zufriedene Teilnehmer',
    heroDuration: '1h 45m',
    heroLessonsCount: '35 Lektionen',
    heroImage: heroImageId ?? undefined,
    heroProgressHeading: 'Dein Fortschritt',
    curriculumHeading: 'Kurslehrplan',
    modules: modulesDE.map((mod) => ({
      title: mod.title,
      description: mod.description,
      lessons: mod.lessons.map((l) => ({
        title: l.title,
        description: l.description,
        durationMinutes: l.durationMinutes,
      })),
    })),
    learnHeading: 'Was du lernst',
    learnItems: learnItemsDE().map((text) => ({ text })),
  }

  await payload.updateGlobal({
    slug: 'basic-fermentation-course',
    locale: 'de',
    data: dataDE,
    context: ctx,
  })

  const fresh = await payload.findGlobal({
    slug: 'basic-fermentation-course',
    locale: 'de',
    depth: 0,
  })

  const modulesWithIds = (fresh?.modules ?? []) as Array<{
    id?: string | null
    lessons?: Array<{ id?: string | null }> | null
  }>

  const dataEN = {
    heroEyebrow: 'Course',
    heroTitle: 'The Complete Fermentation Course',
    heroSubtitle: 'Master the Art of Fermenting Foods and Beverages at Home',
    heroDescription:
      'Learn everything you need to know about fermentation, from basic vegetable ferments to advanced techniques. This foundational course focuses on lacto-fermented vegetables and guides you step by step—from understanding what fermentation is to recognizing what a successful ferment looks, smells, and tastes like.',
    heroRating: '4.8 rating',
    heroStudentsCount: '12,847+ Happy students',
    heroDuration: '1h 45m',
    heroLessonsCount: '35 Lessons',
    heroImage: heroImageId ?? undefined,
    heroProgressHeading: 'Your Progress',
    curriculumHeading: 'Course Curriculum',
    modules: modulesEN.map((mod, idx) => ({
      id: modulesWithIds[idx]?.id ?? undefined,
      title: mod.title,
      description: mod.description,
      lessons: mod.lessons.map((l, lidx) => ({
        id: modulesWithIds[idx]?.lessons?.[lidx]?.id ?? undefined,
        title: l.title,
        description: l.description,
        durationMinutes: l.durationMinutes,
      })),
    })),
    learnHeading: "What You'll Learn",
    learnItems: learnItemsEN().map((text) => ({ text })),
  }

  await payload.updateGlobal({
    slug: 'basic-fermentation-course',
    locale: 'en',
    data: dataEN,
    context: ctx,
  })

  console.log(
    'Basic Fermentation Course global seeded (DE + EN). Edit at /admin/globals/basic-fermentation-course',
  )
}

seedBasicFermentationCourse().catch((e) => {
  console.error(e)
  process.exit(1)
})
