# Booking, Purchase, Stripe, and Brevo Test Plan

## Goal

This plan defines the minimum professional coverage required to keep FermentFreude checkout, workshop bookings, voucher purchases, Stripe payments, and Brevo side effects reliable.

The target is not just "it builds". The target is:

- checkout can be initiated by guest and logged-in users
- workshop bookings are correlated to orders correctly
- Stripe failures and refunds restore state safely
- voucher purchases and redemptions do not break checkout
- Brevo side effects do not silently block successful orders

## Test Layers

### 1. Integration tests

Use Vitest for server-side behavior that must stay stable across refactors.

Current high-value integration coverage added:

- booking confirmation hook
- `payment_intent.payment_failed` webhook handler
- `charge.refunded` webhook handler

Recommended next integration targets:

- voucher validation route
- voucher redemption route
- voucher full-coverage checkout route
- workshop add-to-cart route
- booking link route
- order confirmation component logic around `paymentIntentID`

### 2. Playwright checkout flows

Use Playwright for real page-level checkout behavior.

Current first checkout flow coverage added:

- guest checkout sends `customerEmail` into Stripe initiation and reaches the payment step
- logged-in checkout uses account email when no manual guest email is entered and reaches the payment step

Current Playwright checkout scope is intentionally deterministic:

- Stripe JS is stubbed
- Stripe initiation and confirm-order endpoints are mocked
- cart and user APIs are mocked

This verifies the application wiring and request payloads without relying on live Stripe during CI.

### 3. Manual environment verification

Automated tests should not be the only gate for payments.

For each production-affecting release, run a manual smoke pass in Stripe test mode:

- guest workshop checkout
- logged-in workshop checkout
- digital course checkout
- voucher partial discount checkout
- voucher full discount checkout
- payment failure path
- refund path
- Brevo contact + email verification

## Core Scenarios

### Checkout initiation

- guest checkout requires an email before payment initiation
- logged-in checkout uses `user.email` automatically
- digital-only orders skip address requirements
- workshop and physical orders require valid address state
- Stripe initiation includes `cartID`, `secret`, `currency`, and `customerEmail`

### Workshop booking correlation

- pending booking is linked to the cart
- confirmed order resolves the correct booking via transaction/cart correlation
- booking status changes from `pending` to `confirmed`
- customer info is attached to the booking when missing
- booking email is sent only after customer info exists

### Failure and recovery

- failed payment restores workshop spots
- failed payment cancels pending workshop bookings
- refunded charge marks the order `refunded`
- refunded charge marks confirmed bookings `refunded`
- refunded charge restores appointment spots without exceeding capacity
- duplicate webhook delivery remains safe and idempotent

### Voucher scenarios

- invalid voucher code is rejected cleanly
- partial voucher discount reduces payable total but still requires Stripe
- full voucher discount bypasses Stripe and places the order directly
- redeemed voucher cannot be reused
- voucher purchase triggers voucher creation and delivery side effects

### Brevo scenarios

- new user sync includes marketing consent attributes
- order confirmation emails are requested with expected template params
- workshop booking confirmation emails are requested with expected template params
- voucher purchase emails are requested with expected template params
- Brevo failures are logged and do not invalidate a successful order

## Recommended Automated Matrix

Minimum release-blocking automated matrix:

1. Guest digital checkout initiation
2. Logged-in digital checkout initiation
3. Booking confirmation hook with cart-linked booking
4. `payment_intent.payment_failed` releases spots and cancels bookings
5. `charge.refunded` restores spots and updates order + booking state
6. Voucher validation and redemption integration coverage

Recommended next expanded matrix:

1. Guest workshop checkout with real booking reservation
2. Logged-in workshop checkout with real booking reservation
3. Guest voucher partial payment flow
4. Guest voucher full-payment flow
5. Digital course purchase auto-enrollment
6. Duplicate Stripe webhook delivery
7. Brevo failure logging paths

## Stripe Testing Rules

Use Stripe test mode for automation and manual smoke checks.

Recommended cards:

- success: `4242 4242 4242 4242`
- generic decline: `4000 0000 0000 0002`
- authentication required: `4000 0025 0000 3155`

For local webhook verification use the existing command in `package.json`:

```bash
pnpm stripe-webhooks
```

That should forward Stripe events into the local app and validate:

- payment success
- payment failure
- refund handling

## Brevo Testing Rules

Do not depend on real Brevo delivery in CI.

Automated tests should:

- mock Brevo client or email helper functions
- assert template IDs and payload shape
- assert failures are logged without breaking the main transaction path

Manual test pass should verify:

- order confirmation arrives
- workshop booking confirmation arrives
- voucher purchase email arrives
- user/contact sync appears correctly in Brevo

## Operational Release Checklist

Before promoting checkout-related changes:

1. Run targeted Vitest booking + webhook suite
2. Run Playwright checkout suite
3. Run Stripe test-mode manual smoke purchase
4. Verify created order, booking, and appointment state in Payload admin
5. Verify Brevo side effects in logs and dashboard
6. Verify refund and failure recovery on staging before production

## Current Coverage Snapshot

As of this update, the repo includes:

- integration tests for booking confirmation and Stripe webhook recovery
- first Playwright checkout flows for guest and logged-in purchase initiation wiring
- a documented test matrix for future expansion

What still should be added next:

- real workshop checkout Playwright coverage
- voucher automation coverage
- Brevo failure-path integration tests
- idempotency tests for duplicate webhook delivery