# 📘 FermentFreude Booking System — Complete Technical Plan

**Status:** Ready for Implementation  
**Updated:** March 9, 2026  
**Workshop Price:** €99 per person (CONFIRMED)  
**Max Capacity:** 12 persons per workshop slot

---

## 📑 **Table of Contents**

1. [Overview & Architecture](#overview)
2. [Data Model](#data-model)
3. [User Journey](#user-journey)
4. [Admin Dashboard](#admin-dashboard)
5. [Technical Implementation](#technical-implementation)
6. [API Endpoints](#api-endpoints)
7. [Error Handling](#error-handling)
8. [Payment Integration (Phase 2)](#payment-phase-2)
9. [Testing Strategy](#testing)

---

## <a name="overview"></a>🏗️ **1. Overview & Architecture**

### **Current State:**
- Booking dates are hardcoded in component files
- No real inventory/availability tracking
- Users can't actually book anything (modal just alerts)
- No cart integration

### **Target State:**
- Dates managed in database (Payload CMS)
- Inventory tracked per appointment slot
- Full booking flow: Select date → Choose guests → Check availability → Add to cart
- Single checkout for workshops + products
- Payment triggers confirmation email (Phase 2)

### **Key Principles:**
- **Database is source of truth** — Dates only exist in `WorkshopAppointments` collection
- **Real-time availability** — Users see actual available spots, revalidated on every click
- **Admin control** — Non-technical founders can manage all dates from `/admin`
- **Graceful degradation** — Frontend has DEFAULT_DATES fallback
- **Cart integration** — Workshops are cart items like products

---

## <a name="data-model"></a>📊 **2. Data Model**

### **Collection 1: Workshops**

**Purpose:** Define workshop metadata (reusable across all dates/locations)

```typescript
interface Workshop {
  slug: string                      // 'kombucha', 'lakto', 'tempeh', 'basics'
  title: string                    // localized (de/en)
  description: richText            // localized
  basePrice: number                // 99 (fixed, or per-workshop override later)
  maxCapacityPerSlot: number       // 12 (global rule, enforced by system)
  image: Media                      // Upload field → Media collection
  isActive: boolean                // Hide from frontend if false
  createdAt: Date                  // Auto
  updatedAt: Date                  // Auto
}
```

**Admin Controls:**
- Can view/edit all workshops
- Cannot modify this list (add new workshops only via code for now)

**Example:**
```json
{
  "_id": "640a8f2b1c2d3e4f5g6h7i8j",
  "slug": "kombucha",
  "title": { "de": "Kombucha Workshop", "en": "Kombucha Workshop" },
  "description": "Braue deinen eigenen Kombucha...",
  "basePrice": 99,
  "maxCapacityPerSlot": 12,
  "isActive": true
}
```

---

### **Collection 2: WorkshopLocations**

**Purpose:** Define where workshops are offered (cities, studios)

```typescript
interface WorkshopLocation {
  name: string                    // localized (de/en) — 'Berlin Studio'
  address: string                 // Full address
  timezone: string                // Optional: 'Europe/Berlin'
  isActive: boolean               // Hide from frontend if false
  createdAt: Date
  updatedAt: Date
}
```

**Admin Controls:**
- Full CRUD (create, read, update, delete)

**Example:**
```json
{
  "_id": "650b9g3c2d3e4f5g6h7i8j9k",
  "name": { "de": "Berlin Studio", "en": "Berlin Studio" },
  "address": "Friedrichstrasse 123, 10115 Berlin, Germany",
  "timezone": "Europe/Berlin",
  "isActive": true
}
```

---

### **Collection 3: WorkshopAppointments** ⭐ (THE HUB)

**Purpose:** Define specific workshop sessions (dates, times, availability)

```typescript
interface WorkshopAppointment {
  workshop: ObjectId              // relationship → Workshops
  location: ObjectId              // relationship → WorkshopLocations
  dateTime: Date                  // Combined date + time (ISOString)
  availableSpots: number          // 0-12 (validated to not exceed maxCapacityPerSlot)
  isPublished: boolean            // true = show on frontend
  notes: string                   // Optional admin notes
  createdAt: Date
  updatedAt: Date
}
```

**Validation:**
- `dateTime` cannot be in the past
- `availableSpots` must be ≤ workshop.maxCapacityPerSlot (12)
- Unique index: (workshop, location, dateTime) — no duplicates

**Admin Controls:**
- Add new appointments (key workflow)
- Edit available spots (most common action)
- Toggle "Published" to hide/show dates
- View all appointments in a table grouped by workshop

**Example:**
```json
{
  "_id": "660c0h4d3e4f5g6h7i8j9k0l",
  "workshop": "640a8f2b1c2d3e4f5g6h7i8j",  // Kombucha
  "location": "650b9g3c2d3e4f5g6h7i8j9k",    // Berlin Studio
  "dateTime": "2026-05-15T14:00:00Z",
  "availableSpots": 8,
  "isPublished": true,
  "notes": "Extra large group, might need backup SCOBY"
}
```

---

### **Collection 4: Vouchers** (Optional, for future)

**Purpose:** Gift vouchers that can be redeemed for workshops

```typescript
interface Voucher {
  code: string                    // Unique: 'KOMBUCHA-GIFT-ABC123' (auto-generated)
  workshop: ObjectId              // relationship → Workshops
  value: number                   // 99 (must match basePrice)
  redeemed: boolean               // true = used, read-only
  redeemedOn: Date                // When used, read-only
  redeemedBy: ObjectId            // User who redeemed, optional
  notes: string                   // Optional admin notes
  createdAt: Date
  updatedAt: Date
}
```

**Admin Controls:**
- View all vouchers (code, status, created date)
- Cannot edit (voucher metadata is immutable)
- Can see redemption history

---

## <a name="user-journey"></a>👥 **3. User Journey (Full Flow)**

### **Scenario: Customer Books Kombucha Workshop**

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Customer visits /workshops/kombucha              │
│         - Sees: Title, price (€99), hero image           │
│         - Button: "View Dates"                           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Fetch Workshop Data from Database                │
│         Frontend queries: GET /api/workshops/kombucha    │
│         Returns:                                          │
│         - basePrice: 99                                  │
│         - maxCapacityPerSlot: 12                         │
│         - image: {...}                                  │
│         - appointments: [                                │
│             { id, location, dateTime, availableSpots },  │
│             { id, location, dateTime, availableSpots },  │
│             ...                                          │
│           ]                                              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Customer clicks "View Dates"                     │
│         Dates list expands, showing:                     │
│         - Date, time, available spots per appointment    │
│         Example:                                         │
│         - May 15, 14:00 – 17:00 (8 spots)  [BOOK]       │
│         - May 22, 10:00 – 13:00 (2 spots)  [BOOK]       │
│         - June 5, 14:00 – 17:00 (12 spots) [BOOK]       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: Customer clicks [BOOK] on May 15                 │
│         Modal appears with:                              │
│         - Workshop: Kombucha                             │
│         - Date: May 15, 2026                             │
│         - Time: 14:00 – 17:00                            │
│         - Available: 8 spots                             │
│         - Guest count selector: [−] 1 [+]               │
│         - Total: €99                                     │
│         - Buttons: [Cancel] [Add to Cart]                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Step 5a: Customer adjusts to 3 guests                    │
│          - Allowed (3 ≤ 8 available)                     │
│          - Total updates: €99 × 3 = €297                │
│          - [Add to Cart] button enabled                  │
└─────────────────────────────────────────────────────────┘
               OR
┌─────────────────────────────────────────────────────────┐
│ Step 5b: Customer selects May 22 (2 spots available)     │
│          Adjusts to 4 guests in modal                    │
│          - Not allowed (4 > 2 available)                 │
│          - ⚠️ WARNING MODAL:                             │
│            "Only 2 spots, you want 4"                    │
│          - Buttons:                                       │
│            [Choose Different Date] [Reduce to 2]         │
│          - Customer clicks [Reduce to 2]                 │
│          - Count resets to 2, warning closes             │
│          - [Add to Cart] enabled, total €198             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Step 6: Customer clicks [Add to Cart]                    │
│         Backend: POST /api/cart/add-workshop             │
│         Body: {                                          │
│           appointmentId: "660c0h4d3e...",               │
│           workshopSlug: "kombucha",                      │
│           guestCount: 3                                  │
│         }                                                │
│                                                          │
│         Backend validation:                              │
│         - guestCount (3) ≤ availableSpots (8) ✓          │
│         - guestCount (3) ≤ maxCapacity (12) ✓            │
│         - Appointmentexists ✓                           │
│                                                          │
│         Response: { success: true, cartItem: {...} }    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Step 7: Modal closes, toast shows                        │
│         "✓ Added to cart!"                               │
│         Cart now contains:                               │
│         - Kombucha Workshop (May 15, 3 guests) — €297    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Step 8: Customer continues shopping (optional)           │
│         Adds: "Fermented Kraut" (product) — €15          │
│         Cart:                                            │
│         - Kombucha Workshop — €297                       │
│         - Fermented Kraut — €15                          │
│         - TOTAL: €312                                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Step 9: Click "Go to Checkout"                           │
│         [PAYMENT PAGE — Not implemented yet]             │
│         - Stripe payment form (Phase 2)                  │
│         - Email confirmation (Phase 2)                   │
└─────────────────────────────────────────────────────────┘
```

---

## <a name="admin-dashboard"></a>⚙️ **4. Admin Dashboard**

### **Founders' Workflow**

**Location:** `/admin/collections/workshop-appointments`

**Main Table View:**

| Workshop | Location | Date | Time | Spots | Published |
|----------|----------|------|------|-------|-----------|
| Kombucha | Berlin | May 15 | 14:00 | **8** ← editable | ✓ |
| Kombucha | Berlin | May 22 | 10:00 | 2 | ✓ |
| Lakto | Munich | May 18 | 14:00 | 12 | ✓ |
| Tempeh | Berlin | May 25 | 10:00 | 0 | ✗ |

**Actions Available:**
- **Edit Row:** Change availableSpots (8 → 5), toggle Published
- **Add Row:** Create new appointment (select workshop, location, date, spots)
- **Delete Row:** Remove appointment (rarely needed, just unpublish instead)

**Real-time Effects:**
- Change "Spots" 8 → 5
- Page refreshes (or socket updates)
- Website instantly shows "5 spots left"
- No customer can book the 6th–8th spot anymore

---

## <a name="technical-implementation"></a>🔧 **5. Technical Implementation**

### **5.1 Collections (Phase 1)**

**File Structure:**
```
src/
├── collections/
│   ├── Workshops.ts          (NEW)
│   ├── WorkshopLocations.ts  (NEW)
│   ├── WorkshopAppointments.ts (NEW)
│   └── Vouchers.ts           (NEW, optional)
└── payload.config.ts         (MODIFIED: register collections)
```

**Pseudo-code: Workshops.ts**
```typescript
export const WorkshopsCollection: CollectionConfig = {
  slug: 'workshops',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'slug', type: 'text', unique: true, required: true },
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'basePrice', type: 'number', defaultValue: 99 },
    { name: 'maxCapacityPerSlot', type: 'number', defaultValue: 12, admin: { readOnly: true } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'isActive', type: 'checkbox', defaultValue: true }
  ]
}
```

**Pseudo-code: WorkshopAppointments.ts**
```typescript
export const WorkshopAppointmentsCollection: CollectionConfig = {
  slug: 'workshop-appointments',
  fields: [
    {
      name: 'workshop',
      type: 'relationship',
      relationTo: 'workshops',
      required: true
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'workshop-locations',
      required: true
    },
    {
      name: 'dateTime',
      type: 'date',
      required: true
    },
    {
      name: 'availableSpots',
      type: 'number',
      min: 0,
      max: 12,
      defaultValue: 12
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true
    }
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Validate: dateTime not in past
        // Validate: availableSpots ≤ 12
      }
    ]
  }
}
```

### **5.2 Frontend Components (Phase 2)**

**Modified Files:**

**BookingModal.tsx:**
```typescript
type BookingModalProps = {
  workshop: WorkshopDetailData & { maxCapacity: number }
  selectedDate: WorkshopDate & {
    appointmentId: string
    availableSpots: number
  }
  onClose: () => void
  onConfirm: (guestCount: number) => Promise<void>
  onSelectDifferentDate: () => void
}

// State:
const [guestCount, setGuestCount] = useState(1)
const [showWarning, setShowWarning] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)

// Logic:
const canBook = guestCount <= selectedDate.availableSpots

// Render guest count selector + warning modal
```

**KombuchaBookingCard.tsx (same for Lakto, Tempeh):**
```typescript
// Updated cmsDates to include appointmentId + availableSpots:
const cmsDates = appointments.map(apt => ({
  id: apt.id,
  date: formatDate(apt.dateTime),
  time: formatTime(apt.dateTime),
  spotsLeft: apt.availableSpots,
  appointmentId: apt.id,
  availableSpots: apt.availableSpots
}))

// Updated BookingModal invocation:
<BookingModal
  workshop={mergedWorkshop}
  selectedDate={bookingDate}
  maxCapacity={12}
  onConfirm={async (guestCount) => {
    await addWorkshopToCart({
      appointmentId: bookingDate.appointmentId,
      guestCount
    })
  }}
  onSelectDifferentDate={() => setShowDates(true)}
/>
```

**[slug]/page.tsx:**
```typescript
// Fetch appointments from DB:
const appointments = await payload.find({
  collection: 'workshop-appointments',
  where: {
    workshop: { equals: workshopId },
    isPublished: { equals: true }
  }
})

// Pass to component:
<KombuchaBookingCard cms={{ ...page.workshopDetail, dates: dbAppointments }} />
```

---

## <a name="api-endpoints"></a>🔌 **6. API Endpoints**

### **Endpoint 1: POST /api/cart/add-workshop**

**Purpose:** Add workshop to cart

**Request:**
```typescript
POST /api/cart/add-workshop
Content-Type: application/json

{
  "appointmentId": "660c0h4d3e4f5g6h7i8j9k0l",
  "workshopSlug": "kombucha",
  "guestCount": 3
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Workshop added to cart",
  "cartItem": {
    "id": "cart-item-abc123",
    "workshop": {
      "id": "640a8f2b1c2d3e4f5g6h7i8j",
      "title": "Kombucha"
    },
    "appointment": {
      "id": "660c0h4d3e4f5g6h7i8j9k0l",
      "dateTime": "2026-05-15T14:00:00Z",
      "location": "Berlin Studio"
    },
    "guestCount": 3,
    "unitPrice": 99,
    "totalPrice": 297
  }
}
```

**Response (Not Enough Spots - 409):**
```json
{
  "success": false,
  "error": "Not enough spots available",
  "availableSpots": 2,
  "requestedGuests": 4
}
```

**Response (Not Found - 404):**
```json
{
  "success": false,
  "error": "Appointment not found"
}
```

**Response (Validation Error - 400):**
```json
{
  "success": false,
  "error": "Invalid request",
  "details": "Guest count must be between 1 and 12"
}
```

**Backend Logic:**
```typescript
export async function POST(req: Request) {
  const { appointmentId, guestCount } = await req.json()
  
  // 1. Validate input
  if (!appointmentId || !guestCount) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
  }
  if (guestCount < 1 || guestCount > 12) {
    return NextResponse.json({ success: false, error: 'Invalid guest count' }, { status: 400 })
  }
  
  // 2. Fetch appointment
  const appointment = await payload.findByID({
    collection: 'workshop-appointments',
    id: appointmentId
  })
  
  if (!appointment) {
    return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 })
  }
  
  // 3. Validate availability
  if (guestCount > appointment.availableSpots) {
    return NextResponse.json({
      success: false,
      error: 'Not enough spots',
      availableSpots: appointment.availableSpots,
      requestedGuests: guestCount
    }, { status: 409 })
  }
  
  // 4. Add to cart (using existing cart system)
  const cart = await getOrCreateCart(req)
  cart.items.push({
    appointment: appointmentId,
    quantity: guestCount,
    price: 99 * guestCount
  })
  await updateCart(cart)
  
  // 5. Return success
  return NextResponse.json({ success: true, cartItem: {...} })
}
```

---

## <a name="error-handling"></a>⚠️ **7. Error Handling**

### **Frontend Errors**

**Scenario 1: API call fails**
```
User clicks "Add to Cart"
  ↓
