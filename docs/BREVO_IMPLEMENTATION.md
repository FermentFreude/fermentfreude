# Brevo Implementation — FermentFreude

## Overview

**Strategy:** Brevo Transactional API (not SMTP).  
Templates are designed in Brevo's dashboard — David & Marcel can edit email text/design without code.  
Code sends emails by referencing template IDs and passing dynamic parameters.

**Package:** `@getbrevo/brevo` (v5.0.1)

---

## What Was Done

### 1. Admin Branding

| File | Purpose |
|------|---------|
| `src/components/admin/Logo.tsx` | FermentFreude submark on login page — switches between light/dark theme |
| `src/components/admin/Icon.tsx` | Smaller submark in sidebar nav — also theme-aware |
| `src/app/(payload)/custom.scss` | Brand-tinted admin colors (elevation, success) |
| `public/submark-light.png` | Light theme logo (from `submark 1.png`) |
| `public/submark-dark.png` | Dark theme logo (from `submark 3.png`) |

**Registered in** `payload.config.ts`:
- `admin.components.graphics.Logo` → Logo component
- `admin.components.graphics.Icon` → Icon component
- `admin.meta.titleSuffix` → `" — FermentFreude"`
- `admin.meta.icons` → submark favicon

### 2. Admin Sidebar Reorganization

| Group | Collections | Notes |
|-------|-------------|-------|
| **Workshops & Kurse** | Workshops, Workshop Appointments, Workshop Locations, Workshop Bookings, Online Courses, Course Progress, Enrollments | All learning-related |
| **Shop** | Products, Orders, Vouchers, Carts, Addresses | All e-commerce |
| **Inhalt** | Pages, Posts, Categories, Media, Forms, Form Submissions | All content |
| **Nutzer** | Users | User management |
| **Website** *(globals)* | Header, Footer, Testimonials | Site-wide config |

- `WorkshopBookings` was **not registered** before — now added to `payload.config.ts`
- All groups use German labels (for David & Marcel)

### 3. Brevo Email Service

**Core service:** `src/lib/brevo.ts`

Three functions:
- `sendTemplateEmail()` — Send transactional email using a Brevo template ID
- `sendTransactionalEmail()` — Send email with inline HTML (for simple system emails)
- `upsertContact()` — Create or update a contact in Brevo (for newsletter sync)

All functions gracefully skip when `BREVO_API_KEY` is not set (no crashes in dev).

### 4. Email Hooks

| File | Trigger | What it does |
|------|---------|-------------|
| `src/hooks/brevo/sendOrderConfirmationEmail.ts` | Orders `afterChange` (create) | Sends order confirmation with items, total, date |
| `src/hooks/brevo/sendWorkshopBookingEmail.ts` | WorkshopBookings `afterChange` (create) | Sends booking confirmation *(needs email field — see TODO)* |
| `src/hooks/brevo/sendEnrollmentEmail.ts` | Enrollments `afterChange` (create) | Sends course enrollment confirmation with course URL |
| `src/hooks/brevo/syncUserToBrevo.ts` | Users `afterChange` (create) | Syncs new user to Brevo contacts + sends welcome email |

**Hooks wired to collections:**
- `Orders` → `sendOrderConfirmationEmail` (via plugin override in `src/plugins/index.ts`)
- `WorkshopBookings` → `sendWorkshopBookingEmail`
- `Enrollments` → `sendEnrollmentEmail`
- `Users` → `syncUserToBrevo`

### 5. Template IDs (defined in `src/lib/brevo.ts`)

```typescript
export const BREVO_TEMPLATES = {
  ORDER_CONFIRMATION: 1,
  WORKSHOP_BOOKING_CONFIRMATION: 2,
  COURSE_ENROLLMENT: 3,
  VOUCHER_PURCHASED: 4,
  WELCOME: 5,
  PASSWORD_RESET: 6,
}
```

---

## What Needs to Be Done

### Step 1: Add Environment Variables

Add to `.env` (and Vercel for staging/production):

```
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_SENDER_EMAIL=hello@fermentfreude.com
BREVO_SENDER_NAME=FermentFreude
```

Get API key from: **Brevo Dashboard → Settings → SMTP & API → API Keys**

### Step 2: Create Email Templates in Brevo

