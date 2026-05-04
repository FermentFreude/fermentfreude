import type { CollectionAfterDeleteHook } from 'payload'

/**
 * restoreWorkshopSpotsOnDelete — Orders afterDelete hook.
 *
 * When an admin deletes an order from the admin panel, this hook:
 *  1. Finds all workshop-bookings linked to that order (via cart ID)
 *  2. Restores the seats on each appointment
 *  3. Deletes the booking records
 *
 * MongoDB Atlas M0: sequential writes only — no Promise.all.
 */
export const restoreWorkshopSpotsOnDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const { payload } = req

  // Resolve transaction → cart ID (same pattern as confirmWorkshopBookings)
  const transactionRef = Array.isArray(doc.transactions) ? doc.transactions[0] : undefined
  const transactionId =
    transactionRef && typeof transactionRef === 'object' ? transactionRef.id : transactionRef

  let cartId: string | undefined

  if (transactionId) {
    try {
      const transaction = await payload.findByID({
        collection: 'transactions',
        id: String(transactionId),
        depth: 0,
        overrideAccess: true,
      })
      cartId =
        typeof transaction.cart === 'object'
          ? ((transaction.cart as unknown as Record<string, unknown>)?.id?.toString())
          : (transaction.cart as string) ?? undefined
    } catch {
      // Non-fatal — no transaction found
    }
  }

  if (!cartId) {
    payload.logger.info(
      `[order:afterDelete] Order ${doc.id} — no cartId found, skipping seat restore`,
    )
    return
  }

  // Find confirmed/pending bookings linked to this cart
  const bookings = await payload.find({
    collection: 'workshop-bookings',
    where: {
      and: [
        { cartSlug: { equals: cartId } },
        { status: { in: ['confirmed', 'pending'] } },
      ],
    },
    limit: 50,
    overrideAccess: true,
  })

  if (bookings.totalDocs === 0) {
    payload.logger.info(
      `[order:afterDelete] Order ${doc.id} — no active bookings found for cart ${cartId}`,
    )
    return
  }

  // Restore spots and delete each booking — sequentially (M0)
  for (const booking of bookings.docs) {
    if (booking.appointmentId) {
      try {
        const appointment = await payload.findByID({
          collection: 'workshop-appointments',
          id: booking.appointmentId,
          depth: 1,
          overrideAccess: true,
        })

        const maxCapacity =
          typeof appointment.workshop === 'object'
            ? (((appointment.workshop as unknown) as Record<string, unknown>)
                ?.maxCapacityPerSlot as number) ?? 12
            : 12

        const restoredSpots = Math.min(
          appointment.availableSpots + (booking.guestCount ?? 1),
          maxCapacity,
        )

        await payload.update({
          collection: 'workshop-appointments',
          id: booking.appointmentId,
          data: { availableSpots: restoredSpots },
          overrideAccess: true,
        })

        payload.logger.info(
          `[order:afterDelete] Restored ${booking.guestCount} spot(s) on appointment ${booking.appointmentId} (now ${restoredSpots})`,
        )
      } catch (err) {
        payload.logger.error(
          `[order:afterDelete] Failed to restore spots for appointment ${booking.appointmentId}: ${err}`,
        )
      }
    }

    await payload.delete({
      collection: 'workshop-bookings',
      id: booking.id,
      overrideAccess: true,
    })

    payload.logger.info(`[order:afterDelete] Deleted booking ${booking.id}`)
  }
}
