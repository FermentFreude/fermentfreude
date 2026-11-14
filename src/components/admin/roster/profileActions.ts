'use server'

import configPromise from '@payload-config'
import { getPayload, type Payload, type Where } from 'payload'

import { BOOKING_HISTORY_TYPES } from '@/lib/bookingHistory'

import { toBookingRow } from './fetchRosterData'
import { requireAdminUser } from './requireAdmin'
import type { BookingRow } from './types'

/**
 * Everything the system knows about one person (or, scoped, about one booking).
 * Read-only — the actions (move, edit, …) are the existing ones from actions.ts.
 */

export type ProfileVoucher = {
  id: string
  code: string
  /** How this person is connected to the voucher. */
  role: 'bought' | 'received' | 'used'
  value: number
  status: string
  createdAt: string
  purchaser: string
  recipient: string
  redeemed: boolean
  redeemedOn: string
  redeemedForWorkshop: string
}

export type ProfileOrder = {
  id: string
  invoiceNumber: string
  createdAt: string
  status: string
  amount: number // cents
  /** Short description: workshop seats, voucher, products. */
  what: string
  paymentMethod: string
  voucherCodes: string[]
  hasInvoice: boolean
}

export type ProfileLink = {
  id: string
  bookingId: string
  scope: string
  issuedAt: string
  openedAt: string
  expiresAt: string
}

export type ProfileRefund = {
  id: string
  bookingId: string
  createdAt: string
  status: string
  policyResult: string
  amount: number // cents
  initiatedBy: string
}

export type ProfileEvent = {
  id: string
  at: string
  /** Used for the icon and the filter chips. */
  kind: 'booking' | 'team' | 'customer' | 'link' | 'order' | 'voucher' | 'refund' | 'email' | 'note'
  type: string
  title: string
  summary: string
  by: string
  /** Which booking this is about ("Basics · 12.11.2026") — shown when more than one is in the profile. */
  context: string
  bookingId: string
}

