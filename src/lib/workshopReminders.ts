import type { Payload } from 'payload'

import { addBookingHistory } from '@/lib/bookingHistory'
import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
import type { WorkshopAppointment, WorkshopBooking } from '@/payload-types'

/* ═══════════════════════════════════════════════════════════════
 *  Workshop reminder — the ONE reminder email, 2 days before.
 *
 *  Runs once a day (Vercel Cron → /api/emails/workshop-reminders).
 *  Every confirmed booking on a workshop happening within the next
 *  REMINDER_DAYS_BEFORE calendar days (Vienna time) gets one reminder
 *  per email address: the buyer's email plus every guest seat that has
 *  its own email. Online, manual (dashboard) and rebooked bookings are
 *  all just workshop-bookings, so they're covered the same way.
 *
 *  Not sending twice: booking.workshopReminder records which appointment
 *  was reminded and which addresses got it. When an admin moves a booking
 *  to another date, appointmentId no longer matches → the new date gets
 *  its own reminder. A guest email added after the reminder went out
 *  still gets one on the next run.
 *
 *  Late additions: anyone booked or moved onto a workshop that is already
 *  less than 2 days away is reminded on the next run (as long as the
 *  workshop hasn't started).
 * ═══════════════════════════════════════════════════════════════ */

export const REMINDER_DAYS_BEFORE = 2

const TZ = 'Europe/Vienna'
const DAY_MS = 24 * 60 * 60 * 1000

/** YYYY-MM-DD of `d` as a Vienna calendar day. */
function viennaDayKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d! + days)).toISOString().slice(0, 10)
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  })
}

function fmtTime(d: Date): string {
  return `${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: TZ })} Uhr`
}

type Recipient = { email: string; firstName: string }

/**
 * Everyone on this booking who should get the reminder, deduplicated by email.
 * The buyer is the contact person, so they're reminded as long as any seat
 * is still active; a guest only while their own seat is active.
 */
export function reminderRecipients(booking: WorkshopBooking): Recipient[] {
  const seats = booking.seats ?? []
  const seatCount = Math.max(booking.guestCount ?? 1, seats.length, 1)
  const isActive = (i: number) => (seats[i]?.seatStatus ?? 'active') === 'active'

  const activeSeats = Array.from({ length: seatCount }, (_, i) => i).filter(isActive)
  if (activeSeats.length === 0) return []

  const byEmail = new Map<string, Recipient>()
  const add = (email: string | null | undefined, firstName: string) => {
    const clean = email?.trim()
    if (!clean) return
    const key = clean.toLowerCase()
    if (!byEmail.has(key)) byEmail.set(key, { email: clean, firstName })
  }

  add(booking.email, booking.firstName?.trim() ?? '')
  for (const i of activeSeats) {
    const seat = seats[i]
    add(seat?.email, seat?.recipientName?.trim().split(/\s+/)[0] ?? '')
  }
  return [...byEmail.values()]
}

export type ReminderRunSummary = {
  appointments: number
  bookings: number
  sent: number
  failed: number
  errors: string[]
  /** Dry run only: who would be reminded. */
  planned?: { bookingId: string; workshopDate: string; emails: string[] }[]
}

