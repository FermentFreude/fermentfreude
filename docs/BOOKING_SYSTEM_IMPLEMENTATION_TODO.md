# FermentFreude Booking System — Step-by-Step Implementation TODO

**Project:** Add cart-based workshop booking system with availability management
**Timeline:** Phase-based (can complete in 1-2 days)
**Workshop Price:** €99 (not €79)
**Max Capacity per Workshop:** 12 persons per slot

---

## 📋 **PHASE 1: Backend Collections & Database**

### Step 1.1: Create Workshops Collection
**File:** `src/collections/Workshops.ts`

**Schema:**
```typescript
{
  slug: string (unique, required) — 'kombucha', 'lakto', 'tempeh', 'basics'
  title: string (localized: true, required)
  description: string (richText, localized: true)
  basePrice: number (default: 99) ← CRITICAL: €99, NOT €79
  maxCapacityPerSlot: number (default: 12, read-only in admin)
  image: upload (relationTo: 'media')
  isActive: checkbox (default: true)
}
```

**Admin UI:**
- useAsTitle: 'title'
- defaultColumns: ['title', 'basePrice', 'maxCapacityPerSlot', 'isActive']
- admin.description: "Define workshop metadata. Price and capacity apply to all dates."

**Checklist:**
- [ ] File created with full schema
- [ ] All fields marked `localized: true` where text
- [ ] basePrice hardcoded as 99 (or configurable, but default 99)
- [ ] Validation: basePrice > 0, maxCapacityPerSlot ≤ 12

---

### Step 1.2: Create WorkshopLocations Collection
**File:** `src/collections/WorkshopLocations.ts`

**Schema:**
```typescript
{
  name: string (localized: true, required) — 'Berlin Studio', 'Munich Workshop', etc.
  address: string (required)
  timezone: string (optional, e.g., 'Europe/Berlin')
  isActive: checkbox (default: true)
  createdAt: auto
  updatedAt: auto
}
```

**Admin UI:**
- useAsTitle: 'name'
- defaultColumns: ['name', 'address', 'isActive']
- admin.description: "Workshop locations. Used to organize appointments by geography."

**Checklist:**
- [ ] File created
- [ ] name is localized for multi-language support
- [ ] Can be created/edited freely by admins

---

### Step 1.3: Create WorkshopAppointments Collection ⭐ (THE HUB)
**File:** `src/collections/WorkshopAppointments.ts`

**Schema:**
```typescript
{
  workshop: relationship (relationTo: 'workshops', required)
  location: relationship (relationTo: 'workshop-locations', required)
  dateTime: date (required, no past dates) + time (required)
  availableSpots: number (min: 0, max: depends on workshop.maxCapacityPerSlot, default: 12)
  isPublished: checkbox (default: true — hide from frontend if false)
  notes: string (optional, for admin notes)
  createdAt: auto
  updatedAt: auto
}
```

**Validation Hooks:**
1. **beforeValidate:**
   - dateTime cannot be in the past
   - availableSpots cannot exceed workshop.maxCapacityPerSlot (12)

2. **Custom Indexes:**
   - Unique index: (workshop, location, dateTime) — no duplicate slots

**Admin UI:**
- useAsTitle: `(doc) => ${doc.workshop.title} – ${doc.location.name} – ${formatDate(doc.dateTime)}`
- defaultColumns: ['workshop', 'location', 'dateTime', 'availableSpots', 'isPublished']
- admin.description: "Manage workshop availability. **This is where you control dates, times, and available spots.** Changes here instantly update the booking pages."
- Custom admin view: Table grouped by workshop (optional nice-to-have)

**Checklist:**
- [ ] File created with full schema
- [ ] beforeValidate hook prevents past dates
- [ ] beforeValidate hook prevents availableSpots > 12
- [ ] Unique compound index (workshop, location, dateTime)
- [ ] availableSpots field is easy to edit in admin list view

---

### Step 1.4: Create Vouchers Collection (Optional, for future)
**File:** `src/collections/Vouchers.ts`

