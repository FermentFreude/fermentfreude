/**
 * Add real workshop dates from ferment-freude.at
 *
 * These are the actual dates from the old website booking calendars.
 * Run: npx tsx src/scripts/add-real-dates.ts
 *
 * To clear existing test data first: npx tsx src/scripts/add-real-dates.ts --clear
 */

// Load environment variables first
import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

// Real dates from https://www.ferment-freude.at/ booking calendars
// Format: DD/MM/YYYY HH:MM (converted to ISO for Vienna timezone)
const REAL_APPOINTMENTS = [
  // Note: First 3 dates (Feb 22, Mar 7, Mar 8) are in the past (today is Mar 9, 2026)
  // Skipping those as they can't be created per validation rules

  { workshop: 'tempeh', date: '2026-03-26', time: '17:30', spots: 12 },
  { workshop: 'kombucha', date: '2026-04-02', time: '17:00', spots: 12 },
  { workshop: 'lakto', date: '2026-04-11', time: '17:30', spots: 12 },
  { workshop: 'lakto', date: '2026-04-17', time: '17:30', spots: 12 },
  { workshop: 'tempeh', date: '2026-04-29', time: '18:00', spots: 12 },
  { workshop: 'lakto', date: '2026-05-03', time: '10:00', spots: 12 },
  { workshop: 'kombucha', date: '2026-05-12', time: '17:30', spots: 12 },
  { workshop: 'lakto', date: '2026-05-29', time: '17:30', spots: 12 },
]

async function addRealDates() {
  const clearFirst = process.argv.includes('--clear')

  console.log('🌱 Adding real workshop dates from ferment-freude.at...\n')

  const payload = await getPayload({ config })

  // Clear test data if requested
  if (clearFirst) {
    console.log('🗑️  Clearing existing appointments...')
    const existing = await payload.find({
      collection: 'workshop-appointments',
      limit: 1000,
    })

    for (const doc of existing.docs) {
      await payload.delete({
        collection: 'workshop-appointments',
        id: doc.id as string,
      })
    }
    console.log(`✓ Deleted ${existing.docs.length} test appointments\n`)
  }

  // Fetch location (should be Ginery)
  const locations = await payload.find({
    collection: 'workshop-locations',
    limit: 1,
  })

  if (locations.docs.length === 0) {
    console.error('❌ No location found! Run: pnpm seed workshop-collections first')
    process.exit(1)
  }

  const locationId = locations.docs[0].id as string
  console.log(`📍 Using location: ${locations.docs[0].name}\n`)

  // Fetch workshops
  const workshops = await payload.find({
    collection: 'workshops',
    limit: 10,
  })

  const workshopMap = new Map<string, string>()
  for (const ws of workshops.docs) {
    workshopMap.set(ws.slug as string, ws.id as string)
  }

  console.log('📅 Creating appointments...\n')

  let created = 0
  let skipped = 0

  for (const apt of REAL_APPOINTMENTS) {
    const workshopId = workshopMap.get(apt.workshop)
    if (!workshopId) {
      console.warn(`⚠️  Workshop "${apt.workshop}" not found — skipping`)
      skipped++
      continue
    }

    // Build ISO datetime string for Vienna timezone
    const dateTime = new Date(`${apt.date}T${apt.time}:00+01:00`).toISOString()

    try {
      const result = await payload.create({
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

      const workshopName = apt.workshop.charAt(0).toUpperCase() + apt.workshop.slice(1)
      console.log(
        `✓ ${workshopName.padEnd(10)} | ${apt.date} ${apt.time} | ${apt.spots} spots | ID: ${result.id}`,
      )
      created++
    } catch (error) {
      console.error(
        `❌ Failed to create ${apt.workshop} on ${apt.date}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      skipped++
    }
  }

  console.log(`\n✅ Real dates added!`)
  console.log(`   ✓ ${created} appointments created`)
  if (skipped > 0) {
    console.log(`   ⚠️  ${skipped} appointments skipped`)
  }
  console.log('\n📝 View all: http://localhost:3000/admin/collections/workshop-appointments')
  console.log('   (Sorted by date — soonest first)')
}

addRealDates().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
