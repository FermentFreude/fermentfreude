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

export type WorkshopDateInfo = {
  /** Next upcoming appointment (formatted), regardless of availability. */
  date: string
  /** Spots available on the next upcoming appointment. */
  availableSpots?: number
  /** Next appointment with availableSpots > 0 (formatted). May equal `date`. */
  nextAvailableDate?: string
  /** Spots on the next available appointment. */
  nextAvailableSpots?: number
  /** True when there are future appointments but none have free spots. */
  isFullyBooked: boolean
}

export async function getNextWorkshopDatesByHref(
  locale: SupportedLocale,
): Promise<Record<string, WorkshopDateInfo>> {
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

    const nextByHref: Record<string, WorkshopDateInfo> = {}

    for (const appointment of result.docs) {
      const workshop = appointment.workshop as Workshop | null
      const workshopSlug = workshop?.slug
      if (!workshopSlug || typeof workshopSlug !== 'string') continue

      const href = WORKSHOP_SLUG_TO_HREF[workshopSlug]
      if (!href) continue

      const formattedDate = formatUpcomingDate(appointment.dateTime, locale)
      const spots =
        typeof appointment.availableSpots === 'number' ? appointment.availableSpots : undefined
      const hasSpots = typeof spots === 'number' ? spots > 0 : true // unknown = treat as available

      const existing = nextByHref[href]

      if (!existing) {
        nextByHref[href] = {
          date: formattedDate,
          availableSpots: spots,
          nextAvailableDate: hasSpots ? formattedDate : undefined,
          nextAvailableSpots: hasSpots ? spots : undefined,
          isFullyBooked: !hasSpots, // tentative; cleared below if a later date has spots
        }
        continue
      }

      // First-upcoming already captured. Only update the "next available" leg.
      if (hasSpots && !existing.nextAvailableDate) {
        existing.nextAvailableDate = formattedDate
        existing.nextAvailableSpots = spots
        existing.isFullyBooked = false
      }
    }

    return nextByHref
  } catch (error) {
    console.error('Error fetching next workshop dates by href:', error)
    return {}
  }
}
