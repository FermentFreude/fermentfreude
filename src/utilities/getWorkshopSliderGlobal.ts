import type { WorkshopSliderGlobal } from '@/payload-types'
import { normalizeAppLocale, strictLocaleQuery } from '@/utilities/payloadLocaleQuery'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function getWorkshopSliderGlobal(
  locale: string = 'de',
): Promise<WorkshopSliderGlobal> {
  const cmsLocale = normalizeAppLocale(locale)
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'workshop-slider-global',
      ...strictLocaleQuery(cmsLocale),
      depth: 2,
      draft: false,
    })) as WorkshopSliderGlobal
  } catch (error) {
    console.warn('Failed to fetch workshop slider global:', error)
    return {
      eyebrow: cmsLocale === 'en' ? 'Workshop Experience' : 'Workshop-Erlebnis',
      workshops: [],
      id: 'workshop-slider-global',
    } as WorkshopSliderGlobal
  }
}
