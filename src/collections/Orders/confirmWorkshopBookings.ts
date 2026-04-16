import type { CollectionAfterChangeHook } from 'payload'

/**
 * confirmWorkshopBookings — Orders afterChange hook.
 *
 * When an order is created (payment confirmed), find any pending
 * WorkshopBooking records that match the order's workshop items
 * and mark them as "confirmed".
 *
 * Workshop items are identified by their product having a slug
 * starting with "workshop-".
 *
 * MongoDB Atlas M0: sequential writes only — no Promise.all.
 */
export const confirmWorkshopBookings: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const { payload } = req

  const items: {
    product?: string | { id?: string; slug?: string } | null
    quantity?: number
    metadata?: Record<string, unknown>
  }[] = doc.items ?? []

  // Get customer email from order for updating the booking
  const customerId = typeof doc.customer === 'object' ? doc.customer?.id : doc.customer
  let customerEmail: string | undefined
  let customerName: string | undefined

  if (customerId) {
    try {
      const user = await payload.findByID({
        collection: 'users',
        id: customerId,
        depth: 0,
        overrideAccess: true,
      })
      customerEmail = user?.email || undefined
      customerName = user?.name || undefined
    } catch {
      // Non-fatal: booking still gets confirmed
    }
  }

  for (const item of items) {
    const productRef = item?.product
    if (!productRef) continue

    let productSlug: string | null = null

    if (typeof productRef === 'string') {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: productRef,
          depth: 0,
          overrideAccess: true,
        })
        productSlug = (product as unknown as Record<string, unknown>)?.slug as string | null
      } catch {
        continue
      }
    } else if (typeof productRef === 'object') {
      productSlug = (productRef as Record<string, unknown>).slug as string | null
    }

    // Only process workshop products
    if (!productSlug || !productSlug.startsWith('workshop-')) continue

    // Find pending bookings for this workshop
    const workshopSlug = productSlug.replace('workshop-', '')
    const pendingBookings = await payload.find({
      collection: 'workshop-bookings',
      where: {
        and: [{ workshopSlug: { equals: workshopSlug } }, { status: { equals: 'pending' } }],
      },
      sort: '-createdAt',
      limit: 1,
      overrideAccess: true,
    })

    if (pendingBookings.totalDocs === 0) continue

    const booking = pendingBookings.docs[0]

    // Confirm the booking and attach customer info
    const updateData: Record<string, unknown> = {
      status: 'confirmed',
    }

    if (customerEmail && !booking.email) {
      updateData.email = customerEmail
    }
    if (customerName && !booking.firstName) {
      updateData.firstName = customerName
    }

    await payload.update({
      collection: 'workshop-bookings',
      id: booking.id,
      data: updateData,
      overrideAccess: true,
    })

    payload.logger.info(
      `[confirmWorkshopBookings] Confirmed booking ${booking.id} for workshop "${workshopSlug}" via order ${doc.id}`,
    )
  }

  return doc
}
