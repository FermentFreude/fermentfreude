import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type {
  ActivityEventRow,
  AppointmentRow,
  BookingRow,
  PickupItem,
  PickupOrderRow,
  ParticipantRow,
  RefundRequestRow,
  RosterData,
  RosterStats,
  SeatEntry,
  VoucherRow,
} from './types'

/** Extract plain text from a Lexical rich-text JSON node (recursive). */
function lexicalToPlainText(value: unknown): string {
  if (!value || typeof value !== 'object') return typeof value === 'string' ? value : ''
  const node = value as Record<string, unknown>
  if (typeof node.text === 'string') return node.text
  if (node.root) return lexicalToPlainText(node.root)
  if (Array.isArray(node.children)) {
    return (node.children as unknown[]).map(lexicalToPlainText).filter(Boolean).join(' ')
  }
  return ''
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Vienna',
  })
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Vienna',
  })
}

export async function fetchRosterData(currentUserId?: string): Promise<RosterData> {
  const payload = await getPayload({ config: configPromise })
  const now = new Date()
  const since = new Date()
  since.setDate(since.getDate() - 14)

  // ── 1. Appointments (from 14 days ago onward) ──────────────────────────────
  const apptResult = await payload.find({
    collection: 'workshop-appointments',
    where: { dateTime: { greater_than_equal: since.toISOString() } },
    sort: 'dateTime',
    limit: 200,
    depth: 2,
    overrideAccess: true,
  })

  // ── 2. Confirmed bookings per appointment (sequential — M0) ───────────────
  const appointments: AppointmentRow[] = []
  const bookingsByAppointment: Record<string, BookingRow[]> = {}

  for (const appt of apptResult.docs) {
    const workshop = typeof appt.workshop === 'object' ? appt.workshop : null
    const location = typeof appt.location === 'object' ? appt.location : null
    const workshopAny = workshop as Record<string, unknown> | null
    const locationAny = location as Record<string, unknown> | null

    const title = String(workshopAny?.title ?? 'Workshop')
    const description = lexicalToPlainText(workshopAny?.description)
    const pricePerPerson = Number(workshopAny?.basePrice ?? 0)
    const locationName = String(locationAny?.name ?? '')
    const dateTimeStr = String(appt.dateTime ?? '')
    const isPast = dateTimeStr ? new Date(dateTimeStr) < now : false

    const bResult = await payload.find({
      collection: 'workshop-bookings',
      where: {
        and: [
          { appointmentId: { equals: String(appt.id) } },
          { status: { equals: 'confirmed' } },
        ],
      },
      sort: 'createdAt',
      limit: 50,
      overrideAccess: true,
    })

    const totalBooked = bResult.docs.reduce(
      (sum, b) => sum + (Number((b as unknown as { guestCount?: number }).guestCount) || 1),
      0,
    )
    const capacity = totalBooked + (appt.availableSpots ?? 0)

    appointments.push({
      id: String(appt.id),
      workshopTitle: title,
      workshopDescription: description,
      dateTime: dateTimeStr,
      date: dateTimeStr ? fmtDate(dateTimeStr) : '',
      time: dateTimeStr ? fmtTime(dateTimeStr) + ' Uhr' : '',
      locationName,
      pricePerPerson,
      totalBooked,
      capacity,
      isPast,
    })

    bookingsByAppointment[String(appt.id)] = bResult.docs.map((b) => {
      const bk = b as unknown as {
        firstName?: string
        lastName?: string
        email?: string
        phone?: string
        guestCount?: number
        notes?: string
        seats?: Array<{ recipientName?: string; giftNote?: string }>
        createdAt?: string
      }
      const seats: SeatEntry[] = (bk.seats ?? []).map((s) => ({
        recipientName: s.recipientName?.trim() ?? '',
        giftNote: s.giftNote?.trim() ?? '',
      }))
      return {
        id: String(b.id),
        firstName: bk.firstName ?? '',
        lastName: bk.lastName ?? '',
        email: bk.email ?? '',
        phone: bk.phone ?? '',
        guestCount: bk.guestCount ?? 1,
        notes: bk.notes?.trim() ?? '',
        seats,
        createdAt: bk.createdAt ?? '',
      } satisfies BookingRow
    })
  }

  // ── 3. Participants (all confirmed bookings, recent first) ─────────────────
  const allBookings = await payload.find({
    collection: 'workshop-bookings',
    where: { status: { equals: 'confirmed' } },
    sort: '-createdAt',
    limit: 500,
    overrideAccess: true,
  })

  const participants: ParticipantRow[] = allBookings.docs.map((b) => {
    const bk = b as unknown as {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      workshopTitle?: string
      createdAt?: string
      status?: string
    }
    const name = [bk.firstName, bk.lastName].filter(Boolean).join(' ') || bk.email || '—'
    return {
      name,
      email: bk.email ?? '',
      phone: bk.phone ?? '',
      workshopTitle: bk.workshopTitle ?? '',
      bookingDate: bk.createdAt
        ? new Date(bk.createdAt).toLocaleDateString('de-DE', { timeZone: 'Europe/Vienna' })
        : '',
      status: (bk.status as ParticipantRow['status']) ?? 'confirmed',
    }
  })

  // ── 4. Pickup orders ───────────────────────────────────────────────────────
  const pickupResult = await payload.find({
    collection: 'orders',
    where: { pickupDate: { not_equals: '' } },
    sort: '-createdAt',
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })

  const pickupOrders: PickupOrderRow[] = pickupResult.docs
    .filter((o) => {
      const od = o as unknown as { pickupDate?: string | null }
      return Boolean(od.pickupDate)
    })
    .map((o) => {
      const od = o as unknown as {
        invoiceNumber?: string
        createdAt?: string
        customerFirstName?: string
        customerLastName?: string
        customerEmail?: string
        customerPhone?: string
        items?: Array<{ product?: unknown; quantity?: number }>
        pickupDate?: string
        pickupTime?: string
        pickupLocation?: string
        pickupStatus?: string
        amount?: number
        customerDietSpecs?: string
      }

      const items: PickupItem[] = (od.items ?? []).map((item) => {
        const product = item.product as Record<string, unknown> | null | undefined
        return {
          title: String(product?.title ?? 'Produkt'),
          qty: item.quantity ?? 1,
          price: Number((product as Record<string, unknown> | null | undefined)?.price ?? 0),
        }
      })

      return {
        id: String(o.id),
        invoiceNumber: od.invoiceNumber ?? String(o.id).slice(-6).toUpperCase(),
        createdAt: od.createdAt
          ? new Date(od.createdAt).toLocaleDateString('de-DE', { timeZone: 'Europe/Vienna' })
          : '',
        customerFirstName: od.customerFirstName ?? '',
        customerLastName: od.customerLastName ?? '',
        email: od.customerEmail ?? '',
        phone: od.customerPhone ?? '',
        items,
        pickupDate: od.pickupDate ?? '',
        pickupTime: od.pickupTime ?? '',
        pickupLocation: od.pickupLocation ?? '',
        pickupStatus: (od.pickupStatus as PickupOrderRow['pickupStatus']) ?? 'pending',
        totalAmount: (od.amount ?? 0) / 100,
        notes: od.customerDietSpecs ?? '',
      } satisfies PickupOrderRow
    })

  // ── 5. Vouchers ────────────────────────────────────────────────────────────
  const voucherResult = await payload.find({
    collection: 'vouchers',
    sort: '-createdAt',
    limit: 500,
    overrideAccess: true,
  })

  const vouchers: VoucherRow[] = voucherResult.docs.map((v) => {
    const vd = v as unknown as {
      code?: string
      value?: number
      status?: string
      purchaserName?: string
      purchaserEmail?: string
      recipientName?: string
      recipientEmail?: string
      personalNote?: string
      deliveryMethod?: string
      redeemedOn?: string
      redeemedForWorkshop?: string
      invoiceNumber?: string
      createdAt?: string
    }
    return {
      id: String(v.id),
      code: vd.code ?? '',
      value: vd.value ?? 0,
      status: (vd.status as VoucherRow['status']) ?? 'active',
      purchaserName: vd.purchaserName ?? '',
      purchaserEmail: vd.purchaserEmail ?? '',
      recipientName: vd.recipientName ?? '',
      recipientEmail: vd.recipientEmail ?? '',
      personalNote: vd.personalNote ?? '',
      deliveryMethod: vd.deliveryMethod ?? '',
      redeemedOn: vd.redeemedOn
        ? new Date(vd.redeemedOn).toLocaleDateString('de-DE', { timeZone: 'Europe/Vienna' })
        : '',
      redeemedForWorkshop: vd.redeemedForWorkshop ?? '',
      invoiceNumber: vd.invoiceNumber ?? '',
      createdAt: vd.createdAt
        ? new Date(vd.createdAt).toLocaleDateString('de-DE', { timeZone: 'Europe/Vienna' })
        : '',
    } satisfies VoucherRow
  })

  // ── 5b. Refund requests (plan §10 — Refunds panel) ──────────────────────────
  const refundRequestsResult = await payload.find({
    collection: 'refund-requests',
    sort: 'requestedAt',
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })

  const refundRequests: RefundRequestRow[] = refundRequestsResult.docs.map((rr) => {
    const bookingDoc = typeof rr.booking === 'object' && rr.booking !== null ? rr.booking : null
    const requestedAtMs = rr.requestedAt ? new Date(rr.requestedAt).getTime() : now.getTime()
    const daysPending = rr.status === 'completed' || rr.status === 'failed'
      ? 0
      : Math.max(0, Math.floor((now.getTime() - requestedAtMs) / (1000 * 60 * 60 * 24)))

    return {
      id: String(rr.id),
      customerName: [bookingDoc?.firstName, bookingDoc?.lastName].filter(Boolean).join(' '),
      customerEmail: bookingDoc?.email ?? '',
      workshopTitle: bookingDoc?.workshopTitle ?? '',
      workshopDate: bookingDoc?.date ?? '',
      seatIndex: rr.seatIndex ?? 0,
      amount: rr.requestedAmount ?? 0,
      status: (rr.status as RefundRequestRow['status']) ?? 'requested',
      stripePaymentIntentId: rr.stripePaymentIntentId ?? '',
      requestedAt: rr.requestedAt
        ? new Date(rr.requestedAt).toLocaleDateString('de-DE', { timeZone: 'Europe/Vienna' })
        : '',
      completedAt: rr.completedAt
        ? new Date(rr.completedAt).toLocaleDateString('de-DE', { timeZone: 'Europe/Vienna' })
        : '',
      daysPending,
    } satisfies RefundRequestRow
  })

  // ── 5c. Activity feed (plan §10 — Activity / Benachrichtigungen) ────────────
  const activityEventsResult = await payload.find({
    collection: 'activity-events',
    sort: '-createdAt',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const activityEvents: ActivityEventRow[] = activityEventsResult.docs.map((ev) => {
    const readByIds = (Array.isArray(ev.readBy) ? ev.readBy : []).map((r) =>
      typeof r === 'object' && r !== null ? r.id : r,
    )
    // With no known current user (e.g. the very first server-rendered paint
    // before the client's authenticated refresh lands), treat as unread — an
    // overstated badge for a fraction of a second is the safe direction, a
    // missed notification is not.
    const isUnread = currentUserId ? !readByIds.includes(currentUserId) : true

    return {
      id: String(ev.id),
      type: ev.type,
      refId: ev.refId ?? '',
      summary: ev.summary,
      createdAt: ev.createdAt
        ? new Date(ev.createdAt).toLocaleString('de-DE', { timeZone: 'Europe/Vienna' })
        : '',
      isUnread,
    } satisfies ActivityEventRow
  })
  const activityUnreadCount = activityEvents.filter((e) => e.isUnread).length

  // ── 6. Stats ───────────────────────────────────────────────────────────────
  const upcomingWorkshops = appointments.filter((a) => !a.isPast).length
  const totalParticipants = Object.values(bookingsByAppointment).reduce(
    (sum, bookings) => sum + bookings.reduce((s, b) => s + b.guestCount, 0),
    0,
  )
  const openPickups = pickupOrders.filter(
    (o) => o.pickupStatus === 'pending' || o.pickupStatus === 'ready',
  ).length
  const workshopRevenue = Object.values(bookingsByAppointment)
    .flat()
    .reduce((sum, b) => sum + b.guestCount * (appointments.find((a) =>
      bookingsByAppointment[a.id]?.some((bk) => bk.id === b.id)
    )?.pricePerPerson ?? 0), 0)

  const stats: RosterStats = {
    upcomingWorkshops,
    totalParticipants,
    openPickups,
    workshopRevenue,
  }

  return {
    stats,
    appointments,
    bookingsByAppointment,
    participants,
    pickupOrders,
    vouchers,
    refundRequests,
    activityEvents,
    activityUnreadCount,
  }
}
