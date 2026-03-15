# Design System Reference — FermentFreude Dashboard

> Quick reference for color palette, typography, spacing, and common component patterns used in the profile dashboard.

---

## 🎨 Color Palette Reference

### Primary Neutrals (Main UI)

```
┌─────────────────────────────────────────────────────┐
│ IVORY (#f9f0dc)                                     │
│ Light, warm background. Primary card & section bg.  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ IVORY MIST (#faf2e0)                                │
│ Slightly warm, subtle backgrounds, hover states.    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ CREAM (#fffef9)                                     │
│ Pure white alternative. Paper-like feel.            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ WARM GRAY (#ece5de)                                 │
│ Subtle dividers, disabled states, inactive elements.│
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ CHARCOAL (#4b4b4b)                                  │
│ Primary text color. Strong, readable on light bg.   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ CHARCOAL DARK (#403c39)                             │
│ Secondary text, active borders, strong emphasis.    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ NEAR BLACK (#1a1a1a)                                │
│ Very dark text, footer backgrounds, dark mode base. │
└─────────────────────────────────────────────────────┘
```

### Accent Colors

```
┌─────────────────────────────────────────────────────┐
│ GOLD (#e6be68)                                      │
│ Primary CTA buttons, hover states, premium accents. │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ GOLD LIGHT (#edd195)                                │
│ Light accent, secondary CTA, badge backgrounds.     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ OLIVE (#4b4f4a)                                     │
│ Secondary accent, success states, fermentation.     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ OLIVE DARK (#3a3e3a)                                │
│ Dark accent, hover on olive, strong emphasis.       │
└─────────────────────────────────────────────────────┘
```

### Functional Colors (from Tailwind)

```
RED (#d32f2f) → Error, destructive actions, warnings
GREEN (#2e7d32) → Success, confirmation, complete
BLUE (#1976d2) → Info, links, neutral actions
```

---

## 📝 Typography System

### Font Stack

```
Display (Headings, nav, buttons):
  font-family: 'neue-haas-grotesk-display', sans-serif
  font-weight: 700 (Bold)

Text (Body, labels, inputs):
  font-family: 'neue-haas-grotesk-text', sans-serif
  font-weight: 400 (Regular)
```

### Scale

| Element | Font | Size | Line Height | Letter Spacing | Example |
|---------|------|------|-------------|----------------|---------|
| **H1** | Display | `--text-display` | 1.2 | -0.02em | Page title, hero headline |
| **H2** | Display | `--text-heading` | 1.3 | 0 | Section heading |
| **H3** | Display | `--text-subheading` | 1.4 | 0 | Subsection heading |
| **Body LG** | Text | `--text-body-lg` | 1.6 | 0 | Intro paragraph, description |
| **Body** | Text | `--text-body` (1rem) | 1.6 | 0 | Regular paragraph, list items |
| **Body SM** | Text | `--text-body-sm` (.875rem) | 1.5 | 0 | Secondary text, hints |
| **Caption** | Text | `--text-caption` (.75rem) | 1.4 | 0 | Labels, timestamps, metadata |
| **Uppercase Label** | Text | Caption size | 1.4 | 0.1em | Button text, badges, tags |

### Usage in Components

```
Profile Header:
  Name:          <h2 className="text-heading">
  Email:         <p className="text-body">
  Member since:  <p className="text-caption">

Order Card:
  Order #:       <p className="text-body font-bold">
  Total:         <p className="text-body-lg font-bold">
  Date:          <p className="text-caption">

Form Labels:
  Field label:   <label className="label-uppercase">
  Field hint:    <p className="text-body-sm">
  Error msg:     <p className="text-caption text-red-600">
```

---

## 🎯 Spacing & Layout Scale

### Vertical Spacing (Section Blocks)

```
Section Large (Hero, major break):
  padding-block: clamp(6rem, 11vw, 10rem)   // 96px - 160px
  
Section Medium (Most sections):
  padding-block: clamp(4rem, 7vw, 6rem)    // 64px - 96px

Section Small (Tight sections):
  padding-block: clamp(3rem, 5vw, 4rem)    // 48px - 64px
```

**Example:**

```jsx
<section className="section-padding-md">
  <div className="container-padding">
    <h2 className="text-heading mb-content-lg">My Orders</h2>
    <OrdersGrid />
  </div>
</section>
```

### Horizontal Spacing (Content Width)

```
Container padding (all sides):
  padding-inline: clamp(1.5rem, 4vw, 6rem)  // 24px - 96px

Content max-widths:
  --content-narrow:  42rem   // 672px  (focused reading, forms)
  --content-medium:  56rem   // 896px  (most sections)
  --content-wide:    72rem   // 1152px (card grids)
  --content-full:    86rem   // 1376px (full width)
```

**Example:**

