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
          'Gemüse fermentieren und jeden Monat neue Geschmacksrichtungen erleben. Hast du saisonales Gemüse übrig und möchtest es in echte Geschmackserlebnisse verwandeln?',
        features: [
          { text: 'Dauer: ca. 3 Stunden' },
          { text: 'Für alle – vom Anfänger bis zum Profi.' },
          { text: 'Zutaten, Gläser und Gewürze werden gestellt.' },
          { text: 'Nimm alle Gläser mit nach Hause.' },
        ],
        image: imgs.laktoImageId,
        image2: imgs.laktoImage2Id,
        ctaLink: '/workshops/lakto-gemuese',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Kombucha',
        audienceTag: 'Für Köche und Lebensmittelexperten',
        theme: 'dark' as const,
        description:
          'Tee fermentieren und mit jedem Brauvorgang ausgewogene Aromen kreieren. Neugierig, wie Kombucha natürlich spritzig, frisch und komplex wird?',
        features: [
          { text: 'Dauer: ca. 3 Stunden' },
          { text: 'Für alle – vom Anfänger bis zum Profi.' },
          { text: 'Tee, Flaschen und Aromen werden gestellt.' },
          { text: 'Nimm deinen selbst gebrauten Kombucha mit nach Hause.' },
        ],
        image: imgs.kombuchaImageId,
        image2: imgs.kombuchaImage2Id,
        ctaLink: '/workshops/kombucha',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Tempeh',
        audienceTag: 'Für Köche und Lebensmittelexperten',
        theme: 'dark' as const,
        description:
          'Von Bohnen zu Tempeh – Textur, Geschmack und Technik verstehen. Lerne, wie diese traditionelle Fermentation zu einem vielseitigen, gesunden Protein wird.',
        features: [
          { text: 'Dauer: ca. 3 Stunden' },
          { text: 'Für Hobbyköche und Profis geeignet.' },
          { text: 'Bohnen, Starterkulturen und alles wird gestellt.' },
          { text: 'Nimm frisch zubereitetes Tempeh mit nach Hause.' },
        ],
        image: imgs.tempehImageId,
        image2: imgs.tempehImage2Id,
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
          'Fermenting vegetables, experiencing different flavours every month. Do you have leftover seasonal vegetables and want to transform them into real taste sensations?',
        features: [
          { text: 'Duration: approx. 3 hours' },
          { text: 'For everyone from beginner to pro.' },
          { text: 'Ingredients, jars, and spices are all provided.' },
          { text: 'Take all the jars home with you afterward.' },
        ],
        image: imgs.laktoImageId,
        image2: imgs.laktoImage2Id,
        ctaLink: '/workshops/lakto-gemuese',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Kombucha',
        audienceTag: 'For Chefs and Food Professionals',
        theme: 'dark' as const,
        description:
          'Fermenting tea, creating balanced flavours with every brew. Curious how kombucha becomes naturally fizzy, fresh, and complex?',
        features: [
          { text: 'Duration: approx. 3 hours' },
          { text: 'For everyone from beginner to pro.' },
          { text: 'Tea, bottles, and flavourings are all provided.' },
          { text: 'Take home your own brewed kombucha.' },
        ],
        image: imgs.kombuchaImageId,
        image2: imgs.kombuchaImage2Id,
        ctaLink: '/workshops/kombucha',
        detailsButtonLabel: 'Workshop Details',
      },
      {
        title: 'Tempeh',
        audienceTag: 'For Chefs and Food Professionals',
        theme: 'dark' as const,
        description:
          'From beans to tempeh, understanding texture, taste, and technique. Learn how this traditional fermentation becomes a versatile, healthy protein.',
        features: [
          { text: 'Duration: approx. 3 hours' },
          { text: 'Suitable for home cooks and professionals.' },
          { text: 'Beans, starter cultures, and all are provided.' },
          { text: 'Take home freshly made tempeh.' },
        ],
        image: imgs.tempehImageId,
        image2: imgs.tempehImage2Id,
        ctaLink: '/workshops/tempeh',
        detailsButtonLabel: 'Workshop Details',
      },
    ],
  }

  return { de, en }
}

type WorkshopBlock = {
  id?: string
  workshops?: { id?: string; features?: { id?: string }[] }[]
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
    })),
  }
}
