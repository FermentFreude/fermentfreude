'use server'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { releaseSpotsAtomic, reserveSpotsAtomic } from '@/lib/atomicSpots'
import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
import { fmtDate, fmtTime } from './fetchRosterData'

/**
 * Server Actions are network-callable independent of which page rendered
 * them — the Roster admin view being gated doesn't protect the action
 * itself once its client bundle has shipped. Same check as
 * /api/admin/roster/route.ts, enforced again here at the point of mutation.
 */
async function requireAdmin(payload: Payload) {
  const { user } = await payload.auth({ headers: await getHeaders() })
  const userAny = user as { role?: string; roles?: string[] } | null
  const isAdmin =
    userAny?.role === 'admin' ||
    userAny?.roles?.includes('admin') ||
    (user as Record<string, unknown> | null)?.['admin'] === true

  if (!user || !isAdmin) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function updatePickupStatus(
  orderId: string,
  status: 'pending' | 'ready' | 'collected',
): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)
  await payload.update({
    collection: 'orders',
    id: orderId,
    data: { pickupStatus: status },
    overrideAccess: true,
  })
}

export async function deleteVoucher(voucherId: string): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)
  await payload.delete({
    collection: 'vouchers',
    id: voucherId,
    overrideAccess: true,
  })
}

export async function createVoucher(params: {
  value: number
  purchaserName?: string
  recipientName?: string
  recipientEmail?: string
  personalNote?: string
}): Promise<{ code: string; id: string }> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)
  const created = await payload.create({
    collection: 'vouchers',
    draft: false,
    data: {
      // code is intentionally omitted — beforeValidate hook generates it
      value: params.value,
      status: 'active',
      deliveryMethod: 'pdf',
      // Empty strings omitted — purchaserEmail is no longer required (manually-created vouchers have no online buyer)
      ...(params.purchaserName?.trim() ? { purchaserName: params.purchaserName.trim() } : {}),
      ...(params.recipientName?.trim() ? { recipientName: params.recipientName.trim() } : {}),
      ...(params.recipientEmail?.trim() ? { recipientEmail: params.recipientEmail.trim() } : {}),
      ...(params.personalNote?.trim() ? { personalNote: params.personalNote.trim() } : {}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    overrideAccess: true,
  })
  const v = created as unknown as { code?: string; id: string }
  return { code: v.code ?? String(created.id), id: String(created.id) }
}

/** Product/variant search for the manual-order line-item picker. Physical & digital products only — workshops book through their own flow. */
export async function searchProducts(query: string): Promise<
  {
    id: string
    title: string
    priceInEUR: number
    inventory: number | null
    variants: { id: string; title: string; priceInEUR: number; inventory: number | null }[]
  }[]
> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  const result = await payload.find({
    collection: 'products',
    where: {
      and: [
        { productType: { not_equals: 'workshop' } },
        ...(query.trim() ? [{ title: { like: query.trim() } }] : []),
      ],
    },
    limit: 20,
    depth: 1,
    overrideAccess: true,
  })

  return result.docs.map((p) => {
    const product = p as unknown as {
      id: string
      title: string
      priceInEUR?: number | null
      inventory?: number | null
      variants?: { docs?: unknown[] }
    }
    const variantDocs = (product.variants?.docs ?? []) as Record<string, unknown>[]
    return {
      id: String(product.id),
      title: product.title,
      priceInEUR: product.priceInEUR ?? 0,
      inventory: product.inventory ?? null,
      variants: variantDocs
        .filter((v) => typeof v === 'object')
        .map((v) => ({
          id: String(v.id),
          title: (v.title as string) ?? '',
          priceInEUR: (v.priceInEUR as number) ?? 0,
          inventory: (v.inventory as number | null) ?? null,
        })),
    }
  })
}

export interface CreateManualOrderLineItem {
  productId: string
  variantId?: string
  quantity: number
}

