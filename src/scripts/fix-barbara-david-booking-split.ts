/**
 * fix-barbara-david-booking-split.ts
 *
 * One-off correction for a real incident: David Moitz's real Stripe order
 * (WEB-2026-0009, €99, 1 seat, Oct 24 Lakto) got attached by an old bug in
 * confirmWorkshopBookings' matching logic (fixed separately — see PR #106)
 * to Barbara Schmidt's pre-existing manually-created placeholder booking
 * (4 seats) instead of creating its own booking. Believing his confirmation
 * email's "4 participants" was his own mistake, David then used his
 * (legitimate) self-service link to cancel 3 of the 4 seats — seats that
 * were never really his.
 *
 * This script:
 *   1. Restores Barbara's booking to its true original state (4 active
 *      seats, no email/orderId/downloadToken — those were never hers).
 *   2. Creates David's own separate booking, linked to his EXISTING real
 *      order (no new/duplicate order is created).
 *   3. Deletes the 3 refund-requests that no longer correspond to a real
 *      cancellation once the seats are restored.
 *   4. Deletes the 2 cancellation-invoice documents that were auto-created
 *      as a side effect of acknowledging 2 of those requests.
 *
 * Does NOT touch availableSpots — Oct 24 is already floored at 0 from the
 * pre-existing overbook, and adding David as a genuinely new 9th person
 * doesn't change that floor.
 *
 * Usage:
 *   npx tsx src/scripts/fix-barbara-david-booking-split.ts [--dry-run]
 */

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import type { getPayload as GetPayload } from 'payload'

loadEnv()

const BARBARA_BOOKING_ID = '6aa081cf16be3d0c86cea084'
const DAVID_ORDER_ID = '6aa2b77e7b5b9aab0c86ba70'
const APPOINTMENT_ID = '6a7c8416d0eec62ba65e4031'
const REFUND_REQUEST_IDS = [
  '6aa2b821d2af1090dad021b3',
  '6aa2b826d2af1090dad021c9',
  '6aa2b82bd2af1090dad021e0',
]

async function run() {
  const dryRun = process.argv.includes('--dry-run')

  const dbUrl = process.env.DATABASE_URL ?? ''
  if (!dbUrl.includes('fermentfreude') || dbUrl.includes('fermentfreude-staging')) {
    console.error(
      `❌ DATABASE_URL does not recognizably point at production ("fermentfreude", not "-staging"). Refusing to run. Current: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`,
    )
    process.exit(1)
  }

  console.log(`Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE — will write to the database'}\n`)

  const { getPayload } = (await import('payload')) as { getPayload: typeof GetPayload }
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  // ── 1. Restore Barbara's booking ────────────────────────────────────────
  console.log('── 1. Restore Barbara Schmidt\'s booking ──')
  const barbara = await payload.findByID({
    collection: 'workshop-bookings',
    id: BARBARA_BOOKING_ID,
    depth: 0,
    overrideAccess: true,
  })
  const restoredSeats = (barbara.seats ?? []).map((s: Record<string, unknown>) => ({
    id: s.id,
    seatStatus: 'active',
    selfRebookingUsed: false,
    isGift: false,
    // Payload's array-field update merges into existing sub-docs rather
    // than replacing them, so these must be explicitly nulled — omitting
    // them (as a first pass here did) leaves stale cancelledAt/
    // cancelledReason/linkedRefundRequestId pointing at deleted
    // refund-requests.
    cancelledAt: null,
    cancelledReason: null,
    linkedRefundRequestId: null,
  }))
  console.log(`  ${barbara.firstName} ${barbara.lastName}: ${restoredSeats.length} seats → all active; removing email/orderId/downloadToken`)
  if (!dryRun) {
    await payload.update({
      collection: 'workshop-bookings',
      id: BARBARA_BOOKING_ID,
      overrideAccess: true,
      data: {
        seats: restoredSeats,
        email: null,
        orderId: null,
        downloadToken: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })
  }

  // ── 2. Create David's own separate booking ──────────────────────────────
  console.log('\n── 2. Create David Moitz\'s own booking (linked to his existing order, no new order) ──')
  // Matched on his actual name, not email+orderId — Barbara's still-corrupted
  // record (before step 1 restores it) also has David's email/orderId
  // stamped on it, which would otherwise false-positive as "already exists."
  const existingDavid = await payload.find({
    collection: 'workshop-bookings',
    where: {
      and: [
        { appointmentId: { equals: APPOINTMENT_ID } },
        { firstName: { equals: 'David' } },
        { lastName: { equals: 'Moitz' } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })
  if (existingDavid.docs.length > 0) {
    console.log(`  ✋ David already has a booking (id=${existingDavid.docs[0].id}) — skipping create.`)
  } else {
    console.log('  firstName: David, lastName: Moitz, guestCount: 1, orderId:', DAVID_ORDER_ID)
    if (!dryRun) {
      const created = await payload.create({
        collection: 'workshop-bookings',
        overrideAccess: true,
        data: {
          status: 'confirmed',
          appointmentId: APPOINTMENT_ID,
          workshopTitle: 'Lakto-fermentiertes Gemüse',
          workshopSlug: 'lakto',
          date: '24. Oktober 2026',
          time: '10:00 Uhr',
          guestCount: 1,
          pricePerPerson: 99,
          totalPrice: 99,
          firstName: 'David',
          lastName: 'Moitz',
          email: 'dmoitz93@gmail.com',
          orderId: DAVID_ORDER_ID,
          downloadToken: crypto.randomUUID(),
          seats: [{ seatStatus: 'active' }],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      console.log(`  ✅ Created booking id=${created.id}`)
    }
  }

  // ── 3. Delete the 3 stale refund-requests ────────────────────────────────
  console.log('\n── 3. Delete the 3 refund-requests tied to Barbara\'s restored seats ──')
  for (const id of REFUND_REQUEST_IDS) {
    console.log(`  ${id}`)
    if (!dryRun) {
      await payload.delete({ collection: 'refund-requests', id, overrideAccess: true }).catch((err) => {
        console.warn(`    (already gone or failed to delete: ${err instanceof Error ? err.message : err})`)
      })
    }
  }

  // ── 4. Delete the 2 wrongful cancellation-invoices ──────────────────────
  console.log('\n── 4. Delete cancellation-invoices auto-created for this order\'s wrongful refunds ──')
  const invoices = await payload.find({
    collection: 'cancellation-invoices',
    where: {
      and: [
        { order: { equals: DAVID_ORDER_ID } },
        { reason: { like: 'Workshop-Rückerstattung' } },
      ],
    },
    limit: 10,
    overrideAccess: true,
  })
  if (invoices.docs.length === 0) {
    console.log('  None found.')
  }
  for (const inv of invoices.docs) {
    console.log(`  ${inv.id} (${inv.reason})`)
    if (!dryRun) {
      await payload.delete({ collection: 'cancellation-invoices', id: inv.id, overrideAccess: true })
    }
  }

  console.log(`\n${dryRun ? 'Would make' : 'Made'} all changes above.`)
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
