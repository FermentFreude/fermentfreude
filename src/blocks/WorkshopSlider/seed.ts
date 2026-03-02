/**
 * Seed data builder for the WorkshopSlider block.
 * Imported by seed-home.ts — keeps workshop content colocated with its component.
 */

export interface WorkshopSliderImages {
  laktoImageId: string
  kombuchaImageId: string
  tempehImageId: string
  laktoImage2Id: string
  kombuchaImage2Id: string
  tempehImage2Id: string
}

export function buildWorkshopSlider(imgs: WorkshopSliderImages) {
  const de = {
    blockType: 'workshopSlider' as const,
    eyebrow: 'Workshop-Erlebnis',
    allWorkshopsButtonLabel: 'Alle Workshops',
    allWorkshopsLink: '/workshops',
    workshops: [
      {
        title: 'Lakto-Gemüse',
        audienceTag: 'Für Köche und Lebensmittelexperten',
        theme: 'light' as const,
        description:
          'Verwandle saisonales Gemüse in probiotische Fermente.',
        features: [
          { text: 'Dauer: ca. 2,5 Stunden' },
          { text: 'Für alle – vom Anfänger bis zum Profi.' },
          { text: 'Zutaten, Gläser und Gewürze werden gestellt.' },
          { text: 'Nimm alle Gläser mit nach Hause.' },
        ],
        image: imgs.laktoImageId,
        image2: imgs.laktoImage2Id,
        image3: imgs.laktoImageId,
        image4: imgs.laktoImage2Id,
        price: 'Ab 199,00 € / Person',
        duration: '2,5 Stunden',
        format: 'Vor Ort',
        location: 'Berlin-Neukölln',
        groupSize: '6-12 Personen',
        dates: 'Termine folgen',
        topics: [
          { title: 'Was du lernst', description: 'Grundlagen der Lakto-Fermentation, Sicherheit und Techniken.' },
          { title: 'Was du bekommst', description: 'Alle Rezepte, Gläser und Zutaten zum Mitnehmen.' },
          { title: 'Für wen ist der Kurs', description: 'Für alle – vom Anfänger bis zum Profi.' },
        ],
        learnList: [
          { text: 'Grundlagen der Lakto-Fermentation' },
          { text: 'Sicherheit und Hygiene' },
          { text: 'Praktische Zubereitung verschiedener Gemüsesorten' },
        ],
        ctaLink: '/workshops/lakto-gemuese',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Kombucha Brewing',
        audienceTag: 'Für Köche und Lebensmittelexperten',
        theme: 'dark' as const,
        description:
          'Erstelle deinen eigenen spritzigen, probiotischen Tee zu Hause.',
        features: [
          { text: 'Dauer: ca. 2,5 Stunden' },
          { text: 'Für alle – vom Anfänger bis zum Profi.' },
          { text: 'Tee, Flaschen und Aromen werden gestellt.' },
          { text: 'Nimm deinen selbst gebrauten Kombucha mit nach Hause.' },
        ],
        image: imgs.kombuchaImageId,
        image2: imgs.kombuchaImage2Id,
        image3: imgs.kombuchaImageId,
        image4: imgs.kombuchaImage2Id,
        price: 'Ab 199,00 € / Person',
        duration: '2,5 Stunden',
        format: 'Vor Ort',
        location: 'Berlin-Neukölln',
        groupSize: '6-12 Personen',
        dates: 'Termine folgen',
        topics: [
          { title: 'Was du lernst', description: 'SCOBY-Pflege, Zutaten und Brauprozess.' },
          { title: 'Was du bekommst', description: 'Deinen eigenen Kombucha und Starterkultur.' },
          { title: 'Für wen ist der Kurs', description: 'Für alle – vom Anfänger bis zum Profi.' },
        ],
        learnList: [
          { text: 'SCOBY-Pflege und Vermehrung' },
          { text: 'Brauprozess und Zweitfermentation' },
          { text: 'Aromatisierung und Abfüllung' },
        ],
        ctaLink: '/workshops/kombucha',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Tempeh',
        audienceTag: 'Für Köche und Lebensmittelexperten',
        theme: 'dark' as const,
        description:
          'Erstelle proteinreiches fermentiertes Bohnen-Tempeh von Grund auf.',
        features: [
          { text: 'Dauer: ca. 2,5 Stunden' },
          { text: 'Für Hobbyköche und Profis geeignet.' },
          { text: 'Bohnen, Starterkulturen und alles wird gestellt.' },
          { text: 'Nimm frisch zubereitetes Tempeh mit nach Hause.' },
        ],
        image: imgs.tempehImageId,
        image2: imgs.tempehImage2Id,
        image3: imgs.tempehImageId,
        image4: imgs.tempehImage2Id,
        price: 'Ab 199,00 € / Person',
        duration: '2,5 Stunden',
        format: 'Vor Ort',
        location: 'Berlin-Neukölln',
        groupSize: '6-12 Personen',
        dates: 'Termine folgen',
        topics: [
          { title: 'Was du lernst', description: 'Bohnen-Vorbereitung, Tempeh-Starter und Kultivierung.' },
          { title: 'Was du bekommst', description: 'Frisches Tempeh und Starterkultur zum Mitnehmen.' },
          { title: 'Für wen ist der Kurs', description: 'Für Hobbyköche und Profis geeignet.' },
        ],
        learnList: [
          { text: 'Bohnen-Vorbereitung und Kochen' },
          { text: 'Tempeh-Starter und Beimpfung' },
          { text: 'Kultivierung und Reifung' },
        ],
        ctaLink: '/workshops/tempeh',
        detailsButtonLabel: 'Workshop Details',
      },
    ],
  }

  const en = {
    blockType: 'workshopSlider' as const,
    eyebrow: 'Workshop Experience',
    allWorkshopsButtonLabel: 'All Workshops',
    allWorkshopsLink: '/workshops',
    workshops: [
      {
        title: 'Lacto-Vegetables',
        audienceTag: 'For Chefs and Food Professionals',
        theme: 'light' as const,
        description:
          'Turn seasonal vegetables into probiotic-rich ferments.',
        features: [
          { text: 'Duration: approx. 2.5 hours' },
          { text: 'For everyone from beginner to pro.' },
          { text: 'Ingredients, jars, and spices are all provided.' },
          { text: 'Take all the jars home with you afterward.' },
        ],
        image: imgs.laktoImageId,
        image2: imgs.laktoImage2Id,
        image3: imgs.laktoImageId,
        image4: imgs.laktoImage2Id,
        price: 'From €199.00 / Person',
        duration: '2.5 hours',
        format: 'On-site',
        location: 'Berlin-Neukölln',
        groupSize: '6-12 people',
        dates: 'Dates to follow',
        topics: [
          { title: 'What you learn', description: 'Basics of lacto-fermentation, safety and techniques.' },
          { title: 'What you get', description: 'All recipes, jars and ingredients to take home.' },
          { title: 'Who is the course for', description: 'For everyone from beginner to pro.' },
        ],
        learnList: [
          { text: 'Basics of lacto-fermentation' },
          { text: 'Safety and hygiene' },
          { text: 'Practical preparation of various vegetables' },
        ],
        ctaLink: '/workshops/lakto-gemuese',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Kombucha Brewing',
        audienceTag: 'For Chefs and Food Professionals',
        theme: 'dark' as const,
        description:
          'Create your own fizzy, probiotic tea at home.',
        features: [
          { text: 'Duration: approx. 2.5 hours' },
          { text: 'For everyone from beginner to pro.' },
          { text: 'Tea, bottles, and flavourings are all provided.' },
          { text: 'Take home your own brewed kombucha.' },
        ],
        image: imgs.kombuchaImageId,
        image2: imgs.kombuchaImage2Id,
        image3: imgs.kombuchaImageId,
        image4: imgs.kombuchaImage2Id,
        price: 'From €199.00 / Person',
        duration: '2.5 hours',
        format: 'On-site',
        location: 'Berlin-Neukölln',
        groupSize: '6-12 people',
        dates: 'Dates to follow',
        topics: [
          { title: 'What you learn', description: 'SCOBY care, ingredients and brewing process.' },
          { title: 'What you get', description: 'Your own kombucha and starter culture.' },
          { title: 'Who is the course for', description: 'For everyone from beginner to pro.' },
        ],
        learnList: [
          { text: 'SCOBY care and propagation' },
          { text: 'Brewing process and second fermentation' },
          { text: 'Flavouring and bottling' },
        ],
        ctaLink: '/workshops/kombucha',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Tempeh',
        audienceTag: 'For Chefs and Food Professionals',
        theme: 'dark' as const,
        description:
          'Create protein-rich fermented bean tempeh from scratch.',
        features: [
          { text: 'Duration: approx. 2.5 hours' },
          { text: 'Suitable for home cooks and professionals.' },
          { text: 'Beans, starter cultures, and all are provided.' },
          { text: 'Take home freshly made tempeh.' },
        ],
        image: imgs.tempehImageId,
        image2: imgs.tempehImage2Id,
        image3: imgs.tempehImageId,
        image4: imgs.tempehImage2Id,
        price: 'From €199.00 / Person',
        duration: '2.5 hours',
        format: 'On-site',
        location: 'Berlin-Neukölln',
        groupSize: '6-12 people',
        dates: 'Dates to follow',
        topics: [
          { title: 'What you learn', description: 'Bean preparation, tempeh starter and cultivation.' },
          { title: 'What you get', description: 'Fresh tempeh and starter culture to take home.' },
          { title: 'Who is the course for', description: 'Suitable for home cooks and professionals.' },
        ],
        learnList: [
          { text: 'Bean preparation and cooking' },
          { text: 'Tempeh starter and inoculation' },
          { text: 'Cultivation and ripening' },
        ],
        ctaLink: '/workshops/tempeh',
        detailsButtonLabel: 'Workshop Details',
      },
    ],
  }

  return { de, en }
}

type WorkshopBlock = {
  id?: string
  workshops?: {
    id?: string
    features?: { id?: string }[]
    topics?: { id?: string }[]
    learnList?: { id?: string }[]
  }[]
}

/** Merge EN data with auto-generated IDs from DE save read-back. */
export function mergeWorkshopSliderEN(
  en: ReturnType<typeof buildWorkshopSlider>['en'],
  fresh: WorkshopBlock,
) {
  return {
    ...en,
    id: fresh.id,
    workshops: en.workshops.map((w, i) => ({
      ...w,
      id: fresh.workshops?.[i]?.id,
      features: w.features.map((f, j) => ({
        ...f,
        id: fresh.workshops?.[i]?.features?.[j]?.id,
      })),
      topics: w.topics?.map((t, j) => ({
        ...t,
        id: fresh.workshops?.[i]?.topics?.[j]?.id,
      })),
      learnList: w.learnList?.map((l, j) => ({
        ...l,
        id: fresh.workshops?.[i]?.learnList?.[j]?.id,
      })),
    })),
  }
}
