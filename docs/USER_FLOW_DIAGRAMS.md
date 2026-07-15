# FermentFreude — User Flow Diagrams

Prepared by Rafaela Studio · 2026-07-09

Twelve diagrams in Mermaid flowchart syntax: eleven detailed flows plus one "map of maps" overview. Each flow uses subgraphs as swimlanes for **Customer, Website (Next.js), Database (Payload/MongoDB), Stripe, Brevo, Admin**.

**Convention:**
- Solid box = confirmed working today
- Dashed orange box, "⚠ known bug" = exists but broken
- Dashed gray box, "🚧 not built yet" = referenced/planned but doesn't work
- Diamond = decision point

Paste any block below into a Mermaid live editor (mermaid.live) or a Mermaid-enabled Notion/Markdown viewer to render it.

---

## Flow 1 — Workshop booking & checkout (core commerce flow)

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["Browse workshop page"]
        C2["Pick date + guests (1-12)"]
        C3["Click 'Book'"]
        C4["Proceed to checkout:<br/>contact info, optional account<br/>(voucher entry -&gt; see Flow 3)"]
        C6["Pay via Stripe Elements<br/>(card or redirect method)"]
        C7["Abandon: remove item from cart,<br/>or payment fails"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Show published appointment dates<br/>+ live available spots"]
        W2["Reserve spot:<br/>decrement availableSpots"]
        W3["Create pending booking<br/>(before any payment)"]
        W5["Create Stripe PaymentIntent"]
        W6["On success: create Order"]
        W7["Inventory decrement<br/>(skipped for workshops)"]
        W8["Auto-enrollment<br/>(skipped, not a digital course)"]
        W9["Match pending booking →<br/>flip to 'confirmed'"]
        W10["Mark order complete"]
        W11["Restore spot,<br/>cancel pending booking"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("Appointment doc:<br/>availableSpots")]
        D2[("availableSpots --")]
        D3[("Booking: status = pending")]
        D6[("Order: paid, complete")]
        D7[("Booking: status = confirmed")]
        D8[("availableSpots ++,<br/>booking cancelled")]
    end

    subgraph STR["Stripe"]
        direction LR
        S1["PaymentIntent created"]
        S2["Payment succeeds"]
        S3["Webhook: payment_intent.succeeded<br/>(independently confirms order/booking,<br/>redundant safety net)"]
        S4["Payment fails"]
    end

    subgraph BRV["Brevo"]
        direction LR
        BR1["Send confirmation email<br/>+ .ics calendar attachment"]
        BR2["Send internal admin<br/>notification email"]
    end

    subgraph ADM["Admin"]
        direction LR
        A1["Founder receives<br/>admin notification"]
        A2["Admin manually deletes<br/>order in dashboard"]
    end

    C1 --> W1 --> D1 --> C2 --> C3 --> W2
    W2 --> D2
    W2 --> W3 --> D3 --> C4 --> W5 --> S1 --> C6 --> S2 --> W6
    W6 --> D6
    W6 --> W7
    W6 --> W8
    W6 --> W9 --> D7
    W9 --> BR1
    W9 --> BR2 --> A1
    W6 --> W10
    S2 -.->|"parallel"| S3 --> W6
    C7 --> W11 --> D8
    A2 --> D8

    class C1,C2,C3,C4,C6,C7,W1,W2,W3,W5,W6,W7,W8,W9,W10,W11,D1,D2,D3,D6,D7,D8,S1,S2,S3,S4,BR1,BR2,A1,A2 solid;
```

**Note:** voucher entry and redemption logic (including the partial-coverage bug) lives entirely in Flow 3 — not duplicated here to keep this diagram readable.

---

## Flow 2 — Gift voucher purchase

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["Go to voucher / gift page"]
        C2["Choose euro value (flexible),<br/>delivery method (email to recipient /<br/>email to self / PDF), purchaser info,<br/>optional recipient info + note"]
        C3["Pay via Stripe"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Create Stripe PaymentIntent<br/>for chosen amount"]
        W2["On success: create voucher record<br/>(unique code auto-generated,<br/>status = active)"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("Voucher: active,<br/>unique code")]
        D2[("Voucher: active,<br/>issued manually by admin")]
    end

    subgraph STR["Stripe"]
        direction LR
        S1["PaymentIntent created"]
        S2["Payment succeeds"]
    end

    subgraph BRV["Brevo"]
        direction LR
        BR1["Send purchase email + PDF download link<br/>(wording varies: gift-giver /<br/>self-purchaser / forwarder)"]
    end

    subgraph ADM["Admin"]
        direction LR
        A1["Admin manually issues voucher<br/>from dashboard (no Stripe)"]
    end

    C1 --> C2 --> W1 --> S1 --> C3 --> S2 --> W2 --> D1 --> BR1
    A1 --> D2

    class C1,C2,C3,W1,W2,D1,D2,S1,S2,BR1,A1 solid;
```

---

## Flow 3 — Redeeming a voucher at checkout

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["Enter voucher code at checkout"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Validate code:<br/>active, not expired"]
        W2["Return voucher value"]
        W3{"Voucher value covers<br/>whole cart?"}
        W4["Create order at €0 directly"]
        W5["⚠ Intended: apply partial discount,<br/>then normal Stripe payment<br/>for the remainder —<br/>NOT fully wired up yet"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("Voucher lookup")]
        D2[("Order: €0")]
        D3[("Voucher: redeemed")]
    end

    subgraph STR["Stripe"]
        direction LR
        S1["⚠ Remainder payment path —<br/>not fully wired up"]
    end

    subgraph BRV["Brevo"]
        direction LR
        BR1["Send confirmation email"]
    end

    C1 --> W1 --> D1 --> W2 --> W3
    W3 -- "YES" --> W4
    W4 --> D2
    W4 --> D3 --> BR1
    W3 -- "NO" --> W5
    W5 -.-> S1

    class C1,W1,W2,D1,D2,D3,BR1 solid;
    class W3 decision;
    class W5,S1 bug;
```

**⚠ Known bug:** when a voucher only partially covers the cart, the system has no working path today — no partial-discount-then-Stripe-payment flow exists in production.

---

## Flow 4 — PDF voucher download

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["Click PDF link<br/>(from purchase email)"]
    end

    subgraph ADM["Admin"]
        direction LR
        A1["Click PDF link<br/>(from admin dashboard)"]
        A2["🚧 'You've received a gift'<br/>personalized landing page —<br/>exists in code, references a field<br/>that doesn't exist in the DB"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Server looks up voucher code"]
        W2["Overlay code as text<br/>on static template PDF"]
        W3["⚠ Euro value shown is NOT the<br/>real voucher value — baked into<br/>template artwork as a fixed image,<br/>same number for every voucher"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("Voucher lookup")]
        D2[("🚧 Missing field referenced<br/>by gift landing page")]
    end

    C1 --> W1
    A1 --> W1
    W1 --> D1 --> W2 --> W3
    A2 -.-> D2

    class C1,A1,W1,D1,W2 solid;
    class W3 bug;
    class A2,D2 notbuilt;
```

**⚠ Known bug:** PDF shows a fixed placeholder amount regardless of actual voucher value.
**🚧 Not built:** the personalized "gift received" landing page is non-functional (missing DB field).

---

## Flow 5 — Account creation, login, password reset

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["Visitor signs up"]
        C2["Visitor logs in"]
        C3["Visitor requests password reset<br/>or email verification"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Create account"]
        W2["Authenticate session"]
        W3["Trigger reset / verification flow<br/>(overrides Payload's default<br/>built-in email sender)"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("User account created")]
    end

    subgraph BRV["Brevo"]
        direction LR
        BR1["Send welcome email"]
        BR2["Sync contact to<br/>Brevo CRM contact list"]
        BR3["Send login<br/>notification email"]
        BR4["Send password reset /<br/>email verification email"]
    end

    C1 --> W1 --> D1
    W1 --> BR1
    W1 --> BR2
    C2 --> W2 --> BR3
    C3 --> W3 --> BR4

    class C1,C2,C3,W1,W2,W3,D1,BR1,BR2,BR3,BR4 solid;
```

---

## Flow 6 — Newsletter signup

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["Visitor submits newsletter form<br/>(footer or content block)"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Submit form data"]
    end

    subgraph BRV["Brevo"]
        direction LR
        BR1["Contact added to Brevo"]
        BR2["Double opt-in confirmation<br/>handled entirely inside Brevo"]
    end

    C1 --> W1 --> BR1 --> BR2

    class C1,W1,BR1,BR2 solid;
```

---

## Flow 7 — Digital course purchase & enrollment

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["Buy digital course product<br/>(checkout as in Flow 1)"]
        C2["Track progress<br/>in account area"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Order completes"]
        W2{"Enrollment record<br/>already exists?"}
        W3["Create enrollment record"]
        W4["Skip — already enrolled"]
        W5["Display progress"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("Enrollment record")]
    end

    subgraph BRV["Brevo"]
        direction LR
        BR1["Send course<br/>enrollment email"]
    end

    C1 --> W1 --> W2
    W2 -- "No" --> W3 --> D1 --> BR1
    W2 -- "Yes" --> W4
    C2 --> W5 --> D1

    class C1,C2,W1,W3,W4,W5,D1,BR1 solid;
    class W2 decision;
```

---

## Flow 8 — Admin: publishing a new workshop (no developer involved)

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph ADM["Admin (David/Marcel)"]
        direction LR
        A1["Create or reuse 'workshop type'<br/>(title, description, price,<br/>max capacity, what-to-bring)"]
        A2["Create bookable 'appointment'<br/>(date/time/location,<br/>available spots, published toggle)"]
        A3{"Matching storefront<br/>product already exists<br/>for this workshop type?"}
        A4["⚠ Match happens by TEXT NAMING<br/>CONVENTION only — not a real DB<br/>link. Fragile manual step admins<br/>must get right themselves."]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("Workshop type doc")]
        D2[("Appointment doc:<br/>published = true")]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Appointment appears automatically<br/>on public workshop page —<br/>bookable immediately, no deploy needed"]
    end

    subgraph CUST["Customer"]
        direction LR
        C1["Sees appointment,<br/>can book (→ Flow 1)"]
    end

    A1 --> D1 --> A2 --> D2 --> A3
    A3 -- "checked manually" --> A4
    D2 --> W1 --> C1

    class A1,A2,D1,D2,W1,C1 solid;
    class A3 decision;
    class A4 bug;
```

**⚠ Known bug / fragile:** product↔workshop matching relies on naming convention text-matching, not an enforced database relationship.

---

## Flow 9 — Editing website content (bilingual)

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph ADM["Admin (David/Marcel)"]
        direction LR
        A1["Edit page built from<br/>content blocks, in German (default)"]
        A2["Save"]
        A3["Preview draft via<br/>private preview link"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Automatic translation<br/>service: DE → EN"]
        W2{"Has this EN text been<br/>manually edited before?"}
        W3["Manual edit preserved,<br/>not overwritten"]
        W4["Auto-translated<br/>version used"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("Page: DE content saved")]
        D2[("Page: EN content")]
        D3[("Page: EN = manual edit")]
        D4[("Page: EN = auto-translated")]
        D5[("Page: draft / published state")]
    end

    A1 --> A2 --> D1 --> W1 --> D2 --> W2
    W2 -- "Yes" --> W3 --> D3
    W2 -- "No" --> W4 --> D4
    D1 --> D5 --> A3

    class A1,A2,A3,W1,W3,W4,D1,D2,D3,D4,D5 solid;
    class W2 decision;
```

---

## Flow 10 — Stripe webhook reconciliation (background, runs independently of checkout)

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph STR["Stripe"]
        direction LR
        S1["Event fires on Stripe's side<br/>(payment succeeded / failed / refunded)"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["Receive webhook event"]
        W2{"Event type?"}
        W3["Confirm matching order<br/>+ pending bookings<br/>(redundant backup to Flow 1)"]
        W4["Cancel pending booking,<br/>restore spot"]
        W5["Mark order + booking refunded,<br/>restore spot"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("Order/Booking: confirmed")]
        D2[("Booking: cancelled,<br/>availableSpots ++")]
        D3[("Order/Booking: refunded,<br/>availableSpots ++")]
    end

    subgraph ADM["Admin"]
        direction LR
        A1["🚧 No button anywhere in the<br/>dashboard initiates a Stripe refund —<br/>refunds must be issued by hand<br/>directly inside Stripe's own dashboard first"]
    end

    S1 --> W1 --> W2
    W2 -- "payment succeeded" --> W3 --> D1
    W2 -- "payment failed" --> W4 --> D2
    W2 -- "charge refunded" --> W5 --> D3
    A1 -.->|"only entry point for refunds"| S1

    class S1,W1,W2,W3,W4,W5,D1,D2,D3 solid;
    class W2 decision;
    class A1 notbuilt;
```

**🚧 Not built:** this reconciliation is the *only* refund automation that exists — there is no in-dashboard refund-initiation button; refunds start manually inside Stripe itself.

---

## Flow 11 — Cancelling or rebooking a workshop 🚧 (not built — proposed design, split into 4 scenarios)

None of this exists today — the single biggest gap versus every flow above. Based on David's operational use-case doc (Cases 1–4), this splits into four distinct scenarios rather than one generic "cancel" flow, because the right business response is different in each case. Shared principle across all four: **rebooking is tried first, credit/voucher second, cash refund only as a last resort** — this keeps revenue in the business and matches how comparable workshop operators handle it (see the refund policy research doc).

### Flow 11a — Admin cancels a full workshop date (David's Case 1)

Illness, scheduling conflict, or too few participants force a whole date to be pulled. Payments stay linked to the customer (nothing auto-refunds); everyone affected gets a magic-link invite to self-serve a new date, with manual admin rebooking as the fallback. Refund is offered only if no date works for the customer.

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph ADM["Admin"]
        direction LR
        A1["🚧 Open workshop date<br/>in dashboard"]
        A2["🚧 Mark date cancelled,<br/>add reason + internal note"]
        A4["🚧 Manual admin rebooking<br/>fallback (support contact)"]
        A5["🚧 Approve refund —<br/>only if no date works"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["🚧 Identify all affected<br/>paid bookings"]
        W2["🚧 Generate magic<br/>rebooking link per booking"]
        W3["🚧 Customer selects new<br/>available date (self-service)"]
        W4{"🚧 New date has<br/>capacity?"}
        W5["🚧 Release old seat, reserve new,<br/>keep original payment linked"]
        W6["🚧 Issue credit / voucher<br/>(12 months)"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("🚧 Appointment:<br/>status = cancelled")]
        D2[("🚧 Booking: payment linked,<br/>awaiting rebooking")]
        D3[("🚧 Booking: moved<br/>to new date")]
        D4[("🚧 Voucher: issued as credit")]
        D5[("🚧 Order: refunded")]
    end

    subgraph STR["Stripe"]
        direction LR
        S1["🚧 Refund processed<br/>(last resort only)"]
    end

    subgraph BRV["Brevo"]
        direction LR
        B1["🚧 Notify all affected:<br/>date cancelled, booking still<br/>valid, pick a new date"]
        B2["🚧 Send rebooking<br/>confirmation"]
        B3["🚧 Send credit/voucher<br/>issued email"]
        B4["🚧 Send refund<br/>confirmation"]
    end

    subgraph CUST["Customer"]
        direction LR
        C1["🚧 Receives cancellation<br/>notice + magic link"]
        C2["🚧 Browses available dates"]
        C6{"🚧 Suitable new<br/>date found?"}
        C5{"🚧 Prefers credit<br/>or refund?"}
    end

    A1 --> A2 --> D1 --> W1 --> D2 --> B1 --> C1
    C1 --> C2
    C1 -.->|"or contacts support"| A4
    A4 --> W3
    C2 --> W3 --> W4
    W4 -- "yes" --> C6
    C6 -- "yes, confirm" --> W5 --> D3 --> B2
    W4 -- "no" --> C6
    C6 -- "no" --> C5
    C5 -- "credit" --> W6 --> D4 --> B3
    C5 -- "refund (last resort)" --> A5 --> S1 --> D5 --> B4

    class A1,A2,A4,A5,W1,W2,W3,W5,W6,D1,D2,D3,D4,D5,S1,B1,B2,B3,B4,C1,C2 notbuilt;
    class W4,C6,C5 decision;
```

---

### Flow 11b — Individual reschedule, workshop unaffected (David's Case 2)

One customer has a personal conflict; the session itself still runs for everyone else. Self-service via a magic link in the original confirmation email, capacity- and window-gated, with admin manual rebooking as the fallback for edge cases (expired link, price difference).

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["🚧 Personal conflict —<br/>workshop itself still runs"]
        C2["🚧 Opens magic rebooking link<br/>from original confirmation email"]
        C3["🚧 Browses available dates,<br/>same workshop type"]
        C4["🚧 Confirms new date"]
        C5["🚧 Contacts support instead<br/>(edge case / link expired)"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1{"🚧 Still inside rebooking<br/>window (e.g. &gt;48-72h out)?<br/>Not used before?"}
        W2{"🚧 New date has capacity<br/>at same price?"}
        W3["🚧 Release old seat,<br/>reserve new seat"]
        W4["🚧 Keep original payment<br/>linked — no new charge"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("🚧 Old appointment:<br/>availableSpots ++")]
        D2[("🚧 New appointment:<br/>availableSpots --")]
        D3[("🚧 Booking: date changed,<br/>payment unchanged")]
    end

    subgraph BRV["Brevo"]
        direction LR
        B1["🚧 Send rebooking<br/>confirmation"]
        B2["🚧 Send 'link expired,<br/>contact us' notice"]
    end

    subgraph ADM["Admin"]
        direction LR
        A1["🚧 Manual rebooking fallback<br/>in dashboard"]
        A2["🚧 Handle price difference<br/>manually if new date differs"]
    end

    C1 --> C2 --> W1
    W1 -- "yes" --> C3 --> W2
    W1 -- "no / already used once" --> C5 --> A1
    W2 -- "yes" --> C4 --> W3
    W3 --> D1
    W3 --> D2
    W3 --> W4 --> D3 --> B1
    W2 -- "no, different price" --> A2 --> A1
    A1 --> D3
    C5 -.-> B2

    class C1,C2,C3,C4,C5,W3,W4,D1,D2,D3,B1,B2,A1,A2 notbuilt;
    class W1,W2 decision;
```

---

### Flow 11c — Customer cancels entirely: rebook → credit → refund waterfall (David's Case 3)

The customer doesn't want any date — a true cancellation. Resolution depends on the same policy tiers proposed in the refund policy doc: 7+ days out offers credit first (refund only if the customer insists), 3–6 days offers credit only (refund becomes a rare, discretionary admin exception), under 72h/no-show gets neither.

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["🚧 Wants to cancel entirely<br/>(no date works, not just rescheduling)"]
        C2["🚧 Starts cancellation<br/>(self-service or contact admin)"]
        C3{"🚧 Accepts credit,<br/>or insists on refund?"}
        C4{"🚧 Accepts 50% credit,<br/>or insists on refund?"}
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["🚧 Calculate days<br/>until workshop"]
        W2{"🚧 Which policy tier?"}
        W3["🚧 Offer full-value credit<br/>as first option"]
        W5["🚧 Offer 50% credit<br/>as only option"]
        W6["🚧 Cancel booking,<br/>release seat — no credit, no refund"]
        W4["🚧 Issue voucher"]
    end

    subgraph ADM["Admin"]
        direction LR
        A1["🚧 Reviews suggested refund<br/>(semi-automated: system proposes,<br/>admin confirms)"]
        A2["🚧 Approves refund"]
        A3["🚧 Rare manual exception review<br/>(discretionary, 3-6 day tier)"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("🚧 Voucher: issued as credit")]
        D2[("🚧 Order: refunded")]
        D3[("🚧 Booking: cancelled,<br/>seat released")]
    end

    subgraph STR["Stripe"]
        direction LR
        S1["🚧 Refund processed<br/>(last resort only)"]
    end

    subgraph BRV["Brevo"]
        direction LR
        B1["🚧 Send credit/voucher<br/>issued email"]
        B2["🚧 Send refund<br/>confirmation email"]
        B3["🚧 Send cancellation<br/>confirmation, no compensation"]
    end

    C1 --> C2 --> W1 --> W2
    W2 -- "7+ days out" --> W3 --> C3
    C3 -- "credit" --> W4 --> D1 --> B1
    C3 -- "refund (last resort)" --> A1 --> A2 --> S1 --> D2 --> B2
    W2 -- "3-6 days out" --> W5 --> C4
    C4 -- "credit" --> W4
    C4 -- "insists on refund" --> A3 -.->|"exceptional, discretionary"| A1
    W2 -- "under 72h / no-show" --> W6 --> D3 --> B3

    class C1,C2,W1,W3,W4,W5,W6,A1,A2,A3,D1,D2,D3,S1,B1,B2,B3 notbuilt;
    class W2,C3,C4 decision;
```

---

### Flow 11d — Partial cancellation of a multi-seat booking (David's Case 4)

Bookings hold 1–12 guests as a single quantity, not named individuals — so "one person out of a group of 3" reduces the quantity by one rather than cancelling the whole booking. MVP is admin-only (per David's suggested Option C); self-service can come later. The single removed seat's value follows the exact same rebook → credit → refund waterfall as Flow 11c, just scoped to one seat instead of the whole booking.

```mermaid
flowchart TB
    classDef solid fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px,color:#1B1B1B;
    classDef bug fill:#FFF3E0,stroke:#E65100,stroke-width:1.5px,stroke-dasharray: 5 5,color:#1B1B1B;
    classDef notbuilt fill:#F5F5F5,stroke:#757575,stroke-width:1.5px,stroke-dasharray: 3 3,color:#1B1B1B;
    classDef decision fill:#E3F2FD,stroke:#1565C0,stroke-width:1px,color:#1B1B1B;

    subgraph CUST["Customer"]
        direction LR
        C1["🚧 One person in a group of N<br/>can't attend — others still want to go"]
        C2["🚧 Requests partial cancellation<br/>(contacts admin — MVP is admin-only,<br/>self-service later)"]
    end

    subgraph ADM["Admin"]
        direction LR
        A1["🚧 Opens the multi-seat<br/>booking in dashboard"]
        A2["🚧 Reduces active seat count<br/>by 1, confirms remaining N-1"]
    end

    subgraph WEB["Website (Next.js)"]
        direction LR
        W1["🚧 Calculate the removed seat's<br/>proportional value (total ÷ N)"]
        W2["🚧 Apply the same rebook → credit →<br/>refund waterfall as Flow 11c,<br/>scoped to this one seat's value"]
    end

    subgraph DB["Database (Payload/MongoDB)"]
        direction LR
        D1[("🚧 Booking: quantity N → N-1,<br/>remaining seats stay 'confirmed'")]
        D2[("🚧 Appointment:<br/>availableSpots ++ (1 seat)")]
        D3[("🚧 Removed seat: rebooked,<br/>credited, or refunded")]
    end

    subgraph BRV["Brevo"]
        direction LR
        B1["🚧 Confirms to customer:<br/>1 seat cancelled, other N-1<br/>seats remain confirmed"]
    end

    C1 --> C2 --> A1 --> A2
    A2 --> D1
    A2 --> D2
    A2 --> W1 --> W2 --> D3 --> B1

    class C1,C2,A1,A2,W1,W2,D1,D2,D3,B1 notbuilt;
```

**🚧 Not built:** none of Flow 11a–11d exists today — the single biggest gap versus every flow above. These are the intended shapes, not current reality, and still need David & Marcel's sign-off on the underlying refund/credit policy before they're built as-is.

---

## Map of maps — all 11 flows, overall health

Each flow shown as a single node, color-coded by overall status, with arrows showing hand-offs between flows. Color call for each flow is Rafaela Studio's synthesis of the detail above — worth a gut-check against your own read before sharing externally.

```mermaid
flowchart LR
    classDef working fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B1B1B;
    classDef buggy fill:#FFF3E0,stroke:#E65100,stroke-width:2px,color:#1B1B1B;
    classDef missing fill:#F5F5F5,stroke:#757575,stroke-width:2px,stroke-dasharray: 4 4,color:#1B1B1B;

    F1["Flow 1<br/>Workshop booking & checkout"]
    F2["Flow 2<br/>Gift voucher purchase"]
    F3["Flow 3<br/>Redeem voucher at checkout<br/>⚠ partial-redeem not wired"]
    F4["Flow 4<br/>PDF voucher download<br/>⚠ wrong euro value shown"]
    F5["Flow 5<br/>Account: signup/login/reset"]
    F6["Flow 6<br/>Newsletter signup"]
    F7["Flow 7<br/>Digital course purchase & enrollment"]
    F8["Flow 8<br/>Admin: publish workshop<br/>⚠ fragile text-name matching"]
    F9["Flow 9<br/>Editing content (bilingual)"]
    F10["Flow 10<br/>Stripe webhook reconciliation"]
    F11["Flow 11<br/>Cancel / rebook workshop<br/>🚧 not built"]

    F1 -.->|"parallel safety net"| F10
    F1 -->|"shared checkout path"| F7
    F1 <-->|"voucher entered<br/>during checkout"| F3
    F2 --> F3
    F3 --> F4
    F5 -.->|"also syncs Brevo CRM contact"| F6
    F8 --> F1
    F9 -.->|"content feeds public pages used in"| F1
    F10 -.->|"gap this would close"| F11

    class F1,F2,F5,F6,F7,F9,F10 working;
    class F3,F4,F8 buggy;
    class F11 missing;
```

---

## Legend recap

| Style | Meaning |
| --- | --- |
| 🟩 Solid green box | Confirmed working today |
| 🟧 Dashed orange box | Exists but broken — "⚠ known bug" |
| ⬜ Dashed gray box | Referenced/planned but doesn't work — "🚧 not built yet" |
| 🔷 Diamond | Decision point |

**Biggest gaps at a glance:** no true remainder-payment path when a voucher partially covers a cart (Flow 3), voucher PDFs display a fixed placeholder amount (Flow 4), product↔workshop linking is a manual naming convention rather than an enforced relationship (Flow 8), and there is no cancellation/refund/rebooking workflow anywhere in the admin dashboard (Flow 11) — refunds today start by hand in Stripe itself.
