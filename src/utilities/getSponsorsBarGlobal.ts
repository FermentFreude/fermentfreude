import type { SponsorsBarGlobal } from '@/payload-types'
import { normalizeAppLocale, strictLocaleQuery } from '@/utilities/payloadLocaleQuery'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function getSponsorsBarGlobal(locale: string = 'de'): Promise<SponsorsBarGlobal> {
  const cmsLocale = normalizeAppLocale(locale)
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'sponsors-bar-global',
      ...strictLocaleQuery(cmsLocale),
      depth: 2,
      draft: false,
    })) as SponsorsBarGlobal
  } catch (error) {
    console.warn('Failed to fetch sponsors bar global:', error)
    return {
      heading:
        cmsLocale === 'en' ? 'This project is supported by:' : 'Dieses Projekt wird unterstützt von:',
      autoScroll: true,
      logoSize: 'medium',
      sponsors: [],
      id: 'sponsors-bar-global',
    } as SponsorsBarGlobal
  }
}
