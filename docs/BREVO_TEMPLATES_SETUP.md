# Brevo Email Templates Setup — Fermentfreude

> **Status:** Templates disabled in Brevo. This guide enables them.  
> **Deadline:** Before going live with checkout/orders.

---

## 🎯 Complete Template Mapping

Your app expects **6 email templates** with specific IDs. Map them in Brevo dashboard.

| Template ID | Name | HTML File | Trigger | Status |
|---|---|---|---|---|
| **2** | ORDER_CONFIRMATION | `10-order-confirmation.html` | After Stripe payment succeeds (sends receipt + booking confirmation) | ✅ Active |
| **3** | WORKSHOP_BOOKING_CONFIRMATION | `05-workshop-booking-confirmation.html` | When workshop booking is confirmed (after order payment) | ✅ Active |
| **4** | COURSE_ENROLLMENT | `15-course-enrollment.html` | When user enrolls in online course | ✅ Active |
| **5** | VOUCHER_PURCHASED | `19-voucher-purchased.html` | When gift voucher is purchased | ✅ Active |
| **6** | WELCOME | `01-account-creation.html` | When new user account is created | ✅ Active |
| **7** | PASSWORD_RESET | `03-password-reset.html` | When user requests password reset | ✅ Active |

---

## 📧 Template Variables (What Each Template Receives)

### Template 1 — ORDER_CONFIRMATION (Receipt)
**When sent:** After Stripe payment webhook confirms order  
**To:** Customer email  
**Variables the template receives:**
```
{{ params.ORDER_ID }}      → Order reference (e.g., "ord_abc123")
{{ params.CUSTOMER_NAME }} → Customer name or email
{{ params.ORDER_ITEMS }}   → Item list (e.g., "Kombucha Kit x1, Tempeh Starter x2")
{{ params.ORDER_TOTAL }}   → Total amount (e.g., "99.00")
{{ params.ORDER_DATE }}    → Date in German format (e.g., "20.04.2026")
```
**HTML file:** `public/email-templates/10-order-confirmation.html`

---

### Template 2 — WORKSHOP_BOOKING_CONFIRMATION (Booking Receipt)
**When sent:** After order confirmed (Order Confirmation sent → booking status = "confirmed")  
**To:** Customer email  
**Variables the template receives:**
```
{{ params.WORKSHOP_TITLE }} → Workshop name (e.g., "Kombucha 101")
{{ params.WORKSHOP_DATE }}  → Date string (e.g., "25.04.2026")
{{ params.GUEST_COUNT }}    → Number of participants (e.g., "2")
{{ params.TOTAL_PRICE }}    → Price paid (e.g., "89.00")
{{ params.CUSTOMER_NAME }}  → Customer name or email
{{ params.BOOKING_ID }}     → Booking reference (e.g., "book_xyz789")
```
**HTML file:** `public/email-templates/05-workshop-booking-confirmation.html`

---

### Template 3 — COURSE_ENROLLMENT
**Variables:**
```
{{ params.COURSE_SLUG }}   → Course identifier
{{ params.CUSTOMER_NAME }} → User name or email
{{ params.COURSE_URL }}    → Direct link to course
```
**HTML file:** `public/email-templates/15-course-enrollment.html`

---

### Template 4 — VOUCHER_PURCHASED
**Variables:**
```
{{ params.VOUCHER_CODE }}  → Redeemable code
{{ params.VOUCHER_VALUE }} → Amount (e.g., "50.00 EUR")
{{ params.CUSTOMER_NAME }} → Buyer name or email
{{ params.VALID_UNTIL }}   → Expiry date
```
**HTML file:** `public/email-templates/19-voucher-purchased.html`

---

### Template 5 — WELCOME
**Variables:**
```
{{ params.CUSTOMER_NAME }} → New user name or email
```
**HTML file:** `public/email-templates/01-account-creation.html`

---

### Template 6 — PASSWORD_RESET
**Variables:**
```
{{ params.RESET_LINK }} → Password reset URL
{{ params.CUSTOMER_NAME }} → User name or email
```
**HTML file:** `public/email-templates/03-password-reset.html`

---

## 🚀 Setup Steps (Brevo Dashboard)

### Step 1: Go to Transactional Templates

