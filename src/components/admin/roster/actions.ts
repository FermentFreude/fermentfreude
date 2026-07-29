'use server'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function updatePickupStatus(
  orderId: string,
  status: 'pending' | 'ready' | 'collected',
): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.update({
    collection: 'orders',
    id: orderId,
    data: { pickupStatus: status },
    overrideAccess: true,
  })
}

export async function deleteVoucher(voucherId: string): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.delete({
    collection: 'vouchers',
    id: voucherId,
    overrideAccess: true,
  })
}

export async function createVoucher(params: {
  value: number
  purchaserName?: string
  recipientName?: string
  recipientEmail?: string
  personalNote?: string
}): Promise<{ code: string; id: string }> {
  const payload = await getPayload({ config: configPromise })
  const created = await payload.create({
    collection: 'vouchers',
    draft: false,
    data: {
      // code is intentionally omitted — beforeValidate hook generates it
      value: params.value,
      status: 'active',
      deliveryMethod: 'pdf',
      // Empty strings omitted — purchaserEmail is no longer required (manually-created vouchers have no online buyer)
      ...(params.purchaserName?.trim() ? { purchaserName: params.purchaserName.trim() } : {}),
      ...(params.recipientName?.trim() ? { recipientName: params.recipientName.trim() } : {}),
      ...(params.recipientEmail?.trim() ? { recipientEmail: params.recipientEmail.trim() } : {}),
      ...(params.personalNote?.trim() ? { personalNote: params.personalNote.trim() } : {}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    overrideAccess: true,
  })
  const v = created as unknown as { code?: string; id: string }
  return { code: v.code ?? String(created.id), id: String(created.id) }
}

/**
 * Cosmetic-only acknowledgment (plan §8 step 5) — lets a founder mark "I've
 * submitted this in Stripe" so the Refunds queue reflects what they've
 * actioned vs. not yet looked at. NOT authoritative: the charge.refunded
 * webhook is what actually moves a row to 'completed', regardless of
 * whether anyone clicked this first.
 */
export async function acknowledgeRefundRequest(refundRequestId: string): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.update({
    collection: 'refund-requests',
    id: refundRequestId,
    data: { status: 'acknowledged', acknowledgedAt: new Date().toISOString() },
    overrideAccess: true,
  })
}

/** Marks specific activity-events as read by the current admin user. */
export async function markActivityEventsRead(eventIds: string[]): Promise<void> {
  if (eventIds.length === 0) return
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return

  // Sequential — MongoDB Atlas M0 has no multi-document transactions.
  for (const id of eventIds) {
    const event = await payload.findByID({ collection: 'activity-events', id, overrideAccess: true })
    const readBy = (Array.isArray(event.readBy) ? event.readBy : []).map((r) =>
      typeof r === 'object' && r !== null ? r.id : r,
    )
    if (readBy.includes(user.id)) continue
    await payload.update({
      collection: 'activity-events',
      id,
      data: { readBy: [...readBy, user.id] },
      overrideAccess: true,
    })
  }
}

/** Marks every currently-unread activity-event as read by the current admin user. */
export async function markAllActivityEventsRead(): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return

  const recent = await payload.find({
    collection: 'activity-events',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  for (const event of recent.docs) {
    const readBy = (Array.isArray(event.readBy) ? event.readBy : []).map((r) =>
      typeof r === 'object' && r !== null ? r.id : r,
    )
    if (readBy.includes(user.id)) continue
    await payload.update({
      collection: 'activity-events',
      id: event.id,
      data: { readBy: [...readBy, user.id] },
      overrideAccess: true,
    })
  }
}
