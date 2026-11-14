/**
 * freeze-invoice-items.ts
 *
 * One-off: freezes the lines of every ALREADY ISSUED invoice (orders with an invoice number
 * and no frozen lines yet), so moving a booking or changing a price later can never change them.
 * New invoices are frozen automatically when they are issued (src/hooks/freezeInvoice.ts).
 *
 * It writes one field (`invoiceItemsSnapshot`) per order, once, and never overwrites an existing one.
 * The lines come from the bookings as they are NOW — so run it before bookings of old invoices are moved.
 *
 *   FREEZE_TARGET=staging  npx tsx src/scripts/freeze-invoice-items.ts [--dry-run]
 *
 * Production: refuses unless FREEZE_TARGET=production AND --confirm-production is given (Rafaela's go).
 */
import 'dotenv/config'

import { getPayload } from 'payload'

import config from '@payload-config'
import { buildOrderReceiptData } from '@/lib/buildOrderReceiptData'

const url = process.env.DATABASE_URL ?? ''
const target = process.env.FREEZE_TARGET ?? ''
const isStaging = /\/fermentfreude-staging(\?|$)/.test(url)
const isProd = /\/fermentfreude(\?|$)/.test(url)
if (target === 'staging' ? !isStaging : target === 'production' ? !isProd || !process.argv.includes('--confirm-production') : true) {
  console.error('Refusing to run: set FREEZE_TARGET=staging (DATABASE_URL must be the staging database), or FREEZE_TARGET=production with --confirm-production.')
  process.exit(1)
}
const dry = process.argv.includes('--dry-run')

const main = async () => {
  const payload = await getPayload({ config })
  const orders = await payload.find({ collection: 'orders', where: { invoiceNumber: { exists: true } }, limit: 5000, depth: 0, overrideAccess: true })
  let todo = 0, frozen = 0, empty = 0
  for (const o of orders.docs as unknown as Array<{ id: string; invoiceItemsSnapshot?: { items?: unknown[] } | null }>) {
    if (o.invoiceItemsSnapshot?.items?.length) continue
    todo++
    if (dry) continue
    const full = await payload.findByID({ collection: 'orders', id: o.id, depth: 2, overrideAccess: true })
    await buildOrderReceiptData(payload, full as unknown as Record<string, unknown>) // freezes on first build
    const check = (await payload.findByID({ collection: 'orders', id: o.id, depth: 0, overrideAccess: true })) as unknown as { invoiceItemsSnapshot?: { items?: unknown[] } | null }
    if (check.invoiceItemsSnapshot?.items?.length) frozen++
    else empty++
  }
  console.log(`${orders.totalDocs} invoices | not frozen yet: ${todo}${dry ? ' (dry run, nothing written)' : ` | frozen now: ${frozen} | no lines found: ${empty}`}`)
  process.exit(0)
}
main().catch((e) => {
  console.error('FAIL', e)
  process.exit(1)
})