1. Open [Brevo Dashboard](https://app.brevo.com)
2. Click **Transactional** → **Templates**
3. You should see 6 disabled templates (they exist but are inactive)

### Step 2: Create/Enable Template 1 (ORDER_CONFIRMATION)

1. Click on Template ID **1** or the first disabled template
2. Click **Edit** or **Create**
3. Fill in:
   - **Template Name:** ORDER_CONFIRMATION
   - **Subject:** `Deine Bestellung bei Fermentfreude — {{params.ORDER_ID}}`
   - **From Email:** Keep as `kontakt@fermentfreude.at`
   - **From Name:** Fermentfreude
4. In the **Design** tab, paste the HTML from `public/email-templates/10-order-confirmation.html`
5. **Save and Activate** (make sure status is **Active**, not Draft)

### Step 3-6: Repeat for Templates 2-6

Do the same for each template:
- Template 2: Use `05-workshop-booking-confirmation.html`
- Template 3: Use `15-course-enrollment.html`
- Template 4: Use `19-voucher-purchased.html`
- Template 5: Use `01-account-creation.html`
- Template 6: Use `03-password-reset.html`

⚠️ **CRITICAL:** Each template must be **Active** (not Draft/Disabled)

---

## ✅ Verification Checklist

After creating all 6 templates:

- [ ] Template 1 (ORDER_CONFIRMATION) is **Active**
- [ ] Template 2 (WORKSHOP_BOOKING_CONFIRMATION) is **Active**
- [ ] Template 3 (COURSE_ENROLLMENT) is **Active**
- [ ] Template 4 (VOUCHER_PURCHASED) is **Active**
- [ ] Template 5 (WELCOME) is **Active**
- [ ] Template 6 (PASSWORD_RESET) is **Active**
- [ ] All templates have correct **From Email:** `kontakt@fermentfreude.at`
- [ ] All templates have correct **From Name:** `Fermentfreude`

---

## 🧪 Test the Flow End-to-End

### Scenario: Order a Workshop + Get Confirmation Emails

1. **Start checkout:**
   - Go to `http://localhost:3001/workshops/tempeh`
   - Add workshop to cart
   - Proceed to checkout

2. **Fill guest details:**
   - Name: Test Customer
   - Email: your-test-email@gmail.com
   - Address: Can skip (digital product)

3. **Complete payment:**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Future date: `12/34`
   - CVC: `123`

4. **Check email:**
   - Template 1 (ORDER_CONFIRMATION): Should arrive first with order details
   - Template 2 (WORKSHOP_BOOKING_CONFIRMATION): Should arrive second with booking details
   - Check Brevo dashboard **Transactional → Logs** for delivery status

### Expected Email Sequence

| # | Template | Status | Email Subject | Recipient |
|---|---|---|---|---|
| 1️⃣ | ORDER_CONFIRMATION | Should deliver | "Deine Bestellung bei Fermentfreude — ord_..." | Customer email |
| 2️⃣ | WORKSHOP_BOOKING_CONFIRMATION | Should deliver | "Workshop Buchung bestätigt — book_..." | Customer email |

---

## 🔍 Troubleshooting

### Problem: Template still shows "Disabled"

**Solution:**
1. Edit template
2. Scroll to bottom
3. Click **Save and Activate** (not just Save)
4. Check status changes to **Active** (green checkmark)

### Problem: Email shows "Error: template is disabled"

**Solution:** Same as above — templates must be Active, not Draft

### Problem: Email arrives but variables are empty

**Cause:** Template variables not matching. Check:
- Template expects `{{params.ORDER_ID}}` (exact case)
- Code sends `ORDER_ID` (must match exactly)

**Solution:** Compare template HTML with variables in code:
- ORDER_CONFIRMATION: Needs `ORDER_ID`, `CUSTOMER_NAME`, `ORDER_ITEMS`, `ORDER_TOTAL`, `ORDER_DATE`
- WORKSHOP_BOOKING_CONFIRMATION: Needs `WORKSHOP_TITLE`, `WORKSHOP_DATE`, `GUEST_COUNT`, `TOTAL_PRICE`, `CUSTOMER_NAME`, `BOOKING_ID`

### Problem: Email doesn't arrive (0.00% delivery)

**Check:**
1. Sender domain `fermentfreude.at` is authenticated (DNS SPF/DKIM/DMARC all green)
2. Recipient email is valid (not temporary/disposable)
3. Check Brevo logs for bounce reason

---

## 📊 Monitor Email Delivery

After testing, check **Brevo Dashboard → Transactional → Statistics**:

```
Expected metrics after first order:
- Sent: 2 (ORDER_CONFIRMATION + WORKSHOP_BOOKING_CONFIRMATION)
- Delivered: 2
- Bounced: 0
- Opened: 1-2 (users reading confirmations)
```

If Delivered = 0, check individual logs:
- **Brevo → Transactional → Logs**
- Click on each email
- Look at "History" tab for bounce reason

---

## 🎯 Production Deployment

When ready for production:

1. Ensure all 6 templates are in **Brevo production account**
2. Set production Vercel env vars:
   ```
   BREVO_API_KEY=xkeysib-prod-key-here
   BREVO_SENDER_EMAIL=kontakt@fermentfreude.at
   BREVO_SENDER_NAME=Fermentfreude
   ```
3. Test one order on production
4. Monitor Brevo dashboard for delivery

---

## 📝 Notes

- **Language:** All templates are in German (de-DE) — matches customer base
- **Sender:** All templates send from `kontakt@fermentfreude.at` (authenticated domain)
- **Variables:** Case-sensitive — `{{params.ORDER_ID}}` ≠ `{{params.order_id}}`
- **Testing:** Always test with real email addresses (Gmail, Outlook) — not temporary emails
