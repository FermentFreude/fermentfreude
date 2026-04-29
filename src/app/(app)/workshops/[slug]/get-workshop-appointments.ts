import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { WorkshopDate } from './workshop-data'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim() !== '') return error
  return 'Unknown appointments fetch error'
}

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

    // ─── Lazy cleanup: cancel stale pending bookings ──────────────────────
    // Restores spots for users who abandoned their cart (tab close, etc.)
    // Runs on each page load. Stale = pending for > 60 minutes.
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    try {
      const staleBookings = await payload.find({
        collection: 'workshop-bookings',
        where: {
          and: [
            { workshopSlug: { equals: dbSlug } },
            { status: { equals: 'pending' } },
            { createdAt: { less_than: sixtyMinutesAgo } },
          ],
        },
        limit: 10,
        overrideAccess: true,
      })

      for (const booking of staleBookings.docs) {
        // Cancel booking first — idempotent if two requests race
        await payload.update({
          collection: 'workshop-bookings',
          id: booking.id,
          data: { status: 'cancelled' },
          overrideAccess: true,
        })
        // Restore spots on the appointment (capped at maxCapacity)
        if (booking.appointmentId && booking.guestCount) {
          try {
            const appt = await payload.findByID({
              collection: 'workshop-appointments',
              id: booking.appointmentId,
              depth: 1,
            })
            const maxCapacity =
              typeof appt.workshop === 'object' ? (appt.workshop?.maxCapacityPerSlot ?? 12) : 12
            await payload.update({
              collection: 'workshop-appointments',
              id: booking.appointmentId,
              data: {
                availableSpots: Math.min(appt.availableSpots + booking.guestCount, maxCapacity),
              },
              overrideAccess: true,
            })
          } catch {
            // Appointment may have been deleted — skip
          }
        }
      }

      if (staleBookings.docs.length > 0) {
        console.log(
          `✓ Cleaned up ${staleBookings.docs.length} stale pending bookings for ${dbSlug}`,
        )
      }
    } catch {
      // Non-fatal — cleanup errors must never break the page
    }

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
    console.warn(`Skipping appointments for ${workshopSlug}: ${getErrorMessage(error)}`)
    return []
  }
}
