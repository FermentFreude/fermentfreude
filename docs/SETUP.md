# FermentFreude — Full Setup Reference

Complete technical reference for the theme system, locale/i18n system, Tailwind CSS configuration, Payload CMS API, access control, and provider architecture.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Provider Stack](#provider-stack)
3. [Theme / Dark Mode System](#theme--dark-mode-system)
4. [Locale / i18n System](#locale--i18n-system)
5. [Tailwind CSS Configuration](#tailwind-css-configuration)
6. [Brand Design Tokens](#brand-design-tokens)
7. [Typography System](#typography-system)
8. [Payload CMS Configuration](#payload-cms-configuration)
9. [Collections & Globals](#collections--globals)
10. [Access Control & Roles](#access-control--roles)
11. [Payload REST API Reference](#payload-rest-api-reference)
12. [Authentication API](#authentication-api)
13. [Ecommerce & Stripe](#ecommerce--stripe)
14. [Middleware & Coming-Soon Gate](#middleware--coming-soon-gate)
15. [Auto-Translation (DeepL)](#auto-translation-deepl)
16. [Environment Variables](#environment-variables)
17. [Seed Scripts](#seed-scripts)
18. [Common Commands](#common-commands)

---

## Architecture Overview

```
Next.js 15 (App Router)  +  Payload CMS 3.x  +  MongoDB  +  Stripe
├── src/app/(app)/            → Frontend (public site)
├── src/app/(payload)/        → Payload admin panel
├── src/app/api/              → Custom API routes
├── src/app/coming-soon/      → Password-gated splash page
├── src/collections/          → Payload collection configs
├── src/globals/              → Payload global configs (Header, Footer)
├── src/providers/            → React context providers
├── src/access/               → Reusable access control functions
├── src/hooks/                → Payload lifecycle hooks
├── src/heros/                → Hero section components + config
├── src/blocks/               → Payload layout blocks
├── src/components/           → React UI components
└── src/plugins/index.ts      → Payload plugins (SEO, Forms, Ecommerce)
```

---

## Provider Stack

Providers wrap the entire app in `src/providers/index.tsx`. Order matters — outer providers are available to inner ones:

```
ThemeProvider          → Light/dark mode state + localStorage
  └─ LocaleProvider    → DE/EN locale state + cookie + reload
       └─ AuthProvider → User session (JWT via /api/users/me)
            └─ HeaderThemeProvider → Per-page header theme override
                 └─ SonnerProvider → Toast notifications
                      └─ EcommerceProvider → Cart, checkout, Stripe
                           └─ {children}
```

### Using providers in client components

```tsx
'use client'
import { useTheme } from '@/providers/Theme'
import { useLocale } from '@/providers/Locale'
import { useAuth } from '@/providers/Auth'
import { useHeaderTheme } from '@/providers/HeaderTheme'
```

---

## Theme / Dark Mode System

### How it works

| Layer | File | Purpose |
|-------|------|---------|
| Flash prevention | `src/providers/Theme/InitTheme/index.tsx` | Inline `<Script strategy="beforeInteractive">` that reads `localStorage['payload-theme']` and sets `data-theme` on `<html>` before paint |
| State management | `src/providers/Theme/index.tsx` | React context, `useTheme()` hook, syncs to `localStorage` and `data-theme` attribute |
| CSS activation | `src/app/(app)/globals.css` | `@custom-variant dark (&:is([data-theme='dark'] *))` + `[data-theme='dark']` CSS vars |
| Tailwind config | `tailwind.config.mjs` | `darkMode: ['selector', '[data-theme="dark"]']` |
| Opacity trick | `globals.css` | `html { opacity: 0 }` + `html[data-theme] { opacity: initial }` prevents FOUC |

### Theme types

```typescript
// src/providers/Theme/types.ts
type Theme = 'dark' | 'light'
```

### Storage

- **Key:** `payload-theme` (in `localStorage`)
- **Default:** `'light'`
- **Fallback:** OS preference via `prefers-color-scheme`

### Using in components

```tsx
'use client'
import { useTheme } from '@/providers/Theme'

function MyComponent() {
  const { theme, setTheme } = useTheme()
  // theme: 'light' | 'dark' | undefined
  // setTheme('dark') or setTheme(null) to reset to OS preference
}
```

### Tailwind dark mode classes

```tsx
// Use the `dark:` variant — it maps to [data-theme='dark'] via the custom variant
<div className="bg-white dark:bg-neutral-900 text-black dark:text-white">
```

### CSS variables (light vs dark)

All UI semantic colors change between themes via CSS custom properties in `:root` and `[data-theme='dark']` blocks in `globals.css`. Key variables:

| Variable | Light | Dark |
|----------|-------|------|
| `--background` | `oklch(100% 0 0deg)` (white) | `oklch(14.5% 0 0deg)` (near-black) |
| `--foreground` | `oklch(14.5% 0 0deg)` | `oklch(98.5% 0 0deg)` |
| `--card` | `oklch(96.5% ...)` | `oklch(17% 0 0deg)` |
| `--primary` | `oklch(20.5% ...)` (dark) | `oklch(98.5% ...)` (light) |
| `--border` | `oklch(92.2% ...)` | `oklch(26.9% ...)` |
| `--muted` | `oklch(97% ...)` | `oklch(26.9% ...)` |

### HeaderTheme provider

Allows individual pages/heroes to override the header bar's color scheme independently of the global theme. Used by hero components to set light headers over dark hero backgrounds:

```tsx
import { useHeaderTheme } from '@/providers/HeaderTheme'

// In a hero component:
const { setHeaderTheme } = useHeaderTheme()
useEffect(() => {
  setHeaderTheme('dark') // Force header to dark mode on this page
  return () => setHeaderTheme(undefined) // Reset on unmount
}, [])
```

---

## Locale / i18n System

### Two-layer architecture

1. **Payload CMS localization** (server-side) — stores content in DE and EN per field
2. **Client-side LocaleProvider** — user-facing locale toggle, cookie-based

### Payload CMS localization config

```typescript
// src/payload.config.ts
localization: {
  locales: [
    { label: 'Deutsch', code: 'de', fallbackLocale: 'en' },
    { label: 'English', code: 'en', fallbackLocale: 'de' },
  ],
  defaultLocale: 'de',
  fallback: true,
}
```

- Default locale: **German (de)**
- Fallback: if EN value is empty, DE is shown (and vice versa)
- Every field with `localized: true` stores separate values per locale

### Client-side locale

```typescript
// src/providers/Locale/index.tsx
type Locale = 'de' | 'en'

// Storage:
// - localStorage key: 'fermentfreude-locale'
// - Cookie: 'fermentfreude-locale' (max-age 1 year)
// - On change: page reloads so server components re-fetch with new locale
```

### Reading locale on the server

```typescript
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const locale = cookieStore.get('fermentfreude-locale')?.value || 'de'

// Then pass to Payload queries:
const page = await payload.find({
  collection: 'pages',
  locale,
  where: { slug: { equals: 'home' } },
})
```

### Using in client components

```tsx
'use client'
import { useLocale } from '@/providers/Locale'

function LocaleToggle() {
  const { locale, setLocale } = useLocale()
  // setLocale('en') → saves to localStorage + cookie, triggers page reload
}
```

---

## Tailwind CSS Configuration

### Dual config system (Tailwind v4)

FermentFreude uses Tailwind CSS v4 with **two config sources**:

1. **`tailwind.config.mjs`** — Traditional JS config (legacy compat, keyframes, animations, typography plugin)
2. **`src/app/(app)/globals.css`** — CSS-first config using `@theme`, `@custom-variant`, `@layer`

The CSS file imports the JS config via `@config '../../../tailwind.config.mjs'`.

### Key Tailwind settings

| Setting | Value |
|---------|-------|
| Dark mode | `['selector', '[data-theme="dark"]']` + `@custom-variant dark` |
| Content | `./src/**/*.{ts,tsx}` |
| Container max-width | `86rem` (2xl) |
| Container padding | `1rem` (sm) / `2rem` (md+) |
| Border radius | CSS variable `--radius: 0.625rem` |

### Breakpoints

| Name | Width |
|------|-------|
| `sm` | `40rem` (640px) |
| `md` | `48rem` (768px) |
| `lg` | `64rem` (1024px) |
| `xl` | `80rem` (1280px) |
| `2xl` | `86rem` (1376px) |

### Custom animations

| Class | Effect | Duration |
|-------|--------|----------|
| `animate-in` | Slide in from right | 0.2s |
| `animate-out` | Slide out to right | 0.2s |
| `animate-fadeIn` | Fade in | 0.3s |
| `animate-fadeOut` | Fade out | 0.3s |
| `animate-carousel` | Infinite horizontal scroll | 60s |
| `animate-slide-in-from-left` | Slide in from left | 0.2s |
| `animate-slide-out-to-left` | Slide out to left | 0.2s |
| `animate-blink` | Pulsing opacity | 1.4s |
| `animate-accordion-down` | Expand accordion | 0.2s |
| `animate-accordion-up` | Collapse accordion | 0.2s |

### Custom utility

```tsx
// animation-delay utility (from plugin)
<div className="animation-delay-200">...</div>
```

### Plugins

- `@tailwindcss/typography` — Prose styling for rich text
- Custom `animation-delay` utility plugin

---

## Brand Design Tokens

### Colors (CSS variables in `:root`)

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|-------|
| `--ff-ivory` | `#f9f0dc` | `bg-ff-ivory` | Primary warm background |
| `--ff-ivory-mist` | `#faf2e0` | `bg-ff-ivory-mist` | Hero sections, subtle bg |
| `--ff-cream` | `#fffef9` | `bg-ff-cream` | Lightest warm bg |
| `--ff-warm-gray` | `#ece5de` | `bg-ff-warm-gray` | Neutral warm surface |
| `--ff-charcoal` | `#4b4b4b` | `text-ff-charcoal` | Primary body text |
| `--ff-charcoal-dark` | `#403c39` | `text-ff-charcoal-dark` | Darker text variant |
| `--ff-near-black` | `#1a1a1a` | `bg-ff-near-black` | Nav bar, dark accents |
| `--ff-black` | `#1d1d1d` | `text-ff-black` | Headings |
| `--ff-gray-15` | `#262626` | `text-ff-gray-15` | Nav link text |
| `--ff-white-95` | `#f1f1f3` | `border-ff-white-95` | Light borders |
| `--ff-gold` | `#e6be68` | `text-ff-gold` | Accent, highlights |
| `--ff-gold-light` | `#edd195` | `bg-ff-gold-light` | Subtle gold accent |
| `--ff-gray-text` | `#595959` | `text-ff-gray-text` | Secondary text |
| `--ff-gray-text-light` | `#6b6b6b` | `text-ff-gray-text-light` | Tertiary text, subtitles |
| `--ff-border-light` | `#e8e4d9` | `border-ff-border-light` | Warm border |
| `--ff-card-gray` | `rgba(193,193,193,0.65)` | `bg-ff-card-gray` | Card overlays |

### UI semantic colors (light/dark aware)

These use `oklch()` and automatically switch between themes:

| Tailwind class | Purpose |
|----------------|---------|
| `bg-background` / `text-foreground` | Page background & base text |
| `bg-primary` / `text-primary-foreground` | Primary buttons |
| `bg-secondary` | Secondary surfaces |
| `bg-muted` / `text-muted-foreground` | Muted elements |
| `bg-card` / `text-card-foreground` | Card backgrounds |
| `bg-destructive` | Error/danger |
| `border-border` | Default borders |
| `ring-ring` | Focus rings |
| `bg-success` / `bg-warning` / `bg-error` | Status colors |

---

## Typography System

### Fonts (Adobe Fonts / Typekit)

Loaded via `<link rel="stylesheet" href="https://use.typekit.net/dtk7kir.css" />` in the root layout. Ensure your Adobe Fonts web project includes **Neue Haas Grotesk Text** and **Neue Haas Grotesk Display Pro**.

| Tailwind class | Font name | CSS variable | Weight | Usage |
|----------------|-----------|--------------|--------|-------|
| `font-sans` | `neue-haas-grotesk-text` | `--font-sans` | 400 | Body text, paragraphs, labels |
| `font-display` | `neue-haas-grotesk-display-pro` | `--font-display` | 700 | Headings, nav links, buttons |
| `font-mono` | System monospace stack | `--font-mono` | — | Code blocks |

### Base heading styles (`@layer base` in globals.css)

| Element | Font size | Line height | Letter spacing |
|---------|-----------|-------------|----------------|
| `h1` | `clamp(2.25rem, 5vw, 4rem)` | 1.1 | -0.025em |
| `h2` | `clamp(1.75rem, 4vw, 3rem)` | 1.15 | -0.02em |
| `h3` | `clamp(1.375rem, 3vw, 2rem)` | 1.25 | -0.015em |
| `h4` | `clamp(1.125rem, 2vw, 1.5rem)` | 1.3 | -0.01em |
| `h5`/`h6` | `1.125rem` | 1.4 | — |

All headings use `neue-haas-grotesk-display-pro` weight 700.

### Body defaults

```css
body {
  font-family: 'neue-haas-grotesk-text', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.6;
  letter-spacing: 0.005em;
}
```

### Rules

- **Never use Geist, Inter, or system fonts** — always Neue Haas Grotesk
- Nav links & headings: `font-display font-bold`
- Body text: `font-sans` (default)
- Uppercase labels: use `.label-uppercase` utility class

---

## Payload CMS Configuration

### Core config (`src/payload.config.ts`)

| Setting | Value |
|---------|-------|
| Database | MongoDB via `@payloadcms/db-mongodb` |
| Rich text editor | Lexical (Bold, Italic, Underline, Lists, Link, Indent, Table) |
| Admin user collection | `users` |
| Default locale | `de` |
| Locales | `de` (Deutsch), `en` (English) |
| Plugins | SEO, Form Builder, Ecommerce |

### Collections

| Slug | Purpose | Access | Key features |
|------|---------|--------|--------------|
| `users` | Auth collection, customers + admins | `publicAccess` for create, `adminOrSelf` for read/update | Roles: `admin`, `customer`. Joins: orders, cart, addresses |
| `pages` | CMS pages (home, about, etc.) | `adminOnly` for write, `adminOrPublishedStatus` for read | Hero fields, layout blocks, SEO, drafts + autosave, versions (50 max) |
| `categories` | Product categories | — | Localized |
| `media` | Uploaded images/files | — | Required localized `alt`, optional `caption`, uploads to `public/media/` |
| `products` | Ecommerce products | Via ecommerce plugin | Inventory, variants, gallery |
| `orders` | Customer orders | Via ecommerce plugin | Linked to users |
| `carts` | Shopping carts | Via ecommerce plugin | Linked to users |
| `addresses` | Shipping/billing addresses | Via ecommerce plugin | Linked to users |

### Globals

| Slug | Purpose | Key features |
|------|---------|--------------|
| `header` | Site navigation | Nav items array with links + dropdown sub-items, auto-translate hook |
| `footer` | Footer links | Nav items array (max 6), auto-translate hook |

### Plugins

```typescript
// src/plugins/index.ts
plugins: [
  seoPlugin({ generateTitle, generateURL }),          // Meta titles, descriptions, OG images
  formBuilderPlugin({ fields: { payment: false } }),   // Contact forms, etc.
  ecommercePlugin({                                    // Products, orders, carts, Stripe
    customers: { slug: 'users' },
    payments: { paymentMethods: [stripeAdapter()] },
    products: { productsCollectionOverride: ProductsCollection },
  }),
]
```

---

## Access Control & Roles

### Roles

| Role | Value | Description |
|------|-------|-------------|
| Admin | `'admin'` | Full access to admin panel and all data |
| Customer | `'customer'` | Default role, can view own data |

First user created is automatically promoted to `admin` via `ensureFirstUserIsAdmin` hook.

### Access control functions (`src/access/`)

| Function | Returns | Usage |
|----------|---------|-------|
| `publicAccess` | `true` | Anyone can access (account creation) |
| `adminOnly` | `boolean` | Only admins |
| `adminOrSelf` | Query constraint `{ id: { equals: user.id } }` | Admins see all, users see own |
| `adminOrPublishedStatus` | Query constraint `{ _status: { equals: 'published' } }` | Admins see all, public sees published only |
| `adminOnlyFieldAccess` | `boolean` | Field-level, admin only |
| `customerOnlyFieldAccess` | `boolean` | Field-level, customer only |
| `isAdmin` | `boolean` | Role check |
| `isDocumentOwner` | `boolean` | Checks document ownership |
| `adminOrCustomerOwner` | `boolean` or query | Admin or document owner |

### Utility

```typescript
// src/access/utilities.ts
checkRole(allRoles: string[], user?: User | null): boolean
// Returns true if user has ANY of the specified roles
```

---

## Payload REST API Reference

All endpoints are at `{NEXT_PUBLIC_SERVER_URL}/api/{collection}`.

### Pages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pages` | List pages (respects access control: published only for public) |
| `GET` | `/api/pages?where[slug][equals]=home&locale=de` | Get page by slug + locale |
| `GET` | `/api/pages/:id` | Get page by ID |
| `GET` | `/api/pages/:id?draft=true` | Get draft version (requires auth) |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List products |
| `GET` | `/api/products/:id` | Get product by ID |
| `GET` | `/api/products?where[slug][equals]=kombucha` | Get product by slug |

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/media` | List media |
| `GET` | `/api/media/:id` | Get media by ID (includes `url`, `alt`, `width`, `height`) |

### Globals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/globals/header?locale=de` | Get header nav items (German) |
| `GET` | `/api/globals/header?locale=en` | Get header nav items (English) |
| `GET` | `/api/globals/footer` | Get footer links |

### Common query parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `locale` | `?locale=en` | Return content in specific locale |
| `depth` | `?depth=2` | Populate relationship fields (0 = IDs only) |
| `where` | `?where[status][equals]=published` | Filter results |
| `sort` | `?sort=-createdAt` | Sort (prefix `-` for descending) |
| `limit` | `?limit=10` | Limit results per page |
| `page` | `?page=2` | Pagination |
| `select` | `?select[title]=true` | Select specific fields |
| `draft` | `?draft=true` | Include draft content (requires auth) |

---

## Authentication API

All auth endpoints use `credentials: 'include'` (HTTP-only cookies).

### Endpoints

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/api/users/create` | `{ email, password, passwordConfirm }` | `{ data }` |
| `POST` | `/api/users/login` | `{ email, password }` | `{ user, token, exp }` |
| `POST` | `/api/users/logout` | — | `{ message }` |
| `GET` | `/api/users/me` | — | `{ user }` (or `{ user: null }`) |
| `POST` | `/api/users/forgot-password` | `{ email }` | `{ message }` |
| `POST` | `/api/users/reset-password` | `{ token, password, passwordConfirm }` | `{ user }` |

### Using the Auth hook

```tsx
'use client'
import { useAuth } from '@/providers/Auth'

function MyComponent() {
  const { user, status, login, logout, create, forgotPassword, resetPassword, setUser } = useAuth()

  // status: 'loggedIn' | 'loggedOut' | undefined (loading)
  // user: User object or null

  await login({ email: 'user@example.com', password: 'secret' })
  await logout()
}
```

### Token settings

```typescript
// Users collection
auth: { tokenExpiration: 1209600 } // 14 days
```

---

## Ecommerce & Stripe

### Server-side (Payload plugin)

```typescript
ecommercePlugin({
  customers: { slug: 'users' },
  payments: {
    paymentMethods: [
      stripeAdapter({
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET,
      }),
    ],
  },
})
```

### Client-side (EcommerceProvider)

```tsx
<EcommerceProvider
  enableVariants={true}
  api={{
    cartsFetchQuery: {
      depth: 2,
      populate: {
        products: { slug: true, title: true, gallery: true, inventory: true },
        variants: { title: true, inventory: true },
      },
    },
  }}
  paymentMethods={[
    stripeAdapterClient({
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    }),
  ]}
>
```

### Stripe webhook

```bash
# Forward Stripe webhooks to local dev
pnpm stripe-webhooks
# → stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

---

## Middleware & Coming-Soon Gate

The middleware (`src/middleware.ts`) controls site access:

### How it works

1. If `PREVIEW_PASSWORD` env var is **not set** → site is fully public
2. If set → all routes redirect to `/coming-soon` unless:
   - Path is allowlisted (`/api`, `/admin`, `/_next`, `/media`, static files)
   - User has `preview-access=granted` cookie

### Password entry flow

```
User visits /coming-soon → enters password
  → POST /api/preview-access { password }
    → If correct: sets HttpOnly cookie 'preview-access=granted' (30 days)
    → Redirects to / with cookie → middleware allows through
```

### Allowlisted paths

`/coming-soon`, `/api`, `/admin`, `/_next`, `/favicon`, `/media`, `.svg`, `.png`, `.jpg`, `.ico`, `/robots.txt`

---

## Auto-Translation (DeepL)

See [TRANSLATION.md](./TRANSLATION.md) for full details.

### Quick summary

- **Hooks:** `autoTranslateCollection` (collections) + `autoTranslateGlobal` (globals)
- **Direction:** DE → EN only
- **Trigger:** `afterChange` hook when saving in German locale
- **Behavior:** Only translates empty/identical EN fields; never overwrites manual EN edits
- **Requires:** `DEEPL_API_KEY` in `.env` (gracefully degrades if missing)
- **Context flag:** Set `context.skipAutoTranslate = true` to skip

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `PAYLOAD_SECRET` | Payload encryption secret | Random string |
| `DATABASE_URL` | MongoDB connection URI | `mongodb://127.0.0.1/fermentfreude` |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL | `http://localhost:3000` |

### Payments (required for ecommerce)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | Stripe webhook secret (`whsec_...`) |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PREVIEW_PASSWORD` | Coming-soon gate password | Not set (site is public) |
| `PREVIEW_SECRET` | Draft preview secret | — |
| `DEEPL_API_KEY` | DeepL API key for auto-translation | Not set (no auto-translate) |

### Setup

```bash
cp .env.example .env
# Edit .env with your values
```

---

## Seed Scripts

### Header navigation

```bash
set -a && source .env && set +a && npx tsx src/scripts/seed-header.ts
```

Seeds the Header global with nav items (Home, Workshops, Shop, Chefs, About Us, Contact) + dropdown sub-items in both DE and EN.

### Home page hero

```bash
set -a && source .env && set +a && npx tsx src/scripts/seed-home-hero.ts
```

Creates/updates the Home page with the heroSlider hero section in both DE and EN. Includes heading ("Gutes Essen / Bessere Gesundheit / Echte Freude"), subtitle, and Shop + Workshops CTA buttons.

---

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm generate:types` | Regenerate `payload-types.ts` after schema changes |
| `pnpm generate:importmap` | Regenerate admin import map after adding components |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `npx tsc --noEmit --skipLibCheck` | TypeScript check without building |
| `pnpm stripe-webhooks` | Forward Stripe webhooks to localhost |
| `pnpm test` | Run integration + e2e tests |

---

*Last updated: February 13, 2026*
