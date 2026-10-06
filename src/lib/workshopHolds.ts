import type { Payload } from 'payload'
import { revalidateTag } from 'next/cache'

import { releaseSpotsAtomic, reserveSpotsAtomic } from '@/lib/atomicSpots'
import type { WorkshopBooking } from '@/payload-types'

/* ═══════════════════════════════════════════════════════════════
 *  Workshop seat holds — the single source of truth.
 *
 *  A seat hold IS a `pending` workshop-booking. While a booking is
 *  pending, its guestCount is subtracted from the appointment's
 *  availableSpots. Every change to that counter goes through this file
 *  so a hold can only ever be released ONCE:
 *
 *    pending → cancelled   seats go back on sale (exactly once, see
 *                          cancelPendingBooking — guarded update on status)
 *    pending → confirmed   seats stay taken (paid)
 *
 *  Timeline for a customer:
 *    add to basket            hold until now + BASKET_HOLD_MINUTES
 *    open checkout / pay /    hold re-checked and extended to at least
 *    confirm Stripe payment   now + PAYMENT_HOLD_MINUTES (ensureCartWorkshopHolds)
 *    hold runs out            cleanupExpiredHolds cancels it, seats back on sale
 *    comes back later         ensureCartWorkshopHolds re-holds the seats if
 *                             still free, or reports the date as full
 *
 *  Raw Mongo (payload.db.collections) is used for the status flips
 *  because Payload's update() is read-then-write — two requests could
 *  both "cancel" the same booking and both give its seats back, which is
 *  exactly how phantom free seats appeared. Single-document atomic ops
 *  work on Atlas M0 (no multi-document transactions needed).
 *  workshop-bookings has no hooks, so bypassing Payload here skips nothing.
 * ═══════════════════════════════════════════════════════════════ */

export const BASKET_HOLD_MINUTES = 60
export const PAYMENT_HOLD_MINUTES = 30

const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60 * 1000)

const isObjectId = (id: unknown): id is string =>
  typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)

interface RawBooking {
  _id: unknown
  status?: string
  appointmentId?: string
  guestCount?: number
}

const bookingsModel = (payload: Payload) => payload.db.collections['workshop-bookings']

/** Pending bookings whose hold has run out. Bookings created before
 *  holdExpiresAt existed fall back to createdAt + BASKET_HOLD_MINUTES. */
function expiredHoldFilter(now: Date) {
  return {
    status: 'pending',
    $or: [
      { holdExpiresAt: { $lt: now } },
      {
        holdExpiresAt: null,
        createdAt: { $lt: new Date(now.getTime() - BASKET_HOLD_MINUTES * 60 * 1000) },
      },
    ],
  }
}

async function getMaxCapacity(payload: Payload, appointmentId: string): Promise<number | null> {
  try {
    const appt = await payload.findByID({
      collection: 'workshop-appointments',
      id: appointmentId,
      depth: 1,
      overrideAccess: true,
    })
    return typeof appt.workshop === 'object' && appt.workshop
      ? (appt.workshop.maxCapacityPerSlot ?? 12)
      : 12
  } catch {
    return null // appointment deleted — nothing to give seats back to
  }
}

function bustAppointmentCache() {
  try {
    revalidateTag('workshop-appointments')
  } catch {
    // Not in a request scope that allows revalidation — the overview's own
    // 2-minute revalidate window catches up.
  }
}

/**
 * Cancel a pending booking and give its seats back — at most once.
 * Returns the number of seats released (0 if the booking was no longer
 * pending, e.g. already cancelled by another request, or confirmed).
 */
