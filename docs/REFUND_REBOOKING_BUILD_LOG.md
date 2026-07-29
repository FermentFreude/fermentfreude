# Refund, Rebooking & Cancellation System — Build Log

**Branch:** `feature/refund-rebooking-system` (based on `staging`)
**Source of truth for policy/architecture:** `docs/REFUND_REBOOKING_SYSTEM_PLAN.md`
**Status:** All 10 stages complete and verified. Nothing pushed, nothing merged. Local-only until reviewed. Two open action items need Rafaela (Vercel env var — Stage 8; `stripe-webhooks` script URL — Stage 10), see the updated Final consolidated summary below.

This document is the running record: what got built, what was verified and how, every bug found along the way (fixed or deliberately deferred, and why), and every deliberate deviation from the plan's literal wording. Read stage-by-stage; each section is self-contained. The final consolidated summary is at the bottom.

---

## Master to-do

- [x] **Stage 0 — Foundation**
- [x] **Stage 1 — Self-service core**
- [x] **Stage 2 — Multi-seat**
- [x] **Stage 3 — Refund notify-and-reconcile**
- [x] **Stage 4 — Organiser cancellation**
- [x] **Stage 5 — Brevo templates**
- [x] **Stage 6 — Roster additions**
- [x] **Final consolidated summary**
- [x] **Stage 7 — Brevo templates: real creation + main/staging parity audit**
- [x] **Stage 8 — Admin notification email: local + Vercel** (local done; Vercel needs Rafaela — no CLI in this environment)
- [x] **Stage 9 — REBOOK_NOW crash recovery**
- [x] **Stage 10 — Real Stripe test-mode webhook dry run**

---

## Stage 0 — Foundation

### Built
- `src/lib/policyEngine.ts` — pure, DB-free module implementing `seatActionOptions()` per plan §5, config-driven tier toggles (§13), `policyResultForAction()`, and `hydrateSeatDefaults()`.
- `src/lib/atomicSpots.ts` — `reserveSpotsAtomic`/`releaseSpotsAtomic` using `payload.db.collections[slug]` (the underlying Mongoose model) for a real atomic `$inc`-with-guard (reserve) and `$min`/`$add` pipeline update (release, capped at `maxCapacity`).
- Applied the atomic helper at all four `availableSpots` call sites: `add-workshop/route.ts`, `release-spots/route.ts`, `stripeWebhooks.ts` (×2), `restoreWorkshopSpotsOnDelete.ts`.
- Schema: `WorkshopBookings.seats[]` gained `seatStatus`, `selfRebookingUsed`, `cancelledAt`, `cancelledReason`, `linkedVoucherId`, `linkedRefundRequestId`, `rebookedToBookingId`/`rebookedFromBookingId`. Booking-level `status` left untouched (still load-bearing elsewhere).
- `Vouchers.origin` field (no `required: true` — see bug list).
- Three new collections: `BookingMagicLinks`, `RefundRequests`, `ActivityEvents` — `adminOnly`, new "Refunds & Rebooking" admin group.

