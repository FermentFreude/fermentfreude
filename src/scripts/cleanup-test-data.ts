/**
 * cleanup-test-data.ts
 *
 * Deletes all test orders, bookings, transactions and carts from staging.
 * Resets all workshop appointment spots to their full capacity.
 *
 * Run: pnpm tsx src/scripts/cleanup-test-data.ts
 *
 * Safe to run against staging only — never run against production.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function main() {
  const payload = await getPayload({ config: await configPromise })

  console.log('🧹 Starting test data cleanup...\n')

  // ── 1. Delete all orders ────────────────────────────────────────────────────
  // The restoreWorkshopSpotsOnDelete afterDelete hook fires for each order,
  // automatically restoring appointment spots and deleting linked bookings.
  const orders = await payload.find({
    collection: 'orders',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  console.log(`Found ${orders.totalDocs} order(s) to delete.`)

  for (const order of orders.docs) {
    await payload.delete({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
    })
    console.log(`  ✓ Deleted order ${order.id}`)
  }

  // ── 2. Delete any remaining orphaned bookings ───────────────────────────────
  const bookings = await payload.find({
    collection: 'workshop-bookings',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  console.log(`\nFound ${bookings.totalDocs} remaining booking(s) to delete.`)

  for (const booking of bookings.docs) {
    await payload.delete({
      collection: 'workshop-bookings',
      id: booking.id,
      overrideAccess: true,
    })
    console.log(`  ✓ Deleted booking ${booking.id}`)
  }

  // ── 3. Delete all transactions ──────────────────────────────────────────────
  const transactions = await payload.find({
    collection: 'transactions',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  console.log(`\nFound ${transactions.totalDocs} transaction(s) to delete.`)

  for (const tx of transactions.docs) {
    await payload.delete({
      collection: 'transactions',
      id: tx.id,
      overrideAccess: true,
    })
    console.log(`  ✓ Deleted transaction ${tx.id}`)
  }

  // ── 4. Delete all carts ─────────────────────────────────────────────────────
  const carts = await payload.find({
    collection: 'carts',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  console.log(`\nFound ${carts.totalDocs} cart(s) to delete.`)

  for (const cart of carts.docs) {
    await payload.delete({
      collection: 'carts',
      id: cart.id,
      overrideAccess: true,
    })
    console.log(`  ✓ Deleted cart ${cart.id}`)
  }

  // ── 5. Reset all appointment spots to full capacity ─────────────────────────
  // Final safety pass — ensures every appointment has the correct available spots
  // regardless of whether the hook ran correctly for each order.
  const appointments = await payload.find({
    collection: 'workshop-appointments',
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })

  console.log(`\nResetting spots for ${appointments.totalDocs} appointment(s).`)

  for (const appointment of appointments.docs) {
    const workshop = appointment.workshop
    const maxCapacity =
      workshop && typeof workshop === 'object'
        ? (((workshop as unknown) as Record<string, unknown>).maxCapacityPerSlot as number) ?? 12
        : 12

    await payload.update({
      collection: 'workshop-appointments',
      id: appointment.id,
      data: { availableSpots: maxCapacity },
      overrideAccess: true,
    })
    console.log(`  ✓ Reset appointment ${appointment.id} → ${maxCapacity} spots`)
  }

  // ── 6. Reset invoice counter ─────────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'invoice-counter' as never,
    data: { lastYear: 0 as unknown as undefined, lastNumber: 0 as unknown as undefined },
    overrideAccess: true,
  })
  console.log('\n  ✓ Invoice counter reset to 0')

  console.log('\n✅ Cleanup complete. All test data removed, spots reset.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Cleanup failed:', err)
  process.exit(1)
})
