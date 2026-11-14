'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { createInvoice, recordPayment, sendConfirmation, type PaymentInput } from '@/lib/manualBooking'

import { adminDisplayName, requireAdminUser } from './requireAdmin'

/**
 * Follow-up steps for seats the founders added by hand ("Zahlung nachtragen"):
 * record how/if it was paid, create the invoice, send the confirmation.
 * Each step is optional and can be done any time later.
 */

type Result = { ok: true; message: string; warnings: string[] } | { ok: false; error: string }

export async function updateManualPayment(params: {
  bookingId: string
  payment: PaymentInput
  createInvoice?: boolean
  sendConfirmation?: boolean
}): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const by = adminDisplayName(user)
    await recordPayment(payload, params.bookingId, params.payment, by)

    const warnings: string[] = []
    const done: string[] = ['Zahlung gespeichert']
    if (params.createInvoice) {
      try {
        const r = await createInvoice(payload, params.bookingId, by)
        done.push(`Rechnung ${r.invoiceNumber || 'erstellt'}`)
      } catch (e) {
        warnings.push(e instanceof Error ? e.message : String(e))
      }
    }
    if (params.sendConfirmation) {
      try {
        const r = await sendConfirmation(payload, params.bookingId, by)
        if (r.sent) done.push('Bestätigung gesendet')
        else warnings.push(r.blocked ? 'Bestätigung nicht gesendet: Testumgebung, Adresse nicht freigegeben.' : (r.reason ?? 'Bestätigung konnte nicht gesendet werden.'))
      } catch (e) {
        warnings.push(e instanceof Error ? e.message : String(e))
      }
    }
    return { ok: true, message: done.join(' · '), warnings }
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message === 'Unauthorized' ? 'Keine Berechtigung.' : e instanceof Error ? e.message : 'Unbekannter Fehler.' }
  }
}

export async function createInvoiceForBooking(bookingId: string): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const r = await createInvoice(payload, bookingId, adminDisplayName(user))
    return { ok: true, message: `Rechnung ${r.invoiceNumber || 'erstellt'}`, warnings: [] }
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message === 'Unauthorized' ? 'Keine Berechtigung.' : e instanceof Error ? e.message : 'Unbekannter Fehler.' }
  }
}

export async function sendConfirmationForBooking(bookingId: string): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const r = await sendConfirmation(payload, bookingId, adminDisplayName(user))
    if (r.sent) return { ok: true, message: 'Bestätigung gesendet', warnings: [] }
    return { ok: false, error: r.blocked ? 'Nicht gesendet: Testumgebung, diese Adresse ist nicht freigegeben.' : (r.reason ?? 'Konnte nicht gesendet werden.') }
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message === 'Unauthorized' ? 'Keine Berechtigung.' : e instanceof Error ? e.message : 'Unbekannter Fehler.' }
  }
}
