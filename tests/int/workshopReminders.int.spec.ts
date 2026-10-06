import { describe, expect, it } from 'vitest'

import { reminderRecipients } from '@/lib/workshopReminders'
import type { WorkshopBooking } from '@/payload-types'

const booking = (overrides: Partial<WorkshopBooking>): WorkshopBooking =>
  ({
    id: 'b1',
    status: 'confirmed',
    firstName: 'Max',
    email: 'max@example.com',
    guestCount: 1,
    seats: [],
    ...overrides,
  }) as WorkshopBooking

describe('reminderRecipients', () => {
  it('reminds the buyer of a manual booking with no seats array', () => {
    expect(reminderRecipients(booking({ seats: undefined }))).toEqual([
      { email: 'max@example.com', firstName: 'Max' },
    ])
  })

  it('reminds nobody when there is no email anywhere', () => {
    expect(reminderRecipients(booking({ email: null, guestCount: 3 }))).toEqual([])
  })

  it('reminds only the guests who gave an email, plus the buyer', () => {
    const result = reminderRecipients(
      booking({
        guestCount: 3,
        seats: [
          { seatStatus: 'active' },
          { recipientName: 'Anna Müller', email: 'anna@example.com', seatStatus: 'active' },
          { recipientName: 'Ben', seatStatus: 'active' },
        ],
      }),
    )
    expect(result).toEqual([
      { email: 'max@example.com', firstName: 'Max' },
      { email: 'anna@example.com', firstName: 'Anna' },
    ])
  })

  it('reminds a guest even when the buyer left no email', () => {
    const result = reminderRecipients(
      booking({
        email: null,
        guestCount: 2,
        seats: [{}, { recipientName: 'Anna', email: 'anna@example.com' }],
      }),
    )
    expect(result.map((r) => r.email)).toEqual(['anna@example.com'])
  })

  it('skips guests whose seat was cancelled or rebooked, and dedupes emails', () => {
    const result = reminderRecipients(
      booking({
        guestCount: 3,
        seats: [
          { seatStatus: 'active', email: 'MAX@example.com' },
          { email: 'gone@example.com', seatStatus: 'rebooked' },
          { email: 'refund@example.com', seatStatus: 'refunded' },
        ],
      }),
    )
    expect(result.map((r) => r.email)).toEqual(['max@example.com'])
  })

  it('reminds nobody once every seat is resolved', () => {
    const result = reminderRecipients(
      booking({ guestCount: 1, seats: [{ seatStatus: 'cancelled_no_refund' }] }),
    )
    expect(result).toEqual([])
  })
})