Go to **Brevo Dashboard → Transactional → Templates** and create these 6 templates.  
The template number in Brevo must match the IDs above.

#### Template 1 — Order Confirmation

Available variables:
```
{{ params.ORDER_ID }}       — Order ID
{{ params.ORDER_TOTAL }}    — Total amount (e.g. "99.00")
{{ params.ORDER_ITEMS }}    — Item summary (e.g. "Kombucha Kit x1, Tempeh Starter x2")
{{ params.CUSTOMER_NAME }}  — Customer name or email
{{ params.ORDER_DATE }}     — Date formatted in German (e.g. "19.03.2026")
```

#### Template 2 — Workshop Booking Confirmation

Available variables:
```
{{ params.WORKSHOP_TITLE }} — Workshop name (e.g. "Kombucha Workshop")
{{ params.WORKSHOP_DATE }}  — Date string
{{ params.GUEST_COUNT }}    — Number of guests
{{ params.TOTAL_PRICE }}    — Total price
{{ params.CUSTOMER_NAME }}  — Customer name or email
{{ params.BOOKING_ID }}     — Booking ID
```

#### Template 3 — Course Enrollment

Available variables:
```
{{ params.COURSE_SLUG }}    — Course identifier
{{ params.CUSTOMER_NAME }}  — Customer name or email
{{ params.COURSE_URL }}     — Direct link to the course page
```

#### Template 4 — Voucher Purchased *(future)*

Not yet wired. Will need a hook on Vouchers collection.

#### Template 5 — Welcome Email

Available variables:
```
{{ params.CUSTOMER_NAME }}  — New user's name or email
```

#### Template 6 — Password Reset *(future)*

Requires Payload email adapter integration for auth flows.

### Step 3: ~~Add Email Field to WorkshopBookings~~ DONE

Email, firstName, lastName, phone, and notes fields have been added to `WorkshopBookings` collection. The checkout flow needs to pass this customer data when creating bookings.

### Step 4: Create Brevo Contact Lists

In **Brevo Dashboard → Contacts → Lists**, create:
- **Newsletter Subscribers** — for general newsletter
- **Workshop Customers** — for people who booked workshops
- **Course Students** — for people enrolled in online courses

Then update `syncUserToBrevo.ts` to pass the correct `listIds`.

### Step 5: Verify Sender Domain

In **Brevo Dashboard → Settings → Senders, Domains & Dedicated IPs**:
1. Add `fermentfreude.com` as a sender domain
2. Verify via DNS records (DKIM, SPF, DMARC)
3. This ensures emails don't land in spam

### Step 6: Test the Flow

1. Set `BREVO_API_KEY` in `.env`
2. Restart dev server (`pnpm dev`)
3. Create a test user → should trigger welcome email + Brevo contact sync
4. Place a test order → should trigger order confirmation email
5. Check Brevo dashboard for delivery logs

---

## Future Enhancements

| Feature | Priority | Notes |
|---------|----------|-------|
| Voucher purchase email (Template 4) | Medium | Add hook to Vouchers collection |
| Password reset via Brevo (Template 6) | Medium | Requires `nodemailerAdapter` with Brevo SMTP or custom auth flow |
| Newsletter signup form → Brevo | High | Wire form submissions to `upsertContact()` with newsletter list |
| Workshop reminder emails | Low | Cron job or scheduled Brevo campaign 24h before workshop |
| Abandoned cart emails | Low | Track incomplete checkouts, send reminder via Brevo automation |
| Custom admin dashboard widget | Low | Show email delivery stats from Brevo API |

---

## File Summary

```
src/
├── lib/
│   └── brevo.ts                              # Core Brevo service (send emails, sync contacts)
├── hooks/
│   └── brevo/
│       ├── sendOrderConfirmationEmail.ts      # Orders → email
│       ├── sendWorkshopBookingEmail.ts        # Workshop bookings → email
│       ├── sendEnrollmentEmail.ts             # Course enrollments → email
│       └── syncUserToBrevo.ts                 # New users → Brevo contact + welcome
├── components/
│   └── admin/
│       ├── Logo.tsx                           # Login page logo (theme-aware)
│       └── Icon.tsx                           # Nav sidebar icon (theme-aware)
public/
├── submark-light.png                         # Light theme logo
└── submark-dark.png                          # Dark theme logo
```
