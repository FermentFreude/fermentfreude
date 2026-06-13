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
      code: '',
      value: params.value,
      status: 'active',
      deliveryMethod: 'pdf',
      purchaserName: params.purchaserName ?? '',
      purchaserEmail: '',
      recipientName: params.recipientName ?? '',
      recipientEmail: params.recipientEmail ?? '',
      personalNote: params.personalNote ?? '',
    },
    overrideAccess: true,
  })
  const v = created as unknown as { code?: string; id: string }
  return { code: v.code ?? String(created.id), id: String(created.id) }
}
