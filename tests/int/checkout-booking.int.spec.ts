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
          CUSTOMER_NAME: 'Buyer Example',
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

    expect(payload.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'workshop-appointments',
        data: { availableSpots: 8 },
        id: 'appointment_1',
        overrideAccess: true,
      }),
    )

    expect(payload.update).toHaveBeenNthCalledWith(
      2,
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

    expect(payload.update).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        collection: 'workshop-appointments',
        data: { availableSpots: 10 },
        id: 'appointment_1',
        overrideAccess: true,
      }),
    )
  })
})
