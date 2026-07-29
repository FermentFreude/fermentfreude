# Booking, Refund & Rebooking System — Summary for David & Marcel

This is the short version of the full technical build log — same story, without the code-level detail. The goal is to give you a real feel for what was built and how thoroughly it was tested, including the actual problems we found and fixed along the way. Nothing here is hidden or softened — if something broke during testing, it's in here.

**How we worked through this:** build one piece → review it → test it thoroughly against the way the current live booking system actually behaves → fix anything that comes up → move to the next piece. Every stage below went through that full cycle before we moved on.

---

## What customers will be able to do

- **Cancel or rebook a workshop themselves**, without emailing us, through a private link sent in their confirmation email. What they're offered depends on how close the workshop date is:
  - **30+ days out:** full refund, rebook to a new date, or get a code to rebook later.
  - **14–30 days out:** rebook to a new date, or get a code to rebook later (no refund).
  - **Under 14 days:** nothing available — matches our current cancellation policy exactly.
- **Multi-person bookings** work seat-by-seat — if you booked 3 spots and one person drops out, only that one seat is affected. The other two stay untouched.
- If **we** cancel a workshop date, every affected customer gets notified automatically with a link to either pick a replacement date (any workshop, not just the same one) or get refunded — no manual work on our side.

## What you and your team will see in the admin dashboard

- A **Refunds panel** — every refund that needs to be issued shows up here with the customer's info, the amount, and a direct link into Stripe, so whoever handles refunds always knows what's pending and what's already done.
- An **Activity feed** — a log of every cancellation, rebooking, and refund as it happens, so nothing gets missed.

## Real problems we found and fixed (not hypothetical — these actually happened during testing)

- **Overselling risk**: under the hood, two people booking the very last spot on a workshop at the exact same moment could, in the old logic, both succeed — overselling by one. This is now fixed at the database level and we tested it by firing multiple bookings at the exact same instant to confirm only one wins.
- **Silent booking loss for multi-item orders**: if a customer booked, say, two different Kombucha dates in the same order, the system was only confirming *one* of the two bookings — the second one would sit there forever, unconfirmed, with no email, no ticket, and no one aware it happened. This is one of the more serious things we caught. It's now fixed and verified with a real 5-appointment test order (deliberately including a repeated workshop type) — all five confirmed correctly.
- **Emails going to the wrong number of people**: we confirmed the decision to send admin alerts to both `kontakt@fermentfreude.at` and Rafaela's inbox actually works end-to-end, not just in theory.
- **A booking flow that could silently create a duplicate**: if a customer's connection dropped at exactly the wrong moment during a "rebook now" action, they could end up with two active bookings instead of one moved booking. Fixed and tested by deliberately interrupting the process mid-way to confirm it recovers correctly instead of duplicating.
- **Slow page loads**: workshop pages were doing unnecessary work on every single visit (some of it left over from earlier testing), making them meaningfully slower than they should be. Fixed — pages that took over 3 seconds now load in well under 1 second.
- **A handful of smaller, real bugs** (a booking calendar silently showing zero dates for one specific workshop, a rollback step that wasn't actually rolling back, a stale test that no longer matched how the checkout screen works today) — each one only surfaced because we tested the real thing running live, not just read the code.

## One real limitation worth knowing about

Because of how our payment provider stores order data behind the scenes, an order can reliably hold **up to around 5 separate workshop bookings** at once. That's been tested and works. If we ever want customers to book significantly more than that in a single checkout (e.g. a large group), that would need a bit more engineering — not urgent, just flagging it so it's a known fact rather than a surprise later.

## Where things stand

- All planned stages are built, and testing them this week has already turned up and fixed the real issues above.
- Next: pushing to staging (tomorrow or the day after) for a final full check, then to production once we're both happy with how it behaves there.
