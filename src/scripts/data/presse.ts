import type { Media } from '@/payload-types'

export const presseMetaDE = {
  title: 'Fermentfreude in den Medien | Presse, TV & Auszeichnungen',
  description:
    'Fermentfreude in Presse und TV: Berichte, Auszeichnungen und Fachauftritte rund um Käferbohnen-Tempeh, Fermentation und Workshops in Graz.',
}

export const presseMetaEN = {
  title: 'FermentFreude in the Media | Press, TV & Awards',
  description:
    'FermentFreude in press and TV: reports, awards, and expert appearances on field-bean tempeh, fermentation, and workshops in Graz.',
}

export const PRESSE_HERO_YOUTUBE_URL =
  'https://www.youtube.com/watch?v=a9AiJ4IQ0IU&time_continue=395'

export const PRESSE_HERO_YOUTUBE_START = 395

type PresseHeroArgs = {
  heroVideo?: Media
  heroPoster?: Media
  heroImage?: Media
  youtubeUrl?: string
  youtubeStart?: number
}

export const presseHeroDE = (args: PresseHeroArgs = {}) => ({
  type: 'heroPress' as const,
  splitLabel: 'Presse',
  splitHeading: 'Fermentfreude in den Medien',
  splitDescription:
    'Berichte in Presse und TV, Auszeichnungen und Fachauftritte rund um Fermentation, Käferbohnen-Tempeh und unsere Workshops in Graz.',
  splitCtaLabel: '',
  splitCtaUrl: '',
  splitHeroVideo: args.heroVideo?.id ?? undefined,
  splitYoutubeUrl: args.youtubeUrl,
  splitYoutubeStart: args.youtubeStart,
  splitMediaPoster: args.heroPoster?.id ?? args.heroImage?.id ?? undefined,
})

export const presseHeroEN = (args: PresseHeroArgs = {}) => ({
  type: 'heroPress' as const,
  splitLabel: 'Press',
  splitHeading: 'FermentFreude in the Media',
  splitDescription:
    'Press and TV coverage, awards, and expert appearances on fermentation, field-bean tempeh, and our workshops in Graz.',
  splitCtaLabel: '',
  splitCtaUrl: '',
  splitHeroVideo: args.heroVideo?.id ?? undefined,
  splitYoutubeUrl: args.youtubeUrl,
  splitYoutubeStart: args.youtubeStart,
  splitMediaPoster: args.heroPoster?.id ?? args.heroImage?.id ?? undefined,
})

type PressItemSeed = {
  featured?: boolean
  type: 'press' | 'tv' | 'award' | 'expert' | 'origin'
  image?: string
  imageCredit?: string
  imageCrop?: 'auto' | 'top' | 'center' | 'upper-center'
  logo?: string
  outlet: string
  dateLabel: string
  titleHighlight?: string
  titleHighlightColor?: 'gold' | 'near-black' | 'olive'
  title: string
  description: string
  ctaLabel: string
  url: string
  secondaryLinks?: Array<{ label: string; url: string }>
}

