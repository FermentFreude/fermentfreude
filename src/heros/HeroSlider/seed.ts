/**
 * Seed data builder for the HeroSlider hero type.
 * Imported by seed-home.ts — keeps hero content colocated with its component.
 */

export interface HeroSliderImages {
  heroImage1Id: string
  heroImage2Id: string
  heroImage3Id: string
  heroImage4Id: string
  laktoSlideLeftId: string
  laktoSlideRightId: string
  kombuchaSlideLeftId: string
  kombuchaSlideRightId: string
  tempehSlideLeftId: string
  tempehSlideRightId: string
  basicsSlideLeftId: string
  basicsSlideRightId: string
}

function buildHeroImages(imgs: HeroSliderImages) {
  return [
    { image: imgs.heroImage1Id },
    { image: imgs.heroImage2Id },
    { image: imgs.heroImage3Id },
    { image: imgs.heroImage4Id },
    { image: imgs.heroImage1Id },
  ]
}

function buildRichText(lines: string[]) {
  return {
    root: {
      type: 'root',
      children: [
        ...lines.slice(0, -1).map((text) => ({
          type: 'heading',
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
          ],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
          tag: 'h1',
          version: 1,
        })),
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: lines[lines.length - 1],
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '',
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
}

export function buildHeroSlider(imgs: HeroSliderImages) {
  const heroImages = buildHeroImages(imgs)

  const de = {
    type: 'heroSlider' as const,
    richText: buildRichText([
      'Gutes Essen',
      'Bessere Gesundheit',
      'Echte Freude',
      'Wir machen Fermentation genussvoll & zugänglich und stärken die Darmgesundheit durch Geschmack, Bildung und hochwertige handgemachte Lebensmittel.',
    ]),
    links: [
      {
        link: {
          type: 'custom' as const,
          label: 'Workshop',
          url: '/workshops',
          appearance: 'default' as const,
        },
      },
      {
        link: {
          type: 'custom' as const,
          label: 'Produkte',
          url: '/shop',
          appearance: 'outline' as const,
        },
      },
    ],
    heroImages,
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
    richText: buildRichText([
      'Good food',
      'Better Health',
      'Real Joy',
      'We make fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods.',
    ]),
    links: [
      {
        link: {
          type: 'custom' as const,
          label: 'Workshop',
          url: '/workshops',
          appearance: 'default' as const,
        },
      },
      {
        link: {
          type: 'custom' as const,
          label: 'Products',
          url: '/shop',
          appearance: 'outline' as const,
        },
      },
    ],
    heroImages,
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
  freshLinks: { id?: string }[],
  freshHeroImages: { id?: string }[],
  freshHeroSlides: { id?: string; attributes?: { id?: string }[] }[],
) {
  return {
    ...en,
    links: en.links.map((l, i) => ({ ...l, id: freshLinks[i]?.id })),
    heroImages: en.heroImages.map((img, i) => ({ ...img, id: freshHeroImages[i]?.id })),
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