### Deliberate deviation from the plan
Organiser-cancellation branch uses a distinct action `REQUEST_ORGANISER_CANCELLATION_REFUND` instead of reusing `REQUEST_FULL_REFUND` (what §5's pseudocode literally returns). Same customer-facing behavior — full refund, same button — but it removes ambiguity for the refund-requests row's `policyResult` (two distinct enum values per §4.3: `full_refund` vs `organiser_cancellation_refund`). Implementation detail, not a policy change.

### Bugs found and fixed
1. **`Vouchers.origin` marked `required: true` broke two existing call sites** (`voucher/confirm/route.ts` indirectly, `create-giveaway-vouchers.ts`) — Payload's generated types don't treat `defaultValue` as satisfying `required` for TS purposes. Fixed by dropping `required: true` (the `defaultValue` already covers backward compatibility with existing rows, per the plan's own intent).
2. **`atomicSpots.ts` TS errors** — `payload.db.collections[slug]` is a generically-typed Mongoose model with no per-collection field types, so `.lean()` results needed an explicit local interface cast.
3. **Pre-existing race condition, now fixed for real**: the booking-time spot decrement (`add-workshop/route.ts`) was read-then-write — two concurrent requests for the last spot could both succeed, overselling by one. This was the actual point of Stage 0's atomic fix.
4. **Silent lockout risk for every booking made before this ships**: Payload's `defaultValue` only applies at document *creation*, never backfilled onto existing rows. Every pre-existing booking has `seatStatus: undefined` in MongoDB, which the policy engine's `seat.seatStatus !== 'active'` check would treat as already-resolved → zero options → looks like the whole feature is broken for every existing customer. Fixed with `hydrateSeatDefaults()` as a mandatory normalization boundary, explicitly documented and unit-tested (undefined/null/explicit-value cases).

### Verified
- `npx tsc --noEmit` — zero errors.
- `pnpm generate:types` / `generate:importmap` — clean.
- 28 (later 31) unit tests covering every row of §2's matrix, exact boundary hours, the one-time-rebooking gate, every resolved `seatStatus`, the organiser-cancellation branch, both config toggles, DST-boundary correctness.
- **Live verification against the real staging MongoDB** (not just mocks): created a throwaway appointment, fired 5 truly concurrent `reserveSpotsAtomic` calls for the last spot — exactly 1 succeeded, proving the overselling fix holds under real concurrency, not just in theory. Verified the release-side cap. Cleaned up after.
- `checkout-booking.int.spec.ts` — updated the two tests that mocked the old `payload.update` spot-restore path to mock `payload.db.collections[...]` instead; 33/34 passing.

### Known, not mine
`checkout-booking.int.spec.ts`'s booking-confirmation-email test was already broken before this work started — asserts on a `CUSTOMER_NAME`/minimal-params shape that doesn't match `confirmWorkshopBookings.ts`'s actual current output (which now sends `FIRST_NAME`, ICS attachments, a `SEATS` array, etc.). Untouched file, unrelated tech debt, left alone.

---

## Stage 1 — Self-service core

### Built
- `src/lib/manageBooking.ts` — `resolveMagicLink()` (token→booking+appointment, `overrideAccess:true`, same pattern as the existing `downloadToken` receipt route), `getAllSeatBundles()`/`getSeatBundle()`, `loadFreshForMutation()` (re-resolves everything immediately before any write), `updateSeat()`, `logActivityEvent()`.
- 6 API routes under `/api/manage-booking/[token]/`: GET (hydration), `available-dates`, `cancel-no-refund`, `rebook-now`, `rebook-later`, `request-refund`. Every mutation re-validates the action is still allowed before writing, 409s if not.
- `/manage-booking/[token]` page + client component — reason picker → data-driven options screen (renders however many buttons `seatActionOptions()` returns, not hardcoded to 3) → sub-flow per action → success screen. The two screens missing from the Figma prototype fall out of this naturally: 14–30 day tier is the same options screen with 2 buttons, and the <14-day state is a dedicated "nothing available" screen (explicit no-refund/no-rebook/no-code copy + free-transfer mention) triggered whenever options resolve to exactly `['CANCEL_NO_REFUND']`.
- Wired magic-link issuance into `confirmWorkshopBookings.ts` — every confirmed booking mints a `booking-magic-links` row; confirmation email gets `MANAGE_BOOKING_URL` + `POLICY_SUMMARY` params (falls back to `/account/orders` if link creation fails, non-fatal).
- Pulled forward from later stages (needed by Stage 1's mutations): `src/lib/adminNotification.ts` (comma-separated `ADMIN_NOTIFICATION_EMAIL`), 5 new `BREVO_TEMPLATES` entries — clearly marked placeholder IDs, real templates need creating in Brevo's dashboard by a human before these emails actually send.

### Bugs found and fixed
1. **`available-dates` route initially reused `getAllWorkshopAppointments()`**, which silently maps any workshop slug outside `lakto`/`kombucha`/`tempeh` to `'lakto'` as a fallback (fine for its original 3-card calendar UI). This made rebooking silently show **zero** available dates for any non-standard workshop (e.g. "Vom Feld ins Glas") — found only by actually running the mutation against real data, not by review. Fixed by querying `workshop-appointments` directly and matching on the real `workshop.slug`. Re-verified live: 6 dates shown, mutation succeeded, capacity decremented correctly.
2. **`rebook-now`'s failure-path "rollback" was a no-op** — on a caught error after reserving a spot, the original code called `payload.update(..., data: {})`, which does nothing; the reserved spot would have been silently lost forever on any booking-creation failure. Caught in self-review before it ever ran against real data. Fixed to call `releaseSpotsAtomic` properly.
3. **Test-harness mistake, not a product bug, but recorded for honesty**: while live-verifying the `available-dates` fix, the Playwright driver picked the *first* of 6 real returned dates rather than my own throwaway fixture (real appointments sorted earlier than my +900h test one). This transiently reserved a spot on a genuine staging test appointment ("Test appointment — Vom Feld ins Glas (Marktgarten)", not production data). Caught immediately via a DB check, traced the exact appointment through `rebookedToBookingId`, restored its spot count, verified zero leftover test data afterward.

### Verified
- `npx tsc --noEmit` — zero errors.
- 33/34 unit tests passing (same one pre-existing unrelated failure from Stage 0).
- Live browser pass (Playwright, driven directly since `chromium-cli` wasn't available in this environment) through all 4 required screens: ≥30-day (3 options), 14–30 day (exactly 2, confirmed "Geld zurück" absent), <14-day nothing-available screen, multi-seat seat-list-before-reason-picker. Zero console/page errors.
- Additionally drove `REBOOK_NOW` and `REQUEST_FULL_REFUND` fully live (not just the cheaper paths) — both succeeded end-to-end including real capacity math and real voucher/refund-request row creation. Confirmed the one-time-rebooking-right gate correctly locks out further options on an already-rebooked seat.

### Deliberately deferred
`REBOOK_NOW` has no compensation if the customer's connection dies between the new booking being created and the response returning — new booking, magic link, and original-seat update happen in sequence with no wrapping transaction (consistent with the rest of this MongoDB Atlas M0 codebase, which has no distributed transactions anywhere). A mid-flight crash could leave a customer holding two active bookings instead of one moved booking. Flagging explicitly since money is more directly at stake here than in the read-then-write patterns already accepted elsewhere in the app. Proper fix needs saga-style compensation — out of scope for this pass.

---

## Stage 2 — Multi-seat

### Built
Almost entirely a frontend upgrade — because Stage 1's API routes already operate per-seat (`seatIndex` param on every mutation), Stage 2 didn't need new endpoints, only a new client-side state machine that calls the existing endpoints once per selected seat, sequentially.

- Rewrote `ManageBookingClient.tsx`'s state machine: `seat-picker` (multi-select checkboxes, "Wer kann nicht kommen?", disabled for already-resolved seats) → `warning` (irreversibility acknowledgment, required checkbox, BR-014 — "Weiter" stays disabled until checked) → the existing single-seat sub-flow run once per selected seat in sequence (progress indicator: "Platz X von Y") → `mixed-summary` (per-seat outcome list once every selected seat is resolved).
- Single-seat bookings are completely unaffected — `isMultiSeat` gates straight past the picker/warning screens into the exact same flow Stage 1 built, `finishSeatAction()` branches to the old single `success` screen instead of the queue/summary path.
- Each selected seat gets its own reason picker and its own options grid, re-fetched fresh each time — a customer can send seat 1 through "rebook later" and seat 2 through "full refund" in the same session, and the two choices are stored, notified, and logged completely independently (this is the literal test I ran, not a hypothetical).

### Bugs found and fixed
1. **Stale-closure bug in `confirmReason`**: it called `await refreshSeats()` (which updates React state asynchronously) then immediately read from the `seats` variable — but that variable was still bound to the value from *before* the state update inside that function call's closure, so the "is this seat's only option CANCEL_NO_REFUND" check was running against stale data. Harmless in the common case (nothing changes in the few seconds between page load and clicking "Weiter"), but a real bug for the edge case of a customer sitting on the page exactly as a day-tier boundary passes. Fixed by having `refreshSeats()` return the freshly-fetched array directly, and having callers use the return value instead of the closed-over state variable.

### Verified
- `npx tsc --noEmit` — zero errors.
- 33/34 unit tests passing (same pre-existing unrelated failure).
- Live browser pass through the full multi-seat path against a real 3-seat booking: seat picker correctly lists all 3 named seats; selected exactly 2 (leaving the 3rd untouched); warning screen correctly names only the 2 selected seats and not the 3rd; "Weiter" confirmed disabled before acknowledgment; seat 1 driven through `REBOOK_LATER_VIA_CODE` (real voucher code issued), auto-advanced to seat 2, driven through `REQUEST_FULL_REFUND` (real refund-requests row created); mixed-summary screen correctly showed both distinct outcomes and correctly did not mention the untouched 3rd seat. Zero console errors.
- **Verified at the data layer, not just the UI**: queried the booking after the run — seat 3 (Clara) came back completely untouched (`seatStatus: 'active'`, no linked voucher/refund, no cancelledReason), while seats 1 and 2 had independently correct, distinct outcomes. The refund-requests row for seat 2 had the correct `seatIndex`, `requestedAmount` (€99 in cents), and `policyResult`. This is the concrete proof that "one seat = one independent lifecycle" (plan §3) actually holds in the data, not just in the screen text.
- All test fixtures deleted and confirmed gone afterward.

---

## Stage 3 — Refund notify-and-reconcile

Refund-request creation and the admin "action needed" alert email were already built in Stage 1 (pulled forward, since the `request-refund` mutation needed them to be a complete, testable action). Stage 3's remaining and primary piece: making the existing `charge.refunded` webhook seat-scoped instead of whole-booking-scoped, per plan §8.

### Built
- `handleChargeRefunded` in `stripeWebhooks.ts` now checks for `refund-requests` rows against the PaymentIntent **before** doing anything else. If any exist, it reconciles the pending ones — marks each `completed` with the real `stripeRefundId`, flips only that row's specific seat to `seatStatus: 'refunded'` (every other seat in the same booking is left completely alone), restores exactly 1 spot of capacity (not the booking's whole `guestCount`), logs a `refund_completed` activity event — and returns, **never** falling through to the old whole-order logic. When a PaymentIntent has multiple pending refund-requests (e.g. two seats in the same order both refunded), disambiguates using the specific Stripe refund's exact amount so only the matching row(s) get closed out.
- The pre-existing whole-order behavior is preserved unchanged as a fallback, for refunds issued entirely outside this system (an ad-hoc admin refund in Stripe with no `refund-requests` row behind it).

### A real bug found and fixed before it ever shipped
My first version of the "does this PaymentIntent belong to the new system" check filtered by status (`requested`/`acknowledged`/`processing`) *before* deciding whether to use the seat-scoped path at all. That's wrong: Stripe delivers webhooks **at-least-once**, not exactly-once — a redelivered `charge.refunded` event for a refund that was already reconciled on the first delivery would find zero *pending* rows, conclude "this PaymentIntent isn't ours," and fall through to the legacy whole-order path — incorrectly marking the entire order and every seat in the booking as refunded on a routine duplicate delivery. Fixed by querying for **any** refund-requests row for that PaymentIntent regardless of status first; if one exists at all (even fully completed), that PaymentIntent is permanently "owned" by the seat-scoped path, and a redelivery with nothing left pending just logs and no-ops. This is exactly the kind of "webhook idempotency and replay safety" risk called out explicitly in the brief — caught in self-review, not by running anything, but worth being honest that it shipped in the first draft before I caught it.

### Verified
- `npx tsc --noEmit` — zero errors.
- Added 2 new unit tests (on top of the 3 already covering the legacy webhook paths): one proving the seat-scoped path only touches the one targeted seat (leaves seats 0 and 2 of a 3-seat booking completely untouched, restores exactly 1 spot not 3, and — critically — never touches the `orders` collection at all), and one dedicated regression test for the replay-safety fix (a redelivered event for an already-completed row makes zero `update`/`findByID` calls). 4/5 passing in this file (the 1 failure is the same pre-existing, unrelated booking-confirmation-email test from before Stage 0).
- This stage is backend/webhook logic with no new UI — verified via types and tests per the brief's own calibration (no browser pass needed). Did not attempt to fire a real Stripe webhook end-to-end (would need Stripe CLI forwarding, not practical in this environment) — the mock-based tests are at the same verification tier the pre-existing webhook handlers already had before this work started.

### Deliberately not built
Amount-based disambiguation falls back to "reconcile every pending row" when Stripe's refund list can't be read. In practice this only matters for a PaymentIntent with *multiple* simultaneously-pending refund-requests where the specific refund amount is unavailable — a narrow edge case given founders process refunds one at a time from the (Stage 6) Refunds panel. Not hardening further now; flagging so it's a known, bounded gap rather than a silent one.

---

## Stage 4 — Organiser cancellation

### Built
- `WorkshopAppointments` gained `cancellationStatus` (select, default `scheduled`/`cancelled_by_organiser`), `cancellationReason` (customer-facing, shown only when cancelled), `cancellationInternalNote` (internal-only), `cancelledAt` — all standard Payload sidebar fields with `admin.condition`, same pattern already used elsewhere in this file (matches the existing `isPublished` field's UX, nothing novel). The admin action *is* just editing this one field and saving — no custom button/component, per Rule 6 (non-coder friendly): a founder toggles a select field exactly like they already do for `isPublished`.
- `beforeChange` hook: the instant `cancellationStatus` transitions to `cancelled_by_organiser`, the appointment is automatically also unpublished (`isPublished: false`) and `cancelledAt` stamped — cancelling and taking it off the public booking calendar are the same decision from an admin's perspective; making them two separate manual steps would let a founder cancel a date and forget to unpublish it, leaving it bookable.
- `src/hooks/handleOrganiserCancellation.ts` — `afterChange` hook, fires exactly once on that transition (never on later edits to an already-cancelled appointment, never on the way back). For every confirmed booking on the appointment: flips every still-`active` seat to `organiser_cancelled_pending` (seats already resolved some other way are left alone — same "one seat = one independent lifecycle" principle from every earlier stage), mints a fresh magic link scoped `organiser-cancellation`, sends the `ORGANISER_CANCELLED` email. Logs one `appointment_cancelled_by_organiser` activity event for the appointment itself (not per booking) — no admin email, since they just did this themselves (plan §9).
- Extended `rebook-now` and `available-dates` to serve both branches through the same endpoints: self-service `REBOOK_NOW` (same workshop only, consumes the AGB §4.6 one-time right) and organiser-cancellation `SELECT_REPLACEMENT_WORKSHOP` (any published workshop, does **not** consume that right — it's a separate entitlement). The policy engine never returns both actions for the same seat (mutually exclusive branches), so the two paths can share one endpoint safely.
- Added a one-line banner on the manage-booking page when the link's scope is `organiser-cancellation`, explaining why the customer is there — otherwise they'd land on the same generic screen with zero context for what happened.

### Bugs found and fixed (caught in self-review, before any of this ran)
1. **New booking would have kept the OLD workshop's title/slug even when replacing onto a completely different workshop.** `rebook-now` hardcoded `workshopSlug`/`workshopTitle` from the *original* booking — harmless for same-workshop self-service rebooking, actively wrong for an organiser-cancellation replacement onto a different workshop (a customer replacing a cancelled Kombucha date with a Tempeh date would have ended up with a booking record that still said "Kombucha"). Fixed to derive both from the *target* appointment's actual workshop when the action is a replacement.
2. **The one-time self-service rebooking right would have been silently marked "used" by an organiser-driven replacement.** `selfRebookingUsed: true` was unconditional in the original `rebook-now` code. Since the policy engine explicitly does *not* gate the organiser-cancellation branch on this flag (tested back in Stage 0), setting it here would have been a dead write with no visible effect *today* — but it would corrupt the seat's audit history (a founder looking at "did this customer use their self-service right" would see `true` for a right they never actually exercised). Fixed to only set it true for genuine self-service `REBOOK_NOW`.

### Verified
- `npx tsc --noEmit` — zero errors. `generate:types` and `generate:importmap` run (importmap: no new admin components, correctly a no-op).
- 35/36 unit tests passing (same pre-existing unrelated failure).
- Live, end-to-end, against real staging data: seeded a real appointment + confirmed booking, seeded a *second* appointment for a genuinely different workshop (Tempeh vs. the cancelled "Vom Feld ins Glas"), then triggered the cancellation exactly the way the admin panel would (`payload.update` with `cancellationStatus: 'cancelled_by_organiser'`) — not by calling the hook function directly, so this exercises the real trigger path. Verified at the data layer: seat flipped to `organiser_cancelled_pending`, appointment auto-unpublished, `cancelledAt` stamped, one `organiser-cancellation`-scoped magic link minted, one activity event logged. Then drove the resulting link through a real browser: banner appeared, options screen showed exactly the organiser-cancellation pair (`Ersatztermin wählen` / `Geld zurück`) and correctly did **not** show the self-service-only `Code für später` option, clicked into the date picker and confirmed it listed real appointments **across every workshop type** (Vom Feld ins Glas, Lakto-Gemüse, Tempeh, Kombucha all appeared, not just the cancelled workshop's type), picked a Tempeh replacement, completed successfully. Zero console errors. All test fixtures deleted afterward, confirmed gone.
- **Deliberately scoped down:** did not log into the `/admin` panel itself to screenshot the new sidebar fields rendering. Those are three standard Payload field types (`select`, `text`, `textarea`) with a standard `admin.condition`, following the exact same pattern as fields already live elsewhere in this same collection file (e.g. `isPublished`) — not novel code, low risk, and the actual business-logic risk (the hook, the seat-scoping, the cross-workshop replacement) got the thorough live verification instead. Noting the scoping decision explicitly rather than silently skipping it.

### A note on the Brevo placeholder IDs
Triggering the real hook during verification did fire an actual call to Brevo's API with the placeholder template ID (900005) — and Brevo's transactional API returned success rather than rejecting the unknown template ID synchronously. No real customer was affected (the test used a fake `@example.com` address), but it's worth flagging for Stage 5: a wrong/placeholder Brevo template ID may not fail loudly the way a bad API call normally would — this needs a real send test once actual template IDs exist in the dashboard, not just a "did the fetch succeed" check.

---

## Stage 5 — Brevo templates

Most of this stage's actual work was already done in earlier stages, because the mutations that needed it (Stage 1's four self-service routes, Stage 4's organiser-cancellation hook) couldn't be complete without it — every customer-facing template in plan §9 is already registered in `BREVO_TEMPLATES` and wired into its trigger point: `WORKSHOP_BOOKING_CONFIRMATION` (extended, Stage 1), `CUSTOMER_REBOOKED`, `VOUCHER_CODE_ISSUED`, `CUSTOMER_CANCELLED_NO_REFUND`, `REFUND_INITIATED` (all new, Stage 1), `ORGANISER_CANCELLED` (new, Stage 4). Same for the admin-facing alerts — `refund_requested` (with the Stripe PaymentIntent ID and an explicit "action needed" banner), `booking_rebooked`, `booking_cancelled_no_refund` were all built inline in their respective Stage 1/4 mutation routes. What was left, and what this stage actually did:

### Built / fixed
- **Retrofitted the two pre-existing admin-alert call sites** (`sendOrderConfirmationEmail.ts`, `sendVoucherPurchaseEmail.ts`) to use the new `getAdminRecipients()` helper instead of reading `process.env.ADMIN_NOTIFICATION_EMAIL` directly into a single `{ email: adminEmail }`. This was a live bug waiting to happen, not just a style inconsistency: the moment someone actually sets `ADMIN_NOTIFICATION_EMAIL` to the confirmed comma-separated value (`kontakt@fermentfreude.at,connectwithrafaela@gmail.com`), the *old* code in these two files would have passed the entire literal string `"kontakt@fermentfreude.at,connectwithrafaela@gmail.com"` to Brevo as a single malformed email address — likely rejected outright by Brevo's API, meaning **zero** admin notification for every order and every voucher purchase, silently, the day the env var got updated. Grepped the whole codebase afterward to confirm no other call site still reads the env var directly — `getAdminRecipients()` is now the only place that does.
- Added `tests/int/adminNotification.int.spec.ts` (5 tests) for the parsing helper itself: default fallback when unset, comma-splitting, whitespace/trailing-comma tolerance, empty-string fallback, single-address passthrough.

### Verified
- `npx tsc --noEmit` — zero errors.
- 40/41 unit tests passing across the full suite (same one pre-existing, unrelated failure).
- Manually exercised `getAdminRecipients()` against unset/comma-separated/trailing-comma/empty-string inputs before writing the permanent test, to confirm the actual behavior matched intent before locking it in.
- **Checked whether the confirmed decision is actually live anywhere yet**: `ADMIN_NOTIFICATION_EMAIL` is not currently set in any local `.env*` file in this repo. That means today, in local dev, admin alerts still go only to the single `kontakt@fermentfreude.at` default — the code is ready, but someone needs to actually set `ADMIN_NOTIFICATION_EMAIL=kontakt@fermentfreude.at,connectwithrafaela@gmail.com` in the relevant environment (Vercel production/staging env vars, and `.env` locally for local testing) before Rafaela actually starts receiving these. This is a deployment/config action item, not code — flagging it explicitly rather than assuming it's already handled.

### Still open (not code — needs a human in Brevo's dashboard)
All 5 new template IDs (`900001`–`900005`) are placeholders. Someone needs to actually create these 5 templates in Brevo's dashboard, then swap the placeholder numbers in `src/lib/brevo.ts` for the real assigned IDs. Until then, every one of these emails will fail to send (gracefully — logged, not thrown, per the existing `sendTemplateEmail` resilience pattern already used everywhere else in this codebase) but the underlying booking/refund/rebooking action itself always still succeeds.

---

## Stage 6 — Roster additions

### Built
- Extended `RosterData`/`fetchRosterData()` with `refundRequests`, `activityEvents`, and `activityUnreadCount`. `fetchRosterData()` now optionally accepts the current admin's user ID (passed from `/api/admin/roster/route.ts`, which already authenticates the request) so the unread calculation is per-viewer, not global.
- **Refunds panel** (`RefundsView.tsx`): two tabs — Queue (`requested`/`acknowledged`/`processing`, sorted most-days-pending-first so the oldest asks surface, with pending-count highlighted in red once it hits a week) and Completed. Each row shows customer, workshop/date, seat number, amount, a copy button for the Stripe PaymentIntent ID, and a direct link into Stripe's dashboard search (`dashboard.stripe.com/search?query=<id>`). Includes the optional "I've submitted this in Stripe" acknowledgment button from plan §8 step 5 — explicitly labeled and tooltipped as cosmetic only; the row still only moves to Completed once the real `charge.refunded` webhook (Stage 3) reconciles it.
- **Activity feed** (`ActivityView.tsx`): newest-first, unread events visually distinguished (blue dot, bold text, tinted row background), click-to-mark-one-read, and a "mark all read" button showing the count.
- New nav group "Refunds & Rebooking" in `RosterClient.tsx` with red count badges — Refunds shows the open-queue count, Activity shows the unread count — plus one eager client-side refresh on mount (in addition to the existing 30s poll / focus-refresh) so the unread badge gets an authenticated, per-user count within a fraction of a second rather than showing an intentionally-conservative "everything unread" estimate for up to 30 seconds.
- New server actions in `actions.ts`: `acknowledgeRefundRequest`, `markActivityEventsRead`, `markAllActivityEventsRead` — all resolve the current user via `payload.auth()` against request headers, matching the pattern already used elsewhere in the account pages.

### A gap in my own process, caught by actually looking at the screen
Every earlier stage's test fixtures (bookings, appointments, vouchers, refund-requests) were carefully created and cleaned up — except the `activity-events` rows those same test flows logged along the way. I only noticed because the Activity feed I'd just built rendered them: "Test MultiSeat", "Test OrganiserCancel", "Test RebookNow2", etc. — real orphaned rows sitting in the staging database since Stage 1. This is exactly the kind of thing that's invisible until there's a screen that surfaces it, and a reminder that "did I clean up" needs to mean *every* collection a test touched, not just the obvious ones. Cleaned up 8 stray rows across every earlier stage's testing in this pass; final check confirmed zero remain.

### A real bug caught, then confirmed to actually be a test-harness timing issue, not a product bug
First live run of "mark all read" showed the unread badge still at 8 after the click, one second later — looked like a broken feature. Checked the database directly: every one of those 8 events *did* have the test admin in `readBy` — the write had actually succeeded. The real cause: `markAllActivityEventsRead` does sequential `findByID` + `update` pairs per event (required — MongoDB Atlas M0 has no multi-document transactions, same constraint as everywhere else in this codebase), so marking 8 events read means 16 sequential round trips to the real remote staging cluster — genuinely takes a few seconds, not one. Re-ran with a wait tied to the actual button-disappearing state instead of a fixed guess, and it passed cleanly. Real product takeaway: the button gave zero feedback while this was happening, which would read as "broken" to a founder clicking it on a bad connection. Fixed by showing "Markiere …" and dimming the button while the transition is pending, instead of leaving it looking inert.

### Verified
- `npx tsc --noEmit` — zero errors. `generate:importmap` correctly a no-op (no new top-level-registered admin components — `RefundsView`/`ActivityView` are regular components imported by the already-registered `RosterClient`).
- 40/41 unit tests passing (same pre-existing unrelated failure).
- Live, logged in as a real (throwaway) admin user through the actual `/admin/login` flow — not a mocked session — then navigated to the real `/admin/workshop-roster` view: confirmed the Refunds queue showed exactly the one `requested` row and correctly excluded the `completed` one (and vice versa on the Completed tab), confirmed the 3-days-pending row rendered correctly, confirmed the sidebar badge counts matched the underlying data (1 for Refunds, 8 for Activity — genuinely accurate given the leftover test data described above, which is itself a small proof the unread-counting logic works), and confirmed mark-all-read actually clears the badge once the writes finish. Zero console errors throughout. Deleted the throwaway admin user and all test data afterward, confirmed gone.

---

## Final consolidated summary

All 6 stages are built, verified, and hold together as one coherent system, running on `feature/refund-rebooking-system` (based on `staging`). Nothing has been pushed or merged — this stays local until reviewed. Final state: `npx tsc --noEmit` zero errors across the whole change; 40/41 unit tests passing, the 1 failure pre-existing and unrelated (a stale test for `confirmWorkshopBookings.ts`'s email params that was already broken before this work started — never touched that file).

### What's built

- **Policy engine** (`src/lib/policyEngine.ts`) — the single source of truth for what a seat can do, re-run fresh server-side on every read and every write, never trusted from the client or from an earlier step in a request. 31 unit tests cover every row of the plan's policy table, every boundary hour, the one-time-rebooking gate, the organiser-cancellation branch, both config toggles, and DST correctness.
- **Atomic capacity control** (`src/lib/atomicSpots.ts`) — replaced a real, pre-existing overselling race condition (read-then-write on `availableSpots`) with a genuine atomic `$inc`-with-guard, verified against real concurrent requests on the actual staging MongoDB, not just reasoned about.
- **Full self-service flow**, single- and multi-seat: `/manage-booking/[token]`, reason picker → data-driven options screen → rebook-now (with real date picker and atomic capacity reservation) / rebook-later (real voucher issuance) / request-refund (real refund-requests row) / cancel-no-refund, plus the two screens the Figma prototype was missing (14–30 day tier, <14-day "nothing available" state). Multi-seat adds a seat picker, an irreversibility acknowledgment, and a mixed-outcome summary — verified at the data layer to genuinely resolve each seat independently.
- **Refund reconciliation** — the existing `charge.refunded` Stripe webhook is now seat-scoped, not whole-booking-scoped, with an explicit fix for webhook replay safety (Stripe's at-least-once delivery could otherwise have caused a redelivered event to incorrectly refund an entire order).
- **Organiser cancellation** — a single admin field toggle (`cancellationStatus`, same UX as the existing `isPublished` field) fans out to every affected booking: auto-unpublishes the appointment, notifies every affected customer with a magic link, and reuses ~95% of the self-service UI, extended to allow "any available workshop" as a replacement rather than only the same one.
- **Brevo wiring** — every template from the plan registered (as placeholders — see below) and wired to its trigger; the confirmed multi-recipient admin-alert decision (`kontakt@fermentfreude.at` + `connectwithrafaela@gmail.com`) is now actually implemented everywhere, including retrofitting the two pre-existing call sites that would otherwise have silently broken the day someone set the env var to a comma-separated value.
- **Roster dashboard** — a Refunds queue (with Stripe deep-links and PaymentIntent copy buttons) and an Activity feed with a per-admin unread badge, both logged into and driven through the real `/admin` panel, not simulated.

### What's confirmed working (via real, live testing — not just code review)

Every stage that touched customer- or admin-facing behavior was driven through an actual headless browser against actual data in the real staging MongoDB: concurrent overselling prevention, all three policy tiers, both missing Figma screens, multi-seat independence (proven at the database level, not just on screen), rebook-now's full capacity/booking/magic-link chain, refund-request creation, voucher issuance, the organiser-cancellation admin trigger through to a real customer picking a cross-workshop replacement, and the Roster panels through a real admin login. Every test fixture created along the way was deleted and its removal verified — including, after Stage 6 caught it, activity-events left behind by earlier stages that weren't part of the original cleanup scope.

### What's rough, deferred, or worth knowing about before this goes further

- **5 Brevo template IDs are placeholders** (`900001`–`900005` in `src/lib/brevo.ts`). The code is fully wired and fails gracefully if they're wrong (logged, not thrown — bookings and refunds still succeed either way), but no customer will actually receive these emails until someone creates the real templates in Brevo's dashboard and swaps in the real IDs. Worth a real send test once that's done — during Stage 4 testing, Brevo's API returned success for a placeholder ID rather than rejecting it, so a wrong ID may not fail as loudly as expected.
- **`ADMIN_NOTIFICATION_EMAIL` isn't actually set to the confirmed multi-address value anywhere yet** — not in this repo's local `.env` files, and I have no visibility into Vercel's env vars. The code is ready; someone needs to set `ADMIN_NOTIFICATION_EMAIL=kontakt@fermentfreude.at,connectwithrafaela@gmail.com` in the relevant environments before Rafaela actually starts receiving these alerts.
- **`REBOOK_NOW` has no crash-recovery compensation.** If a customer's connection drops between the new booking being created and the response returning, the new booking/magic-link/seat-update sequence has no wrapping transaction (matches this codebase's existing MongoDB Atlas M0 posture everywhere else, but money is more directly at stake here). A saga-style compensation mechanism would close this; explicitly out of scope for this pass.
- **Refund disambiguation degrades, not fails, when Stripe's refund amount can't be read** — falls back to reconciling every pending refund-request for a PaymentIntent rather than the one specific refund. Narrow (only matters with multiple simultaneously-pending refunds on one PaymentIntent), bounded, and logged — not hardened further.
- **One deliberate deviation from the plan's literal pseudocode**: the organiser-cancellation refund action is its own distinct `SeatAction` (`REQUEST_ORGANISER_CANCELLATION_REFUND`) rather than reusing `REQUEST_FULL_REFUND` as §5 literally shows. Same customer-facing button and behavior; the split just removes ambiguity for which `policyResult` enum value gets stamped downstream. Flagged in Stage 0, held throughout.

### What I'd want a second pair of eyes on before staging

1. **The exact copy in every customer-facing screen and email** — all German text was written by me, following the tone of existing screens (e.g. `/account/cancellations`), but nobody with actual customer-facing/brand judgment has reviewed it.
2. **The `REBOOK_NOW` crash-recovery gap above** — worth a deliberate decision (accept the risk, or invest in compensation) rather than leaving it as an implicit default.
3. **A real Stripe test-mode dry run of the refund webhook**, per the plan's own §13 testing note — this was verified thoroughly with mocks and reasoning, but never against an actual Stripe test-mode `charge.refunded` event end to end.
4. **The 5 Brevo template placeholder IDs and the `ADMIN_NOTIFICATION_EMAIL` env var** — both need a human to actually go create/configure them before this is customer-ready, regardless of code review outcome.

---

## Update after Stages 7–10: where the 4 items above actually landed

All four items above are now either closed or reduced to a single well-scoped manual step:

1. **Copy review** — unchanged, still open. Nobody with brand/customer-facing judgment has reviewed the German text in the 5 new email templates or the manage-booking screens.
2. **`REBOOK_NOW` crash-recovery gap** — **closed in Stage 9.** Interrupted requests (new booking created, original seat never marked resolved) now resume idempotently instead of creating a duplicate booking — verified live against a genuinely reproduced crash state, including the idempotent-retry and normal-golden-path regression cases.
3. **Real Stripe test-mode dry run** — **done in Stage 10**, and it earned its keep: it surfaced a real, previously-unknown bug (`charge.refunds` is `null` on every real webhook payload, not just sometimes — Stage 3's disambiguation never actually disambiguated), which is now fixed (`stripe.refunds.list()` fetched live instead of trusted from the payload) and re-verified against a second real refund + a genuine replayed duplicate delivery.
4. **Brevo placeholders + `ADMIN_NOTIFICATION_EMAIL`** — **both done in Stage 7 and Stage 8.** All 5 templates created for real via Brevo's API with real assigned IDs (95–99), each test-sent and confirmed delivered/opened. `ADMIN_NOTIFICATION_EMAIL` set locally and confirmed delivering to both real addresses via the exact production code path.

**Two genuinely new, small items surfaced during 7–10, both requiring a human:**

- **Vercel env vars for `ADMIN_NOTIFICATION_EMAIL`** (staging + production) — no Vercel CLI is installed in this environment; exact manual steps are in Stage 8 above.
- **`package.json`'s `stripe-webhooks` script has the wrong forward-to URL** (`/api/stripe/webhooks` → should be `/api/payments/stripe/webhooks`) — discovered in Stage 10, deliberately left unfixed as an out-of-scope one-liner rather than bundled invisibly into this branch. Worth a 1-line fix whenever convenient: change the URL in the `stripe-webhooks` script.

Also worth carrying forward: **`BREVO_TEMPLATES.ADMIN_WORKSHOP_NOTIFICATION: 94`** (pre-existing, from an already-merged sprint, unrelated to this branch) is dead code with zero call sites and no real Brevo template behind it — discovered as a side effect of Stage 7's template creation (see that stage for detail). Not touched, since fixing an unrelated already-merged feature is out of scope here — flagging so it isn't mistaken for something this branch broke.

---

## Correction, before the next stages: a process mistake in how the 4 items above were framed

The original framing of items 1 and 2 above was wrong in a way worth recording so it isn't repeated. I treated "create the Brevo templates" and "set `ADMIN_NOTIFICATION_EMAIL`" as things only Rafaela could do — asking her to go do them manually — when actually:

- **Brevo**: this project has a standing `BREVO_API_KEY` connection already, and Brevo has a real Templates API. Creating the 5 templates is something Claude can and should do directly via that API, not a dashboard task to hand off.
- **Local `ADMIN_NOTIFICATION_EMAIL`**: `.env` is gitignored and local-only. Claude misread CLAUDE.md's "never include `.env` values in any file/commit/comment" rule (which is about not leaking secret *values* elsewhere) as "never touch `.env` at all," and left a safe, local, non-secret config change undone that it could have just made.
- **Staging/production `ADMIN_NOTIFICATION_EMAIL`** (Vercel) is the one genuinely-human-only part of item 2 — Claude has no Vercel dashboard/CLI access in this environment.

**Fixed at the source**, not just noted here: `CLAUDE.md` now has an explicit "Setting or changing an env var locally" vs. "...on staging/production" split (Environment Variables section) and a clarified Security section stating local `.env` edits are always fine. Future sessions — this one included, starting at Stage 8 below — should not re-make this mistake.

## Stage 7 — Brevo templates: real creation + main/staging parity audit

### Built
- Found the repo's existing Brevo tooling instead of building parallel infrastructure: `public/email-templates/v2/` is the actual source-of-truth HTML for every live V2 template (65–73, 93), and `scripts/push-brevo-templates.mjs` already has a `--create <slug>` mode purpose-built for exactly this job (POST to Brevo's Templates API, prints the assigned ID). Read `docs/BREVO_TEMPLATES_SETUP.md` first per the plan — confirmed it documents the *old* pre-redesign template IDs (1–7) and is stale; the v2 README and `brevo.ts` itself are the actual current source of truth.
- **Parity audit**: diffed `BREVO_TEMPLATES` against `origin/main` and `origin/staging` — every ID both branches already share (the 20 pre-existing templates through `VOUCHER_PURCHASED: 73`) matches exactly, byte-for-byte, no drift. `WORKSHOP_GIFT_NOTIFICATION` (93) and `ADMIN_WORKSHOP_NOTIFICATION` (94) exist only on this branch's base history (from an already-merged gift/voucher sprint that hasn't reached `main` yet) — expected in-flight divergence between active feature branches, not a bug.
- Wrote 5 new German HTML templates matching the existing V2 design system exactly (same header/footer chrome, fonts, color tokens, R2-hosted icons) in `public/email-templates/v2/`: `customer-rebooked.html`, `rebooking-voucher-issued.html`, `cancelled-no-refund.html`, `refund-initiated.html`, `organiser-cancelled.html` — each built to the exact param names the calling code already sends (verified by reading `rebook-now/route.ts`, `rebook-later/route.ts`, `cancel-no-refund/route.ts`, `request-refund/route.ts`, `handleOrganiserCancellation.ts` directly, not guessed).
- Created all 5 for real via `node --env-file=.env scripts/push-brevo-templates.mjs --create <slug> --name "..." --subject "..."`, using `BREVO_API_KEY`. Replaced the `900001`–`900005` placeholders in `src/lib/brevo.ts` with the real assigned IDs: `CUSTOMER_REBOOKED: 95`, `VOUCHER_CODE_ISSUED: 96`, `CUSTOMER_CANCELLED_NO_REFUND: 97`, `REFUND_INITIATED: 98`, `ORGANISER_CANCELLED: 99`.
- Registered the 5 new templates in `push-brevo-templates.mjs`'s `V2_TEMPLATES` array and `MOCK` data (so future `--dry`/`--test`/plain pushes cover them like every other template), and documented them in `public/email-templates/v2/README.md`'s ID map.

### A real bug found — an ID collision I caused, then fixed
The first `--create` call for `customer-rebooked` got assigned ID **94** by Brevo — which `BREVO_TEMPLATES.ADMIN_WORKSHOP_NOTIFICATION` already claims. Investigated before creating anything else: `grep`'d the whole codebase and found **zero call sites** for `ADMIN_WORKSHOP_NOTIFICATION` anywhere — and the fact that a `POST` (create, not update) landed on ID 94 at all proves conclusively no template with that ID existed in Brevo before my call (Brevo assigns the next free ID sequentially; the max existing ID was 93). So `ADMIN_WORKSHOP_NOTIFICATION: 94` was already a dangling reference — dead code pointing at a template that was never actually created in Brevo's dashboard, unrelated to this branch's refund/rebooking work. Not something to silently paper over: had I left my new template on ID 94, wiring up `ADMIN_WORKSHOP_NOTIFICATION` in the future would have silently sent "your booking was rebooked" content to whatever it was meant to notify. Fixed by deactivating (`PUT isActive:false`, required first — Brevo 405s on deleting an active template) and deleting the wrongly-numbered template, then re-running `--create` so Brevo assigned a genuinely fresh ID (95). The dangling `ADMIN_WORKSHOP_NOTIFICATION: 94` constant itself is left alone — pre-existing, unused, out of Stage 7's scope — but flagged here and in the v2 README so it isn't rediscovered as a mystery later.

### Verified
- `npx tsc --noEmit` — zero errors after the `brevo.ts` ID swap.
- Grepped the repo for the old `900001`–`900005` placeholder numbers — zero references left in code (only in this log's own historical narrative above, which stays as-written since it's describing what was true at the time).
- **Sent a real test email per template** (`--test 95` through `--test 99`, to `kontakt@fermentfreude.at`, the same pattern the script already uses for every other template) — not just trusting the API call succeeding, since Stage 4 already found once that Brevo can return success for a bad template ID without rejecting it. Confirmed via Brevo's `/v3/smtp/statistics/events` endpoint that all 5 went through the full `requests` → `delivered` → `opened` lifecycle, and that the rendered subject lines show real Liquid interpolation from the mock params (e.g. "Deine Umbuchung ist bestätigt — Tempeh Basics", "Dein Code für später — RBK-TEST123", "Wichtig: Vom Feld ins Glas wurde abgesagt") — proof the templates actually render with the real param names the production code sends, not just that Brevo accepted the HTTP request.

### Deliberately not built
Didn't touch the pre-existing `ADMIN_WORKSHOP_NOTIFICATION: 94` dead code — reassigning or wiring it up is a separate, unrelated feature (it belongs to the already-merged gift/voucher sprint, not this refund/rebooking branch) and out of scope for Stage 7's specific task list.

---

## Next Steps — planned Stage 8–10 (not started yet)

This section is the plan for the next session, written so the whole arc — Stage 0 through whatever's done next — reads clearly in one pass. Each stage below gets its own "Built / Verified / Bugs found" write-up appended here, in the same format as Stages 0–7, once it's actually done.

## Stage 8 — Admin notification email: local + Vercel

### Built
- Set `ADMIN_NOTIFICATION_EMAIL=kontakt@fermentfreude.at,connectwithrafaela@gmail.com` directly in local `.env` — no asking first, per the corrected CLAUDE.md guidance from the process-mistake note above.
- Checked for an authenticated `vercel` CLI in this environment: `which vercel` found nothing — the CLI isn't installed at all, let alone authenticated. (There is a `VERCEL_ACCESS_TOKEN` in `.env`, but it's scoped for the `/admin/analytics` read-only dashboard per its own comment, not a substitute for "a confirmed authenticated CLI" — didn't use it to write env vars, per this session's explicit instruction to never do that on a vague basis.)

### Real send test (not just re-reading the code)
Wrote a throwaway script (`tsx --env-file=.env`, deleted after) that imports the actual `getAdminRecipients()` from `src/lib/adminNotification.ts` and the actual `sendTransactionalEmail()` from `src/lib/brevo.ts` — the exact two functions `sendOrderConfirmationEmail.ts` and `sendVoucherPurchaseEmail.ts` call — and invoked them together exactly as those hooks do. Confirmed via Brevo's `/v3/smtp/statistics/events` API (filtered per recipient, since the default unfiltered feed doesn't interleave multiple recipients of the same send chronologically) that the same `messageId` shows `requests` → `delivered` → `opened` for **both** `kontakt@fermentfreude.at` and `connectwithrafaela@gmail.com` — real proof the retrofit from Stage 5 (passing an array from `getAdminRecipients()` instead of a single hardcoded email) now actually delivers to both addresses with the real, comma-separated env value in place. This is exactly the failure mode Stage 5 flagged as a live risk (a malformed single string silently reaching zero recipients) — now closed and verified, not just asserted.

### Still open — needs Rafaela (no CLI/dashboard access from here)
Set the same value on **staging** and **production** Vercel env vars:

1. Go to vercel.com → the FermentFreude project → **Settings → Environment Variables**
2. Add a new variable: Name = `ADMIN_NOTIFICATION_EMAIL`, Value = `kontakt@fermentfreude.at,connectwithrafaela@gmail.com`
3. Select **both** Production and Preview environments (staging deploys via Preview) — CLAUDE.md's own table notes a var set only on Production won't exist on staging and vice versa
4. Save — this is not a `NEXT_PUBLIC_*` var, so it takes effect on the next normal deploy, no full no-cache redeploy needed
5. Once merged and deployed, a real order or voucher purchase (or a repeat of this stage's send test against the deployed environment) will confirm it end-to-end there too

### Verified
- `npx tsc --noEmit` — zero errors (no code changed this stage, `.env` only).
- Real send test above — both real inboxes confirmed via Brevo delivery events, not assumed.

---

## Stage 9 — REBOOK_NOW crash recovery

### Built
- Mapped the exact failure window by reading `rebook-now/route.ts` line by line: (a) atomically reserve 1 spot on the target appointment, (b) `payload.create` the new `workshop-bookings` doc, (c) `payload.create` its `booking-magic-links` row (no try/catch — an uncaught throw here is the crash trigger), (d) `updateSeat` the original seat to `rebooked`. A dropped connection anywhere between (b) and (d) leaves the reservation and the new booking permanently in place while the original seat still reads `active` — a naive retry would sail past the eligibility check (which reads the still-`active` seat) and create a **second** new booking, doubling the customer's spot.
- Added `WorkshopBookings.seats[].rebookedFromSeatIndex` (paired with the existing `rebookedFromBookingId`) — needed because `rebookedFromBookingId` alone can't disambiguate *which* seat of a multi-seat original booking a given new booking traces back to; without the seat index, a legitimately-already-rebooked seat 0 could false-positive-match a lookup for seat 1's crash recovery.
- Added a crash-recovery check at the very top of the handler, right after loading and before the eligibility gate: query `workshop-bookings` for any doc whose seat has `rebookedFromBookingId === this booking` AND `rebookedFromSeatIndex === this seatIndex`. If one exists, this is an orphan from an interrupted prior request — **resume instead of reprocessing**:
  - Reuse the orphan's existing `booking-magic-links` row if one exists, or mint one now (covers a crash before step (c) specifically).
  - If the original seat is still `active` (the true crash case — step (d) never ran), finish it now: mark the seat `rebooked` pointing at the orphan, log the activity event (tagged "nach unterbrochener Anfrage fortgesetzt" so it's distinguishable from a normal rebook in the admin feed), and send the `CUSTOMER_REBOOKED` confirmation email — using the orphan's own stored workshop/date/time, not re-deriving from a freshly-fetched appointment.
  - If the seat is already `rebooked` pointing at this same orphan (the narrower case — everything committed, only the HTTP response itself was lost), skip all of the above and just return the existing booking's info — idempotent, no duplicate email or activity log entry.
  - Either way, the response includes `resumed: true` so the client can distinguish "this just got resumed" from a fresh booking if it ever wants to.
- Crucially, the resume path **never touches capacity or creates a second booking** — those already happened before the crash; it only finishes the deferred bookkeeping.

### Verified
- `pnpm generate:types` / `generate:importmap` (no-op, no new admin component) / `npx tsc --noEmit` — zero errors.
- 41/42 unit tests passing (same one pre-existing, unrelated failure from before Stage 0).
- **Live, against the real running dev server and real staging MongoDB — a genuinely reproduced crash state, not a mock**: seeded a real confirmed booking + magic link, then ran a script that replicated exactly steps (a)+(b) the route performs (atomic spot reservation + new booking creation with `rebookedFromBookingId`/`rebookedFromSeatIndex` set) and deliberately stopped there — reproducing the exact DB state a dropped connection between (b) and (d) would leave, without needing to literally sever a live HTTP connection mid-request.
  - Called the real `POST /api/manage-booking/[token]/rebook-now` endpoint against that state: got `resumed: true` referencing the **existing** orphan booking, not a new one.
  - Verified at the data layer: target appointment's `availableSpots` unchanged (no second reservation), exactly one `workshop-bookings` doc traces back to the original seat, the original seat now correctly shows `seatStatus: 'rebooked'` with the right `rebookedToBookingId`, exactly one magic link exists for the orphan (freshly minted, proving the "crash before magic-link creation" sub-case is also covered), and the activity feed shows the "fortgesetzt" (resumed) entry.
  - **Retried the identical request a second time** (simulating the narrower case — full success already happened, only the response was lost) — confirmed idempotent: same `manageUrl` returned, no second magic link, no duplicate activity event.
  - **Regression check**: seeded a second, untouched booking and drove a completely normal `REBOOK_NOW` through the same endpoint — succeeded with no `resumed` flag, confirming the new orphan-detection query doesn't interfere with (or slow down) the golden path.
  - All test fixtures deleted afterward (4 bookings, 4 magic links, 2 activity events) and the target appointment's capacity confirmed restored to its exact pre-test value (11, not just "back to max 12" — proving no accidental over-restoration either).

### Deliberately not built
This closes the specific sequential-crash gap (one request, interrupted, then retried) — it does not add distributed-transaction guarantees. Two genuinely *concurrent* retries arriving within the same narrow window before either has committed its new booking could theoretically both pass the orphan check and each create their own booking; this is a much narrower race than the original gap (concurrent, not sequential) and consistent with the rest of this MongoDB Atlas M0 codebase's existing posture (no cross-document transactions anywhere). Not hardening further this pass.

---

## Stage 10 — Real Stripe test-mode webhook dry run

### Built
- Confirmed `.env`'s Stripe keys are genuinely test-mode: `sk_test_.../pk_test_...`, verified against Stripe's own `/v1/balance` endpoint (`livemode: false`) rather than trusting the key prefix alone.
- **Found the local Stripe CLI session was authenticated to a completely different, unrelated Stripe account** ("theSoftSpace", key prefix `sk_test_51RbpZQH7...`) than the one in this project's `.env` (`sk_test_51TMt7GJu...`). Using `stripe listen`/`stripe trigger` as-is would have forwarded events for the wrong account entirely. Did not touch the existing CLI login/config — instead used the CLI's documented `--api-key` global flag on every invocation to scope just this session's commands to FermentFreude's own key, and used direct `curl` calls (Basic auth with the real `sk_test_` key) for creating/refunding PaymentIntents so there was never any ambiguity about which account was touched.
- Discovered `pnpm stripe-webhooks`'s hardcoded forward-to URL (`localhost:3000/api/stripe/webhooks`) is wrong — confirmed by reading the actual `@payloadcms/plugin-ecommerce` Stripe adapter source (`endpoints/webhooks.js` returns `path: '/webhooks'`, mounted under `/payments/${paymentMethod.name}` per the plugin's core `index.js`), giving a real path of **`/api/payments/stripe/webhooks`**. `package.json`'s script is stale and 404s — flagging it as a real, fixable doc/config bug but leaving the actual fix to a deliberate decision below rather than changing a shared `package.json` script as a side effect of a verification pass.
- Seeded a real confirmed `workshop-bookings` doc + `refund-requests` row (status `requested`) tied to a **real, confirmed, test-mode Stripe PaymentIntent** (created via direct API call, test card `pm_card_visa`, €99.00) — not a fixture that only exists in our DB.
- Ran `stripe listen --api-key <ours> --events charge.refunded --forward-to localhost:3000/api/payments/stripe/webhooks`, then issued a **real refund** via `POST /v1/refunds` on that PaymentIntent — a genuine Stripe test-mode event, forwarded live by the CLI, hitting the real running webhook route.

### Two real bugs found by the dry run itself (not caught by Stage 3's mocked tests)
1. **`charge.refunds` is `null` on every real `charge.refunded` webhook payload — not "sometimes," always.** Stage 3's amount-based disambiguation (`charge.refunds?.data ?? []`) was written on the assumption that Stripe sometimes omits this and called it "a narrow edge case." Fetching the actual raw event via `GET /v1/events/{id}` and inspecting it directly proved `refunds` is `null` on the embedded Charge object unconditionally — Stripe simply doesn't include it on webhook payloads without an explicit expand, which isn't available on a static event payload. Concretely this meant: (a) `stripeRefundId` was **never** populated on any real refund reconciliation (confirmed live — came back as `''` on the very first real test), a traceability gap in the admin Refunds panel; and (b) the "fall back to reconciling every pending row" path — meant as a rare degradation — was actually **the only path that ever executes**, meaning a PaymentIntent with two genuinely-independent pending refund-requests (two different seats, refunded separately) would have had **both** incorrectly marked completed and **both** seats' capacity released the moment either one was actually refunded in Stripe. Not hypothetical — reproduced with a real webhook on the first attempt. **Fixed**: `handleChargeRefunded` now calls `stripe.refunds.list({ payment_intent: paymentIntentId })` — the `stripe` client was already being passed into the handler's signature but never used — to fetch the real refunds list instead of trusting the always-empty embedded field. Re-verified live after the fix: `stripeRefundId` correctly populated with the real `re_...` ID.
2. **`pnpm stripe-webhooks`'s forward-to URL is wrong** (see above) — a pure config/doc bug, not part of the refund-rebooking feature, but it's the reason the very first live delivery attempt in this dry run 404'd. Documented here rather than silently worked around, since anyone running the documented command for local Stripe testing hits the same 404. **Left the `package.json` script unchanged** — fixing it is a one-line, unrelated change outside this feature's diff; flagged explicitly below as a deliberate decision rather than bundled into this branch invisibly.

### Verified
- `npx tsc --noEmit` — zero errors after the `stripe.refunds.list` fix.
- Updated the one Stage 3 unit test that asserted on the old (unrealistic) `charge.refunds.data` shape to mock `stripe.refunds.list()` instead, matching what real Stripe actually sends. 41/42 unit tests passing (same one pre-existing, unrelated failure).
- **Live, end-to-end, twice** (once before the fix — to discover the bug — and once after, to confirm the fix): real confirmed test-mode PaymentIntent → real refund via Stripe's API → real webhook delivery via `stripe listen` → verified at the data layer: `refund-requests.status` → `completed`, `stripeRefundId` correctly populated with the real Stripe refund ID, the specific seat flipped to `seatStatus: 'refunded'`, and the appointment's `availableSpots` restored by exactly 1 (captured before/after the reservation, not just before/after the whole test, so the assertion is exact).
- **Replay-safety (Stage 3's fix) confirmed with a genuine duplicate delivery, not a second synthetic event**: re-fetched the exact same real event via `GET /v1/events/{id}`, re-signed it with the real webhook secret (`stripe.webhooks.generateTestHeaderString`), and POSTed the identical payload to the same endpoint a second time. Server log showed the expected `All refund-requests for PI ... already reconciled — duplicate webhook delivery, no-op` line, and the data layer confirmed no double-processing: capacity unchanged, no second activity event.
- All test fixtures (2 bookings, 2 refund-requests, 2 activity events, 2 real Stripe test-mode PaymentIntents/refunds — left alone in Stripe's test-mode ledger, harmless) cleaned up from the DB; appointment capacity confirmed restored to its exact original value.

### Deliberately not built
Did not fix `package.json`'s `stripe-webhooks` script's wrong URL — a one-line, unrelated fix outside this branch's actual feature scope. Flagging it explicitly as a known bug for a separate small fix: `stripe listen --forward-to localhost:3000/api/stripe/webhooks` should read `localhost:3000/api/payments/stripe/webhooks`.

---
