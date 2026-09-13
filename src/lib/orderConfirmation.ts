import type { Media as MediaType, Product, Variant } from '@/payload-types'
import type { Payload } from 'payload'

/**
 * Shared data-fetching for /checkout/order-confirmation (guest) and
 * /account/order-confirmation (logged-in) — both pages render the same order,
 * just with different audience-appropriate CTAs/copy. This used to be
 * duplicated per-page and drifted (the account page never got workshop
 * images or product line items added when the checkout page did) — one
 * fetch, reused by both, so that can't happen again.
 */

export type BookingSummary = {
  workshopTitle: string
  workshopSlug: string
  date: string
  time: string
  guestCount: number
  location: string
}

export type OrderConfirmationItem = {
  id: string
  product: Product
  variant?: Variant
  quantity: number
}

export type OrderConfirmationData = {
  downloadToken: string | null
  isPickupOrder: boolean
  pickupLocationName: string
  pickupLocationAddress: string
  pickupBookingUrl: string
  bookingSummary: BookingSummary | null
  workshopImage: MediaType | string | null
  otherWorkshops: { slug: string; title: string; image: MediaType | string | null }[]
  manageBookingLinks: { workshopTitle: string; url: string }[]
  items: OrderConfirmationItem[]
}

/**
 * The confirmation page is reached by an immediate client-side redirect the
 * instant Stripe confirms payment — but the workshop booking it's confirming
 * (workshop-bookings row, its downloadToken, the manage-booking magic link)
 * is written by the Orders `afterChange` hook chain for that same order,
 * which for a redirect-based payment can still be finishing when this page's
 * very first request lands. A guest hitting reload half a second later sees
 * everything; the very first load can render a workshop confirmation with no
 * date, time, image, tickets, or manage-booking link at all — which reads as
 * "nothing happened," not "give it a second." Retry a few times with a short
 * delay before giving up, rather than rendering that empty page once.
 */
export async function getOrderConfirmationData(args: {
  payload: Payload
  orderId?: string
  type?: string
  locale: 'de' | 'en'
}): Promise<OrderConfirmationData> {
  const isWorkshop = args.type === 'workshop'
  const maxAttempts = isWorkshop ? 4 : 1

  let data = await fetchOrderConfirmationData(args)
  for (let attempt = 1; attempt < maxAttempts && !data.bookingSummary; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    data = await fetchOrderConfirmationData(args)
  }
  return data
}

