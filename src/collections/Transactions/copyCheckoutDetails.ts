import type { CollectionBeforeValidateHook } from 'payload'

/**
 * copyCheckoutDetails — Transactions beforeValidate hook.
 *
 * The checkout sends the buyer's name, phone, dietary note and pickup
 * choice along with /api/payments/stripe/initiate, but the plugin only
 * stores the email on the Transaction it creates. Until now the rest was
 * attached after payment by the browser (/api/checkout/attach-customer-name),
 * so an order completed by the Stripe webhook — the customer paid in the
 * Klarna / PayPal / bank app and never came back — had no name, phone or
 * dietary note. Storing them here, when the payment starts, means every
 * order gets them via copyCustomerNameFromTransaction, whoever creates it.
 *
 * /api/voucher/initiate-discounted-payment already sets these fields
 * itself; values already on `data` are never overwritten.
 */

const FIELDS = {
  customerFirstName: 250,
  customerLastName: 250,
  customerName: 250,
  customerPhone: 50,
  customerDietSpecs: 500,
  pickupLocation: 250,
  pickupAddress: 500,
  pickupDate: 50,
  pickupTime: 50,
} as const

export const copyCheckoutDetails: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation !== 'create' || !data) return data

  const body = req.data as Record<string, unknown> | undefined
  if (!body) return data

  for (const [field, maxLength] of Object.entries(FIELDS)) {
    const value = body[field]
    if (data[field] || typeof value !== 'string' || !value.trim()) continue
    data[field] = value.trim().slice(0, maxLength)
  }
  return data
}