export type CustomerProfile = {
  name: string
  email: string
  phone: string
  customerSince: string
  hasAccount: boolean
  bookings: BookingRow[]
  orders: ProfileOrder[]
  vouchers: ProfileVoucher[]
  links: ProfileLink[]
  refunds: ProfileRefund[]
  events: ProfileEvent[]
  /** True when only one booking (and what belongs to it) is included. */
  scoped: boolean
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const idOf = (v: unknown): string =>
  v && typeof v === 'object' && 'id' in v ? String((v as { id: unknown }).id) : v == null ? '' : String(v)
const personName = (first: unknown, last: unknown) => [text(first), text(last)].filter(Boolean).join(' ')

const HISTORY_LABEL = new Map<string, string>(BOOKING_HISTORY_TYPES.map((t) => [t.value, t.label]))
const CUSTOMER_TYPES = new Set(['customer_rebooked', 'customer_voucher', 'customer_cancelled', 'refund_requested', 'link_opened', 'created_online'])
const MAX_BOOKINGS = 60

type Doc = Record<string, unknown> & { id: string | number; createdAt?: string }

async function bookingsFor(payload: Payload, email: string): Promise<Doc[]> {
  const found = new Map<string, Doc>()
  const queries: Where[] = [{ email: { equals: email } }, { 'seats.email': { equals: email } }]
  for (const where of queries) {
    const r = await payload.find({ collection: 'workshop-bookings', where, limit: MAX_BOOKINGS, depth: 0, overrideAccess: true })
    for (const d of r.docs) found.set(String(d.id), d as unknown as Doc)
  }
  return [...found.values()]
}

/** The booking, the bookings it was rebooked from and the ones it was rebooked to. */
async function chainOf(payload: Payload, bookingId: string): Promise<Doc[]> {
  const out = new Map<string, Doc>()
  const queue = [bookingId]
  while (queue.length && out.size < 12) {
    const id = queue.shift() as string
    if (out.has(id)) continue
    let b: Doc
    try {
      b = (await payload.findByID({ collection: 'workshop-bookings', id, depth: 0, overrideAccess: true })) as unknown as Doc
    } catch {
      continue
    }
    out.set(id, b)
    for (const s of (b.seats as Array<Record<string, unknown>> | undefined) ?? []) {
      for (const next of [idOf(s.rebookedFromBookingId), idOf(s.rebookedToBookingId)]) if (next) queue.push(next)
    }
  }
  return [...out.values()]
}

export async function getCustomerProfile(params: { email?: string; bookingId?: string }): Promise<CustomerProfile> {
  const payload = await getPayload({ config: configPromise })
  await requireAdminUser(payload)

  const scoped = Boolean(params.bookingId)
  let email = text(params.email)
  let bookingDocs: Doc[] = []

  if (params.bookingId) {
    bookingDocs = await chainOf(payload, params.bookingId)
    if (!email) email = text(bookingDocs.find((b) => String(b.id) === params.bookingId)?.email)
  } else if (email) {
    bookingDocs = await bookingsFor(payload, email)
  }
  const bookingIds = bookingDocs.map((b) => String(b.id))
  const label = new Map(bookingDocs.map((b) => [String(b.id), `${text(b.workshopTitle)} · ${text(b.date)}`]))
  const events: ProfileEvent[] = []

  // ── Orders: the ones the bookings belong to (+ everything this email bought, unless scoped) ──
  const orderIds = new Set(bookingDocs.map((b) => text(b.orderId)).filter(Boolean))
  const orderDocs = new Map<string, Doc>()
  for (const id of orderIds) {
    try {
      orderDocs.set(id, (await payload.findByID({ collection: 'orders', id, depth: 1, overrideAccess: true })) as unknown as Doc)
    } catch {
      /* order was deleted — the booking still shows */
    }
  }
  if (!scoped && email) {
    const r = await payload.find({ collection: 'orders', where: { customerEmail: { equals: email } }, limit: 100, depth: 1, overrideAccess: true, sort: '-createdAt' })
    for (const d of r.docs) orderDocs.set(String(d.id), d as unknown as Doc)
  }

  // ── Vouchers: bought by / sent to this person, and the ones used to pay ──
  const voucherDocs = new Map<string, { doc: Doc; role: ProfileVoucher['role'] }>()
  const orders: ProfileOrder[] = []
  const usedCodes = new Set<string>()
  for (const o of orderDocs.values()) {
    const txIds = ((o.transactions as unknown[]) ?? []).map(idOf).filter(Boolean)
    let codes: string[] = []
    let method = text(o.paymentMethod)
    if (txIds.length) {
      const tx = await payload.find({ collection: 'transactions', where: { id: { in: txIds } }, limit: 20, depth: 0, overrideAccess: true })
      codes = tx.docs.map((t) => text((t as unknown as { voucherCode?: string }).voucherCode)).filter(Boolean)
      if (!method) method = 'stripe'
    }
    codes.forEach((c) => usedCodes.add(c))
    const items = ((o.items as Array<{ product?: unknown; quantity?: number }>) ?? []).map((i) => {
      const p = i.product && typeof i.product === 'object' ? (i.product as Record<string, unknown>) : null
      return `${i.quantity ?? 1}× ${text(p?.title) || 'Produkt'}`
    })
    const linkedBookings = bookingDocs.filter((b) => text(b.orderId) === String(o.id))
    const what =
      linkedBookings.length > 0
        ? linkedBookings.map((b) => `${text(b.workshopTitle)} (${Number(b.guestCount ?? 1)} Pl.)`).join(', ')
        : items.length > 0
          ? items.join(', ')
          : 'Gutschein'
    const invoiceNumber = text(o.invoiceNumber)
    orders.push({
      id: String(o.id),
      invoiceNumber: invoiceNumber || String(o.id).slice(-8).toUpperCase(),
      createdAt: String(o.createdAt ?? ''),
      status: text(o.status),
      amount: Number(o.amount ?? 0),
      what,
      paymentMethod: method,
      voucherCodes: codes,
      hasInvoice: Boolean(invoiceNumber),
    })
    events.push({
      id: `order-${o.id}`,
      at: String(o.createdAt ?? ''),
      kind: 'order',
      type: 'order',
      title: 'Bestellung',
      summary: `${invoiceNumber || `#${String(o.id).slice(-8).toUpperCase()}`} · ${what} · € ${(Number(o.amount ?? 0) / 100).toFixed(2)}${codes.length ? ` · bezahlt mit Gutschein ${codes.join(', ')}` : ''}`,
      by: '',
      context: '',
      bookingId: linkedBookings[0] ? String(linkedBookings[0].id) : '',
    })
    const pv = idOf(o.purchasedVoucher)
    if (pv) {
      try {
        voucherDocs.set(pv, { doc: (await payload.findByID({ collection: 'vouchers', id: pv, depth: 0, overrideAccess: true })) as unknown as Doc, role: 'bought' })
      } catch {
        /* ignore */
      }
    }
  }
  if (!scoped && email) {
    for (const [field, role] of [['purchaserEmail', 'bought'], ['recipientEmail', 'received']] as const) {
      const r = await payload.find({ collection: 'vouchers', where: { [field]: { equals: email } }, limit: 50, depth: 0, overrideAccess: true })
      for (const d of r.docs) if (!voucherDocs.has(String(d.id))) voucherDocs.set(String(d.id), { doc: d as unknown as Doc, role })
    }
  }
  if (usedCodes.size) {
    const r = await payload.find({ collection: 'vouchers', where: { code: { in: [...usedCodes] } }, limit: 50, depth: 0, overrideAccess: true })
    for (const d of r.docs) if (!voucherDocs.has(String(d.id))) voucherDocs.set(String(d.id), { doc: d as unknown as Doc, role: 'used' })
  }
  const vouchers: ProfileVoucher[] = [...voucherDocs.values()].map(({ doc: v, role }) => ({
    id: String(v.id),
    code: text(v.code),
    role,
    value: Number(v.value ?? 0),
    status: text(v.status),
    createdAt: String(v.createdAt ?? ''),
    purchaser: [text(v.purchaserName), text(v.purchaserEmail)].filter(Boolean).join(' · '),
    recipient: [text(v.recipientName), text(v.recipientEmail)].filter(Boolean).join(' · '),
    redeemed: Boolean(v.redeemed),
    redeemedOn: String(v.redeemedOn ?? ''),
    redeemedForWorkshop: text(v.redeemedForWorkshop),
  }))
  for (const v of vouchers) {
    const roleText = v.role === 'bought' ? 'gekauft' : v.role === 'received' ? 'erhalten' : 'zum Bezahlen benutzt'
    events.push({
      id: `voucher-${v.id}`, at: v.createdAt, kind: 'voucher', type: 'voucher_created',
      title: `Gutschein ${roleText}`,
      summary: `${v.code} · € ${v.value.toFixed(2)}${v.recipient ? ` · für ${v.recipient}` : ''}`,
      by: '', context: '', bookingId: '',
    })
    if (v.redeemed && v.redeemedOn) {
      events.push({
        id: `voucher-red-${v.id}`, at: v.redeemedOn, kind: 'voucher', type: 'voucher_redeemed',
        title: 'Gutschein eingelöst',
        summary: `${v.code}${v.redeemedForWorkshop ? ` · für ${v.redeemedForWorkshop}` : ''}`,
        by: '', context: '', bookingId: '',
      })
    }
  }

  // ── Management links + refunds + notes for these bookings ──
  const links: ProfileLink[] = []
  const refunds: ProfileRefund[] = []
  if (bookingIds.length) {
    const l = await payload.find({ collection: 'booking-magic-links', where: { bookingId: { in: bookingIds } }, limit: 100, depth: 0, overrideAccess: true, sort: '-issuedAt' })
    for (const d of l.docs as unknown as Doc[]) {
      const link: ProfileLink = {
        id: String(d.id), bookingId: idOf(d.bookingId), scope: text(d.scope),
        issuedAt: String(d.issuedAt ?? ''), openedAt: String(d.openedAt ?? ''), expiresAt: String(d.expiresAt ?? ''),
      }
      links.push(link)
      const what = link.scope === 'date-offer' ? 'Link „Neuen Termin wählen“' : link.scope === 'organiser-cancellation' ? 'Link nach Absage durch uns' : 'Verwaltungs-Link (Kund:in)'
      events.push({ id: `link-${link.id}`, at: link.issuedAt, kind: 'link', type: 'link_issued', title: `${what} verschickt`, summary: link.expiresAt ? `gültig bis ${new Date(link.expiresAt).toLocaleDateString('de-DE', { timeZone: 'Europe/Vienna' })}` : '', by: '', context: label.get(link.bookingId) ?? '', bookingId: link.bookingId })
      if (link.openedAt) events.push({ id: `link-open-${link.id}`, at: link.openedAt, kind: 'link', type: 'link_opened', title: `${what} geöffnet`, summary: '', by: '', context: label.get(link.bookingId) ?? '', bookingId: link.bookingId })
    }
    const r = await payload.find({ collection: 'refund-requests', where: { booking: { in: bookingIds } }, limit: 100, depth: 0, overrideAccess: true, sort: '-createdAt' })
    for (const d of r.docs as unknown as Doc[]) {
      const f: ProfileRefund = {
        id: String(d.id), bookingId: idOf(d.booking), createdAt: String(d.createdAt ?? ''),
        status: text(d.status), policyResult: text(d.policyResult), amount: Number(d.requestedAmount ?? 0), initiatedBy: text(d.initiatedBy),
      }
      refunds.push(f)
      events.push({ id: `refund-${f.id}`, at: f.createdAt, kind: 'refund', type: 'refund', title: `Erstattung (${f.status})`, summary: `${f.policyResult.replace(/_/g, ' ')} · € ${(f.amount / 100).toFixed(2)} · von ${f.initiatedBy === 'admin' ? 'uns' : 'Kund:in'} angefragt`, by: '', context: label.get(f.bookingId) ?? '', bookingId: f.bookingId })
    }
    const n = await payload.find({ collection: 'attention-notes', where: { bookingId: { in: bookingIds } }, limit: 50, depth: 0, overrideAccess: true })
    for (const d of n.docs as unknown as Doc[]) {
      const msgs = (d.messages as Array<{ byName?: string; at?: string; text?: string }> | undefined) ?? []
      events.push({ id: `note-${d.id}`, at: String(d.createdAt ?? ''), kind: 'note', type: 'note', title: 'Notiz im Team', summary: [text(d.title), text(d.body)].filter(Boolean).join(' — ') + (msgs.length ? ` (${msgs.length} Antworten)` : ''), by: text(d.createdByName), context: label.get(text(d.bookingId)) ?? '', bookingId: text(d.bookingId) })
    }
  }

  // ── Booking histories (the "Verlauf" of every booking) ──
  for (const b of bookingDocs) {
    const ctx = label.get(String(b.id)) ?? ''
    const history = (b.history as Array<{ id?: string; at?: string; type?: string; summary?: string; by?: string }> | undefined) ?? []
    for (const h of history) {
      const type = h.type ?? ''
      events.push({
        id: `h-${b.id}-${h.id}`, at: h.at ?? '', kind: CUSTOMER_TYPES.has(type) ? 'customer' : /sent|reminder|alternate/.test(type) ? 'email' : 'team',
        type, title: HISTORY_LABEL.get(type) ?? 'Eintrag', summary: h.summary ?? '', by: h.by ?? '', context: ctx, bookingId: String(b.id),
      })
    }
    if (!history.some((h) => h.type?.startsWith('created_')) && b.createdAt) {
      events.push({ id: `h-${b.id}-created`, at: String(b.createdAt), kind: 'booking', type: 'created', title: b.orderId ? 'Online gebucht' : 'Buchung erstellt', summary: 'frühere Schritte wurden noch nicht aufgezeichnet', by: '', context: ctx, bookingId: String(b.id) })
    }
  }

  events.sort((a, c) => new Date(c.at).getTime() - new Date(a.at).getTime())
  const first = bookingDocs[0]
  const earliest = [...bookingDocs.map((b) => String(b.createdAt ?? '')), ...orders.map((o) => o.createdAt)].filter(Boolean).sort()[0] ?? ''
  const hasAccount = email
    ? (await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true })).totalDocs > 0
    : false

  return {
    name: first ? personName(first.firstName, first.lastName) || email : email,
    email,
    phone: text(bookingDocs.find((b) => text(b.phone))?.phone),
    customerSince: earliest,
    hasAccount,
    bookings: bookingDocs.map((b) => toBookingRow(b as never)).sort((a, c) => (c.createdAt > a.createdAt ? 1 : -1)),
    orders: orders.sort((a, c) => (c.createdAt > a.createdAt ? 1 : -1)),
    vouchers,
    links,
    refunds,
    events,
    scoped,
  }
}