export async function cancelPendingBooking(
  payload: Payload,
  bookingId: string,
  opts: { onlyIfExpired?: boolean } = {},
): Promise<number> {
  if (!isObjectId(bookingId)) return 0
  const now = new Date()
  const filter = opts.onlyIfExpired
    ? { _id: bookingId, ...expiredHoldFilter(now) }
    : { _id: bookingId, status: 'pending' }

  const before = (await bookingsModel(payload)
    .findOneAndUpdate(filter, { $set: { status: 'cancelled', updatedAt: now } }, { new: false })
    .lean()) as RawBooking | null
  if (!before) return 0

  const seats = typeof before.guestCount === 'number' ? before.guestCount : 0
  if (before.appointmentId && seats > 0) {
    const maxCapacity = await getMaxCapacity(payload, before.appointmentId)
    if (maxCapacity !== null) {
      await releaseSpotsAtomic(payload, before.appointmentId, seats, maxCapacity)
    }
  }
  bustAppointmentCache()
  return seats
}

/**
 * Remove `count` guests from a pending booking and give exactly those seats
 * back. Used to roll back a failed "add one more guest" merge. If that would
 * leave the booking empty, the whole booking is cancelled instead.
 */
export async function removeGuestsFromPendingBooking(
  payload: Payload,
  bookingId: string,
  count: number,
): Promise<number> {
  if (!isObjectId(bookingId) || count < 1) return 0
  const now = new Date()
  const before = (await bookingsModel(payload)
    .findOneAndUpdate(
      { _id: bookingId, status: 'pending', guestCount: { $gt: count } },
      [
        {
          $set: {
            guestCount: { $subtract: ['$guestCount', count] },
            totalPrice: { $multiply: ['$pricePerPerson', { $subtract: ['$guestCount', count] }] },
            updatedAt: now,
          },
        },
      ],
      { new: false },
    )
    .lean()) as RawBooking | null

  if (!before) return cancelPendingBooking(payload, bookingId)

  if (before.appointmentId) {
    const maxCapacity = await getMaxCapacity(payload, before.appointmentId)
    if (maxCapacity !== null) {
      await releaseSpotsAtomic(payload, before.appointmentId, count, maxCapacity)
    }
  }
  bustAppointmentCache()
  return count
}

/**
 * Keep a pending booking's seats for at least `minutes` more. Returns false
 * if the booking is no longer pending (its hold was already released).
 * Never shortens an existing hold.
 */
export async function extendHold(
  payload: Payload,
  bookingId: string,
  minutes: number,
): Promise<boolean> {
  if (!isObjectId(bookingId)) return false
  const result = await bookingsModel(payload).updateOne(
    { _id: bookingId, status: 'pending' },
    { $max: { holdExpiresAt: minutesFromNow(minutes) }, $set: { updatedAt: new Date() } },
  )
  return result.matchedCount > 0
}

/** Add guests to a pending booking (seats must already be reserved). */
export async function addGuestsToPendingBooking(
  payload: Payload,
  bookingId: string,
  count: number,
  holdMinutes: number,
): Promise<boolean> {
  if (!isObjectId(bookingId)) return false
  const result = await bookingsModel(payload).updateOne({ _id: bookingId, status: 'pending' }, [
    {
      $set: {
        guestCount: { $add: ['$guestCount', count] },
        totalPrice: { $multiply: ['$pricePerPerson', { $add: ['$guestCount', count] }] },
        holdExpiresAt: { $max: ['$holdExpiresAt', minutesFromNow(holdMinutes)] },
        updatedAt: new Date(),
      },
    },
  ])
  return result.matchedCount > 0
}

/**
 * Release every hold that has run out. Safe to call from anywhere, any
 * number of times in parallel — each booking is released at most once,
 * and a hold extended a moment ago no longer matches the expiry filter.
 */
export async function cleanupExpiredHolds(payload: Payload, limit = 25): Promise<number> {
  try {
    const expired = (await bookingsModel(payload)
      .find(expiredHoldFilter(new Date()))
      .select({ _id: 1 })
      .limit(limit)
      .lean()) as RawBooking[]

    let released = 0
    for (const doc of expired) {
      const seats = await cancelPendingBooking(payload, String(doc._id), { onlyIfExpired: true })
      if (seats > 0) released++
    }
    if (released > 0) {
      payload.logger.info(`[workshopHolds] Released ${released} expired seat hold(s)`)
    }
    return released
  } catch (err) {
    payload.logger.error(
      `[workshopHolds] Expired hold cleanup failed: ${err instanceof Error ? err.message : String(err)}`,
    )
    return 0
  }
}

