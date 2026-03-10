/**
 * Quick script to add workshop appointments via command line
 *
 * Usage:
 *   npx tsx src/scripts/add-workshop-dates.ts kombucha "2026-04-15 14:00" 8
 *   npx tsx src/scripts/add-workshop-dates.ts lakto "2026-04-20 10:00" 12
 *   npx tsx src/scripts/add-workshop-dates.ts tempeh "2026-04-25 16:00" 6
 *
 * Arguments:
 *   1. Workshop slug: kombucha | lakto | tempeh | basics
 *   2. Date & time: "YYYY-MM-DD HH:MM" (24-hour format)
 *   3. Available spots: 1-12
 */

// Load environment variables first
import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

async function addWorkshopDate() {
  const [workshopSlug, dateTimeStr, spotsStr] = process.argv.slice(2)

  // Validate arguments
  if (!workshopSlug || !dateTimeStr || !spotsStr) {
    console.error('❌ Missing arguments!')
    console.error(
      '\nUsage: npx tsx src/scripts/add-workshop-dates.ts <workshop> <date-time> <spots>',
    )
    console.error(
      '\nExample: npx tsx src/scripts/add-workshop-dates.ts kombucha "2026-04-15 14:00" 8',
    )
    console.error('\nWorkshops: kombucha, lakto, tempeh, basics')
    process.exit(1)
  }

  const availableSpots = parseInt(spotsStr, 10)
  if (isNaN(availableSpots) || availableSpots < 1 || availableSpots > 12) {
    console.error('❌ Available spots must be between 1 and 12')
    process.exit(1)
  }

  const payload = await getPayload({ config })

  // 1. Find the workshop
  const workshopResult = await payload.find({
    collection: 'workshops',
    where: { slug: { equals: workshopSlug } },
    limit: 1,
  })

  if (!workshopResult.docs.length) {
    console.error(`❌ Workshop "${workshopSlug}" not found`)
    console.error('   Available: kombucha, lakto, tempeh, basics')
    process.exit(1)
  }

  const workshop = workshopResult.docs[0]

  // 2. Find Ginery location
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

  // 3. Parse date/time (Vienna timezone)
  const dateTime = new Date(`${dateTimeStr}:00+01:00`).toISOString()

  // 4. Create appointment
  const appointment = await payload.create({
    collection: 'workshop-appointments',
    data: {
      workshop: workshop.id,
      location: location.id,
      dateTime,
      availableSpots,
      isPublished: true,
      notes: `Added via add-workshop-dates script`,
    },
    context: ctx,
  })

  console.log(`\n✅ Workshop appointment created!`)
  console.log(`   Workshop: ${workshop.title} (${workshopSlug})`)
  console.log(`   Location: Ginery, Graz`)
  console.log(`   Date/Time: ${dateTimeStr}`)
  console.log(`   Spots available: ${availableSpots}`)
  console.log(`   ID: ${appointment.id}`)
  console.log(
    `\n📝 View in admin: http://localhost:3000/admin/collections/workshop-appointments/${appointment.id}`,
  )
}

addWorkshopDate().catch((err) => {
  console.error('❌ Failed:', err.message)
  process.exit(1)
})
