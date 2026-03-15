# First Implementation Example: ProfileHeader Component

> **Complete working example** showing how to implement the first dashboard component following FermentFreude's patterns, design system, and architecture.

---

## Overview

This example shows:
- ✅ File structure setup
- ✅ Component implementation (TypeScript, React, design system)
- ✅ Integration into existing page
- ✅ Testing/verification
- ✅ How to adapt for design references

**Component:** `ProfileHeader`  
**Location:** `src/components/profile/ProfileHeader.tsx`  
**Purpose:** Display user avatar, name, email, member since date  
**Time:** 2 hours (including setup and verification)

---

## Step 1: Create Directories

```bash
mkdir -p src/components/profile
mkdir -p src/utilities/form

# Verify
ls -la src/components/profile/
# Should be empty
```

---

## Step 2: Create Formatter Utilities

These utilities will be used by multiple components. Create first, then reference in components.

**File:** `src/utilities/form/formatters.ts`

```typescript
/**
 * Format utilities for dashboard components
 * Used by ProfileHeader, Orders, Addresses, etc.
 */

/**
 * Format date to localized string
 * @param date - ISO date string or Date object
 * @param locale - Optional locale code (default: 'de-DE')
 * @returns Formatted date string (e.g., "14. März 2026")
 */
export function formatDate(date: string | Date | null | undefined, locale = 'de-DE'): string {
  if (!date) return ''
  
  try {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Format date as "member since" text
 * @param date - ISO date string or Date object
 * @param locale - Optional locale code
 * @returns Formatted text (e.g., "Mitglied seit März 2026")
 */
export function formatMemberSince(date: string | Date | null | undefined, locale = 'de-DE'): string {
  if (!date) return ''
  
  const formatted = formatDate(date, locale)
  
  if (locale === 'en') {
    return `Member since ${formatted}`
  }
  
  return `Mitglied seit ${formatted}`
}

/**
 * Format currency to EUR with cents
 * @param cents - Amount in cents (e.g., 9999 = €99.99)
 * @returns Formatted currency string
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Get user initials from name
 * @param name - Full name
 * @returns Uppercase initials (e.g., "JD" for "John Doe")
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U' // Default to "U" for User
  
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) // Max 2 characters
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncate(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}
```

---

## Step 3: Create ProfileHeader Component

**File:** `src/components/profile/ProfileHeader.tsx`

```typescript
'use client'

import React from 'react'
import { User } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { formatMemberSince, getInitials, truncate } from '@/utilities/form/formatters'
import Link from 'next/link'
import clsx from 'clsx'

interface ProfileHeaderProps {
  /**
   * User object from Payload
   * Contains: id, email, name, createdAt, roles, etc.
   */
  user: User

  /**
   * Optional callback when edit button is clicked
   * Useful if you want to open a modal instead of navigating
   */
  onEditClick?: () => void

  /**
   * Optional CSS class for wrapper
   */
  className?: string
}

/**
 * ProfileHeader Component
 *
 * Displays user profile information in a prominent header card.
 * Shows avatar with initials, name, email, and member since date.
 * Includes edit profile and change password buttons.
 *
 * Design System:
 * - Background: ff-cream with ff-border-light border
 * - Avatar: Gold background with charcoal text
 * - Typography: Display font for name, body sm for secondary info
 * - Spacing: Uses content gaps and padding tokens
 * - Responsive: Vertical on mobile, horizontal on desktop
 *
 * Usage:
 * ```tsx
 * import { ProfileHeader } from '@/components/profile/ProfileHeader'
 *
 * export async function AccountPage() {
 *   const { user } = await getUser()
 *   return <ProfileHeader user={user} />
 * }
 * ```
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditClick,
  className,
}) => {
  // Get user initials for avatar
  const initials = getInitials(user.name)

  // Truncate email for mobile (max 40 chars)
  const displayEmail = truncate(user.email || '', 40)

  // Format member since date based on locale
  const locale = user.locale === 'en' ? 'en' : 'de-DE'
  const memberSinceText = formatMemberSince(user.createdAt, locale)

  return (
    <div
      className={clsx(
        // Card styling with design system colors
        'bg-ff-cream',
        'border border-ff-border-light',
        'rounded-[var(--radius-lg)]',
        'p-content-lg',
        // Custom className
        className,
      )}
    >
      <div
        className={clsx(
          // Responsive layout: stack on mobile (flex-col), row on desktop (flex-row)
          'flex',
          'flex-col sm:flex-row',
          // Spacing and alignment
          'items-start sm:items-center',
          'gap-content-lg',
        )}
      >
        {/* ───────── Avatar Circle (Desktop-first styling) ───────── */}
        <div
          className={clsx(
            // Size: fixed 80px circle
            'h-20 w-20',
            // Flex to center content
            'flex items-center justify-center',
            // Shape: fully rounded
            'rounded-[var(--radius-pill)]',
            // Colors: gold background from design system
            'bg-ff-gold',
            'text-ff-charcoal',
            // Typography: display font, bold, large
            'font-display font-bold text-2xl',
            // Don't shrink on desktop
            'flex-shrink-0',
          )}
        >
          {/* Initials, fallback to "U" if no name */}
          {initials}
        </div>

        {/* ───────── User Info Text ───────── */}
        <div className="flex-1 min-w-0">
          {/* Name: h1-like heading */}
          <h1
            className={clsx(
              'text-section-heading',
              'text-ff-charcoal',
              'font-display font-bold',
              'mb-1',
              // Prevent overflow on mobile
              'truncate',
            )}
          >
            {user.name || 'User'}
          </h1>

          {/* Email: body-sm with secondary text color */}
          <p
            className={clsx(
              'text-body-sm',
              'text-ff-gray-text',
              'mb-2',
              // Truncate on mobile
              'truncate',
            )}
            title={user.email} // Show full email on hover
          >
            {displayEmail}
          </p>

          {/* Member since: caption text with lighter color */}
          {user.createdAt && (
            <p
              className={clsx(
                'text-caption',
                'text-ff-gray-text-light',
              )}
            >
              {memberSinceText}
            </p>
          )}
        </div>

        {/* ───────── Action Buttons ───────── */}
        <div className="flex flex-col gap-2 w-full sm:w-auto pt-2 sm:pt-0">
          {/* Edit Profile Button (Primary CTA) */}
          <Button
            asChild
            className={clsx(
              // Gold button styling from design system
              'bg-ff-gold',
              'text-ff-charcoal',
              'hover:bg-ff-gold-accent',
              // Ensure button is readable
              'font-display font-bold',
              // Full width on mobile, auto on desktop
              'w-full sm:w-auto',
            )}
          >
            <Link href="/account">
              {locale === 'en' ? 'Edit Profile' : 'Profil bearbeiten'}
            </Link>
          </Button>

          {/* Optional: Change Password Button (if callback provided) */}
          {onEditClick && (
            <Button
              onClick={onEditClick}
              className={clsx(
                'bg-ff-gold',
                'text-ff-charcoal',
                'hover:bg-ff-gold-accent',
                'font-display font-bold',
                'w-full sm:w-auto',
              )}
            >
              {locale === 'en' ? 'Change Password' : 'Passwort ändern'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Example Stories (for Storybook if you set it up later)
 *
 * export const Default: StoryObj = {
 *   args: {
 *     user: {
 *       id: '123',
 *       email: 'john.doe@example.com',
 *       name: 'John Doe',
 *       createdAt: '2025-01-14T10:00:00Z',
 *       locale: 'de',
 *     } as User,
 *   },
 * }
 *
 * export const MissingName: StoryObj = {
 *   args: {
 *     user: {
 *       id: '123',
 *       email: 'no-name@example.com',
 *       name: null,
 *       createdAt: new Date(),
 *     } as User,
 *   },
 * }
 */
```

