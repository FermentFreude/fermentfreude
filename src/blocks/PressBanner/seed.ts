/**
 * Bilingual builders for the home-page Press Banner block.
 */

export type PressBannerSlideSeed = {
  outlet: string
  quote: string
  logo?: string
  url?: string
  linkLabel?: string
}

export type PressBannerSeed = {
  blockType: 'pressBanner'
  blockName?: string
  visible: boolean
  eyebrow: string
  heading: string
  description: string
  ctaLabel: string
  ctaLink: string
  autoplay: boolean
  slides: PressBannerSlideSeed[]
}

type LogoIds = {
  kleineZeitung?: string
  kanal3?: string
  jungeWirtschaft?: string
  sfg?: string
  foodMasterclass?: string
}

export function buildPressBannerDE(logos: LogoIds = {}): PressBannerSeed {
  return {
    blockType: 'pressBanner',
    blockName: 'press-banner',
    visible: true,
    eyebrow: 'PRESSE & MEDIEN',
    heading: 'Bekannt aus Presse & TV',
    description:
      'Berichte, Auszeichnungen und TV-Auftritte rund um Fermentation, Käferbohnen-Tempeh und unsere Arbeit in Graz.',
    ctaLabel: 'Alle Presseberichte',
    ctaLink: '/presse',
    autoplay: true,
    slides: [
      {
        outlet: 'Kleine Zeitung',
        quote:
          'Von der Masterclass zum Markt — wie aus einer Vision rund um die steirische Käferbohne Fermentfreude wurde.',
        logo: logos.kleineZeitung,
        url: 'https://www.kleinezeitung.at/artikel/20140608/aromen-aufstriche-alkoholfreier-gin-innovationen-auf-dem-teller-und-im',
        linkLabel: 'Artikel lesen',
      },
      {
        outlet: 'kanal3',
        quote:
          'Im Regionalfernsehen: Wie Mikroorganismen Lebensmittel verwandeln und neue Geschmäcker entstehen.',
        logo: logos.kanal3,
        url: 'https://www.kanal3.tv/?cid=15&vid=13957',
        linkLabel: 'TV-Beitrag ansehen',
      },
      {
        outlet: 'Junge Wirtschaft Steiermark',
        quote:
          'Zweiter Platz beim Elevator Pitch — 90 Sekunden für regionale Rohstoffe und Lebensmittelinnovation.',
        logo: logos.jungeWirtschaft,
        url: 'https://www.meinbezirk.at/graz/c-wirtschaft/vier-junge-unternehmen-ueberzeugten-beim-elevator-pitch_a7820501',
        linkLabel: 'Mehr erfahren',
      },
    ],
  }
}

export function buildPressBannerEN(logos: LogoIds = {}): PressBannerSeed {
  return {
    blockType: 'pressBanner',
    blockName: 'press-banner',
    visible: true,
    eyebrow: 'PRESS & MEDIA',
    heading: 'As seen in press & TV',
    description:
      'Reports, awards, and TV appearances around fermentation, field-bean tempeh, and our work in Graz.',
    ctaLabel: 'All press coverage',
    ctaLink: '/presse',
    autoplay: true,
    slides: [
      {
        outlet: 'Kleine Zeitung',
        quote:
          'From Food Masterclass to market — the story of FermentFreude and Styrian field-bean tempeh.',
        logo: logos.kleineZeitung,
        url: 'https://www.kleinezeitung.at/artikel/20140608/aromen-aufstriche-alkoholfreier-gin-innovationen-auf-dem-teller-und-im',
        linkLabel: 'Read article',
      },
      {
        outlet: 'kanal3',
        quote:
          'On regional TV: how microorganisms transform food — and open up new flavours.',
        logo: logos.kanal3,
        url: 'https://www.kanal3.tv/?cid=15&vid=13957',
        linkLabel: 'Watch segment',
      },
      {
        outlet: 'Junge Wirtschaft Steiermark',
        quote:
          'Second place at the Elevator Pitch — 90 seconds for regional ingredients and food innovation.',
        logo: logos.jungeWirtschaft,
        url: 'https://www.meinbezirk.at/graz/c-wirtschaft/vier-junge-unternehmen-ueberzeugten-beim-elevator-pitch_a7820501',
        linkLabel: 'Read more',
      },
    ],
  }
}
