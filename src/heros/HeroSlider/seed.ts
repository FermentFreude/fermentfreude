/**
 * Seed data builder for the HeroSlider hero type.
 * Imported by seed-home.ts — keeps hero content colocated with its component.
 */

export interface HeroSliderImages {
  laktoSlideLeftId: string
  laktoSlideRightId: string
  kombuchaSlideLeftId: string
  kombuchaSlideRightId: string
  tempehSlideLeftId: string
  tempehSlideRightId: string
  basicsSlideLeftId: string
  basicsSlideRightId: string
}

export function buildHeroSlider(imgs: HeroSliderImages) {
  const de = {
    type: 'heroSlider' as const,
    heroSlides: [
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
        leftImage: imgs.basicsSlideLeftId,
        rightImage: imgs.basicsSlideRightId,
      },
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
        leftImage: imgs.laktoSlideLeftId,
        rightImage: imgs.laktoSlideRightId,
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
        leftImage: imgs.kombuchaSlideLeftId,
        rightImage: imgs.kombuchaSlideRightId,
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
        leftImage: imgs.tempehSlideLeftId,
        rightImage: imgs.tempehSlideRightId,
      },
    ],
  }

  const en = {
    type: 'heroSlider' as const,
    heroSlides: [
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
        leftImage: imgs.basicsSlideLeftId,
        rightImage: imgs.basicsSlideRightId,
      },
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
        leftImage: imgs.laktoSlideLeftId,
        rightImage: imgs.laktoSlideRightId,
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
        leftImage: imgs.kombuchaSlideLeftId,
        rightImage: imgs.kombuchaSlideRightId,
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
        leftImage: imgs.tempehSlideLeftId,
        rightImage: imgs.tempehSlideRightId,
      },
    ],
  }

  return { de, en }
}

/** Merge EN hero data with auto-generated IDs from the DE save read-back. */
export function mergeHeroSliderEN(
  en: ReturnType<typeof buildHeroSlider>['en'],
  freshHeroSlides: { id?: string; attributes?: { id?: string }[] }[],
) {
  return {
    ...en,
    heroSlides: en.heroSlides.map((s, i) => ({
      ...s,
      id: freshHeroSlides[i]?.id,
      attributes: s.attributes.map((a, j) => ({
        ...a,
        id: freshHeroSlides[i]?.attributes?.[j]?.id,
      })),
    })),
  }
}
