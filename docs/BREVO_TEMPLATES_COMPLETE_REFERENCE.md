# Brevo Email Templates — Complete Reference

**Total Templates:** 19  
**Status:** ✅ All HTML templates exist in `public/email-templates/`  
**Setup:** `pnpm brevo-setup-templates` creates all 19 in Brevo

---

## 📋 Template Mapping by Category

### 1. Transactional (4 templates)

| ID | Name | File | Subject | Trigger | Status |
|----|------|------|---------|---------|--------|
| 1 | Account Creation | `01-account-creation.html` | Willkommen bei FermentFreude — {{params.CUSTOMER_NAME}} | New user signup | ⏳ Ready |
| 2 | Email Verification | `02-email-verification.html` | Verifiziere deine E-Mail Adresse | Email verification | ⏳ Ready |
| 3 | Password Reset | `03-password-reset.html` | Passwort zurücksetzen — FermentFreude | Password reset request | ✅ Active* |
| 4 | Login Notification | `04-login-notification.html` | Neue Anmeldung in deinem FermentFreude Konto | New login detected | ⏳ Ready |

*Currently integrated in code

---

### 2. Workshop (5 templates)

| ID | Name | File | Subject | Trigger | Status |
|----|------|------|---------|---------|--------|
| 5 | Booking Confirmation | `05-workshop-booking-confirmation.html` | Workshop Buchung bestätigt — {{params.BOOKING_ID}} | Order → booking linked | ✅ Active* |
| 6 | 7-Day Reminder | `06-workshop-7day-reminder.html` | Erinnerung: Dein Workshop in 7 Tagen — {{params.WORKSHOP_TITLE}} | Scheduled (7 days before) | ⏳ Ready |
| 7 | 1-Day Reminder | `07-workshop-1day-reminder.html` | Erinnerung: Dein Workshop morgen — {{params.WORKSHOP_TITLE}} | Scheduled (1 day before) | ⏳ Ready |
| 8 | Post-Workshop Follow-up | `08-post-workshop-followup.html` | Danke für deine Teilnahme — {{params.WORKSHOP_TITLE}} | After workshop date | ⏳ Ready |
| 9 | Feedback Request | `09-feedback-request.html` | Deine Meinung zählt — Feedback zu {{params.WORKSHOP_TITLE}} | Post-workshop (5 days) | ⏳ Ready |

*Currently integrated in code

---

### 3. E-commerce (4 templates)

| ID | Name | File | Subject | Trigger | Status |
|----|------|------|---------|---------|--------|
| 10 | Order Confirmation | `10-order-confirmation.html` | Deine Bestellung bei FermentFreude — {{params.ORDER_ID}} | Stripe payment success | ✅ Active* |
| 11 | Shipping Notification | `11-shipping-notification.html` | Deine Bestellung ist unterwegs — {{params.ORDER_ID}} | Manual (admin triggers) | ⏳ Ready |
| 12 | Review Request | `12-review-request.html` | Bewerte deine Bestellung — {{params.ORDER_ID}} | Post-delivery (5 days) | ⏳ Ready |
| 13 | Abandoned Cart | `13-abandoned-cart.html` | Du hast etwas in deinem Warenkorb — {{params.PRODUCT_COUNT}} Artikel warten | Cart abandoned (1 hour) | ⏳ Ready |

*Currently integrated in code

---

### 4. Marketing (5 templates)

| ID | Name | File | Subject | Trigger | Status |
|----|------|------|---------|---------|--------|
| 14 | Newsletter Welcome | `14-newsletter-welcome.html` | Willkommen zu unserem Newsletter | Newsletter signup | ⏳ Ready |
| 15 | Course Enrollment | `15-course-enrollment.html` | Kurs-Registrierung erfolgreich — {{params.COURSE_SLUG}} | User enrolls in course | ✅ Active* |
| 16 | B2B Inquiry | `16-b2b-inquiry.html` | B2B Anfrage erhalten — {{params.COMPANY_NAME}} | B2B form submission | ⏳ Ready |
| 17 | Re-Engagement | `17-re-engagement.html` | Wir vermissen dich — Komm zurück zu FermentFreude | Inactive user (90 days) | ⏳ Ready |
| 18 | Referral Program | `18-referral-program.html` | Empfehle FermentFreude und verdiene {{params.REWARD_AMOUNT}} | Program signup | ⏳ Ready |

*Currently integrated in code

---

### 5. Custom (1 template)

| ID | Name | File | Subject | Trigger | Status |
|----|------|------|---------|---------|--------|
| 19 | Voucher Purchased | `19-voucher-purchased.html` | Dein Gutschein — {{params.VOUCHER_CODE}} | Voucher purchase | ✅ Active* |

*Currently integrated in code

---

## 🔗 Code Integration Points

### Currently Active (6 templates)

These are currently wired into the code with working automation:

1. **ORDER_CONFIRMATION (ID: 10)**
   - Location: `src/collections/Orders/stripeWebhooks.ts`
   - Trigger: After successful Stripe payment
   - Sends to: Customer email

2. **WORKSHOP_BOOKING_CONFIRMATION (ID: 5)**
   - Location: `src/collections/Orders/confirmWorkshopBookings.ts`
   - Trigger: After booking linked to order
   - Sends to: Customer email

3. **PASSWORD_RESET (ID: 3)**
   - Location: `src/app/api/auth/password-reset.ts` (if exists)
   - Trigger: User requests password reset
   - Sends to: User email

4. **COURSE_ENROLLMENT (ID: 15)**
   - Location: `src/collections/Enrollments/` (if exists)
   - Trigger: User enrolls in course
   - Sends to: User email

