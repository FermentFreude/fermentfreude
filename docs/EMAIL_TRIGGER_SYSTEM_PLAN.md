# FermentFreude Email Trigger System — Complete Marketing Logic

## Overview
Complete email automation for workshop bookings, purchases, and customer lifecycle — 19 templates across 4 categories, with both immediate and scheduled triggers.

---

## 1. Email Trigger Categories

### ✅ ACTIVE (Already Implemented)
| Trigger | Template | Type | When | Status |
|---------|----------|------|------|--------|
| Order Confirmation | 36 | Immediate | Order created after payment | ✅ Done |
| Workshop Booking Confirmation | 31 | Immediate | Workshop booking confirmed | ✅ Done |
| Newsletter Welcome | 40 | Immediate | User account created | ✅ Done |
| Course Enrollment | 41 | Immediate | User enrolls in course | ✅ Done |

### 🔄 TO IMPLEMENT (Priority Order)

#### **Priority 1: Core Workshop Lifecycle (4)**
| Trigger | Template | Type | When | Email Recipients |
|---------|----------|------|------|------------------|
| Workshop 7-Day Reminder | 32 | Scheduled | 7 days before workshop date | Booked participants |
| Workshop 1-Day Reminder | 33 | Scheduled | 1 day before workshop date | Booked participants |
| Post-Workshop Follow-up | 34 | Scheduled | 1 day after workshop ends | Attended participants |
| Feedback Request | 35 | Scheduled | 7 days after workshop ends | Attended participants |

#### **Priority 2: Core E-Commerce Flow (2)**
| Trigger | Template | Type | When | Email Recipients |
|---------|----------|------|------|------------------|
| Shipping Notification | 37 | Event | Order marked as shipped | Order customer |
| Review Request | 38 | Scheduled | 14 days after order delivery | Order customer |

#### **Priority 3: Account Lifecycle (4)**
| Trigger | Template | Type | When | Email Recipients |
|---------|----------|------|------|------------------|
| Account Creation | 27 | Immediate | User registers | New user |
| Email Verification | 28 | Immediate | User clicks verify email | New user |
| Password Reset | 29 | Immediate | User requests password reset | User |
| Login Notification | 30 | Immediate | New device login detected | User |

#### **Priority 4: Engagement & Marketing (4)**
| Trigger | Template | Type | When | Email Recipients |
|---------|----------|------|------|------------------|
| Abandoned Cart | 39 | Scheduled | Cart abandoned > 2 hours | Cart owner |
| B2B Inquiry | 42 | Event | B2B form submitted | Business inquirer |
| Re-engagement | 43 | Scheduled | No activity in 60 days | Active customers |
| Referral Program | 44 | Event | Referral completed | Referrer + new user |

#### **Priority 5: Custom Events (1)**
| Trigger | Template | Type | When | Email Recipients |
|---------|----------|------|------|------------------|
| Voucher Purchased | 45 | Immediate | Voucher purchased | Purchaser |

---

## 2. Implementation Architecture

### A. Immediate Triggers (Hooks)
**Location:** `src/hooks/brevo/` and collection registration in `src/plugins/index.ts`

**Collections & Hooks:**

| Collection | Hook | Template | Implementation |
|------------|------|----------|-----------------|
| `users` | `afterChange` | 27 (Account Creation) | When `operation === 'create'` |
| `users` | `afterChange` | 28 (Email Verification) | When email verified (custom field flag) |
| `users` | `afterChange` | 29 (Password Reset) | When password change request triggered |
| `orders` | `afterChange` | 36 (Order Confirmation) | ✅ Already done |
| `orders` | `afterChange` | 37 (Shipping Notification) | When `status === 'shipped'` |
| `orders` | `afterChange` | 31 (Workshop Confirmation) | ✅ Already done |
| `workshopBookings` | `afterChange` | 31 (Workshop Confirmation) | When booking confirmed |
| `purchases` | `afterChange` | 45 (Voucher Purchased) | When voucher purchased |

### B. Scheduled Triggers (Cron Job)
**Location:** `src/app/api/emails/send-scheduled/route.ts`

**How it works:**
1. Create timestamp fields on collections to track when reminders have been sent
2. Cron endpoint queries for pending emails based on date logic
3. Sends emails and marks as sent
4. Called via: Vercel Cron, external service (EasyCron), or manual trigger

**Collections needing timestamp fields:**

| Collection | Fields to Add | Purpose |
|------------|---|---------|
| `workshopBookings` | `sentReminder7Day`, `sentReminder1Day`, `sentFollowup`, `sentFeedback` | Track which reminders already sent |
| `orders` | `sentReviewRequest` | Track review request sent |
| `carts` | `abandonedCartTime`, `sentAbandonedCartEmail` | Track abandoned cart notifications |
| `users` | `lastActivityDate`, `sentReengagementEmail` | Track re-engagement |

