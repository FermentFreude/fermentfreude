import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/brevo', () => ({
  BREVO_TEMPLATES: {
    WORKSHOP_BOOKING_CONFIRMATION: 31,
  },
  sendTemplateEmail: vi.fn(),
}))

import { confirmWorkshopBookings } from '@/collections/Orders/confirmWorkshopBookings'
import { handleChargeRefunded, handlePaymentFailed } from '@/collections/Orders/stripeWebhooks'
import { sendTemplateEmail } from '@/lib/brevo'

type PayloadMock = {
  create: ReturnType<typeof vi.fn>
  db: {
    collections: Record<string, { findOneAndUpdate: ReturnType<typeof vi.fn>; updateOne: ReturnType<typeof vi.fn> }>
  }
  find: ReturnType<typeof vi.fn>
  findByID: ReturnType<typeof vi.fn>
  logger: {
    error: ReturnType<typeof vi.fn>
    info: ReturnType<typeof vi.fn>
    warn: ReturnType<typeof vi.fn>
  }
  update: ReturnType<typeof vi.fn>
}

function createPayloadMock(): PayloadMock {
  return {
    create: vi.fn(),
    db: { collections: {} },
    find: vi.fn(),
    findByID: vi.fn(),
    logger: {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    update: vi.fn(),
  }
}

/**
 * Mocks `payload.db.collections['workshop-appointments']` for
 * releaseSpotsAtomic (src/lib/atomicSpots.ts), which reaches past the Local
 * API into the underlying Mongoose model with a $min/$add pipeline update.
 * Reads the pipeline's own seatsToRestore/maxCapacity args so the mock stays
 * correct if those numbers change, rather than hardcoding an expected result.
 */
function mockAppointmentSpotsCollection(payload: PayloadMock, initialAvailableSpots: number) {
  let current = initialAvailableSpots
  const findOneAndUpdate = vi.fn((_filter: unknown, update: unknown) => {
    const stage = Array.isArray(update)
      ? (update[0] as { $set?: { availableSpots?: { $min?: [{ $add?: [string, number] }, number] } } })?.$set
          ?.availableSpots
      : undefined
    const seatsToRestore = stage?.$min?.[0]?.$add?.[1] ?? 0
    const maxCapacity = stage?.$min?.[1] ?? current
    current = Math.min(current + seatsToRestore, maxCapacity)
    return { lean: async () => ({ availableSpots: current }) }
  })
  payload.db.collections['workshop-appointments'] = { findOneAndUpdate, updateOne: vi.fn() }
  return () => current
}

describe('checkout booking integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('confirms a pending workshop booking using the cart-linked transaction and sends the booking email', async () => {
    const payload = createPayloadMock()

    payload.findByID.mockImplementation(
      async ({ collection, id }: { collection: string; id: string }) => {
        if (collection === 'transactions' && id === 'txn_1') {
          return { cart: 'cart_1', id: 'txn_1' }
        }

        if (collection === 'users' && id === 'user_1') {
          return { email: 'buyer@example.com', id: 'user_1', name: 'Buyer Example' }
        }

        throw new Error(`Unexpected findByID call for ${collection}:${id}`)
      },
    )

    payload.find.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'workshop-bookings') {
        return {
          docs: [
            {
              appointmentId: 'appointment_1',
              cartSlug: 'cart_1',
              date: '20 April 2026',
              email: '',
              firstName: '',
              guestCount: 2,
              id: 'booking_1',
              status: 'pending',
              totalPrice: 19800,
              workshopSlug: 'kombucha',
              workshopTitle: 'Kombucha Workshop',
            },
          ],
          totalDocs: 1,
        }
      }

      throw new Error(`Unexpected find call for ${collection}`)
    })

    payload.update.mockResolvedValue({ id: 'booking_1' })

    await confirmWorkshopBookings({
      doc: {
        customer: 'user_1',
        customerEmail: '',
        id: 'order_1',
        items: [
          {
            product: { id: 'product_1', slug: 'workshop-kombucha' },
            quantity: 2,
          },
        ],
        transactions: ['txn_1'],
      },
      operation: 'create',
      req: { payload },
    } as never)

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'workshop-bookings',
        data: expect.objectContaining({
          email: 'buyer@example.com',
          firstName: 'Buyer Example',
          status: 'confirmed',
        }),
        id: 'booking_1',
        overrideAccess: true,
      }),
    )

    expect(sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          BOOKING_ID: 'booking_1',
          FIRST_NAME: 'Buyer Example',
          GUEST_COUNT: '2',
          WORKSHOP_TITLE: 'Kombucha Workshop',
          WORKSHOP_DATE: expect.any(String),
          TOTAL_PRICE: expect.any(String),
        }),
        templateId: 31,
        to: [{ email: 'buyer@example.com', name: 'Buyer Example' }],
      }),
    )
  })

  it('releases appointment spots and cancels pending bookings when Stripe payment fails', async () => {
    const payload = createPayloadMock()

    payload.find.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'transactions') {
        return {
          docs: [{ cart: 'cart_1', id: 'txn_1' }],
          totalDocs: 1,
        }
      }

      if (collection === 'workshop-bookings') {
        return {
          docs: [
            {
              appointmentId: 'appointment_1',
              cartSlug: 'cart_1',
              guestCount: 2,
              id: 'booking_1',
              status: 'pending',
            },
          ],
          totalDocs: 1,
        }
      }

      throw new Error(`Unexpected find call for ${collection}`)
    })

    payload.findByID.mockImplementation(
      async ({ collection, id }: { collection: string; id: string }) => {
        if (collection === 'workshop-appointments' && id === 'appointment_1') {
          return {
            availableSpots: 6,
            id: 'appointment_1',
            workshop: { maxCapacityPerSlot: 12 },
          }
        }

        throw new Error(`Unexpected findByID call for ${collection}:${id}`)
      },
    )

    payload.update.mockResolvedValue({})
    const getCurrentSpots = mockAppointmentSpotsCollection(payload, 6)

    await handlePaymentFailed({
      event: {
        data: {
          object: {
            id: 'pi_failed_1',
          },
        },
      } as never,
      req: { payload } as never,
      stripe: {} as never,
    })

    // Spots restore now goes through the atomic $min/$add pipeline update
    // (releaseSpotsAtomic), not payload.update — 6 + 2 guests = 8.
    expect(payload.db.collections['workshop-appointments'].findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'appointment_1' },
      expect.anything(),
      { new: true },
    )
    expect(getCurrentSpots()).toBe(8)

    expect(payload.update).toHaveBeenCalledTimes(1)
    expect(payload.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'workshop-bookings',
        data: { status: 'cancelled' },
        id: 'booking_1',
        overrideAccess: true,
      }),
    )
  })

  it('marks orders and linked bookings as refunded and restores spots when Stripe sends charge.refunded', async () => {
    const payload = createPayloadMock()

    payload.find.mockImplementation(async ({ collection }: { collection: string }) => {
      // No pending refund-requests rows for this PaymentIntent — this test
      // covers the legacy whole-order fallback (a refund issued entirely
      // outside the new self-service system). The seat-scoped path is
      // covered separately below.
      if (collection === 'refund-requests') {
        return { docs: [], totalDocs: 0 }
      }

      if (collection === 'orders') {
        return {
          docs: [{ id: 'order_1', transactions: ['txn_1'] }],
          totalDocs: 1,
        }
      }

      if (collection === 'workshop-bookings') {
        return {
          docs: [
            {
              appointmentId: 'appointment_1',
              cartSlug: 'cart_1',
              guestCount: 3,
              id: 'booking_1',
              status: 'confirmed',
            },
          ],
          totalDocs: 1,
        }
      }

      throw new Error(`Unexpected find call for ${collection}`)
    })

    payload.findByID.mockImplementation(
      async ({ collection, id }: { collection: string; id: string }) => {
        if (collection === 'transactions' && id === 'txn_1') {
          return { cart: 'cart_1', id: 'txn_1' }
        }

        if (collection === 'workshop-appointments' && id === 'appointment_1') {
          return {
            availableSpots: 7,
            id: 'appointment_1',
            workshop: { maxCapacityPerSlot: 12 },
          }
        }

        throw new Error(`Unexpected findByID call for ${collection}:${id}`)
      },
    )

    payload.update.mockResolvedValue({})
    const getCurrentSpots = mockAppointmentSpotsCollection(payload, 7)

    await handleChargeRefunded({
      event: {
        data: {
          object: {
            id: 'ch_1',
            payment_intent: 'pi_refunded_1',
          },
        },
      } as never,
      req: { payload } as never,
      stripe: {} as never,
    })

    expect(payload.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'orders',
        data: { status: 'refunded' },
        id: 'order_1',
        overrideAccess: true,
      }),
    )

    expect(payload.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'workshop-bookings',
        data: { status: 'refunded' },
        id: 'booking_1',
        overrideAccess: true,
      }),
    )

    expect(payload.update).toHaveBeenCalledTimes(2)

    // Spots restore now goes through the atomic $min/$add pipeline update
    // (releaseSpotsAtomic), not payload.update — 7 + 3 guests = 10.
    expect(payload.db.collections['workshop-appointments'].findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'appointment_1' },
      expect.anything(),
      { new: true },
    )
    expect(getCurrentSpots()).toBe(10)
  })

  it('reconciles a seat-scoped refund-request instead of the whole booking, when one is pending for the PaymentIntent', async () => {
    const payload = createPayloadMock()

    // A 3-seat booking where only seat index 1 has a pending refund request —
    // seats 0 and 2 must come out of this untouched.
    const threeSeatBooking = {
      appointmentId: 'appointment_2',
      firstName: 'Anna',
      id: 'booking_multi',
      lastName: 'Test',
      seats: [
        { recipientName: 'Seat0', seatStatus: 'active' },
        { recipientName: 'Seat1', seatStatus: 'refund_requested' },
        { recipientName: 'Seat2', seatStatus: 'active' },
      ],
      workshopTitle: 'Kombucha Workshop',
    }

    payload.find.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'refund-requests') {
        return {
          docs: [
            {
              booking: 'booking_multi',
              id: 'rr_1',
              requestedAmount: 9900,
              seatIndex: 1,
              status: 'requested',
            },
          ],
          totalDocs: 1,
        }
      }
      throw new Error(`Unexpected find call for ${collection}`)
    })

    payload.findByID.mockImplementation(
      async ({ collection, id }: { collection: string; id: string }) => {
        if (collection === 'workshop-bookings' && id === 'booking_multi') return threeSeatBooking
        if (collection === 'workshop-appointments' && id === 'appointment_2') {
          return { availableSpots: 4, id: 'appointment_2', workshop: { maxCapacityPerSlot: 12 } }
        }
        throw new Error(`Unexpected findByID call for ${collection}:${id}`)
      },
    )

    payload.update.mockResolvedValue({})
    payload.create.mockResolvedValue({ id: 'event_1' })
    const getCurrentSpots = mockAppointmentSpotsCollection(payload, 4)

    await handleChargeRefunded({
      event: {
        data: {
          object: {
            id: 'ch_seat_scoped',
            payment_intent: 'pi_seat_scoped',
          },
        },
      } as never,
      req: { payload } as never,
      // Real Stripe never populates `charge.refunds` on the webhook payload
      // itself (confirmed live in Stage 10 — it's always `null`), so
      // disambiguation fetches the refunds list via the API instead.
      stripe: {
        refunds: { list: vi.fn().mockResolvedValue({ data: [{ amount: 9900, created: 1000, id: 're_1' }] }) },
      } as never,
    })

    // The refund-requests row is marked completed with the real Stripe refund ID.
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'refund-requests',
        data: expect.objectContaining({ status: 'completed', stripeRefundId: 're_1' }),
        id: 'rr_1',
      }),
    )

    // Only seat index 1 changes — seats 0 and 2 are untouched.
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'workshop-bookings',
        data: {
          seats: [
            { recipientName: 'Seat0', seatStatus: 'active' },
            { recipientName: 'Seat1', seatStatus: 'refunded' },
            { recipientName: 'Seat2', seatStatus: 'active' },
          ],
        },
        id: 'booking_multi',
      }),
    )

    // Capacity restored by exactly 1 seat, not the whole booking's guestCount.
    expect(getCurrentSpots()).toBe(5)

    // Crucially: NEVER touches the 'orders' collection — a seat-scoped
    // refund must not mark the whole order as refunded.
    expect(payload.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'orders' }),
    )
  })

  it('no-ops on a redelivered charge.refunded event for an already-reconciled refund-request (Stripe webhooks are at-least-once)', async () => {
    const payload = createPayloadMock()

    // The row already went to 'completed' on the first delivery.
    payload.find.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'refund-requests') {
        return {
          docs: [
            {
              booking: 'booking_multi',
              completedAt: '2026-01-01T00:00:00.000Z',
              id: 'rr_1',
              requestedAmount: 9900,
              seatIndex: 1,
              status: 'completed',
              stripeRefundId: 're_1',
            },
          ],
          totalDocs: 1,
        }
      }
      throw new Error(`Unexpected find call for ${collection}`)
    })
    payload.findByID.mockImplementation(() => {
      throw new Error('Should not look up anything — the row is already reconciled')
    })
    payload.update.mockResolvedValue({})

    await handleChargeRefunded({
      event: {
        data: {
          object: {
            id: 'ch_seat_scoped_redelivered',
            payment_intent: 'pi_seat_scoped',
            refunds: { data: [{ amount: 9900, created: 1000, id: 're_1' }] },
          },
        },
      } as never,
      req: { payload } as never,
      stripe: {} as never,
    })

    // Must not touch the refund-requests row again, must not touch orders
    // or workshop-bookings, and must not call findByID at all — this proves
    // the redelivery short-circuits at the "any request exists for this PI"
    // check rather than falling through to the legacy whole-order path,
    // which would otherwise have incorrectly marked the entire order as
    // refunded on a routine duplicate webhook delivery.
    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.findByID).not.toHaveBeenCalled()
  })
})
