import type { Workshop } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  getAllWorkshopAppointments — Fetch all upcoming appointments
 *
 *  Returns all published future appointments across all workshops,
 *  sorted by date (soonest first). Used for the main /workshops
 *  calendar view.
 * ═══════════════════════════════════════════════════════════════ */

export type WorkshopCalendarDate = {
  id: string
  workshopType: 'lakto' | 'kombucha' | 'tempeh'
  workshopTitle: string
  date: string
  time: string
  availableSpots: number
  price: number
  appointmentId: string
}

export async function getAllWorkshopAppointments(): Promise<WorkshopCalendarDate[]> {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })

    // Fetch all published future appointments
    const appointmentsResult = await payload.find({
      collection: 'workshop-appointments',
      where: {
        and: [
          { isPublished: { equals: true } },
          { dateTime: { greater_than: new Date().toISOString() } },
        ],
      },
      sort: 'dateTime', // Soonest first
      limit: 100,
      depth: 2, // Populate workshop relation
    })

    console.log(`✓ Found ${appointmentsResult.docs.length} total upcoming appointments`)

    // Format appointments to WorkshopCalendarDate format
    return appointmentsResult.docs.map((appointment) => {
      const workshop = appointment.workshop as Workshop
      const date = new Date(appointment.dateTime)

      // Map workshop slugs to types for WorkshopCalendar
      const slugToType: Record<string, 'lakto' | 'kombucha' | 'tempeh'> = {
        lakto: 'lakto',
        kombucha: 'kombucha',
        tempeh: 'tempeh',
      }
      const workshopType = slugToType[workshop.slug as string] || 'lakto'

      // Format date: "26. März 2026"
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Vienna',
      }
      const dateDisplay = date.toLocaleDateString('de-DE', dateOptions)

      // Format time: "17:30 – 20:30"
      const startHour = date.getHours().toString().padStart(2, '0')
      const startMin = date.getMinutes().toString().padStart(2, '0')
      const endDate = new Date(date.getTime() + 3 * 60 * 60 * 1000) // +3 hours
      const endHour = endDate.getHours().toString().padStart(2, '0')
      const endMin = endDate.getMinutes().toString().padStart(2, '0')
      const timeDisplay = `${startHour}:${startMin} – ${endHour}:${endMin}`

      return {
        id: appointment.id,
        workshopType,
        workshopTitle: workshop.title || 'Workshop',
        date: dateDisplay,
        time: timeDisplay,
        availableSpots: appointment.availableSpots,
        price: workshop.basePrice || 99,
        appointmentId: appointment.id,
      }
    })
  } catch (error) {
    console.error('Error fetching all workshop appointments:', error)
    return []
  }
}
