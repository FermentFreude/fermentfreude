# Stripe Setup Guide for David & Marcel

**What this is:** Everything you need to configure in Stripe to accept workshop payments  
**When to do it:** Start in TEST mode now, switch to LIVE mode before public launch

---

## Part 1: Initial Setup (20 minutes)

### Step 1: Create Stripe Account
1. Go to: https://dashboard.stripe.com/register
2. Enter business email
3. Create password
4. Verify email (check inbox)
5. Choose **Austria** as country
6. Select business type: "Company" or "Sole Proprietorship"

### Step 2: Complete Business Profile
Go to: Settings (⚙️ icon top right) → Business settings

Fill in:
- **Legal business name:** Your registered company name
- **Business address:** Full Austrian address
- **VAT/Tax ID:** Your ATU number (e.g., ATU12345678)
- **Phone:** Business phone number
- **Industry:** Choose "Education" or "Food & Beverage"
- **Website:** fermentfreude.vercel.app

### Step 3: Add Bank Account
Go to: Settings → Payouts

- **Country:** Austria
- **IBAN:** Your business bank IBAN
- **Account holder name:** Must exactly match business name

**Payout schedule:** Leave as "Daily" (automatic payouts every day)

---

## Part 2: Get API Keys for Testing (5 minutes)

### Make sure you're in TEST MODE:
Look at top right of dashboard - toggle should say **"Test mode"** (not live)

### Get the keys:
1. Go to: Developers → API keys
2. You'll see 2 keys:

**Publishable key:**
- Starts with `pk_test_...`
- Click "Reveal test key"
- **Copy entire key** → Send to Alaa

**Secret key:**
- Starts with `sk_test_...`
- Click "Reveal test key"
- **Copy entire key** → Send to Alaa

⚠️ **Never share these publicly or post in Slack channels**

---

## Part 3: Create Webhook (10 minutes)

### What is a webhook?
It's how Stripe tells your website "A payment succeeded!" so you can create the customer's order.

### Setup:
1. Go to: Developers → Webhooks
2. Make sure **Test mode** toggle is ON
3. Click **"+ Add endpoint"**

**Endpoint URL:** Ask Alaa for the exact staging URL, it looks like:
```
https://fermentfreude-git-staging-[something].vercel.app/api/stripe/webhooks
```

4. Click **"Select events"**
5. Check these boxes:
   - ☑️ `checkout.session.completed`
   - ☑️ `checkout.session.async_payment_succeeded`
   - ☑️ `checkout.session.async_payment_failed`
   - ☑️ `payment_intent.succeeded`
   - ☑️ `payment_intent.payment_failed`

6. Click **"Add events"**
7. Click **"Add endpoint"**

8. **Copy the Signing secret:**
   - It appears on the next screen
   - Starts with `whsec_...`
   - Click to reveal → Copy → **Send to Alaa**

---

## Part 4: Configure Payment Methods (5 minutes)

Go to: Settings → Payment methods

**Enable these (recommended):**
- ☑️ **Cards** (Visa, Mastercard, Amex) — REQUIRED, always on
- ☑️ **Apple Pay** — Free, no setup needed
- ☑️ **Google Pay** — Free, no setup needed

**Optional (can add later):**
- ☐ **SEPA Direct Debit** — Bank transfers (common in Austria/Germany)
- ☐ **Klarna** — Buy now, pay later
- ☐ **EPS** — Austrian bank transfer

**Recommendation:** Start with just Cards + Apple Pay + Google Pay

---

## Part 5: Enable Stripe Tax (10 minutes)

### Why?
Austrian VAT is 20%, but it changes based on customer location (EU rules). Stripe calculates this automatically.

### Setup:
1. Go to: Settings → Tax
2. Click **"Get started with Stripe Tax"**
3. Click **"Turn on Stripe Tax"**
4. **Tax registration:**
   - Country: Austria
   - Registration number: Your ATU number
   - Select: "I am registered for VAT"
5. Enable: **"Automatic tax calculation"**
6. Click **"Save"**

