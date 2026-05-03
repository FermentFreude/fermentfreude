# Audit Report — Booking · Voucher · Cart · Email · i18n

> Read-only audit. **No code changed.** Awaiting approval before any edits.
> Generated: 3 May 2026

---

## A. Email content & wiring — highest impact

| #   | Bug                                                  | File                                                                                                                                                                                                                                                                                                  | Fix                                                                                                                                                                                                                                                                                |
| --- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Voucher email greets _"Hello CONNECTWITHRAFAELA"_    | [src/hooks/brevo/sendVoucherPurchaseEmail.ts](src/hooks/brevo/sendVoucherPurchaseEmail.ts) derives FIRST_NAME from `email.split('@')[0]`. [VoucherHero.tsx#L84](src/app/(app)/workshops/voucher/VoucherHero.tsx#L84) only collects email — no name field (was removed; lives in `.bak`). | Re-add first-name (+ optional last-name) input → pass through `/api/voucher/checkout` → Stripe metadata → `/api/voucher/confirm` → new field `purchaserFirstName` on Vouchers collection → email param `FIRST_NAME`. |
| A2  | Workshop confirmation **subject** shows full Mongo ObjectId | [scripts/brevo-setup-templates.mjs#L62](scripts/brevo-setup-templates.mjs#L62) uses `{{params.BOOKING_ID}}` — but the hook only sends `BOOKING_REF` (8-char).                                                                                                                                          | Change subject to `Workshop Buchung bestätigt — {{params.BOOKING_REF}}` and re-run `pnpm node scripts/brevo-setup-templates.mjs`. **One-line fix.**                                                                                                                                |
| A3  | `WHAT_TO_BRING` in workshop email is always blank    | [src/collections/Orders/confirmWorkshopBookings.ts](src/collections/Orders/confirmWorkshopBookings.ts) hardcodes `''`.                                                                                                                                                                                | Add `whatToBring` localized field on Products (when productType=workshop) and read it here.                                                                                                                                                                                        |
| A4  | Order confirmation email items are a flat comma string | [src/hooks/brevo/sendOrderConfirmationEmail.ts](src/hooks/brevo/sendOrderConfirmationEmail.ts) builds `"Title xN, Title xN"`.                                                                                                                                                                          | Build structured HTML rows: thumbnail · title · short description · qty · line price · SKU. Update template 10 to render with `{% for %}`.                                                                                                                                          |
| A5  | Mixed cart only surfaces the first booking           | Same hook — `bookings.docs[0]`.                                                                                                                                                                                                                                                                       | Iterate all bookings linked by `cartSlug` and render every participant block.                                                                                                                                                                                                      |
| A6  | Dead code: `sendWorkshopBookingEmail` reads `doc.location` (field doesn't exist on schema) | [src/hooks/brevo/sendWorkshopBookingEmail.ts](src/hooks/brevo/sendWorkshopBookingEmail.ts) + [src/collections/WorkshopBookings.ts](src/collections/WorkshopBookings.ts)                                                                                                                                | Delete this hook (the real email comes from `confirmWorkshopBookings.ts`) or wire it correctly.                                                                                                                                                                                    |
| A7  | `SHIPPING` param defaults to "€0,00" for pickup orders | sendOrderConfirmationEmail.                                                                                                                                                                                                                                                                           | When pickup, send `"Abholung — {locationName}"` (localized).                                                                                                                                                                                                                       |
| A8  | Order/workshop confirmation greets _"Hello {{email-local-part}}"_ for guest checkout | [src/components/checkout/CheckoutPage.tsx](src/components/checkout/CheckoutPage.tsx) only collects email for guests; downstream Brevo hooks fall back to `email.split('@')[0]`. Same root cause as A1, parallel surface. | Add required name input above email in guest section. Persist via new `customerName` field on Orders + Transactions; thread through `/api/voucher/place-order` directly and through `/api/checkout/attach-customer-name` (called between Stripe success and `confirmOrder`) for product/workshop checkout. New Order beforeChange hook copies `customerName` from the linked Transaction. Brevo hooks read `doc.customerName`. |

## B. Voucher flow

| #   | Bug                                                 | File                                                                                                                                                                                                                                                | Fix                                                                                                                  |
| --- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| B1  | Voucher-paid orders may skip workshop confirmation email | [src/app/api/voucher/place-order/route.ts](src/app/api/voucher/place-order/route.ts) creates Order with `status: completed` directly (no Stripe webhook). `confirmWorkshopBookings` afterChange-create on Orders should still fire — but needs end-to-end live test. | Test, and if broken, explicitly confirm pending workshop-bookings in the route.                                      |
| B2  | Vouchers collection has no `purchaserFirstName` / `purchaserLastName` | [src/collections/Vouchers.ts](src/collections/Vouchers.ts)                                                                                                                                                                                          | Add fields + update Stripe metadata pipeline (ties to A1).                                                           |
| B3  | Voucher errors only in German                       | place-order route                                                                                                                                                                                                                                   | Localize.                                                                                                            |

## C. Cart / Checkout

| #   | Bug                                                          | File                                                                                                                                                                                                                                                                          | Fix                                                                                                              |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| C1  | Pickup address **hardcoded twice** (The Ginery, Grabenstraße 15, 8010 Graz) | [CheckoutPage.tsx](src/components/checkout/CheckoutPage.tsx) + [account/order-confirmation/page.tsx](src/app/(app)/account/order-confirmation/page.tsx) — but `WorkshopLocations` collection exists (slug `workshop-locations`).                                              | Read from CMS (default to first published location). Show dropdown if multiple. Pass selected `pickupLocation` ID to Order.additionalData + emails. |
| C2  | Pickup time slots skip 13:00                                 | [CheckoutPage.tsx#L248](src/components/checkout/CheckoutPage.tsx#L248)                                                                                                                                                                                                        | Add `{ value: '13:00', label: '13:00' }`.                                                                        |
| C3  | Cards may fail on mixed cart (workshop + physical pickup)    | CheckoutPage `initiatePaymentIntent` for pickup branch sends no billing address — Stripe Radar/3DS may decline. Webhook itself ([stripeWebhooks.ts](src/collections/Orders/stripeWebhooks.ts)) is fine.                                                                       | Always collect minimal billing for card payments even on pickup; pass to Stripe Elements.                        |
| C4  | CartModal hardcodes German "{time} Uhr"                      | [src/components/Cart/CartModal.tsx](src/components/Cart/CartModal.tsx)                                                                                                                                                                                                        | Locale-aware ("at {time}" for EN).                                                                               |

## D. i18n gaps (hardcoded strings)

| #   | File                                                                                                       | Line / area                                                            |
| --- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| D1  | [ConfirmOrder.tsx#L97](src/components/checkout/ConfirmOrder.tsx#L97)                                       | "Confirming Order" — not localized                                     |
| D2  | [CheckoutPage.tsx](src/components/checkout/CheckoutPage.tsx)                                               | Generic English error toasts ("An error occurred…", "out of stock")    |
| D3  | [account/order-confirmation/page.tsx](src/app/(app)/account/order-confirmation/page.tsx)                   | Inline `locale === 'de' ? … : …` ternaries instead of t.* (inconsistent + missing strings) |
| D4  | [voucher/place-order/route.ts](src/app/api/voucher/place-order/route.ts)                                   | German-only API errors                                                 |
| D5  | [workshops/[slug]/add-to-cart-utils.ts](src/app/(app)/workshops/%5Bslug%5D/add-to-cart-utils.ts)           | German-only toasts                                                     |

## E. Where to edit Brevo HTML templates

- **Source HTML:** `public/email-templates/01-…html` … `19-…html`
- **Push to Brevo:** `pnpm node scripts/brevo-setup-templates.mjs` (recreates by ID — overwrites Brevo dashboard content)
- **Subjects** are set ONLY in that script (not in the HTML files)
- **Template ↔ ID map:** `BREVO_TEMPLATES` in [src/lib/brevo.ts](src/lib/brevo.ts)
- **Faster alternative** for content/style tweaks: edit directly in Brevo dashboard (but next push will overwrite)

Recommended workflow: edit local HTML → commit → push via script → never edit in dashboard.

### Template ↔ ID map (current)

| Slug                              | ID  |
| --------------------------------- | --- |
| ACCOUNT_CREATION                  | 66  |
| EMAIL_VERIFICATION                | 69  |
| PASSWORD_RESET                    | 70  |
| LOGIN_NOTIFICATION                | 71  |
| WORKSHOP_BOOKING_CONFIRMATION     | 65  |
| ORDER_CONFIRMATION                | 72  |
| NEWSLETTER_WELCOME                | 68  |
| VOUCHER_PURCHASED                 | 73  |

## F. Manual QA test matrix (after fixes)

For each scenario, run in **DE** and **EN**:

1. Workshop only (1 person)
2. Workshop only (4 people)
3. Workshop + physical (forced pickup)
4. Physical only (pickup)
5. Digital course only
6. Voucher purchase — email delivery
7. Voucher purchase — pickup delivery
8. Voucher redemption against workshop
9. Stripe 3DS test card · Klarna · SEPA

---

## Suggested execution order (when approved)

1. **A2** (1-line subject fix) — instant win
2. **A1 + B2** (voucher buyer name end-to-end)
3. **A3 + A6 + A7** (workshop/order email content cleanup)
4. **A4 + A5** (structured order items + multi-booking)
5. **C1 + C2** (pickup from CMS + 13:00 slot)
6. **C3** (Stripe mixed-cart card flow)
7. **C4 + D1–D5** (i18n)
8. **B1** (voucher-paid workshop email — live verification)

After every schema change: `pnpm generate:types && pnpm generate:importmap && npx tsc --noEmit`.

---

## Hard rules / do-not-touch

- `src/components/Footer/index.tsx` (user revert area, awaiting reply)
- Phase 6 emails + Help block (uncommitted, do not commit)
- No code changes until plan is approved
