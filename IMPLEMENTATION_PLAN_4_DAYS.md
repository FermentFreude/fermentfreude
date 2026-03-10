# 🎯 Workshop Booking System — 4-Day Implementation Plan

**Launch Date:** Friday, March 14, 2026  
**Current Status:** Collections + API exist. Missing: inventory management, booking records, GDPR, cancellations, emails.  
**Scope:** Everything on the priority list (MUST-HAVE + NICE-TO-HAVE, excluding auth for future)

---

## 📊 Current State Analysis

### ✅ What Already Exists
1. **Collections:** Workshops, WorkshopAppointments, WorkshopLocations, WorkshopBookings, Vouchers
2. **API:** `/api/cart/add-workshop` (validates availability, returns cart data)
3. **Database:** Real appointments seeded in MongoDB
4. **Cart Integration:** Client-side localStorage storage of booking metadata
5. **UI:** BookingModal, unified workshop cards, cart display

### ❌ What's Missing (Must Build)

| Item | Status | Notes |
|------|--------|-------|
| **Inventory decrement** | ❌ Not implemented | API validates but doesn't reduce availableSpots |
| **Booking records** | ❌ Not implemented | WorkshopBookings collection exists but not auto-filled |
| **GDPR consent checkbox** | ❌ Not implemented | No consent collection or validation |
| **Cancellation UI** | ❌ Not implemented | No cancel endpoint or customer dashboard |
| **Email reminders** | ❌ Not implemented | Needs Brevo integration after Stripe setup |
| **API documentation** | ❌ Not implemented | Need OpenAPI/JSON specs in code & docs |
| **Cart persistence bug** | ❌ Needs investigation | Product staying in cart on refresh |

---

## 🗓️ 4-Day Sprint Schedule

### **DAY 1 (Wednesday, Mar 12) — Core Infrastructure**
**Goal:** Inventory + Booking Records (2-3 hours)

#### Task 1.1: Inventory Management
**File:** `/src/app/api/cart/add-workshop/route.ts`

**What to do:**
1. After validation passes (line ~110), add this before returning success:
   ```typescript
   // Atomic decrement of availableSpots
   await payload.update({
     collection: 'workshop-appointments',
     id: appointmentId,
     data: {
       availableSpots: appointment.availableSpots - guestCount,
     },
   })
   ```

2. Create **recovery logic** in case Stripe payment fails:
   - Add new endpoint: `POST /api/cart/release-spots`
   - Input: appointmentId, guestCount (freed if payment fails)
   - Updates: `availableSpots += guestCount`

**Why this approach?**
- Spots are reserved immediately (prevents overbooking)
- If payment fails, spots are returned to available
- No race conditions (Payload atomic updates)

**Testing checklist:**
- [ ] Add to cart → availableSpots decrements
- [ ] Check `/admin` → appointment shows reduced spots
- [ ] On payment failure, spots return

---

#### Task 1.2: Create Booking Records
**File:** `/src/app/api/cart/add-workshop/route.ts`

**What to do:**
1. After decrementing spots, create a WorkshopBooking record:
   ```typescript
   const booking = await payload.create({
     collection: 'workshop-bookings',
     data: {
       workshopSlug,
       appointmentId,
       workshopTitle: workshop.title,
       date: dateDisplay,
       time: timeDisplay,
       guestCount,
       pricePerPerson,
       totalPrice,
       status: 'pending', // Becomes 'confirmed' after Stripe webhook
     },
   })
   ```

2. Return booking ID in response:
   ```typescript
   return NextResponse.json({
     success: true,
     bookingId: booking.id, // ← Add this
     // ... rest of response
   })
   ```

**Why?**
- Admins can see all bookings in `/admin`
- Links purchases to users (after Stripe webhook updates it)
- No loose data floating in localStorage

**Testing checklist:**
- [ ] Add to cart → WorkshopBooking created
- [ ] Check `/admin` → new booking appears
- [ ] Booking has correct metadata (date, guests, price)

---

### **DAY 2 (Thursday, Mar 13) — User-Facing Features**
**Goal:** GDPR + Cancellation UI (2-3 hours)

#### Task 2.1: GDPR Consent Modal
**Files:**
- `/src/components/BookingConsent.tsx` (new)
- `/src/app/(app)/workshops/[slug]/BookingModal.tsx` (update)

**What to do:**

