import type { WorkshopSliderGlobal } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function getWorkshopSliderGlobal(
  locale: string = 'de',
): Promise<WorkshopSliderGlobal> {
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'workshop-slider-global',
      locale: locale === 'en' ? 'en' : 'de',
      depth: 2,
      draft: false,
    })) as WorkshopSliderGlobal
  } catch (error) {
    console.warn('Failed to fetch workshop slider global:', error)
    return {
      eyebrow: locale === 'en' ? 'Workshop Experience' : 'Workshop-Erlebnis',
      workshops: [],
      id: 'workshop-slider-global',
    } as WorkshopSliderGlobal
  }
}
