# FermentFreude Repository Audit Report
**Generated:** April 18, 2026  
**Branch:** `staging` (up to date with origin/staging)  
**Status:** ⚠️ **29 UNCOMMITTED CHANGES** + 3 untracked files

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Files Modified** | 29 |
| **Untracked Files** | 3 (new hooks) |
| **Total Changes** | +2,249 insertions, -1,709 deletions |
| **Last Commit** | `e118a75` (feat: auto-confirm bookings on order creation) |
| **Commits Since** | 20 commits tracked |
| **Active Work Areas** | Workshops, Ecommerce, Orders, Checkout, Brevo integration |

---

## 🔴 CRITICAL: UNCOMMITTED CHANGES

### Files Staged for Commit (0)
✅ **None** - No files staged

### Files with Uncommitted Changes (26)
⚠️ **Must be committed or discarded:**

#### **Core Ecommerce Flow**
1. **checkout/CheckoutPage.tsx** - 724 lines changed
   - Complete redesign of checkout layout (left column + right sidebar cart)
   - Workshop detection logic added
   - Address handling improvements
   - Tailwind CSS styling overhaul
   
2. **checkout/ConfirmOrder.tsx** - 46 lines changed
   - Order type detection (course/workshop/order)
   - Cart clearing after confirmation
   - Navigation to new `/account/order-confirmation` page

3. **components/forms/CheckoutForm/index.tsx** - 18 lines changed
   - Added `hasWorkshop` prop
   - Order type detection for routing

#### **Workshop Booking System**
4. **workshops/[slug]/KombuchaBookingCard.tsx** - 115 lines changed
5. **workshops/[slug]/LaktoBookingCard.tsx** - 115 lines changed
6. **workshops/[slug]/TempehBookingCard.tsx** - 115 lines changed
   - All three: Added router import + `router.refresh()` after booking
   - Fixed JSX parentheses issue
   - `addItem` parameter renamed to `addItemAction`

7. **workshops/[slug]/add-to-cart-utils.ts** - 44 lines changed
   - Enhanced error handling for silent `addItem` failures
   - localStorage verification after cart operation
   - Booking metadata cleanup on failure

8. **components/workshops/WorkshopCalendar.tsx** - 12 lines changed
   - Added router + router.refresh() after booking
   - Parameter renames to match new utils

#### **Orders & Hooks**
9. **collections/Orders/confirmWorkshopBookings.ts** - 144 lines changed
   - 3-tier matching strategy (email + count → count only → slug only)
   - Brevo workshop booking confirmation emails integrated
   - Better error handling and logging

10. **hooks/brevo/sendOrderConfirmationEmail.ts** - 28 lines changed
    - Support for guest checkout (`doc.customerEmail`)
    - Fallback email handling

#### **UI Components**
11. **components/Cart/DeleteItemButton.tsx** - 13 lines changed
    - Formatting improvements
    - Tailwind class updates

12. **components/dashboard/EditAddressModal.tsx** - 6 lines changed
    - Fixed navigation after address save

#### **Account/Dashboard**
13. **account/order-confirmation/page.tsx** - 317 lines changed
    - Completely new/rewritten page
    - Order type detection
    - Guest checkout support

14. **account/i18n.ts** - 63 lines changed
    - New i18n strings for order confirmation

15. **account/page.tsx** - 2 lines changed
    - Minor formatting

16. **account/orders/page.tsx** - 3 lines changed
    - Minor formatting

#### **Configuration & Infrastructure**
17. **plugins/index.ts** - 9 lines changed
    - New Stripe webhook handlers integrated
    - New order hooks added (inventory, auto-complete, webhooks)

18. **providers/index.tsx** - 2 lines changed
    - `debug={true}` for ecommerce
    - `productType` field exposed

19. **globals.css** - 25 lines changed
    - New styling rules

#### **Seed Scripts (Major Refactoring)**
20. **scripts/seed-all.ts** - 97 lines changed
    - Registry simplified (removed many entries)
    - Now only seeds: header, home, about, contact, voucher

21. **scripts/seed-home.ts** - 1,910 lines changed (MASSIVE)
    - Complete rewrite from builder pattern to direct content
    - Imports removed: all builder functions gone
    - New direct data structures for hero, blocks
    - Image handling simplified
    - No more `buildHeroSlider()`, `buildWorkshopSlider()` — inline data
    - Simpler bilingual seeding pattern

22. **scripts/seed-voucher.ts** - 106 lines changed
    - Deletion logic added
    - Simpler create/update flow
    - Import path changed

#### **Other**
23. **collections/Vouchers.ts** - 4 lines changed
    - Import order reordered

24. **checkout/page.tsx** - 8 lines changed
    - Minor updates

25. **.vscode/mcp.json** - 30 lines changed
    - MCP configuration updates

26. **package.json** - 2 lines changed
    - Version/dependency tweak

### Untracked Files (3 NEW)
🆕 **New files not yet in git:**

