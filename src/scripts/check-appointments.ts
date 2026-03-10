/**
 * Quick script to check if appointments exist in database
 */

import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

async function checkAppointments() {
  console.log('🔍 Checking workshop appointments...\n')

  const payload = await getPayload({ config })

  const appointments = await payload.find({
    collection: 'workshop-appointments',
    limit: 50,
    depth: 2,
  })

  console.log(`📊 Found ${appointments.docs.length} appointments in database:\n`)

  if (appointments.docs.length === 0) {
    console.log('❌ No appointments found!\n')
    console.log('Run: npx tsx src/scripts/seed-real-workshop-dates.ts')
    process.exit(1)
  }

  for (const apt of appointments.docs) {
    const workshop = typeof apt.workshop === 'object' ? apt.workshop.title : apt.workshop
    const location = typeof apt.location === 'object' ? apt.location.name : apt.location
    const date = new Date(apt.dateTime as string)
    const formatted = date.toLocaleString('de-DE', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Europe/Vienna',
    })

    console.log(
      `✓ ${String(workshop).padEnd(25)} | ${formatted} | ${location} | ${apt.availableSpots} spots`,
    )
  }

  console.log(`\n✅ Total: ${appointments.docs.length} appointments`)
}

checkAppointments().catch((err) => {
  console.error('❌ Check failed:', err)
  process.exit(1)
})
