# 🎓 FermentFreude Booking System — Founder's Guide

**For:** David & Marcel (Founders)  
**Topic:** How the new workshop booking system works  
**Updated:** March 9, 2026

---

## 🎯 **What Changed?**

**Before:** Booking dates were hardcoded in our website code.  
**Now:** You manage all workshop dates, times, and available spots in one simple admin panel, and they automatically appear everywhere on the website. 🎉

---

## 📋 **For You: Admin Dashboard**

### Go to: `/admin` → Workshops

You now have **two important places** to manage workshops:

#### **1. Workshops** (The Master List)
Each workshop has basic info:
- Name (German + English)
- Price (€99 per person)
- Max capacity: **12 people per workshop time slot**
- Image

**You don't need to change anything here usually.** It's just the definition of the workshop.

Example:
```
Kombucha Workshop
Price: €99 per Person
Max Capacity: 12 people per slot
```

#### **2. Workshop Appointments** ⭐ (WHERE THE MAGIC HAPPENS)
**This is where you control everything.**

Each "Appointment" is one specific workshop session. You decide:
- Which workshop (Kombucha, Lakto, Tempeh, Basics)
- Which location (Berlin, Munich, etc.)
- **Date & Time** (e.g., May 15, 2026, 14:00 – 17:00)
- **Available Spots** (how many people can book this session)

Example:
```
┌─────────────────────────────────────────┐
│ Kombucha Workshop                       │
│ Berlin Studio                           │
│ May 15, 2026 at 14:00                   │
│ Available Spots: 8                      │
└─────────────────────────────────────────┘
```

**What happens when you change it?**
- You edit "Available Spots" from 8 → 5
- **Instantly**, the website shows "5 spots left" on that date
- Users can't book more than the spots available
- You can hide a session by unchecking "Published"

---

## 👥 **For Customers: The Booking Flow**

### **Step 1: Browse Workshop**
Customer visits `/workshops/kombucha` and sees:
- Workshop title, price (€99)
- "View Dates" button

### **Step 2: Select Date**
Customer clicks "View Dates" → sees all available sessions:
```
┌─────────────────────────────────────────┐
│ May 15, 2026                            │
│ 14:00 – 17:00                           │
│ 8 spots available                       │
│ [BOOK]                                  │
├─────────────────────────────────────────┤
│ May 22, 2026                            │
│ 10:00 – 13:00                           │
│ 2 spots available                       │
│ [BOOK]                                  │
└─────────────────────────────────────────┘
```

### **Step 3: Select Number of People**
Customer clicks [BOOK] → A popup appears asking:
```
┌─────────────────────────────────────────┐
│ How Many People?                        │
│ [−] 1 [+]  ← They can adjust from 1-12  │
│                                         │
│ Available for this date: 8 spots        │
│ Total: €99 × 1 = €99                    │
│                                         │
│ [Cancel] [Add to Cart]                  │
└─────────────────────────────────────────┘
```

**What if they try to book too many?**
- Example: They want 4 people, but only 2 spots left
- Popup warning: ⚠️ "Only 2 spots available for May 15"
- Buttons: "Choose Different Date" or "Reduce to 2 Guests"

### **Step 4: Add to Cart**
Customer clicks "Add to Cart" → 
- The workshop is added to their shopping cart
- They can keep shopping (buy fermented jars, etc.)

### **Step 5: Checkout**
Customer clicks "Go to Cart" → sees everything in one place:
```
┌─────────────────────────────────┐
│ SHOPPING CART                   │
├─────────────────────────────────┤
│ Kombucha Workshop (May 15 / 2 people) │
│ €99 × 2 = €198                  │
├─────────────────────────────────┤
│ Fermented Kraut (500g)          │
│ €15 × 1 = €15                   │
├─────────────────────────────────┤
│ TOTAL: €213                     │
│ [CHECKOUT]                      │
└─────────────────────────────────┘
```

### **Step 6: Payment** (Coming Soon!)
Customer pays via Stripe (card payment)