Fetch fails (network error, server error, etc.)
  ↓
Show toast/alert: "❌ Error adding to cart. Please try again."
  ↓
Modal stays open, "Add to Cart" button re-enabled
```

**Scenario 2: Not enough spots (race condition)**
```
User selects 3 guests (8 available)
  ↓
Meanwhile, other customers book 6 spots
  ↓
User clicks "Add to Cart"
  ↓
Backend returns 409: "Only 2 spots left"
  ↓
Show warning modal again: "Spots changed to 2"
  ↓
User can "Reduce to 2" or "Choose Different Date"
```

**Scenario 3: Appointment deleted**
```
User selects appointment
  ↓
Admin deletes it / hides it
  ↓
User clicks "Add to Cart"
  ↓
Backend returns 404: "Appointment not found"
  ↓
Show error: "This date is no longer available. Choose another."
```

### **Backend Validation**

| Error | HTTP | Cause | Action |
|-------|------|-------|--------|
| Missing fields | 400 | Invalid JSON | Reject, log |
| Out of range | 400 | guestCount < 1 or > 12 | Reject |
| Appointment not found | 404 | Invalid appointmentId | Reject |
| Not enough spots | 409 | guestCount > availableSpots | Reject (frontend handles gracefully) |
| Server error | 500 | Database/code error | Log, return generic error to user |

---

## <a name="payment-phase-2"></a>💳 **8. Payment Integration (Phase 2 — When Stripe Keys Arrive)**

### **Flow Addition (Not implemented yet)**

```
Step 7: "Add to Cart" succeeds
  ↓
