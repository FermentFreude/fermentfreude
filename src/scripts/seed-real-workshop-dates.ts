/**
 * Add REAL workshop dates from ferment-freude.at
 *
 * These are the actual dates from the old website booking calendars.
 * Run: npx tsx src/scripts/seed-real-workshop-dates.ts
 *
 * This will:
 * 1. Delete all existing test appointments
 * 2. Add the real dates from the old website
 */

// Load environment variables first
import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

// Real dates from YOUR TABLE (11 total, 2 in past will be skipped)
const REAL_APPOINTMENTS = [
  // PAST - will skip: { workshop: 'tempeh', date: '22/02/2026', time: '11:00', spots: 12 },
  // PAST - will skip: { workshop: 'lakto', date: '07/03/2026', time: '16:00', spots: 12 },
  // PAST - will skip: { workshop: 'lakto', date: '08/03/2026', time: '16:00', spots: 12 },
  { workshop: 'tempeh', date: '26/03/2026', time: '17:30', spots: 12 },
  { workshop: 'kombucha', date: '02/04/2026', time: '17:00', spots: 12 },
  { workshop: 'lakto', date: '11/04/2026', time: '17:30', spots: 12 },
  { workshop: 'lakto', date: '17/04/2026', time: '17:30', spots: 12 },
  { workshop: 'tempeh', date: '29/04/2026', time: '18:00', spots: 12 },
  { workshop: 'lakto', date: '03/05/2026', time: '10:00', spots: 12 },
  { workshop: 'kombucha', date: '12/05/2026', time: '17:30', spots: 12 },
  { workshop: 'lakto', date: '29/05/2026', time: '17:30', spots: 12 },
]

function parseDate(dateStr: string, timeStr: string): string {
  // Input: "07/03/2026" and "16:00"
  // Output: ISO string for Europe/Vienna timezone
  const [day, month, year] = dateStr.split('/')
  const [hours, minutes] = timeStr.split(':')

  // Create date in Vienna timezone (CET/CEST)
  // March 2026 is in CEST (UTC+2)
  const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00+02:00`)

  return date.toISOString()
}

async function seedRealDates() {
  console.log('\n🌱 Seeding REAL workshop dates from ferment-freude.at...\n')

  const payload = await getPayload({ config })

  // Step 1: Delete all existing test appointments
  console.log('🗑️  Deleting test appointments...')

  const existing = await payload.find({
    collection: 'workshop-appointments',
    limit: 100,
  })

  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'workshop-appointments',
      id: doc.id as string,
    })
  }

  console.log(`✓ Deleted ${existing.docs.length} test appointments\n`)

  // Step 2: Get workshop and location IDs
  console.log('🔍 Fetching workshops and location...')

  const workshops = await payload.find({
    collection: 'workshops',
    limit: 10,
  })

  const workshopMap: Record<string, string> = {}
  for (const ws of workshops.docs) {
    workshopMap[ws.slug as string] = ws.id as string
  }

  const location = await payload.find({
    collection: 'workshop-locations',
    where: { name: { equals: 'Ginery' } },
    limit: 1,
  })

  if (location.docs.length === 0) {
    console.error('❌ Location "Ginery" not found! Run seed-workshop-collections first.')
    process.exit(1)
  }

  const locationId = location.docs[0].id as string
  console.log(`✓ Found location: Ginery (${locationId})\n`)

  // Step 3: Create real appointments
  console.log('📅 Creating real appointments...\n')

  let created = 0
  let skipped = 0

  for (const apt of REAL_APPOINTMENTS) {
    const workshopId = workshopMap[apt.workshop]
    if (!workshopId) {
      console.warn(`⚠️  Workshop "${apt.workshop}" not found — skipping`)
      skipped++
      continue
    }

    const dateTime = parseDate(apt.date, apt.time)

    try {
      const appointment = await payload.create({
        collection: 'workshop-appointments',
        data: {
          workshop: workshopId,
          location: locationId,
          dateTime,
          availableSpots: apt.spots,
          isPublished: true,
        },
        context: ctx,
      })

      console.log(
        `✓ ${apt.workshop.padEnd(10)} | ${apt.date} ${apt.time.padEnd(5)} | ${apt.spots} spots | ID: ${appointment.id}`,
      )
      created++
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.log(
        `⏭  ${apt.workshop.padEnd(10)} | ${apt.date} ${apt.time.padEnd(5)} | Skipped: ${message}`,
      )
      skipped++
    }
  }

  console.log(`\n✅ Real dates seed complete!`)
  console.log(`   ✓ ${created} appointments created`)
  if (skipped > 0) {
    console.log(`   ⏭  ${skipped} appointments skipped (past dates or errors)`)
  }
  console.log(`\n📝 View all: http://localhost:3000/admin/collections/workshop-appointments`)
}

seedRealDates().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