/**
 * Creates a real `orders` document for a bank-transfer/phone/in-person sale
 * — no Stripe payment intent. `paymentMethod: 'manual'` routes
 * assignInvoiceNumber to the MAN series. Being a real order, it flows
 * through the same afterChange hooks as a Stripe order (decrementInventory,
 * sendOrderConfirmationEmail, etc.) with no special-casing needed.
 */
export async function createManualOrder(params: {
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  referenceNote?: string
  items: CreateManualOrderLineItem[]
}): Promise<{ id: string; invoiceNumber: string | null }> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  if (params.items.length === 0) {
    throw new Error('At least one line item is required.')
  }

  let amount = 0
  for (const item of params.items) {
    const product = await payload.findByID({
      collection: 'products',
      id: item.productId,
      depth: 0,
      overrideAccess: true,
    })
    const productData = product as unknown as { priceInEUR?: number | null }
    let unitPrice = productData.priceInEUR ?? 0

    if (item.variantId) {
      const variant = await payload.findByID({
        collection: 'variants',
        id: item.variantId,
        depth: 0,
        overrideAccess: true,
      })
      unitPrice = (variant as unknown as { priceInEUR?: number | null }).priceInEUR ?? unitPrice
    }

    amount += unitPrice * item.quantity
  }

  const created = await payload.create({
    collection: 'orders',
    data: {
      items: params.items.map((item) => ({
        product: item.productId,
        ...(item.variantId ? { variant: item.variantId } : {}),
        quantity: item.quantity,
      })),
      amount,
      currency: 'EUR',
      status: 'completed',
      paymentMethod: 'manual',
      customerFirstName: params.customerFirstName,
      customerLastName: params.customerLastName,
      customerName: `${params.customerFirstName} ${params.customerLastName}`.trim(),
      customerEmail: params.customerEmail,
      ...(params.referenceNote?.trim() ? { referenceNote: params.referenceNote.trim() } : {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    overrideAccess: true,
  })

  const order = created as unknown as { id: string; invoiceNumber?: string | null }
  return { id: String(order.id), invoiceNumber: order.invoiceNumber ?? null }
}

/**
 * Manually add a workshop seat from the roster dashboard — for customers
 * with an old voucher or a special agreement, bypassing Stripe checkout
 * entirely (mirrors what David does in Wix today by adding a placeholder
 * booking). Must do BOTH of the following to behave exactly like a real
 * booking: reserve the spot atomically (the same guard the live checkout
 * route uses, so the public booking flow can't oversell), AND create a
 * `confirmed` workshop-bookings doc (so it shows up in this roster's own
 * participant list/capacity count, which is derived independently from
 * availableSpots — see fetchRosterData.ts).
 */
export async function createManualWorkshopBooking(params: {
  appointmentId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  guestCount: number
  notes?: string
}): Promise<{ id: string }> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  if (!params.appointmentId) {
    throw new Error('Kein Termin ausgewählt.')
  }
  if (!params.firstName.trim()) {
    throw new Error('Bitte Vorname angeben.')
  }
  if (!Number.isInteger(params.guestCount) || params.guestCount < 1 || params.guestCount > 12) {
    throw new Error('Anzahl der Plätze muss zwischen 1 und 12 liegen.')
  }

  // Re-fetch server-side for integrity — the client's AppointmentRow has no
  // workshopSlug/basePrice, so it can't supply everything a booking needs.
  const appointment = await payload.findByID({
    collection: 'workshop-appointments',
    id: params.appointmentId,
    depth: 1,
    overrideAccess: true,
  })
  const workshop = appointment.workshop
  if (typeof workshop !== 'object' || workshop === null) {
    throw new Error('Workshop-Daten konnten nicht geladen werden.')
  }

  const reserveResult = await reserveSpotsAtomic(payload, params.appointmentId, params.guestCount)
  if (!reserveResult.success) {
    throw new Error(`Nur noch ${reserveResult.availableSpots ?? 0} Platz/Plätze verfügbar.`)
  }

  const maxCapacity = Number(workshop.maxCapacityPerSlot ?? 12)
  try {
    const dateTimeStr = String(appointment.dateTime ?? '')
    const created = await payload.create({
      collection: 'workshop-bookings',
      data: {
        status: 'confirmed',
        appointmentId: params.appointmentId,
        workshopTitle: workshop.title,
        workshopSlug: workshop.slug,
        date: dateTimeStr ? fmtDate(dateTimeStr) : '',
        time: dateTimeStr ? `${fmtTime(dateTimeStr)} Uhr` : '',
        firstName: params.firstName.trim(),
        lastName: params.lastName?.trim() ?? '',
        ...(params.email?.trim() ? { email: params.email.trim() } : {}),
        ...(params.phone?.trim() ? { phone: params.phone.trim() } : {}),
        guestCount: params.guestCount,
        pricePerPerson: workshop.basePrice ?? 0,
        totalPrice: (workshop.basePrice ?? 0) * params.guestCount,
        ...(params.notes?.trim() ? { notes: params.notes.trim() } : {}),
        seats: Array.from({ length: params.guestCount }, () => ({ seatStatus: 'active' as const })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      overrideAccess: true,
    })
    return { id: String(created.id) }
  } catch (err) {
    // Booking create failed AFTER the atomic reserve succeeded — release the
    // spot back so it isn't silently lost.
    await releaseSpotsAtomic(payload, params.appointmentId, params.guestCount, maxCapacity)
    throw err
  }
}

/**
 * List other upcoming, published appointments for the same workshop as
 * `excludeAppointmentId` — candidates to move an overbooked booking to.
 * Shows real remaining capacity (derived from confirmed bookings, same way
 * fetchRosterData.ts computes it — not `availableSpots`, which can drift).
 */
export async function getAlternateAppointments(
  excludeAppointmentId: string,
): Promise<{ id: string; date: string; time: string; totalBooked: number; capacity: number }[]> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  const current = await payload.findByID({
    collection: 'workshop-appointments',
    id: excludeAppointmentId,
    depth: 1,
    overrideAccess: true,
  })
  const workshopId =
    typeof current.workshop === 'object' && current.workshop !== null ? current.workshop.id : current.workshop
  const capacity =
    typeof current.workshop === 'object' && current.workshop !== null
      ? Number(current.workshop.maxCapacityPerSlot ?? 12)
      : 12

  const appointments = await payload.find({
    collection: 'workshop-appointments',
    where: {
      and: [
        { workshop: { equals: workshopId } },
        { id: { not_equals: excludeAppointmentId } },
        { isPublished: { equals: true } },
        { dateTime: { greater_than: new Date().toISOString() } },
      ],
    },
    limit: 50,
    sort: 'dateTime',
    depth: 0,
    overrideAccess: true,
  })

  const results = []
  for (const appt of appointments.docs) {
    const bookings = await payload.find({
      collection: 'workshop-bookings',
      where: { and: [{ appointmentId: { equals: appt.id } }, { status: { equals: 'confirmed' } }] },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    const totalBooked = bookings.docs.reduce((sum, b) => sum + (b.guestCount || 0), 0)
    results.push({
      id: appt.id,
      date: fmtDate(String(appt.dateTime)),
      time: `${fmtTime(String(appt.dateTime))} Uhr`,
      totalBooked,
      capacity,
    })
  }
  return results
}

/**
 * Move an existing booking to a different appointment of the same workshop
 * — for resolving overbooking by relocating a guest to a date with room.
 * Reserves the new spot first (atomic, respects real capacity), then
 * releases the old spot only after the booking doc itself is updated, so a
 * failure partway through never leaves a guest's seat unaccounted for on
 * both dates or neither.
 */
export async function moveWorkshopBooking(params: {
  bookingId: string
  newAppointmentId: string
}): Promise<{ id: string }> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  const booking = await payload.findByID({
    collection: 'workshop-bookings',
    id: params.bookingId,
    depth: 0,
    overrideAccess: true,
  })
  const oldAppointmentId = booking.appointmentId
  if (!oldAppointmentId) {
    throw new Error('Diese Buchung hat keinen zugeordneten Termin.')
  }
  if (oldAppointmentId === params.newAppointmentId) {
    throw new Error('Das ist bereits der aktuelle Termin.')
  }

  const newAppointment = await payload.findByID({
    collection: 'workshop-appointments',
    id: params.newAppointmentId,
    depth: 1,
    overrideAccess: true,
  })
  const workshop = newAppointment.workshop
  if (typeof workshop !== 'object' || workshop === null) {
    throw new Error('Workshop-Daten konnten nicht geladen werden.')
  }
  const maxCapacity = Number(workshop.maxCapacityPerSlot ?? 12)
  const guestCount = booking.guestCount || 1

  const reserveResult = await reserveSpotsAtomic(payload, params.newAppointmentId, guestCount)
  if (!reserveResult.success) {
    throw new Error(`Am neuen Termin sind nur noch ${reserveResult.availableSpots ?? 0} Platz/Plätze frei.`)
  }

  try {
    const dateTimeStr = String(newAppointment.dateTime ?? '')
    await payload.update({
      collection: 'workshop-bookings',
      id: params.bookingId,
      data: {
        appointmentId: params.newAppointmentId,
        workshopTitle: workshop.title,
        workshopSlug: workshop.slug,
        date: dateTimeStr ? fmtDate(dateTimeStr) : booking.date,
        time: dateTimeStr ? `${fmtTime(dateTimeStr)} Uhr` : booking.time,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      overrideAccess: true,
      context: { skipAutoTranslate: true },
    })
  } catch (err) {
    // Booking update failed after the new spot was reserved — release it
    // back so the new date isn't left short a spot for nothing.
    await releaseSpotsAtomic(payload, params.newAppointmentId, guestCount, maxCapacity)
    throw err
  }

  // Only release the old spot once the booking has actually moved — if this
  // step fails, the guest is still correctly booked on the new date; the old
  // appointment's availableSpots just needs a manual correction afterward,
  // which is a much smaller problem than losing the booking entirely.
  try {
    const oldAppointment = await payload.findByID({
      collection: 'workshop-appointments',
      id: oldAppointmentId,
      depth: 1,
      overrideAccess: true,
    })
    const oldWorkshop = oldAppointment.workshop
    const oldMaxCapacity =
      typeof oldWorkshop === 'object' && oldWorkshop !== null ? Number(oldWorkshop.maxCapacityPerSlot ?? 12) : 12
    await releaseSpotsAtomic(payload, oldAppointmentId, guestCount, oldMaxCapacity)
  } catch (err) {
    payload.logger.error(
      `[moveWorkshopBooking] Booking ${params.bookingId} moved successfully, but releasing the old appointment's spot failed: ${err instanceof Error ? err.message : err}`,
    )
  }

  return { id: params.bookingId }
}

/**
 * Email selected bookings offering a different date for the same workshop —
 * for resolving overbooking manually (guest replies by email; an admin then
 * uses moveWorkshopBooking once they confirm). Sends one email per booking
 * (not per seat) via the buyer's own email address; bookings with no email
 * on file are skipped and reported back, not silently dropped.
 */
export async function sendAlternateDateEmail(params: {
  bookingIds: string[]
  newAppointmentId: string
}): Promise<{ sent: string[]; skippedNoEmail: string[] }> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  if (params.bookingIds.length === 0) {
    throw new Error('Keine Buchungen ausgewählt.')
  }

  const newAppointment = await payload.findByID({
    collection: 'workshop-appointments',
    id: params.newAppointmentId,
    depth: 0,
    overrideAccess: true,
  })
  const dateTimeStr = String(newAppointment.dateTime ?? '')
  const newDate = dateTimeStr ? fmtDate(dateTimeStr) : ''
  const newTime = dateTimeStr ? `${fmtTime(dateTimeStr)} Uhr` : ''

  const sent: string[] = []
  const skippedNoEmail: string[] = []

  for (const bookingId of params.bookingIds) {
    const booking = await payload.findByID({
      collection: 'workshop-bookings',
      id: bookingId,
      depth: 0,
      overrideAccess: true,
    })
    const name = [booking.firstName, booking.lastName].filter(Boolean).join(' ') || 'Kund:in'
    if (!booking.email) {
      skippedNoEmail.push(name)
      continue
    }

    const result = await sendTemplateEmail({
      to: [{ email: booking.email, name }],
      templateId: BREVO_TEMPLATES.WORKSHOP_ALTERNATE_DATE_OFFER,
      params: {
        FIRST_NAME: booking.firstName || name,
        WORKSHOP_TITLE: booking.workshopTitle || '',
        ORIGINAL_DATE: `${booking.date || ''}${booking.time ? ` · ${booking.time}` : ''}`,
        NEW_DATE: newDate,
        NEW_TIME: newTime,
      },
    })

    if (result.success) {
      sent.push(name)
      const contactedNote = `[Kontaktiert ${new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Vienna' })} wegen Ausweichtermin]`
      await payload.update({
        collection: 'workshop-bookings',
        id: bookingId,
        data: {
          notes: booking.notes ? `${booking.notes}\n${contactedNote}` : contactedNote,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        overrideAccess: true,
        context: { skipAutoTranslate: true },
      })
    } else {
      payload.logger.error(`[sendAlternateDateEmail] Failed to send to booking ${bookingId} (${name})`)
      skippedNoEmail.push(`${name} (Versand fehlgeschlagen)`)
    }
  }

  return { sent, skippedNoEmail }
}

export interface CreateQuoteLineItem {
  title: string
  note?: string
  quantity: number
  unitPriceCents: number
}

/** Creates an ANGEBOT (quote) — a Quotes doc, not an Order. Accepting it later is a separate manual step. */
export async function createQuote(params: {
  clientName: string
  contactPersonName?: string
  clientAddress?: string
  projectName: string
  clientReference?: string
  items: CreateQuoteLineItem[]
  eventDateText?: string
  eventLocationText?: string
  participantCountText?: string
  cancellationTermsText?: string
}): Promise<{ id: string; quoteNumber: string | null }> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  if (params.items.length === 0) {
    throw new Error('At least one line item is required.')
  }

  const created = await payload.create({
    collection: 'quotes',
    data: {
      clientName: params.clientName,
      contactPersonName: params.contactPersonName,
      clientAddress: params.clientAddress,
      projectName: params.projectName,
      clientReference: params.clientReference,
      items: params.items,
      eventDateText: params.eventDateText,
      eventLocationText: params.eventLocationText,
      participantCountText: params.participantCountText,
      cancellationTermsText: params.cancellationTermsText,
      status: 'open',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    overrideAccess: true,
  })

  const quote = created as unknown as { id: string; quoteNumber?: string | null }
  return { id: String(quote.id), quoteNumber: quote.quoteNumber ?? null }
}

/** Updates a Quote's status (open / accepted / expired). */
export async function updateQuoteStatus(
  quoteId: string,
  status: 'open' | 'accepted' | 'expired',
): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)
  await payload.update({
    collection: 'quotes',
    id: quoteId,
    data: { status },
    overrideAccess: true,
  })
}

/**
 * Creates a STORNORECHNUNG for an order — snapshots its current line items
 * and total (via buildOrderReceiptData, the same price-resolution logic
 * used for regular invoices) so the Storno stays accurate even if product
 * prices change later. Does NOT touch the original order — both documents
 * are meant to be kept side by side. Does NOT call Stripe — refund
 * execution stays manual, same as the existing workshop RefundRequests flow.
 */
export async function createCancellationInvoice(
  orderId: string,
  reason?: string,
): Promise<{ id: string; cancellationNumber: string | null }> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  const order = await payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 1,
    overrideAccess: true,
  })
  const orderRecord = order as unknown as Record<string, unknown> & {
    invoiceNumber?: string | null
    paymentMethod?: string | null
    invoiceIssuedAt?: string | null
    createdAt?: string
  }

  const { buildOrderReceiptData } = await import('@/lib/buildOrderReceiptData')
  const receiptData = await buildOrderReceiptData(payload, orderRecord)

  const originalSeries: 'MAN' | 'WEB' = orderRecord.paymentMethod === 'manual' ? 'MAN' : 'WEB'
  const clientName = `${receiptData.customerFirstName} ${receiptData.customerLastName}`.trim()

  const created = await payload.create({
    collection: 'cancellation-invoices',
    data: {
      order: orderId,
      originalInvoiceNumber: orderRecord.invoiceNumber ?? '',
      originalSeries,
      originalIssueDate: orderRecord.invoiceIssuedAt ?? orderRecord.createdAt ?? new Date().toISOString(),
      reason,
      clientName,
      clientAddress: receiptData.shippingAddress,
      items: receiptData.items.map((i) => ({
        title: i.title,
        quantity: i.qty,
        unitPriceCents: i.unitPrice,
      })),
      totalCents: receiptData.totalCents,
      refundStatus: 'offen',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    overrideAccess: true,
  })

  const cancellation = created as unknown as { id: string; cancellationNumber?: string | null }
  return { id: String(cancellation.id), cancellationNumber: cancellation.cancellationNumber ?? null }
}

