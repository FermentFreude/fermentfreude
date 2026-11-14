/**
 * How many people fit on ONE workshop date.
 *
 * A date can have its own "Kapazität für diesen Termin"; if that is empty the
 * workshop's standard capacity (maxCapacityPerSlot) applies. This is the only
 * place that rule lives — the booking page, checkout, the dashboard and every
 * seat counter read it from here.
 *
 * Pass an appointment loaded with depth >= 1, so the workshop is an object.
 */
export const FALLBACK_CAPACITY = 12

export function workshopCapacity(workshop: unknown): number | null {
  if (workshop && typeof workshop === 'object') {
    const c = Number((workshop as { maxCapacityPerSlot?: unknown }).maxCapacityPerSlot)
    if (Number.isFinite(c) && c >= 1) return Math.floor(c)
  }
  return null
}

export function capacityOf(appointment: { capacity?: number | null; workshop?: unknown } | null | undefined): number {
  if (!appointment) return FALLBACK_CAPACITY
  const own = Number(appointment.capacity)
  if (Number.isFinite(own) && own >= 1) return Math.floor(own)
  return workshopCapacity(appointment.workshop) ?? FALLBACK_CAPACITY
}
