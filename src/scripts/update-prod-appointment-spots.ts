/**
 * update-prod-appointment-spots.ts
 *
 * PRODUCTION-targeted one-off. Does TWO things:
 *
 *   1. Deletes ALL test orders / transactions / carts / workshop-bookings
 *      from production (the booking system has not been in real use yet, so
 *      everything currently in those collections is test data from staging
 *      handoff / Stripe test checkouts).
 *   2. Updates `availableSpots` on the seven future workshop-appointments
 *      to match the founders' table dated 7 May 2026.
 *
 * Does NOT:
 *   - Create or delete appointments (so admin-set times/locations stay).
 *   - Touch past appointments, users, media, products, vouchers, pages.
 *   - Modify isPublished / dateTime / workshop / location on any row.
 *
 * Connects to production by reading PROD_DATABASE_URL + PROD_R2_BUCKET from
 * .env and exporting them as DATABASE_URL + R2_BUCKET BEFORE importing
 * payload-config. Run via the shell wrapper at the bottom or with the env
 * already set.
 *
 * Usage (always run via the wrapper to ensure env override):
 *   DATABASE_URL="$(grep '^PROD_DATABASE_URL=' .env | cut -d= -f2-)" \
 *   R2_BUCKET="$(grep '^PROD_R2_BUCKET=' .env | cut -d= -f2-)" \
 *   pnpm tsx src/scripts/update-prod-appointment-spots.ts          # dry-run
 *
 *   ... same env ... pnpm tsx src/scripts/update-prod-appointment-spots.ts --force
 *
 * Sequential writes only (Mongo Atlas M0 — no transactions).
 */

// IMPORTANT: dotenv.config() does NOT override existing process.env, so we
// rely on the shell wrapper to set DATABASE_URL/R2_BUCKET before tsx loads.
import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

const DRY_RUN = !process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

type Slug = 'kombucha' | 'lakto' | 'tempeh'

interface SpotTarget {
  workshop: Slug
  /** Vienna calendar date YYYY-MM-DD */
  date: string
  spots: number
  note?: string
}

/** From the founders' table dated 7 May 2026 (only "On new Website: Yes" rows). */
const TARGETS: SpotTarget[] = [
  { workshop: 'kombucha', date: '2026-05-12', spots: 0, note: 'Sold out via Wix' },
  { workshop: 'lakto', date: '2026-05-22', spots: 6 },
  { workshop: 'lakto', date: '2026-05-29', spots: 0, note: 'Sold out via Wix' },
  { workshop: 'kombucha', date: '2026-06-03', spots: 6 },
  { workshop: 'lakto', date: '2026-06-18', spots: 6 },
  { workshop: 'lakto', date: '2026-06-20', spots: 6 },
  { workshop: 'tempeh', date: '2026-06-25', spots: 6 },
]

/** Format an ISO instant as Vienna calendar date (YYYY-MM-DD). */
function viennaDate(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Vienna',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso))
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value
  return `${y}-${m}-${d}`
}