/**
 * Reserve seats, and if the date looks full, release expired holds first
 * and try once more — seats from abandoned baskets count as free.
 */
export async function reserveSeats(
  payload: Payload,
  appointmentId: string,
  count: number,
): Promise<{ success: boolean; availableSpots?: number }> {
  const first = await reserveSpotsAtomic(payload, appointmentId, count)
  if (first.success) return first
  const freed = await cleanupExpiredHolds(payload)
  if (freed === 0) return first
  return reserveSpotsAtomic(payload, appointmentId, count)
}

/* ── Appointment details for a booking record ───────────────── */

export type AppointmentInfo = {
  appointmentId: string
  workshopSlug: string
  workshopTitle: string
  /** "25. Oktober 2026" — same format add-workshop has always stored */
  date: string
  /** "10:00" (Europe/Vienna) */
  time: string
  pricePerPerson: number
  locationName: string | null
  locationAddress: string | null
  /** Why this appointment can't take new bookings, if it can't. */
  unavailableReason: 'past' | 'unpublished' | null
}

export async function getAppointmentInfo(
  payload: Payload,
  appointmentId: string,
): Promise<AppointmentInfo | null> {
  try {
    const appt = await payload.findByID({
      collection: 'workshop-appointments',
      id: appointmentId,
      depth: 2,
      overrideAccess: true,
    })
    const workshop = typeof appt.workshop === 'object' ? appt.workshop : null
    if (!workshop) return null
    const location = typeof appt.location === 'object' && appt.location ? appt.location : null
    const dt = new Date(appt.dateTime)
    return {
      appointmentId,
      workshopSlug: String(workshop.slug ?? ''),
      workshopTitle: String(workshop.title ?? 'Workshop'),
      date: dt.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Vienna',
      }),
      time: dt.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Vienna',
      }),
      pricePerPerson: workshop.basePrice ?? 99,
      locationName: location?.name ?? null,
      locationAddress: location?.address ?? null,
      unavailableReason: !appt.isPublished ? 'unpublished' : dt < new Date() ? 'past' : null,
    }
  } catch {
    return null
  }
}

/**
 * Create a pending booking for seats that have ALREADY been reserved.
 * Customer details and per-seat guest names are carried over from the
 * customer's earlier (expired) booking for the same date, if there is one.
 */
export async function createHeldBooking(
  payload: Payload,
  params: {
    info: AppointmentInfo
    guestCount: number
    cartId: string | null
    holdMinutes: number
    copyFrom?: WorkshopBooking | null
  },
): Promise<WorkshopBooking> {
  const { info, guestCount, cartId, holdMinutes, copyFrom } = params
  const seats = (copyFrom?.seats ?? [])
    .slice(0, guestCount)
    .map(({ recipientName, giftNote }) => ({ recipientName, giftNote }))
  return payload.create({
    collection: 'workshop-bookings',
    data: {
      status: 'pending',
      workshopSlug: info.workshopSlug,
      appointmentId: info.appointmentId,
      workshopTitle: info.workshopTitle,
      date: info.date,
      time: info.time,
      guestCount,
      pricePerPerson: info.pricePerPerson,
      totalPrice: info.pricePerPerson * guestCount,
      holdExpiresAt: minutesFromNow(holdMinutes).toISOString(),
      ...(cartId ? { cartSlug: cartId } : {}),
      ...(seats.length > 0 ? { seats } : {}),
      ...(copyFrom?.firstName ? { firstName: copyFrom.firstName } : {}),
      ...(copyFrom?.lastName ? { lastName: copyFrom.lastName } : {}),
      ...(copyFrom?.email ? { email: copyFrom.email } : {}),
      ...(copyFrom?.phone ? { phone: copyFrom.phone } : {}),
      ...(copyFrom?.notes ? { notes: copyFrom.notes } : {}),
    },
    overrideAccess: true,
  })
}

