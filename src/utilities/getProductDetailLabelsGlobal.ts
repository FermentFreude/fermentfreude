import { normalizeAppLocale, strictLocaleQuery } from '@/utilities/payloadLocaleQuery'
import config from '@payload-config'
import { getPayload } from 'payload'

export type ProductDetailLabelsGlobal = {
  backToShopLabel?: string | null
  addToCartLabel?: string | null
  soldOutLabel?: string | null
  seasonalBadgeLabel?: string | null
  deliveryNotice?: string | null
  navDetailsLabel?: string | null
  navTastePrepLabel?: string | null
  navStorageLabel?: string | null
  groupDetailsTitle?: string | null
  groupDetailsDescription?: string | null
  glanceTitle?: string | null
  weightLabel?: string | null
  portionLabel?: string | null
  originLabel?: string | null
  madeInLabel?: string | null
  ingredientsLabel?: string | null
  allergensLabel?: string | null
  ingredientsDisclaimer?: string | null
  groupTasteTitle?: string | null
  groupTasteDescription?: string | null
  tasteSectionLabel?: string | null
  tasteSectionLabelNeutral?: string | null
  groupStorageTitle?: string | null
  groupStorageDescription?: string | null
  storageShelfLifeLabel?: string | null
  shelfLifeLabel?: string | null
  bestBeforeLabel?: string | null
  howToUseLabel?: string | null
  instructionsBeforeUseLabel?: string | null
  relatedTitle?: string | null
  shopFooterTitle?: string | null
  shopFooterDescription?: string | null
  shopFooterCta?: string | null
}

export async function getProductDetailLabelsGlobal(
  locale: string = 'de',
): Promise<ProductDetailLabelsGlobal> {
  try {
    const payload = await getPayload({ config })
    const cmsLocale = normalizeAppLocale(locale)
    return (await payload.findGlobal({
      slug: 'product-detail-labels-global',
      ...strictLocaleQuery(cmsLocale),
      depth: 0,
      draft: false,
    })) as ProductDetailLabelsGlobal
  } catch (error) {
    console.warn('Failed to fetch product detail labels global:', error)
    return {}
  }
}
