# Stripe Payment → Email Confirmation Flow — FermentFreude

> **Complete order-to-confirmation pipeline with automatic email receipts**

---

## 🔄 Complete Order Flow

### Step 1: Customer Adds Workshop to Cart (Frontend)
```
User visits: http://localhost:3001/workshops/tempeh
↓
Clicks: "Add to Cart" button
↓
Workshop product added to cart (cart item stored in localStorage + DB)
```

### Step 2: Checkout Page (Guest Email Entry)
```
User navigates to: /checkout
↓
Enters: Email (guest checkout)
↓
(Address skipped for digital workshops)
```

### Step 3: Stripe Payment (Card Processing)
```
User enters: Stripe test card (4242 4242 4242 4242)
↓
Stripe Elements iframe validates card
↓
Frontend sends: POST /api/payments/stripe/initiate
  - Body: { cartId, stripePaymentMethodId }
  - Stripe API creates Payment Intent
  - Stripe returns: client_secret + status: "requires_confirmation"
↓
Frontend confirms payment with Stripe
↓
Stripe processes transaction
```

### Step 4: Stripe Webhook (Backend)
```
Stripe sends webhook: POST /api/payments/stripe/webhooks
  - Event: charge.succeeded OR payment_intent.succeeded
↓
Payload CMS ecommerce plugin captures webhook
↓
Order is created in database (status: pending → confirmed)
```

### Step 5: Order Hooks Fire (Automatic)
```
Order record created/updated
↓
Payload CMS afterChange hooks execute (in order):
  1. decrementInventory
  2. autoEnrollOnPurchase
  3. confirmWorkshopBookings ← Matches booking to order
  4. sendOrderConfirmationEmail ← 📧 TEMPLATE 1
  5. autoCompleteDigitalOrders
↓
```

### Step 6a: Order Confirmation Email (Receipt)
```
sendOrderConfirmationEmail hook triggers:
  ↓
  Looks up customer email from order
  ↓
  Calls: sendTemplateEmail({
    to: [{ email: customer_email }],
    templateId: BREVO_TEMPLATES.ORDER_CONFIRMATION, // ID = 1
    params: {
      ORDER_ID: "ord_...",
      CUSTOMER_NAME: "...",
      ORDER_ITEMS: "Kombucha Workshop x1",
      ORDER_TOTAL: "89.00",
      ORDER_DATE: "20.04.2026"
    }
  })
  ↓
  Brevo API sends email from: kontakt@fermentfreude.at ✉️
```

### Step 6b: Workshop Booking Confirmation
```
confirmWorkshopBookings hook triggers:
  ↓
  Matches workshop product to booking record
  ↓
  Updates booking status: pending → confirmed
  ↓
  Calls: sendTemplateEmail({
    to: [{ email: customer_email }],
    templateId: BREVO_TEMPLATES.WORKSHOP_BOOKING_CONFIRMATION, // ID = 2
    params: {
      WORKSHOP_TITLE: "Kombucha 101",
      WORKSHOP_DATE: "25.04.2026",
      GUEST_COUNT: "2",
      TOTAL_PRICE: "89.00",
      CUSTOMER_NAME: "...",
      BOOKING_ID: "book_..."
    }
  })
  ↓
  Brevo API sends email from: kontakt@fermentfreude.at ✉️
```

### Step 7: Customer Receives Emails
```
📧 Email 1 (ORDER_CONFIRMATION) arrives in inbox
   Subject: "Deine Bestellung bei FermentFreude — ord_..."
   Body: Order details, items, total, receipt info
   ↓
⏳ 2-5 seconds later...
   ↓
📧 Email 2 (WORKSHOP_BOOKING_CONFIRMATION) arrives in inbox
   Subject: "Workshop Buchung bestätigt — book_..."
   Body: Workshop details, date, time, booking info
```

---

## 🚨 Current Blocker: Templates Disabled

**Why emails fail with "Error: template is disabled":**
- Templates exist in Brevo account BUT are in **Draft/Disabled** state
- Brevo API rejects sending with disabled templates
- Result: Status = "Error", Delivery rate = 0.00%

**Solution:** Activate all 6 templates in Brevo dashboard

---

## ⚡ Quick Enable Template Checklist