**Cost:** €0.005 per transaction (half a cent per booking)

**What it does:**
- Adds 20% VAT for Austrian customers
- Calculates correct VAT for EU customers
- Shows tax separately on receipt
- Generates tax reports

---

## Part 6: Customize Checkout (Optional, 5 minutes)

Go to: Settings → Branding

Upload:
- **Logo:** Your main logo (square version works best)
- **Icon:** Small circular logo/icon
- **Brand color:** Your brown/beige brand color

This makes the Stripe checkout page match your website design.

---

## Part 7: Test Everything (30 minutes)

### Test Cards (only work in Test Mode):

| Card Number | What Happens |
|-------------|--------------|
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔐 Requires authentication (3D Secure) |

**For ALL test cards:**
- Expiry: Any future date (e.g., 12/28)
- CVC: Any 3 digits (e.g., 123)
- Postal code: Any 5 digits

### Testing Steps:

**Test 1: Single Guest Booking**
1. Go to staging website
2. Choose any workshop
3. Click "Jetzt buchen" (Book Now)
4. Select date and **1 guest**
5. Add to cart
6. Go to checkout
7. Use test card `4242 4242 4242 4242`
8. Complete purchase
9. ✅ Check: Payment appears in Stripe Dashboard → Payments
10. ✅ Check: Order appears in website /admin → Orders

**Test 2: Multiple Guests**
1. Add workshop with **4 guests**
2. Use test card `4242 4242 4242 4242`
3. ✅ Verify total is €396 (4 × €99)

**Test 3: Authentication Required**
1. Add any workshop
2. Use card `4000 0025 0000 3155`
3. A popup appears asking you to authenticate
4. Click **"Authenticate"** or **"Complete"**
5. Payment succeeds

**Test 4: Declined Card**
1. Add workshop
2. Use card `4000 0000 0000 0002`
3. ✅ Should show error: "Your card was declined"
4. Customer can try different card

**Test at least 5 different bookings before moving to live mode!**

---

## Part 8: Going LIVE (Do this when ready to launch)

### Step A: Activate Your Account
1. Go to: Settings → Account details
2. Click **"Activate payments"**
3. You'll need to verify your identity:
   - Upload passport or ID card
   - Provide business registration documents
   - Answer questions about business

**⏱️ This takes 1-2 business days for Stripe to approve**

### Step B: Get LIVE API Keys

**Turn OFF Test Mode:**
1. Click toggle in top right: **"Test mode"** → **"Live mode"**
2. Go to: Developers → API keys

You'll see NEW keys (different from test):

- **Publishable key** (starts with `pk_live_...`) → Copy → Send to Alaa
- **Secret key** (starts with `sk_live_...`) → Copy → Send to Alaa

### Step C: Create LIVE Webhook

1. Make sure you're in **Live mode** (toggle top right)
2. Go to: Developers → Webhooks
3. Click **"+ Add endpoint"**
4. **Endpoint URL:** Ask Alaa for production URL:
   ```
   https://fermentfreude.vercel.app/api/stripe/webhooks
   ```
5. Select same events as before
6. Copy **Signing secret** (starts with `whsec_...`) → Send to Alaa

### Step D: Test on Production with Real Card

⚠️ **This charges your real card!**

1. Go to **production** website (not staging)
2. Book 1 workshop ticket
3. Use **your real credit card**
4. Complete payment
5. ✅ Check: Payment in Stripe Dashboard (Live mode)
6. ✅ Check: Order in website admin
7. **Immediately refund:**
   - Stripe Dashboard → Payments → find your payment
   - Click "⋯" menu → **Refund**
   - Enter full amount → Confirm

Money returns to your card in 5-10 days.

---

## Part 9: Post-Launch Monitoring

### Daily Checks (First Week):

**Check Payments Tab:**
- Go to: Payments
- ✅ All payments green (succeeded)?
- ❌ Any red (failed)? → Investigate
- Verify amounts: €99, €198, €297, €396

**Check Payouts Tab:**
- Money arriving in your bank?
- Check dates (daily payouts = next business day)

