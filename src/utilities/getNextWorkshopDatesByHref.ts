import type { Workshop } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type SupportedLocale = 'de' | 'en'

const WORKSHOP_SLUG_TO_HREF: Record<string, string> = {
  lakto: '/workshops/lakto-gemuese',
  'lakto-gemuese': '/workshops/lakto-gemuese',
  kombucha: '/workshops/kombucha',
  tempeh: '/workshops/tempeh',
}

function formatUpcomingDate(dateValue: string, locale: SupportedLocale): string {
  const formatter = new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Vienna',
  })

  return formatter.format(new Date(dateValue))
}

export async function getNextWorkshopDatesByHref(
  locale: SupportedLocale,
): Promise<Record<string, string>> {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'workshop-appointments',
      where: {
        and: [
          { isPublished: { equals: true } },
          { dateTime: { greater_than: new Date().toISOString() } },
        ],
      },
      sort: 'dateTime',
      limit: 100,
      depth: 2,
    })

    const nextByHref: Record<string, string> = {}

    for (const appointment of result.docs) {
      const workshop = appointment.workshop as Workshop | null
      const workshopSlug = workshop?.slug
      if (!workshopSlug || typeof workshopSlug !== 'string') continue

      const href = WORKSHOP_SLUG_TO_HREF[workshopSlug]
      if (!href || nextByHref[href]) continue

      nextByHref[href] = formatUpcomingDate(appointment.dateTime, locale)
    }

    return nextByHref
  } catch (error) {
    console.error('Error fetching next workshop dates by href:', error)
    return {}
  }
}
