# Developer: Client Brevo Handoff Checklist

> **Purpose:** Verify you're ready to hand off Brevo management to the client  
> **Before:** You give the client documentation  
> **Time:** ~30 minutes to verify + 15 minutes to walk client through setup

---

## Pre-Handoff Verification (Developer)

### ✅ Code & Setup

- [ ] `pnpm brevo-setup-templates` runs without errors
- [ ] Template IDs in `src/lib/brevo.ts` match Brevo dashboard (currently 2-7)
- [ ] `BREVO_API_KEY` is set in dev environment
- [ ] Email hooks are working (check logs after test order)
- [ ] Test card (`4242 4242 4242 4242`) triggers order emails in dev

### ✅ Documentation Created

- [ ] `docs/CLIENT_BREVO_SETUP.md` exists (step-by-step setup for client)
- [ ] `docs/CLIENT_BREVO_OPERATIONS.md` exists (ongoing management for client)
- [ ] `docs/CLIENT_HANDOFF_BREVO.md` exists (overview & context)
- [ ] `README.md` has Brevo section for future developers
- [ ] This checklist saved for reference

### ✅ Email Templates Tested

- [ ] Placed test order in dev
- [ ] Received ORDER_CONFIRMATION email
- [ ] Received WORKSHOP_BOOKING_CONFIRMATION email
- [ ] Both emails came from `kontakt@fermentfreude.at`
- [ ] Email content looks correct (HTML rendered properly)

---

## Handoff Workflow (Developer)

### Step 1: Prepare Documentation Package

**Files to give client:**
1. `docs/CLIENT_BREVO_SETUP.md` — Setup instructions
2. `docs/CLIENT_BREVO_OPERATIONS.md` — Ongoing management
3. `docs/CLIENT_HANDOFF_BREVO.md` — Overview (optional, if they want context)
4. Your contact info (for integration-only questions)

### Step 2: Walk Client Through Setup (or Observe)

**Call/meeting with client (30-45 minutes):**

1. **Have them read:** `CLIENT_BREVO_SETUP.md` Step 1-3
   - They create Brevo account
   - They authenticate domain (DNS records)
   - They generate API key

2. **You handle:** Hosting environment setup
   - Add `BREVO_API_KEY` to Vercel (or their hosting)
   - Ensure it's deployed

3. **Have them run:** `pnpm brevo-setup-templates`
   - Watch for success output (6/6 templates created)
   - Document the template IDs if different from 2-7

4. **Test together:** Place a test order
   - Use test card: `4242 4242 4242 4242`
   - Check their email for confirmations
   - Confirm both emails arrived

5. **Review:** `CLIENT_BREVO_OPERATIONS.md`
   - Show them where to check logs (Brevo dashboard)
   - Explain weekly monitoring tasks

### Step 3: Define Support Boundaries

**Before you leave, clarify:**

- ✅ **Dev will help with:**
  - Integration bugs (emails not triggering, wrong data, etc.)
  - Code changes needed (adding new email type, etc.)
  - Questions about `src/lib/brevo.ts` or hooks

- ❌ **Client will handle:**
  - Brevo account issues (login, billing, etc.)
  - Domain authentication (DNS records, SPF/DKIM)
  - Email template customization
  - Sender reputation & deliverability
  - Monitoring & maintenance

**Support contacts:**
- Brevo issues: Brevo support (app.brevo.com)
- Integration issues: You (developer)
- Domain/DNS issues: Their domain registrar

---

## Handoff Verification (Client)

**After client completes setup, verify:**

- [ ] Brevo account created
- [ ] Domain authenticated (shows ✅ in Brevo)
- [ ] API key generated and stored securely
- [ ] `pnpm brevo-setup-templates` executed successfully
- [ ] Test order placed & confirmations received
- [ ] Client can view logs in Brevo dashboard
- [ ] Client understands weekly monitoring tasks

---

## Post-Handoff (Developer)

### Week 1: Monitoring

- [ ] Monitor first few live orders to confirm emails send
- [ ] Check Brevo logs for any errors
- [ ] Respond quickly to any integration issues
- [ ] Document any unexpected behavior

### Month 1: Stability Check

- [ ] Confirm emails still sending after 30+ orders
- [ ] Check for any bounce/complaint rate issues
- [ ] Verify client is monitoring dashboard (ask how it's going)
- [ ] Review any troubleshooting they needed

### Ongoing

- [ ] Be available for integration bugs (not Brevo account issues)
- [ ] Document if email templates need updates
- [ ] Prepare for future enhancements (new email types, etc.)

---

## FAQ for Client

### "What if I need to change my sender email?"

You'll need to:
1. Authenticate the new domain in Brevo (add DNS records)
2. Contact developer to update `BREVO_SENDER_EMAIL` in code
3. Redeploy

### "Can I customize the email templates?"

Yes! Edit directly in Brevo dashboard (Settings → Templates). Changes apply immediately. Or ask developer to update HTML and re-run setup script.

### "What if I delete a template by accident?"

Run `pnpm brevo-setup-templates` again — it will recreate all templates.

### "Can I test emails without placing a real order?"

Yes. Use test card `4242 4242 4242 4242` in dev/staging to trigger test orders.

### "How much does this cost?"

$0 (free tier for transactional emails on Brevo).

### "What happens if Brevo has an outage?"

Orders still go through. Emails retry for 5 days. When Brevo comes back, emails send. No data loss.

---

## Template Reference (For Future Updates)

**Current templates (IDs 2-7):**

| ID | Name | Trigger | Use Case |
|---|---|---|---|
| 2 | Order Confirmation | After payment | Receipt & order details |
| 3 | Workshop Booking Confirmation | After booking linked | Workshop details & confirmation |
| 4 | Course Enrollment | After course signup | Course access info |
| 5 | Voucher Purchased | After voucher bought | Voucher code & terms |
| 6 | Welcome Email | After user signup | Onboarding |
| 7 | Password Reset | After reset requested | Reset link & instructions |

**If client's IDs are different:**
- Update `src/lib/brevo.ts` with actual IDs
- Re-deploy

---

## Troubleshooting Quick Ref

**Emails not sending?**
→ Check API key, domain auth, template IDs, Brevo logs

**Emails bouncing?**
→ Check Brevo suppression list, ask customer for email verification

**Emails going to spam?**
→ Check domain authentication (DNS records), sender reputation

**Template not found?**
→ Run setup script again to recreate

**Can't access Brevo dashboard?**
→ Check Brevo login credentials, password reset

---

## Sign-Off

**Developer confirms:**
- [ ] All code is tested and working
- [ ] Client documentation is complete
- [ ] Client has been walked through setup
- [ ] Support boundaries are clear
- [ ] First live orders confirm emails working

**Client confirms:**
- [ ] Setup completed successfully
- [ ] Test order received confirmations
- [ ] Understands ongoing monitoring
- [ ] Knows when/how to contact for issues

---

**Status:** ✅ Ready for production handoff

**Next contact:** After first week of live orders (confirm stability)
