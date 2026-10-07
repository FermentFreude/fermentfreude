import { randomBytes } from 'crypto'

import type { Payload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  Booking history ("Verlauf") — an append-only log on each
 *  workshop booking of everything that happened to it: how it was
 *  created, moves, emails sent (or not), link opened, customer
 *  choices, refunds. Shown in the roster's booking detail.
 *
 *  Deliberately separate from `notes` (dietary text that admins edit
 *  freely) so nothing here can be overwritten by accident. Entries are
 *  added with a single atomic $push — never read-modify-write — so a
 *  concurrent update elsewhere can't drop one.
 * ═══════════════════════════════════════════════════════════════ */

export const BOOKING_HISTORY_TYPES = [
  { label: 'Online gebucht', value: 'created_online' },
  { label: 'Manuell hinzugefügt', value: 'created_manual' },
  { label: 'Entstanden durch Umbuchung', value: 'created_rebooking' },
  { label: 'Verschoben (Admin)', value: 'moved' },
  { label: 'Ausweichtermin angeboten', value: 'alternate_offered' },
  { label: 'E-Mail geändert', value: 'email_changed' },
  { label: 'Erinnerung gesendet', value: 'reminder_sent' },
  { label: 'Von uns abgesagt', value: 'organiser_cancelled' },
  { label: 'Link geöffnet', value: 'link_opened' },
  { label: 'Kund:in hat umgebucht', value: 'customer_rebooked' },
  { label: 'Gutschein statt Termin', value: 'customer_voucher' },
  { label: 'Storniert (ohne Erstattung)', value: 'customer_cancelled' },
  { label: 'Erstattung angefragt', value: 'refund_requested' },
  { label: 'Erstattung abgeschlossen', value: 'refund_completed' },
] as const

export type BookingHistoryType = (typeof BOOKING_HISTORY_TYPES)[number]['value']

export async function addBookingHistory(
  payload: Payload,
  bookingId: string,
  entry: { type: BookingHistoryType; summary: string; by?: string },
): Promise<void> {
  try {
    await payload.db.collections['workshop-bookings'].updateOne(
      { _id: bookingId },
      {
        $push: {
          history: {
            id: randomBytes(12).toString('hex'),
            at: new Date(),
            type: entry.type,
            summary: entry.summary,
            by: entry.by ?? 'System',
          },
        },
      },
    )
  } catch (err) {
    // History is a record of what happened — it must never make the action itself fail.
    payload.logger.error(
      `[bookingHistory] Could not record "${entry.type}" on booking ${bookingId}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

/** "an a@x.at" / "keine E-Mail hinterlegt" / "an a@x.at fehlgeschlagen" — the email part of a summary. */
export function emailOutcome(email: string | null | undefined, success: boolean | null): string {
  if (!email) return 'keine E-Mail hinterlegt'
  return success ? `E-Mail an ${email} gesendet` : `E-Mail an ${email} fehlgeschlagen`
}

/**
 * Record the FIRST time a customer opens a "Buchung verwalten" link — once
 * per link, atomically, so reloads and parallel requests never add duplicates.
 */
export async function recordMagicLinkOpened(
  payload: Payload,
  magicLink: { id: string; scope?: string | null },
  bookingId: string,
): Promise<void> {
  try {
    const result = await payload.db.collections['booking-magic-links'].updateOne(
      { _id: magicLink.id, openedAt: null },
      { $set: { openedAt: new Date() } },
    )
    if (result.modifiedCount !== 1) return
    await addBookingHistory(payload, bookingId, {
      type: 'link_opened',
      summary:
        magicLink.scope === 'organiser-cancellation'
          ? 'Link "Ersatztermin oder Erstattung" zum ersten Mal geöffnet'
          : 'Link "Buchung verwalten" zum ersten Mal geöffnet',
      by: 'Kund:in',
    })
  } catch (err) {
    payload.logger.error(
      `[bookingHistory] Could not record link open for ${magicLink.id}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