**Schema:**
```typescript
{
  code: string (unique, required, generated) — e.g., 'KOMBUCHA-GIFT-ABC123'
  workshop: relationship (relationTo: 'workshops', required)
  value: number (required, default: 99)
  redeemed: checkbox (default: false, read-only in admin)
  redeemedOn: date (auto on redemption, read-only)
  redeemedBy: relationship (relationTo: 'users', optional, read-only)
  notes: string (optional)
  createdAt: auto
  updatedAt: auto
}
```

**Admin UI:**
- useAsTitle: 'code'
- defaultColumns: ['code', 'workshop', 'value', 'redeemed', 'redeemedOn']
- admin.description: "Vouchers can be purchased as products and redeemed on the /redeem-voucher page."

**Checklist:**
- [ ] File created (can be deferrable to Phase 2)
- [ ] Code auto-generated on creation
- [ ] redeemed field read-only (updated via hook on redemption)

---

### Step 1.5: Update Payload Config
**File:** `src/payload.config.ts`

**Changes:**
1. Import 4 new collections:
   ```typescript
   import { WorkshopsCollection } from '@/collections/Workshops'
   import { WorkshopLocationsCollection } from '@/collections/WorkshopLocations'
   import { WorkshopAppointmentsCollection } from '@/collections/WorkshopAppointments'
   import { VouchersCollection } from '@/collections/Vouchers'
   ```

2. Add to `collections` array:
   ```typescript
   collections: [
     WorkshopsCollection,
     WorkshopLocationsCollection,
     WorkshopAppointmentsCollection,
     VouchersCollection,
     // ... existing collections
   ]
   ```

**Checklist:**
- [ ] All 4 imports added
- [ ] All 4 added to collections array in correct order
- [ ] No duplicate slugs

---

### Step 1.6: Generate Payload Types
**Terminal:**
```bash
pnpm generate:types
pnpm generate:importmap
npx tsc --noEmit
```

**Checklist:**
- [ ] `pnpm generate:types` runs without errors
- [ ] `npx tsc --noEmit` has zero TS errors
- [ ] payload-types.ts includes Workshop, WorkshopLocation, WorkshopAppointment, Voucher types

---

### Step 1.7: Create Seed Scripts (Optional, Recommended)
**Files:**
- `src/scripts/seed-workshops.ts`
- `src/scripts/seed-workshop-locations.ts`
- `src/scripts/seed-workshop-appointments.ts`

**seed-workshops.ts:**
```typescript
// German + English versions:
// - Kombucha, Lakto Gemüse, Tempeh, Basics
// - basePrice: 99
// - maxCapacityPerSlot: 12
```

**seed-workshop-locations.ts:**
```typescript
// Example locations:
// - Berlin Studio
// - Munich Workspace
// (or leave empty, add manually in admin)
```

**seed-workshop-appointments.ts:**
```typescript
// Create 4-6 sample appointments for each workshop
// Dates: Next 3 months from today (March 9, 2026)
// availableSpots: 8-12 (mixed)
// Time range: 10:00-13:00, 14:00-17:00
```

**Register in `seed-all.ts`:**
```typescript
export const seeds = {
  'workshops': () => import('./seed-workshops'),
  'workshop-locations': () => import('./seed-workshop-locations'),
  'workshop-appointments': () => import('./seed-workshop-appointments'),
}
```

**Run:**
```bash
pnpm seed workshops
pnpm seed workshop-locations
pnpm seed workshop-appointments
```

**Checklist:**
- [ ] seed-workshops.ts created (bilingual: de + en)
- [ ] seed-workshop-locations.ts created
- [ ] seed-workshop-appointments.ts created (dates, times, spots)
- [ ] Registered in seed-all.ts
- [ ] Seeds run without errors
- [ ] Data visible in `/admin` collections

---

## 🎨 **PHASE 2: Frontend Component Updates**

### Step 2.1: Update BookingModal.tsx
**File:** `src/app/(app)/workshops/[slug]/BookingModal.tsx`

