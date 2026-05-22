/**
 * reset-real-appointments-may-2026.ts
 *
 * One-off: wipe ALL test orders / transactions / carts / workshop-bookings
 * and replace ALL workshop-appointments with the real list provided by the
 * founders on 7 May 2026.
 *
 * Source table (only rows with "On new Website: Yes" are seeded):
 *   Kombucha | 12.05.2026 | Tue | 0/8  ← sold out via Wix
 *   Lakto    | 22.05.2026 | Fri | 6/6
 *   Lakto    | 29.05.2026 | Fri | 0/6  ← sold out via Wix
 *   Kombucha | 03.06.2026 | Wed | 6/8
 *   Lakto    | 18.06.2026 | Thu | 6/6
 *   Lakto    | 20.06.2026 | Sat | 6/6
 *   Tempeh   | 25.06.2026 | Thu | 6/8
 *
 * Skipped (On new Website: No): Lakto 30.05.2026.
 *
 * All times are 18:00 Vienna local. May/June 2026 → CEST (UTC+2).
 *
 * Usage:
 *   pnpm tsx src/scripts/reset-real-appointments-may-2026.ts          # dry-run
 *   pnpm tsx src/scripts/reset-real-appointments-may-2026.ts --force  # commit
 *
 * Sequential writes only (MongoDB Atlas M0 — no transactions).
 */

import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const DRY_RUN = !process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

type Slug = 'kombucha' | 'lakto' | 'tempeh'

interface RealAppointment {
  workshop: Slug
  /** YYYY-MM-DD */
  date: string
  /** HH:MM (Vienna local) */
  time: string
  /** Free seats remaining (denominator was capacity in the source table). */
  availableSpots: number
  note?: string
}

const REAL_APPOINTMENTS: RealAppointment[] = [
  {
    workshop: 'kombucha',
    date: '2026-05-12',
    time: '18:00',
    availableSpots: 0,
    note: 'Sold out via Wix',
  },
  { workshop: 'lakto', date: '2026-05-22', time: '18:00', availableSpots: 6 },
  {
    workshop: 'lakto',
    date: '2026-05-29',
    time: '18:00',
    availableSpots: 0,
    note: 'Sold out via Wix',
  },
  { workshop: 'kombucha', date: '2026-06-03', time: '18:00', availableSpots: 6 },
  { workshop: 'lakto', date: '2026-06-18', time: '18:00', availableSpots: 6 },
  { workshop: 'lakto', date: '2026-06-20', time: '18:00', availableSpots: 6 },
  { workshop: 'tempeh', date: '2026-06-25', time: '18:00', availableSpots: 6 },
]

/** Build an ISO instant from a Vienna-local date+time, assuming CEST (+02:00). */
function viennaIso(date: string, time: string): string {
  // May/June 2026 is fully inside CEST; offset is +02:00.
  return new Date(`${date}T${time}:00+02:00`).toISOString()
}

