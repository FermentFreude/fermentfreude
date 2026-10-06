import { APIError, type CollectionBeforeValidateHook } from 'payload'

import { ensureCartWorkshopHolds, PAYMENT_HOLD_MINUTES } from '@/lib/workshopHolds'

/**
 * requireWorkshopSeatsHeld — Transactions beforeValidate hook.
 *
 * Server-side backstop for the "final check at the door". Checkout already
 * calls /api/cart/check-workshops before starting a payment and shows the
 * customer a clear message, but a browser tab left open for days (or any
 * other client) must not be able to skip that. A Transaction is created by
 * both payment paths — the plugin's /api/payments/stripe/initiate and
 * /api/voucher/initiate-discounted-payment — before the customer can pay,
 * so refusing it here means a payment for seats that aren't held can't
 * even start. Same choke point as preventDuplicatePayment.
 *
 * Side effect (intended): every held seat in the basket is extended to at
 * least PAYMENT_HOLD_MINUTES from now, so the hold can't run out while the
 * customer is entering their card details or at their bank (EPS).
 */
export const requireWorkshopSeatsHeld: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !data) return data

  const cartRef = data.cart as string | { id?: string } | undefined
  const cartId = typeof cartRef === 'object' && cartRef !== null ? cartRef.id : cartRef
  if (!cartId) return data

  const { lines } = await ensureCartWorkshopHolds(req.payload, cartId, {
    holdMinutes: PAYMENT_HOLD_MINUTES,
  })
  const unavailable = lines.filter((line) => line.status !== 'held')
  if (unavailable.length > 0) {
    req.payload.logger.warn(
      `[requireWorkshopSeatsHeld] Refused payment for cart ${cartId}: ${unavailable
        .map((l) => `${l.workshopSlug}@${l.appointmentId ?? '?'} (${l.reason})`)
        .join(', ')}`,
    )
    throw new APIError(
      'Ein Workshop-Termin in deinem Warenkorb ist nicht mehr verfügbar. Bitte lade die Seite neu und wähle einen anderen Termin.',
      409,
    )
  }

  return data
}