async function run() {
  const payload = await getPayload({ config })

  const dbUrl = process.env.DATABASE_URL ?? ''
  const dbName = dbUrl.split('/').pop()?.split('?')[0] ?? '(unknown)'
  console.log(`\n🔌 Connected to MongoDB database: ${dbName}`)

  if (dbName !== 'fermentfreude') {
    console.error(
      `\n🛑 This script is meant for PRODUCTION ("fermentfreude") but is connected to "${dbName}". Aborting.`,
    )
    process.exit(1)
  }

  console.log(
    DRY_RUN
      ? '\n⚠️  DRY-RUN — no writes. Re-run with --force to apply.\n'
      : '\n🚨 LIVE on PRODUCTION — wiping test orders/bookings and updating spots.\n',
  )

  // ── 1. Snapshot collections to wipe ────────────────────────────────────
  const collectionsToWipe = ['orders', 'transactions', 'carts', 'workshop-bookings'] as const
  console.log('Current production counts (will be wiped):')
  for (const c of collectionsToWipe) {
    const r = await payload.find({ collection: c, limit: 0, depth: 0, overrideAccess: true })
    console.log(`  ${c.padEnd(20)} ${r.totalDocs}`)
  }

  // ── 2. Resolve workshop IDs → slug map ─────────────────────────────────
  const workshopsRes = await payload.find({
    collection: 'workshops',
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })
  const slugById = new Map<string, Slug>()
  for (const w of workshopsRes.docs) {
    if (w.slug === 'kombucha' || w.slug === 'lakto' || w.slug === 'tempeh') {
      slugById.set(w.id as string, w.slug as Slug)
    }
  }

  // ── 3. Load all appointments and plan updates ──────────────────────────
  const aptRes = await payload.find({
    collection: 'workshop-appointments',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  console.log('\nAll production appointments:')
  for (const a of aptRes.docs) {
    const wid = typeof a.workshop === 'string' ? a.workshop : (a.workshop as { id: string }).id
    const slug = slugById.get(wid) ?? '(other)'
    const date = viennaDate(a.dateTime as string)
    console.log(`  ${slug.padEnd(8)} | ${date} | spots=${a.availableSpots} | id=${a.id}`)
  }

  // Build planned updates
  type Plan = { id: string; slug: Slug; date: string; before: number; after: number; note?: string }
  const plan: Plan[] = []
  const unmatched: SpotTarget[] = []

  for (const t of TARGETS) {
    const match = aptRes.docs.find((a) => {
      const wid = typeof a.workshop === 'string' ? a.workshop : (a.workshop as { id: string }).id
      return slugById.get(wid) === t.workshop && viennaDate(a.dateTime as string) === t.date
    })
    if (!match) {
      unmatched.push(t)
      continue
    }
    plan.push({
      id: match.id as string,
      slug: t.workshop,
      date: t.date,
      before: match.availableSpots as number,
      after: t.spots,
      note: t.note,
    })
  }

  console.log('\nPlanned spot updates:')
  for (const p of plan) {
    const change = p.before === p.after ? '(no change)' : `${p.before} → ${p.after}`
    console.log(
      `  ${p.slug.padEnd(8)} | ${p.date} | ${change}${p.note ? ` — ${p.note}` : ''} | id=${p.id}`,
    )
  }
  if (unmatched.length > 0) {
    console.log('\n⚠️  Unmatched targets (no appointment found in prod):')
    for (const u of unmatched) {
      console.log(`  ${u.workshop} | ${u.date} | spots=${u.spots}`)
    }
  }

  if (DRY_RUN) {
    console.log('\n✅ Dry-run complete. Re-run with --force to apply.')
    process.exit(0)
  }

  // ── 4. Wipe transactional collections (sequential, M0-safe) ────────────
  for (const c of collectionsToWipe) {
    console.log(`\n🗑️  Wiping ${c} from production...`)
    let wiped = 0
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

  // ── 5. Update spots (only where it actually changes) ───────────────────
  console.log('\n🔄 Updating availableSpots on production appointments...')
  let updated = 0
  let unchanged = 0
  for (const p of plan) {
    if (p.before === p.after) {
      console.log(`  — ${p.slug.padEnd(8)} | ${p.date} | unchanged (${p.after})`)
      unchanged++
      continue
    }
    await payload.update({
      collection: 'workshop-appointments',
      id: p.id,
      data: { availableSpots: p.after },
      overrideAccess: true,
      context: ctx,
    })
    console.log(`  ✓ ${p.slug.padEnd(8)} | ${p.date} | ${p.before} → ${p.after}`)
    updated++
  }

  console.log(`\n✅ Done. ${updated} appointment(s) updated, ${unchanged} unchanged.`)
  if (unmatched.length > 0) {
    console.log(`   ⚠️  ${unmatched.length} target(s) had no matching appointment — see above.`)
  }
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Script failed:', err)
  process.exit(1)
})
