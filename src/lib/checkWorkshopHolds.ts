import type { CartWorkshopLine } from '@/lib/workshopHolds'

/* ═══════════════════════════════════════════════════════════════
 *  Browser side of the "final check at the door".
 *
 *  Asks the server whether every workshop in this browser's basket still
 *  has its seats held (re-holding them if the hold ran out and seats are
 *  free), then brings localStorage's `workshopBookings` — which the cart
 *  and checkout use to show date/time and to release seats on remove —
 *  in line with what the server says.
 *
 *  Returns null if the check couldn't run (no cart, network error). The
 *  server re-checks on payment anyway (requireWorkshopSeatsHeld), so
 *  callers may continue in that case.
 * ═══════════════════════════════════════════════════════════════ */

export type { CartWorkshopLine }

type StoredBooking = Record<string, unknown> & {
  appointmentId?: string
  bookingId?: string | null
  workshopSlug?: string
}

function readStoredBookings(): Record<string, StoredBooking> {
  try {
    return JSON.parse(localStorage.getItem('workshopBookings') || '{}')
  } catch {
    return {}
  }
}

export async function checkWorkshopHolds(): Promise<{
  allHeld: boolean
  lines: CartWorkshopLine[]
  unavailable: CartWorkshopLine[]
} | null> {
  if (typeof window === 'undefined') return null
  const cartId = localStorage.getItem('cart')
  if (!cartId) return null

  const stored = readStoredBookings()
  const bookingIds = Object.values(stored)
    .map((b) => b.bookingId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)

  let data: { success?: boolean; allHeld?: boolean; lines?: CartWorkshopLine[] }
  try {
    const res = await fetch('/api/cart/check-workshops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId, bookingIds }),
    })
    data = await res.json()
    if (!res.ok || !data.success || !Array.isArray(data.lines)) return null
  } catch {
    return null
  }

  const lines = data.lines!
  for (const line of lines) {
    if (!line.appointmentId) continue
    if (line.status === 'held' && line.booking) {
      const previous = stored[line.appointmentId] ?? {}
      stored[line.appointmentId] = {
        ...previous,
        appointmentId: line.appointmentId,
        bookingId: line.booking.id,
        workshopSlug: line.workshopSlug,
        pageSlug: previous.pageSlug ?? line.workshopSlug,
        workshopTitle: line.booking.workshopTitle,
        guestCount: line.booking.guestCount,
        date: line.booking.date,
        time: line.booking.time,
        pricePerPerson: line.booking.pricePerPerson,
        totalPrice: line.booking.totalPrice,
        locationName: previous.locationName ?? line.booking.locationName,
        locationAddress: previous.locationAddress ?? line.booking.locationAddress,
        timestamp: Date.now(),
      }
    } else if (line.status === 'unavailable') {
      delete stored[line.appointmentId]
    }
  }
  try {
    localStorage.setItem('workshopBookings', JSON.stringify(stored))
  } catch {
    // storage full / blocked — display falls back to cart data
  }

  const unavailable = lines.filter((line) => line.status === 'unavailable')
  return { allHeld: unavailable.length === 0, lines, unavailable }
}

/**
 * Give a basket line's held seats back (customer removed it). The server
 * decides how many seats that is — see /api/cart/release-spots.
 */
export async function releaseWorkshopLine(params: {
  appointmentId?: string | null
  bookingId?: string | null
}): Promise<void> {
  const cartId = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
  if (!params.bookingId && !(cartId && params.appointmentId)) return
  await fetch('/api/cart/release-spots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(cartId ? { cartId } : {}),
      ...(params.appointmentId ? { appointmentId: params.appointmentId } : {}),
      ...(params.bookingId ? { bookingId: params.bookingId } : {}),
    }),
  })
}
