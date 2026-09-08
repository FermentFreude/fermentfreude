/**
 * sync-prod-to-staging.ts
 *
 * One-off: makes staging's test/demo content (products, workshop locations,
 * workshop appointments, workshop bookings, vouchers, orders) an exact
 * mirror of production's, so the roster dashboard has real data to test
 * against. Read-only against production; all writes/deletes happen on
 * staging only.
 *
 * Two phases, run as separate processes (Payload's config captures
 * DATABASE_URL once at import time, so one process can only ever talk to
 * one database):
 *
 *   1. DATABASE_URL=<production> npx tsx src/scripts/sync-prod-to-staging.ts --export
 *      Dumps everything needed to src/scripts/data/prod-sync/dump.json
 *      (gitignored — contains real customer PII).
 *
 *   2. DATABASE_URL=<staging> npx tsx src/scripts/sync-prod-to-staging.ts --import [--dry-run]
 *      Reads the dump, deletes staging content that has no production
 *      counterpart, and creates/updates the rest under production's exact
 *      IDs so relations (order -> product, booking -> appointment) resolve.
 *
 * Product/media files themselves are NOT copied by this script — copy them
 * separately with `rclone copy r2:fermentfreude-media/media/<file> r2:fermentfreude-media-staging/media/`
 * before running --import, so the Media docs' referenced files actually exist.
 */

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { getPayload as GetPayload } from 'payload'

loadEnv()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DUMP_PATH = path.join(__dirname, 'data/prod-sync/dump.json')

// Staging products/locations that have no production counterpart at all,
// or that diverged (same name, different id, created independently in each
// environment) — deleted on --import before the correct versions are
// (re)created under production's ids.
const STALE_STAGING_PRODUCT_IDS = [
  '6a8824c3f6af04b208a112df', // Berglinsen-Tempeh (diverged id)
  '6a68c15df4281c43c35e42a5', // "test" — no prod counterpart
  '6a5a021fc8a535dcec875b46', // Vom Feld ins Glas Workshop (diverged id)
  '69bc80504889efa4f93c7ad7', // Fermentierte Curryzwiebel — no prod counterpart
  '69bc80504889efa4f93c7ace', // Fermentierte Rote Rüben — no prod counterpart
]
const STALE_STAGING_LOCATION_IDS = [
  '6a5a021ec8a535dcec875add', // Marktgarten „Unser Bauerngarten" (diverged id)
]
const STALE_STAGING_WORKSHOP_IDS = [
  '6a5a021fc8a535dcec875b36', // vom-feld-ins-glas (diverged id) — verified nothing else references it
]
const PRODUCT_IDS_TO_COPY = ['6a9af5c6047eee1587b17b3b', '6a86a26a199bf7841c3a9e98']
const MEDIA_IDS_TO_COPY = [
  '6a9d495e7a270476a9c59729',
  '69e1dc6d40fa3a821a8615a1',
  '6a9af0a4a180c69a4dbcc80f',
  '6a9af1e772ea012c1b95e2c1',
]
const LOCATION_IDS_TO_COPY = ['6a86a256199bf7841c3a9e1f']
// workshops (the type/metadata doc, distinct from the `products` collection)
// — additive only, staging's own vom-feld-ins-glas doc is NOT deleted since
// the live storefront page may reference it; this just also inserts
// production's version under its own id so the synced appointments'
// `workshop` relation resolves.
const WORKSHOP_IDS_TO_COPY = ['6a86a265199bf7841c3a9e81']

async function loadPayload() {
  const { getPayload } = (await import('payload')) as { getPayload: typeof GetPayload }
  const { default: config } = await import('@payload-config')
  return getPayload({ config })
}