**Scheduled Trigger Logic:**

```
Every 4 hours:
  - 7-Day Reminder: Find workshops 7 days away, not yet reminded → Send + mark
  - 1-Day Reminder: Find workshops 1 day away, not yet reminded → Send + mark
  - Post-Workshop: Find workshops ended 1 day ago, not yet followed up → Send + mark
  - Feedback: Find workshops ended 7 days ago, not yet feedback sent → Send + mark
  - Review Request: Find orders 14 days delivered, no review request → Send + mark
  - Abandoned Cart: Find carts abandoned > 2 hours, no email sent → Send + mark
  - Re-engagement: Find users inactive 60+ days, no recent re-engagement → Send + mark
```

### C. Event-Based Triggers
**Location:** Wherever the event occurs (form handlers, API routes, components)

| Event | Template | Implementation Location |
|-------|----------|-------------------------|
| B2B Inquiry | 42 | B2B form submission handler |
| Referral Completed | 44 | Referral claim API endpoint |
| Login (New Device) | 30 | Middleware or auth hook |

---

## 3. Email Template Parameters (Marketing Context)

### Workshop Journey Parameters
```
WORKSHOP_BOOKING_CONFIRMATION (31):
  - FIRST_NAME
  - WORKSHOP_NAME
  - WORKSHOP_DATE
  - WORKSHOP_TIME
  - LOCATION
  - BOOKING_CONFIRMATION_URL
  - PARTICIPANTS_COUNT

WORKSHOP_7DAY_REMINDER (32):
  - FIRST_NAME
  - WORKSHOP_NAME
  - WORKSHOP_DATE (7 days away)
  - LOCATION
  - JOIN_URL

WORKSHOP_1DAY_REMINDER (33):
  - FIRST_NAME
  - WORKSHOP_NAME
  - WORKSHOP_DATE (tomorrow)
  - TIME
  - LOCATION
  - JOIN_INSTRUCTIONS

POST_WORKSHOP_FOLLOWUP (34):
  - FIRST_NAME
  - WORKSHOP_NAME
  - PHOTOS_GALLERY_URL (if available)
  - FEEDBACK_FORM_URL
  - NEXT_WORKSHOP_RECOMMENDATION

FEEDBACK_REQUEST (35):
  - FIRST_NAME
  - WORKSHOP_NAME
  - FEEDBACK_FORM_URL
  - INCENTIVE (e.g., "Complete survey, get 5% off next workshop")
```

### Purchase Journey Parameters
```
ORDER_CONFIRMATION (36):
  - FIRST_NAME
  - ORDER_NUMBER
  - ITEMS (array with TITLE, QUANTITY, PRICE)
  - TOTAL
  - TRACKING_URL

SHIPPING_NOTIFICATION (37):
  - FIRST_NAME
  - ORDER_NUMBER
  - TRACKING_NUMBER
  - CARRIER
  - ESTIMATED_DELIVERY
  - TRACKING_URL

REVIEW_REQUEST (38):
  - FIRST_NAME
  - ORDER_NUMBER
  - PRODUCTS (array)
  - REVIEW_LINK
  - INCENTIVE (e.g., "Leave review, enter raffle for €50 voucher")
```

### Account Lifecycle Parameters
```
ACCOUNT_CREATION (27):
  - FIRST_NAME
  - LOGIN_URL
  - WELCOME_MESSAGE

EMAIL_VERIFICATION (28):
  - FIRST_NAME
  - VERIFICATION_URL
  - EXPIRY_TIME

PASSWORD_RESET (29):
  - FIRST_NAME
  - RESET_URL
  - EXPIRY_TIME (usually 1 hour)

LOGIN_NOTIFICATION (30):
  - FIRST_NAME
  - DEVICE_NAME
  - LOCATION
  - TIMESTAMP
  - SECURITY_URL (if suspicious)
```

### Marketing Campaign Parameters
```
ABANDONED_CART (39):
  - FIRST_NAME
  - ITEMS (array)
  - CART_TOTAL
  - CHECKOUT_LINK
  - INCENTIVE (e.g., "Complete purchase in next 24h, get 10% off")

B2B_INQUIRY (42):
  - INQUIRY_TYPE
  - CONTACT_NAME
  - COMPANY
  - MESSAGE
  - RESPONSE_EXPECTED_TIME

RE_ENGAGEMENT (43):
  - FIRST_NAME
  - LAST_VISIT_DATE
  - NEW_OFFERINGS
  - EXCLUSIVE_OFFER
  - REACTIVATE_LINK

REFERRAL_PROGRAM (44):
  - FIRST_NAME (Referrer)
  - REFERRED_FRIEND_NAME
  - BONUS_AMOUNT
  - CLAIM_BONUS_URL

VOUCHER_PURCHASED (45):
  - FIRST_NAME
  - VOUCHER_CODE
  - VALIDITY_DATE
  - REDEMPTION_URL
  - GIFT_RECIPIENT_EMAIL (if gift)
```

