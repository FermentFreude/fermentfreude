# Seats, capacity and bookings

How workshop seats are counted, who may change what, and how to check that the numbers are right.
Written 2026-11-14 (dashboard v2). Keep this file up to date when the rules change.

## Who is the source of truth

| Thing | Where it is managed |
|---|---|
| Workshop dates, times, location, **capacity** | CMS (`/admin` → Workshop-Termine / Workshops) |
| Bookings: add a person, edit, move, free a seat, remove, payment, invoice | **Roster dashboard** (`/admin/workshop-roster`) |
| Bookings in the CMS | **Read-only.** `update` and `delete` are blocked on `workshop-bookings` (and `create` always was). |

Why: the website reads a counter on each appointment (`availableSpots`); the dashboard counts bookings. Only the dashboard actions and the website keep the two in step. Editing or deleting a booking in the CMS changes the bookings without moving the counter, so they drift apart.

## Capacity of a date

`capacityOf(appointment)` in `src/lib/appointmentCapacity.ts` is the only place the rule lives:

1. the date's own **"Kapazität für diesen Termin"** (`workshop-appointments.capacity`, optional), otherwise
2. the workshop's standard (`workshops.maxCapacityPerSlot`), otherwise
3. 12 (fallback only).

There is no hard limit of 12 any more. Pass an appointment loaded with `depth >= 1` (the workshop must be an object).
Never write `workshop.maxCapacityPerSlot ?? 12` again; use `capacityOf`.

### What happens when a capacity is changed (`src/hooks/appointmentCapacity.ts`)

- New date: free spots = the date's capacity (scripts can opt out with `context.keepAvailableSpots`).
- Date capacity changed: free spots move by the same amount. A capacity below the seats already booked is refused with a clear message.
- Workshop standard changed: every upcoming date **without its own capacity** follows (atomic, never below 0). Lowering it below an upcoming date's booked seats is refused.
- Dashboard: each upcoming date has a "Kapazität" button (`setAppointmentCapacity` in `components/admin/roster/actions.ts`), same rules as the CMS.
- The public pages cache free seats (tag `workshop-appointments`, 2 minutes). Dashboard actions call `refreshPublicAvailability()`; the appointment collection refreshes it on save.

## The counter and who moves it

`availableSpots` is changed only through `reserveSpotsAtomic` / `releaseSpotsAtomic` (`src/lib/atomicSpots.ts`, single-document atomic Mongo ops; release is capped at the capacity you pass in). **Do not import `next/cache` into that file** (it is bundled in places that cannot use it; this broke the build once). Refresh the cache in the callers.

| Action | Seats |
|---|---|
| Customer adds a workshop to the basket | hold = a `pending` booking, seats reserved (`lib/workshopHolds.ts`) |
| Hold expires / basket item removed | `cancelPendingBooking` flips pending → cancelled once, then gives the seats back |
| Paid | booking `confirmed`, seats stay taken |
| Dashboard: Person hinzufügen | reserve, then create booking |
| Dashboard: Entfernen (booking without order) | release the seats that still hold a place, delete the booking |
| Dashboard: Verschieben (whole booking) | reserve new, update booking, release old (`moveWorkshopBooking`) |
| Dashboard: Verschieben (some people) | new booking for them linked to the old one, old seats become `rebooked` (`lib/moveSeats.ts`) |
| Dashboard: Platz dazubuchen / Platz streichen (booking without order) | reserve / release 1 (`lib/bookingEdit.ts`) |
| Dashboard: Platz freigeben (any booking, also with invoice) | seats `cancelled_no_refund`, places released, order and invoice stay (`releaseSeats`) |
| Customer self-service (manage-booking link) | per seat: rebook / voucher / cancel, same mechanism |

A seat holds a place only in the statuses of `seatHoldsPlace` (`lib/seatCapacity.ts`).

## Manual bookings: source and payment

`workshop-bookings.manualInfo` = `channel` (email / phone / in person / Wix / other), `paymentStatus` (paid / open), `paymentMethod`, `voucherCode`, `paymentNote`, `paidAt`. Set in "Person hinzufügen" and in the "Zahlung" dialog (`components/admin/roster/ManualPayment.tsx`, logic in `lib/manualBooking.ts`).