**New Props:**
```typescript
type BookingModalProps = {
  workshop: WorkshopDetailData
  selectedDate: WorkshopDate & {
    appointmentId: string  // from WorkshopAppointments._id
    availableSpots: number  // from WorkshopAppointments.availableSpots
  }
  maxCapacity: number  // from workshop.maxCapacityPerSlot (12)
  onClose: () => void
  onConfirm: (guestCount: number) => Promise<void>  // CHANGED signature
  onSelectDifferentDate: () => void  // NEW
}
```

**New State:**
```typescript
const [guestCount, setGuestCount] = useState(1)
const [showWarning, setShowWarning] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)

const canBook = guestCount <= selectedDate.availableSpots
const spotsRemaining = selectedDate.availableSpots - guestCount
```

**New UI Elements:**

1. **Guest Count Selector** (above price):
   ```
   ┌─────────────────────────┐
   │ How Many People?        │
   │ [−] 1 [+]              │ (min: 1, max: 12)
   │                         │
   │ Available for this date: 2 spots
   │                         │
   │ ⚠️ WARNING (if needed):  │
   │ You selected 4, but     │
   │ only 2 spots available. │
   │ [Choose Date] [Reduce]  │
   └─────────────────────────┘
   ```

2. **Availability Warning Modal** (overlay if count > spots):
   ```
   ┌─────────────────────────────────────┐
   │ Not Enough Spots                    │
   │                                     │
   │ You want 4 people, but only 2 spots │
   │ are available for May 15.            │
   │                                     │
   │ What would you like to do?          │
   │                                     │
   │ [Choose Different Date]             │
   │ [Reduce to 2 Guests]                │
   └─────────────────────────────────────┘
   ```

3. **Total Price Calculation:**
   ```
   Total: €99 × 4 = €396
   ```

4. **"Add to Cart" Button:**
   - Disabled if `guestCount > availableSpots`
   - Text: "Add to Cart" (not "Confirm Booking")
   - On click: `await onConfirm(guestCount)` + toast

**Logic Flow:**

```typescript
// Guest count change
const handleGuestCountChange = (newCount: number) => {
  const clamped = Math.max(1, Math.min(newCount, maxCapacity)) // 1-12
  setGuestCount(clamped)
  
  // Check availability
  if (clamped > selectedDate.availableSpots) {
    setShowWarning(true)
  }
}

// Warning modal: reduce
const handleReduceToAvailable = () => {
  setGuestCount(selectedDate.availableSpots)
  setShowWarning(false)
}

// Warning modal: choose different date
const handleChooseDifferentDate = () => {
  setShowWarning(false)
  onSelectDifferentDate() // parent closes modal, keeps dates visible
}

// Add to cart
const handleAddToCart = async () => {
  if (!canBook) return
  setIsSubmitting(true)
  try {
    await onConfirm(guestCount)
  } finally {
    setIsSubmitting(false)
  }
}
```

**Checklist:**
- [ ] New props added (appointmentId, availableSpots, maxCapacity, onSelectDifferentDate)
- [ ] Guest count state added
- [ ] Guest count spinner UI added (− / number / +)
- [ ] Clamps between 1 and maxCapacity (12)
- [ ] Warning modal UI added
- [ ] Warning modal logic: show if guestCount > availableSpots
- [ ] Total price calculation: basePrice × guestCount
- [ ] "Add to Cart" button disabled until valid count
- [ ] Loading state during submit
- [ ] All styling matches existing design

---

### Step 2.2: Update KombuchaBookingCard.tsx
**File:** `src/app/(app)/workshops/[slug]/KombuchaBookingCard.tsx`

**Changes to existing code:**

1. **Modify `cmsDates` to include new fields:**
   ```typescript
   const cmsDates: WorkshopDate[] =
     (cms?.dates?.length ?? 0) > 0
       ? cms!.dates!.map((d, i) => ({
           id: d.id ?? `cms-${i}`,
           date: d.date ?? '',
           time: d.time ?? '',
           spotsLeft: d.spotsLeft ?? 0,
           appointmentId: d.appointmentId ?? '', // NEW
           availableSpots: d.spotsLeft ?? 0,      // NEW (same as spotsLeft for now)
         }))
       : DEFAULT_DATES
   ```