const PRESS_ITEMS_DE: PressItemSeed[] = [
  {
    featured: true,
    type: 'press',
    imageCrop: 'top',
    imageCredit: 'Bild: © Fermentfreude',
    outlet: 'Kleine Zeitung',
    dateLabel: '27. September 2025',
    titleHighlight: 'Von der Masterclass zum Markt:',
    titleHighlightColor: 'gold',
    title: 'Die Kleine Zeitung über Fermentfreude',
    description:
      'Aus zwei Teilnehmern der Food Masterclass wurde ein gemeinsames Unternehmen und aus ungewöhnlichen Produktideen entstand eine gemeinsame Vision.\n\nDie Kleine Zeitung erzählt, wie David Haider und Marcel Rauminger Fermentfreude gründeten und Tempeh mit der steirischen Käferbohne neu interpretierten. Im Mittelpunkt stehen unser Weg in den Markt, die Vielseitigkeit des Käferbohnen-Tempehs und die Verbindung von regionaler Wertschöpfung, Fermentation und kulinarischer Innovation.',
    ctaLabel: 'Originalartikel lesen',
    url: 'https://www.kleinezeitung.at/artikel/20140608/aromen-aufstriche-alkoholfreier-gin-innovationen-auf-dem-teller-und-im',
  },
  {
    featured: true,
    type: 'tv',
    imageCrop: 'top',
    imageCredit: 'Video: kanal3 Regionalfernseh GmbH · Redaktion: Michael Forstner · Kamera & Schnitt: Franziska Ettl',
    outlet: 'kanal3',
    dateLabel: 'März 2026',
    titleHighlight: 'Fermentfreude im TV:',
    titleHighlightColor: 'gold',
    title: 'Kanal 3 zeigt, was Fermentation kann',
    description:
      'Im TV-Beitrag von Kanal 3 erklären David Haider und Marcel Rauminger, wie Mikroorganismen Lebensmittel verwandeln, warum unterschiedliche Fermentationsverfahren unterschiedliche Bedingungen benötigen und wie dabei neue Geschmäcker entstehen. Der Beitrag verbindet wissenschaftliche Grundlagen mit kulinarischer Praxis.\n\nGenau das, was auch unsere Workshops auszeichnet: Fermentation verständlich machen, selbst ausprobieren und mit allen Sinnen erleben.',
    ctaLabel: 'TV-Beitrag ansehen',
    url: 'https://www.kanal3.tv/?cid=15&vid=13957',
  },
  {
    type: 'award',
    imageCrop: 'top',
    imageCredit: 'Foto: © Christof Hütter Fotografie',
    outlet: 'Junge Wirtschaft Steiermark',
    dateLabel: 'November 2025',
    title: 'Ein Lift, 90 Sekunden und Platz zwei für Fermentfreude',
    description:
      'Aus rund 80 Einreichungen schaffte es Fermentfreude ins Finale des Elevator Pitch der Jungen Wirtschaft Steiermark. In nur 90 Sekunden überzeugte David Haider mit unserer Idee, aus Nebenprodukten der steirischen Käferbohne hochwertige fermentierte Lebensmittel zu entwickeln und holte den zweiten Platz. Eine Auszeichnung für regionale Rohstoffe, Kreislaufwirtschaft und Lebensmittelinnovation mit Zukunft.',
    ctaLabel: 'Bericht bei MeinBezirk lesen',
    url: 'https://www.meinbezirk.at/graz/c-wirtschaft/vier-junge-unternehmen-ueberzeugten-beim-elevator-pitch_a7820501',
    secondaryLinks: [
      {
        label: 'Spirit of Styria',
        url: 'https://www.spiritofstyria.at/news/beim-elevator-pitch-der-jungen-wirtschaft-steiermark-ueberzeugten-kreative-ideen/',
      },
      {
        label: 'WKO Steiermark',
        url: 'https://www.wko.at/stmk/jwneu/elevator-pitch-2025-patrick-hart-von-lanbiotic-holt-sieg',
      },
    ],
  },
  {
    type: 'expert',
    imageCrop: 'top',
    imageCredit: 'Bild: © SFG / Rene Strasser',
    outlet: 'Styrian Food Hub / SFG',
    dateLabel: '23. bis 24. April 2026',
    title: 'Fermentfreude beim ersten Österreichischen Fermentationskongress',
    description:
      'Beim ersten Österreichischen Bundeskongress für Fermentation präsentierte David Haider Fermentfreude vor Fachleuten aus Lebensmittelwirtschaft, Forschung und Produktion. Unter dem Titel „Vom Nebenprodukt zum Premium-Produkt“ stellte er unser Geschäftsmodell und die Entwicklung regionaler fermentierter Lebensmittel vor. Am zweiten Kongresstag leitete er außerdem den Praxisworkshop „Kombucha & Co“. Vor mehr als 220 Teilnehmenden zeigte Fermentfreude damit, wie Produktinnovation, wirtschaftliche Perspektive und fundiertes Fermentationswissen zusammenkommen.',
    ctaLabel: 'Zum Kongress-Rückblick',
    url: 'https://www.sfg.at/styrian-food-hub/bundeskongress-fermentation/',
  },
  {
    type: 'origin',
    imageCrop: 'top',
    imageCredit: 'Bild: © KLZ / Cornelia Lehner',
    outlet: 'Food Masterclass',
    dateLabel: 'September 2024',
    title: 'Wo alles begann: Unsere gemeinsame Geschichte bei der Food Masterclass',
    description:
      'Bei der ersten Food Masterclass des Styrian Food Hub traten David Haider und Marcel Rauminger noch mit zwei eigenen Projekten an. David beschäftigte sich mit Tempeh aus Berglinsen und dessen Weiterverarbeitung, Marcel präsentierte Tempeh aus steirischen Käferbohnen und erreichte damit den dritten Platz. Dort lernten sich die beiden kennen, entdeckten ihre gemeinsame Begeisterung für Fermentation und legten den Grundstein für die spätere Zusammenarbeit und die Gründung von Fermentfreude.',
    ctaLabel: 'Bericht bei der Kleinen Zeitung lesen',
    url: 'https://www.kleinezeitung.at/artikel/18899201/steirische-innovationen-von-kaeferbohnen-tempeh-bis-kuerbiswurst',
  },
]

