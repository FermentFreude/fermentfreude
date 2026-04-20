# Vercel Secrets & Environment Variables Setup Plan

**Date:** April 19, 2026  
**Environments:** Staging & Production  
**Goal:** Configure DATABASE_URL, Brevo, and Stripe secrets to fix the build failure

---

## 🎯 Overview: What We Need

| Variable | Type | Environment(s) | Status |
|----------|------|-----------------|--------|
| `DATABASE_URL` | Secret | staging, prod | ❌ Missing (build failure) |
| `BREVO_API_KEY` | Secret | staging, prod | ❌ Missing (email integration) |
| `STRIPE_SECRET_KEY` | Secret | staging, prod | ❌ Missing (payment hooks) |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | Secret | staging, prod | ❌ Missing (payment webhooks) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | staging, prod | ❌ Missing (client-side) |
| `PAYLOAD_SECRET` | Secret | staging, prod | ⚠️ May need refresh |
| `PAYLOAD_PUBLIC_SERVER_URL` | Secret | staging, prod | ⚠️ May need update |
| `NEXT_PUBLIC_SERVER_URL` | Public | staging, prod | ⚠️ May need update |
| `R2_BUCKET` | Secret | staging, prod | ⚠️ Already configured? |
| `R2_ACCESS_KEY_ID` | Secret | staging, prod | ⚠️ Already configured? |
| `R2_SECRET_ACCESS_KEY` | Secret | staging, prod | ⚠️ Already configured? |
| `R2_ENDPOINT` | Secret | staging, prod | ⚠️ Already configured? |
| `R2_PUBLIC_URL` | Secret | staging, prod | ⚠️ Already configured? |

---

## 📋 STEP-BY-STEP SETUP PLAN

### PHASE 1: Gather All Secrets (Before Vercel Setup)

**Step 1.1: Get MongoDB Connection String**
- Location: MongoDB Atlas dashboard → fermentfreude-staging cluster
- Format: `mongodb+srv://username:password@cluster.mongodb.net/fermentfreude-staging?retryWrites=true&w=majority`
- Action: Copy full connection string to safe location

**Step 1.2: Get Brevo API Key**
- Location: app.brevo.com → Account → API Keys
- Format: `xkeysib_abc123...` (starts with `xkeysib_`)
- Action: Copy API key to safe location

**Step 1.3: Get Stripe Keys**
- Location: dashboard.stripe.com → Developers → API Keys
- Get both:
  - Secret Key (starts with `sk_test_` or `sk_live_`)
  - Publishable Key (starts with `pk_test_` or `pk_live_`)
- Get Webhook Signing Secret:
  - dashboard.stripe.com → Developers → Webhooks
  - Copy the signing secret (starts with `whsec_`)
- Action: Copy all three to safe location

**Step 1.4: Verify Existing Secrets (May Already Be Configured)**
- Check Vercel dashboard for already-set values:
  - `PAYLOAD_SECRET`
  - `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_PUBLIC_URL`
  - `DEEPL_API_KEY`

---

### PHASE 2: Configure Vercel (Dashboard)

**Step 2.1: Access Vercel Project Settings**
1. Go to: https://vercel.com/fermentfreude/fermentfreude
2. Click: **Settings** (top navigation)
3. Click: **Environment Variables** (left sidebar)

**Step 2.2: Add DATABASE_URL (Staging)**
1. Click: **Add new**
2. Name: `DATABASE_URL`
3. Value: Paste MongoDB staging connection string
4. Environments: Select **Preview** (staging deployments)
5. Click: **Save**

**Step 2.3: Add DATABASE_URL (Production)**
1. Click: **Add new**
2. Name: `DATABASE_URL`
3. Value: Paste MongoDB production connection string (fermentfreude, not fermentfreude-staging)
4. Environments: Select **Production**
5. Click: **Save**

**Step 2.4: Add BREVO_API_KEY**
1. Click: **Add new**
2. Name: `BREVO_API_KEY`
3. Value: Paste Brevo API key
4. Environments: **Preview** + **Production** (select both)
5. Click: **Save**

**Step 2.5: Add Stripe Secrets**

*For STRIPE_SECRET_KEY:*
1. Click: **Add new**
2. Name: `STRIPE_SECRET_KEY`
3. Value: Paste Stripe secret key (sk_test_ for staging, sk_live_ for prod)
4. Environments: **Preview** (staging) OR **Production** (depending on key)
5. Click: **Save**

