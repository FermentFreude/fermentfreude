import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: 'var(--theme-elevation-50)',
  color: 'var(--theme-text)',
  opacity: 0.6,
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  color: 'var(--theme-text)',
  verticalAlign: 'top',
}

export const WorkshopRosterView: React.FC = async () => {
  const payload = await getPayload({ config: configPromise })

  // Show appointments from 14 days ago onward (so recently past ones are still visible)
  const since = new Date()
  since.setDate(since.getDate() - 14)

  const apptResult = await payload.find({
    collection: 'workshop-appointments',
    where: { dateTime: { greater_than_equal: since.toISOString() } },
    sort: 'dateTime',
    limit: 100,
    depth: 2,
    overrideAccess: true,
  })

  // Fetch confirmed bookings for each appointment sequentially (MongoDB Atlas M0)
  const rows: Array<{
    appt: (typeof apptResult.docs)[0]
    bookings: (typeof apptResult.docs)[0][]
    totalBooked: number
    capacity: number
  }> = []

  for (const appt of apptResult.docs) {
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
    // totalBooked = sum of guestCount across all confirmed bookings
    // capacity = booked + still-available spots on the appointment
    const totalBooked = bResult.docs.reduce(
      (sum, b) => sum + ((b as unknown as { guestCount?: number }).guestCount ?? 1),
      0,
    )
    rows.push({
      appt,
      bookings: bResult.docs as unknown as (typeof apptResult.docs)[0][],
      totalBooked,
      capacity: totalBooked + (appt.availableSpots ?? 0),
    })
  }

  const now = new Date()

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', color: 'var(--theme-text)' }}>
        Workshop Übersicht
      </h1>
      <p style={{ color: 'var(--theme-text)', opacity: 0.55, marginBottom: '32px', fontSize: '14px' }}>
        Buchungen pro Workshop-Termin. Vergangene Termine (letzte 14 Tage) sind ausgegraut.
      </p>

      {rows.length === 0 && (
        <p style={{ color: 'var(--theme-text)', opacity: 0.55 }}>
          Keine Workshops im angezeigten Zeitraum gefunden.
        </p>
      )}

      {rows.map(({ appt, bookings, totalBooked, capacity }) => {
        const workshop = typeof appt.workshop === 'object' ? appt.workshop : null
        const title = (workshop as { title?: string } | null)?.title ?? 'Workshop'
        const dt = new Date(appt.dateTime as string)
        const isPast = dt < now
        const dateStr = dt.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'Europe/Vienna',
        })
        const timeStr = dt.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Vienna',
        })
        const isSoldOut = appt.availableSpots === 0

        return (
          <div
            key={String(appt.id)}
            style={{
              border: '1px solid var(--theme-elevation-100)',
              borderRadius: '8px',
              marginBottom: '24px',
              overflow: 'hidden',
              opacity: isPast ? 0.6 : 1,
            }}
          >
            {/* Card header */}
            <div
              style={{
                padding: '14px 20px',
                background: 'var(--theme-elevation-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '15px', color: 'var(--theme-text)' }}>{title}</strong>
                <span style={{ color: 'var(--theme-text)', opacity: 0.6, fontSize: '14px' }}>
                  {dateStr} · {timeStr} Uhr
                </span>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  background: isSoldOut ? '#dc2626' : capacity > 0 && totalBooked / capacity >= 0.8 ? '#d97706' : '#16a34a',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '3px 12px',
                  whiteSpace: 'nowrap',
                }}
              >
                {totalBooked} / {capacity} Plätze gebucht
              </span>
            </div>

            {/* Booking table */}
            {bookings.length === 0 ? (
              <p
                style={{
                  padding: '14px 20px',
                  color: 'var(--theme-text)',
                  opacity: 0.5,
                  fontSize: '14px',
                  margin: 0,
                }}
              >
                Noch keine bestätigten Buchungen
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, paddingLeft: '20px' }}>Name</th>
                    <th style={thStyle}>E-Mail</th>
                    <th style={thStyle}>Telefon</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Gäste</th>
                    <th style={{ ...thStyle, paddingRight: '20px' }}>Ernährungshinweise</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => {
                    const bk = b as unknown as {
                      firstName?: string
                      email?: string
                      phone?: string
                      guestCount?: number
                      notes?: string
                    }
                    return (
                      <tr
                        key={i}
                        style={{ borderTop: '1px solid var(--theme-elevation-100)' }}
                      >
                        <td style={{ ...tdStyle, paddingLeft: '20px', fontWeight: 500 }}>
                          {bk.firstName ?? '—'}
                        </td>
                        <td style={tdStyle}>
                          {bk.email ? (
                            <a
                              href={`mailto:${bk.email}`}
                              style={{ color: 'var(--theme-text)', textDecoration: 'underline' }}
                            >
                              {bk.email}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ ...tdStyle, opacity: 0.7 }}>{bk.phone ?? '—'}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{bk.guestCount ?? 1}</td>
                        <td
                          style={{
                            ...tdStyle,
                            paddingRight: '20px',
                            opacity: bk.notes ? 1 : 0.45,
                            fontStyle: bk.notes ? 'normal' : 'italic',
                          }}
                        >
                          {bk.notes ?? 'Keine Angabe'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
    </div>
  )
}
