import type { WorkshopCardsGlobal } from '@/payload-types'
import { strictLocaleQuery, normalizeAppLocale } from '@/utilities/payloadLocaleQuery'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function getWorkshopCardsGlobal(locale: string = 'de'): Promise<WorkshopCardsGlobal> {
  const cmsLocale = normalizeAppLocale(locale)
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'workshop-cards-global',
      ...strictLocaleQuery(cmsLocale),
      depth: 2,
      draft: false,
    })) as WorkshopCardsGlobal
  } catch (error) {
    console.warn('Failed to fetch workshop cards global:', error)
    return {
      title: cmsLocale === 'en' ? 'Our Workshops' : 'Unsere Workshops',
      cards: [],
      id: 'workshop-cards-global',
    } as WorkshopCardsGlobal
  }
}
