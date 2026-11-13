/**
 * READ-ONLY health check of the roster data on PRODUCTION: seats vs bookings, stuck holds,
 * orphaned bookings, orders, vouchers, page drafts. Only find/count calls on the Mongo driver;
 * refuses unless the database is exactly `fermentfreude`. Prints no emails in full, no secrets.
 *
 * Run:  npx tsx src/scripts/prod-roster-audit.ts
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import { createRequire } from 'node:module'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })
const uri = process.env.PROD_DATABASE_URL ?? ''
if (!/\/fermentfreude(\?|$)/.test(uri)) {
  console.error('🚫 REFUSING: PROD_DATABASE_URL must point at the database "fermentfreude".')
  process.exit(1)
}
const req = createRequire(import.meta.url)
const { MongoClient } = createRequire(
  createRequire(req.resolve('@payloadcms/db-mongodb')).resolve('mongoose'),
)('mongodb')
const c = new MongoClient(uri)
await c.connect()
const D = c.db()
const find = (col: string, q: object = {}, projection: object = {}) =>
  D.collection(col).find(q, { projection }).toArray()
const count = (col: string, q: object = {}) => D.collection(col).countDocuments(q)
const loc = (v: any) =>
  v && typeof v === 'object' && !(v instanceof Date) && ('de' in v || 'en' in v)
    ? (v.de ?? v.en)
    : v
const day = (d: any) =>
  new Date(d).toLocaleString('de-AT', {
    timeZone: 'Europe/Vienna',
    dateStyle: 'short',
    timeStyle: 'short',
  })
const mask = (e?: string) => String(e ?? '').replace(/(.{2}).*(@.*)/, '$1***$2')
const issues: string[] = []
const note = (s: string) => {
  issues.push(s)
  console.log('   ⚠️ ', s)
}
const now = new Date()

// ── 1. seats ───────────────────────────────────────────────────
console.log('1. SEATS (future dates): free spots shown vs. capacity minus booked seats')
const workshops = await find('workshops', {}, { title: 1, slug: 1, maxCapacity: 1 })
const wById = new Map(workshops.map((w: any) => [String(w._id), w]))
const appts = await find(
  'workshop-appointments',
  { dateTime: { $gt: now } },
  { workshop: 1, dateTime: 1, availableSpots: 1, isPublished: 1, cancellationStatus: 1 },
)
appts.sort((a: any, b: any) => +new Date(a.dateTime) - +new Date(b.dateTime))
const liveStatuses = ['confirmed', 'pending']
for (const a of appts) {
  const w: any = wById.get(String(a.workshop))
  const cap = w?.maxCapacity
  const bookings = await find(
    'workshop-bookings',
    { appointmentId: String(a._id), status: { $in: liveStatuses } },
    { status: 1, guestCount: 1, holdExpiresAt: 1 },
  )
  const confirmed = bookings
    .filter((b: any) => b.status === 'confirmed')
    .reduce((s: number, b: any) => s + (b.guestCount ?? 1), 0)
  const held = bookings
    .filter(
      (b: any) => b.status === 'pending' && b.holdExpiresAt && new Date(b.holdExpiresAt) > now,
    )
    .reduce((s: number, b: any) => s + (b.guestCount ?? 1), 0)
  const expected = typeof cap === 'number' ? cap - confirmed - held : null
  const ok = expected === null || a.availableSpots === expected
  console.log(
    `   ${ok ? '✅' : '❌'} ${String(loc(w?.title) ?? '?')
      .slice(0, 26)
      .padEnd(
        26,
      )} ${day(a.dateTime).padEnd(16)} shown free=${String(a.availableSpots).padStart(2)}  capacity=${cap ?? '?'}  confirmed=${confirmed} held=${held}  expected free=${expected ?? '?'}  ${a.isPublished ? '' : '(unpublished)'}${a.cancellationStatus && a.cancellationStatus !== 'none' ? ` cancel=${a.cancellationStatus}` : ''}`,
  )
  if (!ok)
    note(
      `${loc(w?.title)} ${day(a.dateTime)}: shows ${a.availableSpots} free, bookings say ${expected}`,
    )
  if (typeof a.availableSpots === 'number' && a.availableSpots < 0)
    note(`${loc(w?.title)} ${day(a.dateTime)}: NEGATIVE spots (${a.availableSpots}) = overbooked`)
}

// ── 2. bookings ────────────────────────────────────────────────
console.log('\n2. BOOKINGS')
const byStatus: Record<string, number> = {}
for (const b of await find('workshop-bookings', {}, { status: 1 }))
  byStatus[b.status] = (byStatus[b.status] ?? 0) + 1
console.log('   by status:', JSON.stringify(byStatus))
const stale = await find(
  'workshop-bookings',
  { status: 'pending', holdExpiresAt: { $lt: new Date(+now - 3600_000) } },
  { workshopTitle: 1, date: 1, holdExpiresAt: 1, email: 1 },
)
console.log(`   pending holds that expired more than 1 h ago: ${stale.length}`)
for (const s of stale.slice(0, 5))
  console.log(
    `     - ${s.workshopTitle} ${s.date ?? ''} expired ${day(s.holdExpiresAt)} ${mask(s.email)}`,
  )
if (stale.length)
  note(`${stale.length} expired pending holds still present (they should be released/cleaned)`)
const allApptIds = new Set(
  (await find('workshop-appointments', {}, { _id: 1 })).map((x: any) => String(x._id)),
)
const confirmed = await find(
  'workshop-bookings',
  { status: 'confirmed' },
  { appointmentId: 1, orderId: 1, cartSlug: 1, email: 1, workshopTitle: 1, date: 1, createdAt: 1 },
)
const orphan = confirmed.filter(
  (b: any) => b.appointmentId && !allApptIds.has(String(b.appointmentId)),
)
const noOrder = confirmed.filter((b: any) => !b.orderId && !b.cartSlug)
console.log(
  `   confirmed bookings: ${confirmed.length} | pointing at a missing date: ${orphan.length} | with neither order nor cart link: ${noOrder.length}`,
)
if (orphan.length) note(`${orphan.length} confirmed bookings point at a date that no longer exists`)
for (const b of noOrder.slice(0, 5))
  console.log(
    `     - ${b.workshopTitle} ${b.date ?? ''} ${mask(b.email)} (created ${day(b.createdAt)})`,
  )

// ── 3. orders ──────────────────────────────────────────────────
console.log('\n3. ORDERS')
const oStatus: Record<string, number> = {}
for (const o of await find('orders', {}, { status: 1 }))
  oStatus[o.status] = (oStatus[o.status] ?? 0) + 1
console.log('   by status:', JSON.stringify(oStatus))
const stuck = await find(
  'orders',
  { status: { $in: ['processing', 'pending'] }, createdAt: { $lt: new Date(+now - 86400_000) } },
  { createdAt: 1, status: 1, amount: 1, customerEmail: 1 },
)
console.log(`   still "processing/pending" after more than 1 day: ${stuck.length}`)
for (const o of stuck.slice(0, 6))
  console.log(
    `     - ${day(o.createdAt)} ${o.status} ${(o.amount ?? 0) / 100} € ${mask(o.customerEmail)}`,
  )
if (stuck.length) note(`${stuck.length} orders stuck in processing/pending for over a day`)
const last = (await find('orders', {}, { createdAt: 1, status: 1, amount: 1 })).sort(
  (a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt),
)[0]
console.log(
  `   newest order: ${day(last.createdAt)} (${last.status}, ${(last.amount ?? 0) / 100} €)`,
)

// ── 4. vouchers ────────────────────────────────────────────────
console.log('\n4. VOUCHERS')
const vs = await find(
  'vouchers',
  {},
  {
    code: 1,
    status: 1,
    value: 1,
    redeemed: 1,
    redeemedOn: 1,
    emailDeliveryFailed: 1,
    origin: 1,
    createdAt: 1,
  },
)
const vStatus: Record<string, number> = {}
for (const v of vs)
  vStatus[`${v.status}${v.redeemed ? '/redeemed' : ''}`] =
    (vStatus[`${v.status}${v.redeemed ? '/redeemed' : ''}`] ?? 0) + 1
console.log('   by status:', JSON.stringify(vStatus), '| total', vs.length)
const codes = new Map<string, number>()
for (const v of vs) codes.set(v.code, (codes.get(v.code) ?? 0) + 1)
const dupes = [...codes].filter(([, n]) => n > 1)
console.log(`   duplicate codes: ${dupes.length}`)
if (dupes.length) note(`duplicate voucher codes: ${dupes.map(([k]) => k).join(', ')}`)
const redeemedNoDate = vs.filter((v: any) => v.redeemed && !v.redeemedOn)
console.log(`   redeemed but without a redemption date: ${redeemedNoDate.length}`)
const emailFail = vs.filter((v: any) => v.emailDeliveryFailed)
console.log(`   voucher emails that failed to send: ${emailFail.length}`)
if (emailFail.length)
  note(
    `${emailFail.length} vouchers have emailDeliveryFailed=true (${emailFail
      .slice(0, 4)
      .map((v: any) => v.code)
      .join(', ')})`,
  )
console.log(
  `   active workshop vouchers (99 €) waiting to be used: ${vs.filter((v: any) => v.status === 'active' && v.value === 99).length}`,
)

// ── 5. site content ────────────────────────────────────────────
console.log('\n5. CONTENT')
for (const slug of ['home', 'voucher']) {
  const p = await D.collection('pages').findOne(
    { slug },
    { projection: { _status: 1, updatedAt: 1 } },
  )
  const v = await D.collection('_pages_versions')
    .find({ parent: p!._id })
    .sort({ updatedAt: -1 })
    .limit(1)
    .toArray()
  console.log(
    `   page ${slug.padEnd(8)} ${p!._status}, saved ${day(p!.updatedAt)}, latest version ${v[0]?.version?._status}`,
  )
  if (v[0]?.version?._status === 'draft')
    note(`page "${slug}" has an unpublished draft as its latest version`)
}
const lowStock = await find(
  'products',
  { _status: 'published', inventory: { $lte: 0 }, productType: { $ne: 'workshop' } },
  { title: 1, inventory: 1 },
)
console.log(
  `   shop products published with stock ≤ 0: ${lowStock.length}${lowStock.length ? ' → ' + lowStock.map((p: any) => loc(p.title)).join(', ') : ''}`,
)

console.log(
  `\n${issues.length ? `RESULT: ${issues.length} thing(s) to look at (marked ⚠️ above)` : 'RESULT: nothing wrong found'}`,
)
await c.close()