2. **Update BookingModal invocation:**
   ```typescript
   // Old:
   <BookingModal
     workshop={mergedWorkshop}
     selectedDate={bookingDate}
     onClose={() => setBookingDate(null)}
     onConfirm={() => {
       alert(`Booking confirmed for ${bookingDate.date}!`)
       setBookingDate(null)
     }}
   />
   
   // New:
   <BookingModal
     workshop={mergedWorkshop}
     selectedDate={bookingDate}
     maxCapacity={mergedWorkshop.maxCapacity ?? 12}
     onClose={() => setBookingDate(null)}
     onConfirm={async (guestCount) => {
       await addWorkshopToCart({
         appointmentId: bookingDate.appointmentId,
         workshopSlug: 'kombucha',
         guestCount
       })
       setBookingDate(null)
     }}
     onSelectDifferentDate={() => {
       setShowDates(true) // Keep dates expanded
     }}
   />
   ```

3. **Add `addWorkshopToCart` function (or import from utility):**
   ```typescript
   const addWorkshopToCart = async (params: {
     appointmentId: string
     workshopSlug: string
     guestCount: number
   }) => {
     const response = await fetch('/api/cart/add-workshop', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(params)
     })
     
     if (!response.ok) {
       throw new Error('Failed to add to cart')
     }
     
     const data = await response.json()
     // Show toast: "Added to cart!"
     // or redirect to /cart
   }
   ```

**DO NOT CHANGE:**
- Card layout (dark header, attributes, buttons, dates list, details sections, experience cards)
- Any styling or typography
- The `handleToggleDates`, `handleToggleInfo` logic
- The experience cards section

**Checklist:**
- [ ] cmsDates updated with appointmentId and availableSpots
- [ ] BookingModal props updated (maxCapacity, onSelectDifferentDate)
- [ ] onConfirm signature changed to accept guestCount
- [ ] addWorkshopToCart function added or imported
- [ ] Error handling for API calls
- [ ] Toast/notification on success (optional)
- [ ] Tests: Can select date → modal opens → adjust guests → "Add to Cart" works

---

### Step 2.3: Apply Same Changes to LaktoBookingCard & TempehBookingCard
**Files:**
- `src/app/(app)/workshops/[slug]/LaktoBookingCard.tsx`
- `src/app/(app)/workshops/[slug]/TempehBookingCard.tsx`

**Copy-paste the following from KombuchaBookingCard:**
- cmsDates mapping (with appointmentId, availableSpots)
- BookingModal invocation (all new props + onConfirm logic)
- addWorkshopToCart function

**Checklist:**
- [ ] LaktoBookingCard updated (same as Kombucha)
- [ ] TempehBookingCard updated (same as Kombucha)
- [ ] Both use correct workshop slug ('lakto' vs 'tempeh')
- [ ] Both call same `/api/cart/add-workshop` endpoint

---

### Step 2.4: Update [slug]/page.tsx to Fetch Appointments
**File:** `src/app/(app)/workshops/[slug]/page.tsx`

**Add new utility function:**
```typescript
async function getWorkshopAppointments(workshopId: string) {
  const payload = await getPayload()
  const appointments = await payload.find({
    collection: 'workshop-appointments',
    where: {
      workshop: { equals: workshopId },
      isPublished: { equals: true }
    },
    sort: 'dateTime'
  })
  
  return appointments.docs.map(apt => ({
    id: apt.id,
    date: formatDate(apt.dateTime),      // "7. März 2026"
    time: formatTime(apt.dateTime),      // "14:00 – 17:00"
    spotsLeft: apt.availableSpots,
    appointmentId: apt.id,
    availableSpots: apt.availableSpots
  }))
}
```

