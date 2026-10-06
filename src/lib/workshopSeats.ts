/**
 * Per-seat guest details a buyer can fill in for a workshop booking —
 * name, optional email (gets the 2-day workshop reminder) and dietary notes.
 * Shared by every route that writes seats from the cart.
 */
export type SeatInput = {
  recipientName?: string
  email?: string
  giftNote?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value)
}

/** Drop anything that isn't a plain seat object; trim and cap every field. Invalid emails are dropped, not rejected. */
export function sanitizeSeatInputs(raw: unknown): SeatInput[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((s): SeatInput | null => {
      if (!s || typeof s !== 'object') return null
      const seat = s as Record<string, unknown>
      const email = typeof seat.email === 'string' ? seat.email.trim().slice(0, 250) : ''
      return {
        recipientName:
          typeof seat.recipientName === 'string' ? seat.recipientName.trim().slice(0, 250) : undefined,
        email: email && isValidEmail(email) ? email : undefined,
        giftNote: typeof seat.giftNote === 'string' ? seat.giftNote.slice(0, 500) : undefined,
      }
    })
    .filter((s): s is SeatInput => s !== null)
}