*For STRIPE_WEBHOOKS_SIGNING_SECRET:*
1. Click: **Add new**
2. Name: `STRIPE_WEBHOOKS_SIGNING_SECRET`
3. Value: Paste webhook signing secret (whsec_)
4. Environments: **Preview** + **Production**
5. Click: **Save**

**Step 2.6: Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
1. Click: **Add new**
2. Name: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Value: Paste Stripe publishable key (pk_test_ for staging, pk_live_ for prod)
4. Environments: **Preview** (staging) OR **Production**
5. Click: **Save**
6. ⚠️ **CRITICAL**: After adding this, **REDEPLOY WITHOUT CACHE** (next section)

---

### PHASE 3: Trigger Vercel Rebuild (After Secrets Added)

**Step 3.1: Redeploy Staging with Cache Bypass**
1. Go to: https://vercel.com/fermentfreude/fermentfreude/deployments
2. Filter: **Branch: staging**
3. Find the failed deployment (19:45:14 UTC)
4. Click the **⋮** menu
5. Click: **Redeploy** (do NOT use "Redeploy with cached"!)
6. Wait for build to complete (~2 min)
7. ✅ Verify: Build should pass now

**Step 3.2: Redeploy Production with Cache Bypass** (when ready)
1. Go to: https://vercel.com/fermentfreude/fermentfreude/deployments
2. Filter: **Branch: main**
3. Click: **Redeploy** (without cache)
4. Wait for build to complete
5. ✅ Verify: Build passes + staging tests pass first

---

### PHASE 4: Verify Integration (After Rebuild)

**Step 4.1: Check Build Logs**
- Click the deployment in Vercel
- Verify: "Compiled successfully" message
- Verify: No MongoDB connection errors
- Verify: ESLint warnings (acceptable)

**Step 4.2: Test Email Integration**
1. Go to: https://fermentfreude-git-staging-raphaellas-projects.vercel.app/checkout
2. Create a test workshop booking
3. Check Brevo dashboard → SMTP & API → Logs
4. ✅ Verify: Order confirmation email queued/sent

**Step 4.3: Test Payment Webhook**
1. Trigger a test payment in Stripe dashboard
2. Go to Stripe → Developers → Webhooks
3. ✅ Verify: Webhook delivered successfully (green checkmark)

---

## 🔑 Required Credentials

| Credential | Where to Find | Format |
|-----------|--------------|--------|
| **MongoDB Connection String (Staging)** | MongoDB Atlas → Clusters → fermentfreude-staging → Connect | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| **MongoDB Connection String (Production)** | MongoDB Atlas → Clusters → fermentfreude → Connect | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| **Brevo API Key** | app.brevo.com → Account → API & SMTP | `xkeysib_...` |
| **Stripe Secret Key (Test)** | dashboard.stripe.com → Developers → API Keys (Test mode) | `sk_test_...` |
| **Stripe Secret Key (Live)** | dashboard.stripe.com → Developers → API Keys (Live mode) | `sk_live_...` |
| **Stripe Publishable Key (Test)** | dashboard.stripe.com → Developers → API Keys (Test mode) | `pk_test_...` |
| **Stripe Publishable Key (Live)** | dashboard.stripe.com → Developers → API Keys (Live mode) | `pk_live_...` |
| **Stripe Webhook Signing Secret** | dashboard.stripe.com → Developers → Webhooks → Select endpoint → Signing secret | `whsec_...` |

---

## ⚠️ CRITICAL NOTES

1. **NEXT_PUBLIC_* variables are BAKED AT BUILD TIME**
   - Changing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` requires full redeploy WITHOUT CACHE
   - Cannot just update and redeploy normally

2. **Separate secrets for staging vs production**
   - Stripe test keys for staging (sk_test_, pk_test_)
   - Stripe live keys for production (sk_live_, pk_live_)
   - MongoDB staging vs production databases

3. **No hardcoded secrets in code**
   - Never commit .env files or secret values
   - Always use Vercel environment variables

4. **Order of setup**
   - Add DATABASE_URL first (fixes immediate build error)
   - Then add Brevo and Stripe (enables features)
   - Redeploy after each critical change

---

## ✅ Success Criteria

- [ ] Vercel staging build passes (no MongoDB connection error)
- [ ] Vercel production build passes (if/when ready)
- [ ] Test workshop booking emails appear in Brevo logs
- [ ] Test payment trigger creates webhook delivery in Stripe
- [ ] No secrets visible in git logs or code

---

## 📞 When You Have All Credentials

Reply with confirmation, and I can help verify the setup or troubleshoot any build issues.