1. **src/collections/Orders/autoCompleteDigitalOrders.ts**
   - Auto-sets order status to "completed" for all-digital orders
   - Runs after booking confirmation and enrollment
   
2. **src/collections/Orders/decrementInventory.ts**
   - Decrements product/variant inventory on order creation
   - Skips workshops and digital courses
   - Sequential writes for M0 safety

3. **src/collections/Orders/stripeWebhooks.ts**
   - Custom Stripe webhook handlers
   - `payment_intent.payment_failed` — releases workshop spots
   - `charge.refunded` — marks order/booking as refunded, restores spots

---

## ✅ Latest Commits (Last 20)

| Commit | Message | What Changed |
|--------|---------|--------------|
| e118a75 | feat(workshops): auto-confirm bookings + fix webhook path | New webhook handlers, booking auto-confirm |
| 21282c2 | style: auto-format Pages/index.ts | Formatting |
| 68a14be | feat(brevo): voucher purchase confirmation email | Email hooks |
| 9b07e24 | feat(newsletter): footer newsletter with Brevo | Newsletter signup |
| f211b45 | fix(shop): ProductSlider cart, price display, unitSize | Shop fixes |
| fb5e191 | feat: analytics GTM funnel, sitemap/robots, inventory | Analytics + meta |
| b81a87b | feat: analytics GTM full funnel, inventory + bookings | Analytics framework |
| 76d352f | fix: whitespace pre-line for all #main-content elements | CSS fix |
| 8e78852 | feat: convert heading/title fields to textarea | CMS schema change |
| eaeb35d | feat: global whitespace-pre-line for CMS text | CSS framework |
| 8b45bd5 | fix: remove confusing sections 8-14 from workshopDetail | CMS cleanup |
| 61a20a7 | feat: make all workshop details CMS-editable | CMS enhancement |
| e0a8637 | chore: local changes — formatter fixes, hub admin, voucher | Local work |
| 7eba462 | fix: use canonical Tailwind classes | Tailwind audit |
| 9203bdf | fix: split calendar admin into sections | Admin UX |
| 63217de | feat: make calendar labels CMS-editable | CMS field |
| 32c52c5 | feat: add slider CMS fields to kombucha seed | Seed data |
| 8b3d075 | feat: move workshop tabs into Content tab | CMS reorganization |
| b0dff1a | feat: make calendar labels CMS-editable | CMS field |
| e70509e | fix: resolve all ESLint errors/warnings | Code quality |

---

## 🎯 What You've Been Doing (Analysis)

### **Phase 1: Workshop Booking Reliability** ✅ In Progress
- ✅ Fixed cart addition error handling (add-to-cart-utils.ts)
- ✅ Added router.refresh() after booking (all 3 workshop cards)
- ✅ Improved workshop booking confirmation matching (3-tier strategy)
- ✅ New Stripe webhook handlers for payment failures
- ✅ Inventory decrement on order creation

### **Phase 2: Checkout & Order Confirmation** ✅ In Progress
- ✅ Complete CheckoutPage redesign (modern left + right layout)
- ✅ New order confirmation page with type detection
- ✅ Guest checkout email support
- ✅ Workshop vs course vs physical product handling
- ✅ Address handling improvements

### **Phase 3: Email & Notifications** ✅ In Progress
- ✅ Workshop booking confirmation emails via Brevo
- ✅ Voucher purchase confirmation
- ✅ Newsletter subscription integration
- ✅ Order confirmation email improvements

### **Phase 4: Inventory & Order Management** ✅ In Progress
- ✅ Auto-complete digital orders (status = "completed")
- ✅ Inventory decrement on purchase
- ✅ Payment failure handling (refund workshops, restore inventory)
- ✅ Refund webhook handling

### **Phase 5: Seeding & Content** 🔄 In Progress
- 🔄 Massive seed-home.ts rewrite (moved from builders to inline)
- 🔄 Simplified seed-all.ts registry
- 🔄 New seed strategy for better control

---

## 🚨 What Needs To Be Done

### **IMMEDIATE (Must Do Before Merge)**

#### 1. **Test & Verify Uncommitted Changes**
- [ ] Test workshop booking end-to-end (all 3 types)
- [ ] Test checkout with guest email
- [ ] Test payment failure handling
- [ ] Test workshop confirmation emails in Brevo
- [ ] Test inventory decrement
- [ ] Verify order confirmation page redirects
- [ ] Test address modal save flow

#### 2. **Review & Stage Commits**
- [ ] Run type check: `npx tsc --noEmit` (must be zero errors)
- [ ] Run lint: `pnpm lint:fix`
- [ ] Review each file's changes carefully
- [ ] Stage changes: `git add -A` or selective staging
- [ ] Create meaningful commit with `git commit -m "message"`

#### 3. **Handle New Files**
- [ ] Review the 3 new order hooks
- [ ] Verify they integrate correctly with plugins/index.ts
- [ ] Stage them: `git add src/collections/Orders/*.ts`

