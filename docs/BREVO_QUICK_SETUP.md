# 🚀 Quick Brevo Templates Setup (Automated)

> **Fastest way to enable email confirmations for your workshop orders**

## Option A: Automated (Recommended) ⚡

Run this single command to create and activate all 6 templates at once:

```bash
pnpm brevo-setup-templates
```

**What it does:**
- Reads all 6 HTML template files from `public/email-templates/`
- Creates each template in your Brevo account via API
- Sets all templates to **Active** status
- Shows a summary with template IDs and creation status

**Example output:**
```
🚀 FermentFreude Brevo Templates Setup
================================================
✓ API key found: xkeysib-72037b27cccf...

[1/6] Creating template: Order Confirmation... ✅ Created (ID: 1)
[2/6] Creating template: Workshop Booking Confirmation... ✅ Created (ID: 2)
[3/6] Creating template: Course Enrollment... ✅ Created (ID: 3)
[4/6] Creating template: Voucher Purchased... ✅ Created (ID: 4)
[5/6] Creating template: Welcome Email... ✅ Created (ID: 5)
[6/6] Creating template: Password Reset... ✅ Created (ID: 6)

================================================
📊 Summary
================================================
✅ Successful: 6/6
   • ORDER_CONFIRMATION (Brevo ID: 1)
   • WORKSHOP_BOOKING_CONFIRMATION (Brevo ID: 2)
   • COURSE_ENROLLMENT (Brevo ID: 3)
   • VOUCHER_PURCHASED (Brevo ID: 4)
   • WELCOME (Brevo ID: 5)
   • PASSWORD_RESET (Brevo ID: 6)

✨ All templates created successfully!

Next steps:
1. Test an order: go to http://localhost:3001/workshops/tempeh
2. Add to cart and complete checkout
3. Check your email for confirmation emails
4. View delivery logs: https://app.brevo.com/transactional/logs
```

That's it! ✅ All templates are now **Active** and ready to send emails.

---

## Option B: Manual (If you prefer) 📋

If you want to create templates manually via Brevo dashboard:

1. Go to **[Brevo Dashboard](https://app.brevo.com)**
2. Navigate to **Transactional → Templates**
3. For each template 1-6, click **Create**, fill in:
   - **Template Name:** (from the list below)
   - **Subject:** (from the list below)
   - **From Email:** `kontakt@fermentfreude.at`
   - **From Name:** `Fermentfreude`
   - **HTML:** Paste content from `public/email-templates/` file
4. Click **Save and Activate**

### Template Reference Table

| ID | Template Name | HTML File | Subject |
|---|---|---|---|
| 2 | Order Confirmation | `10-order-confirmation.html` | `Deine Bestellung bei FermentFreude — {{params.ORDER_ID}}` |
| 3 | Workshop Booking Confirmation | `05-workshop-booking-confirmation.html` | `Workshop Buchung bestätigt — {{params.BOOKING_ID}}` |
| 4 | Course Enrollment | `15-course-enrollment.html` | `Kurs-Registrierung erfolgreich — {{params.COURSE_SLUG}}` |
| 5 | Voucher Purchased | `19-voucher-purchased.html` | `Dein Gutschein — {{params.VOUCHER_CODE}}` |
| 6 | Welcome Email | `01-account-creation.html` | `Willkommen bei FermentFreude — {{params.CUSTOMER_NAME}}` |
| 7 | Password Reset | `03-password-reset.html` | `Passwort zurücksetzen — FermentFreude` |

---

## ✅ Verify Templates Are Active

After setup (either method), verify all templates are active:

1. Go to **[Brevo Dashboard](https://app.brevo.com)**
2. **Transactional → Templates**
3. Check that all 6 templates show a **green checkmark** (Active status)

---

## 🧪 Test It Works

### Place a Test Order

1. Start dev server:
   ```bash
   pnpm dev
   ```

2. Add a workshop to cart:
   - Go to: `http://localhost:3001/workshops/tempeh`
   - Click: "Add to Cart"

3. Complete checkout:
   - Navigate to: `http://localhost:3001/checkout`
   - Email: `your-test-email@gmail.com`
   - Card: `4242 4242 4242 4242` (Stripe test card)
   - Date: `12/34`, CVC: `123`

4. Wait 5-10 seconds and check your email

### Expected Result

You should receive **2 emails**:

| Email 1 | Email 2 |
|---------|---------|
| **Order Confirmation** | **Workshop Booking** |
| Subject: "Deine Bestellung bei FermentFreude — ord_..." | Subject: "Workshop Buchung bestätigt — book_..." |
| Receipt + order details | Workshop details + booking info |
| Sent immediately after payment | Sent 2-5 sec after Email 1 |

---

## 🔍 Monitor Delivery

Check email delivery status in Brevo:

1. Go to **[Brevo Dashboard](https://app.brevo.com)**
2. **Transactional → Statistics**
3. Expected metrics:
   - **Sent:** 2
   - **Delivered:** 2
   - **Bounced:** 0
   - **Opened:** 1-2 (after customer reads)

4. For detailed logs: **Transactional → Logs** → Filter by your test email

---

## 🚨 Troubleshooting

### Issue: Script says "BREVO_API_KEY not found"

**Solution:** Add to `.env`:
```
BREVO_API_KEY=xkeysib-your-api-key-here
```

Get it from **[Brevo Dashboard](https://app.brevo.com) → Settings → SMTP & API → API Keys**

### Issue: Templates show as "Disabled" after setup

**This shouldn't happen with the automated script** (it sets `isActive: true`).  
If it does, click each template and make sure the status is **Active** (green checkmark).

### Issue: Email arrives but variables are empty

**Example:** Order ID field shows blank

**Check:** Template HTML has `{{params.ORDER_ID}}` (not `${ORDER_ID}` or `{ORDER_ID}`)

If missing, manually edit the template in Brevo dashboard.

### Issue: No emails arrive at all

**Check:**
1. Recipient email is valid (not temporary/fake)
2. Check spam/promotions folder
3. Check Brevo logs for bounce reason (invalid email, soft bounce, etc.)

---

## 📝 How the Script Works

Located at: `scripts/brevo-setup-templates.mjs`

The script:
1. Reads `.env` for `BREVO_API_KEY`
2. Reads each HTML template from `public/email-templates/`
3. Sends POST request to Brevo API for each template
4. Sets `isActive: true` to activate immediately
5. Displays results with Brevo template IDs

All 6 templates are created with:
- **Sender:** `kontakt@fermentfreude.at` (from env or default)
- **Sender Name:** `Fermentfreude` (from env or default)
- **Status:** Active (ready to send)

---

## 🎯 Production Deployment

When deploying to production:

1. Ensure `.env` has production Brevo API key
2. Run: `pnpm brevo-setup-templates` in production environment
3. Templates will be created in production Brevo account
4. Test with real order before going live

---

## ✨ That's It!

Your email confirmation system is now ready. Orders will automatically trigger:
- Receipt email (Template 1)
- Booking confirmation email (Template 2)

Both sent to customer within seconds of payment success. 🚀
