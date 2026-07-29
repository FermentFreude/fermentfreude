import { describe, expect, it } from 'vitest'

import {
  DEFAULT_POLICY_CONFIG,
  diffHours,
  hydrateSeatDefaults,
  policyResultForAction,
  seatActionOptions,
  type PolicyEngineAppointment,
  type PolicyEngineSeat,
} from '@/lib/policyEngine'

const activeSeat = (overrides: Partial<PolicyEngineSeat> = {}): PolicyEngineSeat => ({
  seatStatus: 'active',
  selfRebookingUsed: false,
  ...overrides,
})

const scheduled = (dateTime: string): PolicyEngineAppointment => ({
  dateTime,
  status: 'SCHEDULED',
})

const cancelledByOrganiser = (dateTime: string): PolicyEngineAppointment => ({
  dateTime,
  status: 'CANCELLED_BY_ORGANISER',
})

/** now fixed at a stable instant; appointment dateTime expressed as an offset in hours from `now`. */
const NOW = '2026-06-01T12:00:00.000Z'
const atHoursFromNow = (hours: number): string =>
  new Date(new Date(NOW).getTime() + hours * 60 * 60 * 1000).toISOString()

describe('policyEngine — §2 policy matrix', () => {
  it('≥720h (30 days): full refund + rebook now + rebook later', () => {
    const options = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(720)), NOW)
    expect(options).toEqual(['REQUEST_FULL_REFUND', 'REBOOK_NOW', 'REBOOK_LATER_VIA_CODE'])
  })

  it('well above 720h behaves the same as exactly 720h', () => {
    const options = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(2000)), NOW)
    expect(options).toEqual(['REQUEST_FULL_REFUND', 'REBOOK_NOW', 'REBOOK_LATER_VIA_CODE'])
  })

  it('just under 720h (719.99h) drops to the 14-30 day tier — no refund', () => {
    const options = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(719.99)), NOW)
    expect(options).toEqual(['REBOOK_NOW', 'REBOOK_LATER_VIA_CODE'])
  })

  it('336h-720h (14-30 days): rebook now + rebook later, no refund', () => {
    const options = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(500)), NOW)
    expect(options).toEqual(['REBOOK_NOW', 'REBOOK_LATER_VIA_CODE'])
  })

  it('exactly 336h is inclusive — still rebook now + rebook later', () => {
    const options = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(336)), NOW)
    expect(options).toEqual(['REBOOK_NOW', 'REBOOK_LATER_VIA_CODE'])
  })

  it('just under 336h (335.99h) drops to <14 day tier — nothing', () => {
    const options = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(335.99)), NOW)
    expect(options).toEqual(['CANCEL_NO_REFUND'])
  })

  it('<336h (14 days): nothing — no refund, no rebook, no code', () => {
    const options = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(100)), NOW)
    expect(options).toEqual(['CANCEL_NO_REFUND'])
  })

  it('no-show (appointment already started/passed): nothing', () => {
    const options = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(-5)), NOW)
    expect(options).toEqual(['CANCEL_NO_REFUND'])
  })
})

describe('policyEngine — one-time rebooking right (AGB §4.6)', () => {
  it('selfRebookingUsed=true returns nothing, even at the ≥30-day tier', () => {
    const options = seatActionOptions(
      activeSeat({ selfRebookingUsed: true }),
      scheduled(atHoursFromNow(720)),
      NOW,
    )
    expect(options).toEqual([])
  })

  it('selfRebookingUsed=true returns nothing at the 14-30 day tier', () => {
    const options = seatActionOptions(
      activeSeat({ selfRebookingUsed: true }),
      scheduled(atHoursFromNow(500)),
      NOW,
    )
    expect(options).toEqual([])
  })
})

describe('policyEngine — already-resolved seats', () => {
  const resolvedStatuses = [
    'cancelled_no_refund',
    'rebooking_pending',
    'rebooked',
    'refund_requested',
    'refunded',
    'voucher_issued',
    'no_show',
  ] as const

  for (const seatStatus of resolvedStatuses) {
    it(`seatStatus=${seatStatus} returns nothing regardless of timing`, () => {
      const options = seatActionOptions(
        activeSeat({ seatStatus }),
        scheduled(atHoursFromNow(720)),
        NOW,
      )
      expect(options).toEqual([])
    })
  }
})