**Check Disputes Tab:**
- Should be empty
- If customer disputes payment → respond within 7 days

### Weekly Checks (After First Week):
- Total revenue vs. expected
- Average booking size
- Payment failure rate (should be <5%)

---

## Summary Checklist

### Test Mode Setup:
- [ ] Stripe account created
- [ ] Business info completed
- [ ] Bank account added
- [ ] Test API keys sent to Alaa:
  - [ ] `pk_test_...` (publishable)
  - [ ] `sk_test_...` (secret)
- [ ] Test webhook created
- [ ] Webhook secret sent to Alaa: `whsec_...`
- [ ] Payment methods configured (Cards + Apple/Google Pay)
- [ ] Stripe Tax enabled
- [ ] Tested 5+ bookings with test cards
- [ ] All test payments appeared in Stripe
- [ ] All test orders appeared in website admin

### Live Mode Setup (Launch Day):
- [ ] Account activated (1-2 days wait!)
- [ ] Identity verified
- [ ] Live API keys sent to Alaa:
  - [ ] `pk_live_...`
  - [ ] `sk_live_...`
- [ ] Live webhook created
- [ ] Live webhook secret sent to Alaa
- [ ] Test purchase with real card completed
- [ ] Test purchase refunded
- [ ] Ready to accept customer payments! 🎉

---

## The 3 Keys You Send to Alaa

**For Testing (Test Mode):**
1. `pk_test_...` → Publishable key
2. `sk_test_...` → Secret key
3. `whsec_...` → Webhook signing secret

**For Production (Live Mode):**
1. `pk_live_...` → Publishable key
2. `sk_live_...` → Secret key
3. `whsec_...` → Webhook signing secret (NEW one!)

You have 6 keys total, but only use 3 at a time.

---

## Common Questions

**Q: Can customers pay without creating an account?**  
A: Yes, Stripe checkout allows guest checkout.

**Q: What if customer's card is declined?**  
A: They see an error and can try a different card immediately.

**Q: How long until we get the money?**  
A: Daily payouts = next business day. Weekend payments arrive Monday.

**Q: Can we refund a customer?**  
A: Yes! Stripe Dashboard → Payments → find payment → Refund button.

**Q: What does Stripe cost?**  
A: **1.4% + €0.25 per transaction** for European cards.  
Example: €99 workshop = €1.64 fee, you receive €97.36.

**Q: Do we need to file VAT ourselves?**  
A: Stripe Tax calculates it, but you still file your VAT return normally (quarterly/annually). Stripe provides reports to help.

**Q: What if website goes down during a payment?**  
A: Stripe still processes the payment. When site comes back, the webhook retries and creates the order.

**Q: Can customer get a receipt?**  
A: Yes, Stripe emails it automatically. Also available in Stripe Dashboard → Payments → click payment → Send receipt.

---

## Support Contacts

**Stripe Support:**
- 💬 Dashboard → Help (bottom left) → Contact support
- 📧 support@stripe.com
- 📞 +43 720 88 30 93 (Austria)
- ⏰ 24/7 for urgent payment issues

**What they help with:**
- Account activation delays
- Payment failures
- Payout issues
- Technical webhook problems
- Security concerns

**Your Developer (Alaa):**
- Setting up keys in Vercel
- Webhook troubleshooting
- Testing assistance
- Integration questions

---

## Important Reminders

✅ **DO:**
- Test thoroughly in Test Mode before going live
- Keep API keys confidential
- Check for test payments in Stripe Dashboard
- Wait for account activation before launch (1-2 days)
- Monitor payments daily for first week

❌ **DON'T:**
- Share API keys in public Slack/Discord
- Skip testing (test at least 5 bookings!)
- Switch to Live Mode before website is ready
- Forget to create the live webhook (different from test)
- Panic if a payment fails (customers can retry)

---

**Questions?** Ask Alaa before changing anything in Stripe!

**Good luck with the setup!** 🚀

---

*Created: March 11, 2026*  
*Version: 1.0*  
*For: FermentFreude Founders*
