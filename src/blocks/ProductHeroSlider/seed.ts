/**
 * Bilingual seed builders for ProductHeroSlider.
 * Slide `product` values are resolved to Product IDs by the calling script.
 */

export type ProductHeroSliderSlideSeed = {
  product: string
  image?: string
  badgeLabel?: string
  ctaLabel?: string
  ctaLink?: string
  id?: string
}

export type ProductHeroSliderSeed = {
  blockType: 'productHeroSlider'
  blockName?: string
  visible: boolean
  slides: ProductHeroSliderSlideSeed[]
}

export function buildProductHeroSliderDE(
  slides: ProductHeroSliderSlideSeed[],
): ProductHeroSliderSeed {
  return {
    blockType: 'productHeroSlider',
    blockName: 'product-hero-slider',
    visible: true,
    slides,
  }
}

export function buildProductHeroSliderEN(
  slides: ProductHeroSliderSlideSeed[],
): ProductHeroSliderSeed {
  return {
    blockType: 'productHeroSlider',
    blockName: 'product-hero-slider',
    visible: true,
    slides,
  }
}
