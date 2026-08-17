# What's Ready to Go Live — Summary for David & Marcel

Everything below is built, merged onto our staging (test) site, and waiting for a final check there before it goes live on fermentfreude.at. Nothing here is live yet — this is what's queued up.

---

## Booking, cancellation & refunds

- **Customers can now cancel or rebook their own workshop booking**, without emailing us, through a private link in their confirmation email and on the confirmation page. What they're offered depends on how close the date is (30+ days: refund or rebook; 14–30 days: rebook only; under 14 days: nothing, matching our current policy).
- **Multi-person bookings are handled seat-by-seat** — if one person in a group of 3 drops out, only that seat is affected.
- **If we cancel a workshop date**, every affected customer is notified automatically with a link to pick a replacement date or get refunded — no manual work on our side.
- You and your team get a **Refunds panel** in the admin dashboard (who's owed what, with a direct link into Stripe) and an **Activity feed** logging every cancellation/rebooking/refund as it happens.

This piece went through the heaviest testing of everything here, including catching and fixing a real overselling risk and a bug where a second workshop booked in the same order could silently go unconfirmed. Full detail in `docs/REFUND_REBOOKING_SUMMARY_FOR_FOUNDERS.md` if you want it.

## Account & login security

- **Passwords now require a real minimum length.** Previously the system would technically accept a 3-character password — that's fixed.
- **Repeated failed login attempts now lock an account for 10 minutes**, protecting against someone trying to guess a password.
- **"Forgot your password" now actually works end-to-end** — the reset link in the email leads to a working reset form (it didn't fully before).
- **Orders now show up correctly for customers who checked out as a guest and later created an account.** Previously those orders could go "missing" from their account view even though the order itself was fine.

## Order confirmation & receipts

- The **order confirmation page is more informative** — it now shows a summary of the booking (date, time, location, number of guests), a photo of the workshop, a link to download the receipt, and suggestions for other workshops.
- **Fixed a bug sending the same confirmation email twice** for workshop bookings — customers will now get exactly one.

## Vouchers

- **Voucher purchases now correctly create an order record and notify us**, so nothing gets missed on our side.
- The **voucher success page now downloads the real, designed PDF** instead of a placeholder.

## Small but real fixes

- **Announcement bar** (the banner at the top of the site) now always shows exactly what's typed into the CMS — before, one specific old promo text was being silently swapped in behind the scenes even after being edited.
- **Workshop booking calendar** no longer mislabels other workshop types as "Lakto."
- **Site-wide content edits (header, footer, etc.) now reliably show up everywhere**, including after edits made outside the normal admin flow — previously some changes could get stuck and not update for a while.
- **The account dashboard's top menu no longer disappears when scrolling** — it used to slide away and only come back if you scrolled back up, which felt broken on a short page.
- Removed an internal developer toolbar that was visually overlapping the site header when a founder was logged in and browsing the live site — cosmetic, but distracting.
- Tightened up the spacing in the header so the logo and menu sit closer to the edges of the screen, matching the rest of the design.

## New pages

- **"Vom Feld ins Glas"** — a new special workshop page.
- **Presse (Press) page** — with a video hero and a section for press mentions/awards, plus a small banner promoting it on the homepage.

## Admin dashboard

- **You (David & Marcel) now have direct invoice access** from the admin panel and the Roster dashboard — no need to ask a developer to pull an invoice for you.
- The **manage-booking link now also appears directly on the confirmation page**, not just in the email.

---

## Where things stand

All of the above is merged onto staging. Next step is testing it there end-to-end (Rafaela is doing this now) — once everything checks out, this all goes to production in one push, following our usual staging → main process.
