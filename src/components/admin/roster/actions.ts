'use server'

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