const PRESS_ITEMS_EN: PressItemSeed[] = [
  {
    featured: true,
    type: 'press',
    imageCrop: 'top',
    imageCredit: 'Photo: © FermentFreude',
    outlet: 'Kleine Zeitung',
    dateLabel: '27 September 2025',
    titleHighlight: 'From Masterclass to Market:',
    titleHighlightColor: 'gold',
    title: 'Kleine Zeitung on FermentFreude',
    description:
      'Two Food Masterclass participants became co-founders and unusual product ideas became a shared vision.\n\nKleine Zeitung tells how David Haider and Marcel Rauminger founded FermentFreude and reimagined tempeh with Styrian field beans. The story covers our path to market, the versatility of field-bean tempeh, and the link between regional value creation, fermentation, and culinary innovation.',
    ctaLabel: 'Read the original article',
    url: 'https://www.kleinezeitung.at/artikel/20140608/aromen-aufstriche-alkoholfreier-gin-innovationen-auf-dem-teller-und-im',
  },
  {
    featured: true,
    type: 'tv',
    imageCrop: 'top',
    imageCredit: 'Video: kanal3 Regionalfernseh GmbH · Editor: Michael Forstner · Camera & edit: Franziska Ettl',
    outlet: 'kanal3',
    dateLabel: 'March 2026',
    titleHighlight: 'FermentFreude on TV:',
    titleHighlightColor: 'gold',
    title: 'Kanal 3 shows what fermentation can do',
    description:
      'In the Kanal 3 TV feature, David Haider and Marcel Rauminger explain how microorganisms transform food, why different fermentation methods need different conditions, and how new flavours emerge. The segment combines scientific foundations with culinary practice.\n\nExactly what our workshops are about: making fermentation understandable, trying it yourself, and experiencing it with all your senses.',
    ctaLabel: 'Watch the TV feature',
    url: 'https://www.kanal3.tv/?cid=15&vid=13957',
  },
  {
    type: 'award',
    imageCrop: 'top',
    imageCredit: 'Photo: © Christof Hütter Fotografie',
    outlet: 'Junge Wirtschaft Steiermark',
    dateLabel: 'November 2025',
    title: 'An elevator, 90 seconds, and second place for FermentFreude',
    description:
      'Out of around 80 entries, FermentFreude made it to the final of the Elevator Pitch by Junge Wirtschaft Steiermark. In just 90 seconds, David Haider convinced the jury with our idea of turning Styrian field-bean by-products into high-quality fermented foods and took second place. An award for regional ingredients, circular economy, and food innovation with a future.',
    ctaLabel: 'Read the MeinBezirk report',
    url: 'https://www.meinbezirk.at/graz/c-wirtschaft/vier-junge-unternehmen-ueberzeugten-beim-elevator-pitch_a7820501',
    secondaryLinks: [
      {
        label: 'Spirit of Styria',
        url: 'https://www.spiritofstyria.at/news/beim-elevator-pitch-der-jungen-wirtschaft-steiermark-ueberzeugten-kreative-ideen/',
      },
      {
        label: 'WKO Steiermark',
        url: 'https://www.wko.at/stmk/jwneu/elevator-pitch-2025-patrick-hart-von-lanbiotic-holt-sieg',
      },
    ],
  },
  {
    type: 'expert',
    imageCrop: 'top',
    imageCredit: 'Photo: © SFG / Rene Strasser',
    outlet: 'Styrian Food Hub / SFG',
    dateLabel: '23 to 24 April 2026',
    title: 'FermentFreude at the first Austrian Fermentation Congress',
    description:
      'At the first Austrian National Fermentation Congress, David Haider presented FermentFreude to experts from the food industry, research, and production. Under the title “From by-product to premium product”, he shared our business model and the development of regional fermented foods. On the second day, he also led the hands-on workshop “Kombucha & Co”. In front of more than 220 participants, FermentFreude showed how product innovation, economic perspective, and solid fermentation knowledge come together.',
    ctaLabel: 'View congress recap',
    url: 'https://www.sfg.at/styrian-food-hub/bundeskongress-fermentation/',
  },
  {
    type: 'origin',
    imageCrop: 'top',
    imageCredit: 'Photo: © KLZ / Cornelia Lehner',
    outlet: 'Food Masterclass',
    dateLabel: 'September 2024',
    title: 'Where it all began: Our shared story at the Food Masterclass',
    description:
      'At the first Food Masterclass by Styrian Food Hub, David Haider and Marcel Rauminger still competed with two separate projects. David worked on lentil tempeh and its further processing; Marcel presented tempeh from Styrian field beans and took third place. There they met, discovered their shared passion for fermentation, and laid the foundation for their later collaboration and the founding of FermentFreude.',
    ctaLabel: 'Read the Kleine Zeitung report',
    url: 'https://www.kleinezeitung.at/artikel/18899201/steirische-innovationen-von-kaeferbohnen-tempeh-bis-kuerbiswurst',
  },
]

