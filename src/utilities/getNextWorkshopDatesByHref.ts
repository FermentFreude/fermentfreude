import type { Workshop } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type SupportedLocale = 'de' | 'en'

const WORKSHOP_SLUG_TO_HREF: Record<string, string> = {
  lakto: '/workshops/lakto-gemuese',
  'lakto-gemuese': '/workshops/lakto-gemuese',
  kombucha: '/workshops/kombucha',
  tempeh: '/workshops/tempeh',
  'vom-feld-ins-glas': '/workshops/vom-feld-ins-glas',
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

export type NextWorkshopDateInfo = {
  /** Formatted date string of next bookable appointment, or null if none. */
  date: string | null
  /** Available spots on the next bookable appointment (undefined = unlimited). */
  availableSpots?: number
  /** True when no bookable future appointment exists for this workshop. */
  soldOut: boolean
}

export async function getNextWorkshopDatesByHref(
  locale: SupportedLocale,
): Promise<Record<string, NextWorkshopDateInfo>> {
  // Pre-seed every known workshop href as sold-out. Any workshop whose
  // appointment we find later will overwrite this entry. Workshops not in the
  // map are intentionally absent so page-level fallbacks (manual admin text)
  // continue to work for them.
  const nextByHref: Record<string, NextWorkshopDateInfo> = {}
  for (const href of Object.values(WORKSHOP_SLUG_TO_HREF)) {
    if (!nextByHref[href]) {
      nextByHref[href] = { date: null, soldOut: true }
    }
  }

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

    for (const appointment of result.docs) {
      const workshop = appointment.workshop as Workshop | null
      const workshopSlug = workshop?.slug
      if (!workshopSlug || typeof workshopSlug !== 'string') continue

      const href = WORKSHOP_SLUG_TO_HREF[workshopSlug]
      if (!href) continue
      // Already filled with a bookable appointment.
      if (nextByHref[href] && !nextByHref[href].soldOut) continue

      // Skip fully-booked appointments — "next date" must be a date the user
      // can actually book. If availableSpots is null/undefined we treat the
      // appointment as available (capacity not tracked / unlimited).
      const spots = appointment.availableSpots
      if (typeof spots === 'number' && spots <= 0) continue

      nextByHref[href] = {
        date: formatUpcomingDate(appointment.dateTime, locale),
        availableSpots: typeof spots === 'number' ? spots : undefined,
        soldOut: false,
      }
    }

    return nextByHref
  } catch (error) {
    console.error('Error fetching next workshop dates by href:', error)
    return nextByHref
  }
}
