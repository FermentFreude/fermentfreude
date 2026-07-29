# FermentFreude — Refund, Rebooking & Cancellation System
## Master Implementation Plan

**Status:** Planning complete, policy confirmed, nothing built yet.
**Prepared:** 2026-07-27, consolidating the AGB, the approved technical spec, the July 17 meeting outcomes, and the Figma prototype review.
**Branching note:** Build this on top of `staging`, not `main`. The admin-notification-email pattern this plan extends (`sendOrderConfirmationEmail.ts`'s consolidated admin alert) only exists on `staging` as of this writing — merge or rebase onto `staging` before starting Stage 0, per the project's `feature → staging → main` flow.

---

## 1. Source documents

| Document | Location | What it is |
|---|---|---|
| AGB V4 | `docs/AGB_V4_2026-07-14.pdf` | Signed legal terms — the customer-facing contract. Source of truth for cancellation windows and entitlements. |
| Booking, Rebooking & Refund Logic v1.1 | `docs/BOOKING_REBOOKING_REFUND_LOGIC_v1.1.pdf` | Internal technical spec (BR-001–BR-093) translating the AGB into business rules, addressed to Rafaela and Ala'a. |
| This file | `docs/REFUND_REBOOKING_SYSTEM_PLAN.md` | Consolidated build plan — reconciles the above two with the July 17 meeting decisions and the Figma prototype (`Refund-Screens-prototype`, fileKey `YZKfFgx3y4vg47z9zYOZq5`). |
| Superseded | `docs/REFUND_CANCELLATION_POLICY_RESEARCH.md`, `docs/FermentFreude_Refund_Cancellation_Plan.pdf` | Pre-policy research and the July 10 proposal. Kept for history; the credit/voucher-waterfall design in the July 10 plan is superseded by §2 below. |

---

## 2. Confirmed policy (final)

One entitlement — **the right to rebook, once** — exercised two ways: immediately (pick a date now) or deferred (a code redeemable later, within 12 months). This is not a separate "credit" category; it consumes the same one-time allowance either way.

| Time to workshop start | Refund | Rebook now | Rebook later (code) |
|---|---|---|---|
| ≥ 720h (30 days) | ✅ full refund, customer's choice | ✅ | ✅ |
| 336h–720h (14–30 days) | ❌ | ✅ | ✅ |
| < 336h (14 days) | ❌ | ❌ | ❌ — nothing, no exceptions |
| No-show | ❌ | ❌ | ❌ |

- Thresholds calculated live, server-side, in `Europe/Vienna`, every time the magic link is opened **and** re-validated on the actual write — never trust client-side timing.
- Once the one-time rebooking is used (either form), no further self-service rebooking or refund right exists for that seat (AGB §4.6).
- Free substitute-person transfer (AGB §4.8) is always available regardless of tier, requires no UI/data model — seats are anonymous entitlements, whoever holds the ticket attends.
- Multi-seat bookings: each seat resolved **independently** — confirmed in the July 17 meeting, matches AGB §4.9 and the Figma per-seat option grid.
- Goodwill exceptions outside this matrix remain admin-only, manually recorded (AGB §4.4 "Kulanzlösung").
- Organiser cancellation (Fermentfreude cancels a date) is a separate flow — see §7 — not gated by these windows.

**Confirmed 2026-07-27:** "rebook later via code" applies at both the ≥30-day and the 14–30 day tier — matches the policy-engine pseudocode in §5 as written.

---

## 3. Architecture principle

**One seat = one independent lifecycle.** The order is the payment container; the seat is what gets cancelled, rebooked, or refunded. Every screen, API route, and policy check operates on a seat, never on "the booking" as an atomic unit.

---

## 4. Data model changes (Payload CMS)

### 4.1 `WorkshopBookings.seats[]` — add per entry

```
seatStatus: select
  'active' | 'cancelled_no_refund' | 'rebooking_pending' | 'rebooked'
  | 'refund_requested' | 'refunded' | 'voucher_issued'
  | 'organiser_cancelled_pending' | 'no_show'
selfRebookingUsed: checkbox (default false)          // BR-020 one-time rule
cancelledAt: date
cancelledReason: select                                // matches the 4 Figma "Grund" options + Sonstiges
  'cannot_attend' | 'personal_health' | 'wrong_workshop' | 'workshop_cancelled' | 'other'
linkedVoucherId: relationship → vouchers               // when seatStatus = voucher_issued
linkedRefundRequestId: relationship → refund-requests
rebookedToBookingId / rebookedFromBookingId: text       // traceability, BR-024
```

Booking-level `status` becomes a derived summary (e.g. "mixed", "cancelled", "confirmed") computed from seat states — stop treating it as the source of truth.

### 4.2 New collection: `booking-magic-links`

Reuses the exact pattern already proven by `Orders.downloadToken` / `WorkshopBookings.downloadToken`.

```
token: text, unique, indexed (UUID)
bookingId: relationship → workshop-bookings
scope: select 'self-service' | 'organiser-cancellation'
issuedAt: date
expiresAt: date (nullable — link can expire for security; underlying entitlement never does, BR-053. Expired link → reissue a new token, same bookingId)
```

### 4.3 New collection: `refund-requests` — replaces the dormant `CancellationRequests`/`ReturnRequests`

Those two exist today with `create: adminOnly` (customers can't create one via the API at all) and no seat-level linkage — dead scaffolding, not worth patching. Build fresh; deprecate the old two once this ships (don't delete — they may hold historical rows).

```
seatRef: relationship → workshop-bookings (store bookingId + seat index/id)
policyResult: select
  'full_refund' | 'rebook_now' | 'rebook_later_voucher' | 'no_entitlement'
  | 'organiser_cancellation_refund' | 'organiser_cancellation_rebook' | 'goodwill'
requestedAmount: number (cents)
paymentSource: select 'card' | 'purchased_voucher' | 'mixed'
status: select 'requested' | 'acknowledged' | 'processing' | 'completed' | 'failed'
initiatedBy: select 'customer' | 'admin'
stripePaymentIntentId: text          // for founders' manual Stripe lookup — see §8
stripeRefundId: text (nullable)       // filled once the charge.refunded webhook reconciles
requestedAt / acknowledgedAt / completedAt: date
notes: textarea
```

### 4.4 `Vouchers` — one new field

```
origin: select 'gift-purchase' | 'cancellation-self-service' | 'admin-goodwill'
  (default 'gift-purchase' for backward compatibility with existing rows)
```
Distinguishes a paid gift card from a policy-issued rebooking-deferral code in the admin list — no other schema change needed, `value` already accepts arbitrary amounts.

### 4.5 `WorkshopAppointments.availableSpots` — atomic capacity fix

Replace the current read-then-write (race-condition-prone, already flagged in code comments) with a single atomic `$inc` via the underlying MongoDB driver:

```
result = appointmentsCollection.updateOne(
  { _id: appointmentId, availableSpots: { $gte: seatsNeeded } },
  { $inc: { availableSpots: -seatsNeeded } }
)
if (result.matchedCount === 0) → return "sold out", do not proceed
```
Single-document atomic ops work fine on Atlas M0 without multi-document transactions — this isn't blocked by the no-transactions constraint.

### 4.6 New collection: `activity-events` — powers the Roster notification feed (§10)

```
type: select
  'order_placed' | 'voucher_purchased' | 'voucher_redeemed'
  | 'booking_rebooked' | 'booking_cancelled_no_refund'
  | 'refund_requested' | 'refund_completed'
  | 'appointment_cancelled_by_organiser'
refId: text            // order/booking/voucher/refund-request id
summary: text           // human-readable one-liner, e.g. "Thomas Huber — Kombucha 12.9., €99 refund requested"
readBy: array of relationship → users   // who on the admin team has seen it
createdAt: date (timestamps: true is enough)
```

---

## 5. Policy engine (final pseudocode)

```
function seatActionOptions(seat, appointment, now, config):
  if appointment.status === 'CANCELLED_BY_ORGANISER':
    return ['SELECT_REPLACEMENT_WORKSHOP', 'REQUEST_FULL_REFUND']

  if seat.seatStatus !== 'active':
    return []   // already resolved — nothing left to do

  if seat.selfRebookingUsed:
    return []   // one-time right already spent

  hoursToStart = diffHours(appointment.dateTime, now, 'Europe/Vienna')

  if hoursToStart >= 720:
    return ['REQUEST_FULL_REFUND', 'REBOOK_NOW', 'REBOOK_LATER_VIA_CODE']
  if hoursToStart >= 336:
    return ['REBOOK_NOW', 'REBOOK_LATER_VIA_CODE']

  return ['CANCEL_NO_REFUND']   // <14 days or already past start (no-show path)
```

Single module, config-driven thresholds (720/336 hours, tier availability flags), unit-tested against every row in §2's table. Called from the page (to render buttons) **and independently re-run inside every mutation endpoint** — the UI is a convenience, never the authority.

---

## 6. Customer magic-link flow

Entry point: extend the existing booking-confirmation email (Brevo) with a "Buchung verwalten" link using a token from `booking-magic-links`, same UX precedent as the existing `downloadToken` receipt link.

Route: `/manage-booking/[token]` (public, no login — matches `AGB` requirement that no account is needed).

### Single-seat flow (maps to Figma frames `2:2317` → `2:2442` → sub-flows)
1. Reason picker (`2:2317`) — 4 reasons + Sonstiges
2. Options screen (`2:2442`) — buttons rendered from `seatActionOptions()`, not hardcoded to always show 3
3. Branches:
   - `REBOOK_NOW` → date picker (`2:1892`) → confirm
   - `REBOOK_LATER_VIA_CODE` → code-issuance screen (`2:1759`), reusing `Vouchers` with `origin: 'cancellation-self-service'`
   - `REQUEST_FULL_REFUND` → refund-confirmation screen (`2:2039`) → creates a `refund-requests` row, status `requested`

### Multi-seat flow (maps to `2:2` → `2:272`/`2:464` → `2:684` → `2:934`/`2:1111` → `2:1317` → `2:1654`)
1. Reason picker
2. Seat picker (`Wer kann nicht kommen?`) — tap to mark affected seats
3. Warning interstitial (`Bist du sicher?`) — required checkbox, this is the BR-014 "final and irreversible" acknowledgment
4. Per-seat option grid — each affected seat gets its own three-way choice, independent (confirmed decision, §2)
5. Sub-flows identical to single-seat, run once per affected seat
6. Completion screen summarizing mixed outcomes

### Screens that still need designing (not in the current Figma file)
- The 14–30 day tier screen (2 options, not 3) — currently only the 3-option ≥30-day screen exists
- The <14-day "nothing available" screen — should state clearly: no refund, no rebooking, no code; substitute-person transfer remains free (link to how, e.g. "just give your ticket to someone else")
- No-show has no customer-facing screen by definition (link may still resolve post-hoc to show "no entitlement" if opened after the event)

---

## 7. Organiser-cancellation flow

1. Admin cancels an appointment in the dashboard (new action — not yet built anywhere), enters customer-facing reason + internal note.
2. Server marks the appointment `CANCELLED_BY_ORGANISER`; every linked seat → `organiser_cancelled_pending`. **No automatic rebooking, no automatic voucher** — matches BR-050/052.
3. One Brevo send per affected order (not per seat) — new template, see §9 — explaining the cancellation and containing a magic link, `scope: 'organiser-cancellation'`.
4. That link opens the *same* `/manage-booking/[token]` route; `seatActionOptions()` returns the organiser-cancellation branch (rebook to any available regular workshop, or full refund) — reuses ~90% of the self-service UI already designed.
5. Logged to `activity-events` as `appointment_cancelled_by_organiser` for the audit trail — no admin email needed for their own action, but it's visible in the Roster activity feed (§10).

---

## 8. Refund execution — MVP scope (revised)

**No Stripe API call yet.** `stripe.refunds.create()` automation is explicitly deferred to a later phase. For this build:

1. Customer or organiser-cancellation flow creates a `refund-requests` row (`status: 'requested'`) with the calculated amount from the seat's actually-paid components (never the current list price — matters if a price-adjusted rebooking already happened on that seat).
2. This fires:
   - Admin notification email (§9) — includes the amount, customer, workshop, and the Stripe PaymentIntent ID so founders can find the charge directly in Stripe's own dashboard without hunting.
   - `activity-events` row, surfaced in the new Roster **Refunds** panel (§10).
3. Founder manually issues the refund inside Stripe's dashboard (external, out of this app) — exactly as they do today for the rare manual refund.
4. The **existing** `charge.refunded` webhook handler (`stripeWebhooks.ts`) fires, needs one change: reconcile against the specific `refund-requests` row and the specific `seat` (today it refunds the entire booking — becomes seat-scoped once §4.1 ships) → `refund-requests.status = 'completed'`, `seat.seatStatus = 'refunded'`, restore appointment capacity via the atomic `$inc`.
5. Roster Refunds panel shows the row as resolved once the webhook confirms — founders don't need to manually mark anything "done" themselves, the reconciliation is automatic once Stripe fires the webhook. (An optional "I've submitted this in Stripe" acknowledgment checkbox can be added purely so founders can track what they've actioned vs. not yet looked at — cosmetic, not authoritative; the webhook remains the source of truth for actual completion.)

This is meaningfully simpler than the semi-automated in-app "confirm & execute" button from the earlier draft of this plan — that's Stage 2 of the *future* automation phase, not this build.

---

## 9. Brevo email plan

All new templates follow the existing `BREVO_TEMPLATES` registry pattern in `src/lib/brevo.ts` (numeric IDs, versioned comments). Reuse `sendTemplateEmail()` for customer-facing (designed templates, editable by non-coders in Brevo) and the existing `sendTransactionalEmail()` inline-HTML pattern for admin alerts (matches the July 21 admin-notification-consolidation approach already on `staging` — no Brevo template needed for internal alerts).

### Customer-facing (new/edited Brevo templates)

| Template | Trigger | Key content |
|---|---|---|
| `WORKSHOP_BOOKING_CONFIRMATION` (65) — **edit existing** | Booking confirmed | Add "Buchung verwalten" magic link + one-line policy summary ("Kostenlose Stornierung bis 30 Tage vorher — Details") |
| `CUSTOMER_REBOOKED` — new | `REBOOK_NOW` completed | Old date, new date, location, no new charge confirmation |
| `VOUCHER_CODE_ISSUED` (deferred-rebooking variant) — new, or extend `sendVoucherPurchaseEmail` with an `origin`-aware branch | `REBOOK_LATER_VIA_CODE` completed | Code, 12-month validity, "einlösbar bei jedem unserer Workshops" |
| `CUSTOMER_CANCELLED_NO_REFUND` — new | `<14 days` self-service cancellation confirmed | Acknowledgment, explicit no-refund/no-rebook statement, reminder that free substitute-transfer remains possible |
| `REFUND_INITIATED` — new | Refund request created | Amount, "wird innerhalb von 14 Tagen bearbeitet" — per BR spec, never promise an exact bank-arrival date |
| `ORGANISER_CANCELLED` — new | Admin cancels an appointment | Reason, magic link, both choices explained plainly |

### Admin-facing (extend the existing consolidated-notification pattern, not a new mechanism)

`sendOrderConfirmationEmail.ts` is already, as of `staging`, the single place that sends one admin alert per order (fixed from a prior double-send bug — reuse that discipline, don't reintroduce duplicate pings). Add equivalent single-alert hooks for:

- `refund_requested` → **the important one** — must clearly say "action needed in Stripe" and include the PaymentIntent ID
- `booking_rebooked` (now or later-via-code)
- `booking_cancelled_no_refund`
- `appointment_cancelled_by_organiser` is *not* separately emailed to admin (they just did it themselves) — logged to activity feed only

**Confirmed 2026-07-27, updated same day:** admin alert recipients are `kontakt@fermentfreude.at` **plus Rafaela's own address, `connectwithrafaela@gmail.com`**, so she's notified of everything happening on the site (orders, vouchers, rebookings, refunds — not refund-only). Implementation: `ADMIN_NOTIFICATION_EMAIL` becomes a comma-separated list rather than a single address, split into multiple `to` recipients on every `sendTransactionalEmail`/admin-alert call. Keep it env-var-driven, not hardcoded in source, so recipients stay a config change — see note on changing this later at the bottom of this file.

---

## 10. Roster dashboard additions

Extends the existing `RosterClient.tsx` nav (`dashboard | workshops | detail | participants | pickups | vouchers`) — same pattern as the existing `VouchersView.tsx`, no new infrastructure.

### New nav section: **Refunds**
- Queue of `refund-requests` where `status IN ('requested', 'acknowledged')`, sorted oldest-first
- Per row: customer, workshop/date, amount, days pending, Stripe PaymentIntent ID (copy button), a direct Stripe-dashboard search link if feasible
- Once the webhook resolves it, row moves to a "Completed" tab automatically — no manual admin action required to close it out

### New nav section (or a header widget): **Activity / Benachrichtigungen**
- Feed backed by `activity-events`, newest first, all event types from §4.6
- Unread-count badge on the Roster nav item (based on `readBy` not containing the current admin user) — this is the "notification on the dashboard" the founders asked for, generalized beyond just refunds to cover every booking/purchase/voucher/refund event
- Mark-as-read on scroll-into-view or a "mark all read" button — simple, no websockets/push needed since this is a periodically-checked internal tool, not a live ops console

---

## 11. Notification taxonomy

| Event | Customer email | Admin email | Dashboard activity entry |
|---|---|---|---|
| Order placed (workshop or shop) | ✅ (existing) | ✅ (existing, consolidated) | ✅ new |
| Voucher purchased | ✅ (existing) | ✅ (existing) | ✅ new |
| Voucher redeemed | — | — | ✅ new |
| Self-rebook now | ✅ new | ✅ new | ✅ new |
| Self-rebook later (code issued) | ✅ new | ✅ new | ✅ new |
| Cancel, no refund (<14d) | ✅ new | ✅ new | ✅ new |
| **Refund requested** | ✅ new | ✅ new — **action needed** | ✅ new, in Refunds panel |
| Refund completed (webhook) | ✅ new | — (they already know, they did it) | ✅ new, moves to Completed |
| Organiser cancels appointment | ✅ new (per affected order) | — | ✅ new |

---

## 12. Build stages

| Stage | Scope |
|---|---|
| **0 — Foundation** | Seat-level status fields, atomic capacity `$inc`, `booking-magic-links` collection, `refund-requests` collection, `activity-events` collection, policy-engine module + unit tests against §2's full matrix |
| **1 — Self-service core** | `/manage-booking/[token]`, single-seat cancel/rebook-now/rebook-later, `CANCEL_NO_REFUND` path, the two missing screens from §6 |
| **2 — Multi-seat** | Seat picker, per-seat independent grid, mixed-outcome summary |
| **3 — Refund notify-and-reconcile** | `refund-requests` creation on customer action, admin alert email, extend `charge.refunded` webhook to be seat-scoped |
| **4 — Organiser cancellation** | Admin "cancel appointment" action, Brevo blast, magic-link organiser-cancellation branch |
| **5 — Brevo templates** | All templates in §9, wired to the BREVO_TEMPLATES registry |
| **6 — Roster additions** | Refunds panel, Activity feed + unread badge |

## 13. Testing & rollout

- Unit-test the policy engine against every row of §2 plus the organiser-cancellation branch — highest-leverage test, everything else depends on it.
- Staging dry-run: force an appointment's `dateTime` to hit each tier boundary, walk every Figma screen against a real seat, confirm the webhook reconciliation with Stripe test-mode refunds.
- Both prior open points (§2 voucher-tier scope, §9 admin recipient list) are confirmed as of 2026-07-27 — the full policy and notification plan is settled, nothing left to check with David/Marcel before building.

### Changing these decisions later

Both confirmed points above are deliberately config-driven, not hardcoded, so revisiting either is cheap:
- **Voucher-tier scope** — a single boolean per tier in the policy-engine config (§5). Flipping the 14–30 day tier off later is a one-line config change plus removing one button from the options screen; no data-model or API change needed, since `refund-requests`/`Vouchers` already model "voucher issued at any tier" generically.
- **Admin recipient list** — `ADMIN_NOTIFICATION_EMAIL` is an env var holding a comma-separated list (currently `kontakt@fermentfreude.at, connectwithrafaela@gmail.com`), parsed into multiple Brevo `to` recipients. Adding David/Marcel personal addresses later, or removing Rafaela's once the system is stable, is purely an env-var edit — no code change, no schema change, no redeploy-with-code-review needed.

Neither decision is load-bearing for the data model or the policy engine's structure — both were built as the two adjustable knobs specifically because they were the least settled parts of the plan.