/** Updates the Erstattung/Verrechnung status on a Stornorechnung after the founder has actually issued the refund. */
export async function updateCancellationRefundStatus(
  cancellationId: string,
  params: {
    refundStatus: 'offen' | 'erstattet' | 'verrechnet'
    refundDate?: string
    refundMethodOrReference?: string
  },
): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)
  await payload.update({
    collection: 'cancellation-invoices',
    id: cancellationId,
    data: {
      refundStatus: params.refundStatus,
      ...(params.refundDate ? { refundDate: params.refundDate } : {}),
      ...(params.refundMethodOrReference ? { refundMethodOrReference: params.refundMethodOrReference } : {}),
    },
    overrideAccess: true,
  })
}

/**
 * Best-effort Stornorechnung for a single refunded seat. Deliberately NOT
 * the same path as createCancellationInvoice(orderId) — that snapshots the
 * ENTIRE order via buildOrderReceiptData, which would overstate the
 * cancelled amount whenever the refund is for one seat/item out of a larger
 * or mixed order. This creates a single line item for exactly the seat's
 * requestedAmount instead. Silently skipped if the booking has no orderId
 * (very old bookings predating that link) or the order can't be found.
 */
async function createCancellationInvoiceForRefundRequest(
  payload: Payload,
  refundRequest: Record<string, unknown>,
): Promise<void> {
  const bookingRef = refundRequest.booking
  const booking =
    typeof bookingRef === 'object' && bookingRef !== null
      ? (bookingRef as Record<string, unknown>)
      : ((await payload.findByID({
          collection: 'workshop-bookings',
          id: String(bookingRef),
          depth: 0,
          overrideAccess: true,
        })) as unknown as Record<string, unknown>)

  const orderId = booking.orderId as string | undefined
  if (!orderId) return

  const order = await payload
    .findByID({ collection: 'orders', id: orderId, depth: 0, overrideAccess: true })
    .catch(() => null)
  if (!order) return

  const orderRecord = order as unknown as {
    invoiceNumber?: string | null
    paymentMethod?: string | null
    invoiceIssuedAt?: string | null
    createdAt?: string
  }

  const originalSeries: 'MAN' | 'WEB' = orderRecord.paymentMethod === 'manual' ? 'MAN' : 'WEB'
  const requestedAmount = (refundRequest.requestedAmount as number) ?? 0
  const workshopTitle = (booking.workshopTitle as string) ?? 'Workshop'
  const clientName =
    [booking.firstName, booking.lastName].filter(Boolean).join(' ') || (booking.email as string) || ''

  await payload.create({
    collection: 'cancellation-invoices',
    data: {
      order: orderId,
      originalInvoiceNumber: orderRecord.invoiceNumber ?? '',
      originalSeries,
      originalIssueDate: orderRecord.invoiceIssuedAt ?? orderRecord.createdAt ?? new Date().toISOString(),
      reason: `Workshop-Rückerstattung: ${workshopTitle}`,
      clientName,
      items: [
        { title: `${workshopTitle} — Sitzplatz-Rückerstattung`, quantity: 1, unitPriceCents: requestedAmount },
      ],
      totalCents: requestedAmount,
      refundStatus: 'offen',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    overrideAccess: true,
  })
}

/**
 * Cosmetic-only acknowledgment (plan §8 step 5) — lets a founder mark "I've
 * submitted this in Stripe" so the Refunds queue reflects what they've
 * actioned vs. not yet looked at. NOT authoritative: the charge.refunded
 * webhook is what actually moves a row to 'completed', regardless of
 * whether anyone clicked this first.
 *
 * On the FIRST acknowledgment (status was 'requested') this also generates
 * a seat-scoped Stornorechnung, so workshop refunds get the same invoicing
 * paperwork as shop-product cancellations. Guarded to first-time only so a
 * repeat click can't create duplicate Stornorechnungen.
 */
export async function acknowledgeRefundRequest(refundRequestId: string): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  const existing = await payload.findByID({
    collection: 'refund-requests',
    id: refundRequestId,
    depth: 1,
    overrideAccess: true,
  })
  const wasFirstAcknowledgment = existing.status === 'requested'

  await payload.update({
    collection: 'refund-requests',
    id: refundRequestId,
    data: { status: 'acknowledged', acknowledgedAt: new Date().toISOString() },
    overrideAccess: true,
  })

  if (wasFirstAcknowledgment) {
    try {
      await createCancellationInvoiceForRefundRequest(payload, existing as unknown as Record<string, unknown>)
    } catch (err) {
      payload.logger.error(
        `[acknowledgeRefundRequest] Failed to create Stornorechnung: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }
}

/** Marks specific activity-events as read by the current admin user. */
export async function markActivityEventsRead(eventIds: string[]): Promise<void> {
  if (eventIds.length === 0) return
  const payload = await getPayload({ config: configPromise })
  const user = await requireAdmin(payload)

  // Sequential — MongoDB Atlas M0 has no multi-document transactions.
  for (const id of eventIds) {
    const event = await payload.findByID({ collection: 'activity-events', id, overrideAccess: true })
    const readBy = (Array.isArray(event.readBy) ? event.readBy : []).map((r) =>
      typeof r === 'object' && r !== null ? r.id : r,
    )
    if (readBy.includes(user.id)) continue
    await payload.update({
      collection: 'activity-events',
      id,
      data: { readBy: [...readBy, user.id] },
      overrideAccess: true,
    })
  }
}

/** Marks every currently-unread activity-event as read by the current admin user. */
export async function markAllActivityEventsRead(): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  const user = await requireAdmin(payload)

  const recent = await payload.find({
    collection: 'activity-events',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  for (const event of recent.docs) {
    const readBy = (Array.isArray(event.readBy) ? event.readBy : []).map((r) =>
      typeof r === 'object' && r !== null ? r.id : r,
    )
    if (readBy.includes(user.id)) continue
    await payload.update({
      collection: 'activity-events',
      id: event.id,
      data: { readBy: [...readBy, user.id] },
      overrideAccess: true,
    })
  }
}