async function fetchOrderConfirmationData({
  payload,
  orderId,
  type,
  locale,
}: {
  payload: Payload
  orderId?: string
  type?: string
  locale: 'de' | 'en'
}): Promise<OrderConfirmationData> {
  const isWorkshop = type === 'workshop'
  const isPickupOrder = type === 'order'

  const data: OrderConfirmationData = {
    downloadToken: null,
    isPickupOrder,
    pickupLocationName: 'Fermentfreude',
    pickupLocationAddress: 'Grabenstraße 15, 8010 Graz, Austria',
    pickupBookingUrl: '',
    bookingSummary: null,
    workshopImage: null,
    otherWorkshops: [],
    manageBookingLinks: [],
    items: [],
  }

  if (!orderId) return data

  try {
    // depth: 2 populates items[].product / items[].variant (needed for
    // line-item images) as well as the top-level scalar fields (downloadToken).
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 2,
      overrideAccess: true,
    })

    if (order && typeof order === 'object') {
      const orderData = order as unknown as Record<string, unknown>
      data.downloadToken = (orderData.downloadToken as string | null) ?? null
    }

    if (order?.items) {
      data.items = order.items.flatMap((item) => {
        if (!item.product || typeof item.product !== 'object') return []
        return [
          {
            id: item.id ?? item.product.id,
            product: item.product,
            variant: item.variant && typeof item.variant === 'object' ? item.variant : undefined,
            quantity: item.quantity,
          },
        ]
      })
    }

    // Resolve pickup location + the Google Appointment Schedule booking
    // link — only for physical-product orders
    if (isPickupOrder) {
      try {
        const settings = await payload.findGlobal({
          slug: 'product-pickup-settings',
          locale,
          depth: 0,
        })
        if (settings?.locationName) data.pickupLocationName = settings.locationName
        if (settings?.locationAddress) data.pickupLocationAddress = settings.locationAddress
        if (settings?.googleScheduleUrl) data.pickupBookingUrl = settings.googleScheduleUrl
      } catch {
        // ignore — fallback used
      }
    }

    // Resolve the manage-booking magic link(s) for workshop bookings on this
    // order — the same self-service "cancel or reschedule" link the
    // confirmation email includes. Best-effort: no link resolves just means
    // the CTA doesn't render, not a broken page.
    if (isWorkshop) {
      try {
        const bookings = await payload.find({
          collection: 'workshop-bookings',
          where: { and: [{ orderId: { equals: orderId } }, { status: { equals: 'confirmed' } }] },
          limit: 10,
          depth: 0,
          overrideAccess: true,
        })

        for (const booking of bookings.docs) {
          try {
            const links = await payload.find({
              collection: 'booking-magic-links',
              where: { bookingId: { equals: booking.id } },
              sort: '-issuedAt',
              limit: 1,
              depth: 0,
              overrideAccess: true,
            })
            const token = links.docs[0]?.token
            if (token) {
              data.manageBookingLinks.push({
                workshopTitle: String(
                  (booking as { workshopTitle?: string }).workshopTitle ?? 'Workshop',
                ),
                url: `/manage-booking/${token}`,
              })
            }
          } catch {
            // ignore — this booking just won't get a manage link
          }
        }

        // Use the first confirmed booking to build the summary card + hero image.
        const first = bookings.docs[0] as unknown as Record<string, unknown> | undefined
        if (first) {
          let location = ''
          if (first.appointmentId) {
            try {
              const appointment = await payload.findByID({
                collection: 'workshop-appointments',
                id: first.appointmentId as string,
                depth: 1,
                overrideAccess: true,
              })
              const loc = (appointment as { location?: unknown } | null)?.location
              if (typeof loc === 'object' && loc !== null) {
                const l = loc as { name?: string; address?: string }
                location = [l.name, l.address].filter(Boolean).join(', ')
              } else if (typeof loc === 'string') {
                location = loc
              }
            } catch {
              // ignore — location is best-effort
            }
          }

          const workshopSlug = String(first.workshopSlug ?? '')
          data.bookingSummary = {
            workshopTitle: String(first.workshopTitle ?? 'Workshop'),
            workshopSlug,
            date: String(first.date ?? ''),
            time: String(first.time ?? ''),
            guestCount: typeof first.guestCount === 'number' ? first.guestCount : 1,
            location,
          }

          if (workshopSlug) {
            try {
              const wsResult = await payload.find({
                collection: 'workshops',
                where: { slug: { equals: workshopSlug } },
                limit: 1,
                depth: 1,
                overrideAccess: true,
              })
              data.workshopImage =
                (wsResult.docs[0] as { image?: MediaType | string } | undefined)?.image ?? null
            } catch {
              // ignore — falls back to no hero image
            }
          }
        }
      } catch {
        // ignore — manage-booking links are best-effort
      }

      // A few other active workshops to explore next.
      try {
        const others = await payload.find({
          collection: 'workshops',
          where: {
            and: [
              { isActive: { equals: true } },
              ...(data.bookingSummary?.workshopSlug
                ? [{ slug: { not_equals: data.bookingSummary.workshopSlug } }]
                : []),
            ],
          },
          limit: 3,
          depth: 1,
          overrideAccess: true,
        })
        data.otherWorkshops = others.docs.map((w) => ({
          slug: String((w as { slug?: string }).slug ?? ''),
          title: String((w as { title?: string }).title ?? ''),
          image: (w as { image?: MediaType | string }).image ?? null,
        }))
      } catch {
        // ignore — the "explore more" section just won't render
      }
    }
  } catch (error) {
    console.error('Failed to fetch order confirmation data:', error)
  }

  return data
}
