# Workshop Booking System — Quick Start Guide

## ✅ What's Already Set Up

### **4 Workshops** (in the database)
- 🧪 **Fermentation Basics** — Introduction workshop
- 🍵 **Kombucha** — Tea fermentation
- 🥬 **Lakto-fermentiertes Gemüse** — Vegetable fermentation
- 🫘 **Tempeh** — Soy fermentation

Each workshop: €99, max 12 people

### **1 Location** (real address from ferment-freude.at)
- 📍 **Ginery**
- Grabenstraße 15, 8010 Graz, Österreich
- Timezone: Europe/Vienna

### **Images**
- ✓ Kombucha workshop image (3.3MB → 62KB, optimized)
- ✓ Lakto workshop image (6.9MB → 157KB, optimized)
- ✓ Tempeh workshop image (6.6MB → 117KB, optimized)

---

## 🚀 Adding Workshop Dates

### **Method 1: Via Admin Interface** (easiest for David & Marcel)

1. Go to http://localhost:3000/admin
2. Click **"Workshop Appointments"** in sidebar
3. Click **"Create New"**
4. Fill in:
   - **Workshop**: Dropdown → Select "Kombucha" / "Lakto" / "Tempeh"
   - **Location**: Dropdown → Select "Ginery"
   - **Date & Time**: Pick date + time (e.g., April 15, 2026, 14:00)
   - **Available Spots**: Number 1-12
   - **Published**: ✓ Check to show on website
   - **Notes** (optional): Any internal notes
5. Click **"Save"**

**Done!** Repeat for each date you want to add.

---

### **Method 2: Via Command Line** (faster for bulk adding)

Use the helper script:

```bash
npx tsx src/scripts/add-workshop-dates.ts <workshop> "<date-time>" <spots>
```

**Examples:**

```bash
# Kombucha on April 12, 2026 at 2:00 PM (10 spots)
npx tsx src/scripts/add-workshop-dates.ts kombucha "2026-04-12 14:00" 10

# Lakto on April 15, 2026 at 10:00 AM (12 spots)
npx tsx src/scripts/add-workshop-dates.ts lakto "2026-04-15 10:00" 12

# Tempeh on April 20, 2026 at 4:00 PM (8 spots)
npx tsx src/scripts/add-workshop-dates.ts tempeh "2026-04-20 16:00" 8
```

**Arguments:**
- `<workshop>`: `kombucha` | `lakto` | `tempeh` | `basics`
- `<date-time>`: `"YYYY-MM-DD HH:MM"` (24-hour format, quotes required!)
- `<spots>`: Number 1-12

---

## 📅 Getting Real Dates from Old Website

The old website has booking calendars:
- **Kombucha**: https://www.ferment-freude.at/booking-calendar/kombucha
- **Lakto**: https://www.ferment-freude.at/booking-calendar/lakto-gem%C3%BCse
- **Tempeh**: https://www.ferment-freude.at/booking-calendar/tempeh

The calendars show which dates have availability (they're interactive with JavaScript, so I couldn't scrape them automatically).

**To transfer dates:**
1. Visit each calendar on the old site
2. Note the available dates/times
3. Add them via admin interface or command line script

---

## 🔧 How It Works

### **Collections:**

| Collection | What it stores | How often you create |
|---|---|---|
| **Workshops** | Workshop metadata (title, description, price, image) | **Once per type** ✅ Already done! |
| **Workshop Locations** | Location details (name, address, timezone) | **Once per location** ✅ Ginery done! |
| **Workshop Appointments** | Specific date/time/availability for a workshop | **Every time you add a date** 🔄 |

### **Understanding the flow:**
```
Workshop (Kombucha)
   ↓
Location (Ginery)
   ↓
Appointment #1: April 12, 14:00, 10 spots
Appointment #2: April 15, 10:00, 12 spots
Appointment #3: April 20, 16:00, 8 spots
```

Each **appointment** = one workshop session at a specific date/time/place.

---

## 📝 Example: Adding a Full Week

Let's say you want to add these workshops in April 2026:

```bash
# Monday: Kombucha
npx tsx src/scripts/add-workshop-dates.ts kombucha "2026-04-13 14:00" 12

# Wednesday: Lakto
npx tsx src/scripts/add-workshop-dates.ts lakto "2026-04-15 10:00" 10

# Friday: Tempeh
npx tsx src/scripts/add-workshop-dates.ts tempeh "2026-04-17 16:00" 8

# Saturday morning: Kombucha
npx tsx src/scripts/add-workshop-dates.ts kombucha "2026-04-18 10:00" 12

# Saturday afternoon: Lakto
npx tsx src/scripts/add-workshop-dates.ts lakto "2026-04-18 14:00" 12
```

Or add them one by one in `/admin` — whichever is easier!

---

## ✅ Verification

After adding dates, check:
1. Visit http://localhost:3000/admin/collections/workshop-appointments
2. You should see all appointments listed
3. Click one to view/edit details

---

## 🎯 Next Phase: Frontend Integration

Once appointments are in the database, **Phase 2** will:
1. Fetch appointments from DB (not hardcoded dates)
2. Display them on `/workshops/kombucha`, `/workshops/lakto`, `/workshops/tempeh`
3. Let users click "Book" → select guest count → add to cart
4. Stripe checkout flow

**But right now**, you can fully manage workshops from the admin interface! 🎉

---

## 🆘 Troubleshooting

**Problem**: "Workshop not found"
- Run: `pnpm seed workshop-collections` to create workshops

**Problem**: "Location not found"
- Run: `pnpm seed workshop-collections` to create Ginery location

**Problem**: Date validation error ("Cannot create appointment in past")
- Make sure date is **after March 9, 2026** (current date in the project)

**Problem**: Spots validation error ("Max 12 spots per workshop")
- Use a number between 1-12 only

---

## 📚 Files Reference

- **Collections**: `src/collections/Workshops.ts`, `WorkshopLocations.ts`, `WorkshopAppointments.ts`
- **Seed script**: `src/scripts/seed-workshop-collections.ts`
- **Date helper**: `src/scripts/add-workshop-dates.ts`
- **Documentation**: `docs/BOOKING_SYSTEM_TECHNICAL_PLAN.md`