- Invoice for a manual seat = an `orders` doc with no items, `paymentMethod: 'manual'` (MAN series), linked by `booking.orderId`; the receipt reads the booking. Optional, can be done later. Only when paid.
- Confirmation email = the guest booking template; optional, can be sent later. Outside production the email guard blocks real recipients.
- **Wix imports** are paid in Wix: `manualInfo` is set automatically (`import-wix-bookings.ts`); the dashboard offers no invoice for them.
- Every change writes a history entry (who, old → new).

## Checkout holds: how seats are given back (fixed 2026-11-14)

A hold is a `pending` booking. When it is cancelled (expired, removed from the basket) its seats go back **exactly once, and a half-finished release is completed later**:

- `releaseSeatsOnce` (`src/lib/workshopHolds.ts`) gives seats back keyed by the hold's id. The appointment remembers the keys (`releasedBookingIds`), and check + counter change + remembering are ONE atomic update, so a second call (race, retry) changes nothing.
- `cancelPendingBooking` flips the booking to cancelled **and** sets `releasePending: true` in one step, then releases, then clears the flag. If the function is stopped in between, `sweepPendingReleases` finishes it.
- The cleanup used to run as `void cleanupExpiredHolds(...)` inside a page render, which Vercel can stop half-way: that lost 2 seats on one date. It now also runs as a real job: `/api/cron/release-holds` every 5 minutes (`vercel.json`, needs `CRON_SECRET`), awaited.
- When a hold is cancelled, the basket's **open Stripe payments are cancelled too** (`cancelOpenPaymentsForCart`), so an old checkout can never be paid after its date was released. Starting a new payment for a stale basket was already refused (`requireWorkshopSeatsHeld`).
- Dashboard: under the seat warning on a date, "Zähler angleichen" (`alignCounterCore`, `src/lib/seatCounter.ts`) sets the counter to the real number. Safeguards: upcoming dates only, compare-and-set on the number that was shown, refused while a checkout is in progress, written to the date's internal notes.

Never give seats back with a bare `releaseSpotsAtomic` for a hold; use `releaseSeatsOnce`.

## Checking that the numbers are right

Real free seats = capacity − seats of `confirmed` bookings that still hold a place − guests of `pending` holds. It must equal `availableSpots`.
The dashboard shows a red "!" on the date card and a note on the date when they differ (`components/admin/roster/seatCheck.ts`, upcoming dates only).

To audit by script: loop upcoming `workshop-appointments`, compute the formula above with `capacityOf` and `seatsHoldingPlace`, compare. Read-only first. Fixing a counter is a single guarded write (`updateOne({_id, availableSpots: <seen value>}, {$set: {availableSpots: <real>}})`).
**Never correct production counters without Rafaela's explicit go**, and check with the founders first (see below).

### Known drift on production (found 2026-11-14, not fixed)

- 10 Jan 2027 Lakto: 5 seats really booked (3 online bookings), website showed 1 free, real free was 3. Two seats were not given back by a cancelled 2-seat checkout hold on 11 Nov: the expiry cleanup ran un-awaited inside a page render (`void cleanupExpiredHolds`) and was stopped after "cancelled" but before "seats given back". Capacity is unchanged (8), so it is a leak, not a capacity change.
- 21 Jan 2027 Kombucha: 3 seats booked, website shows 6 free, real free is 5 (one seat too many: oversell risk). Cause unknown; the last write was a manual booking on 13 Nov (the counter did not drop with it). Ask the founders whether anyone edited "available spots" by hand in the CMS.

## Staging copy of production (how, and the traps)

Memory note `project_staging_has_real_prod_data` has the history. The safe procedure used on 2026-11-14:

1. Back up staging first (`mongodump` of the whole staging DB to a folder on the Desktop).
2. Dump production **read-only** (`mongodump --uri=$PROD_DATABASE_URL`). Production credentials stay in the local `.env` as `PROD_DATABASE_URL`; never print them.
3. Put only the wanted collections (`.bson` + `.metadata.json`) in a fresh folder and run `mongorestore --uri=$DATABASE_URL --drop <folder>` after a `--dryRun`. Do **not** use `--nsInclude` with `--nsFrom/--nsTo`, and never point `mongorestore` at the whole dump: a misfiring filter restored all of production into staging (pages, media, users) and had to be rolled back from the backup.
4. Immediately anonymise: every email that is not a team address becomes `anon-…@example.invalid`, phone numbers blanked, names kept. Verify that no real email is left.
5. Wix-imported bookings get `manualInfo` (paid in Wix).
6. Delete the temporary dump (it contains real customer data).

Only booking/order data is copied; pages, products, media, workshops and the team's staging accounts are left alone.