Step 8: Customer goes to /cart
  ↓
Step 9: Click "Checkout"
  ↓
Step 10: STRIPE PAYMENT FORM (NEW in Phase 2)
  - Show Stripe payment element
  - Collect card details
  - Create PaymentIntent on backend
  ↓
Step 11: Customer pays
  ↓
Step 12: STRIPE WEBHOOK (NEW in Phase 2)
  - Receive payment_intent.succeeded
  - Mark BookingOrder as "paid"
  - Reduce WorkshopAppointments.availableSpots
  - Send confirmation email with booking code & QR
  ↓
Step 13: Email confirmation with
  - Booking code (e.g., KOMBUCHA-BOOKING-A1B2C3)
  - QR code linking to `/verify-booking?token=ABC`
  - Date, time, location of workshop
  - What's included
  - "See you soon!"
```

**What Changes for Phase 2:**
- Create `/api/stripe/create-payment-intent` endpoint
- Create `/api/stripe/webhooks/payment_intent.succeeded` handler
- Modify `/checkout` page to show Stripe form
- Create `BookingOrders` collection (to track orders post-payment)
- Set up email service (Resend/Brevo)
- Reduce `availableSpots` on payment success

**Nothing changes for Phase 1:**
- Appointments work as-is
- Cart items are created
- No payment processing

---

## <a name="testing"></a>✅ **9. Testing Strategy**

### **Unit Tests**

**Test 1: Available Spots Validation**
```typescript
describe('WorkshopAppointments validation', () => {
  it('should reject availableSpots > 12', async () => {
    const result = await payload.create({
      collection: 'workshop-appointments',
      data: { ..., availableSpots: 15 }
    })
    expect(result).toThrow('availableSpots cannot exceed maxCapacityPerSlot')
  })
  
  it('should reject past dateTime', async () => {
    const result = await payload.create({
      collection: 'workshop-appointments',
      data: { ..., dateTime: new Date('2024-01-01') }
    })
    expect(result).toThrow('Cannot create appointment in the past')
  })
})
```

### **Integration Tests**

**Test 2: Add to Cart - Valid Request**
```typescript
it('should add workshop to cart with valid guest count', async () => {
  const response = await fetch('/api/cart/add-workshop', {
    method: 'POST',
    body: JSON.stringify({
      appointmentId: validId,
      workshopSlug: 'kombucha',
      guestCount: 3
    })
  })
  
  expect(response.status).toBe(200)
  const data = await response.json()
  expect(data.success).toBe(true)
  expect(data.cartItem.guestCount).toBe(3)
})
```

**Test 3: Add to Cart - Not Enough Spots**
```typescript
it('should return 409 when guestCount exceeds availableSpots', async () => {
  const response = await fetch('/api/cart/add-workshop', {
    method: 'POST',
    body: JSON.stringify({
      appointmentId: lowSpotsId,  // only 2 spots
      workshopSlug: 'kombucha',
      guestCount: 4  // requesting 4
    })
  })
  
  expect(response.status).toBe(409)
  const data = await response.json()
  expect(data.error).toContain('Not enough spots')
})
```

### **Manual (E2E) Tests**

**Scenario A: Happy Path**
```
1. Visit /workshops/kombucha
2. Click "View Dates"
3. See 4-5 appointments with different availabiliti
4. Click "Book" on May 15 (8 spots available)
5. Modal opens, shows date, time, 8 available
6. Adjust guest count to 3 (spinner works, total updates)
7. Click "Add to Cart"
8. Toast shows "Added to cart!"
9. Visit /cart, see workshop item with 3 guests, €297
```

**Scenario B: Overbooking**
```
1. Visit /workshops/lakto
2. Click "View Dates"
3. Click "Book" on May 18 (2 spots available)
4. Modal opens
5. Adjust guest count to 4 (more than available)
6. Warning modal appears: "Only 2 spots available"
7. Click "Reduce to 2 Guests"
8. Guest count auto-sets to 2
9. "Add to Cart" button becomes enabled
10. Click "Add to Cart" → success
```

**Scenario C: Date Hidden by Admin**
```
1. Admin: Go to /admin/workshop-appointments
2. Uncheck "Published" for May 15
3. Customer: Refresh /workshops/kombucha
4. May 15 is gone from the list
5. Can only see other dates
```

---

## 📚 **Appendix: File Checklist**

| File | Status | Notes |
|------|--------|-------|
| `src/collections/Workshops.ts` | NEW | Collection definition |
| `src/collections/WorkshopLocations.ts` | NEW | Collection definition |
| `src/collections/WorkshopAppointments.ts` | NEW | Collection definition (most critical) |
| `src/collections/Vouchers.ts` | NEW | Optional, can defer |
| `src/payload.config.ts` | MODIFIED | Import + register 4 collections |
| `src/app/(app)/workshops/[slug]/BookingModal.tsx` | MODIFIED | Add guest count + warning modal |
| `src/app/(app)/workshops/[slug]/KombuchaBookingCard.tsx` | MODIFIED | Fetch appointments, pass to modal |
| `src/app/(app)/workshops/[slug]/LaktoBookingCard.tsx` | MODIFIED | Same as Kombucha |
| `src/app/(app)/workshops/[slug]/TempehBookingCard.tsx` | MODIFIED | Same as Kombucha |
| `src/app/(app)/workshops/[slug]/page.tsx` | MODIFIED | Fetch appointments from DB |
| `src/app/api/cart/add-workshop/route.ts` | NEW | Backend endpoint |
| `src/scripts/seed-workshops.ts` | NEW | Optional seed script |
| `src/scripts/seed-workshop-locations.ts` | NEW | Optional seed script |
| `src/scripts/seed-workshop-appointments.ts` | NEW | Optional seed script |

---

## 🎯 **Success Metrics**

**Phase 1 Complete:**
- ✅ 4 collections registered in Payload
- ✅ Admin can create/edit appointments in /admin
- ✅ pnpm generate:types passes
- ✅ TypeScript has no errors

**Phase 2 Complete:**
- ✅ BookingModal shows guest count selector
- ✅ Availability warning modal works
- ✅ /api/cart/add-workshop endpoint works
- ✅ Frontend fetches appointments from DB
- ✅ Full user journey works: Select date → Choose guests → Add to cart

**Overall:**
- ✅ No hardcoded dates left in frontend
- ✅ Admin controls all availability
- ✅ Real-time validation (can't book >12, can't exceed spots)
- ✅ Cart integration complete
- ✅ Ready for Phase 2 (Stripe + email)

---

**Ready to implement? Start with Phase 1! 🚀**
