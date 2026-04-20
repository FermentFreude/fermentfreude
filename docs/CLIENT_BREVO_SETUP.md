# Client Brevo Setup Guide

> **For:** Non-technical client managing their own Brevo transactional email account  
> **Time:** ~15 minutes  
> **Outcome:** Fully functional automated order confirmation emails

---

## Overview

FermentFreude uses **Brevo** to send automated transactional emails:
- ✅ Order confirmations
- ✅ Workshop booking confirmations
- ✅ Welcome emails
- ✅ Password reset emails

You control the Brevo account directly. This guide walks you through setup.

---

## Step 1: Create a Brevo Account

1. Go to **https://www.brevo.com/**
2. Click **"Sign up"** (top right)
3. Enter your email address
4. Create a strong password
5. Verify your email address (check inbox)
6. Complete profile setup (company name, etc.)

---

## Step 2: Authenticate Your Email Domain

### Why?
Brevo needs to verify that `kontakt@fermentfreude.at` is really yours before sending emails.

### How:

1. **Log into Brevo:** https://app.brevo.com
2. **Go to Settings** (left sidebar → Transactional → Senders & Domains)
3. **Click "Add a Sender"** or **"Add a Domain"**
4. **Enter domain:** `fermentfreude.at`
5. **Sender email:** `kontakt@fermentfreude.at`
6. **Sender name:** `FermentFreude`
7. **Click "Authenticate Domain"**

Brevo will give you **DNS records** to add to your domain registrar:

| Record Type | Name | Value |
|---|---|---|
| **TXT** | `default._domainkey.fermentfreude.at` | (Brevo provides) |
| **TXT** | `brevo._domainkey.fermentfreude.at` | (Brevo provides) |
| **TXT** | `fermentfreude.at` | (SPF record - Brevo provides) |
| **CNAME** | (if needed) | (Brevo provides) |

**Add these to your domain registrar** (GoDaddy, Namecheap, etc. — wherever you registered `fermentfreude.at`).

⏱️ **Wait 24 hours** for DNS to propagate, then return to Brevo to verify. Brevo will show ✅ when complete.

---

## Step 3: Generate API Key

### Why?
Your website needs this key to authenticate with Brevo's API and send emails.

### How:

1. **Log into Brevo:** https://app.brevo.com
2. **Go to Settings** (left sidebar → SMTP & API → API keys)
3. **Click "Create a new API key"**
4. **Name it:** `FermentFreude Website`
5. **Copy the key** (looks like: `xkeysib-72037b27cccf...`)
6. **Save it securely** — you'll need it in Step 4

⚠️ **Keep this key private** — never share it or commit to GitHub.

---

## Step 4: Set Up on Your Website (Developer Task)

### For your developer:

1. **Send them the API key** from Step 3 (securely)
2. **They will:**
   - Add it to your hosting environment (Vercel, etc.)
   - Set environment variable: `BREVO_API_KEY=xkeysib-72037b27cccf...`
   - Run command: `pnpm brevo-setup-templates`
   - This creates all 6 email templates automatically

### If you're doing it yourself:

```bash
# 1. Clone the website code
git clone https://github.com/FermentFreude/fermentfreude.git
cd fermentfreude

# 2. Install dependencies
pnpm install

# 3. Create .env file with your API key
echo "BREVO_API_KEY=xkeysib-72037b27cccf..." > .env

# 4. Create all email templates
pnpm brevo-setup-templates

# Output should show:
# ✅ Successful: 6/6
#    • ORDER_CONFIRMATION (Brevo ID: 2)
#    • WORKSHOP_BOOKING_CONFIRMATION (Brevo ID: 3)
#    • COURSE_ENROLLMENT (Brevo ID: 4)
#    • VOUCHER_PURCHASED (Brevo ID: 5)
#    • WELCOME (Brevo ID: 6)
#    • PASSWORD_RESET (Brevo ID: 7)
```

---

## Step 5: Test It Works

### Place a test order:

1. Go to your website: `https://fermentfreude.at`
2. **Add a workshop to cart** (e.g., Tempeh)
3. **Go to checkout**
4. **Enter your email address**
5. **Use test payment card:** `4242 4242 4242 4242` (expiry: 12/25, CVC: 123)
6. **Complete payment**
7. **Wait 10 seconds**
8. **Check your email** — you should receive 2 confirmation emails:
   - **Email 1:** Order receipt
   - **Email 2:** Workshop booking confirmation

✅ **If you got both emails, you're done!**

❌ **If no emails arrived:**
- Check spam folder
- See [Troubleshooting](#troubleshooting) below

---

## Step 6: Monitor Deliverability (Ongoing)

### View email logs:

1. **Log into Brevo:** https://app.brevo.com
2. **Go to Transactional → Logs**
3. **Search by recipient email**
4. You'll see:
   - ✅ Sent
   - ❌ Bounced (bad email address)
   - ⏳ Pending (in queue)
   - ⚠️ Blocked (domain issue)

### Maintain sender reputation:

- **Keep bounce rate low** (< 2%)
- **Remove invalid emails** from your list
- **Respond to complaints** (unsubscribe requests)
- **Monitor Brevo dashboard** weekly

---

## Troubleshooting

### "Emails not arriving"

**Check 1: Domain authentication**
- Go to Brevo → Settings → Senders & Domains
- Is your domain showing ✅ (green checkmark)?
- If ❌ red: DNS records not propagated yet; wait 24 hours

**Check 2: Email logs**
- Brevo → Transactional → Logs
- Search for your test email address
- Look for error messages (e.g., "Bounce", "Blocked", "Invalid")
- Common issues:
  - **Bounce:** Email address is invalid or doesn't exist
  - **Soft bounce:** Recipient mailbox full; will retry
  - **Hard bounce:** Permanent failure; address flagged
  - **Complaint:** Recipient marked as spam

**Check 3: API key**
- Is `BREVO_API_KEY` set in your hosting environment?
- Is it correct (copied fully, no extra spaces)?
- Try regenerating the key in Brevo and updating it

**Check 4: Website logs**
- Ask your developer to check application error logs
- Look for "Brevo" or "email" errors
- Common: 401 (wrong API key), 403 (domain not authenticated)

### "Templates not created"

If `pnpm brevo-setup-templates` fails:

1. **Check API key is set:** `echo $BREVO_API_KEY`
2. **Verify domain is authenticated:** Brevo → Settings → Senders & Domains (✅ needed)
3. **Re-run the command:** `pnpm brevo-setup-templates`
4. **Contact support** if it still fails (see below)

### "Too many emails bouncing"

- Check email list for typos/invalid addresses
- Send a test email to a known good address first
- If bouncing: domain authentication issue (not confirmed with DNS)

---

## Support & Contacts

### For Brevo issues:
- **Help Center:** https://www.brevo.com/en/help/
- **Support:** https://www.brevo.com/en/support/
- **Status Page:** https://status.brevo.com/

### For website integration issues:
- **Contact your developer:** [Developer contact]
- **Include:** Error message, screenshot, API key status

---

## Quick Reference

| Task | Where |
|---|---|
| Create account | https://www.brevo.com |
| Manage senders | Brevo → Settings → Senders & Domains |
| View logs | Brevo → Transactional → Logs |
| Generate API key | Brevo → Settings → API keys |
| Add DNS records | Your domain registrar (GoDaddy, etc.) |
| Test order | Your website checkout |
| Check email | Your inbox + spam folder |

---

## Next Steps

1. ✅ Create Brevo account (Step 1)
2. ✅ Authenticate domain (Step 2)
3. ✅ Generate API key (Step 3)
4. ⏳ **Developer sets up templates** (Step 4)
5. ✅ Test an order (Step 5)
6. ✅ Monitor logs weekly (Step 6)

**You're all set!** Orders will now send automated confirmation emails automatically.