Go to: **[Brevo Dashboard](https://app.brevo.com) → Transactional → Templates**

For each template below:

### Template 1: ORDER_CONFIRMATION
- [ ] Click template ID **1**
- [ ] Click **Edit**
- [ ] Paste HTML from: `public/email-templates/10-order-confirmation.html`
- [ ] Click **Save and Activate** (not just Save)
- [ ] Status: **Active** ✅

### Template 2: WORKSHOP_BOOKING_CONFIRMATION
- [ ] Click template ID **2**
- [ ] Click **Edit**
- [ ] Paste HTML from: `public/email-templates/05-workshop-booking-confirmation.html`
- [ ] Click **Save and Activate**
- [ ] Status: **Active** ✅

### Templates 3-6 (Same process)
- [ ] Template 3: Use `15-course-enrollment.html` → **Active**
- [ ] Template 4: Use `19-voucher-purchased.html` → **Active**
- [ ] Template 5: Use `01-account-creation.html` → **Active**
- [ ] Template 6: Use `03-password-reset.html` → **Active**

---

## 🧪 Test After Enabling

### Quick Test: Place an Order

1. **Dev server running:**
   ```bash
   pnpm dev
   # Server at http://localhost:3001
   ```

2. **Add to cart:**
   - Go to: http://localhost:3001/workshops/tempeh
   - Click: "Add to Cart"

3. **Checkout:**
   - Go to: http://localhost:3001/checkout
   - Email: `your-test-email@gmail.com`
   - Skip address

4. **Pay:**
   - Card: `4242 4242 4242 4242`
   - Month: `12`
   - Year: `34`
   - CVC: `123`

5. **Wait 5-10 seconds**

6. **Check email:**
   - You should receive **2 emails** in your inbox:
     - Email 1: Order confirmation (receipt)
     - Email 2: Workshop booking confirmation

7. **Verify delivery:**
   - Go to: **[Brevo Logs](https://app.brevo.com/transactional/logs)**
   - Filter by your test email
   - Both emails should show: **Sent** ✓ + **Delivered** ✓

---

## 📊 Expected Results

After successful test order:

| Metric | Expected |
|--------|----------|
| Total emails sent | 2 |
| Delivered | 2 (100%) |
| Bounced | 0 |
| Complained | 0 |
| Email 1 time | ~immediate |
| Email 2 time | ~2-5 sec after Email 1 |

---

## 🔧 Troubleshooting

### Issue: Emails still show "Error: template is disabled"

**Check:**
1. Did you click "**Save and Activate**" (not just Save)?
2. Is template status showing **Active** (green checkmark)?
3. Did you set Template ID to **1, 2, 3, 4, 5, 6** (exact numbers)?

**Fix:**
1. Go to template
2. Click **Edit**
3. Scroll to bottom
4. Click **Save and Activate**
5. Wait 5 seconds
6. Refresh page
7. Status should now be **Active** ✅

---

### Issue: Emails arrive but variables are empty

**Example:** Email shows "Order ID: " (blank)

**Cause:** Template HTML doesn't have the variable

**Check in template HTML:**
- Should include: `{{params.ORDER_ID}}`
- Not: `${ORDER_ID}` or `{ORDER_ID}`

**Fix:**
1. Open template HTML in editor
2. Search for `params.`
3. Verify all variables from code are in template:
   - ORDER_CONFIRMATION: `ORDER_ID`, `CUSTOMER_NAME`, `ORDER_ITEMS`, `ORDER_TOTAL`, `ORDER_DATE`
   - WORKSHOP_BOOKING_CONFIRMATION: `WORKSHOP_TITLE`, `WORKSHOP_DATE`, `GUEST_COUNT`, `TOTAL_PRICE`, `CUSTOMER_NAME`, `BOOKING_ID`

---

### Issue: No emails arrive at all

**Check:**
1. Recipient email address is valid (not fake/temporary)
2. Check spam/promotions folder
3. Check Brevo logs for bounce reason:
   - **Hard bounce** = Invalid email
   - **Soft bounce** = Temp issue (retry later)
   - **Complained** = Marked as spam

---

## 🎯 Production Setup

When ready for production:

1. **Create templates in production Brevo account**
   - Same HTML files, Template IDs 1-6
   - Same activation process

2. **Set production env vars in Vercel:**
   ```
   BREVO_API_KEY=xkeysib-[production-key]
   BREVO_SENDER_EMAIL=kontakt@fermentfreude.at
   BREVO_SENDER_NAME=Fermentfreude
   ```

3. **Test with real order:**
   - Place order on production
   - Check real email inbox
   - Verify Brevo logs show Delivered ✓

---

## 📝 Code Files Reference

| File | Purpose |
|------|---------|
| `src/lib/brevo.ts` | Brevo service + template IDs |
| `src/hooks/brevo/sendOrderConfirmationEmail.ts` | Order email trigger |
| `src/collections/Orders/confirmWorkshopBookings.ts` | Booking email trigger |
| `src/plugins/index.ts` | Hook registration (afterChange) |
| `public/email-templates/10-order-confirmation.html` | Template 1 HTML |
| `public/email-templates/05-workshop-booking-confirmation.html` | Template 2 HTML |
