import { describe, expect, it } from 'vitest'

import { seatHoldsPlace, seatsHoldingPlace } from '@/lib/seatCapacity'

describe('seatsHoldingPlace', () => {
  it('counts every seat of a booking without a seats array (manual / older bookings)', () => {
    expect(seatsHoldingPlace({ guestCount: 3, seats: undefined })).toBe(3)
  })

  it('treats missing seat entries as active', () => {
    expect(seatsHoldingPlace({ guestCount: 2, seats: [{ seatStatus: 'active' }] })).toBe(2)
  })

  it('drops seats that left the date: rebooked, voucher, cancelled, refunded', () => {
    expect(
      seatsHoldingPlace({
        guestCount: 5,
        seats: [
          { seatStatus: 'active' },
          { seatStatus: 'rebooked' },
          { seatStatus: 'voucher_issued' },
          { seatStatus: 'cancelled_no_refund' },
          { seatStatus: 'refunded' },
        ],
      }),
    ).toBe(1)
  })

  it('keeps the place while a refund is only requested', () => {
    expect(seatsHoldingPlace({ guestCount: 1, seats: [{ seatStatus: 'refund_requested' }] })).toBe(1)
    expect(seatHoldsPlace('organiser_cancelled_pending')).toBe(true)
  })

  it('is 0 once the single seat was rebooked away (the old date no longer counts it)', () => {
    expect(seatsHoldingPlace({ guestCount: 1, seats: [{ seatStatus: 'rebooked' }] })).toBe(0)
  })
})
