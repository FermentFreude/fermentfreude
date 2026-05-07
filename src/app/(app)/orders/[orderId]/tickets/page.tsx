import { accountI18n } from '@/app/(app)/account/i18n'
import { PrintTicketsButton } from '@/components/PrintTicketsButton'
import type { Order, WorkshopBooking } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { Calendar, Clock, MapPin, Ticket, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

export const metadata = {
  title: 'Workshop Tickets — FermentFreude',
  description: 'Your printable workshop tickets',
}

interface TicketsPageProps {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function WorkshopTicketsPage({ params, searchParams }: TicketsPageProps) {
  const { orderId } = await params
  const { token } = await searchParams
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  if (!orderId || !token) return notFound()

  const payload = await getPayload({ config: configPromise })

  // ── 1. Fetch and validate the order ──────────────────────────────────────
  let order: Order | null = null

  try {
    order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    return notFound()
  }

  if (!order || order.downloadToken !== token) return notFound()

  // ── 2. Find associated workshop bookings ─────────────────────────────────
  let bookings: WorkshopBooking[] = []

  // Primary: look up by orderId field (set for new orders after this feature was added)
  try {
    const primaryResult = await payload.find({
      collection: 'workshop-bookings',
      where: { orderId: { equals: orderId } },
      limit: 20,
      depth: 0,
      overrideAccess: true,
    })
    bookings = primaryResult.docs as WorkshopBooking[]
  } catch {
    // ignore — fall through to fallback
  }

  // Fallback: for older orders that predate the orderId field, match by customer
  // email + workshop product slugs resolved from the order's items.
  if (bookings.length === 0 && order.customerEmail) {
    const workshopSlugs: string[] = []

    for (const item of order.items ?? []) {
      const productRef = item?.product
      if (!productRef) continue

      let productSlug: string | null = null

      if (typeof productRef === 'string') {
        try {
          const product = await payload.findByID({
            collection: 'products',
            id: productRef,
            depth: 0,
            overrideAccess: true,
          })
          productSlug = (product as unknown as { slug?: string })?.slug ?? null
        } catch {
          continue
        }
      } else if (typeof productRef === 'object' && productRef !== null) {
        productSlug = (productRef as { slug?: string })?.slug ?? null
      }

      if (productSlug?.startsWith('workshop-')) {
        // The booking stores the slug without the "workshop-" prefix
        workshopSlugs.push(productSlug.replace(/^workshop-/, ''))
      }
    }

    if (workshopSlugs.length > 0) {
      try {
        const fallbackResult = await payload.find({
          collection: 'workshop-bookings',
          where: {
            and: [
              { email: { equals: order.customerEmail } },
              { status: { equals: 'confirmed' } },
              { workshopSlug: { in: workshopSlugs } },
            ],
          },
          limit: 20,
          depth: 0,
          overrideAccess: true,
        })
        bookings = fallbackResult.docs as WorkshopBooking[]
      } catch {
        // ignore
      }
    }
  }

  // ── 3. Fetch workshop location ───────────────────────────────────────────
  let locationName = 'The Ginery'
  let locationAddress = 'Grabenstraße 15, 8010 Graz'

  try {
    const locations = await payload.find({
      collection: 'workshop-locations',
      where: { isActive: { equals: true } },
      limit: 1,
      locale,
      depth: 0,
    })
    const loc = locations.docs[0] as { name?: string; address?: string } | undefined
    if (loc?.name) locationName = loc.name
    if (loc?.address) locationAddress = loc.address
  } catch {
    // ignore — fallback used
  }

  // ── 4. Render ─────────────────────────────────────────────────────────────
  const noTickets = bookings.length === 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Page header — hidden when printing */}
      <div className="mb-8 no-print" data-no-print>
        <Link
          href={`/account/orders/${orderId}`}
          className="text-ff-text-muted hover:text-ff-near-black text-sm font-display mb-4 inline-block"
        >
          ← {t.allOrders}
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-subheading font-display text-ff-near-black">
              {t.viewTickets}
            </h1>
            <p className="text-body-sm text-ff-text-muted mt-1">
              {locale === 'de'
                ? `Bestellung #${orderId.slice(0, 8).toUpperCase()}`
                : `Order #${orderId.slice(0, 8).toUpperCase()}`}
            </p>
          </div>
          {!noTickets && <PrintTicketsButton label={t.printTickets} />}
        </div>
      </div>

      {noTickets ? (
        <div className="text-center py-16 text-ff-text-muted">
          <Ticket className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-display text-ff-near-black mb-2">
            {locale === 'de' ? 'Keine Tickets gefunden' : 'No tickets found'}
          </p>
          <p className="text-body-sm">
            {locale === 'de'
              ? 'Zu dieser Bestellung konnten keine Tickets geladen werden.'
              : 'No tickets could be found for this order.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const attendeeName =
              [booking.firstName, booking.lastName].filter(Boolean).join(' ') ||
              booking.email ||
              (locale === 'de' ? 'Teilnehmer' : 'Attendee')

            const guestNames = (booking.seats ?? [])
              .map((s) => s.recipientName)
              .filter((n): n is string => Boolean(n))

            return (
              <div
                key={booking.id}
                className="ticket-card border-2 border-ff-near-black rounded-[--radius-lg] overflow-hidden"
              >
                {/* Ticket header */}
                <div className="bg-ff-near-black px-6 py-4 flex items-center justify-between">
                  <span className="font-display font-semibold text-white text-lg tracking-wide">
                    FermentFreude
                  </span>
                  <Ticket className="w-6 h-6 text-ff-gold" />
                </div>

                {/* Dashed separator */}
                <div className="border-b-2 border-dashed border-ff-near-black mx-6" />

                {/* Ticket body */}
                <div className="px-6 py-5 space-y-4">
                  <h2 className="text-xl font-display font-semibold text-ff-near-black leading-tight">
                    {booking.workshopTitle}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-ff-gold mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-ff-text-muted uppercase tracking-wide font-display">
                          {t.date}
                        </p>
                        <p className="text-sm font-semibold text-ff-near-black">{booking.date}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-ff-gold mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-ff-text-muted uppercase tracking-wide font-display">
                          {locale === 'de' ? 'Zeit' : 'Time'}
                        </p>
                        <p className="text-sm font-semibold text-ff-near-black">{booking.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-ff-gold mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-ff-text-muted uppercase tracking-wide font-display">
                          {locale === 'de' ? 'Ort' : 'Location'}
                        </p>
                        <p className="text-sm font-semibold text-ff-near-black">{locationName}</p>
                        <p className="text-xs text-ff-text-muted">{locationAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashed separator */}
                <div className="border-b-2 border-dashed border-ff-near-black mx-6" />

                {/* Ticket footer */}
                <div className="px-6 py-4 bg-[#f6f3f0] flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-ff-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-ff-text-muted uppercase tracking-wide font-display">
                        {locale === 'de' ? 'Teilnehmer' : 'Attendees'}
                      </p>
                      <p className="text-sm font-semibold text-ff-near-black">{attendeeName}</p>
                      {guestNames.length > 0 && (
                        <p className="text-xs text-ff-text-muted">{guestNames.join(', ')}</p>
                      )}
                      <p className="text-xs text-ff-text-muted mt-0.5">
                        {booking.guestCount}{' '}
                        {booking.guestCount === 1
                          ? locale === 'de'
                            ? 'Person'
                            : 'person'
                          : locale === 'de'
                            ? 'Personen'
                            : 'people'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-ff-text-muted uppercase tracking-wide font-display">
                      {locale === 'de' ? 'Buchungs-Nr.' : 'Booking Ref.'}
                    </p>
                    <p className="text-sm font-semibold text-ff-near-black font-mono">
                      #{booking.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
