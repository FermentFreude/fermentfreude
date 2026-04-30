import config from '@payload-config'
import { getPayload } from 'payload'

export type ProductDetailLabelsGlobal = {
  ingredientsLabel?: string | null
  allergensLabel?: string | null
  storageShelfLifeLabel?: string | null
  shelfLifeLabel?: string | null
  howToUseLabel?: string | null
  instructionsBeforeUseLabel?: string | null
  deliveryNotice?: string | null
}

export async function getProductDetailLabelsGlobal(
  locale: string = 'de',
): Promise<ProductDetailLabelsGlobal> {
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'product-detail-labels-global',
      locale: locale === 'en' ? 'en' : 'de',
      depth: 0,
      draft: false,
    })) as ProductDetailLabelsGlobal
  } catch (error) {
    console.warn('Failed to fetch product detail labels global:', error)
    return {}
  }
}
