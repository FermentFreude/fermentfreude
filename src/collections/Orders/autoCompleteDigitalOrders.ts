import type { CollectionAfterChangeHook } from 'payload'

/**
 * autoCompleteDigitalOrders — Orders afterChange hook.
 *
 * When an order is created and all items are digital (courses)
 * or workshops (no physical shipping needed), auto-set the
 * order status to "completed".
 *
 * Runs AFTER confirmWorkshopBookings and autoEnrollOnPurchase
 * so those hooks process first.
 */
export const autoCompleteDigitalOrders: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const items: {
    product?: string | { id?: string; slug?: string; productType?: string } | null
    quantity?: number
  }[] = doc.items ?? []

  if (items.length === 0) return doc

  const { payload } = req

  // Check if ALL items are digital or workshop (no shipping needed)
  let allDigitalOrWorkshop = true

  for (const item of items) {
    const productRef = item?.product
    if (!productRef) continue

    let productType: string | null = null
    let productSlug: string | null = null

    if (typeof productRef === 'string') {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: productRef,
          depth: 0,
          overrideAccess: true,
        })
        const p = product as unknown as Record<string, unknown>
        productType = (p?.productType as string) || null
        productSlug = (p?.slug as string) || null
      } catch {
        // If we can't resolve the product, assume physical
        allDigitalOrWorkshop = false
        break
      }
    } else if (typeof productRef === 'object') {
      productType = (productRef as Record<string, unknown>).productType as string | null
      productSlug = (productRef as Record<string, unknown>).slug as string | null
    }

    const isDigital = productType === 'digital-course'
    const isWorkshop =
      productType === 'workshop' || (productSlug && productSlug.startsWith('workshop-'))

    if (!isDigital && !isWorkshop) {
      allDigitalOrWorkshop = false
      break
    }
  }

  if (!allDigitalOrWorkshop) return doc

  // All items are digital/workshop — auto-complete
  try {
    await payload.update({
      collection: 'orders',
      id: doc.id,
      data: { status: 'completed' },
      overrideAccess: true,
    })
    payload.logger.info(
      `[autoCompleteDigitalOrders] Auto-completed order ${doc.id} (all items digital/workshop)`,
    )
  } catch (error) {
    payload.logger.error(
      `[autoCompleteDigitalOrders] Failed to auto-complete order ${doc.id}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
