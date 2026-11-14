import crypto from 'crypto'

import type { Payload } from 'payload'

import { addBookingHistory, emailOutcome } from '@/lib/bookingHistory'
import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
import { generateBookingICS } from '@/lib/generateBookingICS'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Helpers for workshop seats the founders add by hand (booked by email, phone,
 * in person, with a Wix voucher …). Not network-callable on their own — the
 * server actions in components/admin/roster/manualBookingActions.ts and
 * actions.ts check the admin role first and then call these.
 *
 * Sequential writes only (MongoDB Atlas M0).
 */

export type ManualChannel = 'email' | 'phone' | 'inperson' | 'wix' | 'other'
export type ManualPaymentStatus = 'paid' | 'open'
export type ManualPaymentMethod = 'transfer' | 'cash' | 'card_onsite' | 'voucher_wix' | 'voucher_shop' | 'wix_paid' | 'other'

export const CHANNEL_LABEL: Record<ManualChannel, string> = {
  email: 'per E-Mail',
  phone: 'per Telefon',
  inperson: 'vor Ort / im Shop',
  wix: 'über Wix',
  other: 'sonstiges',
}
export const METHOD_LABEL: Record<ManualPaymentMethod, string> = {
  transfer: 'Überweisung',
  cash: 'Bar',
  card_onsite: 'Karte vor Ort',
  voucher_wix: 'Wix-Gutschein',
  voucher_shop: 'Gutschein (Shop / Website)',
  wix_paid: 'bereits in Wix bezahlt',
  other: 'sonstiges',
}

export type PaymentInput = {
  paymentStatus: ManualPaymentStatus
  paymentMethod?: ManualPaymentMethod
  voucherCode?: string
  paymentNote?: string
}

const CHANNELS = new Set(Object.keys(CHANNEL_LABEL))
const METHODS = new Set(Object.keys(METHOD_LABEL))

export function isChannel(v: unknown): v is ManualChannel {
  return typeof v === 'string' && CHANNELS.has(v)
}

/** Validates the payment part of the form and returns a clean object (throws a German message). */
export function cleanPayment(input: PaymentInput): PaymentInput {
  if (input.paymentStatus !== 'paid' && input.paymentStatus !== 'open') throw new Error('Bitte angeben, ob bezahlt oder noch offen.')
  if (input.paymentStatus === 'open') return { paymentStatus: 'open', paymentNote: input.paymentNote?.trim().slice(0, 300) }
  if (!input.paymentMethod || !METHODS.has(input.paymentMethod)) throw new Error('Bitte die Zahlungsart wählen.')
  const voucherCode = input.voucherCode?.trim().slice(0, 60)
  if ((input.paymentMethod === 'voucher_wix' || input.paymentMethod === 'voucher_shop') && !voucherCode) {
    throw new Error('Bitte den Gutschein-Code eintragen.')
  }
  return {
    paymentStatus: 'paid',
    paymentMethod: input.paymentMethod,
    ...(voucherCode ? { voucherCode } : {}),
    paymentNote: input.paymentNote?.trim().slice(0, 300),
  }
}

export function paymentSummary(p: PaymentInput): string {
  if (p.paymentStatus === 'open') return 'Zahlung noch offen (Reservierung)'
  const method = p.paymentMethod ? METHOD_LABEL[p.paymentMethod] : ''
  return `bezahlt${method ? `: ${method}` : ''}${p.voucherCode ? ` (${p.voucherCode})` : ''}`
}