export const pressMediaAwardsDE = () => ({
  blockType: 'pressMediaAwards' as const,
  blockName: 'press-media-awards',
  visible: true,
  moreCoverageHeading: 'Weitere Erwähnungen',
  secondaryLinksPrefix: 'Weitere Berichte:',
  typeLabels: {
    press: 'Presse',
    tv: 'TV',
    award: 'Auszeichnung',
    expert: 'Fachauftritt',
    origin: 'Unsere Anfänge',
  },
  intro: {
    label: 'PRESSE',
    heading: 'Fermentfreude in den Medien',
    description:
      'Fermentfreude bringt Fermentation in die Öffentlichkeit – mit innovativen Lebensmitteln, fundiertem Fachwissen und praxisnahen Workshops. Berichte in Presse und TV, Auszeichnungen und Auftritte bei Fachveranstaltungen zeigen, dass unsere Arbeit rund um Käferbohnen-Tempeh, regionale Rohstoffe und Fermentationswissen Aufmerksamkeit erhält.',
  },
  items: PRESS_ITEMS_DE,
  footerCta: {
    enabled: true,
    eyebrow: 'Mehr entdecken',
    heading: 'Fermentation erleben und auf die Speisekarte bringen',
    description:
      'In unseren Workshops und Fermentationsevents vermitteln wir fundiertes Wissen praxisnah und genussvoll.\n\nFür die Gastronomie entwickeln und produzieren wir Käferbohnen-Tempeh und weitere fermentierte Lebensmittel aus regionalen Rohstoffen.',
    primaryButton: { label: 'Workshops entdecken', href: '/workshops' },
    secondaryButton: { label: 'B2B & Kooperationen', href: '/gastronomy' },
  },
})

export const pressMediaAwardsEN = () => ({
  blockType: 'pressMediaAwards' as const,
  blockName: 'press-media-awards',
  visible: true,
  moreCoverageHeading: 'More coverage',
  secondaryLinksPrefix: 'More coverage:',
  typeLabels: {
    press: 'Press',
    tv: 'TV',
    award: 'Award',
    expert: 'Expert appearance',
    origin: 'Our beginnings',
  },
  intro: {
    label: 'PRESS',
    heading: 'FermentFreude in the Media',
    description:
      'FermentFreude brings fermentation into the public eye — with innovative foods, expert knowledge, and hands-on workshops. Press and TV coverage, awards, and appearances at industry events show that our work on field-bean tempeh and regional ingredients is gaining attention.',
  },
  items: PRESS_ITEMS_EN,
  footerCta: {
    enabled: true,
    eyebrow: 'Discover more',
    heading: 'Experience fermentation and bring it to the menu',
      description:
        'In our workshops and fermentation events, we share expert knowledge in a practical and enjoyable way.\n\nFor gastronomy, we develop and produce field-bean tempeh and other fermented foods from regional ingredients.',
    primaryButton: { label: 'Explore workshops', href: '/workshops' },
    secondaryButton: { label: 'B2B & partnerships', href: '/gastronomy' },
  },
})

export const presseCtaDE = () => null

export const presseCtaEN = () => null

export const PRESS_LOGO_ALTS_DE = [
  'Kleine Zeitung Logo',
  'kanal3 Logo',
  'Junge Wirtschaft Steiermark Logo',
  'SFG Styrian Food Hub Logo',
  'Food Masterclass Logo',
]

export const PRESS_LOGO_ALTS_EN = [
  'Kleine Zeitung logo',
  'kanal3 logo',
  'Junge Wirtschaft Steiermark logo',
  'SFG Styrian Food Hub logo',
  'Food Masterclass logo',
]

/** Image alt texts for when photos are uploaded (DE seed context). */
export const PRESS_IMAGE_ALTS_DE = [
  'Die Fermentfreude-Gründer David Haider und Marcel Rauminger mit Käferbohnen-Tempeh und fermentiertem Gemüse.',
  'David Haider und Marcel Rauminger von Fermentfreude erklären bei Kanal 3 die Grundlagen der Fermentation.',
  'David Haider von Fermentfreude mit den Gewinnerinnen und Gewinnern des Elevator Pitch 2025.',
  'David Haider präsentiert Fermentfreude beim ersten Österreichischen Bundeskongress für Fermentation.',
  'Marcel Rauminger präsentiert Käferbohnen-Tempeh bei der ersten Food Masterclass des Styrian Food Hub.',
]

export const PRESS_IMAGE_ALTS_EN = [
  'FermentFreude founders David Haider and Marcel Rauminger with field-bean tempeh and fermented vegetables.',
  'David Haider and Marcel Rauminger of FermentFreude explain the basics of fermentation on Kanal 3.',
  'David Haider of FermentFreude with the winners of Elevator Pitch 2025.',
  'David Haider presents FermentFreude at the first Austrian National Fermentation Congress.',
  'Marcel Rauminger presents field-bean tempeh at the first Food Masterclass by Styrian Food Hub.',
]
