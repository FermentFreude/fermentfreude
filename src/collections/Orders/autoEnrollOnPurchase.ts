import type { CollectionAfterChangeHook } from 'payload'

/**
 * autoEnrollOnPurchase — Orders afterChange hook.
 *
 * Orders are ONLY created after Stripe confirms payment (via `confirmOrder`
 * endpoint). So `operation === 'create'` is sufficient to detect a paid order.
 *
 * Order items store product IDs as strings (flattened from cart snapshot), so
 * we fetch each product to read its `courseSlug` field.
 *
 * MongoDB Atlas M0: no transactions — sequential writes only.
 */
export const autoEnrollOnPurchase: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // Orders are created exactly once, immediately after Stripe payment succeeds.
  if (operation !== 'create') return doc

  const customerId =
    typeof doc.customer === 'object' ? doc.customer?.id : doc.customer
  if (!customerId) return doc

  const items: { product?: string | { id?: string; courseSlug?: string | null } | null }[] =
    doc.items ?? []

  const { payload } = req

  for (const item of items) {
    const productRef = item?.product
    if (!productRef) continue

    let courseSlug: string | null = null

    if (typeof productRef === 'string') {
      // Product stored as ID — fetch it to read courseSlug
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: productRef,
          depth: 0,
          overrideAccess: true,
        })
        courseSlug = ((product as unknown) as Record<string, unknown>)?.courseSlug as string | null ?? null
      } catch {
        continue
      }
    } else if (typeof productRef === 'object') {
      courseSlug = (productRef as Record<string, unknown>).courseSlug as string | null ?? null
    }

    if (!courseSlug || typeof courseSlug !== 'string') continue

    // Check for existing enrollment (idempotent)
    const existing = await payload.find({
      collection: 'enrollments',
      where: {
        and: [
          { user: { equals: customerId } },
          { courseSlug: { equals: courseSlug } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) continue

    // Create enrollment
    await payload.create({
      collection: 'enrollments',
      data: {
        user: customerId,
        courseSlug,
        orderId: String(doc.id),
        enrolledAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    payload.logger.info(
      `[autoEnrollOnPurchase] Enrolled user ${customerId} in course "${courseSlug}" via order ${doc.id}`,
    )
  }

  return doc
}
