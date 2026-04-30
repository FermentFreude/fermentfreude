# Order Fulfillment Lifecycle — Plan

> Proposal for a proper physical-order lifecycle (`processing → ready_for_pickup → picked_up`) without forking the Payload ecommerce plugin.
> Status: **PLAN — not yet implemented.** Awaiting founder sign-off on open questions at the bottom.

---

## 1. The bug today

Payload's ecommerce plugin locks `Order.status` to **4 values only**:

```ts
type OrderStatus = 'processing' | 'completed' | 'cancelled' | 'refunded' | null
```

We can't add `shipped` / `ready_for_pickup` to that enum without forking the plugin.

Current flow for a **physical product** order (jarred / fresh / bottled):

| Step | What runs | Result |
| --- | --- | --- |
| 1. Checkout | `payments.create` | `status = processing` |
| 2. Stripe webhook `charge.succeeded` | [`handleChargeSucceeded`](../src/collections/Orders/stripeWebhooks.ts#L264) | **`status → completed` immediately** |
| 3. (no further step) | — | Order is "done" forever |

### Why this is wrong

- A jar of kimchi paid 2 minutes ago shows **"Completed"** — but no human has touched it yet.
- There's no signal to the customer when it's actually **ready to collect**.
- There's no way to mark it **picked up** vs still sitting on the shelf.
- Founders have no operational queue ("what do I need to prep today?").
- A stale hook [`sendShippingNotificationEmail.ts`](../src/hooks/brevo/sendShippingNotificationEmail.ts#L29) is wired to fire when `status === 'shipped'` — a value that **can never be set**, so the email is dead code.

---

## 2. Proposed lifecycle

### Physical products (`jarred` / `fresh` / `bottled`)

```
processing  →  ready_for_pickup  →  picked_up
   (paid)        (founder preps)      (founder confirms collection)
```

### Workshops / digital courses

Already shipped in commit `7744f28`:

```
processing  →  confirmed
   (paid)       (auto, on charge.succeeded)
```

### Cancelled / refunded

Available at any stage via Stripe refund or admin action (already works).

---

## 3. How we encode it (without forking the plugin)

Add a **second field** to the Orders collection — `fulfillmentStatus` — independent of Payload's locked `status` enum. The two fields together describe the order's true state.

**New field:** `fulfillmentStatus` (select, optional, admin-editable)

| Value | Meaning |
| --- | --- |
| `awaiting_prep` | Default for physical orders after payment. |
| `ready_for_pickup` | Founder has prepped the order; customer can collect. |
| `picked_up` | Customer has collected. Order is fully done. |
| `not_applicable` | Digital / workshop — no fulfillment needed. |

### Mapping `status` × `fulfillmentStatus` → customer label

| Payload `status` | `fulfillmentStatus` | Customer-facing label (DE / EN) | Order type |
| --- | --- | --- | --- |
| `processing` | `awaiting_prep` | **In Vorbereitung** / In preparation | Physical |
| `processing` | `ready_for_pickup` | **Bereit zur Abholung** / Ready for pickup | Physical |
| `completed` | `picked_up` | **Abgeholt** / Picked up | Physical |
| `completed` | `not_applicable` | **Bestätigt** / Confirmed | Workshop / digital |
| `cancelled` | * | Storniert / Cancelled | any |
| `refunded` | * | Erstattet / Refunded | any |

---

## 4. What changes in the codebase

### 4.1 Stop auto-completing physical orders on payment

**File:** [`src/collections/Orders/stripeWebhooks.ts`](../src/collections/Orders/stripeWebhooks.ts) (`handleChargeSucceeded`)

- If order has any physical item → set `fulfillmentStatus = 'awaiting_prep'`, **leave `status = 'processing'`**.
- If order is digital/workshop only → set `status = 'completed'`, `fulfillmentStatus = 'not_applicable'` (current behavior).

### 4.2 Same logic at order creation

**File:** [`src/collections/Orders/autoCompleteDigitalOrders.ts`](../src/collections/Orders/autoCompleteDigitalOrders.ts)

- Already correctly skips physical orders. Just add `fulfillmentStatus = 'awaiting_prep'` for physical, `'not_applicable'` for digital/workshop.

### 4.3 New admin transition hook

**New file:** `src/collections/Orders/handleFulfillmentTransition.ts` (afterChange)

- When founder sets `fulfillmentStatus = 'ready_for_pickup'` → fire **pickup-ready email** (rewire the dead `sendShippingNotificationEmail.ts` to this trigger instead of `status === 'shipped'`).
- When founder sets `fulfillmentStatus = 'picked_up'` → also flip Payload `status → completed` so reporting/Payload internals stay correct. Optionally fire a thank-you email.

### 4.4 Add `fulfillmentStatus` field via the orders override

**File:** [`src/plugins/index.ts`](../src/plugins/index.ts) (`ordersCollectionOverride`)

- Inject the new field and admin column.
- Add `defaultColumns: ['id', 'status', 'fulfillmentStatus', 'amount', 'customer', 'createdAt']` so founders see the queue at a glance.

### 4.5 Admin UX for the founders

- Preset filter: **"Ready to prep"** = `status: processing` + `fulfillmentStatus: awaiting_prep`.
- Preset filter: **"Awaiting collection"** = `fulfillmentStatus: ready_for_pickup`.
- Both as Payload preset filters so David/Marcel just click one tab to see their daily work.

### 4.6 Customer-facing label (display only)

**Files:**

- [`src/app/(app)/account/orders/[id]/page.tsx`](../src/app/(app)/account/orders/[id]/page.tsx)
- [`src/app/(app)/account/orders/page.tsx`](../src/app/(app)/account/orders/page.tsx)
- [`src/components/OrderStatus/index.tsx`](../src/components/OrderStatus/index.tsx)

Replace the current `statusLabel` derivation with the table from §3 (combine `status` + `fulfillmentStatus`).

Status pill colors:

| State | Color |
| --- | --- |
| `awaiting_prep` (In preparation) | brand yellow `#e6be68` |
| `ready_for_pickup` | green |
| `picked_up` / `confirmed` | dark `#1d1d1d` |
| `cancelled` / `refunded` | muted |

### 4.7 i18n keys (DE + EN)

**File:** [`src/app/(app)/account/i18n.ts`](../src/app/(app)/account/i18n.ts)

New keys:

- `statusInPreparation` — *In Vorbereitung* / *In preparation*
- `statusReadyForPickup` — *Bereit zur Abholung* / *Ready for pickup*
- `statusPickedUp` — *Abgeholt* / *Picked up*

Already added (commit `7744f28`):

- `statusConfirmed`, `statusCancelled`, `statusRefunded`, `noShippingNeeded`, `pickupAtStudio`

### 4.8 Brevo email rewiring

**File:** [`src/hooks/brevo/sendShippingNotificationEmail.ts`](../src/hooks/brevo/sendShippingNotificationEmail.ts)

- Trigger on **`fulfillmentStatus` change to `ready_for_pickup`**, not on the impossible `status === 'shipped'`.
- Template `BREVO_TEMPLATES.SHIPPING_NOTIFICATION` is already correct ("ready for pickup in 2 hours") — just feed it the right trigger.

### 4.9 Migration for existing data (one-time script)

**New file:** `src/scripts/migrate-fulfillment-status.ts`

Backfill rules:

| Existing state | New `fulfillmentStatus` |
| --- | --- |
| `completed` + physical | `picked_up` |
| `completed` + digital/workshop | `not_applicable` |
| `processing` + physical | `awaiting_prep` |
| `processing` + digital/workshop | `not_applicable` |
| `cancelled` / `refunded` | leave null (audit trail) |

**Constraint:** Sequential writes only — Atlas M0 has no transactions. Never `Promise.all`.

---

## 5. Edge cases handled

- **Mixed cart** (jar + workshop): treated as physical (needs prep). Workshop side still gets its booking confirmed via `confirmWorkshopBookings` independently — that hook is unaffected.
- **Refund mid-prep**: Stripe `charge.refunded` already sets `status = refunded`. We leave `fulfillmentStatus` alone (audit trail).
- **Editor manually creates an order in admin**: `autoCompleteDigitalOrders` runs on `create`, so `fulfillmentStatus` gets defaulted there too.
- **Future shipping (DHL etc.)**: same field can grow values like `shipped` / `delivered` without breaking the model.

---

## 6. Implementation order (smallest commits first)

1. Add `fulfillmentStatus` field + `pnpm generate:types` — no behavior change.
2. Update `handleChargeSucceeded` + `autoCompleteDigitalOrders` to set the field correctly going forward.
3. Run backfill migration on staging DB.
4. Display-layer changes (account pages, `OrderStatus` component, i18n).
5. Rewire Brevo email + add `handleFulfillmentTransition` hook.
6. Admin preset filters.
7. Test end-to-end on staging with a real Stripe test charge → mark ready → mark picked up. Then promote to main.

---

## 7. Open questions (need founder answers before build)

1. **Initial label for paid physical orders** — show "In preparation" (more honest) or keep "Processing" until founder marks ready?
   _Recommendation:_ "In preparation".
2. **Pickup email trigger** — auto-send when founder clicks `ready_for_pickup`, or a manual "Send pickup email" button?
   _Recommendation:_ Auto (simpler, less to forget).
3. **Picked-up thank-you email** — fire a new Brevo email on `picked_up`, or rely on the existing post-purchase flow?
   _Recommendation:_ Skip for v1; add later if founders want it.

---

## 8. Hard constraints (must remain intact)

- V2 Brevo template IDs (`65, 66, 68, 69, 70, 71, 72, 73`) — never modify.
- `SCHEDULED_EMAILS_ENABLED = false` — never flip without explicit instruction.
- Sequential MongoDB writes — no `Promise.all` for mutations (Atlas M0 has no transactions).
- Brand color yellow `#e6be68`, never blue.
- Tailwind v4: `bg-(--var)` not `bg-[--var]`.
- All text fields `localized: true` — both `de` and `en`, always.
- Cannot add to `OrderStatus` enum (Payload ecommerce plugin constraint) — this is exactly why we add a parallel `fulfillmentStatus` field.
