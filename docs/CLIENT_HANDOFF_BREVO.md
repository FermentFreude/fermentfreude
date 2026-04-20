# Client Handoff: Brevo Email Setup

> **Purpose:** Developer → Client transition for Brevo transactional email management  
> **Audience:** Developers handing off the project; Clients taking over  
> **Scope:** One-time setup, ongoing operations, troubleshooting

---

## Overview for Clients

Your FermentFreude website sends **automated order confirmation emails** using Brevo. You manage the email account directly — no developer action needed for day-to-day operations.

### What You Control

✅ Brevo account (login, credentials, API key)  
✅ Email sender authentication (domain DNS records)  
✅ Email templates (look & feel)  
✅ Email delivery logs & analytics  
✅ Sender reputation & compliance  

### What the Developer Configured

✅ Integration code (website talks to Brevo)  
✅ Automation script (creates templates automatically)  
✅ Email logic (when emails are sent)  

---

## Three-Step Client Setup (First Time Only)

1. **[CLIENT_BREVO_SETUP.md](CLIENT_BREVO_SETUP.md)** — Step-by-step guide for client to:
   - Create Brevo account
   - Authenticate their email domain (DNS records)
   - Generate API key
   - Run template setup script (`pnpm brevo-setup-templates`)
   - Test an order to confirm emails work

2. **Duration:** ~15 minutes (+ 24 hours for DNS propagation)

3. **After setup:** Emails work automatically on every order/booking

---

## Ongoing Management (Client Responsibility)

- **Weekly:** Check Brevo dashboard for delivery metrics (takes 5 min)
- **Monthly:** Review email health (bounce rate, complaints)
- **Quarterly:** Audit sender reputation
- **Annually:** Renew domain if expiring

See **[CLIENT_BREVO_OPERATIONS.md](CLIENT_BREVO_OPERATIONS.md)** for detailed procedures.

---

## Files for the Client

Hand the client these three documents:

| File | Purpose | Audience |
|---|---|---|
| **CLIENT_BREVO_SETUP.md** | Initial setup (one-time) | Non-technical client, first-time users |
| **CLIENT_BREVO_OPERATIONS.md** | Daily/weekly/monthly operations | Client managing Brevo after launch |
| **This file** | Overview & context | Anyone transitioning the project |

---

## Implementation Summary (For Developers)

### What's in the Code

1. **`src/lib/brevo.ts`** — Email service module
   ```typescript
   export const BREVO_TEMPLATES = {
     ORDER_CONFIRMATION: 2,
     WORKSHOP_BOOKING_CONFIRMATION: 3,
     COURSE_ENROLLMENT: 4,
     VOUCHER_PURCHASED: 5,
     WELCOME: 6,
     PASSWORD_RESET: 7,
   }
   ```
   
2. **`scripts/brevo-setup-templates.mjs`** — Automated setup script
   - Reads HTML templates from `public/email-templates/`
   - Creates all 6 templates in Brevo via API
   - Sets them as active immediately
   - Returns template IDs (2-7)
   - Run with: `pnpm brevo-setup-templates`

3. **Email hooks** in Payload CMS (`src/collections/Orders/`)
   - After order created → sends ORDER_CONFIRMATION email
   - After booking confirmed → sends WORKSHOP_BOOKING_CONFIRMATION email
   - Passes dynamic data (order ID, customer email, etc.) to Brevo

4. **Environment variable:** `BREVO_API_KEY`
   - Required in dev, staging, and production
   - Set in `.env` (dev) or Vercel environment (prod)

### Template ID Strategy

