/**
 * Seed data builder for the HeroBanner block.
 */

export interface HeroBannerImages {
  backgroundImageId: string
}

export function buildHeroBanner(imgs: HeroBannerImages) {
  const de = {
    blockType: 'heroBanner' as const,
    heading: 'Für Köche und Lebensmittel-Profis',
    description:
      'Wir arbeiten mit Restaurants, Hotels und Catering-Unternehmen zusammen, um fermentierte Produkte in professionelle Küchen zu bringen.',
    buttonLabel: 'Erfahre hier mehr',
    buttonLink: '/gastronomy',
    backgroundImage: imgs.backgroundImageId,
    backgroundVideoUrl: '/assets/videos/gastro-banner.mp4',
  }

  const en = {
    blockType: 'heroBanner' as const,
    heading: 'For Chefs and Food Professionals',
    description:
      'We work with restaurants, hotels, and catering companies to bring fermented products into professional kitchens.',
    buttonLabel: 'Get to know more here',
    buttonLink: '/gastronomy',
    backgroundImage: imgs.backgroundImageId,
    backgroundVideoUrl: '/assets/videos/gastro-banner.mp4',
  }

  return { de, en }
}

export function mergeHeroBannerEN(
  en: ReturnType<typeof buildHeroBanner>['en'],
  fresh: { id?: string },
) {
  return { ...en, id: fresh.id }
}
