# Security Guidelines - Fermentfreude

## 🔒 Security Best Practices

This document outlines security measures and best practices for the Fermentfreude project.

---

## 📋 Table of Contents

1. [Environment Security](#environment-security)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Payment Security](#payment-security)
6. [GDPR Compliance](#gdpr-compliance)
7. [Dependency Management](#dependency-management)
8. [Production Deployment](#production-deployment)
9. [Incident Response](#incident-response)

---

## 🔐 Environment Security

### Never Commit Secrets

**❌ Never commit these files:**
- `.env` 
- `.env.local`
- `.env.production`
- Any file containing API keys, passwords, or secrets

**✅ Always:**
- Use `.env.example` as template
- Add sensitive files to `.gitignore`
- Use environment variables for all secrets

### Environment Variables

```bash
# ❌ NEVER hardcode secrets in code
const stripeKey = 'sk_live_abc123' 

# ✅ Use environment variables
const stripeKey = process.env.STRIPE_SECRET_KEY
```

### Secure Key Generation

```bash
# Generate secure random keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator (from trusted source)
# Minimum 32 characters for PAYLOAD_SECRET
```

### Environment Variable Checklist

- [ ] All secrets in `.env` file
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` has placeholder values only
- [ ] Different keys for development/production
- [ ] Rotate keys every 90 days (production)

---

## 👤 Authentication & Authorization

### Payload CMS Admin Access

**Strong Password Policy:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- No common words or patterns
- Use password manager

**Admin User Security:**
```typescript
// src/payload/collections/Users/access.ts
export const isAdmin = ({ req: { user } }) => {
  return user?.role === 'admin'
}

export const isAdminOrSelf = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return {
    id: { equals: user.id }
  }
}
```

### Access Control Matrix

| Role | Read Products | Create Products | Edit Products | Delete Products |
|------|---------------|-----------------|---------------|-----------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | ✅ | ❌ |
| **Customer** | ✅ | ❌ | ❌ | ❌ |
| **Public** | ✅ | ❌ | ❌ | ❌ |

### Implement Role-Based Access

```typescript
// src/payload/collections/Products/index.ts
const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: () => true, // Public
    create: ({ req: { user } }) => {
      return user && ['admin', 'editor'].includes(user.role)
    },
    update: ({ req: { user } }) => {
      return user && ['admin', 'editor'].includes(user.role)
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  // ... fields
}
```

### Session Security

- Sessions expire after 30 days (default)
- Use secure cookies in production
- HTTPS only in production

---

## 🛡️ Data Protection

### Sensitive Data Handling

**PII (Personally Identifiable Information):**
- Email addresses
- Phone numbers
- Shipping addresses
- Payment information

**Never log or expose:**
```typescript
// ❌ BAD
console.log('User data:', user.email, user.password)

// ✅ GOOD
console.log('User authenticated:', user.id)
```

### Password Security

**Payload handles this automatically:**
- Passwords hashed with bcrypt
- Never stored in plain text
- Password reset via secure tokens

**Custom password validation:**
```typescript
{
  name: 'password',
  type: 'text',
  required: true,
  validate: (value) => {
    if (value.length < 12) {
      return 'Password must be at least 12 characters'
    }
    // Add more validation rules
    return true
  }
}
```

### Data Encryption

**At Rest:**
- MongoDB encryption (enable in Atlas)
- Encrypted backups

**In Transit:**
- HTTPS/TLS for all connections
- Stripe handles payment card data (PCI compliant)

---

## 🔌 API Security

### Rate Limiting

**Prevent abuse:**
```typescript
// Add rate limiting middleware
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

// Apply to API routes
app.use('/api/', limiter)
```

### Input Validation

**Always validate user input:**
```typescript
// ❌ BAD - No validation
const createWorkshop = async (req, res) => {
  const { title, price } = req.body
  await Workshops.create({ title, price })
}

// ✅ GOOD - Validate input
const createWorkshop = async (req, res) => {
  const { title, price } = req.body
  
  if (!title || typeof title !== 'string' || title.length > 100) {
    return res.status(400).json({ error: 'Invalid title' })
  }
  
  if (!price || typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Invalid price' })
  }
  
  await Workshops.create({ title, price })
}
```

### CORS Configuration

```javascript
// next.config.js
cors: [
  'https://checkout.stripe.com',
  process.env.PAYLOAD_PUBLIC_SERVER_URL
].filter(Boolean),
```

### Content Security Policy (CSP)

```javascript
// csp.js - Already configured
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: *.stripe.com;
  connect-src 'self' *.stripe.com;
`
```

---

## 💳 Payment Security

### Stripe Security

**✅ Best Practices:**
- Use Stripe.js (never handle card data directly)
- Validate on server-side
- Use webhooks for order confirmation
- Test mode keys for development
- Live keys only in production

**❌ Never:**
```typescript
// NEVER handle raw card data
const cardNumber = req.body.cardNumber // ❌ PCI violation!
```

**✅ Always:**
```typescript
// Let Stripe handle card data
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount,
  currency: 'eur',
  // Stripe.js handles card on client side
})
```

### Webhook Security

**Verify webhook signatures:**
```typescript
// src/payload/stripe/webhooks/index.ts
const sig = request.headers['stripe-signature']

try {
  const event = stripe.webhooks.constructEvent(
    request.body,
    sig,
    process.env.STRIPE_WEBHOOKS_SIGNING_SECRET
  )
  // Process event
} catch (err) {
  return response.status(400).send(`Webhook Error: ${err.message}`)
}
```

### PCI Compliance

**Fermentfreude is PCI compliant because:**
- Stripe handles all card data
- No card numbers stored in database
- No card data passes through our servers
- Using Stripe Checkout or Elements

---

## 🇪🇺 GDPR Compliance

### User Rights

**Users can:**
1. Access their data
2. Rectify their data
3. Delete their data
4. Export their data
5. Restrict processing
6. Object to processing

### Data Collection

**Collect only necessary data:**
- Email (required for account)
- Name (required for shipping)
- Address (required for delivery)
- Payment info (handled by Stripe)

**Optional data:**
- Phone number
- Marketing preferences
- Newsletter subscription

### Cookie Consent

**Required cookies:**
- Session cookies (authentication)
- Security cookies (CSRF protection)

**Optional cookies:**
- Analytics cookies (Google Analytics)
- Marketing cookies (Meta Pixel)

**Implementation:**
```typescript
// src/app/_components/CookieConsent/index.tsx
// User must consent before non-essential cookies are set
```

### Privacy Policy

**Must include:**
- [ ] What data we collect
- [ ] Why we collect it
- [ ] How we use it
- [ ] Who we share it with
- [ ] How long we keep it
- [ ] User rights (access, delete, etc.)
- [ ] Contact information

**Location:** Create `/privacy-policy` page

### Data Retention

```typescript
// Delete inactive accounts after 2 years
// Delete orders after 7 years (legal requirement)
// Delete newsletter subscribers immediately on request
```

---

## 📦 Dependency Management

### Audit Dependencies

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Vulnerability Monitoring

**GitHub Dependabot:**
- Enabled by default
- Automatic Pull Requests for security updates
- Review and merge promptly

### Update Policy

- **Critical vulnerabilities:** Patch immediately
- **High vulnerabilities:** Patch within 7 days
- **Medium vulnerabilities:** Patch within 30 days
- **Low vulnerabilities:** Patch in next update cycle

### Trusted Dependencies Only

```json
// package.json
// Only use well-maintained packages with:
// - Regular updates
// - Large community
// - Good documentation
// - Security track record
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Using production database
- [ ] HTTPS enabled
- [ ] Stripe live keys configured
- [ ] MongoDB backups enabled
- [ ] Error monitoring setup (Sentry)
- [ ] Rate limiting enabled
- [ ] CSP headers configured
- [ ] Security headers enabled
- [ ] Robots.txt configured
- [ ] Sitemap generated

### Security Headers

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        }
      ]
    }
  ]
}
```

### Environment-Specific Config

```bash
# Development
NODE_ENV=development
PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY=true
NEXT_PUBLIC_IS_LIVE=false

# Production
NODE_ENV=production
PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY=false
NEXT_PUBLIC_IS_LIVE=true
```

---

## 🚨 Incident Response

### Security Incident Plan

**If you discover a security vulnerability:**

1. **DO NOT commit fixes to public repository**
2. **Immediately notify team lead**
3. **Document the issue privately**
4. **Assess impact**
5. **Develop patch**
6. **Test patch**
7. **Deploy patch ASAP**
8. **Notify affected users if needed**
9. **Post-mortem analysis**

### Breach Response

**If data breach suspected:**

1. **Immediately take affected systems offline**
2. **Contact legal counsel**
3. **Investigate extent of breach**
4. **Contain breach**
5. **Notify authorities (72 hours - GDPR requirement)**
6. **Notify affected users**
7. **Document everything**
8. **Prevent future breaches**

### Monitoring

**Monitor for:**
- Failed login attempts
- Unusual API usage
- Database access patterns
- Error rates
- Server resources

**Tools:**
- Vercel Analytics
- MongoDB Atlas Monitoring
- Stripe Dashboard
- Error tracking (Sentry)

---

## 📞 Security Contacts

**For security issues:**
- Email: security@fermentfreude.com
- Emergency: [Team lead contact]

**External resources:**
- Stripe Security: https://stripe.com/docs/security
- Vercel Security: https://vercel.com/docs/concepts/security
- MongoDB Security: https://www.mongodb.com/security

---

## ✅ Security Checklist

### Development
- [ ] Never commit `.env` files
- [ ] Use environment variables for secrets
- [ ] Validate all user input
- [ ] Use HTTPS in development (localhost exempt)
- [ ] Test with Stripe test keys only

### Code Review
- [ ] No hardcoded secrets
- [ ] Proper error handling
- [ ] Input validation
- [ ] Access control implemented
- [ ] SQL injection prevention (MongoDB uses BSON)
- [ ] XSS prevention
- [ ] CSRF protection

### Deployment
- [ ] All security headers enabled
- [ ] HTTPS enforced
- [ ] Production environment variables set
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Incident response plan ready

---

**Last Updated:** February 12, 2026  
**Review Schedule:** Quarterly
