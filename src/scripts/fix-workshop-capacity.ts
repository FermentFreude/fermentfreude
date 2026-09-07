/**
 * fix-workshop-capacity.ts
 *
 * One-off correction: sets the real per-workshop capacity (confirmed by
 * David — Kombucha/Tempeh/Lakto = 8, Vom Feld ins Glas = 12) on all
 * `workshops` docs, then recomputes `availableSpots` on every upcoming
 * `workshop-appointments` doc so it matches `capacity - confirmedGuestsBooked`
 * instead of whatever it happened to drift to. Safe to re-run — it only ever
 * sets values, and running it twice in a row is a no-op the second time.
 *
 * Usage:
 *   npx tsx src/scripts/fix-workshop-capacity.ts [--dry-run]
 */

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import type { getPayload as GetPayload } from 'payload'

loadEnv()

const CAPACITY_BY_SLUG: Record<string, number> = {
  lakto: 8,
  kombucha: 8,
  tempeh: 8,
  'vom-feld-ins-glas': 12,
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  console.log(`Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE — will write to the database'}\n`)

  const { getPayload } = (await import('payload')) as { getPayload: typeof GetPayload }
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  // ── 1. Set the real capacity on every workshop type ─────────────────────
  console.log('── Workshops ──')
  const workshops = await payload.find({ collection: 'workshops', limit: 50, overrideAccess: true })
  for (const w of workshops.docs) {
    const slug = w.slug as string
    const target = CAPACITY_BY_SLUG[slug]
    if (target === undefined) {
      console.log(`  ${slug}: no known target capacity — leaving at ${w.maxCapacityPerSlot} (add it to CAPACITY_BY_SLUG if this should change)`)
      continue
    }
    const current = w.maxCapacityPerSlot as number
    if (current === target) {
      console.log(`  ${slug}: already ${target} — skip`)
      continue
    }
    console.log(`  ${slug}: ${current} → ${target}`)
    if (!dryRun) {
      await payload.update({
        collection: 'workshops',
        id: w.id,
        overrideAccess: true,
        data: { maxCapacityPerSlot: target },
      })
    }
  }

  // ── 2. Recompute availableSpots on every upcoming appointment ───────────
  console.log('\n── Appointments (dateTime >= now) ──')
  const now = new Date().toISOString()
  const appts = await payload.find({
    collection: 'workshop-appointments',
    where: { dateTime: { greater_than_equal: now } },
    sort: 'dateTime',
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })

  let changed = 0
  for (const appt of appts.docs) {
    const workshop = typeof appt.workshop === 'object' ? appt.workshop : null
    const slug = workshop?.slug ?? 'unknown'
    const capacity = CAPACITY_BY_SLUG[slug]
    if (capacity === undefined) {
      console.log(`  ${slug} @ ${appt.dateTime}: no known target capacity — skipping`)
      continue
    }

    const bookings = await payload.find({
      collection: 'workshop-bookings',
      where: {
        and: [{ appointmentId: { equals: String(appt.id) } }, { status: { equals: 'confirmed' } }],
      },
      limit: 50,
      overrideAccess: true,
    })
    const totalBooked = bookings.docs.reduce((sum, b) => sum + (Number(b.guestCount) || 1), 0)
    const correctAvailable = Math.max(0, capacity - totalBooked)
    const current = appt.availableSpots as number

    if (current === correctAvailable) {
      continue
    }
    changed++
    console.log(
      `  ${slug} @ ${appt.dateTime}: availableSpots ${current} → ${correctAvailable} (booked: ${totalBooked}/${capacity})`,
    )
    if (!dryRun) {
      await payload.update({
        collection: 'workshop-appointments',
        id: appt.id,
        overrideAccess: true,
        data: { availableSpots: correctAvailable },
      })
    }
  }
  if (changed === 0) {
    console.log('  Nothing to change — all upcoming appointments already correct.')
  }

  console.log(`\n${dryRun ? 'Would change' : 'Changed'} ${changed} appointment(s).`)
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
