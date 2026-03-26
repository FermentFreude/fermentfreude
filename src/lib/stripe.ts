/**
 * Server-side Stripe instance — reusable across API routes.
 *
 * IMPORTANT: Only import this in server-side code (API routes, hooks).
 */
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})