1. Create new component `BookingConsent.tsx`:
   ```typescript
   export const BookingConsent: React.FC<{
     onAccept: () => void
     isOpen: boolean
   }> = ({ onAccept, isOpen }) => {
     if (!isOpen) return null
     
     return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
         <div className="bg-white p-8 rounded max-w-md">
           <h2 className="text-xl font-bold mb-4">Datenschutz & Einwilligung</h2>
           <p className="text-sm text-gray-600 mb-4">
             Deine E-Mail wird nur für diese Buchungsbestätigung gespeichert. Wir teilen deine Daten nicht.
             <a href="/privacy" className="text-blue-500 underline">Datenschutz</a>
           </p>
           <label className="flex items-center gap-2 mb-4">
             <input type="checkbox" id="consent" />
             <span>Ich stimme zu</span>
           </label>
           <button onClick={onAccept} className="w-full bg-blue-500 text-white py-2 rounded">
             Bestätigen
           </button>
         </div>
       </div>
     )
   }
   ```

2. Update `BookingModal.tsx`:
   - Show consent modal before "Add to Cart" → API call
   - Only call `/api/cart/add-workshop` after consent.checked === true

**Why?**
- Austria legally requires consent before storing data
- Simple checkbox satisfies GDPR requirement
- No database needed (just UI check)

**Testing checklist:**
- [ ] BookingModal shows consent checkbox
- [ ] Cannot submit form without checking consent
- [ ] After accepting, adds to cart normally

---

#### Task 2.2: Cancellation UI
**Files:**
- `/src/app/(app)/account/bookings/page.tsx` (new)
- `/src/app/api/bookings/cancel/route.ts` (new)

**What to do:**

1. Create `/account/bookings` page:
   ```typescript
   // Fetch user's bookings from localStorage (temporary)
   // OR from Stripe metadata after payment
   // Display: Workshop name, date, time, guests, "Cancel" button
   ```

2. Create cancel endpoint:
   ```typescript
   POST /api/bookings/cancel
   {
     "bookingId": "...",
     "appointmentId": "..."
   }
   ```
   - Updates WorkshopBooking: status = "cancelled"
   - Increments availableSpots back
   - Returns refund info (to be processed by Stripe later)

**Why?**
- Users can cancel bookings
- Spots return to available pool
- Admin can see cancellations in `/admin`

**Testing checklist:**
- [ ] User can view their bookings
- [ ] Can click "Cancel"
- [ ] availableSpots increases
- [ ] Status changes to "cancelled"

---

### **DAY 3 (Friday, Mar 14 — Morning) — Email & Documentation**
**Goal:** Brevo integration + API docs (2-3 hours)

#### Task 3.1: Email Reminder Setup
**Files:**
- `src/hooks/emailReminders.ts` (new)
- `src/payload.config.ts` (update)

**What to do:**

1. Create email hook:
   ```typescript
   export const sendBookingConfirmation = async (booking: WorkshopBooking) => {
     // After Stripe webhook confirms payment:
     // Call Brevo API to send confirmation email
     // Email includes: confirmation #, date, time, location, Zoom link
   }
   ```

2. Update WorkshopBookings collection to include:
   - `emailSent: boolean` (default: false)
   - Hook: on status change to 'confirmed' → send email

**Note:** Brevo credentials (`BREVO_API_KEY`) will be set up separately. This just structures the code.

**Testing checklist:**
- [ ] Hook exists and can be called
- [ ] Email template is correct format
- [ ] No errors when Brevo key is missing (graceful degradation)

---

#### Task 3.2: API Specification Documentation
**File:** `/docs/API_SPECIFICATION.md` (new)

**Content:**

```markdown
# Workshop Booking API

## Endpoints

### POST /api/cart/add-workshop
**Description:** Validate appointment and reserve spots

**Request:**
```json
{
  "appointmentId": "65f12a3b...",
  "workshopSlug": "kombucha",
  "guestCount": 2
}
```

**Success (200):**
```json
{
  "success": true,
  "bookingId": "64k3m2n...",
  "cartItem": { ... },
  "appointment": { ... }
}
```

**Error Codes:**
- `400` — Missing/invalid fields
- `404` — Appointment not found
- `409` — Not enough spots available
- `410` — Appointment is past or unpublished
- `500` — Server error

### POST /api/bookings/cancel
**Description:** Cancel a booking and return spots

**Request:**
```json
{
  "bookingId": "...",
  "reason": "optional"
}
```

**Success (200):**
```json
{
  "success": true,
  "refundAmount": 198
}
```

### POST /api/cart/release-spots
**Description:** Return spots to available pool (on payment failure)

**Request:**
```json
{
  "appointmentId": "...",
  "guestCount": 2
}
```
```

**Why?**
- Developers know what the API does
- Error codes are clear
- Examples for integration

**Testing checklist:**
- [ ] Document is complete
- [ ] All endpoints covered
- [ ] Example requests/responses added

---