describe('policyEngine — organiser-cancellation branch (§7)', () => {
  it('active seat: replacement workshop or refund, regardless of day-threshold', () => {
    // Even <14 days out, organiser cancellation still offers both — not gated
    // by the self-service windows.
    const options = seatActionOptions(
      activeSeat(),
      cancelledByOrganiser(atHoursFromNow(1)),
      NOW,
    )
    expect(options).toEqual(['SELECT_REPLACEMENT_WORKSHOP', 'REQUEST_ORGANISER_CANCELLATION_REFUND'])
  })

  it('organiser_cancelled_pending seat: same two options remain open', () => {
    const options = seatActionOptions(
      activeSeat({ seatStatus: 'organiser_cancelled_pending' }),
      cancelledByOrganiser(atHoursFromNow(720)),
      NOW,
    )
    expect(options).toEqual(['SELECT_REPLACEMENT_WORKSHOP', 'REQUEST_ORGANISER_CANCELLATION_REFUND'])
  })

  it('organiser cancellation ignores selfRebookingUsed — right is separate from self-service', () => {
    const options = seatActionOptions(
      activeSeat({ selfRebookingUsed: true }),
      cancelledByOrganiser(atHoursFromNow(720)),
      NOW,
    )
    expect(options).toEqual(['SELECT_REPLACEMENT_WORKSHOP', 'REQUEST_ORGANISER_CANCELLATION_REFUND'])
  })

  it('a seat already resolved (e.g. refunded) has nothing left to do even under organiser cancellation', () => {
    const options = seatActionOptions(
      activeSeat({ seatStatus: 'refunded' }),
      cancelledByOrganiser(atHoursFromNow(720)),
      NOW,
    )
    expect(options).toEqual([])
  })
})

describe('policyEngine — config-driven tier toggles (§13 "changing these decisions later")', () => {
  it('disabling allowRebookLaterAtFullRefundTier removes the code option only at the top tier', () => {
    const config = { ...DEFAULT_POLICY_CONFIG, allowRebookLaterAtFullRefundTier: false }
    const topTier = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(720)), NOW, config)
    expect(topTier).toEqual(['REQUEST_FULL_REFUND', 'REBOOK_NOW'])

    const midTier = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(500)), NOW, config)
    expect(midTier).toEqual(['REBOOK_NOW', 'REBOOK_LATER_VIA_CODE'])
  })

  it('disabling allowRebookLaterAtRebookOnlyTier removes the code option only at the mid tier', () => {
    const config = { ...DEFAULT_POLICY_CONFIG, allowRebookLaterAtRebookOnlyTier: false }
    const midTier = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(500)), NOW, config)
    expect(midTier).toEqual(['REBOOK_NOW'])

    const topTier = seatActionOptions(activeSeat(), scheduled(atHoursFromNow(720)), NOW, config)
    expect(topTier).toEqual(['REQUEST_FULL_REFUND', 'REBOOK_NOW', 'REBOOK_LATER_VIA_CODE'])
  })
})

describe('diffHours — DST safety', () => {
  it('is unaffected by the Europe/Vienna spring-forward transition (2026-03-29)', () => {
    // 48 real hours apart, straddling the CET→CEST jump — must still read as 48h,
    // not 47h, because both operands are absolute instants (UTC under the hood).
    const before = '2026-03-28T10:00:00.000Z'
    const after = '2026-03-30T10:00:00.000Z'
    expect(diffHours(after, before)).toBeCloseTo(48, 10)
  })

  it('is unaffected by the Europe/Vienna fall-back transition (2026-10-25)', () => {
    const before = '2026-10-24T10:00:00.000Z'
    const after = '2026-10-26T10:00:00.000Z'
    expect(diffHours(after, before)).toBeCloseTo(48, 10)
  })

  it('returns a negative value for a start time in the past', () => {
    expect(diffHours(atHoursFromNow(-10), NOW)).toBeCloseTo(-10, 10)
  })
})

describe('hydrateSeatDefaults — pre-migration bookings', () => {
  it('treats a seat with no seatStatus in the DB (booked before this feature shipped) as active', () => {
    const seat = hydrateSeatDefaults({})
    expect(seat).toEqual({ seatStatus: 'active', selfRebookingUsed: false })

    // And that seat must then behave exactly like any other active seat.
    const options = seatActionOptions(seat, scheduled(atHoursFromNow(720)), NOW)
    expect(options).toEqual(['REQUEST_FULL_REFUND', 'REBOOK_NOW', 'REBOOK_LATER_VIA_CODE'])
  })

  it('treats null the same as undefined (Mongo may store either for a missing field)', () => {
    expect(hydrateSeatDefaults({ seatStatus: null, selfRebookingUsed: null })).toEqual({
      seatStatus: 'active',
      selfRebookingUsed: false,
    })
  })

  it('passes through an explicitly-set seatStatus/selfRebookingUsed unchanged', () => {
    expect(hydrateSeatDefaults({ seatStatus: 'refunded', selfRebookingUsed: true })).toEqual({
      seatStatus: 'refunded',
      selfRebookingUsed: true,
    })
  })
})

describe('policyResultForAction', () => {
  it('maps every refund-request-creating action to its policyResult', () => {
    expect(policyResultForAction('REQUEST_FULL_REFUND')).toBe('full_refund')
    expect(policyResultForAction('REBOOK_NOW')).toBe('rebook_now')
    expect(policyResultForAction('REBOOK_LATER_VIA_CODE')).toBe('rebook_later_voucher')
    expect(policyResultForAction('REQUEST_ORGANISER_CANCELLATION_REFUND')).toBe(
      'organiser_cancellation_refund',
    )
  })

  it('returns null for actions that do not create a refund-requests row', () => {
    expect(policyResultForAction('CANCEL_NO_REFUND')).toBeNull()
    expect(policyResultForAction('SELECT_REPLACEMENT_WORKSHOP')).toBeNull()
  })
})