---

## Step 4: Integrate into Account Page

**File:** `src/app/(app)/(account)/account/page.tsx`

Find the current page and add the ProfileHeader component at the top:

```typescript
import type { Metadata } from 'next'

// ← Add this import
import { ProfileHeader } from '@/components/profile/ProfileHeader'

import { AccountForm } from '@/components/forms/AccountForm'
import { OrderItem } from '@/components/OrderItem'
import { Button } from '@/components/ui/button'
import { Order } from '@/payload-types'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Please login to access your account settings.')}`,
    )
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 5,
      user,
      overrideAccess: false,
      pagination: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (_error) {
    // silently fail
  }

  return (
    // ← Wrap content in space-y for vertical rhythm
    <div className="flex flex-col gap-content-lg">
      {/* ← Add ProfileHeader here (NEW) */}
      <ProfileHeader user={user} />

      {/* ← Existing content below */}
      <div className="border p-8 rounded-lg bg-primary-foreground">
        <h1 className="text-3xl font-medium mb-8">Account settings</h1>
        <AccountForm />
      </div>

      <div className=" border p-8 rounded-lg bg-primary-foreground">
        <h2 className="text-3xl font-medium mb-8">Recent Orders</h2>

        <div className="prose dark:prose-invert mb-8">
          <p>
            These are the most recent orders you have placed. Each order is associated with an
            payment. As you place more orders, they will appear in your orders list.
          </p>
        </div>

        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <p className="mb-8">You have no orders.</p>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-6 mb-8">
            {orders?.map((order) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="default">
          <Link href="/orders">View all orders</Link>
        </Button>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
```

---

## Step 5: Test the Component

### Test 1: Type Check

```bash
npx tsc --noEmit

# Expected output:
# ✅ No type errors
```

### Test 2: Development Server

```bash
pnpm dev

# Should compile successfully
```

### Test 3: Visual Test in Browser

```bash
# 1. Open http://localhost:3000/create-account
# 2. Create test account:
#    Email: test@example.com
#    Password: Test1234
#    Name: John Doe
# 3. Should redirect to /account
# 4. Should see ProfileHeader with:
#    ✅ Gold circle avatar with initials "JD"
#    ✅ Name "John Doe"
#    ✅ Email "test@example.com"
#    ✅ "Member since Januar 2026" (or today's date in your locale)
#    ✅ "Profil bearbeiten" button (or "Edit Profile" if EN locale)
```

### Test 4: Mobile Responsiveness

```bash
# 1. Open DevTools (F12)
# 2. Toggle device toolbar (Ctrl+Shift+M)
# 3. Test at different sizes:
#    - Mobile (375px): Avatar and text stack vertically
#    - Tablet (768px): Avatar and text start aligning horizontally
#    - Desktop (1024px): Avatar and text in single row
```

### Test 5: Accessibility

```bash
# 1. Press Tab repeatedly
#    ✅ "Edit Profile" button should be focusable
#    ✅ Blue outline appears around buttons
# 2. Use screen reader (VoiceOver on Mac: Cmd+F5)
#    ✅ Reads "John Doe, heading level 1"
#    ✅ Reads "test@example.com"
#    ✅ Reads "Member since Januar 2026"
```

---

## Step 6: How to Adapt for Design References

When you upload design examples, I'll refine:

### Colors (Example Customization)

If your design shows:
- Light blue avatar instead of gold → Change `bg-ff-gold` to `bg-blue-400`
- Different card background → Change `bg-ff-cream` to your color
- Different shadow style → Add `shadow-lg` or custom shadow

```typescript
// Example: If design uses shadow instead of border
<div className="bg-white shadow-lg rounded-[var(--radius-lg)]">
  {/* content */}
</div>
```

### Layout (Example Customization)

If your design shows:
- Avatar on right instead of left:
  ```typescript
  <div className="flex flex-row-reverse gap-content-lg">
    {/* Avatar and info swapped */}
  </div>
  ```

- Cover image above avatar:
  ```typescript
  <div>
    <div className="h-32 bg-gradient-to-r from-gold-500 to-gold-600">
      {/* Cover image */}
    </div>
    <div className="flex gap-content-lg relative -mt-16">
      {/* Avatar overlapping cover */}
    </div>
  </div>
  ```

### Typography (Example Customization)

If your design shows:
- Larger name text → Change `text-section-heading` to `text-display`
- Different font weight → Add `font-black` or `font-semibold`
- All caps name → Add `uppercase` and `tracking-wide`

```typescript
<h1 className="text-display text-ff-charcoal font-display font-black uppercase tracking-wide">
  {user.name}
</h1>
```

---

## Step 7: Component Library & Reusability

This ProfileHeader pattern works for other components too:

### Use the Same Formatters

```typescript
// In OrderCard component
import { formatDate, formatPrice } from '@/utilities/form/formatters'

// In AddressCard component
import { truncate } from '@/utilities/form/formatters'
```

### Reuse the Design Pattern

Create similar "info cards" with this pattern:

```typescript
interface InfoCardProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  description?: string
  action?: React.ReactNode
}

export const InfoCard: React.FC<InfoCardProps> = ({ icon, title, subtitle, description, action }) => {
  return (
    <div className="bg-ff-cream border border-ff-border-light rounded-[var(--radius-lg)] p-content-lg">
      <div className="flex gap-content-lg">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex-1 min-w-0">
          <h3 className="text-section-heading text-ff-charcoal font-display font-bold">
            {title}
          </h3>
          {subtitle && <p className="text-body-sm text-ff-gray-text">{subtitle}</p>}
          {description && <p className="text-body text-ff-gray-text mt-2">{description}</p>}
        </div>
      </div>
      {action && <div className="mt-content-lg">{action}</div>}
    </div>
  )
}
```

---

## Quick Reference: Key Files Created

```
src/
├── utilities/form/
│   └── formatters.ts           ← Date, currency, text formatting
├── components/profile/
│   └── ProfileHeader.tsx       ← New ProfileHeader component
└── app/(app)/(account)/
    └── account/
        └── page.tsx            ← Updated to use ProfileHeader
```

---

## What's Next

This example shows:
✅ How to create a new component following the design system
✅ How to use formatters and utilities
✅ How to integrate into an existing page
✅ How to test and verify locally
✅ How to adapt for design references

For the next components (DashboardNav, OrdersGrid, AddressForm), follow the same pattern:
1. Create files in appropriate directories
2. Import from design system (colors, tokens)
3. Use formatters for dates/currency
4. Test locally
5. Adapt based on design reference

**Ready to build ProfileHeader? Run the steps above and come back when you're ready for design refinement!**

---

## Troubleshooting

### "Cannot find module '@/utilities/form/formatters'"
- Make sure you created the file at correct path: `src/utilities/form/formatters.ts`
- Run: `pnpm generate:importmap`

### "ProfileHeader not rendering"
- Check that user is being passed correctly from AccountPage
- Check that user has `createdAt` field (should exist in Payload User schema)
- Open DevTools → Console tab, check for errors

### "Colors look wrong"
- Verify design system CSS variables are loaded: check DevTools → Elements → Styles, search for `--ff-gold`
- Check that `src/app/(app)/globals.css` has color definitions
- Temporarily use hardcoded hex: `bg-[#e6be68]` to test

### "Button click does nothing"
- Make sure `<Link>` component is imported from `next/link`, not `react-router-dom`
- Check that `/account` route exists and is accessible

---

**Questions? This example is fully copy-paste-ready. Try it now!**