---

## 4. Collection Modifications Needed

### Users Collection
Add fields for email preference tracking:
```typescript
{
  name: 'emailPreferences',
  type: 'group',
  fields: [
    { name: 'verificationSent', type: 'date' },
    { name: 'passwordResetSent', type: 'date' },
    { name: 'lastActivityDate', type: 'date' },
    { name: 'sentReengagementEmail', type: 'date' },
  ]
}
```

### WorkshopBookings Collection
Add reminder tracking fields:
```typescript
{
  name: 'emailReminders',
  type: 'group',
  fields: [
    { name: 'sentConfirmation', type: 'date' },
    { name: 'sent7DayReminder', type: 'date' },
    { name: 'sent1DayReminder', type: 'date' },
    { name: 'sentPostWorkshopFollowup', type: 'date' },
    { name: 'sentFeedbackRequest', type: 'date' },
  ]
}
```

### Orders Collection
Add review request tracking:
```typescript
{
  name: 'emailTracking',
  type: 'group',
  fields: [
    { name: 'sentConfirmation', type: 'date' },
    { name: 'sentShippingNotification', type: 'date' },
    { name: 'sentReviewRequest', type: 'date' },
  ]
}
```

### Carts Collection
Add abandoned cart tracking:
```typescript
{
  name: 'abandonedTracking',
  type: 'group',
  fields: [
    { name: 'abandonedAt', type: 'date' },
    { name: 'sentAbandonedCartEmail', type: 'date' },
  ]
}
```

---

## 5. Implementation Priority

### Phase 1 (This Session): Immediate Triggers
1. Account creation/verification emails (Users hooks)
2. Password reset email (Users hooks)
3. Shipping notification (Orders hook)
4. Voucher purchased (Purchases hook)

### Phase 2: Scheduled Infrastructure
1. Create `/api/emails/send-scheduled` endpoint
2. Add timestamp fields to collections
3. Implement scheduled trigger logic
4. Set up cron configuration

### Phase 3: Scheduled Triggers
1. Workshop reminders (7-day, 1-day)
2. Post-workshop follow-up
3. Feedback request
4. Review request
5. Abandoned cart
6. Re-engagement

### Phase 4: Event-Based Triggers
1. B2B inquiries
2. Referral program
3. Login notifications (fraud detection)

---

## 6. Database Considerations (MongoDB M0)

**Important:** FermentFreude uses MongoDB Atlas M0 (free tier):
- ❌ No transactions
- ❌ No Promise.all for mutations
- ✅ Sequential writes only

**Implication for scheduled triggers:**
- Each email must be marked as "sent" in sequential operations
- Cron job must process emails one-by-one (not batched)
- Use `for...of` loops instead of `Promise.all` when updating multiple records

---

## 7. Testing Strategy

### Manual Testing (Per Trigger)
1. Trigger the event (e.g., create account, make purchase)
2. Check Brevo logs: https://app.brevo.com/transactional/logs
3. Verify email appears in test email inbox
4. Confirm all parameters populated correctly

### Automated Testing
- Unit tests for hook logic
- Integration tests for scheduled endpoint
- E2E tests for complete workflows

---

## 8. Deployment Checklist

- [ ] All hooks created and imported in `src/plugins/index.ts`
- [ ] Scheduled endpoint created at `/api/emails/send-scheduled`
- [ ] Collection fields added for timestamp tracking
- [ ] Brevo templates created with correct parameter names
- [ ] `pnpm generate:types` run after collection changes
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `pnpm build` succeeds
- [ ] Cron job configured in `vercel.json`
- [ ] Manual testing completed for each trigger
- [ ] Logging configured for troubleshooting

---

## 9. Monitoring & Troubleshooting

### Brevo Dashboard
- View all emails: https://app.brevo.com/transactional/logs
- Check delivery rates and failures
- Monitor bounce rate and complaint rate

### Logs to Check
```bash
# Check if hooks are running
grep -r "sendOrderConfirmationEmail\|sendTemplateEmail" .next/

# Monitor Brevo API errors
# Look for 400/401/402/429 errors in server logs
```

### Common Issues
| Issue | Solution |
|-------|----------|
| Email not sending | Check BREVO_API_KEY in env |
| Parameters not populating | Check template variable names match params object |
| Duplicate emails | Check `operation === 'create'` gate |
| Scheduled emails not sending | Check cron job is running, check DB timestamp fields |

---

## Next Steps

1. ✅ Understand the marketing logic (THIS DOCUMENT)
2. → Create immediate trigger hooks (Phase 1)
3. → Create scheduled trigger infrastructure (Phase 2)
4. → Implement all 19 triggers end-to-end
5. → Deploy to staging and test
6. → Deploy to production
