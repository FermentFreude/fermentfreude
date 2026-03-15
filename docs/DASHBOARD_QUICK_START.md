# Quick-Start Implementation Checklist

> Step-by-step guide to begin building the profile dashboard. Follow this before uploading design references.

---

## ✅ Pre-Implementation Verification (Do This First)

### 1. Verify Payload Setup

```bash
# Check Payload config is correct
cat src/payload.config.ts | grep -A 5 "collections:"

# Test local dev environment
pnpm dev

# Navigate to http://localhost:3000/admin and verify:
✅ Users collection exists
✅ Orders collection exists (from ecommerce plugin)
✅ Can create test user
```

### 2. Verify Design System is Applied

```bash
# Check globals.css has all color variables
grep "ff-" src/app/(app)/globals.css | head -20

# Check typography tokens in tailwind.config.mjs
cat tailwind.config.mjs | grep -A 5 "theme:"

# Should see: font-display, font-sans, spacing variables
```

### 3. Verify Current Auth Works

```bash
cd src/app/(app)

# Open browser to http://localhost:3000/create-account
# 1. Create test account (email: test@example.com, pwd: Test1234)
# 2. Should redirect to /account
# 3. Should see account form with user data
# 4. Click "Log Out" → should redirect to /login
# 5. Login with same credentials → should work

✅ If all above work, auth foundation is solid
```

---

## 📂 Phase 1: Project Structure Setup (2 hours)

### Step 1: Create New Directories

```bash
# Dashboard components structure
mkdir -p src/components/profile
mkdir -p src/components/DashboardNav
mkdir -p src/components/orders
mkdir -p src/components/addresses
mkdir -p src/components/forms/PasswordChangeForm
mkdir -p src/hooks/form
mkdir -p src/utilities/form
mkdir -p src/types/forms

# CLI verification
ls -la src/components/profile/
# Should be empty, ready for new components
```

### Step 2: Create Type Definitions

**File:** `src/types/forms.ts`

```typescript
import { User, Order, Address } from '@/payload-types'

// Auth Forms
export type LoginFormData = {
  email: string
  password: string
}

export type CreateAccountFormData = {
  email: string
  password: string
  passwordConfirm: string
}

export type PasswordChangeFormData = {
  currentPassword: string
  password: string
  passwordConfirm: string
}

// Address Form
export type AddressFormData = Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'customer'>

// User Profile
export type UserProfile = User

// Order
export type OrderData = Order
```

### Step 3: Create Zod Validation Schemas

**File:** `src/utilities/form/validators.ts`

```typescript
import { z } from 'zod'

// ───── Password Validation ─────
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')

export const passwordConfirmSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

// ───── Email Validation ─────
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

// ───── Address Validation ─────
export const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().regex(/^[A-Z0-9]{3,10}$/, 'Valid postal code required'),
  country: z.string().min(2, 'Country is required'),
  type: z.enum(['home', 'work', 'other']).default('home'),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
})

// ───── Login Form ─────
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// ───── Create Account Form ─────
export const createAccountSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

// ───── Password Change Form ─────
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

// ───── Account Update Form ─────
export const accountUpdateSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Name is required').max(100),
})

// Export types
export type LoginFormData = z.infer<typeof loginSchema>
export type CreateAccountFormData = z.infer<typeof createAccountSchema>
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
export type AddressFormData = z.infer<typeof addressSchema>
export type AccountUpdateFormData = z.infer<typeof accountUpdateSchema>
```

### Step 4: Create Utility Functions

**File:** `src/utilities/form/formatters.ts`

```typescript
// Format dates for display
export const formatDate = (date: string | Date, locale = 'de-DE') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format currency (EUR)
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price / 100) // assuming price in cents
}

// Format order status
export const formatOrderStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return statusMap[status.toLowerCase()] || status
}

// Get password strength (0-4)
export const getPasswordStrength = (password: string): number => {
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  return strength
}

// Get password strength label
export const getPasswordStrengthLabel = (strength: number) => {
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  return labels[strength] || 'Weak'
}

// Get password strength color
export const getPasswordStrengthColor = (strength: number) => {
  const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600']
  return colors[strength] || 'text-red-600'
}
```

---

## 🎯 Phase 2: First Component — ProfileHeader (4 hours)

### Step 1: Create ProfileHeader Component

**File:** `src/components/profile/ProfileHeader.tsx`

