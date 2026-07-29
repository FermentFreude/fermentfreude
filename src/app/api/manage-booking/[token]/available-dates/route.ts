import { NextRequest, NextResponse } from 'next/server'

import { getPayloadClient, resolveMagicLink } from '@/lib/manageBooking'
import type { Workshop } from '@/payload-types'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/manage-booking/[token]/available-dates
 *
 *  Alternative dates for the REBOOK_NOW / SELECT_REPLACEMENT_WORKSHOP
 *  date picker — excludes the booking's current appointment and anything
 *  already full.
 *
 *  Self-service (REBOOK_NOW, AGB §4.6): same workshop only.
 *  Organiser-cancellation (SELECT_REPLACEMENT_WORKSHOP, plan §7): "any
 *  available regular workshop" — the customer's original date is gone
 *  entirely, restricting them to the same workshop type could mean
 *  showing nothing at all.
 *
 *  Queries workshop-appointments directly rather than reusing
 *  getAllWorkshopAppointments() — that utility maps any workshop slug
 *  outside the 3 canonical types ('lakto'|'kombucha'|'tempeh') to
 *  'lakto' as a fallback (fine for the main calendar's 3-card UI, but
 *  it silently broke rebooking for special workshops like "Vom Feld
 *  ins Glas" — matching by that lossy type instead of the real slug
 *  made every alternative date invisible). Matching on the actual
 *  workshop relationship's slug avoids that entirely.
 * ═══════════════════════════════════════════════════════════════ */

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const resolved = await resolveMagicLink(token)

  if (!resolved.ok) {
    const status = resolved.reason === 'expired' ? 410 : 404
    return NextResponse.json({ success: false, error: resolved.reason }, { status })
  }

  const { booking, magicLink } = resolved
  const payload = await getPayloadClient()
  const anyWorkshop = magicLink.scope === 'organiser-cancellation'

  const results = await payload.find({
    collection: 'workshop-appointments',
    where: {
      and: [
        { isPublished: { equals: true } },
        { dateTime: { greater_than: new Date().toISOString() } },
      ],
    },
    depth: 2,
    limit: 100,
    sort: 'dateTime',
    overrideAccess: true,
  })

  const alternatives = results.docs
    .filter((a) => {
      const workshop = typeof a.workshop === 'object' ? (a.workshop as Workshop) : null
      return (
        String(a.id) !== booking.appointmentId &&
        (anyWorkshop || workshop?.slug === booking.workshopSlug) &&
        a.availableSpots > 0
      )
    })
    .map((a) => {
      const workshop = typeof a.workshop === 'object' ? (a.workshop as Workshop) : null
      return {
        appointmentId: String(a.id),
        // Only included when relevant (organiser-cancellation picks across
        // workshop types) — the self-service picker already knows the
        // workshop from the page header, showing it there would be noise.
        workshopTitle: anyWorkshop ? (workshop?.title ?? 'Workshop') : undefined,
        date: new Date(a.dateTime).toLocaleDateString('de-DE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Europe/Vienna',
        }),
        time: new Date(a.dateTime).toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Vienna',
        }),
        availableSpots: a.availableSpots,
      }
    })

  return NextResponse.json({ success: true, dates: alternatives })
}
