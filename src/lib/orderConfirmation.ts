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

const isMediaDoc = (m: unknown): m is MediaType =>
  typeof m === 'object' && m !== null && 'url' in (m as object) && Boolean((m as MediaType).url)

/**
 * A picture for a workshop that always resolves to a real image when one exists anywhere:
 *   1. the workshop's own `image` (when it points at a picture that still exists),
 *   2. the first photo of the workshop's shop product (`workshop-<slug>`),
 *   3. a general studio photo.
 * (On production the `image` of Tempeh/Lakto/Kombucha points at a picture record that no
 * longer exists, so the page used to show an empty grey box.)
 */
async function workshopPicture(
  payload: Payload,
  slug: string,
  own: unknown,
  studio: MediaType | null,
): Promise<MediaType | null> {
  if (isMediaDoc(own)) return own
  try {
    const prod = await payload.find({
      collection: 'products',
      where: { slug: { equals: `workshop-${slug}` } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })
    const first = (prod.docs[0] as { gallery?: { image?: unknown }[] } | undefined)?.gallery?.[0]
      ?.image
    if (isMediaDoc(first)) return first
  } catch {
    // fall through to the studio photo
  }
  return studio
}

async function studioPhoto(payload: Payload): Promise<MediaType | null> {
  try {
    const r = await payload.find({
      collection: 'media',
      where: { filename: { equals: 'home-showcase-bg-workshops-studio.webp' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    return isMediaDoc(r.docs[0]) ? (r.docs[0] as MediaType) : null
  } catch {
    return null
  }
}

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
  /**
   * What was actually charged, taken from the Order rather than summed from
   * the line items — so vouchers and any discount are reflected instead of a
   * client-side total that quietly disagrees with the customer's card
   * statement. Null when the order could not be read.
   */
  total: number | null
  currency: string | null
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
    total: null,
    currency: null,
  }

  // Pickup location + the Google Appointment Schedule booking link come from a
  // global, not from the order — so they are resolved up front, before (and
  // independently of) the order lookup below. Keeping this inside that lookup's
  // try block meant a single failing order fetch also silently swallowed the
  // booking link, leaving the customer on a confirmation page with no way to
  // book their pickup slot at all.
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
      // ignore — hardcoded fallbacks above are used
    }
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
      data.total = typeof orderData.amount === 'number' ? orderData.amount : null
      data.currency = typeof orderData.currency === 'string' ? orderData.currency : null
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
              data.workshopImage = await workshopPicture(
                payload,
                workshopSlug,
                (wsResult.docs[0] as { image?: unknown } | undefined)?.image,
                await studioPhoto(payload),
              )
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
        const studio = await studioPhoto(payload)
        data.otherWorkshops = await Promise.all(
          others.docs.map(async (w) => {
            const slug = String((w as { slug?: string }).slug ?? '')
            return {
              slug,
              title: String((w as { title?: string }).title ?? ''),
              image: await workshopPicture(payload, slug, (w as { image?: unknown }).image, studio),
            }
          }),
        )
      } catch {
        // ignore — the "explore more" section just won't render
      }
    }
  } catch (error) {
    console.error('Failed to fetch order confirmation data:', error)
  }

  return data
}
