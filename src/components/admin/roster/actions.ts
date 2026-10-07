'use server'

import { randomUUID } from 'crypto'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { releaseSpotsAtomic, reserveSpotsAtomic } from '@/lib/atomicSpots'
import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
import { addBookingHistory, BOOKING_HISTORY_TYPES, emailOutcome } from '@/lib/bookingHistory'
import { seatsHoldingPlace } from '@/lib/seatCapacity'
import { isValidEmail } from '@/lib/workshopSeats'
import { getServerSideURL } from '@/utilities/getURL'
import { fmtDate, fmtTime, toBookingRow } from './fetchRosterData'
import type { BookingRow } from './types'

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

/** How an admin is named in a booking's history. */
function adminName(user: { email?: string | null; name?: unknown }): string {
  return (typeof user.name === 'string' && user.name.trim()) || user.email || 'Admin'
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
  const user = await requireAdmin(payload)

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
    await addBookingHistory(payload, String(created.id), {
      type: 'created_manual',
      summary: `Manuell hinzugefügt · ${params.guestCount} ${params.guestCount === 1 ? 'Platz' : 'Plätze'} · keine Bestätigungs-E-Mail${params.email?.trim() ? '' : ' · keine E-Mail hinterlegt'}`,
      by: adminName(user),
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
 * Deletes a manually-created workshop booking (e.g. a placeholder seat held
 * for someone deciding whether to rebook) and releases its atomic spot back
 * — the exact counter this whole class of bug (see decrementInventory /
 * moveWorkshopBooking comments) is about keeping in sync.
 *
 * Deliberately refuses to delete a booking with a real orderId/cartSlug —
 * that's a paid order; deleting it here would destroy the customer's record
 * of what they paid for with no refund, invoice, or email trail. Only
 * bookings created through createManualWorkshopBooking above (no order
 * behind them) ever qualify.
 */
export async function deleteManualWorkshopBooking(bookingId: string): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  const booking = await payload.findByID({
    collection: 'workshop-bookings',
    id: bookingId,
    depth: 0,
    overrideAccess: true,
  })

  if (booking.orderId || booking.cartSlug) {
    throw new Error(
      'Diese Buchung gehört zu einer echten Bestellung und kann hier nicht gelöscht werden.',
    )
  }

  if (booking.appointmentId) {
    try {
      const appointment = await payload.findByID({
        collection: 'workshop-appointments',
        id: booking.appointmentId,
        depth: 1,
        overrideAccess: true,
      })
      const workshop = appointment.workshop
      const maxCapacity =
        typeof workshop === 'object' && workshop !== null ? Number(workshop.maxCapacityPerSlot ?? 12) : 12
      // Only seats still on the date — rebooked/cancelled seats already gave theirs back.
      const holding = seatsHoldingPlace(booking)
      if (holding > 0) await releaseSpotsAtomic(payload, booking.appointmentId, holding, maxCapacity)
    } catch (err) {
      payload.logger.error(
        `[deleteManualWorkshopBooking] Booking ${bookingId} will be deleted, but releasing its spot failed: ${err instanceof Error ? err.message : err}`,
      )
    }
  }

  await payload.delete({
    collection: 'workshop-bookings',
    id: bookingId,
    overrideAccess: true,
  })
}

/**
 * Edits the name and dietary/notes text for one seat on a booking — the
 * buyer (seatIndex 0, stored as firstName/lastName + notes on the booking
 * itself) or a companion seat (seatIndex > 0, stored as recipientName +
 * giftNote inside that seat's entry in the seats array).
 *
 * Email: seat 0 edits the booking's buyer email (e.g. a manual booking added
 * without one); any other seat edits that guest's own email. Either one gets
 * the 2-day workshop reminder. Empty clears it.
 *
 * Deliberately name + notes + email ONLY — no guestCount, date, or anything
 * with a capacity implication. None of these affect the atomic spot counter,
 * so this is safe on ANY booking, real order or manual placeholder alike,
 * unlike delete which must stay restricted to manual-only bookings.
 */
export async function updateBookingSeatDetails(params: {
  bookingId: string
  seatIndex: number
  name: string
  notes: string
  email: string
}): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  const user = await requireAdmin(payload)

  const booking = await payload.findByID({
    collection: 'workshop-bookings',
    id: params.bookingId,
    depth: 0,
    overrideAccess: true,
  })

  const name = params.name.trim()
  const notes = params.notes.trim()

  const email = params.email.trim()
  if (email && !isValidEmail(email)) {
    throw new Error('Bitte eine gültige E-Mail-Adresse angeben.')
  }

  const previousEmail =
    (params.seatIndex === 0 ? booking.email : booking.seats?.[params.seatIndex]?.email)?.trim() ?? ''
  const recordEmailChange = async () => {
    if (previousEmail.toLowerCase() === email.toLowerCase()) return
    await addBookingHistory(payload, params.bookingId, {
      type: 'email_changed',
      summary: `Platz ${params.seatIndex + 1}: E-Mail ${previousEmail || '(leer)'} → ${email || '(leer)'}`,
      by: adminName(user),
    })
  }

  if (params.seatIndex === 0) {
    // Only re-split the name when it was actually changed — otherwise saving
    // just an email would turn "Anna Maria" + "Müller" into "Anna" + "Maria Müller".
    const currentName = [booking.firstName, booking.lastName].filter(Boolean).join(' ').trim()
    const [firstName, ...rest] = name.split(' ')
    const nameData = name === currentName ? {} : { firstName: firstName ?? '', lastName: rest.join(' ') }
    await payload.update({
      collection: 'workshop-bookings',
      id: params.bookingId,
      data: {
        ...nameData,
        notes,
        email: email || null,
      },
      overrideAccess: true,
    })
    await recordEmailChange()
    return
  }

  const seats = Array.isArray(booking.seats) ? [...booking.seats] : []
  while (seats.length <= params.seatIndex) {
    seats.push({ seatStatus: 'active' })
  }
  seats[params.seatIndex] = {
    ...seats[params.seatIndex],
    recipientName: name,
    email: email || null,
    giftNote: notes,
  }

  await payload.update({
    collection: 'workshop-bookings',
    id: params.bookingId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { seats } as any,
    overrideAccess: true,
  })
  await recordEmailChange()
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
    const totalBooked = bookings.docs.reduce((sum, b) => sum + seatsHoldingPlace(b), 0)
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
  /** Only when the admin ticks the box — e.g. not when the move was already agreed by phone. */
  notifyCustomer: boolean
}): Promise<{ id: string; emailSent: boolean | null }> {
  const payload = await getPayload({ config: configPromise })
  const user = await requireAdmin(payload)

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
  // Only the seats still on this date move — a seat the customer already
  // rebooked or cancelled has nothing to take along.
  const guestCount = seatsHoldingPlace(booking)
  if (guestCount === 0) {
    throw new Error('Alle Plätze dieser Buchung wurden bereits umgebucht oder storniert — es gibt nichts zu verschieben.')
  }

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

  const newDateTimeStr = String(newAppointment.dateTime ?? '')
  const newDate = newDateTimeStr ? fmtDate(newDateTimeStr) : ''
  const newTime = newDateTimeStr ? `${fmtTime(newDateTimeStr)} Uhr` : ''
  const fromTo = `Verschoben von ${booking.date} · ${booking.time} auf ${newDate} · ${newTime}`

  // null = admin chose not to email; true/false = email attempted
  let emailSent: boolean | null = null
  if (params.notifyCustomer && booking.email) {
    // Fresh "Buchung verwalten" link for the email, same as a customer's own rebooking gets.
    let manageUrl = `${getServerSideURL().replace(/\/$/, '')}/account/orders`
    try {
      const link = await payload.create({
        collection: 'booking-magic-links',
        data: {
          token: randomUUID(),
          bookingId: params.bookingId,
          scope: 'self-service',
          issuedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })
      manageUrl = `${getServerSideURL().replace(/\/$/, '')}/manage-booking/${link.token}`
    } catch (err) {
      payload.logger.error(
        `[moveWorkshopBooking] Could not create manage link for ${params.bookingId}: ${err instanceof Error ? err.message : err}`,
      )
    }
    const result = await sendTemplateEmail({
      to: [{ email: booking.email, name: booking.firstName ?? undefined }],
      templateId: BREVO_TEMPLATES.CUSTOMER_REBOOKED,
      params: {
        FIRST_NAME: booking.firstName || 'Gast',
        WORKSHOP_TITLE: String(workshop.title ?? ''),
        OLD_WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
        NEW_WORKSHOP_TITLE: String(workshop.title ?? ''),
        OLD_DATE: String(booking.date ?? ''),
        OLD_TIME: String(booking.time ?? ''),
        NEW_DATE: newDate,
        NEW_TIME: newTime,
        MANAGE_URL: manageUrl,
      },
    })
    emailSent = result.success
  }

  await addBookingHistory(payload, params.bookingId, {
    type: 'moved',
    summary: params.notifyCustomer
      ? `${fromTo} · ${emailOutcome(booking.email, emailSent)}`
      : `${fromTo} · ohne E-Mail (bewusst nicht benachrichtigt)`,
    by: adminName(user),
  })

  return { id: params.bookingId, emailSent }
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
  const user = await requireAdmin(payload)

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
    const offered = `Ausweichtermin angeboten: ${newDate} · ${newTime}`
    if (!booking.email) {
      skippedNoEmail.push(name)
      await addBookingHistory(payload, bookingId, {
        type: 'alternate_offered',
        summary: `${offered} · nicht gesendet, keine E-Mail hinterlegt`,
        by: adminName(user),
      })
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

    await addBookingHistory(payload, bookingId, {
      type: 'alternate_offered',
      summary: `${offered} · ${emailOutcome(booking.email, result.success)}`,
      by: adminName(user),
    })
    if (result.success) {
      sent.push(name)
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

export type TimelineEntry = {
  id: string
  at: string
  type: string
  title: string
  summary: string
  by: string
  /** Which booking (= which date) this happened on — set for entries from an earlier booking. */
  fromEarlierBooking: string | null
}

/**
 * The full story of a booking, including the bookings it came from. A
 * customer's own rebooking creates a NEW booking, so moves and emails that
 * happened before live on the old one — this follows
 * seats[].rebookedFromBookingId back (max 10 steps) and merges everything,
 * newest first.
 */
export async function getBookingTimeline(bookingId: string): Promise<TimelineEntry[]> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  const labels = new Map<string, string>(BOOKING_HISTORY_TYPES.map((t) => [t.value, t.label]))
  const entries: TimelineEntry[] = []
  const seen = new Set<string>()
  let currentId: string | null = bookingId

  for (let step = 0; currentId && step < 10 && !seen.has(currentId); step++) {
    seen.add(currentId)
    let booking
    try {
      booking = await payload.findByID({ collection: 'workshop-bookings', id: currentId, depth: 0, overrideAccess: true })
    } catch {
      break
    }
    const earlier = step === 0 ? null : `${booking.date} · ${booking.time}`
    const history = booking.history ?? []
    for (const h of history) {
      entries.push({
        id: `${booking.id}-${h.id}`,
        at: h.at ?? '',
        type: h.type ?? '',
        title: labels.get(h.type ?? '') ?? 'Eintrag',
        summary: h.summary ?? '',
        by: h.by ?? '',
        fromEarlierBooking: earlier,
      })
    }
    // Bookings from before the history existed: still show when they were made.
    if (!history.some((h) => h.type?.startsWith('created_')) && booking.createdAt) {
      entries.push({
        id: `${booking.id}-created`,
        at: booking.createdAt,
        type: booking.orderId ? 'created_online' : 'created_manual',
        title: booking.orderId ? 'Online gebucht' : 'Buchung erstellt',
        summary: `${booking.orderId ? `Bestellung #${booking.orderId} · ` : ''}frühere Schritte wurden noch nicht aufgezeichnet`,
        by: '',
        fromEarlierBooking: earlier,
      })
    }
    currentId = booking.seats?.find((s) => s.rebookedFromBookingId)?.rebookedFromBookingId ?? null
  }

  return entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

export type OrderDetail = {
  id: string
  invoiceNumber: string
  status: string
  createdAt: string
  amount: number // cents
  customer: {
    name: string
    email: string
    phone: string
    hasAccount: boolean
    notes: string
    address: string
  }
  items: { title: string; quantity: number }[]
  payment: {
    method: string
    transactions: { status: string; amount: number; voucherCode: string; stripeUrl: string }[]
    referenceNote: string
  }
  pickup: { date: string; time: string; location: string; status: string } | null
  voucher: {
    code: string
    value: number
    status: string
    recipient: string
    delivery: string
    redeemed: boolean
    redeemedOn: string
  } | null
  bookings: BookingRow[]
}

/**
 * Everything about one order for the roster's order detail: who bought,
 * what (products, workshop seats, or a voucher), how it was paid, pickup,
 * and the bookings it created — each booking opens its own detail/Verlauf.
 */
export async function getOrderDetail(orderId: string): Promise<OrderDetail> {
  const payload = await getPayload({ config: configPromise })
  await requireAdmin(payload)

  const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 1, overrideAccess: true })
  const od = order as unknown as Record<string, unknown> & {
    items?: Array<{ product?: unknown; variant?: unknown; quantity?: number }>
    shippingAddress?: Record<string, unknown> | null
    purchasedVoucher?: unknown
    transactions?: unknown[]
  }
  const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  // Voucher bought with this order — linked on newer orders, matched by email/amount/time on older ones.
  const linkedVoucherId =
    typeof od.purchasedVoucher === 'object' && od.purchasedVoucher !== null
      ? (od.purchasedVoucher as { id: string }).id
      : (od.purchasedVoucher as string | undefined)
  let voucherDoc: Record<string, unknown> | null = null
  if (linkedVoucherId) {
    voucherDoc = (await payload.findByID({ collection: 'vouchers', id: linkedVoucherId, depth: 0, overrideAccess: true })) as unknown as Record<string, unknown>
  } else if ((od.items ?? []).length === 0 && text(od.customerEmail)) {
    const created = new Date(String(od.createdAt)).getTime()
    const candidates = await payload.find({
      collection: 'vouchers',
      where: {
        and: [
          { or: [{ origin: { equals: 'gift-purchase' } }, { origin: { exists: false } }] },
          { purchaserEmail: { equals: text(od.customerEmail) } },
        ],
      },
      limit: 20,
      depth: 0,
      overrideAccess: true,
    })
    voucherDoc =
      (candidates.docs.find(
        (v) =>
          Math.round(Number(v.value) * 100) === Number(od.amount) &&
          Math.abs(new Date(v.createdAt).getTime() - created) < 60 * 60 * 1000,
      ) as unknown as Record<string, unknown>) ?? null
  }

  const transactions = await payload.find({
    collection: 'transactions',
    where: { id: { in: (od.transactions ?? []).map((t) => (typeof t === 'object' && t !== null ? (t as { id: string }).id : String(t))) } },
    depth: 0,
    limit: 20,
    overrideAccess: true,
  })

  const bookings = await payload.find({
    collection: 'workshop-bookings',
    where: { orderId: { equals: String(order.id) } },
    depth: 0,
    limit: 20,
    overrideAccess: true,
  })

  const stripeTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ?? false
  const customer = typeof od.customer === 'object' && od.customer !== null ? (od.customer as Record<string, unknown>) : null
  const addr = od.shippingAddress ?? null
  const address = addr
    ? [text(addr.addressLine1), text(addr.addressLine2), [text(addr.postalCode), text(addr.city)].filter(Boolean).join(' '), text(addr.country)]
        .filter(Boolean)
        .join(', ')
    : ''

  return {
    id: String(order.id),
    invoiceNumber: text(od.invoiceNumber) || String(order.id).slice(-8).toUpperCase(),
    status: text(od.status),
    createdAt: String(od.createdAt ?? ''),
    amount: Number(od.amount ?? 0),
    customer: {
      name:
        [text(od.customerFirstName), text(od.customerLastName)].filter(Boolean).join(' ') ||
        text(od.customerName) ||
        text(customer?.name),
      email: text(od.customerEmail) || text(customer?.email),
      phone: text(od.customerPhone),
      hasAccount: customer !== null,
      notes: text(od.customerDietSpecs),
      address,
    },
    items: (od.items ?? []).map((item) => {
      const product = typeof item.product === 'object' && item.product !== null ? (item.product as Record<string, unknown>) : null
      const variant = typeof item.variant === 'object' && item.variant !== null ? (item.variant as Record<string, unknown>) : null
      return {
        title: [text(product?.title) || 'Produkt', text(variant?.title)].filter(Boolean).join(' · '),
        quantity: item.quantity ?? 1,
      }
    }),
    payment: {
      method: text(od.paymentMethod) || (transactions.docs.length > 0 ? 'stripe' : ''),
      referenceNote: text(od.referenceNote),
      transactions: transactions.docs.map((t) => {
        const tx = t as unknown as { status?: string; amount?: number; voucherCode?: string; stripe?: { paymentIntentID?: string } }
        const pi = tx.stripe?.paymentIntentID ?? ''
        return {
          status: tx.status ?? '',
          amount: tx.amount ?? 0,
          voucherCode: tx.voucherCode ?? '',
          // Staging runs on the Stripe test account — its payments live under /test
          stripeUrl: pi ? `https://dashboard.stripe.com${stripeTestMode ? '/test' : ''}/payments/${pi}` : '',
        }
      }),
    },
    pickup: text(od.pickupDate)
      ? { date: text(od.pickupDate), time: text(od.pickupTime), location: text(od.pickupLocation), status: text(od.pickupStatus) }
      : null,
    voucher: voucherDoc
      ? {
          code: text(voucherDoc.code),
          value: Number(voucherDoc.value ?? 0),
          status: text(voucherDoc.status),
          recipient: [text(voucherDoc.recipientName), text(voucherDoc.recipientEmail)].filter(Boolean).join(' · '),
          delivery: text(voucherDoc.deliveryMethod),
          redeemed: Boolean(voucherDoc.redeemed),
          redeemedOn: String(voucherDoc.redeemedOn ?? ''),
        }
      : null,
    bookings: bookings.docs.map((b) => toBookingRow(b)),
  }
}