**Modify page component:**
```typescript
// In the page function, before rendering:
const appointments = await getWorkshopAppointments(workspaceId)

// Pass to booking cards:
<KombuchaBookingCard cms={{ ...page.workshopDetail, dates: appointments }} />
```

**Checklist:**
- [ ] getWorkshopAppointments function created
- [ ] Fetches from 'workshop-appointments' collection
- [ ] Filters by workshop ID + isPublished
- [ ] Formats dates/times properly
- [ ] Passes appointments to each booking card
- [ ] Falls back to DEFAULT_DATES if no DB appointments

---

## 🔌 **PHASE 3: Backend API Endpoints**

### Step 3.1: Create /api/cart/add-workshop Endpoint
**File:** `src/app/api/cart/add-workshop/route.ts`

**Request:**
```typescript
POST /api/cart/add-workshop
Content-Type: application/json

{
  "appointmentId": "65a1b2c3d4e5f6g7h8i9",
  "workshopSlug": "kombucha",
  "guestCount": 4
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Added to cart",
  "cartItem": {
    "id": "cart-item-id",
    "workshop": { "id": "...", "title": "Kombucha" },
    "appointment": { "id": "...", "dateTime": "2026-05-15T14:00" },
    "guestCount": 4,
    "totalPrice": 396
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Not enough spots available",
  "message": "Only 2 spots left, but you requested 4"
}
```

**Logic:**
```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { appointmentId, workshopSlug, guestCount } = body
    
    // Validate input
    if (!appointmentId || !workshopSlug || !guestCount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (guestCount < 1 || guestCount > 12) {
      return NextResponse.json(
        { success: false, error: 'Guest count must be 1-12' },
        { status: 400 }
      )
    }
    
    // Fetch appointment to verify spots
    const payload = await getPayload()
    const appointment = await payload.findByID({
      collection: 'workshop-appointments',
      id: appointmentId
    })
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }
    
    // Check availability
    if (guestCount > appointment.availableSpots) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not enough spots',
          availableSpots: appointment.availableSpots,
          requestedGuests: guestCount
        },
        { status: 409 }
      )
    }
    
    // Get/create cart (from existing cart system)
    const cart = await getOrCreateCart()
    
    // Add item to cart
    const cartItem = {
      appointment: appointmentId,
      quantity: guestCount,
      price: (await getWorkshopPrice(appointment.workshop)) * guestCount
    }
    
    cart.items.push(cartItem)
    await updateCart(cart)
    
    return NextResponse.json({
      success: true,
      message: 'Added to cart',
      cartItem
    })
    
  } catch (error) {
    console.error('Error adding workshop to cart:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Checklist:**
- [ ] File created at exact path
- [ ] Input validation (appointmentId, guestCount, 1-12 range)
- [ ] Fetches appointment from DB
- [ ] Re-checks availability (backend validation)
- [ ] Integrates with existing cart system
- [ ] Returns proper error responses
- [ ] No Stripe/payment yet (just adds to cart)

---

### Step 3.2: Create /api/verify-booking (Optional, for QR code later)
**File:** `src/app/api/verify-booking/route.ts`

**Purpose:** Verify booking at workshop entry with token

**For Phase 2, can defer this.**

**Checklist:**
- [ ] Deferrable to Phase 2 (after payment integration)

---

## 📱 **PHASE 4: Testing & Verification**

### Step 4.1: Manual Testing — Phase 1 (Collections)
```
Checklist:
- [ ] Visit http://localhost:3000/admin
- [ ] Can create a Workshop (slug, title in DE + EN, price 99, capacity 12)
- [ ] Can create a WorkshopLocation (name, address)
- [ ] Can create a WorkshopAppointment (workshop, location, date, time, availableSpots)
- [ ] Appointment is visible in list view
- [ ] Can edit availableSpots (e.g., 8 → 5) and see it update
- [ ] Cannot create appointment with availableSpots > 12 (validation error)
- [ ] Cannot create past-dated appointment (validation error)
```

### Step 4.2: Manual Testing — Phase 2 (Frontend)
```
Checklist:
- [ ] Visit /workshops/kombucha
- [ ] See booking card with expanded dates (from SeedData for now)
- [ ] Click "Buchen" on a date → BookingModal opens
- [ ] Modal shows: date, time, available spots, guest count selector
- [ ] Adjust guest count (−/+) → total price updates
- [ ] Select more guests than available → warning modal appears
- [ ] Click "Reduce to [n] Guests" → count auto-adjusts
- [ ] Click "Choose Different Date" → modal closes, dates list stays open
- [ ] Select valid guest count → "Add to Cart" button enabled
- [ ] Click "Add to Cart" → API called, success response
```

### Step 4.3: Manual Testing — Phase 3 (API)
```
Checklist:
- [ ] Use Postman/curl to POST /api/cart/add-workshop
- [ ] Body: { appointmentId: "...", workshopSlug: "kombucha", guestCount: 4 }
- [ ] Response: { success: true, cartItem: {...} }
- [ ] Try with guestCount > availableSpots → gets 409 error
- [ ] Try with invalid appointmentId → gets 404 error
```

### Step 4.4: Integration Test
```
User Journey:
1. Visit /workshops/kombucha
2. Expand dates, see 3-4 sample appointments
3. Click "Buchen" on April 4, 14:00 (example)
4. Modal opens, shows: April 4, 14:00, 10 spots available
5. Adjust to 3 guests → €99 × 3 = €297
6. Click "Add to Cart"
7. Toast: "Added to cart!" (or redirect to cart)
8. Visit /cart → See workshop item:
   - Kombucha Workshop
   - April 4, 14:00
   - 3 guests
   - €297
