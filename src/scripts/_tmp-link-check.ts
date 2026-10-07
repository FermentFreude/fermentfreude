import { getPayload } from 'payload'
import config from '@payload-config'
if (!process.env.DATABASE_URL?.includes('fermentfreude-staging')) process.exit(1)
const payload = await getPayload({ config })
const bk = await payload.find({ collection: 'workshop-bookings', where: { email: { equals: 'connectwithrafaela@gmail.com' } }, sort: '-updatedAt', limit: 3, depth: 0, overrideAccess: true })
for (const b of bk.docs) {
  console.log('booking', b.id, b.status, b.firstName, b.date, b.time, 'appt', b.appointmentId, 'order', b.orderId ?? '-', 'seats', JSON.stringify(b.seats?.map(s => s.seatStatus)))
  for (const h of b.history ?? []) console.log('   hist:', h.type, '|', h.summary)
  const links = await payload.find({ collection: 'booking-magic-links', where: { bookingId: { equals: b.id } }, depth: 0, overrideAccess: true })
  for (const l of links.docs) console.log('   link', l.scope, 'expires', l.expiresAt ?? '-', 'opened', l.openedAt ?? '-', 'TOKEN', l.token)
}
process.exit(0)
