import type { Category, Product } from '@/payload-types'

export type AppLocale = 'de' | 'en'

const PRODUCT_TYPE_LABELS: Record<string, Record<AppLocale, string>> = {
  jarred: { de: 'Im Glas', en: 'Jarred' },
  fresh: { de: 'Frisch', en: 'Fresh' },
  bottled: { de: 'Flasche', en: 'Bottled' },
  workshop: { de: 'Workshop', en: 'Workshop' },
  'digital-course': { de: 'Online-Kurs', en: 'Digital Course' },
}

const SPEC_LABELS: Record<string, Record<AppLocale, string>> = {
  brand: { de: 'Marke', en: 'Brand' },
  category: { de: 'Kategorie', en: 'Category' },
  flavour: { de: 'Geschmack', en: 'Flavour' },
  type: { de: 'Produktart', en: 'Type' },
  packSize: { de: 'Packungsgröße', en: 'Pack size' },
}

const BADGE_LABELS: Record<string, Record<AppLocale, string>> = {
  vegan: { de: 'Vegan', en: 'Vegan' },
  vegetarian: { de: 'Vegetarisch', en: 'Vegetarian' },
  handmade: { de: 'Handgemacht', en: 'Handmade' },
  organic: { de: 'Bio', en: 'Organic' },
  'gluten-free': { de: 'Glutenfrei', en: 'Gluten-Free' },
  probiotic: { de: 'Probiotisch', en: 'Probiotic' },
  fermented: { de: 'Fermentiert', en: 'Fermented' },
  'no-additives': { de: 'Ohne Zusatzstoffe', en: 'No Additives' },
  refrigerated: { de: 'Kühlware', en: 'Refrigerated' },
}

export function getProductTypeLabel(productType: string | null | undefined, locale: AppLocale): string {
  if (!productType) return ''
  return PRODUCT_TYPE_LABELS[productType]?.[locale] ?? productType
}

export function getSpecLabel(key: keyof typeof SPEC_LABELS, locale: AppLocale): string {
  return SPEC_LABELS[key][locale]
}

export function getBadgeLabel(badge: string, locale: AppLocale): string {
  return BADGE_LABELS[badge]?.[locale] ?? badge
}

export function getCategoryTitles(product: Product): string[] {
  return (product.categories ?? [])
    .filter((item): item is Category => typeof item === 'object' && item !== null && 'title' in item)
    .map((item) => item.title?.trim())
    .filter((title): title is string => Boolean(title))
}

export function getPackSizeLabel(product: Product, locale: AppLocale): string | null {
  const unitSize = product.unitSize?.trim()
  const weightGrams = product.weightGrams

  if (typeof weightGrams === 'number' && weightGrams > 0 && unitSize) {
    return `${weightGrams} g · ${unitSize}`
  }
  if (typeof weightGrams === 'number' && weightGrams > 0) {
    return `${weightGrams} g`
  }
  if (unitSize) return unitSize

  return null
}

export function getProductSpecs(
  product: Product,
  locale: AppLocale,
): { label: string; value: string }[] {
  const specs: { label: string; value: string }[] = []

  specs.push({ label: getSpecLabel('brand', locale), value: product.brand?.trim() || 'FermentFreude' })

  const categories = getCategoryTitles(product)
  if (categories.length > 0) {
    specs.push({ label: getSpecLabel('category', locale), value: categories.join(', ') })
  }

  if (product.flavour?.trim()) {
    specs.push({ label: getSpecLabel('flavour', locale), value: product.flavour.trim() })
  }

  if (product.productType) {
    specs.push({
      label: getSpecLabel('type', locale),
      value: getProductTypeLabel(product.productType, locale),
    })
  }

  const packSize = getPackSizeLabel(product, locale)
  if (packSize) {
    specs.push({ label: getSpecLabel('packSize', locale), value: packSize })
  }

  return specs
}

/** CMS checkboxes + optional badges array — isGlutenFree false suppresses gluten-free claim */
export function getDisplayBadges(product: Product): string[] {
  const derived: string[] = []

  if (product.isVegan) derived.push('vegan')
  if (product.isOrganic) derived.push('organic')
  if (product.isGlutenFree) derived.push('gluten-free')
  if (product.productType === 'fresh') derived.push('refrigerated')
  if (['jarred', 'fresh', 'bottled'].includes(product.productType || '')) {
    derived.push('fermented')
  }

  return [...new Set([...(product.badges ?? []), ...derived])]
}

export function getSeasonalNotice(locale: AppLocale): string {
  return locale === 'de'
    ? 'Unsere Kimchis sind saisonal. Je nach verfügbarer Gemüseauswahl variiert die Rezeptur. Zutaten und Allergene der aktuell angebotenen Variante werden vor Verkaufsstart im CMS ergänzt.'
    : 'Our kimchis are seasonal. The recipe varies with available vegetables. Ingredients and allergens for the variant currently on offer are added in the CMS before each batch goes on sale.'
}

/** Shorter copy for the ingredients panel — avoids repeating the full hero notice */
export function getSeasonalIngredientsNotice(locale: AppLocale): string {
  return locale === 'de'
    ? 'Saisonale Rezeptur: Zutaten und Allergene der aktuell angebotenen Variante werden vor Verkaufsstart ergänzt.'
    : 'Seasonal recipe: ingredients and allergens for the variant currently on offer are added before each batch goes on sale.'
}

/** Shop featured-card panel colors — keep PDP in sync with /shop */
const SHOP_CARD_COLORS: Record<string, string> = {
  'kaeferbohnen-tempeh': '#403c39',
  'berglinsen-tempeh': '#5C6B54',
  'classic-kimchi': '#403c39',
}

/** Local fallbacks when CMS gallery URL is missing or broken (shop slugs only). */
export { SHOP_PRODUCT_IMAGE_FALLBACKS as SHOP_CARD_IMAGE_FALLBACK } from '@/data/shop-product-images'

export function isPopulatedMedia(
  value: unknown,
): value is { url?: string | null; alt?: string | null; width?: number | null; height?: number | null } {
  return typeof value === 'object' && value !== null && 'url' in value
}

/** First gallery image with a URL, then meta.image. */
export function resolveProductCardMedia(product: {
  gallery?: Array<{ image?: unknown } | null> | null
  meta?: { image?: unknown } | null
}) {
  for (const item of product.gallery ?? []) {
    const image = item?.image
    if (isPopulatedMedia(image) && image.url?.trim()) return image
  }
  const metaImage = product.meta?.image
  if (isPopulatedMedia(metaImage) && metaImage.url?.trim()) return metaImage
  return null
}

export function getShopCardColor(slug: string | null | undefined): string {
  if (slug && SHOP_CARD_COLORS[slug]) return SHOP_CARD_COLORS[slug]
  return '#5C6B54'
}

/** Stable EUR formatting — avoids useCurrency hydration mismatches in client components */
export function formatEurPrice(cents: number, locale: AppLocale = 'de'): string {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}
