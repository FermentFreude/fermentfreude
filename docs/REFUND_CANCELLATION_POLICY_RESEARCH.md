# FermentFreude — Refund & Cancellation Policy Research

Prepared by Rafaela Studio · 2026-07-10
Input for: refund/cancellation policy decision (David & Marcel) and Flow 11 (cancel/rebook) design work with Alaa.

**Not legal advice.** This is background research to inform a business decision, not a legal opinion. Austria/EU consumer law is summarized below from public sources — before publishing any policy, it should be reviewed by a lawyer or WKO (Wirtschaftskammer) advisory service, since exact wording and edge cases matter for enforceability.

---

## 1. Edelsauer (edelsauer.de) — what they actually do

Edelsauer is a Leipzig-based fermented foods producer (vegetable ferments, miso, relish, vinegar) — same category as FermentFreude, but Germany-based and shipping-only (no pickup). Their AGB (terms of service) is short and pragmatic. Relevant clauses:

**Right of withdrawal — excluded entirely.** They state plainly: "Aufgrund der Beschaffenheit der Produkte (gekühlte Lebensmittel mit begrenzter Haltbarkeit) ist ein Widerrufsrecht ausgeschlossen" — because their products are chilled food with limited shelf life, the statutory 14-day withdrawal right doesn't apply at all. This is a direct precedent for FermentFreude's own shop.

**Cancellation fee if customer cancels before delivery.** If a customer withdraws from an order before it ships, Edelsauer is entitled to charge a €5 cancellation fee ("Stornierungsgebühr") — a small deterrent against casual cancellations, framed as covering their handling cost.

**No self-pickup, shipping only** — "Selbstabholung ist aus logistischen Gründen nicht möglich." This is the one place Edelsauer's model differs from FermentFreude's, since your shop is pickup-only. It doesn't change the legal analysis (see §2 below) but it's worth noting they made the opposite fulfillment choice.

**Extensive "this is not a defect" disclaimers.** A whole section normalizes bulging lids, hissing on opening, minor leakage in transit, and batch-to-batch variation in color/taste/texture as natural fermentation behavior, not quality defects. Given FermentFreude's own products, this is worth borrowing almost verbatim for the shop policy — it heads off complaints and refund requests rooted in normal fermentation activity rather than genuine defects.

**Standard boilerplate.** Statutory defect/warranty rights remain (visible defects should be reported within 2 weeks of delivery); EU ODR platform linked but no obligation to use consumer arbitration; one promo code per order, no cash-out of leftover voucher balance.

Small aside: Edelsauer's own gift voucher product is literally named "Verschenke Fermentefreude" — close enough to your own name that it's a funny coincidence worth being aware of, not a conflict (different market, different spelling).

---

## 2. The legal baseline for FermentFreude (Austria/EU)

Two separate questions — workshops and shop orders are governed differently.

**Workshops: no statutory refund right at all.** Under Art. 16(l) of the EU Consumer Rights Directive (2011/83/EU), transposed into Austrian law via §18 FAGG, the 14-day withdrawal right does **not** apply to "services related to leisure activities if the contract provides for a specific date or period of performance." The CJEU confirmed this squarely for dated, capacity-limited leisure bookings in *DM v CTS Eventim* (Case C-96/21, event tickets) — the logic transfers directly to a fermentation workshop booked for a specific date and time. In plain terms: **FermentFreude is not legally required to refund a workshop booking if the customer changes their mind.** Whatever cancellation/refund policy you land on is a customer-experience and brand-trust decision, not a compliance one.