async function run() {
  const payload = await getPayload({ config })

  // Sanity check: confirm we're on staging.
  const dbUrl = process.env.DATABASE_URL ?? ''
  const dbName = dbUrl.split('/').pop()?.split('?')[0] ?? '(unknown)'
  console.log(`\n🔌 Connected to MongoDB database: ${dbName}`)
  if (!dbName.includes('staging')) {
    console.error(`\n🛑 REFUSING to run against non-staging database "${dbName}". Aborting.`)
    process.exit(1)
  }

  console.log(
    DRY_RUN
      ? '\n⚠️  DRY-RUN — no writes. Re-run with --force to apply.\n'
      : '\n🚨 LIVE — wiping test data and reseeding appointments.\n',
  )

  // ── 1. Resolve workshop + location IDs ─────────────────────────────────
  const workshopsRes = await payload.find({
    collection: 'workshops',
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })
  const workshopMap: Record<Slug, string> = { kombucha: '', lakto: '', tempeh: '' }
  for (const w of workshopsRes.docs) {
    if (w.slug && (w.slug === 'kombucha' || w.slug === 'lakto' || w.slug === 'tempeh')) {
      workshopMap[w.slug as Slug] = w.id as string
    }
  }
  for (const slug of Object.keys(workshopMap) as Slug[]) {
    if (!workshopMap[slug]) {
      console.error(`❌ Missing workshop with slug "${slug}". Aborting.`)
      process.exit(1)
    }
  }

  const locRes = await payload.find({
    collection: 'workshop-locations',
    where: { name: { equals: 'Ginery' } },
    limit: 1,
    overrideAccess: true,
  })
  if (locRes.docs.length === 0) {
    console.error('❌ Location "Ginery" not found. Aborting.')
    process.exit(1)
  }
  const locationId = locRes.docs[0].id as string

  console.log('Resolved IDs:')
  console.log(`  kombucha = ${workshopMap.kombucha}`)
  console.log(`  lakto    = ${workshopMap.lakto}`)
  console.log(`  tempeh   = ${workshopMap.tempeh}`)
  console.log(`  Ginery   = ${locationId}\n`)

  // ── 2. Snapshot what's about to be wiped ───────────────────────────────
  const collectionsToWipe = ['orders', 'transactions', 'carts', 'workshop-bookings'] as const
  console.log('Current counts (will be wiped):')
  for (const c of collectionsToWipe) {
    const r = await payload.find({ collection: c, limit: 0, depth: 0, overrideAccess: true })
    console.log(`  ${c.padEnd(20)} ${r.totalDocs}`)
  }
  const aptCount = await payload.find({
    collection: 'workshop-appointments',
    limit: 0,
    depth: 0,
    overrideAccess: true,
  })
  console.log(`  workshop-appointments ${aptCount.totalDocs}\n`)

  console.log('Will create the following appointments:')
  for (const a of REAL_APPOINTMENTS) {
    console.log(
      `  ${a.workshop.padEnd(8)} | ${a.date} ${a.time} | spots=${a.availableSpots}${a.note ? ` (${a.note})` : ''}`,
    )
  }

  if (DRY_RUN) {
    console.log('\n✅ Dry-run complete. Re-run with --force to apply.')
    process.exit(0)
  }

  // ── 3. Wipe transactional collections (sequential, M0-safe) ────────────
  for (const c of collectionsToWipe) {
    console.log(`\n🗑️  Wiping ${c}...`)
    let wiped = 0
    // Iteratively page through; deleting shifts pages, so always read page 1.
    while (true) {
      const page = await payload.find({
        collection: c,
        limit: 50,
        depth: 0,
        overrideAccess: true,
      })
      if (page.docs.length === 0) break
      for (const doc of page.docs) {
        await payload.delete({
          collection: c,
          id: doc.id as string,
          overrideAccess: true,
          context: ctx,
        })
        wiped++
      }
    }
    console.log(`   ✓ Deleted ${wiped} ${c}`)
  }

  // ── 4. Wipe workshop-appointments ──────────────────────────────────────
  console.log('\n🗑️  Wiping workshop-appointments...')
  let aptWiped = 0
  while (true) {
    const page = await payload.find({
      collection: 'workshop-appointments',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })
    if (page.docs.length === 0) break
    for (const doc of page.docs) {
      await payload.delete({
        collection: 'workshop-appointments',
        id: doc.id as string,
        overrideAccess: true,
        context: ctx,
      })
      aptWiped++
    }
  }
  console.log(`   ✓ Deleted ${aptWiped} workshop-appointments`)

  // ── 5. Insert real appointments ────────────────────────────────────────
  console.log('\n📅 Creating real appointments...')
  let created = 0
  for (const a of REAL_APPOINTMENTS) {
    const dateTime = viennaIso(a.date, a.time)
    const doc = await payload.create({
      collection: 'workshop-appointments',
      data: {
        workshop: workshopMap[a.workshop],
        location: locationId,
        dateTime,
        availableSpots: a.availableSpots,
        isPublished: true,
        notes: a.note ?? undefined,
      },
      overrideAccess: true,
      context: ctx,
    })
    console.log(
      `  ✓ ${a.workshop.padEnd(8)} | ${a.date} ${a.time} | spots=${a.availableSpots} | id=${doc.id}`,
    )
    created++
  }

  console.log(`\n✅ Done. ${created}/${REAL_APPOINTMENTS.length} appointments seeded.`)
  console.log(
    `   Wiped: orders + transactions + carts + workshop-bookings + ${aptWiped} old appointments.`,
  )
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Script failed:', err)
  process.exit(1)
})
