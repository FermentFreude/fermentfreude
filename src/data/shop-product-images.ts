/**
 * Canonical shop product images — selected from David's Drive folders:
 *
 * 1. Vom Feld ins Glas — Website images
 *    https://drive.google.com/drive/folders/1aVEZ4j5bxwmr9KONiT2km2C9SaZFSQ0v
 *    (Aug 2025 product shoot — IMG_29xx packaging + jar shots → public/shop/*-nobg.webp)
 *
 * 2. Kleine Zeitung Workshops Ads
 *    https://drive.google.com/drive/folders/1BNMNMfzn5Za5B3vSM6usMxKR4D6-nmLG
 *    (Lifestyle / plated shots — FF-Vorschau-34 plate, not used as primary PDP pack shot)
 *
 * Primary = packaging/product shot for PDP + shop cards.
 * Secondary = optional gallery row (plated / alternate angle).
 */

export type ShopProductImageSpec = {
  slug: string
  /** Human-readable Drive provenance for editors */
  driveNote: string
  primary: {
    localPath: string
    fallbackPath: string
    /** Stable R2 filename — change when replacing the asset */
    filename: string
    altDe: string
    altEn: string
  }
  secondary?: {
    localPath: string
    fallbackPath?: string
    filename: string
    altDe: string
    altEn: string
  }
}

export const SHOP_PRODUCT_IMAGES: ShopProductImageSpec[] = [
  {
    slug: 'kaeferbohnen-tempeh',
    driveNote:
      'Vom Feld ins Glas folder — vacuum pack, large Käferbohnen beans, round FERMENT FREUDE sticker',
    primary: {
      localPath: 'public/shop/kaefer-packaging-nobg.webp',
      fallbackPath: 'public/shop/kaefer-packaging.webp',
      filename: 'kaefer-packaging-shop.webp',
      altDe: 'Käferbohnen-Tempeh in Verpackung',
      altEn: 'Runner bean tempeh in packaging',
    },
    secondary: {
      localPath: 'public/shop/hero-kaefer-plate.webp',
      fallbackPath: 'public/shop/hero-kaefer.webp',
      filename: 'kaefer-plated-shop.webp',
      altDe: 'Käferbohnen-Tempeh, angerichtet',
      altEn: 'Runner bean tempeh, plated',
    },
  },
  {
    slug: 'berglinsen-tempeh',
    driveNote:
      'Berglinsen pack cutout (transparent) with FERMENT FREUDE sticker for featured cards + PDP',
    primary: {
      localPath: 'public/shop/berglinsen-packaging-nobg.webp',
      fallbackPath: 'public/shop/berglinsen-packaging-cutout.webp',
      filename: 'berglinsen-packaging-shop-v3.webp',
      altDe: 'Berglinsen-Tempeh in Verpackung',
      altEn: 'Mountain lentil tempeh in packaging',
    },
    secondary: {
      localPath: 'public/shop/berglinsen-plated.webp',
      filename: 'berglinsen-plated-shop.webp',
      altDe: 'Berglinsen-Tempeh, angerichtet',
      altEn: 'Mountain lentil tempeh, plated',
    },
  },
  {
    slug: 'classic-kimchi',
    driveNote:
      'Vom Feld ins Glas folder — screw-top jar, classic napa kimchi on black (seasonal jars in Kleine Zeitung folder are not this SKU)',
    primary: {
      localPath: 'public/shop/kimchi-packaging-nobg.webp',
      fallbackPath: 'public/shop/kimchi-david-jar.webp',
      filename: 'kimchi-packaging-shop.webp',
      altDe: 'Kimchi im Glas',
      altEn: 'Kimchi in a jar',
    },
    secondary: {
      localPath: 'public/shop/kimchi-david-jar.webp',
      filename: 'kimchi-jar-editorial-shop.webp',
      altDe: 'Kimchi im Glas, Nahaufnahme',
      altEn: 'Kimchi in a jar, close-up',
    },
  },
]

/** Local /public fallbacks when CMS R2 URL fails (shop slugs only) */
export const SHOP_PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  'kaeferbohnen-tempeh': '/shop/kaefer-packaging-nobg.webp',
  'berglinsen-tempeh': '/shop/berglinsen-packaging-cutout.webp',
  'classic-kimchi': '/shop/kimchi-packaging-nobg.webp',
}

/** Per-gallery-index fallbacks (primary + secondary) for PDP thumbnails */
export const SHOP_GALLERY_FALLBACKS: Record<string, string[]> = {
  'kaeferbohnen-tempeh': ['/shop/kaefer-packaging-nobg.webp', '/shop/hero-kaefer-plate.webp'],
  'berglinsen-tempeh': ['/shop/berglinsen-packaging-cutout.webp', '/shop/berglinsen-plated.webp'],
  'classic-kimchi': ['/shop/kimchi-packaging-nobg.webp', '/shop/kimchi-david-jar.webp'],
}