9. Can proceed to checkout (Stripe comes later)
```

---

## 🎯 **SUCCESS CRITERIA**

**Phase 1 Complete:**
- ✅ 4 collections created in Payload
- ✅ Admin can manage appointments in /admin/collections/workshop-appointments
- ✅ availableSpots field editable, validated (max 12)

**Phase 2 Complete:**
- ✅ BookingModal shows guest count selector
- ✅ Availability warning modal works
- ✅ BookingCard fetches dates from DB (not hardcoded)
- ✅ All texts remain in German (or localized)
- ✅ UI styling unchanged

**Phase 3 Complete:**
- ✅ /api/cart/add-workshop endpoint exists
- ✅ Backend re-validates availability
- ✅ Workshop item added to cart
- ✅ Cart system treats workshop like a product (quantity = guests)

**Overall:**
- ✅ Full user flow works: Select date → Set guests → Availability check → Add to cart
- ✅ Admin can control all dates/availability from one place
- ✅ No hardcoded dates in frontend
- ✅ Price fixed at €99 per person
- ✅ All error handling in place

---

## ⏱️ **ESTIMATED TIMELINE**

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | Collections (4 files) | 30 min | Not Started |
| 1 | Seed scripts | 20 min | Not Started |
| 1 | Type generation + verification | 10 min | Not Started |
| 2 | BookingModal update | 45 min | Not Started |
| 2 | KombuchaBookingCard + apply to Lakto/Tempeh | 30 min | Not Started |
| 2 | [slug]/page.tsx update + fetch appointments | 20 min | Not Started |
| 3 | /api/cart/add-workshop endpoint | 30 min | Not Started |
| 4 | Manual testing + bug fixes | 45 min | Not Started |
| | **TOTAL** | **~3.5 hours** | |

---

## 📝 **NOTES**

- **€99 Price:** All workshops fixed at €99. Can be overridden per workshop in admin if needed later.
- **Import statements:** Use `@/` alias for all imports from `src/`
- **Localization:** All text fields should have `localized: true` (German default, English fallback)
- **Error handling:** Client shows toast/alert, backend logs errors
- **Cart Integration:** Use existing cart system (from ecommerce template)
- **Stripe:** Completely defer to Phase 2 (when founders provide keys)
- **Email:** Completely defer to Phase 2 (after Stripe)

---

**Ready to start? Pick a phase and let's go! 🚀**
