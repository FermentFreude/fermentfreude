/**
 * Seed data builder for the FeatureCards block.
 */

export interface FeatureCardsImages {
  iconProbioticsId: string
  iconNutrientsId: string
  iconFlavourId: string
}

export function buildFeatureCards(imgs: FeatureCardsImages) {
  const de = {
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
        icon: imgs.iconProbioticsId,
      },
      {
        title: 'Nährstoffe',
        description:
          'Der Fermentationsprozess erhöht die Bioverfügbarkeit von Vitaminen und Mineralstoffen in deiner Nahrung.',
        icon: imgs.iconNutrientsId,
      },
      {
        title: 'Geschmack',
        description:
          'Fermentation erzeugt komplexe Umami-Aromen und einzigartige Geschmacksprofile, die kein anderes Verfahren erreicht.',
        icon: imgs.iconFlavourId,
      },
    ],
    buttonLabel: 'Mehr erfahren',
    buttonLink: '/about',
  }

  const en = {
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
        icon: imgs.iconProbioticsId,
      },
      {
        title: 'Nutrients',
        description:
          'The fermentation process increases the bioavailability of vitamins and minerals in your food.',
        icon: imgs.iconNutrientsId,
      },
      {
        title: 'Flavour',
        description:
          'Fermentation creates complex umami flavours and unique taste profiles that no other process can achieve.',
        icon: imgs.iconFlavourId,
      },
    ],
    buttonLabel: 'Read more about it',
    buttonLink: '/about',
  }

  return { de, en }
}

type FeatureCardsBlock = {
  id?: string
  cards?: { id?: string }[]
}

export function mergeFeatureCardsEN(
  en: ReturnType<typeof buildFeatureCards>['en'],
  fresh: FeatureCardsBlock,
) {
  return {
    ...en,
    id: fresh.id,
    cards: en.cards.map((c, i) => ({ ...c, id: fresh.cards?.[i]?.id })),
  }
}
