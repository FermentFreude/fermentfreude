/**
 * Policy engine — refund / rebooking entitlement rules.
 *
 * Single source of truth for what a seat is allowed to do, right now.
 * Called from the manage-booking page (to render buttons) AND independently
 * re-run inside every mutation endpoint — the UI is a convenience, never
 * the authority. See docs/REFUND_REBOOKING_SYSTEM_PLAN.md §5.
 *
 * Pure module — no Payload/DB imports — so it can be unit-tested in isolation
 * and safely imported from both server routes and (if ever needed) the client.
 */

export type SeatAction =
  | 'REQUEST_FULL_REFUND'
  | 'REBOOK_NOW'
  | 'REBOOK_LATER_VIA_CODE'
  | 'CANCEL_NO_REFUND'
  | 'SELECT_REPLACEMENT_WORKSHOP'
  | 'REQUEST_ORGANISER_CANCELLATION_REFUND'

export type SeatStatus =
  | 'active'
  | 'cancelled_no_refund'
  | 'rebooking_pending'
  | 'rebooked'
  | 'refund_requested'
  | 'refunded'
  | 'voucher_issued'
  | 'organiser_cancelled_pending'
  | 'no_show'

export type AppointmentStatus = 'SCHEDULED' | 'CANCELLED_BY_ORGANISER'

export interface PolicyEngineSeat {
  seatStatus: SeatStatus
  selfRebookingUsed: boolean
}

export interface PolicyEngineAppointment {
  /** ISO datetime string or Date — the workshop's start. */
  dateTime: string | Date
  status: AppointmentStatus
}

export interface PolicyEngineConfig {
  /** Hours before start at/above which a full refund is offered. Default 720 (30 days). */
  fullRefundThresholdHours: number
  /** Hours before start at/above which rebooking (now or later) is offered. Default 336 (14 days). */
  rebookThresholdHours: number
  /** Feature flag — allow "rebook later via code" at the top tier (≥ fullRefundThresholdHours). Default true. */
  allowRebookLaterAtFullRefundTier: boolean
  /** Feature flag — allow "rebook later via code" at the mid tier (rebookThresholdHours..fullRefundThresholdHours). Default true. */
  allowRebookLaterAtRebookOnlyTier: boolean
}

export const DEFAULT_POLICY_CONFIG: PolicyEngineConfig = {
  fullRefundThresholdHours: 720, // 30 days
  rebookThresholdHours: 336, // 14 days
  allowRebookLaterAtFullRefundTier: true,
  allowRebookLaterAtRebookOnlyTier: true,
}

/**
 * Hours between `now` and `appointmentDateTime`, computed against the wall-clock
 * instant — Date arithmetic in JS is already timezone-agnostic (both sides are
 * absolute instants), so no Europe/Vienna conversion is needed for the diff
 * itself. The 'Europe/Vienna' requirement in the plan is about *display*
 * (formatting dates for the customer), not this calculation — a UTC instant
 * diff is correct regardless of which timezone the workshop is displayed in,
 * including across DST transitions (the underlying instants already account
 * for the offset change).
 */
export function diffHours(appointmentDateTime: string | Date, now: string | Date): number {
  const start = new Date(appointmentDateTime).getTime()
  const current = new Date(now).getTime()
  return (start - current) / (1000 * 60 * 60)
}

/**
 * Fills in the two seat fields this engine depends on when reading a seat
 * straight from the DB.
 *
 * `seatStatus`/`selfRebookingUsed` were added to WorkshopBookings.seats[] by
 * this system's Stage 0 migration. Payload's `defaultValue` only applies when
 * a document is CREATED — it is never backfilled onto rows that already
 * existed in MongoDB. Every booking made before this shipped has
 * `seatStatus: undefined` in the database, not `'active'`. Without this
 * normalization, `seatActionOptions()` would treat every pre-existing seat as
 * already-resolved (`seatStatus !== 'active'` → no actions) and silently lock
 * every customer who booked before this feature out of self-service — a
 * one-line schema oversight that reads as "the whole feature is broken" in
 * production. Any code path that loads a seat from the database (API routes,
 * the manage-booking page, etc.) MUST pass it through this function before
 * calling seatActionOptions() — never read seatStatus off the raw DB doc.
 */
export function hydrateSeatDefaults(rawSeat: {
  seatStatus?: SeatStatus | null
  selfRebookingUsed?: boolean | null
}): PolicyEngineSeat {
  return {
    seatStatus: rawSeat.seatStatus ?? 'active',
    selfRebookingUsed: rawSeat.selfRebookingUsed ?? false,
  }
}

/**
 * Returns the actions available for a single seat, right now.
 *
 * Must be called with a freshly-fetched `now` (server time) — never trust a
 * client-supplied timestamp. Re-run this inside every mutation endpoint right
 * before writing, not just when rendering the page, since time keeps moving
 * between page load and click.
 */
export function seatActionOptions(
  seat: PolicyEngineSeat,
  appointment: PolicyEngineAppointment,
  now: string | Date,
  config: PolicyEngineConfig = DEFAULT_POLICY_CONFIG,
): SeatAction[] {
  if (appointment.status === 'CANCELLED_BY_ORGANISER') {
    // Organiser-cancellation branch is not gated by the day-threshold windows
    // or by selfRebookingUsed — see plan §7. It IS gated by seatStatus: a
    // seat already resolved (refunded, rebooked, etc.) has nothing left to do,
    // and a seat already in the organiser-cancellation flow keeps its options
    // until it resolves.
    if (seat.seatStatus !== 'active' && seat.seatStatus !== 'organiser_cancelled_pending') {
      return []
    }
    return ['SELECT_REPLACEMENT_WORKSHOP', 'REQUEST_ORGANISER_CANCELLATION_REFUND']
  }

  if (seat.seatStatus !== 'active') {
    return [] // already resolved — nothing left to do
  }

  if (seat.selfRebookingUsed) {
    return [] // one-time right already spent (AGB §4.6)
  }

  const hoursToStart = diffHours(appointment.dateTime, now)

  if (hoursToStart >= config.fullRefundThresholdHours) {
    const actions: SeatAction[] = ['REQUEST_FULL_REFUND', 'REBOOK_NOW']
    if (config.allowRebookLaterAtFullRefundTier) actions.push('REBOOK_LATER_VIA_CODE')
    return actions
  }

  if (hoursToStart >= config.rebookThresholdHours) {
    const actions: SeatAction[] = ['REBOOK_NOW']
    if (config.allowRebookLaterAtRebookOnlyTier) actions.push('REBOOK_LATER_VIA_CODE')
    return actions
  }

  // < rebookThresholdHours (includes past-start / no-show — same "nothing" outcome)
  return ['CANCEL_NO_REFUND']
}

/**
 * Maps a resolved seat action to the policyResult value stored on the
 * refund-requests row it creates (plan §4.3). Only actions that create a
 * refund-requests row are represented here.
 */
export function policyResultForAction(
  action: SeatAction,
): 'full_refund' | 'rebook_now' | 'rebook_later_voucher' | 'organiser_cancellation_refund' | null {
  switch (action) {
    case 'REQUEST_FULL_REFUND':
      return 'full_refund'
    case 'REBOOK_NOW':
      return 'rebook_now'
    case 'REBOOK_LATER_VIA_CODE':
      return 'rebook_later_voucher'
    case 'REQUEST_ORGANISER_CANCELLATION_REFUND':
      return 'organiser_cancellation_refund'
    default:
      return null
  }
}
