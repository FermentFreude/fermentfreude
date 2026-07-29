# FermentFreude V2 Email Templates

Source-of-truth HTML for the 8 founder-edited Brevo V2 transactional templates.

## Template ID map

| File | Brevo ID | Backend trigger |
| ---- | -------- | ---------------- |
| `66-account-creation.html` | 66 | `sendAccountCreationEmail.ts` |
| `69-email-verification.html` | 69 | (future, manual) |
| `70-password-reset.html` | 70 | `sendPasswordResetEmail.ts` |
| `71-login-notification.html` | 71 | (future, manual) |
| `68-newsletter-welcome.html` | 68 | `syncUserToBrevo.ts`, `newsletter/subscribe/route.ts` |
| `65-workshop-booking.html` | 65 | `confirmWorkshopBookings.ts` |
| `72-order-confirmation.html` | 72 | `sendOrderConfirmationEmail.ts` |
| `73-voucher-purchased.html` | 73 | `sendVoucherPurchaseEmail.ts` |

Refund / rebooking system (`docs/REFUND_REBOOKING_SYSTEM_PLAN.md` §9), created Stage 7 of `docs/REFUND_REBOOKING_BUILD_LOG.md`:

| File | Brevo ID | Backend trigger |
| ---- | -------- | ---------------- |
| `customer-rebooked.html` | 95 | `rebook-now/route.ts` |
| `rebooking-voucher-issued.html` | 96 | `rebook-later/route.ts` |
| `cancelled-no-refund.html` | 97 | `cancel-no-refund/route.ts` |
| `refund-initiated.html` | 98 | `request-refund/route.ts` |
| `organiser-cancelled.html` | 99 | `handleOrganiserCancellation.ts` |

Note: ID 94 is intentionally skipped — `BREVO_TEMPLATES.ADMIN_WORKSHOP_NOTIFICATION` in `src/lib/brevo.ts` already claims 94 but has zero call sites anywhere in the codebase and no template ever existed in Brevo for it (confirmed while creating the templates above — a POST create landed on 94 first, proving the ID was free). Left as pre-existing dead code, out of scope for Stage 7; flagged in the build log.

## Design system

- Width: 600px max, single column, fluid on mobile.
- Font: `Helvetica, Arial, sans-serif` (Neue Haas not email-safe).
- Palette: cream `#F6F0E8`, dark `#1a1a1a`, body `#555251`, accent `#E5B765`, danger `#c2410c`, success `#15803d`.
- Icons + submark are PNG hosted on Cloudflare R2 prod bucket (mirrored to staging).
- All Liquid params use `{{ params.X | default: "" }}` defensively. `ORDER_ITEMS_HTML` and `WORKSHOP_BOOKINGS_HTML` are rendered raw.
- Subject lines + senders are NEVER overwritten — only `htmlContent` is updated via PUT.

## Push to Brevo

```bash
node --env-file=.env scripts/push-brevo-templates.mjs            # push all 8
node --env-file=.env scripts/push-brevo-templates.mjs 72         # push one
node --env-file=.env scripts/push-brevo-templates.mjs --test 72  # send test email
```
