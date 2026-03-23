import type { ProductSliderGlobal } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function getProductSliderGlobal(locale: string = 'de'): Promise<ProductSliderGlobal> {
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'product-slider-global',
      locale: locale === 'en' ? 'en' : 'de',
      depth: 2,
      draft: false,
    })) as ProductSliderGlobal
  } catch (error) {
    console.warn('Failed to fetch product slider global:', error)
    return {
      heading: locale === 'en' ? 'Discover UNIQUE.' : 'Entdecke UNIQUE.',
      headingAccent: 'FLAVOURS',
      description: '',
      buttonLabel: locale === 'en' ? 'View All Products' : 'Alle Produkte',
      buttonLink: '/products',
      id: 'product-slider-global',
    } as ProductSliderGlobal
  }
}