```typescript
'use client'

import { User } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utilities/form/formatters'
import Link from 'next/link'

interface ProfileHeaderProps {
  user: User
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="bg-ff-cream border border-ff-border-light rounded-[var(--radius-lg)] p-content-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-content-lg">
        {/* Avatar Circle */}
        <div className="flex items-center justify-center h-20 w-20 rounded-[var(--radius-pill)] bg-ff-gold text-ff-charcoal font-display font-bold text-2xl flex-shrink-0">
          {initials}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-heading text-ff-charcoal font-display font-bold mb-1">
            {user.name || 'User'}
          </h1>
          <p className="text-body-sm text-ff-gray-text mb-2 truncate">{user.email}</p>
          {user.createdAt && (
            <p className="text-caption text-ff-gray-text-light">
              Member since {formatDate(user.createdAt, 'de-DE')}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <Button asChild className="bg-ff-gold text-ff-charcoal hover:bg-ff-gold-accent">
            <Link href="/account">Edit Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Test ProfileHeader in Account Page

**Update:** `src/app/(app)/(account)/account/page.tsx`

Add at the top of the JSX (after heading):

```typescript
import { ProfileHeader } from '@/components/profile/ProfileHeader'

// ... in the return statement, add before AccountForm:

<div className="flex flex-col gap-content-lg">
  <ProfileHeader user={user} />
  
  {/* Rest of existing content */}
</div>
```

### Step 3: Verify Component Works

```bash
pnpm dev

# Navigate to http://localhost:3000/account (must be logged in)
# Should see:
✅ Avatar circle with initials
✅ User name and email
✅ "Member since" date formatted properly
✅ "Edit Profile" button (links to /account)
✅ Component is responsive (mobile-friendly)
```

---

## 🎨 Phase 3: DashboardNav Component (3 hours)

### Step 1: Rename & Enhance AccountNav

**Current:** `src/components/AccountNav/index.tsx`

**Action:** Copy to new location and enhance

```bash
# Copy existing component
cp src/components/AccountNav/index.tsx src/components/DashboardNav/index.tsx

# Keep original for backward compatibility
# (can remove later if no other references)
```

**File:** `src/components/DashboardNav/index.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'

interface DashboardNavProps {
  className?: string
}

export const DashboardNav: React.FC<DashboardNavProps> = ({ className }) => {
  const pathname = usePathname()

  const navItems = [
    { href: '/account', label: '📋 Account Settings' },
    { href: '/account/addresses', label: '🏠 Addresses' },
    { href: '/orders', label: '📦 Orders' },
    { href: '/account/preferences', label: '⚙️ Preferences', comingSoon: true },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className={clsx('flex flex-col gap-2', className)}>
      <ul className="flex flex-col gap-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Button
              asChild
              variant="link"
              className={clsx(
                'justify-start pl-0 h-auto text-body font-display font-bold',
                isActive(item.href)
                  ? 'text-ff-charcoal'
                  : 'text-ff-gray-text-light hover:text-ff-charcoal',
              )}
              disabled={item.comingSoon}
            >
              <Link href={item.href}>
                {item.label}
                {item.comingSoon && (
                  <span className="ml-2 text-caption text-ff-gray-text">
                    (Coming soon)
                  </span>
                )}
              </Link>
            </Button>
          </li>
        ))}
      </ul>

      <hr className="border-ff-border-light my-2" />

      <Button
        asChild
        variant="link"
        className="justify-start pl-0 h-auto text-body text-ff-gray-text-light hover:text-ff-charcoal font-display font-bold"
      >
        <Link href="/logout">🚪 Log Out</Link>
      </Button>
    </nav>
  )
}
```

### Step 2: Update Dashboard Layout

**File:** `src/app/(app)/(account)/layout.tsx`

```typescript
import { DashboardNav } from '@/components/DashboardNav'  // Update import

// ... rest of component, update nav:

{user && (
  <DashboardNav className="max-w-62 grow flex-col items-start gap-4 hidden md:flex" />
)}
```

### Step 3: Verify NavComponent Works

```bash
pnpm dev

