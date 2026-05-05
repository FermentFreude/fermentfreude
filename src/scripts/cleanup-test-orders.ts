/**
 * cleanup-test-orders.ts
 *
 * Removes all test workshop-bookings and orders, keeping only the one real
 * confirmed booking. Resets availableSpots on every appointment to reflect
 * only the remaining confirmed guests.
 *
 * Usage:
 *   pnpm tsx src/scripts/cleanup-test-orders.ts          ← dry-run (preview only)
 *   pnpm tsx src/scripts/cleanup-test-orders.ts --force  ← actually delete
 */

import config from '@payload-config'
import { getPayload } from 'payload'

const DRY_RUN = !process.argv.includes('--force')

async function run() {
  const payload = await getPayload({ config })

  if (DRY_RUN) {
    console.log('\n⚠️  DRY-RUN mode — nothing will be deleted. Pass --force to commit changes.\n')
  } else {
    console.log('\n🚨 LIVE mode — changes will be written to the database.\n')
  }

  // ── 1. List all workshop-bookings ──────────────────────────────────────
  console.log('📋 All workshop-bookings:')
  const allBookings = await payload.find({
    collection: 'workshop-bookings',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  for (const b of allBookings.docs) {
    console.log(
      `  [${b.status}] ${b.workshopTitle} | ${b.date} ${b.time} | ${b.guestCount}x | €${b.totalPrice} | ${b.email ?? '(no email)'} | id=${b.id}`,
    )
  }

  const KEEP_EMAIL = 'florian.poelzl117@gmail.com'
  const toKeep = allBookings.docs.filter(
    (b) => typeof b.email === 'string' && b.email.toLowerCase() === KEEP_EMAIL.toLowerCase(),
  )
  const toDelete = allBookings.docs.filter(
    (b) => !(typeof b.email === 'string' && b.email.toLowerCase() === KEEP_EMAIL.toLowerCase()),
  )

  console.log(`\n✅ Florian's bookings (keeping): ${toKeep.length}`)
  console.log(`🗑️  All other bookings (deleting): ${toDelete.length}`)

  // ── 2. List all orders ──────────────────────────────────────────────────
  console.log('\n📋 All orders:')
  const allOrders = await payload.find({
    collection: 'orders',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  for (const o of allOrders.docs) {
    const email =
      typeof o.orderedBy === 'object' && o.orderedBy !== null
        ? (o.orderedBy as { email?: string }).email
        : ((o.email as string | undefined) ?? '(no email)')
    const total = typeof o.total === 'number' ? `€${(o.total / 100).toFixed(2)}` : '—'
    console.log(
      `  [${o.stripePaymentIntentID ?? 'no-payment-id'}] ${email} | ${total} | id=${o.id}`,
    )
  }

  // Keep orders that have a Stripe payment intent ID (real payment)
  const realOrders = allOrders.docs.filter(
    (o) => typeof o.stripePaymentIntentID === 'string' && o.stripePaymentIntentID.length > 0,
  )
  const testOrders = allOrders.docs.filter(
    (o) => typeof o.stripePaymentIntentID !== 'string' || o.stripePaymentIntentID.length === 0,
  )

  console.log(`\n✅ Orders with payment (keeping): ${realOrders.length}`)
  console.log(`🗑️  Orders without payment (deleting): ${testOrders.length}`)

  // ── 3. List all workshop-appointments (current spots) ──────────────────
  console.log('\n📅 Current workshop-appointments (availableSpots):')
  const appointments = await payload.find({
    collection: 'workshop-appointments',
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })

  for (const a of appointments.docs) {
    const workshopTitle =
      typeof a.workshop === 'object' && a.workshop !== null
        ? ((a.workshop as { title?: string; slug?: string }).title ??
          (a.workshop as { slug?: string }).slug)
        : a.workshop
    const date = new Date(a.dateTime as string).toLocaleDateString('de-DE')
    const time = new Date(a.dateTime as string).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    })
    console.log(`  ${workshopTitle} | ${date} ${time} | spots=${a.availableSpots} | id=${a.id}`)
  }

  if (DRY_RUN) {
    console.log('\n✅ Dry-run complete. Re-run with --force to apply changes.')
    process.exit(0)
  }

  // ── 4. Delete non-Florian bookings ────────────────────────────────────
  console.log('\n🗑️  Deleting test/other workshop-bookings...')
  for (const b of toDelete) {
    await payload.delete({
      collection: 'workshop-bookings',
      id: b.id as string,
      overrideAccess: true,
    })
    console.log(`  ✓ Deleted booking ${b.id} (${b.workshopTitle} | ${b.status})`)
  }

  // ── 5. Delete test orders ──────────────────────────────────────────────
  console.log('\n🗑️  Deleting test orders (no Stripe payment ID)...')
  for (const o of testOrders) {
    await payload.delete({
      collection: 'orders',
      id: o.id as string,
      overrideAccess: true,
    })
    console.log(`  ✓ Deleted order ${o.id}`)
  }

  // ── 6. Reset availableSpots for each appointment ───────────────────────
  // After cleanup, only Florian's bookings count against capacity.
  // spots = 12 - sum of guestCount for Florian's bookings on that appointment.
  console.log('\n🔄 Resetting availableSpots based on kept bookings...')

  const maxCapacity = 12

  for (const apt of appointments.docs) {
    const confirmedForApt = toKeep.filter((b) => b.appointmentId === (apt.id as string))
    const usedSpots = confirmedForApt.reduce((sum, b) => sum + (b.guestCount as number), 0)
    const newSpots = Math.max(0, maxCapacity - usedSpots)

    console.log(
      `  Appointment ${apt.id}: used=${usedSpots}, new availableSpots=${newSpots} (was ${apt.availableSpots})`,
    )

    if (newSpots !== apt.availableSpots) {
      await payload.update({
        collection: 'workshop-appointments',
        id: apt.id as string,
        data: { availableSpots: newSpots },
        overrideAccess: true,
      })
      console.log(`    ✓ Updated`)
    } else {
      console.log(`    — No change needed`)
    }
  }

  console.log('\n✅ Cleanup complete!')
  console.log(`   - ${toDelete.length} test bookings deleted`)
  console.log(`   - ${testOrders.length} test orders deleted`)
  console.log(`   - ${toKeep.length} booking(s) kept (Florian)`)
  console.log(`   - availableSpots reset on all appointments`)
}

run().catch((err) => {
  console.error('❌ Script failed:', err)
  process.exit(1)
})