```jsx
<div className="container mx-auto container-padding">
  <div className="max-w-[var(--content-narrow)]">
    <AccountForm />  {/* Narrow for focused data entry */}
  </div>
</div>
```

### Content Gaps (Between Elements)

| Size | Value | Usage |
|------|-------|-------|
| `gap-content-xs` | ~0.75rem | Small spacing between elements |
| `gap-content-sm` | ~1rem | Form field spacing |
| `gap-content-md` | ~1.5rem | Card padding, list item spacing |
| `gap-content-lg` | ~2rem | Section spacing within container |
| `gap-content-xl` | ~3rem | Major section breaks |

**Example:**

```jsx
<div className="flex flex-col gap-content-lg">
  <ProfileHeader user={user} />
  <div className="space-y-content-md">
    <h2 className="text-heading">Account Settings</h2>
    <AccountForm />
  </div>
  <div className="space-y-content-md">
    <h2 className="text-heading">Addresses</h2>
    <AddressCardList addresses={addresses} />
  </div>
</div>
```

---

## 🎚 Border Radius

All rounded corners use CSS variables for consistency:

```css
--radius-sm:    0.375rem   /* 6px — inputs, small elements */
--radius-md:    0.625rem   /* 10px — buttons, badges */
--radius-lg:    1rem       /* 16px — standard cards */
--radius-xl:    1.5rem     /* 24px — large cards, modals */
--radius-2xl:   2rem       /* 32px — feature cards */
--radius-card:  1.75rem    /* 28px — product/order cards */
--radius-pill:  9999px     /* Fully rounded — pills, avatars */
```

**Application:**

```jsx
// Form input
<Input className="rounded-[var(--radius-sm)]" />

// Button
<Button className="rounded-[var(--radius-md)]" />

// Card
<div className="rounded-[var(--radius-lg)] border">

// Product/Order card
<div className="rounded-[var(--radius-card)]">

// Avatar
<Avatar className="rounded-[var(--radius-pill)]" />
```

---

## 🧩 Common Component Patterns

### Card Pattern (Reusable)

```jsx
<div className="bg-ff-cream border border-ff-border-light rounded-[var(--radius-lg)] p-content-lg">
  <div className="space-y-content-md">
    <h3 className="text-section-heading text-ff-charcoal">
      Card Title
    </h3>
    <p className="text-body text-ff-gray-text">
      Card content here
    </p>
    <div className="flex gap-2 pt-content-md">
      <Button className="bg-ff-gold text-ff-charcoal">Action</Button>
    </div>
  </div>
</div>
```

### Form Field Pattern (Reusable)

```jsx
<FormItem>
  <Label htmlFor="email" className="text-ff-charcoal font-display font-bold mb-2">
    Email Address
  </Label>
  <Input
    id="email"
    type="email"
    className="border-ff-border-light bg-ff-ivory text-ff-charcoal rounded-[var(--radius-sm)] focus:ring-ff-gold focus:border-ff-gold placeholder:text-ff-gray-text-light"
    placeholder="your@email.com"
  />
  {error && (
    <FormError className="text-red-600 text-caption mt-1" message={error.message} />
  )}
</FormItem>
```

### Button Variants

```jsx
// Primary CTA (Gold)
<Button className="bg-ff-gold text-ff-charcoal hover:bg-ff-gold-accent">
  Update Profile
</Button>

// Secondary (Outline)
<Button variant="outline" className="border-ff-border-light text-ff-charcoal hover:bg-ff-ivory-mist">
  Cancel
</Button>

// Danger/Destructive
<Button variant="destructive">
  Delete Address
</Button>

// Tertiary (Link style)
<Button variant="link" className="text-ff-gold hover:text-ff-gold-accent">
  Learn More
</Button>
```

### Badge Pattern

```jsx
<div className="inline-flex items-center gap-1 bg-ff-gold-light px-3 py-1 rounded-[var(--radius-pill)]">
  <span className="label-uppercase text-ff-charcoal text-xs font-bold">
    {status}
  </span>
</div>
```

### Empty State Pattern

```jsx
{items.length === 0 && (
  <div className="text-center py-content-xl">
    <icon className="mx-auto mb-content-md h-12 w-12 text-ff-warm-gray" />
    <h3 className="text-section-heading text-ff-charcoal mb-2">
      No items yet
    </h3>
    <p className="text-body text-ff-gray-text mb-content-lg">
      Start by adding your first item
    </p>
    <Button asChild className="bg-ff-gold text-ff-charcoal">
      <Link href="/shop">Browse Items</Link>
    </Button>
  </div>
)}
```

---

## 📱 Responsive Grid Examples