# Navigate to http://localhost:3000/account (logged in)
# Should see:
✅ Navigation items with icons
✅ Active item highlighted
✅ Hover states work
✅ Desktop: sidebar visible, mobile: hidden
✅ Click items → navigate to correct pages
```

---

## 📊 Phase 4: Create Basic Dashboard Page (2 hours)

### Step 1: Create Dashboard Index Page (Optional Landing)

**File:** `src/app/(app)/(account)/dashboard/page.tsx`

```typescript
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { Button } from '@/components/ui/button'
import { Order } from '@/payload-types'
import { OrderItem } from '@/components/OrderItem'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import Link from 'next/link'

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent('/dashboard')}`)
  }

  let recentOrders: Order[] = []

  try {
    const result = await payload.find({
      collection: 'orders',
      limit: 3,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user.id,
        },
      },
    })
    recentOrders = result?.docs || []
  } catch (_error) {
    // Silently fail
  }

  return (
    <div className="space-y-content-lg">
      {/* Profile Header */}
      <ProfileHeader user={user} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-content-lg">
        <div className="bg-ff-cream border border-ff-border-light rounded-[var(--radius-lg)] p-content-lg text-center">
          <p className="text-caption text-ff-gray-text mb-2">Total Orders</p>
          <p className="text-heading text-ff-charcoal font-display font-bold">
            {recentOrders.length > 0 ? '3+' : '0'}
          </p>
        </div>

        <div className="bg-ff-cream border border-ff-border-light rounded-[var(--radius-lg)] p-content-lg text-center">
          <p className="text-caption text-ff-gray-text mb-2">Last Order</p>
          <p className="text-heading text-ff-charcoal font-display font-bold">
            {recentOrders[0] ? (
              new Date(recentOrders[0].createdAt as string).toLocaleDateString('de-DE')
            ) : (
              'No orders'
            )}
          </p>
        </div>

        <div className="bg-ff-cream border border-ff-border-light rounded-[var(--radius-lg)] p-content-lg text-center">
          <p className="text-caption text-ff-gray-text mb-2">Status</p>
          <p className="text-heading text-ff-charcoal font-display font-bold">Active</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-ff-cream border border-ff-border-light rounded-[var(--radius-lg)] p-content-lg">
        <div className="flex justify-between items-center mb-content-lg">
          <h2 className="text-section-heading text-ff-charcoal font-display font-bold">
            Recent Orders
          </h2>
          <Button asChild variant="link" className="text-ff-gold hover:text-ff-gold-accent">
            <Link href="/orders">View All →</Link>
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-body text-ff-gray-text">No orders yet. Start shopping!</p>
        ) : (
          <ul className="space-y-content-md">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

### Step 2: Test Dashboard Page

```bash
pnpm dev

# Navigate to http://localhost:3000/dashboard (or update account nav to link here)
# Should see:
✅ Profile header
✅ Quick stats cards
✅ Recent orders list
✅ All components use design system colors/spacing
```

---

## ✅ Validation Checklist After Phase 1-4

Run these checks before proceeding:

```bash
# 1. Type check
npx tsc --noEmit

# Should see: ✅ 0 errors

# 2. Lint
pnpm lint

# Should see: ✅ No errors

# 3. Visual inspection
pnpm dev

# Navigate to:
# ✅ http://localhost:3000/account → see ProfileHeader
# ✅ http://localhost:3000/dashboard → see full dashboard
# ✅ Try mobile view (DevTools) → responsive layout works
# ✅ Try dark mode (system preference) → colors readable

# 4. Functionality
# ✅ Click nav items → navigate correctly
# ✅ Logout works → redirects to /login
# ✅ Login again → dashboard loads
```

---

## 📋 Next Phases (Order After Phase 4)

### Phase 5: Enhanced Order Views (3-4 days)
- Create `OrdersGrid` component
- Create `OrderDetailView` component
- Implement order filtering/sorting

### Phase 6: Address Management (2 days)
- Enhance `AddressForm` component
- Create `AddressCard` component
- Add CRUD operations

### Phase 7: Account Settings Enhancement (2 days)
- Extract `PasswordChangeForm`
- Create `SettingsTab` (preferences)
- Add password strength indicator

### Phase 8: Testing & Polish (3-4 days)
- Unit tests (Vitest)
- E2E tests (Playwright)
- Accessibility audit
- Performance optimization

### Phase 9: Staging & Production Deployment (2 days)
- Environment variable setup
- Rate limiting configuration
- Monitoring/logging
- Final smoke tests

---

## 🚀 Getting Started

```bash
# 1. Create TypeScript types
touch src/types/forms.ts
# → Add content from Phase 1, Step 2 above

# 2. Create validators
mkdir -p src/utilities/form
touch src/utilities/form/validators.ts
# → Add Zod schemas from Phase 1, Step 3

# 3. Create formatters
touch src/utilities/form/formatters.ts
# → Add utilities from Phase 1, Step 4

# 4. Create ProfileHeader
mkdir -p src/components/profile
touch src/components/profile/ProfileHeader.tsx
# → Add component from Phase 2, Step 1

# 5. Update AccountNav → DashboardNav
mkdir -p src/components/DashboardNav
# → Copy and enhance from Phase 3, Step 1

# 6. Create dashboard page
mkdir -p src/app/\(app\)/\(account\)/dashboard
touch src/app/\(app\)/\(account\)/dashboard/page.tsx
# → Add page from Phase 4, Step 1

# 7. Type check & test
npx tsc --noEmit
pnpm dev

# 8. Verify in browser
# http://localhost:3000/account
# http://localhost:3000/dashboard
```

---

## 📞 When You're Ready for Design References

Once you've verified the above runs without errors:

1. **Upload design examples** (Figma link or screenshots)
2. **I'll analyze** the visual direction
3. **I'll refine** component styles to match
4. **We'll proceed** systematically through remaining phases

**Expected timeline for full dashboard:** 2-3 weeks (Phase 1-9)

---

**Ready to start? Run the "Getting Started" section above and upload your design references when ready! 🚀**