export async function sendDueWorkshopReminders(
  payload: Payload,
  { now = new Date(), dryRun = false }: { now?: Date; dryRun?: boolean } = {},
): Promise<ReminderRunSummary> {
  const templateId = BREVO_TEMPLATES.WORKSHOP_REMINDER
  if (!templateId && !dryRun) {
    throw new Error('BREVO_TEMPLATES.WORKSHOP_REMINDER is not set — create the Brevo template first.')
  }

  const summary: ReminderRunSummary = { appointments: 0, bookings: 0, sent: 0, failed: 0, errors: [] }
  if (dryRun) summary.planned = []
  const lastDayKey = addDaysToKey(viennaDayKey(now), REMINDER_DAYS_BEFORE)

  // Wide query window, then narrowed to exact Vienna calendar days below.
  const { docs: candidates } = await payload.find({
    collection: 'workshop-appointments',
    where: {
      and: [
        { dateTime: { greater_than: now.toISOString() } },
        { dateTime: { less_than: new Date(now.getTime() + (REMINDER_DAYS_BEFORE + 2) * DAY_MS).toISOString() } },
        { cancellationStatus: { not_equals: 'cancelled_by_organiser' } },
      ],
    },
    depth: 1,
    pagination: false,
    overrideAccess: true,
  })
  const appointments = candidates.filter(
    (a) => viennaDayKey(new Date(a.dateTime)) <= lastDayKey,
  )
  summary.appointments = appointments.length

  for (const appointment of appointments) {
    const params = appointmentParams(appointment)

    const { docs: bookings } = await payload.find({
      collection: 'workshop-bookings',
      where: {
        and: [{ appointmentId: { equals: appointment.id } }, { status: { equals: 'confirmed' } }],
      },
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })

    for (const booking of bookings) {
      const prior = booking.workshopReminder
      const alreadySent = new Set(
        prior?.appointmentId === appointment.id ? (prior.sentTo ?? []) : [],
      )
      const due = reminderRecipients(booking).filter((r) => !alreadySent.has(r.email.toLowerCase()))
      if (due.length === 0) continue
      summary.bookings++

      if (dryRun) {
        summary.planned!.push({
          bookingId: booking.id,
          workshopDate: `${params.WORKSHOP_DATE}, ${params.WORKSHOP_TIME}`,
          emails: due.map((r) => r.email),
        })
        continue
      }

      // Sequential sends + one write per booking — never Promise.all on Atlas M0.
      let newlySent = 0
      const sentNow: string[] = []
      const failedNow: string[] = []
      for (const recipient of due) {
        const result = await sendTemplateEmail({
          to: [{ email: recipient.email, name: recipient.firstName || undefined }],
          templateId,
          params: { ...params, FIRST_NAME: recipient.firstName },
        })
        if (result.success) {
          alreadySent.add(recipient.email.toLowerCase())
          sentNow.push(recipient.email)
          newlySent++
          summary.sent++
        } else {
          failedNow.push(recipient.email)
          summary.failed++
          summary.errors.push(`booking ${booking.id} → ${recipient.email}`)
        }
      }

      if (newlySent > 0) {
        try {
          await payload.update({
            collection: 'workshop-bookings',
            id: booking.id,
            data: {
              workshopReminder: {
                appointmentId: appointment.id,
                sentTo: [...alreadySent],
                sentAt: now.toISOString(),
              },
            },
            overrideAccess: true,
            context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
          })
        } catch (err) {
          // Emails already went out; without this record they'd be resent tomorrow.
          summary.errors.push(
            `booking ${booking.id}: sent but not recorded — ${err instanceof Error ? err.message : String(err)}`,
          )
        }
      }

      const parts = [
        sentNow.length > 0 ? `gesendet an ${sentNow.join(', ')}` : '',
        failedNow.length > 0 ? `fehlgeschlagen für ${failedNow.join(', ')}` : '',
      ].filter(Boolean)
      await addBookingHistory(payload, booking.id, {
        type: 'reminder_sent',
        summary: `Erinnerung für ${params.WORKSHOP_DATE} · ${parts.join(' · ')}`,
      })
    }
  }

  return summary
}

export function appointmentParams(appointment: WorkshopAppointment): Record<string, string> {
  const start = new Date(appointment.dateTime)
  const workshop = typeof appointment.workshop === 'object' ? appointment.workshop : null
  const location = typeof appointment.location === 'object' ? appointment.location : null
  return {
    WORKSHOP_TITLE: workshop?.title ?? 'Workshop',
    WORKSHOP_DATE: fmtDate(start),
    WORKSHOP_TIME: fmtTime(start),
    WORKSHOP_LOCATION: location ? [location.name, location.address].filter(Boolean).join(', ') : '',
  }
}