**Shop (pickup-only, fermented food): almost certainly also exempt.** Austrian guidance is consistent: "rasch verderbliche Waren fallen nicht unter das gesetzliche Rücktrittsrecht" (rapidly perishable goods aren't covered by the statutory withdrawal right) — this covers chilled/fresh products the way it covers Edelsauer's. Pickup vs. shipping doesn't change this; the exemption is about the product's nature, not the fulfillment method. The one thing worth flagging internally: if the shop ever sells anything *non-perishable* (e.g., a cookbook, dry goods, merch), that item would **not** be covered by the perishable-goods exemption and the standard 14-day withdrawal right would apply to it — so the policy may need to be product-type-aware rather than one blanket statement.

**Practical takeaway:** you have full freedom to design a refund/cancellation policy driven by what's good for the business and good for the customer relationship — not by a legal floor you're required to clear. That's both liberating and a bit of a trap, since "we could just say no refunds ever" is legally fine but likely to feel bad to health-conscious, community-minded workshop customers who are exactly FermentFreude's target audience.

---

## 3. How comparable workshop businesses actually structure it

Looked at cooking-class / hands-on-workshop operators (the closest comparable category — same dynamics of ingredient prep, capacity limits, instructor booking). Common pattern is a **tiered window**, roughly:

| Time before workshop | Typical treatment |
|---|---|
| 7–14+ days out | Full refund, or full refund minus a small processing fee |
| ~3–7 days out | Partial refund (50% is common) or full credit/voucher instead of cash |
| Under 24–72 hours | No refund — but many still offer a transfer: let someone else in the group take the spot, or a credit toward a future workshop rather than a hard "no" |
| No-show | No refund, no credit, no exceptions — this is the one line almost everyone holds firm on |

Rationale cited consistently: workshops involve buying perishable ingredients and locking in instructor time based on headcount days in advance, so a late cancellation is a real cost the business absorbs, not just an accounting inconvenience. A few operators charge a flat admin fee ($10–25) on any refund regardless of timing, to cover payment processing.

The other repeated pattern: **favor "transfer or credit" over "cash refund."** Letting a customer send a friend in their place, or banking the amount as a voucher toward a future date, is friendlier than a hard no and cheaper for the business than a cash refund (no payment processor fee eaten twice, and it keeps the customer coming back rather than walking away).

---

## 4. Framing for a FermentFreude decision (for David & Marcel)

Rather than picking one policy myself, here are three coherent positions at different points on the strictness spectrum — useful as a starting point for the conversation with the founders, since this is their call to make:

**A — Strict (protects margin, lowest admin overhead)**
No refunds once booked; date changes only, and only up to 48–72h before, subject to availability. No-shows forfeit fully. Closest to "no statutory obligation, so we hold the line."

**B — Balanced (closest to the cooking-class norm above)**
Full refund 7+ days out, voucher/credit only inside 7 days, no refund/credit inside 24–48h or no-show, transfers to another person always allowed free of charge at any time. This is probably the best starting point given FermentFreude's audience (health-conscious, community-oriented, repeat-visit-likely) — it's generous enough to build trust without exposing the business to last-minute-cancellation losses.

**C — Generous (brand-trust-first)**
Full refund up to 24–48h out, voucher beyond that, only no-shows forfeit. Costs more in absorbed ingredient/capacity loss but may fit a premium, relationship-driven brand positioning.

Open questions this doesn't resolve, worth asking David & Marcel directly before Flow 11 is built:

- Group bookings (1–12 guests per slot per the booking flow): if one person in a group of 4 cancels, is that a partial refund for 1 seat, or all-or-nothing for the booking? This isn't addressed by any of the examples above and needs an explicit answer.
- Admin-initiated cancellation (FermentFreude cancels a workshop, e.g. too few signups): this should probably always be a full refund or full credit, customer's choice — worth confirming that's uncontroversial.
- Does a voucher issued as compensation get the same expiry as a purchased gift voucher, or something more generous?
- Shop: is anything sold non-perishable (books, merch)? If yes, that product line needs its own, separate return clause since the perishable-goods legal exemption won't cover it.

---

## 5. Where this feeds into Flow 11

Flow 11 (cancel/rebook) currently doesn't exist in the system at all — this research is what should shape its shape before any interface or DB schema work starts. Once a policy direction (A/B/C above, or a David & Marcel variant) is chosen, Flow 11 needs to branch on at minimum: who initiates (customer vs. admin), how far out from the workshop date, whole-booking vs. partial-group-seat cancellation, and refund vs. voucher vs. reschedule as the resolution. Happy to draft that flow and the interface once the policy question above has an answer — building it before the policy is decided risks designing the wrong branches.

---

## Sources

- [edelsauer AGB (Terms of Service)](https://edelsauer.de/policies/terms-of-service)
- [§ 18 FAGG — Ausnahmen vom Rücktrittsrecht (JUSLINE)](https://www.jusline.at/gesetz/fagg/paragraf/18)
- [§ 11 FAGG — Rücktrittsrecht und Rücktrittsfrist (JUSLINE)](https://www.jusline.at/gesetz/fagg/paragraf/11)
- [Rücktrittsrecht bei Dienstleistungen im Internet — WKO](https://www.wko.at/internetrecht/ruecktrittsrecht-bei-dienstleistungen-im-internet)
- [CJEU Case C-96/21 (DM v CTS Eventim) — EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:62021CJ0096)
- [Recent ECL: Right of withdrawal, leisure activities and intermediaries](https://recent-ecl.blogspot.com/2022/11/right-of-withdrawal-leisure-activities.html)
- [Leisure as an exception to the right of withdrawal — LetsLaw](https://letslaw.es/en/leisure-as-an-exception-to-the-right-of-withdrawal/)
- [Rücktritt von einer Onlinebestellung — Europäisches Verbraucherzentrum Österreich](https://europakonsument.at/ruecktritt-von-einer-onlinebestellung/66183)
- [Kein Widerrufsrecht: Diese Waren sind vom Umtausch ausgeschlossen — Ombudsstelle.at](https://www.ombudsstelle.at/widerruf-und-rueckgabe/bei-welchen-waren-habe-ich-kein-widerrufsrecht/)
- [Sample Cancellation and Refund Policies — Occasion Knowledge Base](https://help.getoccasion.com/article/506-sample-cancellation-and-refund-policies)
- [Registration and Cancellation Policies — 18reasons.org](https://18reasons.org/registration-and-cancellation-policies)
- [5 Appointment and Class Cancellation and Refund Policy Examples — Pembee](https://www.pembee.app/blog/appointment-and-class-cancellation-and-refund-policy-examples)