/* ── Basket check ───────────────────────────────────────────── */

export type CartWorkshopLine = {
  itemId: string
  appointmentId: string | null
  workshopSlug: string
  quantity: number
  status: 'held' | 'unavailable'
  /** full = date sold out, past/unpublished = date gone, unknown = we can't tell which date this line is */
  reason?: 'full' | 'past' | 'unpublished' | 'unknown'
  availableSpots?: number
  booking?: {
    id: string
    workshopTitle: string
    date: string
    time: string
    guestCount: number
    pricePerPerson: number
    totalPrice: number
    locationName: string | null
    locationAddress: string | null
  }
}

type CartItemLike = {
  id?: string | null
  product?: string | { id?: string } | null
  quantity?: number | null
  a?: string | null
}

/**
 * The "final check at the door". For every workshop in the basket, make
 * sure its seats are actually held right now:
 *
 *  - still held → hold extended to at least now + holdMinutes
 *  - hold ran out but seats are free → seats held again (new pending booking)
 *  - hold ran out and the date is full / past → reported as unavailable
 *
 * Idempotent: calling it twice in a row never holds seats twice.
 */
export async function ensureCartWorkshopHolds(
  payload: Payload,
  cartId: string,
  opts: { holdMinutes?: number; adoptBookingIds?: string[] } = {},
): Promise<{ cartFound: boolean; lines: CartWorkshopLine[] }> {
  const holdMinutes = opts.holdMinutes ?? PAYMENT_HOLD_MINUTES

  let cart: { items?: CartItemLike[] | null; status?: string | null }
  try {
    cart = (await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 0,
      overrideAccess: true,
    })) as typeof cart
  } catch {
    return { cartFound: false, lines: [] }
  }
  const items = Array.isArray(cart.items) ? cart.items : []
  if (items.length === 0 || cart.status === 'purchased') return { cartFound: true, lines: [] }

  // Which basket lines are workshops?
  const productId = (item: CartItemLike) =>
    typeof item.product === 'object' ? item.product?.id : item.product
  const productIds = [...new Set(items.map(productId).filter((id): id is string => Boolean(id)))]
  const products = await payload.find({
    collection: 'products',
    where: { id: { in: productIds } },
    depth: 0,
    limit: productIds.length,
    overrideAccess: true,
  })
  const slugById = new Map(products.docs.map((p) => [String(p.id), String(p.slug ?? '')]))
  const workshopItems = items.filter((item) => {
    const id = productId(item)
    return id ? (slugById.get(id) ?? '').startsWith('workshop-') : false
  })
  if (workshopItems.length === 0) return { cartFound: true, lines: [] }

  // A booking created before this browser had a cart has no cartSlug until
  // /api/cart/link-booking runs. If that call failed, adopt the booking now
  // (only if it's unclaimed) instead of holding the same seats a second time.
  const adoptIds = (opts.adoptBookingIds ?? []).filter(isObjectId)
  if (adoptIds.length > 0) {
    await bookingsModel(payload).updateMany(
      { _id: { $in: adoptIds }, status: 'pending', $or: [{ cartSlug: null }, { cartSlug: '' }] },
      { $set: { cartSlug: cartId, updatedAt: new Date() } },
    )
  }

  const cartBookings = await payload.find({
    collection: 'workshop-bookings',
    where: { cartSlug: { equals: cartId } },
    sort: '-createdAt',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const lines: CartWorkshopLine[] = []
  for (const item of workshopItems) {
    const workshopSlug = (slugById.get(productId(item) ?? '') ?? '').replace(/^workshop-/, '')
    const quantity = item.quantity ?? 1
    const suffix = item.a ?? null
    const base = { itemId: String(item.id ?? ''), workshopSlug, quantity }

    // Every booking this basket ever had for this line (any status) —
    // newest first. The newest tells us which date the line is for.
    const history = cartBookings.docs.filter(
      (b) =>
        b.workshopSlug === workshopSlug &&
        typeof b.appointmentId === 'string' &&
        (!suffix || b.appointmentId.endsWith(suffix)),
    )
    const appointmentId = history[0]?.appointmentId ?? null
    if (!appointmentId) {
      lines.push({ ...base, appointmentId: null, status: 'unavailable', reason: 'unknown' })
      continue
    }

    // Seats still held for this line — extend each hold. A failed extend
    // means the hold was released a moment ago; it then counts as not held.
    let held = 0
    let primary: WorkshopBooking | null = null
    for (const b of history) {
      if (b.appointmentId !== appointmentId || b.status !== 'pending') continue
      if (await extendHold(payload, String(b.id), holdMinutes)) {
        held += b.guestCount ?? 0
        primary ??= b
      }
    }

    const info = await getAppointmentInfo(payload, appointmentId)
    const bookingSummary = (b: WorkshopBooking, guestCount: number) => ({
      id: String(b.id),
      workshopTitle: String(b.workshopTitle ?? info?.workshopTitle ?? 'Workshop'),
      date: String(b.date ?? info?.date ?? ''),
      time: String(b.time ?? info?.time ?? ''),
      guestCount,
      pricePerPerson: b.pricePerPerson ?? info?.pricePerPerson ?? 0,
      totalPrice: (b.pricePerPerson ?? info?.pricePerPerson ?? 0) * guestCount,
      locationName: info?.locationName ?? null,
      locationAddress: info?.locationAddress ?? null,
    })

    const missing = quantity - held
    if (missing <= 0) {
      lines.push({
        ...base,
        appointmentId,
        status: 'held',
        ...(primary ? { booking: bookingSummary(primary, held) } : {}),
      })
      continue
    }

    // Some or all seats are no longer held — try to hold them again.
    if (!info) {
      lines.push({ ...base, appointmentId, status: 'unavailable', reason: 'unknown' })
      continue
    }
    if (info.unavailableReason) {
      lines.push({ ...base, appointmentId, status: 'unavailable', reason: info.unavailableReason })
      continue
    }

    const reserved = await reserveSeats(payload, appointmentId, missing)
    if (!reserved.success) {
      lines.push({
        ...base,
        appointmentId,
        status: 'unavailable',
        reason: 'full',
        availableSpots: (reserved.availableSpots ?? 0) + held,
      })
      continue
    }
    bustAppointmentCache()

    try {
      if (primary && (await addGuestsToPendingBooking(payload, String(primary.id), missing, holdMinutes))) {
        lines.push({
          ...base,
          appointmentId,
          status: 'held',
          booking: bookingSummary(primary, held + missing),
        })
      } else {
        const created = await createHeldBooking(payload, {
          info,
          guestCount: missing,
          cartId,
          holdMinutes,
          copyFrom: history[0],
        })
        lines.push({
          ...base,
          appointmentId,
          status: 'held',
          booking: bookingSummary(created, held + missing),
        })
      }
    } catch (err) {
      // Couldn't record the hold — give the seats straight back rather than
      // leaving them reserved with no booking to ever release them.
      const maxCapacity = await getMaxCapacity(payload, appointmentId)
      if (maxCapacity !== null) await releaseSpotsAtomic(payload, appointmentId, missing, maxCapacity)
      throw err
    }
  }

  return { cartFound: true, lines }
}

/**
 * Mark a booking as paid by `orderId` — only if its hold is still in place
 * (pending) or it is already confirmed for this same order (hook re-run).
 * Returns false if the hold was released in the meantime; the caller must
 * then re-reserve the seats, since they are back on sale.
 */
export async function claimBookingForOrder(
  payload: Payload,
  bookingId: string,
  orderId: string,
): Promise<boolean> {
  if (!isObjectId(bookingId)) return false
  const result = await bookingsModel(payload).updateOne(
    {
      _id: bookingId,
      $or: [{ status: 'pending' }, { status: 'confirmed', orderId }],
    },
    { $set: { status: 'confirmed', orderId, updatedAt: new Date() } },
  )
  return result.matchedCount > 0
}
