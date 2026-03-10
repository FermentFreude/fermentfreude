import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { WorkshopDate } from './workshop-data'

/* ═══════════════════════════════════════════════════════════════
 *  getWorkshopAppointments — Database Query Utility
 *
 *  Fetches published workshop appointments from MongoDB, sorted by
 *  date (soonest first). Returns formatted dates for booking cards.
 * ═══════════════════════════════════════════════════════════════ */

export async function getWorkshopAppointments(workshopSlug: string): Promise<WorkshopDate[]> {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })

    // Map page slugs to workshop collection slugs
    // Page: /workshops/lakto-gemuese → Workshop collection: slug='lakto'
    const slugMap: Record<string, string> = {
      'lakto-gemuese': 'lakto',
      kombucha: 'kombucha',
      tempeh: 'tempeh',
    }
    const dbSlug = slugMap[workshopSlug] || workshopSlug

    // First, find the workshop by slug
    const workshopResult = await payload.find({
      collection: 'workshops',
      where: {
        slug: { equals: dbSlug },
      },
      limit: 1,
    })

    if (!workshopResult.docs.length) {
      console.warn(`Workshop not found: ${workshopSlug} (mapped to: ${dbSlug})`)
      return []
    }

    const workshop = workshopResult.docs[0]

    // Then, fetch all published appointments for this workshop
    const appointmentsResult = await payload.find({
      collection: 'workshop-appointments',
      where: {
        and: [
          { workshop: { equals: workshop.id } },
          { isPublished: { equals: true } },
          { dateTime: { greater_than: new Date().toISOString() } }, // Only future dates
        ],
      },
      sort: 'dateTime', // Soonest first
      limit: 100, // Reasonable limit
      depth: 1, // Populate workshop relation
    })

    console.log(
      `✓ Found ${appointmentsResult.docs.length} appointments for ${workshopSlug} (DB slug: ${dbSlug})`,
    )

    // Format appointments to WorkshopDate format
    return appointmentsResult.docs.map((appointment) => {
      const date = new Date(appointment.dateTime)

      // Format date: "7. März 2026"
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Vienna',
      }
      const dateDisplay = date.toLocaleDateString('de-DE', dateOptions)

      // Format time: "14:00" (workshop duration assumed 3 hours)
      const startHour = date.getHours().toString().padStart(2, '0')
      const startMin = date.getMinutes().toString().padStart(2, '0')
      const endDate = new Date(date.getTime() + 3 * 60 * 60 * 1000) // +3 hours
      const endHour = endDate.getHours().toString().padStart(2, '0')
      const endMin = endDate.getMinutes().toString().padStart(2, '0')
      const timeDisplay = `${startHour}:${startMin} – ${endHour}:${endMin}`

      return {
        id: appointment.id,
        date: dateDisplay,
        time: timeDisplay,
        spotsLeft: appointment.availableSpots,
        appointmentId: appointment.id,
        availableSpots: appointment.availableSpots,
      }
    })
  } catch (error) {
    console.error(`Error fetching appointments for ${workshopSlug}:`, error)
    return []
  }
}
