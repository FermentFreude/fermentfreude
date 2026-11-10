/**
 * Fallback for the confirm step after a successful cart payment: asks the
 * server to complete — or find — the order from the PaymentIntent alone.
 * Needed when the plugin's own confirmOrder fails although the customer
 * has paid, typically because the Stripe webhook already created the
 * order and marked the cart purchased. Returns the order ID, or null.
 */
export async function completePaymentOnServer(paymentIntentID: string): Promise<string | null> {
  try {
    const res = await fetch('/api/checkout/complete-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentID }),
    })
    const data = await res.json().catch(() => null)
    return res.ok && data?.success && data.orderID ? String(data.orderID) : null
  } catch {
    return null
  }
}
