import type { SponsorsBarGlobal } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function getSponsorsBarGlobal(locale: string = 'de'): Promise<SponsorsBarGlobal> {
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'sponsors-bar-global',
      locale: locale === 'en' ? 'en' : 'de',
      depth: 2,
      draft: false,
    })) as SponsorsBarGlobal
  } catch (error) {
    console.warn('Failed to fetch sponsors bar global:', error)
    return {
      heading:
        locale === 'en' ? 'This project is supported by:' : 'Dieses Projekt wird unterstützt von:',
      sponsors: [],
      id: 'sponsors-bar-global',
    } as SponsorsBarGlobal
  }
}
