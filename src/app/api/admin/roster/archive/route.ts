import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import type {
  ArchiveAppointment,
  ArchiveBooking,
  ArchiveResponse,
} from '@/components/admin/roster/archiveTypes'
import { bookingOrigin } from '@/components/admin/roster/bookingOrigin'
import { fmtDate, fmtTime, toBookingRow } from '@/components/admin/roster/fetchRosterData'
import { seatsHoldingPlace } from '@/lib/seatCapacity'
import { capacityOf } from '@/lib/appointmentCapacity'

/**
 * READ-ONLY archive of past workshops for one year: who was booked, how each booking
 * was paid, and the invoice number. Admin-only, same check as /api/admin/roster.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: req.headers })
    const userAny = user as { role?: string; roles?: string[] } | null
    const isAdmin =
      userAny?.role === 'admin' ||
      userAny?.roles?.includes('admin') ||
      (user as Record<string, unknown> | null)?.['admin'] === true
    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const asked = Number(new URL(req.url).searchParams.get('year'))
    const year = Number.isInteger(asked) && asked >= 2020 && asked <= currentYear ? asked : currentYear

    const from = new Date(Date.UTC(year, 0, 1))
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1))
    const until = yearEnd < now ? yearEnd : now

    const earliest = await payload.find({
      collection: 'workshop-appointments',
      sort: 'dateTime',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const earliestDate = earliest.docs[0]?.dateTime
    const firstYear = earliestDate ? new Date(String(earliestDate)).getFullYear() : currentYear
    const years: number[] = []
    for (let y = currentYear; y >= Math.min(firstYear, currentYear); y--) years.push(y)

    const apptResult = await payload.find({
      collection: 'workshop-appointments',
      where: {
        and: [
          { dateTime: { greater_than_equal: from.toISOString() } },
          { dateTime: { less_than: until.toISOString() } },
        ],
      },
      sort: '-dateTime',
      limit: 300,
      depth: 1,
      overrideAccess: true,
    })

    const ids = apptResult.docs.map((a) => String(a.id))
    const bookingDocs = ids.length
      ? (
          await payload.find({
            collection: 'workshop-bookings',
            where: { and: [{ appointmentId: { in: ids } }, { status: { equals: 'confirmed' } }] },
            limit: 2000,
            depth: 0,
            overrideAccess: true,
          })
        ).docs
      : []

    const rows = bookingDocs.map((doc) => ({
      appointmentId: String((doc as unknown as { appointmentId?: string | null }).appointmentId ?? ''),
      row: toBookingRow(doc),
    }))

    const orderIds = [...new Set(rows.map((r) => r.row.orderId).filter(Boolean))]
    const orderById = new Map<string, { invoiceNumber: string; amount: number; status: string }>()
    if (orderIds.length) {
      const orders = await payload.find({
        collection: 'orders',
        where: { id: { in: orderIds } },
        limit: 2000,
        depth: 0,
        overrideAccess: true,
      })
      for (const doc of orders.docs) {
        const o = doc as unknown as {
          id: string | number
          invoiceNumber?: string | null
          amount?: number | null
          status?: string | null
        }
        orderById.set(String(o.id), {
          invoiceNumber: o.invoiceNumber ?? '',
          amount: Number(o.amount ?? 0) / 100,
          status: o.status ?? '',
        })
      }
    }

    const appointments: ArchiveAppointment[] = apptResult.docs.map((appt) => {
      const workshop = typeof appt.workshop === 'object' ? (appt.workshop as unknown as Record<string, unknown>) : null
      const location = typeof appt.location === 'object' ? (appt.location as unknown as Record<string, unknown>) : null
      const dateTimeStr = String(appt.dateTime ?? '')

      const bookings: ArchiveBooking[] = rows
        .filter((r) => r.appointmentId === String(appt.id))
        .map(({ row }) => {
          const buyer = [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email || '—'
          const order = row.orderId ? orderById.get(row.orderId) : undefined
          const origin = bookingOrigin(row)
          let payment: ArchiveBooking['payment'] = 'none'
          if (origin === 'manual') payment = 'manual'
          else if (origin === 'wix') payment = 'wix'
          else if (origin === 'website' && order) payment = order.amount > 0 ? 'stripe' : 'voucher'

          const count = Math.max(row.guestCount, 1)
          const seats = Array.from({ length: count }, (_, i) => {
            const seat = row.seats[i]
            return {
              name: seat?.recipientName || (i === 0 ? buyer : `Gast von ${buyer}`),
              status: seat?.seatStatus || 'active',
            }
          })

          return {
            id: row.id,
            buyer,
            email: row.email,
            guestCount: row.guestCount,
            seatsHeld: seatsHoldingPlace(row),
            seats,
            origin,
            payment,
            invoiceNumber: order?.invoiceNumber ?? '',
            orderStatus: order?.status ?? '',
            pricePerPerson: row.pricePerPerson,
            notes: row.notes,
          }
        })

      return {
        id: String(appt.id),
        workshopTitle: String(workshop?.title ?? 'Workshop'),
        dateTime: dateTimeStr,
        date: dateTimeStr ? fmtDate(dateTimeStr) : '',
        time: dateTimeStr ? `${fmtTime(dateTimeStr)} Uhr` : '',
        location: String(location?.name ?? ''),
        capacity: capacityOf(appt),
        seatsHeld: bookings.reduce((sum, b) => sum + b.seatsHeld, 0),
        noShows: bookings.reduce((sum, b) => sum + b.seats.filter((s) => s.status === 'no_show').length, 0),
        bookings,
      }
    })

    const body: ArchiveResponse = { year, years, appointments }
    return NextResponse.json(body)
  } catch (err) {
    console.error('[roster/archive] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