/** Writes the payment info onto the booking and records it in the history. */
export async function recordPayment(payload: Payload, bookingId: string, input: PaymentInput, by: string): Promise<void> {
  const p = cleanPayment(input)
  const booking = await payload.findByID({ collection: 'workshop-bookings', id: bookingId, depth: 0, overrideAccess: true })
  const previous = (booking as { manualInfo?: Record<string, unknown> }).manualInfo ?? {}
  await payload.update({
    collection: 'workshop-bookings',
    id: bookingId,
    data: {
      manualInfo: {
        ...previous,
        paymentStatus: p.paymentStatus,
        paymentMethod: p.paymentStatus === 'paid' ? p.paymentMethod : null,
        voucherCode: p.voucherCode ?? null,
        paymentNote: p.paymentNote ?? null,
        paidAt: p.paymentStatus === 'paid' ? new Date().toISOString() : null,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    overrideAccess: true,
  })
  await addBookingHistory(payload, bookingId, {
    type: 'payment_recorded',
    summary: `${paymentSummary(p)}${p.paymentNote ? ` · ${p.paymentNote}` : ''}`,
    by,
  })
}

/**
 * Creates the invoice (MAN series) for a manual seat, e.g. paid on site.
 * The order has no product lines — the receipt lists the workshop seat from
 * the booking that points at it (see buildOrderReceiptData). Order hooks that
 * would email the customer are switched off; the confirmation email is a
 * separate, explicit step.
 */
export async function createInvoice(payload: Payload, bookingId: string, by: string): Promise<{ orderId: string; invoiceNumber: string }> {
  const booking = await payload.findByID({ collection: 'workshop-bookings', id: bookingId, depth: 0, overrideAccess: true })
  if (booking.orderId) throw new Error('Zu dieser Buchung gibt es schon eine Rechnung.')
  if (/wix/i.test(booking.notes ?? '') || (booking as { manualInfo?: { channel?: string } }).manualInfo?.channel === 'wix') {
    throw new Error('Diese Buchung kommt aus Wix. Zahlung und Rechnung laufen über Wix.')
  }
  if (booking.status !== 'confirmed') throw new Error('Nur bestätigte Buchungen bekommen eine Rechnung.')
  const info = (booking as { manualInfo?: { paymentStatus?: string; paymentMethod?: ManualPaymentMethod; voucherCode?: string } }).manualInfo
  if (info?.paymentStatus === 'open') throw new Error('Die Zahlung ist noch offen. Erst „bezahlt“ eintragen, dann die Rechnung erstellen.')

  const amount = Math.round(Number(booking.totalPrice ?? 0) * 100)
  const method = info?.paymentMethod ? METHOD_LABEL[info.paymentMethod] : ''
  const created = await payload.create({
    collection: 'orders',
    data: {
      items: [],
      amount,
      currency: 'EUR',
      status: 'completed',
      paymentMethod: 'manual',
      customerFirstName: booking.firstName ?? '',
      customerLastName: booking.lastName ?? '',
      customerName: [booking.firstName, booking.lastName].filter(Boolean).join(' '),
      ...(booking.email ? { customerEmail: booking.email } : {}),
      referenceNote: ['Workshop-Buchung von Hand', method && `Zahlung: ${method}`, info?.voucherCode && `Gutschein ${info.voucherCode}`].filter(Boolean).join(' · '),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    context: { skipOrderConfirmationEmail: true, skipAutoTranslate: true, skipRevalidate: true },
    overrideAccess: true,
  })
  const order = created as unknown as { id: string | number; invoiceNumber?: string | null }
  await payload.update({ collection: 'workshop-bookings', id: bookingId, data: { orderId: String(order.id) }, overrideAccess: true })
  const invoiceNumber = order.invoiceNumber ?? ''
  await addBookingHistory(payload, bookingId, {
    type: 'invoice_created',
    summary: `Rechnung ${invoiceNumber || `#${String(order.id).slice(-8).toUpperCase()}`} erstellt (${(amount / 100).toFixed(2)} €)`,
    by,
  })
  return { orderId: String(order.id), invoiceNumber }
}

/** Sends the normal booking confirmation (guest template) for a manual seat. */
export async function sendConfirmation(
  payload: Payload,
  bookingId: string,
  by: string,
): Promise<{ sent: boolean; blocked: boolean; reason?: string }> {
  const booking = await payload.findByID({ collection: 'workshop-bookings', id: bookingId, depth: 0, overrideAccess: true })
  if (!booking.email) return { sent: false, blocked: false, reason: 'Keine E-Mail-Adresse hinterlegt.' }

  const base = getServerSideURL().replace(/\/$/, '')
  let location = ''
  let icsDate = ''
  let startsAt: Date | null = null
  if (booking.appointmentId) {
    try {
      const appt = await payload.findByID({ collection: 'workshop-appointments', id: booking.appointmentId, depth: 1, overrideAccess: true })
      const loc = (appt as { location?: unknown }).location
      if (loc && typeof loc === 'object') {
        const l = loc as { name?: string; address?: string }
        location = [l.name, l.address].filter(Boolean).join(', ')
      }
      const dt = new Date(String((appt as { dateTime?: unknown }).dateTime ?? ''))
      if (!Number.isNaN(dt.getTime())) {
        startsAt = dt
        icsDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt)
      }
    } catch {
      /* date/location are best-effort */
    }
  }

  // Management link so the person can rebook or cancel themselves.
  let manageUrl = `${base}/account/orders`
  try {
    const token = crypto.randomUUID()
    await payload.create({
      collection: 'booking-magic-links',
      data: {
        token,
        bookingId: booking.id,
        scope: 'self-service',
        issuedAt: new Date().toISOString(),
        expiresAt: (startsAt ?? new Date(Date.now() + 90 * 86400_000)).toISOString(),
      },
      overrideAccess: true,
    })
    manageUrl = `${base}/manage-booking/${token}`
  } catch {
    /* fall back to the account link */
  }

  let whatToBring = ''
  if (booking.workshopSlug) {
    try {
      const w = await payload.find({ collection: 'workshops', where: { slug: { equals: booking.workshopSlug } }, limit: 1, depth: 0, overrideAccess: true })
      const t = (w.docs[0] as { whatToBring?: string } | undefined)?.whatToBring
      if (typeof t === 'string') whatToBring = t.trim().replace(/\r\n/g, '\n').replace(/\n/g, '<br>')
    } catch {
      /* best-effort */
    }
  }

  let ics: { name: string; content: string } | undefined
  try {
    const file = generateBookingICS({
      bookingId: String(booking.id),
      title: String(booking.workshopTitle ?? 'Workshop'),
      date: icsDate || String(booking.date ?? ''),
      time: String(booking.time ?? ''),
      location: location || undefined,
      url: manageUrl,
    })
    ics = { name: 'fermentfreude-workshop.ics', content: Buffer.from(file, 'utf-8').toString('base64') }
  } catch {
    /* the email works without the calendar file */
  }

  let receiptUrl = ''
  if (booking.orderId) {
    try {
      const order = await payload.findByID({ collection: 'orders', id: booking.orderId, depth: 0, overrideAccess: true })
      const token = (order as { downloadToken?: string }).downloadToken
      if (token) receiptUrl = `${base}/api/orders/${order.id}/receipt?token=${token}`
    } catch {
      /* no receipt link */
    }
  }

  const seats = (booking.seats as { recipientName?: string }[] | undefined) ?? []
  const total = typeof booking.totalPrice === 'number' ? `€${booking.totalPrice.toFixed(2).replace('.', ',')}` : ''
  const result = await sendTemplateEmail({
    to: [{ email: booking.email, name: booking.firstName || undefined }],
    templateId: BREVO_TEMPLATES.WORKSHOP_BOOKING_CONFIRMATION_GUEST,
    params: {
      WORKSHOP_TITLE: String(booking.workshopTitle ?? 'Workshop'),
      WORKSHOP_DATE: String(booking.date ?? ''),
      WORKSHOP_TIME: String(booking.time ?? ''),
      WORKSHOP_LOCATION: location,
      GUEST_COUNT: String(booking.guestCount ?? 1),
      TOTAL_PRICE: total,
      FIRST_NAME: booking.firstName?.trim() || 'Gast',
      CUSTOMER_PHONE: booking.phone?.trim() || 'Nicht angegeben',
      CUSTOMER_DIET_SPECS: booking.notes?.trim() || 'Keine Angabe',
      BOOKING_ID: String(booking.id),
      BOOKING_REF: String(booking.id).slice(-8).toUpperCase(),
      SEATS: Array.from({ length: booking.guestCount ?? 1 }, (_, i) => ({ NUMBER: String(i + 1), NAME: seats[i]?.recipientName ?? '' })),
      TICKETS_URL: manageUrl,
      RECEIPT_URL: receiptUrl,
      WHAT_TO_BRING: whatToBring,
      PRIVACY_URL: `${base}/datenschutz`,
      AGB_URL: `${base}/agb`,
      CREATE_ACCOUNT_URL: `${base}/create-account`,
      MANAGE_BOOKING_URL: manageUrl,
      POLICY_SUMMARY: 'Kostenlose Stornierung oder Umbuchung bis 30 Tage vor dem Workshop — Details über "Buchung verwalten".',
    },
    attachments: ics ? [ics] : undefined,
  })
  const blocked = Boolean(result.blocked)
  await addBookingHistory(payload, bookingId, {
    type: 'confirmation_sent',
    summary: blocked
      ? 'Bestätigung nicht gesendet (Testumgebung: Adresse nicht freigegeben)'
      : `Bestätigung: ${emailOutcome(booking.email, result.success)}`,
    by,
  })
  return { sent: result.success && !blocked, blocked }
}