**Why IDs are 2-7 (not 1-6):**
- Brevo auto-assigns template IDs sequentially
- First template created = ID 2, second = ID 3, etc.
- This is normal behavior; not configurable
- IDs are stable once set (won't change)

**If client creates templates in different order:**
- Template IDs will be different (not 2-7)
- Solution: Update `src/lib/brevo.ts` with actual IDs
- Or: Update `BREVO_TEMPLATE_*` env vars (if implemented)

### Security

- **API key:** Never commit to GitHub
- **Email addresses:** Logged in CMS but not exposed publicly
- **Sender domain:** Must be authenticated with DNS records
- **GDPR:** Orders contain personal data; ensure privacy policy complies

---

## Troubleshooting for Developers

### "Emails not sending?"

Check in order:
1. Is `BREVO_API_KEY` set correctly in environment?
2. Is the domain authenticated in Brevo (DNS records added)?
3. Are template IDs (2-7) correct in `src/lib/brevo.ts`?
4. Check Brevo logs: https://app.brevo.com/transactional/logs

### "Wrong template ID?"

If Brevo auto-assigned different IDs:
```typescript
// Update src/lib/brevo.ts with actual IDs from Brevo
export const BREVO_TEMPLATES = {
  ORDER_CONFIRMATION: 123,  // Your actual ID
  WORKSHOP_BOOKING_CONFIRMATION: 124,
  // etc...
}
```

Then re-deploy.

### "Template setup script failed?"

Run: `pnpm brevo-setup-templates`

If it fails:
- Check API key: `echo $BREVO_API_KEY`
- Verify domain is authenticated in Brevo (must show ✅)
- Check Brevo status: https://status.brevo.com

---

## Integration Points (For Reference)

### Where Emails Get Sent

1. **Order confirmation**
   - Location: `src/collections/Orders/stripeWebhooks.ts`
   - Trigger: Stripe payment successful
   - Template: BREVO_TEMPLATES.ORDER_CONFIRMATION

2. **Workshop booking confirmation**
   - Location: `src/collections/Orders/confirmWorkshopBookings.ts`
   - Trigger: Booking linked to order
   - Template: BREVO_TEMPLATES.WORKSHOP_BOOKING_CONFIRMATION

3. **Other emails** (if implemented)
   - Welcome email: User signs up
   - Password reset: User requests reset
   - Course enrollment: User completes course

### Email Parameters (Dynamic Data)

Brevo templates use `{{params.*}}` syntax for dynamic content:

```
Order ID: {{params.ORDER_ID}}
Customer Name: {{params.CUSTOMER_NAME}}
Customer Email: {{params.CUSTOMER_EMAIL}}
Workshop Title: {{params.WORKSHOP_TITLE}}
Booking Date: {{params.BOOKING_DATE}}
```

These values are passed from `src/lib/brevo.ts` when `sendTemplateEmail()` is called.

---

## Next Steps

### For Developers Handing Off

1. ✅ Confirm `scripts/brevo-setup-templates.mjs` runs without errors
2. ✅ Verify email template IDs are correct in `src/lib/brevo.ts`
3. ✅ Test: Place a sample order, confirm emails arrive
4. ✅ Provide client with `CLIENT_BREVO_SETUP.md` + `CLIENT_BREVO_OPERATIONS.md`
5. ✅ Walk client through setup (or watch them do it)
6. ✅ Confirm first real order sends emails correctly

### For Clients After Handoff

1. ✅ Create Brevo account (see [CLIENT_BREVO_SETUP.md](CLIENT_BREVO_SETUP.md))
2. ✅ Authenticate domain with DNS records
3. ✅ Generate API key
4. ✅ Run template setup script
5. ✅ Place test order to verify
6. ✅ Monitor dashboard weekly (see [CLIENT_BREVO_OPERATIONS.md](CLIENT_BREVO_OPERATIONS.md))

---

## FAQ

**Q: Can the client modify email templates?**
A: Yes. They can edit templates directly in Brevo (Settings → Templates). Changes apply immediately to new orders.

**Q: What if the client's Brevo account is deleted?**
A: Emails will stop sending. They'd need to:
1. Create new Brevo account
2. Set up domain authentication again
3. Run `pnpm brevo-setup-templates` again

**Q: Can we use a different email service?**
A: Yes, but would require code changes. Currently hardcoded to Brevo. Would need developer work to switch to SendGrid, Mailgun, etc.

**Q: What if emails go to spam?**
A: Usually means domain authentication is incomplete (DNS records not set). See [CLIENT_BREVO_OPERATIONS.md](CLIENT_BREVO_OPERATIONS.md) → "Emails going to spam folder".

**Q: How much does Brevo cost?**
A: Free tier covers unlimited transactional emails. This project uses transactional (not marketing) so cost is $0.

**Q: Can we add more templates later?**
A: Yes. Create new template in Brevo, update `BREVO_TEMPLATES` in code, add corresponding email hook.

---

## Support Handoff

**Developer leaves this project:**

- [ ] Confirm all 3 client documents are provided
- [ ] Confirm client successfully ran setup script
- [ ] Confirm test order generated emails
- [ ] Document where future dev should contact (Brevo support, domain registrar, etc.)
- [ ] Leave contact info for integration questions only

**Client takes over:**

- [ ] Read [CLIENT_BREVO_SETUP.md](CLIENT_BREVO_SETUP.md)
- [ ] Complete one-time setup
- [ ] Test an order
- [ ] Bookmark [CLIENT_BREVO_OPERATIONS.md](CLIENT_BREVO_OPERATIONS.md) for reference
- [ ] Contact developer only if integration is broken (not for Brevo account issues)
