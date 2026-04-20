# Client Brevo Operations & Troubleshooting

> **For:** Client managing Brevo after launch  
> **Scenarios:** Email failures, bounce issues, monitoring, maintenance

---

## Daily Operations

### Monitor Email Health

**Weekly check (5 minutes):**

1. Log into **https://app.brevo.com**
2. Go to **Transactional → Logs**
3. **Look for:**
   - ✅ Green "Sent" = Good
   - ❌ Red "Bounce" = Problem (investigate)
   - ⚠️ Yellow "Pending" = Normal (will resolve)

### Check Key Metrics

**Brevo Dashboard shows:**
- **Delivery rate** — Should be > 95%
- **Bounce rate** — Should be < 2%
- **Complaint rate** — Should be < 0.1%
- **Open rate** — Informational (not critical)

If any metric is red/warning:
- Click it to see which emails failed
- See [Common Issues](#common-issues) below

---

## Common Issues & Solutions

### Issue 1: "Emails not being sent"

**Symptoms:**
- Order placed but no confirmation email
- Brevo logs show nothing
- Customer didn't receive anything

**Diagnosis:**

```
Step 1: Check website logs
└─ Ask developer to check app error logs
   Look for: "Brevo", "email", "error 401", "error 403"

Step 2: Verify API key is correct
└─ Go to Brevo → Settings → API keys
   Check: Key is still valid (not expired)
   If expired: Generate new key, update hosting env var

Step 3: Check domain authentication
└─ Go to Brevo → Settings → Senders & Domains
   Look for: Green ✅ next to fermentfreude.at
   If ❌ red: DNS records not set or propagated yet
```

**Solutions:**

| Problem | Fix |
|---|---|
| API key wrong/expired | Generate new API key, update environment variable |
| Domain not authenticated | Add DNS records (see CLIENT_BREVO_SETUP.md Step 2) |
| Website offline | Restart hosting / contact developer |
| Brevo account suspended | Check Brevo dashboard for alerts/warnings |

---

### Issue 2: "Emails bouncing"

**Symptoms:**
- Brevo logs show "Bounce" (red)
- Customer says they didn't receive email
- Bounce rate is high (> 5%)

**Types of Bounces:**

| Bounce Type | Meaning | Fix |
|---|---|---|
| **Hard Bounce** | Email address invalid (doesn't exist) | Remove from list, ask customer for correct address |
| **Soft Bounce** | Mailbox full or temporarily unavailable | Brevo retries automatically; not a problem |
| **Complaint** | Customer marked email as spam | Remove address from lists, consider sender reputation |
| **Suppressions** | Brevo auto-blocked the address | Check Brevo suppression list |

**Debug a bounce:**

1. Go to Brevo → Transactional → Logs
2. Search for customer's email address
3. Click the row to see full error message
4. Common errors:
   - `550 5.1.1 Invalid email address` — Typo in email
   - `452 4.2.2 Mailbox temporarily full` — Will retry, not your problem
   - `554 5.7.1 Spam complaint` — Customer marked as spam

**Action:**

- **Hard bounce:** Contact customer to verify email address
- **Soft bounce:** Do nothing (Brevo retries for 5 days)
- **Complaint:** Remove from list, ask customer to whitelist sender

---

### Issue 3: "Sender reputation declining"

**Symptoms:**
- More emails going to spam folder
- Bounce rate increasing
- Open rate dropping

**Causes:**
- Too many bounces (invalid addresses)
- Too many complaints (spam reports)
- Inconsistent sending patterns
- Domain authentication issues

**Prevention:**

1. **Keep list clean**
   - Remove hard bounces immediately
   - Regularly review Brevo suppression list

2. **Monitor metrics**
   - Bounce rate < 2%
   - Complaint rate < 0.1%
   - Delivery rate > 95%

3. **Maintain domain auth**
   - Verify DNS records are still in place
   - Check SPF/DKIM/DMARC green ✅ in Brevo

4. **Consistent sending**
   - Don't send huge batches suddenly
   - Maintain regular send pattern

---

### Issue 4: "Emails going to spam folder"

**Symptoms:**
- Customer gets email but it's in "Promotions" or "Spam" tab
- Not an issue (customer still received it)
- Can indicate sender reputation concern

**Why it happens:**
- Domain not fully authenticated (DNS issue)
- Email content triggers spam filters
- Customer has aggressive filters enabled
- Brevo IP has reputation issues (rare)

**Fix:**

1. **Verify domain authentication**
   - Brevo → Settings → Senders & Domains
   - All records should show ✅ (green)

2. **Check email content**
   - Brevo emails are transactional (not marketing), so should bypass filters
   - But if content has lots of links/images, may trigger filters
   - Contact developer if emails are being customized

3. **Educate customers**
   - Ask them to add `kontakt@fermentfreude.at` to contacts
   - This trains their email client that it's trusted

4. **Monitor trend**
   - If only 1-2 emails: Not a concern
   - If 20%+ going to spam: Contact Brevo support

---

### Issue 5: "API key leaked"

**Symptoms:**
- Key was accidentally committed to GitHub
- Key shared insecurely
- Concerned about security

**Action (Immediate):**

1. **Invalidate old key**
   - Go to Brevo → Settings → API keys
   - Click "Delete" on the compromised key
   - Takes effect immediately

2. **Generate new key**
   - Brevo → Settings → API keys
   - Click "Create a new API key"
   - Copy and save securely

3. **Update hosting**
   - Update `BREVO_API_KEY` environment variable
   - In Vercel: Settings → Environment Variables
   - Restart deployment (rebuild may be required)

4. **If key was public (GitHub, etc.)**
   - Consider rotating email credentials too
   - Monitor Brevo logs for suspicious activity

---

## Maintenance Tasks

### Monthly (30 minutes)

- [ ] Review Brevo dashboard metrics
- [ ] Check bounce rate trend
- [ ] Verify domain authentication still shows ✅
- [ ] Check for any Brevo alerts/warnings
- [ ] Review email logs for errors

### Quarterly (1 hour)

- [ ] Export email metrics (Brevo → Analytics)
- [ ] Review sender reputation score
- [ ] Check suppression list size
- [ ] Verify API key is still active
- [ ] Update emergency contacts

### Annually

- [ ] Renew domain if nearing expiration
- [ ] Review Brevo plan (pricing/limits)
- [ ] Audit DNS records for validity
- [ ] Plan for email volume growth

---

## When to Contact Support

### Contact Brevo Support:
- Domain authentication failing (DNS not working)
- High bounce rates for no apparent reason
- Delivery issues affecting > 10% of emails
- Account suspended or warnings
- IP reputation issues (emails rejected by mailboxes)
- General Brevo feature questions

**Brevo Support:** https://www.brevo.com/en/support/

### Contact Website Developer:
- Emails not sending (but Brevo logs show nothing)
- Website integration broken
- New email template not working
- Questions about checkout flow

### Contact Both:
- Unclear if it's Brevo or website issue
- Provide error messages from both sides

---

## Emergency Response

### Emails completely stopped

**5-minute diagnosis:**

1. **Is website online?**
   - Try to visit `https://fermentfreude.at`
   - If offline: Contact hosting provider

2. **Check Brevo status**
   - Visit https://status.brevo.com
   - Any red alerts? If yes: Wait or contact Brevo

3. **Check API key**
   - Brevo → Settings → API keys
   - Is your key still listed and valid?
   - If deleted/expired: Generate new one, update hosting

4. **Check domain**
   - Brevo → Settings → Senders & Domains
   - Is fermentfreude.at showing ✅?
   - If ❌: DNS records may have been deleted

5. **Check website logs**
   - Contact developer to check error logs
   - Look for: "Brevo", "email", "API", "401", "403"

**If still broken after 15 minutes:**
- Contact developer (code issue)
- Contact Brevo support (infrastructure issue)
- Use Status page to check for outages

---

## Advanced: Managing Templates

### View current templates

1. Go to Brevo → Transactional → Templates
2. You should see 6 templates:
   - Order Confirmation
   - Workshop Booking Confirmation
   - Course Enrollment
   - Voucher Purchased
   - Welcome Email
   - Password Reset

### Customize email templates

**⚠️ Warning:** If you edit templates directly in Brevo:
- Changes apply immediately
- All new orders get the new template
- No version control or rollback

**Recommended approach:**
- Tell developer what changes you want
- Developer updates template HTML
- Re-run: `pnpm brevo-setup-templates` (updates Brevo)
- Test a sample order

### If template gets deleted

**To restore:**

1. Ask developer to re-run: `pnpm brevo-setup-templates`
2. This will recreate all 6 templates in Brevo
3. No customer data is lost

---

## FAQ

**Q: Can I send marketing emails from Brevo?**
A: Yes, but this setup is for *transactional* emails (order confirmations, etc.). For marketing campaigns, contact your developer to set up a separate Brevo list.

**Q: What if I change my sender email?**
A: You'll need to authenticate the new domain in Brevo (add DNS records), then contact developer to update the code.

**Q: What's the cost?**
A: Brevo free tier allows unlimited transactional emails. No cost for order confirmations.

**Q: Can customers unsubscribe?**
A: Transactional emails are required notifications, not promotional. They can't unsubscribe. (Marketing emails would have unsubscribe links.)

**Q: What if Brevo has an outage?**
A: Orders will still be placed. Emails will retry for 5 days. When Brevo comes back up, they'll be sent.

**Q: How do I back up email templates?**
A: Go to Brevo → Templates, take screenshots or export. Brevo doesn't have an auto-backup, but templates are recreatable via the setup script.

---

## Key Contacts

| Who | What | When |
|---|---|---|
| **Brevo Support** | Email delivery, domain issues | Technical Brevo problems |
| **Website Developer** | Integration, checkout flow | Code/website problems |
| **Hosting Provider** | Uptime, environment variables | Website offline, env var issues |
| **Domain Registrar** | DNS records, domain renewal | Domain auth failing |

---

## Resources

- **Brevo Help Center:** https://www.brevo.com/en/help/
- **Brevo API Docs:** https://developers.brevo.com/
- **Brevo Status Page:** https://status.brevo.com/
- **Your Website Admin:** https://fermentfreude.at/admin
- **Email Logs:** https://app.brevo.com/transactional/logs
