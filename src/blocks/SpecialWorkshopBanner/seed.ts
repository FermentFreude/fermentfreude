/**
 * EXPERIMENT — bilingual seed builders for SpecialWorkshopBanner.
 */

export type SpecialWorkshopBannerSeed = {
  blockType: 'specialWorkshopBanner'
  blockName?: string
  visible: boolean
  eyebrow: string
  title: string
  subtitle: string
  priceLabel: string
  ctaLabel: string
  ctaLink: string
}

export function buildSpecialWorkshopBannerDE(): SpecialWorkshopBannerSeed {
  return {
    blockType: 'specialWorkshopBanner',
    blockName: 'special-workshop-banner',
    visible: true,
    eyebrow: 'Spezial-Workshop',
    title: 'Vom Feld ins Glas',
    subtitle: 'Lakto-Gemüse Workshop im Marktgarten „Unser Bauerngarten“',
    priceLabel: '€ 99',
    ctaLabel: 'Mehr Infos & Buchen',
    ctaLink: '/workshops/vom-feld-ins-glas',
  }
}

export function buildSpecialWorkshopBannerEN(): SpecialWorkshopBannerSeed {
  return {
    blockType: 'specialWorkshopBanner',
    blockName: 'special-workshop-banner',
    visible: true,
    eyebrow: 'Special Workshop',
    title: 'From Field to Jar',
    subtitle: 'Lacto-Vegetable Workshop at Marktgarten “Unser Bauerngarten”',
    priceLabel: '€ 99',
    ctaLabel: 'More info & Book',
    ctaLink: '/workshops/vom-feld-ins-glas',
  }
}
