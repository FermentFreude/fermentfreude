# Call Prep — FermentFreude Next Steps
**For:** Rafaela  
**Date:** July 2026  
**Purpose:** Talking points for call with David & Marcel

---

## 1. Reframe: This is not a "handover"

The word "handover" suggests something is in the wrong hands. It's not.

Almost everything was set up under the FermentFreude name from day one:
- Brevo → their account, they manage it
- Stripe → their account, they manage it
- Domain (EasyName) → their account
- GitHub → FermentFreude org
- Vercel → managed by Rafaela as developer (normal)

**Two small things to clean up (not urgent):**
- MongoDB Atlas → add David as account owner (change email)
- Cloudflare R2 → add David to the account

These take 10 minutes. Not a crisis.

**Message for the call:**  
*"The systems are already structured correctly. Almost everything is in your name. I manage Vercel and GitHub as the developer, which is how it should work. There are two small account ownership steps we can sort together — MongoDB and Cloudflare R2."*

---

## 2. Documentation exists — a lot of it

The request was: "basic documentation so we understand how everything works."

What already exists:
- Full developer documentation (CLAUDE.md + 30+ docs files in `/docs`)
- Founders guide for the booking system (`BOOKING_SYSTEM_FOR_FOUNDERS.md`)
- Brevo setup and operations guides for non-technicals
- Stripe setup guide for founders
- Workshop setup guide
- Dashboard quick reference

**What's missing and reasonable to add:**
- One visual diagram (one page, showing all systems and how they connect) — I can make this before or after the call

**Message for the call:**  
*"The documentation is there — both for developers and for you as founders. What I haven't done yet is a one-page visual diagram. I'll make that — it's the most useful thing for getting a quick overview."*

---

## 3. What's already built (they may not realise)

**Self-service workshop creation (WEB-023)**  
This is done. David and Marcel can already:
- Create new workshop appointment slots in `/admin`
- Set date, time, location, available spots
- Publish/unpublish instantly
- Changes go live on the website immediately — no developer needed

**Booking system**  
- Workshop booking with seat selection works
- Payment via Stripe works
- Confirmation emails via Brevo work

**Tracking (WEB-015)**  
- GTM is wired up in the code
- GA4 e-commerce events are implemented: add to cart, begin checkout, purchase, view item, remove from cart
- **What's David's job:** configure the GA4 tag and any other tools (Clarity, Meta Pixel) inside the GTM dashboard — that's not developer work, that's marketing setup

---

## 4. Real bugs — quick fixes, already identified

These are real and I will fix them:

| Bug | What it is | Fix |
|-----|-----------|-----|
| WEB-006 | "Edit page in Admin" button visible to all public visitors on Gastronomy page | Remove or hide behind admin login check |
| WEB-012 | "Payload Ecommerce Template" appearing in shop page titles / browser tabs | Replace with FermentFreude branding |

**Phone number (WEB-005):** The placeholder `+43 664 1234567` is in the CMS. David can fix this himself in `/admin` → Business Info → Phone. No code change needed.

**Language mixing (WEB-007):** I need David and Marcel to go through the pages and flag specific spots. I can't know which German is intentional and which is wrong — that's content review, not code.

---

## 5. What's their decision to make (not developer work)

These items are in the sheet but they're business or legal decisions — not things I can or should decide:

| Item | What it needs |
|------|--------------|
| WEB-008 — Align cancellation & voucher terms | David decides the rules, then I update the text |
| WEB-009 — Privacy policy & tracking audit | External legal review + David decides which tools to use |
| WEB-010 — Health claims / probiotic wording | David reviews with a food/legal expert |
| WEB-007 — Language QA | David and Marcel go through pages and mark what's wrong |
| WEB-014 — Workshop page content QA | David reviews each workshop page |
| WEB-019 — Online courses: available or coming soon? | Business decision |
| WEB-020 — Help/FAQ: finish or hide? | Content decision |

**Message for the call:**  
*"Several items on the sheet are content and legal decisions — I need you to make the call first, then I update the code or CMS. I can't decide your cancellation policy or which health claims are safe to make."*

---

## 6. The most important topic: what happens going forward

This needs a direct conversation.

**The situation:**  
The first phase is done — the website is live, bookings work, the system is in place. Going forward, the website will need ongoing maintenance: bug fixes, content changes that require code, new features, security updates.

**Two options to discuss:**

**Option A — Monthly retainer**  
A fixed monthly amount covers: bug fixes, small changes, keeping systems up to date. New features are scoped and quoted separately. Gives them stability, gives you predictable income.

**Option B — Per job / on demand**  
They contact you when something needs to be done, you quote and invoice per task. More flexible, no commitment on either side. Risk: things pile up or break without priority.

**What to clarify on the call:**
- Who is responsible for monitoring uptime and errors? (Vercel sends alerts — who receives them?)
- What happens if there's a bug that stops bookings or payments? Is that an emergency retainer situation?
- Are there planned new features (online courses, B2B) that would require a bigger development phase?

**Message for the call:**  
*"Before we talk about new features, I'd like to agree on how we work together going forward. The first phase is closed. For maintenance and future work, I'd suggest we either agree a small monthly retainer for ongoing support, or we go per-job — both work, but let's decide so we're clear."*

---

## 7. Suggested call agenda (45–60 min)

1. Quick overview: what's live and working (5 min)
2. Ownership/access: two small things to sort — MongoDB and R2 (5 min)
3. Documentation: confirm what exists, offer the visual diagram (5 min)
4. Bug fixes: confirm the two quick fixes, ask David to update the phone number himself (5 min)
5. Their decisions: legal, content QA, language review — agree who does what (10 min)
6. Business model going forward: retainer vs. per-job (15 min)
7. Future features: scope and prioritize only after #6 is agreed (10 min)

---

## 8. Things NOT to commit to in the call

- Don't say "I'll fix everything on the sheet" — it's a mix of your work and their work
- Don't agree to new features without a written quote and agreed payment structure
- Don't take on legal responsibility for WEB-008, 009, 010 — those need external review
- Don't promise timelines without knowing if there's a maintenance agreement in place first