async function exportPhase() {
  const payload = await loadPayload()
  console.log('Exporting from production…\n')

  const dump: Record<string, unknown[]> = {}

  // Every --import write goes through the low-level db adapter (see that
  // function for why), which skips Payload's locale-transform step.
  // locale: 'all' captures every collection's localized fields in their
  // raw { de, en } storage shape so the direct Mongo write on the way back
  // in matches what each schema actually expects.
  const allLocales = { locale: 'all' } as const

  const workshops = []
  for (const id of WORKSHOP_IDS_TO_COPY) {
    workshops.push(await payload.findByID({ collection: 'workshops', id, depth: 0, overrideAccess: true, ...allLocales }))
  }
  dump.workshops = workshops
  console.log(`  workshops: ${workshops.length}`)

  const products = []
  for (const id of PRODUCT_IDS_TO_COPY) {
    products.push(await payload.findByID({ collection: 'products', id, depth: 0, overrideAccess: true, ...allLocales }))
  }
  dump.products = products
  console.log(`  products: ${products.length}`)

  const media = []
  for (const id of MEDIA_IDS_TO_COPY) {
    media.push(await payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true, ...allLocales }))
  }
  dump.media = media
  console.log(`  media: ${media.length}`)

  const locations = []
  for (const id of LOCATION_IDS_TO_COPY) {
    locations.push(await payload.findByID({ collection: 'workshop-locations', id, depth: 0, overrideAccess: true, ...allLocales }))
  }
  dump.locations = locations
  console.log(`  workshop-locations: ${locations.length}`)

  const appointments = await payload.find({ collection: 'workshop-appointments', limit: 200, depth: 0, overrideAccess: true, ...allLocales })
  dump.appointments = appointments.docs
  console.log(`  workshop-appointments: ${appointments.docs.length}`)

  const bookings = await payload.find({ collection: 'workshop-bookings', limit: 500, depth: 0, overrideAccess: true, ...allLocales })
  dump.bookings = bookings.docs
  console.log(`  workshop-bookings: ${bookings.docs.length}`)

  const vouchers = await payload.find({ collection: 'vouchers', limit: 500, depth: 0, overrideAccess: true, ...allLocales })
  dump.vouchers = vouchers.docs
  console.log(`  vouchers: ${vouchers.docs.length}`)

  const orders = await payload.find({ collection: 'orders', limit: 500, depth: 0, overrideAccess: true, ...allLocales })
  dump.orders = orders.docs
  console.log(`  orders: ${orders.docs.length}`)

  fs.mkdirSync(path.dirname(DUMP_PATH), { recursive: true })
  fs.writeFileSync(DUMP_PATH, JSON.stringify(dump, null, 2))
  console.log(`\n✅ Wrote ${DUMP_PATH}`)
  process.exit(0)
}