### 1-Column (Mobile) → 2-Column (Desktop)

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-content-lg">
  {items.map((item) => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>
```

### Sidebar + Main (Desktop Only)

```jsx
<div className="flex flex-col lg:flex-row gap-content-lg">
  {/* Sidebar (hidden on mobile) */}
  <aside className="hidden lg:w-52 lg:flex lg:flex-col gap-content-md">
    <DashboardNav />
  </aside>

  {/* Main content */}
  <main className="flex-1">
    {children}
  </main>
</div>
```

### Mobile Menu (Hamburger → Desktop Nav)

```jsx
<div>
  {/* Mobile: Hamburger */}
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" className="lg:hidden">
        ☰ Menu
      </Button>
    </SheetTrigger>
    <SheetContent side="left">
      <DashboardNav />
    </SheetContent>
  </Sheet>

  {/* Desktop: Sidebar */}
  <aside className="hidden lg:block">
    <DashboardNav />
  </aside>
</div>
```

---

## 🎭 Dark Mode & Variants (Future)

*If dark mode is needed in a future phase:*

```css
:root {
  --ff-bg-light: #fffef9;
  --ff-bg-dark: #1d1d1d;
  --ff-text-light: #4b4b4b;
  --ff-text-dark: #f1f1f3;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --ff-bg: var(--ff-bg-dark);
    --ff-text: var(--ff-text-dark);
  }
}
```

---

## ✨ Animation & Transitions

### Fade In (Page Load)

```css
.animate-fade-in {
  animation: fade-in 0.5s ease-out both;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Hover States

```css
/* Card hover */
.card {
  transition: all 0.2s ease-in-out;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Button hover */
button {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}
button:hover:not(:disabled) {
  background-color: var(--ff-gold-accent);
}

/* Input focus */
input {
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
input:focus {
  border-color: var(--ff-gold);
  box-shadow: 0 0 0 3px rgba(230, 190, 104, 0.1);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🔍 Accessibility Standards

### Color Contrast

- Primary text on ivory bg: **#4b4b4b on #f9f0dc** → 8.5:1 ✅ (WCAG AAA)
- Primary text on white bg: **#4b4b4b on #ffffff** → 8.8:1 ✅ (WCAG AAA)
- Gold button text: **#4b4b4b on #e6be68** → 5.2:1 ✅ (WCAG AA)
- Gray secondary text: **#6b6b6b on #ffffff** → 6.3:1 ✅ (WCAG AA)

### Typography

- **Minimum font size:** 14px (body-sm). Avoid smaller unless metadata.
- **Line height minimum:** 1.4 for readability
- **Link styling:** Underline + color change. Never color-only.
- **Focus indicators:** Always visible (blue outline or ring)

### Form Accessibility

```jsx
<FormItem>
  {/* Always associated labels */}
  <Label htmlFor="email" className="font-bold">
    Email Address
  </Label>
  <Input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-hint"
  />
  {/* Hints for context */}
  {error && (
    <FormError id="email-hint" message={error.message} role="alert" />
  )}
</FormItem>
```

---

## 🧪 Component Checklist

Before publishing a dashboard component, verify:

- [ ] Uses design system colors (no hardcoded hex)
- [ ] Uses design system typography (no raw text-lg/text-2xl)
- [ ] Uses design system spacing (uses `gap-content-*`, `p-content-*`)
- [ ] Border radius uses `--radius-*` variables
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Color contrast 4.5:1 minimum
- [ ] Loading/disabled states clearly visible
- [ ] Error messages accessible (aria-live, role="alert")
- [ ] Empty states handled with helpful copy
- [ ] Mobile touch targets 48x48px minimum
- [ ] SVG icons have accessible labels
- [ ] Form labels associated with inputs (for attribute)
- [ ] Translated for DE/EN if customer-facing

---

## 📋 Quick Reference Snippets

### Create a new scoped card component

```tsx
// src/components/dashboard/NewCardComponent.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const NewCard = () => {
  return (
    <Card className="border-ff-border-light rounded-[var(--radius-lg)]">
      <CardHeader>
        <CardTitle className="text-section-heading text-ff-charcoal">
          Title
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-content-md">
        {/* content */}
      </CardContent>
    </Card>
  )
}
```

### Create a new form

```tsx
// Remember: validate with Zod, use react-hook-form, follow FormItem pattern
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formSchema } from '@/utilities/validators'

export const MyForm = () => {
  const form = useForm({ resolver: zodResolver(formSchema) })
  // ... implement
}
```

### Create a new dashboard page

```tsx
// src/app/(app)/(account)/new-page/page.tsx
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

export default async function NewPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent('/new-page')}`)
  }

  return (
    <section>
      <div className="container-padding section-padding-md">
        <h1 className="text-display text-ff-charcoal mb-content-lg">Page Title</h1>
        {/* content */}
      </div>
    </section>
  )
}
```

---

**Next Step:** Upload your design references (Figma links or screenshots), and I'll adapt these patterns to match your visual direction! 🚀
