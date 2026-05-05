/**
 * restore-florian-booking.ts
 *
 * Recreates Florian Pölzl's confirmed Tempeh booking that was lost.
 * Does NOT touch availableSpots (already correct at 11).
 */

import config from '@payload-config'
import { getPayload } from 'payload'

async function run() {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'workshop-bookings',
    where: { email: { equals: 'florian.poelzl117@gmail.com' } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    console.log('✋ Florian booking already exists, skipping. id=', existing.docs[0].id)
    process.exit(0)
  }

  const created = await payload.create({
    collection: 'workshop-bookings',
    overrideAccess: true,
    data: {
      status: 'confirmed',
      workshopSlug: 'tempeh',
      appointmentId: '69c3ec23aafef918cd1060da',
      workshopTitle: 'Tempeh',
      date: '25. Juni 2026',
      time: '17:30',
      guestCount: 1,
      pricePerPerson: 99,
      totalPrice: 99,
      email: 'florian.poelzl117@gmail.com',
      firstName: 'Florian',
      lastName: 'Pölzl',
    },
  })

  console.log('✅ Created Florian booking, id=', created.id)
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