### **Step 7: Confirmation Email** (Coming Soon!)
After successful payment, customer receives email:
```
✅ Your Kombucha Workshop Booking is Confirmed!

Date: May 15, 2026
Time: 14:00 – 17:00
Location: Berlin Studio
Guests: 2 people
Amount Paid: €198

Your booking confirmation code: KOMBUCHA-BOOKING-A1B2C3

Show this code or scan the QR code at the workshop entrance.
```

---

## 🎁 **Bonus: Gift Vouchers** (For Later)

In the future, customers can also:

**1. Buy a Voucher** (like a gift card)
```
Customer buys: "Kombucha Workshop Voucher (€99)"
They receive: A unique voucher code (e.g., KOMBUCHA-GIFT-ABC123)
They give it to a friend
```

**2. Friend Redeems Voucher**
```
Friend goes to: /redeem-voucher
Enters code: KOMBUCHA-GIFT-ABC123
Selects: Date & time
System confirms: "Voucher applied! No payment needed."
Friend gets booking confirmation
```

---

## 📊 **Your Admin Dashboard Summary**

Go to `/admin/collections/workshop-appointments` to see:

| Workshop | Location | Date | Time | Available | Published |
|----------|----------|------|------|-----------|-----------|
| Kombucha | Berlin | May 15 | 14:00 | 8 | ✓ |
| Kombucha | Berlin | May 22 | 10:00 | 2 | ✓ |
| Lakto | Munich | May 18 | 14:00 | 12 | ✓ |
| Lakto | Berlin | May 25 | 10:00 | 0 | ✗ |

**You can:**
- ✏️ **Edit** available spots (8 → 5)
- ➕ **Add** new dates
- ❌ **Hide** sold-out dates (uncheck "Published")
- 📅 **Schedule** workshops months in advance

**Changes apply immediately!** No code updates needed.

---

## ⚙️ **How It Works Behind the Scenes**

**You (Admin):**
- Create 1 workshop = "Kombucha"
- Create 5 appointment slots = 5 different dates/times
- Set spots: 12, 8, 6, 10, 5

**Website Customers:**
- See all 5 available dates
- Pick one → select guests → add to cart
- Can't book more than spots you set

**The System:**
- Tracks what's available in database
- Shows real, live data (not fake/hardcoded)
- Validates before checkout: "Only 2 left, can't book 4"

---

## 🚨 **Important Rules**

1. **Max 12 people per session** — This is locked in. Even if you try to add more spots, system limits to 12.

2. **Real-time updates** — If you change "Available Spots" from 8 → 2, the website INSTANTLY shows 2 spots. No page refresh needed.

3. **Can't book past dates** — System prevents creating appointments in the past.

4. **Payment required for confirmations** — Booking emails are sent ONLY after payment succeeds. No email until they pay.

5. **One cart, one checkout** — Customers add workshop + products to same cart, pay once for everything.

---

## ❓ **FAQ**

**Q: What if a workshop is fully booked?**  
A: Set "Available Spots" to 0. The website will show "Sold Out". Customers can still see it but can't book.

**Q: Can I schedule workshops 6 months in advance?**  
A: Yes! Just create the appointment slots and set them to "Published".

**Q: What if someone forgets to show up?**  
A: For now, you handle this manually. We can add cancellation later.

**Q: Can I have different locations?**  
A: Yes! Each workshop can be offered in Berlin, Munich, or anywhere. You set it per appointment.

**Q: What if I want to change the price?**  
A: Price is €99 per person (set in code, can be changed per workshop later if needed). Tell the dev.

**Q: Where do I see actual bookings?**  
A: In `/admin` → "Booking Orders" collection (coming after payment setup).

---

## 🎯 **Your Action Items (Right Now)**

1. **Review the system** — Make sure you understand where to manage dates
2. **Tell us locations** — Which cities will you offer workshops?
3. **Plan dates** — Decide your first 4-6 workshop slots
4. **Provide Stripe keys** — Need these in a few days for payment setup

---

## 📞 **Questions?**

If anything is unclear, ask! This system is designed to be simple for you to use daily.

---

**You've got this! 🚀**