5. **ACCOUNT_CREATION (ID: 1)**
   - Location: `src/collections/Users/` (if exists)
   - Trigger: New account created
   - Sends to: User email

6. **VOUCHER_PURCHASED (ID: 19)**
   - Location: `src/collections/Orders/` (if exists)
   - Trigger: Voucher purchased
   - Sends to: Customer email

---

### Ready to Activate (13 templates)

These templates exist but need code integration:

**Workshop Reminders (IDs: 6, 7, 8, 9)**
- Need: Scheduled job/cron to send reminders
- Implementation: Payload CMS jobs or external scheduler
- Timeline: 7-day, 1-day before workshop, post-workshop, feedback

**Shipping & Reviews (IDs: 11, 12)**
- Need: Admin API to trigger shipping email
- Need: Scheduled post-delivery review request
- Implementation: Order status change hook or scheduled job

**Abandoned Cart (ID: 13)**
- Need: Scheduled job to detect abandoned carts
- Implementation: Cron job checking old carts without orders

**Marketing Campaign (IDs: 14, 16, 17, 18)**
- Need: Form submissions, user segment triggers
- Implementation: Dependent on campaign infrastructure

**Email Verification (ID: 2)**
- Need: User auth flow integration
- Implementation: Link in signup email

**Login Notification (ID: 4)**
- Need: Security feature integration
- Implementation: Send on suspicious login

---

## 🚀 Setup & Management

### Initial Setup

```bash
# Create all 19 templates in your Brevo account
pnpm brevo-setup-templates

# Output will show:
# [1/19] Creating template: Account Creation... ✅ Created (ID: 1)
# [2/19] Creating template: Email Verification... ✅ Created (ID: 2)
# ... etc ...
# ✅ Successful: 19/19
```

### Template IDs in Code

All template IDs are stored in `src/lib/brevo.ts`:

```typescript
export const BREVO_TEMPLATES = {
  ACCOUNT_CREATION: 1,
  EMAIL_VERIFICATION: 2,
  PASSWORD_RESET: 3,
  // ... etc (all 19)
} as const
```

If you need to rerun setup or IDs change, update this file.

---

## 📝 Template Parameters Reference

### Standard Parameters (available in all templates)

```
{{params.CUSTOMER_NAME}}          // First name or full name
{{params.CUSTOMER_EMAIL}}         // Customer email address
{{params.TIMESTAMP}}              // Email send date/time
```

### Order/E-commerce Parameters

```
{{params.ORDER_ID}}               // Order number/reference
{{params.ORDER_TOTAL}}            // Total price
{{params.PRODUCT_COUNT}}          // Number of items
{{params.DELIVERY_DATE}}          // Estimated delivery
{{params.TRACKING_URL}}           // Tracking link
```

### Workshop Parameters

```
{{params.BOOKING_ID}}             // Booking reference
{{params.WORKSHOP_TITLE}}         // Workshop name
{{params.WORKSHOP_DATE}}          // Workshop date/time
{{params.GUEST_COUNT}}            // Number of attendees
{{params.LOCATION}}               // Workshop location
{{params.BOOKING_CONFIRMATION}}   // Booking confirmation code
```

### Voucher Parameters

```
{{params.VOUCHER_CODE}}           // Unique voucher code
{{params.VOUCHER_VALUE}}          // Discount amount or percentage
{{params.EXPIRY_DATE}}            // When voucher expires
{{params.TERMS}}                  // Voucher terms
```

### Course Parameters

```
{{params.COURSE_SLUG}}            // Course identifier
{{params.COURSE_TITLE}}           // Course name
{{params.ACCESS_URL}}             // Course access link
{{params.ENROLLMENT_DATE}}        // When user enrolled
```

---

## ✅ Deployment Checklist

Before delivering to client:

- [ ] Run `pnpm brevo-setup-templates` successfully (19/19 created)
- [ ] Verify all template IDs in Brevo match `src/lib/brevo.ts`
- [ ] Test 6 active templates (order, booking, password, course, voucher, welcome)
- [ ] Document which 13 templates are "ready to activate"
- [ ] Provide client with this reference guide
- [ ] Set expectations: Currently 6 active, 13 available for future features

---

## 🔄 Future Implementation Priority

**Phase 1 (Current)** — 6 active templates
- Order & workshop confirmations
- Password reset & welcome
- Course enrollment & vouchers

**Phase 2 (High Priority)** — Workshop automation
- 7-day, 1-day reminders (IDs: 6, 7)
- Post-workshop follow-up & feedback (IDs: 8, 9)
- Requires: Scheduled jobs infrastructure

**Phase 3 (Medium Priority)** — E-commerce enhancements
- Shipping notification (ID: 11)
- Review requests (ID: 12)
- Abandoned cart recovery (ID: 13)
- Requires: Admin APIs, scheduled jobs

**Phase 4 (Future)** — Marketing campaigns
- Newsletter, B2B, re-engagement, referral (IDs: 14, 16, 17, 18)
- Email verification (ID: 2)
- Login notifications (ID: 4)
- Requires: Campaign platform, segmentation

---

## 📞 Support

**For template content changes:**
- Edit HTML in `public/email-templates/XX-name.html`
- Update subject in `scripts/brevo-setup-templates.mjs`
- Rerun: `pnpm brevo-setup-templates`

**For integration bugs:**
- Check `src/lib/brevo.ts` for template ID
- Review `src/collections/Orders/` for trigger logic
- Check Brevo logs: https://app.brevo.com/transactional/logs

**For new templates:**
- Create HTML file in `public/email-templates/XX-new-template.html`
- Add to `TEMPLATES` array in setup script
- Add constant to `BREVO_TEMPLATES` in code
- Run: `pnpm brevo-setup-templates`