### **DAY 4 (Friday, Mar 14 — Afternoon) — Testing & Bug Fixes**
**Goal:** QA + Production Ready (2-3 hours)

#### Task 4.1: Cart Persistence Bug Investigation
**What to check:**

1. Why does product stay in cart on page refresh?
   - Is it localStorage persisting cart items?
   - Is it a Stripe session persisting?
   - Is it browser cache?

2. Possible solutions:
   - Option A: Clear cart on page load (temporary while developing)
   - Option B: Give users option to restore cart or start fresh
   - **Recommended:** Ask Rafaela what behavior she wants

**Testing:**
- [ ] Reproduce bug
- [ ] Understand root cause
- [ ] Implement intended behavior

---

#### Task 4.2: End-to-End Testing

Test full flow:
```
1. Visit workshop page
2. Click booking card
3. Select date & guests
4. Accept GDPR checkbox
5. Add to cart
   → availableSpots decrements ✓
   → WorkshopBooking created ✓
6. View cart
   → Shows booking details ✓
7. Mock Stripe payment (locally)
   → Webhook received
   → Booking marked "confirmed"
   → Email sent (Brevo test)
8. View `/account/bookings`
   → Shows confirmed booking ✓
9. Cancel booking
   → availableSpots increments ✓
   → Status = "cancelled" ✓
```

**Checklist:**
- [ ] All steps work end-to-end
- [ ] No console errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Payload types regenerated (`pnpm generate:types`)

---

#### Task 4.3: Documentation & Handoff

Update docs:
- [ ] Add "Cart Persistence" explanation to SETUP.md
- [ ] Add "Email Reminders" section with Brevo setup instructions
- [ ] Add "Cancellation Policy" for customers
- [ ] Update `npm run` commands to include new workflows

---

## 📋 Implementation Checklist

### Day 1 (Infrastructure)
- [ ] Inventory decrement: availableSpots reduced on add-to-cart
- [ ] Release endpoint: recovery if payment fails
- [ ] WorkshopBooking record creation on add-to-cart
- [ ] Booking data returned in API response

### Day 2 (User Features)
- [ ] GDPR consent modal before booking
- [ ] Consent validation (no submit without checkbox)
- [ ] `/account/bookings` page
- [ ] Cancel endpoint and UI
- [ ] Cancellation updates spots + booking status

### Day 3 (Email & Docs)
- [ ] Email reminder hook (Brevo structure)
- [ ] API specification document
- [ ] Error code documentation

### Day 4 (Testing)
- [ ] End-to-end flow from booking to cancellation
- [ ] Cart persistence bug resolved
- [ ] TypeScript errors = 0
- [ ] All deployable to staging

---

## 🚀 Deployment Sequence

**When complete:**
1. `pnpm generate:types`
2. `npx tsc --noEmit` (must be zero errors)
3. `git add -A && git commit -m "..."`
4. `git push origin staging`
5. Deploy to Vercel (automatic)

**Then (separate task):**
- Brevo + Stripe webhook setup (you + Alaa)
- Production database migration if needed

---

## ⚠️ Known Unknowns (Clarify Before Day 1)

1. **Cart persistence bug** — Is this a bug to fix or feature to keep?
2. **Booking confirmation email** — Immediate after add-to-cart, or only after Stripe payment?
3. **Refund handling** — Automatic refund via Stripe, or manual by admin?
4. **Reminder emails** — How many days before workshop send reminders?

**Answer these and we're ready to code.**

---

## 📎 Files to Create/Modify

### Create (New Files)
- `src/components/BookingConsent.tsx`
- `src/app/(app)/account/bookings/page.tsx`
- `src/app/api/bookings/cancel/route.ts`
- `src/app/api/cart/release-spots/route.ts`
- `src/hooks/emailReminders.ts`
- `docs/API_SPECIFICATION.md`

### Modify (Existing)
- `src/app/api/cart/add-workshop/route.ts` (add inventory + booking creation)
- `src/app/(app)/workshops/[slug]/BookingModal.tsx` (add consent check)
- `src/payload.config.ts` (update WorkshopBookings fields for status)
- `docs/SETUP.md` (add Brevo section)

### No Changes Needed
- Collections (already exist)
- Initial API structure (already works)
- Database schema (already correct)

---

## 🎯 Success Criteria

✅ **By Friday EOD:**
- Inventory management: working
- Booking records: created automatically
- GDPR consent: enforced
- Cancellation: functional
- Email structure: ready for Brevo keys
- API docs: complete
- Zero TypeScript errors
- Deployable to production

✅ **Not in scope (for later):**
- Brevo API keys setup
- Stripe webhook implementation
- User authentication
- Online courses platform

