/**
 * Bulk import workshop dates from a simple config format
 *
 * Edit the APPOINTMENTS array below, then run:
 *   npx tsx src/scripts/bulk-add-dates.ts
 *
 * This is faster than adding one by one via command line.
 */

// Load environment variables first
import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

// ═══════════════════════════════════════════════════════════════
//  EDIT THIS SECTION — Add your workshop dates here
// ═══════════════════════════════════════════════════════════════

const APPOINTMENTS = [
  // Example format:
  // { workshop: 'kombucha', date: '2026-04-12', time: '14:00', spots: 10 },
  // { workshop: 'lakto', date: '2026-04-15', time: '10:00', spots: 12 },
  // { workshop: 'tempeh', date: '2026-04-20', time: '16:00', spots: 8 },

  // Kombucha workshops (April)
  { workshop: 'kombucha', date: '2026-04-02', time: '14:00', spots: 12 },
  { workshop: 'kombucha', date: '2026-04-12', time: '10:00', spots: 10 },
  { workshop: 'kombucha', date: '2026-04-18', time: '14:00', spots: 12 },
  { workshop: 'kombucha', date: '2026-04-25', time: '10:00', spots: 8 },

  // Lakto workshops (April)
  { workshop: 'lakto', date: '2026-04-11', time: '14:00', spots: 12 },
  { workshop: 'lakto', date: '2026-04-17', time: '10:00', spots: 10 },
  { workshop: 'lakto', date: '2026-04-24', time: '16:00', spots: 12 },

  // Tempeh workshops (March-April)
  { workshop: 'tempeh', date: '2026-03-28', time: '14:00', spots: 8 },
  { workshop: 'tempeh', date: '2026-04-10', time: '16:00', spots: 10 },
  { workshop: 'tempeh', date: '2026-04-25', time: '14:00', spots: 12 },
]

// ═══════════════════════════════════════════════════════════════

async function bulkAddDates() {
  console.log(`\n🌱 Bulk adding ${APPOINTMENTS.length} workshop appointments...\n`)

  const payload = await getPayload({ config })

  // 1. Fetch all workshops and location once
  const workshopsResult = await payload.find({
    collection: 'workshops',
    limit: 100,
  })

  const locationResult = await payload.find({
    collection: 'workshop-locations',
    where: { name: { equals: 'Ginery' } },
    limit: 1,
  })

  if (!locationResult.docs.length) {
    console.error('❌ Ginery location not found — run pnpm seed workshop-collections first')
    process.exit(1)
  }

  const location = locationResult.docs[0]
  const workshopMap = new Map(workshopsResult.docs.map((w) => [w.slug, w]))

  // 2. Add each appointment
  let successCount = 0
  let skipCount = 0

  for (const apt of APPOINTMENTS) {
    const workshop = workshopMap.get(apt.workshop)
    if (!workshop) {
      console.warn(`⚠️  Workshop "${apt.workshop}" not found — skipping`)
      skipCount++
      continue
    }

    // Parse date/time (Vienna timezone)
    const dateTime = new Date(`${apt.date}T${apt.time}:00+01:00`).toISOString()

    try {
      const created = await payload.create({
        collection: 'workshop-appointments',
        data: {
          workshop: workshop.id,
          location: location.id,
          dateTime,
          availableSpots: apt.spots,
          isPublished: true,
          notes: `Imported via bulk-add-dates script`,
        },
        context: ctx,
      })

      console.log(
        `✓ ${apt.workshop.padEnd(10)} | ${apt.date} ${apt.time} | ${apt.spots} spots | ID: ${created.id}`,
      )
      successCount++
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(`✗ ${apt.workshop.padEnd(10)} | ${apt.date} ${apt.time} | Error: ${message}`)
      skipCount++
    }
  }

  console.log(`\n✅ Bulk import complete!`)
  console.log(`   ✓ ${successCount} appointments created`)
  if (skipCount > 0) {
    console.log(`   ⚠️  ${skipCount} appointments skipped (errors or missing workshops)`)
  }
  console.log(`\n📝 View all: http://localhost:3000/admin/collections/workshop-appointments`)
}

bulkAddDates().catch((err) => {
  console.error('❌ Bulk import failed:', err.message)
  process.exit(1)
})
