import type { ProductSliderGlobal } from '@/payload-types'
import { normalizeAppLocale, strictLocaleQuery } from '@/utilities/payloadLocaleQuery'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function getProductSliderGlobal(locale: string = 'de'): Promise<ProductSliderGlobal> {
  const cmsLocale = normalizeAppLocale(locale)
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'product-slider-global',
      ...strictLocaleQuery(cmsLocale),
      depth: 2,
      draft: false,
    })) as ProductSliderGlobal
  } catch (error) {
    console.warn('Failed to fetch product slider global:', error)
    return {
      heading: cmsLocale === 'en' ? 'Discover UNIQUE.' : 'Entdecke UNIQUE.',
      headingAccent: 'FLAVOURS',
      description: '',
      buttonLabel: cmsLocale === 'en' ? 'View All Products' : 'Alle Produkte',
      buttonLink: '/products',
      id: 'product-slider-global',
    } as ProductSliderGlobal
  }
}