#### 4. **Test the New Seed Script**
- [ ] Run `pnpm seed home` — verify it works with new inline pattern
- [ ] Check home page hero + blocks are seeded correctly
- [ ] Verify both DE + EN locales

#### 5. **Verifications Needed**
- [ ] ✅ `npx tsc --noEmit` — MUST PASS (zero errors)
- [ ] ✅ `pnpm lint:fix` — MUST PASS
- [ ] ✅ `pnpm build` — MUST SUCCEED
- [ ] ✅ Local dev test: `pnpm dev` → check / (home) and /workshops

### **CRITICAL Commits To Make**

1. **Checkout & Order Confirmation Redesign**
   ```
   feat(checkout): complete redesign with modern left + right layout
   - Refactor CheckoutPage with two-column layout
   - New /account/order-confirmation page with type detection
   - Support guest checkout with email
   - Handle workshop, course, and physical orders
   ```

2. **Workshop Booking Reliability**
   ```
   fix(workshops): improve booking reliability and cart error handling
   - Add router.refresh() after booking
   - Enhanced error handling for cart additions
   - localStorage verification for success
   - 3-tier booking matching strategy
   ```

3. **Order Hooks & Inventory**
   ```
   feat(orders): add inventory, auto-complete, and webhook handlers
   - New decrementInventory hook
   - New autoCompleteDigitalOrders hook
   - New Stripe webhook handlers (payment_failed, charge.refunded)
   - Restores workshop spots on payment failure/refund
   ```

4. **Brevo Email Integration**
   ```
   feat(brevo): add workshop and voucher confirmation emails
   - Workshop booking confirmation email
   - Voucher purchase confirmation email
   - Guest checkout email support
   - Improved email hooks
   ```

5. **Seed Script Refactoring**
   ```
   refactor(seed): simplify seed-home.ts to inline content
   - Move from builder functions to direct data structures
   - Simpler bilingual seeding pattern
   - Reduce seed-all registry to essentials
   ```

---

## 📋 Branch Strategy

**Current:** `staging` (up-to-date with origin/staging)

### Next Steps:
1. ✅ Commit all changes to `staging` (LOCAL)
2. ✅ Test on staging branch
3. ✅ Push to `origin/staging` for preview deploy
4. ✅ Merge `staging` → `main` when ready for production

**Command Summary:**
```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint & auto-fix
pnpm lint:fix

# 3. Stage all changes
git add -A

# 4. Commit with meaningful message
git commit -m "feat(checkout+orders): redesigned checkout, booking reliability, inventory tracking, Brevo emails"

# 5. Verify
git log --oneline -1

# 6. Push to staging for preview
git push origin staging

# 7. Later: merge to main
git checkout main && git merge staging && git push origin main
```

---

## 🔍 Risk Analysis

### **HIGH RISK:**
- ❌ **CheckoutPage: 724 lines changed** — complete redesign needs thorough testing
- ❌ **New webhook handlers** — must test payment failure scenarios
- ❌ **Seed script rewrite** — different pattern, verify production data integrity
- ❌ **Workshop booking chain** — affects user experience; payment + booking + inventory must work together

### **MEDIUM RISK:**
- ⚠️ **Guest checkout** — new userflow, test end-to-end
- ⚠️ **Order confirmation page** — new route, verify redirects work
- ⚠️ **Inventory decrement** — sequential M0 writes, verify no race conditions

### **LOW RISK:**
- ✅ Email hooks — Brevo integrations are isolated
- ✅ Address modal — minor fix
- ✅ Workshop card formatting — UI-only changes

---

## 📝 Checklist Before Merge

- [ ] All 29 modified files reviewed
- [ ] 3 new files reviewed (order hooks)
- [ ] `npx tsc --noEmit` passes (zero errors)
- [ ] `pnpm lint:fix` passes
- [ ] `pnpm build` succeeds
- [ ] Workshop booking end-to-end tested
- [ ] Checkout flow tested (guest + logged-in)
- [ ] Order confirmation page works
- [ ] Payment failure recovery tested
- [ ] Inventory decrements verified
- [ ] Brevo emails received
- [ ] All changes committed to staging
- [ ] Pushed to origin/staging
- [ ] Preview deploy successful
- [ ] Ready to merge to main

---

## 🎓 Key Insights

1. **Massive Checkout Redesign** — The CheckoutPage changes are significant. This needs thorough testing.
2. **Workshop Booking is Core** — Multiple touchpoints (booking, cart, email, inventory, refund) all need to work together.
3. **Seed Pattern Changed** — The home seed now uses inline data instead of builder functions. This is simpler but more maintenance-heavy for future updates.
4. **Production Safety** — New M0 sequential writes and webhook handlers need careful testing for edge cases.
5. **Guest Checkout** — New workflow for guest users (no account needed for workshop bookings).

---

**Last Updated:** April 18, 2026  
**Status:** 🔴 UNCOMMITTED CHANGES — Ready for review & commit
