'use server'

import crypto from 'crypto'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { addBookingHistory, emailOutcome } from '@/lib/bookingHistory'
import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
import { seatsHoldingPlace } from '@/lib/seatCapacity'
import { getServerSideURL } from '@/utilities/getURL'

import { adminDisplayName, requireAdminUser } from './requireAdmin'

/**
 * "Alle wählen selbst einen neuen Termin" — from the workshop day sheet.
 *
 * For each selected booking: mint a personal manage-booking link with scope
 * 'date-offer' (policy: only "choose a new date", same workshop, no refund),
 * valid until the original date starts, and email it (Brevo template 104).
 * Nobody is moved here — a seat only moves when the customer picks a date
 * (existing rebook-now route, which reserves the new seat atomically first).
 *
 * Sequential writes only (MongoDB Atlas M0).
 */
export async function sendChooseOwnDateLinks(params: {
  appointmentId: string
  bookingIds: string[]
  reason?: string
}): Promise<{ ok: true; data: { sent: string[]; skipped: string[] } } | { ok: false; error: string }> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    if (params.bookingIds.length === 0) return { ok: false, error: 'Keine Buchungen ausgewählt.' }
    if (params.bookingIds.length > 100) return { ok: false, error: 'Zu viele Buchungen auf einmal.' }

    const appointment = await payload.findByID({
      collection: 'workshop-appointments',
      id: params.appointmentId,
      depth: 0,
      overrideAccess: true,
    })
    const startsAt = new Date(String(appointment.dateTime ?? ''))
    if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
      return { ok: false, error: 'Dieser Termin hat schon begonnen oder liegt in der Vergangenheit.' }
    }

    const base = getServerSideURL().replace(/\/$/, '')
    const by = adminDisplayName(user)
    const sent: string[] = []
    const skipped: string[] = []

    for (const bookingId of params.bookingIds) {
      const booking = await payload.findByID({ collection: 'workshop-bookings', id: bookingId, depth: 0, overrideAccess: true })
      const name = [booking.firstName, booking.lastName].filter(Boolean).join(' ') || 'Kund:in'
      // Only bookings that really are on this date and still hold a place.
      if (String(booking.appointmentId ?? '') !== params.appointmentId || seatsHoldingPlace(booking) === 0) {
        skipped.push(`${name} (nicht mehr auf diesem Termin)`)
        continue
      }
      if (!booking.email) {
        skipped.push(`${name} (keine E-Mail)`)
        await addBookingHistory(payload, bookingId, {
          type: 'alternate_offered',
          summary: 'Link „Neuen Termin wählen“ nicht gesendet, keine E-Mail hinterlegt',
          by,
        })
        continue
      }

      const token = crypto.randomUUID()
      await payload.create({
        collection: 'booking-magic-links',
        data: {
          token,
          bookingId: booking.id,
          scope: 'date-offer',
          issuedAt: new Date().toISOString(),
          // The offer ends when the original date starts.
          expiresAt: startsAt.toISOString(),
        },
        overrideAccess: true,
      })

      const result = await sendTemplateEmail({
        to: [{ email: booking.email, name }],
        templateId: BREVO_TEMPLATES.WORKSHOP_DATE_OFFER,
        params: {
          FIRST_NAME: booking.firstName || name,
          WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
          WORKSHOP_DATE: String(booking.date ?? ''),
          WORKSHOP_TIME: String(booking.time ?? ''),
          REASON: params.reason?.trim() || 'Wir müssen diesen Termin neu planen.',
          MANAGE_BOOKING_URL: `${base}/manage-booking/${token}`,
        },
      })
      const delivered = result.success && !result.blocked
      await addBookingHistory(payload, bookingId, {
        type: 'alternate_offered',
        summary: `Link „Neuen Termin wählen“ · ${result.blocked ? 'Testumgebung: E-Mail nicht gesendet (Adresse nicht freigegeben)' : emailOutcome(booking.email, result.success)}`,
        by,
      })
      if (delivered) sent.push(name)
      else skipped.push(result.blocked ? `${name} (Testumgebung)` : `${name} (Versand fehlgeschlagen)`)
    }
    return { ok: true, data: { sent, skipped } }
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') return { ok: false, error: 'Keine Berechtigung.' }
    console.error('[chooseDateActions]', e)
    return { ok: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler.' }
  }
}