async function importPhase() {
  const dryRun = process.argv.includes('--dry-run')
  console.log(`Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE — will write to the database'}\n`)

  if (!fs.existsSync(DUMP_PATH)) {
    console.error(`❌ ${DUMP_PATH} not found — run --export against production first.`)
    process.exit(1)
  }
  const dump = JSON.parse(fs.readFileSync(DUMP_PATH, 'utf-8'))
  const payload = await loadPayload()
  const displayName = (v: unknown): string =>
    typeof v === 'string' ? v : v && typeof v === 'object' ? String((v as Record<string, unknown>).de ?? Object.values(v as object)[0] ?? '') : String(v ?? '')

  // ── 1. Delete stale/orphaned staging content ────────────────────────────
  console.log('── Deleting stale staging content ──')
  for (const id of STALE_STAGING_PRODUCT_IDS) {
    const existing = await payload.findByID({ collection: 'products', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (existing) {
      console.log(`  product: ${existing.title} (${id})`)
      if (!dryRun) await payload.delete({ collection: 'products', id, overrideAccess: true })
    }
  }
  for (const id of STALE_STAGING_LOCATION_IDS) {
    const existing = await payload.findByID({ collection: 'workshop-locations', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (existing) {
      console.log(`  location: ${existing.name} (${id})`)
      if (!dryRun) await payload.delete({ collection: 'workshop-locations', id, overrideAccess: true })
    }
  }
  for (const id of STALE_STAGING_WORKSHOP_IDS) {
    const existing = await payload.findByID({ collection: 'workshops', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (existing) {
      console.log(`  workshop: ${displayName(existing.title)} (${id})`)
      if (!dryRun) await payload.delete({ collection: 'workshops', id, overrideAccess: true })
    }
  }
  const staleAppointments = await payload.find({ collection: 'workshop-appointments', limit: 200, depth: 0, overrideAccess: true })
  for (const appt of staleAppointments.docs) {
    console.log(`  appointment: ${appt.id} @ ${appt.dateTime}`)
    if (!dryRun) await payload.delete({ collection: 'workshop-appointments', id: appt.id, overrideAccess: true })
  }

  // ── 2. Create missing reference data under production's ids ────────────
  console.log('\n── Creating reference data (workshops, media, locations, products) ──')
  for (const doc of dump.workshops as Record<string, unknown>[]) {
    const id = doc.id as string
    const exists = await payload.findByID({ collection: 'workshops', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (exists) { console.log(`  workshop already present: ${displayName(doc.title)}`); continue }
    console.log(`  workshop: ${displayName(doc.title)} (${id})`)
    if (!dryRun) {
      const { id: _id, ...data } = doc
      await payload.db.create({ collection: 'workshops', data, customID: id })
    }
  }
  for (const doc of dump.media as Record<string, unknown>[]) {
    const id = doc.id as string
    const exists = await payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (exists) { console.log(`  media already present: ${doc.filename}`); continue }
    console.log(`  media: ${doc.filename} (${id})`)
    if (!dryRun) {
      const { id: _id, ...data } = doc
      // The Media collection is an upload type — payload.create() demands an
      // actual file in the request and throws MissingFile otherwise. The
      // real file already exists in R2 (copied separately via rclone before
      // this script runs); we're only adopting the DB record that points to
      // it, so go through the low-level db adapter to skip upload handling.
      await payload.db.create({ collection: 'media', data, customID: id })
    }
  }
  // NOTE: every creation in this script goes through payload.db.create()
  // with an explicit customID, never payload.create(). Neither the local
  // API's create() nor db.create() honors a plain `id` field inside `data`
  // for these collections (none define a custom ID field) — passing it
  // that way is silently ignored and Payload assigns a fresh random
  // ObjectId instead, which is how the first attempt at this script left
  // orphaned duplicate docs (real production IDs are load-bearing here:
  // bookings link to appointments, orders link to products, by ID).
  for (const doc of dump.locations as Record<string, unknown>[]) {
    const id = doc.id as string
    const exists = await payload.findByID({ collection: 'workshop-locations', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (exists) { console.log(`  location already present: ${displayName(doc.name)}`); continue }
    console.log(`  location: ${displayName(doc.name)} (${id})`)
    if (!dryRun) {
      const { id: _id, ...data } = doc
      await payload.db.create({ collection: 'workshop-locations', data, customID: id })
    }
  }
  for (const doc of dump.products as Record<string, unknown>[]) {
    const id = doc.id as string
    const exists = await payload.findByID({ collection: 'products', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (exists) { console.log(`  product already present: ${displayName(doc.title)}`); continue }
    console.log(`  product: ${displayName(doc.title)} (${id})`)
    if (!dryRun) {
      const { id: _id, ...data } = doc
      await payload.db.create({ collection: 'products', data, customID: id })
    }
  }

  // ── 3. Re-create production's appointment calendar ──────────────────────
  // Uses the low-level db adapter, not payload.create() — its beforeValidate
  // hook rejects any dateTime in the past, which is correct for real new
  // bookings but wrong here: several of production's real sessions have
  // already happened by now and must still be backfilled faithfully.
  console.log('\n── Creating production workshop-appointments ──')
  for (const doc of dump.appointments as Record<string, unknown>[]) {
    const id = doc.id as string
    const exists = await payload.findByID({ collection: 'workshop-appointments', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (exists) { console.log(`  already present: ${id}`); continue }
    console.log(`  appointment: ${id} @ ${doc.dateTime}`)
    if (!dryRun) {
      const { id: _id, ...data } = doc
      await payload.db.create({ collection: 'workshop-appointments', data, customID: id })
    }
  }

  // ── 4. Copy bookings, vouchers, orders (staging had none of these) ──────
  console.log('\n── Creating workshop-bookings ──')
  for (const doc of dump.bookings as Record<string, unknown>[]) {
    const id = doc.id as string
    const exists = await payload.findByID({ collection: 'workshop-bookings', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (exists) continue
    if (!dryRun) {
      const { id: _id, ...data } = doc
      await payload.db.create({ collection: 'workshop-bookings', data, customID: id })
    }
  }
  console.log(`  ${(dump.bookings as unknown[]).length} bookings`)

  console.log('\n── Creating vouchers ──')
  for (const doc of dump.vouchers as Record<string, unknown>[]) {
    const id = doc.id as string
    const exists = await payload.findByID({ collection: 'vouchers', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (exists) continue
    if (!dryRun) {
      const { id: _id, ...data } = doc
      await payload.db.create({ collection: 'vouchers', data, customID: id })
    }
  }
  console.log(`  ${(dump.vouchers as unknown[]).length} vouchers`)

  console.log('\n── Creating orders ──')
  for (const doc of dump.orders as Record<string, unknown>[]) {
    const id = doc.id as string
    const exists = await payload.findByID({ collection: 'orders', id, depth: 0, overrideAccess: true }).catch(() => null)
    if (exists) continue
    if (!dryRun) {
      const { id: _id, customer: _customer, transactions: _transactions, ...data } = doc
      // customer/transactions relations are cleared — Users/Transactions
      // aren't part of this sync, but every field the dashboard actually
      // reads (customerName, customerEmail, customerPhone, items, amount,
      // status) is stored flat on the order itself and stays intact.
      await payload.db.create({ collection: 'orders', data, customID: id })
    }
  }
  console.log(`  ${(dump.orders as unknown[]).length} orders`)

  console.log('\n✅ Sync complete.')
  process.exit(0)
}

async function run() {
  if (process.argv.includes('--export')) return exportPhase()
  if (process.argv.includes('--import')) return importPhase()
  console.error('Usage: npx tsx src/scripts/sync-prod-to-staging.ts --export | --import [--dry-run]')
  process.exit(1)
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
