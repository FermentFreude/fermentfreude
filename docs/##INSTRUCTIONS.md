# Developer Instructions — FermentFreude

> **This is the single source of truth.** All other instruction files (`.github/copilot-instructions.md`, `.cursorrules`, `docs/AGENTS.md`) inherit from this document.

**Project:** FermentFreude — Next.js 15 (App Router) + Payload CMS 3.x + Stripe
**Goal:** Implement features with senior full-stack discipline: minimal code, clear separation of concerns, secure by default, accessible UI.

---

## 1 — Infrastructure

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   MongoDB Atlas M0                   │
│                                                      │
│  Stores: TEXT data only                              │
│  • Page titles, slugs, block content                 │
│  • Product names, prices, descriptions               │
│  • User accounts, orders                             │
│  • Media RECORDS (filename, alt, dimensions,         │
│    URL pointing to where the file lives)             │
│                                                      │
│  Does NOT store: actual image files                  │
└─────────────────────────────────────────────────────┘
          ↕  Payload CMS reads/writes
┌─────────────────────────────────────────────────────┐
│               Cloudflare R2 (S3-compatible)          │
│                                                      │
│  Stores: the actual image BYTES                      │
│  • Every uploaded photo, logo, banner                │
│  • Served globally via CDN URL:                      │
│    https://<R2_PUBLIC_URL>/media/<filename>.webp      │
│                                                      │
│  10 GB free tier — no egress fees                    │
└─────────────────────────────────────────────────────┘
```

### What Lives Where

| Layer | Technology | Configuration |
|-------|-----------|---------------|
| **Database** | MongoDB Atlas M0 (free tier) | `@payloadcms/db-mongodb` (Mongoose adapter). **No transactions** — always sequential writes, never `Promise.all` for mutations. |
| **File storage** | Cloudflare R2 | `@payloadcms/storage-s3` (S3-compatible API). Configured in `src/plugins/index.ts`. |
| **Media collection** | `src/collections/Media.ts` | `slug: 'media'`, upload with `alt` (text, required, localized) and `caption` (richText, localized). Public read. |
| **Payments** | Stripe | `@payloadcms/plugin-ecommerce` with `stripeAdapter()`. |
| **Fonts** | Neue Haas Grotesk | Adobe Typekit. `font-sans` = body (Text), `font-display` = headings/nav/buttons (Display Pro). |
| **Locales** | `de` (default) + `en` | Bidirectional fallback. DeepL auto-translation hooks in production. |

### Environments

| Environment | Database | R2 Bucket | Deploys from |
|-------------|----------|-----------|-------------|
| **Production** | `fermentfreude` | `fermentfreude-media` | `main` branch (auto via Vercel) |
| **Staging** | `fermentfreude-staging` | `fermentfreude-media-staging` | `staging` branch (preview) |

- Local `.env` should point to **staging** values for safe development.
- **Never** develop against production database locally.
- Seed scripts run against whichever DB your `.env` points to — be careful.

### Environment Variables (R2)

```bash
# Production
R2_BUCKET=fermentfreude-media
R2_PUBLIC_URL=https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev

# Staging (use these in local .env)
R2_BUCKET=fermentfreude-media-staging
R2_PUBLIC_URL=https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev

# Shared credentials (same API token for both buckets)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| **`main`** | Production — auto-deploys to Vercel. **Never push directly.** Only merge from `staging`. |
| **`staging`** | Integration branch. Feature branches merge here first. Test, then merge → `main`. |

**Workflow:**
1. Create feature branch from `staging`: `git checkout -b feature/xyz staging`
2. Push feature branch, open PR into `staging`
3. After review + CI passes, merge into `staging`
4. Test on staging (local or preview deploy)
5. When ready for production, merge `staging` → `main`

### Why Not Vercel Blob?

The project migrated from Vercel Blob to Cloudflare R2 because:
- **10 GB free storage** (vs 500 MB on Vercel Blob Hobby)
- **Zero egress fees** — no surprise bills for image traffic
- **CDN-served globally** — fast from any location
- **S3-compatible API** — uses the standard `@payloadcms/storage-s3` plugin

### How Image Serving Works

1. Editor uploads image in `/admin` → Payload sends bytes to R2 via S3 API
2. MongoDB stores a media record (filename, alt text, dimensions, R2 URL)
3. Frontend renders `<Media resource={...} />` → Next.js `<Image>` with the R2 URL
4. Browser fetches the image from the R2 CDN

### Product Pricing — Cents System (CRITICAL)

**All product prices MUST be stored in cents (integers), not euros (decimals).**

This is the industry standard for e-commerce and is required by Stripe. The system automatically converts for display.

#### Why Cents?

1. **Stripe requires it:** Payment intents accept only integers in smallest currency unit (cents for EUR)
2. **No floating-point errors:** JavaScript decimals have precision bugs (`0.1 + 0.2 = 0.30000000000000004`)
3. **Industry standard:** Shopify, WooCommerce, Stripe, PayPal all use cents/pennies
4. **Automatic conversion:** Display components handle euros → no manual conversion needed

#### Configuration

In `src/plugins/index.ts`, the ecommerce plugin is configured:

```typescript
currencies: {
  defaultCurrency: 'EUR',
  supportedCurrencies: [
    {
      code: 'EUR',
      label: 'Euro (€)',
      symbol: '€',
      decimals: 2,  // ← Tells Payload: "divide by 100 for display"
    }
  ]
}
```

This `decimals: 2` setting means: **all prices are stored in cents and automatically divided by 100 when displayed**.

#### How It Works

| Layer | Format | Example | Auto-Convert? |
|-------|--------|---------|---------------|
| **Database** | Cents (integer) | `9900` | ❌ No |
| **Seed scripts** | Cents (integer) | `priceInEUR: 9900` | ❌ No |
| **Admin input** | Cents (integer) | Enter: `9900` | ❌ No |
| **Cart display** | Euros (formatted) | Shows: "€99.00" | ✅ Yes |
| **Product pages** | Euros (formatted) | Shows: "€99.00" | ✅ Yes |
| **Checkout** | Euros (formatted) | Shows: "€99.00" | ✅ Yes |
| **Stripe API** | Cents (integer) | Sends: `9900` | ❌ No |

#### Adding New Products

**In seed scripts** (vouchers, shop items, workshops):

```typescript
// ✅ Correct:
const product = await payload.create({
  collection: 'products',
  data: {
    title: 'Starter Kit',
    priceInEUR: 4999,        // €49.99 in cents
    priceInEUREnabled: true,
    inventory: 100,
    // ...
  },
})

// ❌ Wrong:
priceInEUR: 49.99  // Will display as €0.49!
```

**In /admin** (manual product creation):

Editors must enter prices **in cents**:
- Want €79.99? → Enter: `7999`
- Want €120.00? → Enter: `12000`
- Want €5.50? → Enter: `550`

**Admin UI helper:** The price field in `/admin` shows:
> "Price in EUR (in cents, e.g., 9900 = €99.00)"

#### Display Components

**Automatic conversion** via `<Price>` component:

```tsx
// In any component:
<Price amount={9900} />  
// Displays: €99.00

// Price.tsx uses formatCurrency() which automatically:
// 9900 / 100 = 99.00 → "€99.00"
```

**For workshop products** (special case in CartModal):

```tsx
// Manual conversion only for workshop line items:
€{(price / 100).toFixed(2)}  // 9900 → "€99.00"

// Regular products use <Price> component (auto-converts)
```

#### Product Types

This system applies to **ALL products**:

- **Workshop bookings:** €99/person = `priceInEUR: 9900`
- **Vouchers:** €50 voucher = `priceInEUR: 5000`
- **Shop items:** €24.99 kit = `priceInEUR: 2499`
- **Merchandise:** €12.50 mug = `priceInEUR: 1250`

#### Common Pitfalls

❌ **Don't** store prices as floats:
```typescript
priceInEUR: 99.00  // BAD: Will show as €0.99
```

❌ **Don't** manually convert everywhere:
```typescript
// BAD: Manual conversion in every component
<span>€{product.priceInEUR / 100}</span>
```

✅ **Do** use the Price component:
```typescript
// GOOD: Automatic conversion
<Price amount={product.priceInEUR} />
```

#### Verification

After seeding products, verify prices are correct:

```bash
# Check product prices in database
npx tsx --env-file=.env src/scripts/check-prices.ts

# Should output:
# workshop-kombucha: €99.00 (9900 cents) ✓
```

---

## 2 — Operating Principles

### Build Like a Senior

- **Minimize new files.** Reuse existing modules/components whenever possible.
- Add a new file **only if** the file truly doesn't exist and the responsibility is new.

### Separation of Concerns

- **UI**: presentation + interaction only (in `src/components/` or `src/app/(app)/`)
- **Domain logic**: pure functions (validation, mapping) in `src/utilities/`
- **Data access**: Payload queries, Stripe calls in service modules
- **Side effects**: webhooks, email — isolated and auditable

### Fewer Moving Parts

- Avoid new dependencies unless absolutely necessary.
- If a feature can be done with existing tooling (Payload, Next.js, Stripe), do that.

---

## 3 — Before Writing Code (mandatory)

### Step A — Analyze First

1. **Where does the feature belong?**
   - Payload schema? → `src/collections/` or `src/globals/`
   - Page/UI? → `src/app/(app)/` or `src/components/`
   - API/webhook? → `src/app/(payload)/` or `src/endpoints/`

2. **Search the codebase for:**
   - existing patterns in similar collections (Products, Pages)
   - existing components in `src/components/`
   - existing utilities in `src/utilities/`
   - existing blocks in `src/blocks/`

3. **Propose the smallest change set.**

### Step B — Confirm Integration Points

- Payload collections/globals involved
- External systems (Stripe, Brevo, DeepL)
- Data flow: **CMS → API → UI** (or webhook → handler → persistence)

---

## 4 — File & Code Organization

### Project Structure

```
src/
├── app/
│   ├── (app)/              # Frontend routes
│   └── (payload)/          # Payload admin (auto-generated, don't edit)
├── access/                 # Permission rules
├── blocks/                 # Content blocks (one block = one section)
├── collections/            # Content types (Categories, Media, Pages, Products/, Users/)
├── components/             # React components
├── endpoints/              # Custom API endpoints
├── fields/                 # Reusable field definitions (link, slug, hero)
├── fonts/                  # Font files
├── globals/                # Global settings (Footer, Header)
├── heros/                  # Hero components (HeroSlider, HeroCarousel, etc.)
├── hooks/                  # Lifecycle hooks
├── lib/                    # Utility libs (generate-meta, utils)
├── plugins/                # Plugin configuration (ecommerce, seo, storage)
├── providers/              # Context providers (Auth, HeaderTheme, Theme)
├── scripts/                # Seed scripts (one per page)
├── utilities/              # Helper functions
├── payload-types.ts        # Auto-generated types (don't edit manually)
└── payload.config.ts       # Main Payload config
```

### File Naming Conventions

- Collections: `PascalCase.ts` (e.g., `Workshops.ts`)
- Components: `PascalCase/index.tsx` or `PascalCase.tsx`
- Utilities: `kebab-case.ts` (e.g., `format-workshop-date.ts`)
- API routes: `route.ts` in folder
- Seed scripts: `seed-<page>.ts` in `src/scripts/`

---

## 5 — Block Architecture — One Block = One Section (CRITICAL)

Every content block must represent **one self-contained page section**, not an entire page.

### Rules

1. **One block = one section.** A block handles exactly one concern: a CTA, text, team grid, slider, contact form. Never bundle multiple sections into one block.
2. **Editors compose pages from blocks.** Pages are built by adding blocks to the `layout` field in `/admin`, NOT separate admin tabs.
3. **NO SEPARATE ADMIN TABS FOR PAGE SECTIONS.** ❌ **NEVER** create separate admin tabs (e.g., "Hero", "Voucher CTA", "FAQ") for page-specific content. Instead, **create blocks** that can be reused. Every section should be a block that editors add to the Content tab.
   - ❌ Bad: Pages collection → separate "Hero" tab, "Voucher CTA" tab, "FAQ" tab (locked to one page, not reusable)
   - ✅ Good: Pages collection → Content tab → [HeroWorkshop block], [VoucherCTA block], [WorkshopFAQ block] (reusable across any page)
4. **Blocks are reusable across pages.** Design for reuse, not for a specific page. A "Seasonal Calendar" block can appear on any page, not just workshops.
5. **No per-page route files.** The dynamic `[slug]/page.tsx` renders ALL CMS pages. Never create `src/app/(app)/about/page.tsx`.
6. **Block size guide:**
   - ✅ Good (40–120 lines config): `CallToAction`, `Content`, `WorkshopSlider`, `TeamGrid`, `ContactForm`, `HeroWorkshop`, `VoucherCTA`
   - ❌ Bad (500+ lines): monolith blocks that bundle hero + story + team + sponsors + form

### How to Add a New Block

1. Create config: `src/blocks/MyBlock/config.ts`
2. Create component: `src/blocks/MyBlock/Component.tsx`
3. Register in `src/collections/Pages/index.ts` → `layout.blocks` array
4. Register in `src/blocks/RenderBlocks.tsx` → `blockComponents` map
5. Generate types: `pnpm generate:types && pnpm generate:importmap`
6. Seed data: add to relevant page seed script, register in `src/scripts/seed-all.ts`

---

## 6 — CMS-Editable with Hardcoded Defaults Pattern

### The Three-Layer Approach

1. **Schema** — Add editable fields to the Payload collection or global.
2. **Hardcoded Defaults** — Component defines English defaults. Site works with empty DB.
3. **CMS Override** — CMS data always wins: `const resolved = cmsValue ?? DEFAULT_VALUE`
4. **Seed Script** — Populates CMS with defaults for both locales.

### Component Pattern

```typescript
// 1. Define defaults (English)
const DEFAULT_TITLE = 'Discover the Art of Fermentation'

// 2. Render: CMS overrides default
const title = cmsData?.title ?? DEFAULT_TITLE
```

---

## 7 — Images & Media (Cloudflare R2)

### NEVER Use Static File Paths

This project stores all images in **Cloudflare R2** via `@payloadcms/storage-s3`. Static file paths (`/assets/images/...`) do NOT work in production.

### Rules

- Every image field: `type: 'upload', relationTo: 'media'`
- Render with: `<Media resource={...} />` (from `@/components/Media`). **Never** `<img src="/assets/...">`
- No image set? Render: `<div className="bg-[#ECE5DE]" />`
- Type guard for resolved media: `typeof image === 'object' && image !== null && 'url' in image`
- Hero/above-fold images: always set `priority` on `<Media>` component
- Source images for seeding live in `public/assets/images/` — used only by seed scripts, never served directly

### Image Optimization for Seeds

- **Always use `optimizedFile()`** from `src/scripts/seed-image-utils.ts`
- **Never upload raw PNGs** from design tools (often 5–25 MB each)
- `optimizedFile()` converts to WebP + resizes (typically 80–90% savings)
- Presets:
  - `IMAGE_PRESETS.hero` — full-width banners (max 1920px, quality 80)
  - `IMAGE_PRESETS.card` — product photos, cards, portraits (max 1200px, quality 80)
  - `IMAGE_PRESETS.logo` — sponsor logos, icons (max 600px, quality 80)
- Use `readLocalFile()` only for SVGs (cannot be rasterized)

---

## 8 — Bilingual & Admin-Ready Rules (NEVER SKIP)

These rules apply to **every** new feature, section, field, or content block — no exceptions.

### A — Every Visible Text is a CMS Field

- Every piece of visible content (text, images, links, labels, button text) MUST be a field in the Payload schema.
- Never rely on hardcoded-only text.

### B — All Text Fields Are Localized

- Every text, textarea, and richText field MUST have `localized: true`.
- Locales: `de` (default / German) and `en` (English).

### C — Seed BOTH Languages — Always

- Every seed script MUST populate both `locale: 'de'` and `locale: 'en'`.
- Always pass `context: { skipRevalidate: true, skipAutoTranslate: true }`.
- After seeding, all fields must appear pre-filled and editable in `/admin` for both languages.

### D — Bilingual Seeding — Reuse IDs Across Locales

- Arrays, blocks, and nested items are NOT localized — only text fields inside them are.
- Payload auto-generates IDs for array items and blocks on each save.
- **Seed order:**
  1. Save DE first (Payload generates IDs)
  2. Read back the saved document to capture all generated IDs
  3. Save EN reusing those exact same IDs
- Skipping this orphans DE localized text when EN creates new IDs.
- Save ALL sections (hero + layout blocks) together per locale.
- **Sequential writes** (no `Promise.all`) on MongoDB Atlas M0 to avoid WriteConflict.

### E — Hardcoded Defaults in English

- Component defaults are English.
- CMS always wins: `const resolved = cmsValue ?? DEFAULT_VALUE`

### F — Admin Dashboard = Non-Coder Friendly

- Editors control everything from `/admin` without developer help.
- Use `admin.condition` to show fields only when relevant.
- Use `admin.description` to explain every non-obvious field.
- Use clear `label` values on every field.
- Required fields must always have seeded data.

### G — DeepL Auto-Translation

- `autoTranslateCollection` / `autoTranslateGlobal` hooks auto-translate DE → EN via DeepL on save.
- These are for **production editors**, NOT for development seeding.
- All seed scripts MUST use `context: { skipAutoTranslate: true }`.

### H — After Every Schema Change

1. `pnpm generate:types` — update TypeScript types
2. `pnpm generate:importmap` — if components changed
3. `npx tsc --noEmit` — verify zero TypeScript errors
4. Re-run the relevant seed script

---

## 9 — Next.js Best Practices (App Router — Next.js 15)

### Server vs Client Components

- Default to **server components** (no `'use client'` directive).
- Use client components only for: stateful UI, browser-only APIs, React hooks.

### Data Fetching

- Fetch in server components using Payload Local API:
  ```typescript
  import { getPayload } from 'payload'
  import config from '@payload-config'
  const payload = await getPayload({ config })
  const data = await payload.find({ collection: 'products' })
  ```
- **CRITICAL:** If fetching pages/blocks with nested image fields in arrays (e.g., `experienceCards[].image`), use `depth: 1` or higher to resolve image relationships:
  ```typescript
  // ❌ Wrong — image returns as ID string only
  const page = await payload.find({ collection: 'pages', depth: 0 })
  
  // ✅ Correct — image resolves to full object with url
  const page = await payload.find({ collection: 'pages', depth: 1 })
  ```
  See `docs/AGENTS.md` → "Relationship Depth" for details.
- Never expose secrets in client code.

### Route Groups

- `(app)` — Frontend pages visible to users
- `(payload)` — Admin panel (auto-generated, don't modify)

---

## 10 — Styling (TailwindCSS 4 + shadcn/ui)

- Use Tailwind utility classes directly in JSX.
- Use `cn()` from `src/lib/utils.ts` for conditional classes.
- Use shadcn/ui components (Button, Input, Label, Select, etc.) from `src/components/ui/`.
- Typography/spacing tokens defined in `docs/DESIGN_SYSTEM.md` — **never** hardcode font sizes or spacing.
- Ensure WCAG AA contrast (4.5:1 minimum).

### Typography

| Tailwind class | Font | Usage |
|---------------|------|-------|
| `font-sans` | `neue-haas-grotesk-text` | Body text, paragraphs, labels |
| `font-display` | `neue-haas-grotesk-display` | Headings, nav links, buttons |

**Never use Geist, Inter, or system fonts.**

---

## 11 — Security Requirements

- Validate all incoming data (API routes, webhooks, forms).
- Use environment variables for secrets — never commit `.env`.
- Apply least privilege (Payload roles: admin, customer).
- When passing `user` to Local API, ALWAYS set `overrideAccess: false`.
- Always pass `req` to nested operations in hooks for transaction safety.

---

## 12 — Accessibility (WCAG 2.1 AA)

- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`.
- Labels for every input.
- Keyboard navigation (Tab, Enter, Escape).
- Visible focus states.
- Proper heading hierarchy (H1 → H2 → H3).
- Alt text for meaningful images; empty alt for decorative.
- Buttons are `<button>`, not `<div>`.

---

## 13 — Performance & SEO

- Use Next.js `<Image>` / `<Media>` — not `<img>`.
- Set `priority` on hero/above-fold images.
- Lazy load below-fold components with `dynamic()`.
- Use `metadata` export in App Router pages.
- Use `generateMeta` from `src/lib/generate-meta.ts`.

---

## 14 — Seed Scripts

### Pattern

- One script per page: `src/scripts/seed-<page>.ts`
- Registered in `src/scripts/seed-all.ts` (scripts map + allOrder array)
- Run all: `pnpm seed` | Run one: `pnpm seed about` | Force overwrite: `pnpm seed about --force`
- **Non-destructive by default:** if a page already has content (layout blocks), the seed skips it to protect admin changes. Use `--force` to overwrite.
- Each seed populates hero + layout blocks for both locales

### Seed Script Template

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  const payload = await getPayload({ config })
  const forceRecreate = process.argv.includes('--force')
  const ctx = { skipRevalidate: true, skipAutoTranslate: true }

  // 0. Non-destructive check — skip if page already has content
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'my-page' } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0 && !forceRecreate) {
    const layout = Array.isArray(existing.docs[0].layout) ? existing.docs[0].layout : []
    if (layout.length > 0) {
      payload.logger.info('⏭️  Page already has content. Skipping. Use --force to overwrite.')
      process.exit(0)
    }
  }

  // 1. Save DE first
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    data: { /* German values */ },
    context: ctx,
  })

  // 2. Save EN (reuse IDs from DE save)
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    data: { /* English values */ },
    context: ctx,
  })

  payload.logger.info('✓ Seeded successfully (DE + EN)!')
  process.exit(0)
}

seed()
```

Run with: `set -a && source .env && set +a && npx tsx src/scripts/seed-<feature>.ts`

---

## 15 — Testing & Commands

```bash
pnpm dev                  # Development server
pnpm build                # Production build
pnpm start                # Production server
pnpm lint                 # ESLint check
pnpm lint:fix             # Auto-fix issues
pnpm generate:types       # Regenerate Payload types
pnpm generate:importmap   # Regenerate import map
pnpm test:int             # Integration tests
pnpm test:e2e             # E2E tests
pnpm seed                 # Seed ALL pages (skips pages with existing content)
pnpm seed home            # Seed one page (skips if content exists)
pnpm seed home --force    # Force overwrite existing content
```

---

## 15.5 — Common Issues & Troubleshooting

### Admin Can't Edit Fields (Field Access Denied Error)

**Problem:** Admin user is logged in but gets "You are not allowed to make this change" when trying to edit product fields (e.g., gallery, images).

**Cause:** The ecommerce plugin applies field-level access controls. By default, `customerOnlyFieldAccess` restricts fields to users with the 'customer' role. Admin users don't have this role and are therefore blocked.

**Solution:** The `customerOnlyFieldAccess` function in `src/access/customerOnlyFieldAccess.ts` is configured to allow admins to always access fields:

```typescript
// Admins can always edit
if (isAdmin(args)) {
  return true  // Admin bypass
}

// Otherwise, only customers
if (req.user) return checkRole(['customer'], req.user)
```

If you still get access denied errors:
1. Check the admin panel → Your Account → verify your role is 'admin'
2. Clear browser cache and refresh `/admin`
3. Verify you're logged in (check network tab)
4. Contact developer if issue persists

---

## 16 — Checklist Before Finishing Any Feature

- [ ] Schema field added with `localized: true`, `label`, and `admin.description`?
- [ ] Component has English hardcoded default as fallback?
- [ ] Component reads CMS data and overrides default?
- [ ] All images use `<Media resource={...}>` — no static `/assets/` paths?
- [ ] Seed script uses `optimizedFile()` for image uploads?
- [ ] Seed script populates DE and EN with ID reuse?
- [ ] Seed script uses `skipAutoTranslate: true`?
- [ ] Types regenerated (`pnpm generate:types`)?
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)?
- [ ] Admin panel shows the field, pre-filled, editable?
- [ ] New block is small & focused (one section)?
- [ ] Block registered in Pages `layout.blocks` array AND `RenderBlocks.tsx`?
- [ ] Seed script registered in `seed-all.ts`?

---

## 17 — Online Course System: Architecture & User Flow

### Overview

FermentFreude has a full digital course system: purchase → auto-enroll → watch lessons → track progress. This section is the reference for that entire flow.

### Collections & Globals Involved

| Name | Type | Purpose |
|------|------|---------|
| `products` | Collection | Products with `courseSlug` field identify digital courses |
| `orders` | Collection | Created by Stripe webhook on payment completion |
| `enrollments` | Collection | Created automatically after order is paid |
| `courseProgress` | Collection | One doc per lesson × user; tracks which lessons are done |
| `BasicFermentationCourse` | Global | CMS content for the course (modules, lessons, hero copy, learn items) |
| `users` | Collection | Auth. Has `role: 'admin' | 'customer'` |

### Digital Product Detection

A product is a **digital/course product** if `product.courseSlug` is non-null.

**Cart populate caveat:** The ecommerce plugin's cart API does NOT include `courseSlug` in its populate fields. To detect digital products client-side (e.g., in `CheckoutPage.tsx`), use the product `slug` field (which IS populated):

```typescript
const isAllDigital = cart?.items?.every((item) => {
  const p = item.product as { courseSlug?: string | null; slug?: string | null }
  return Boolean(p.courseSlug) || (typeof p.slug === 'string' && p.slug.includes('course'))
})
```

### Auto-Enrollment Hook

**File:** `src/collections/Orders/autoEnrollOnPurchase.ts`  
**Trigger:** `afterChange` hook on `orders` collection, `operation === 'create'` (Stripe creates the order after payment)

**Logic:**
1. Iterates `order.items` — skips if no items
2. For each item, resolves the product (may be ID string or object)
3. If `product.courseSlug` is set, checks if enrollment already exists for `{ user, courseSlug }`
4. If not enrolled, creates an `enrollments` doc: `{ user: order.customer, courseSlug, orderId, enrolledAt }`
5. Sequential writes (no `Promise.all`) — MongoDB Atlas M0 has no transactions

**Important:** The hook fires on `operation === 'create'`, not `'update'`. Orders are created by Stripe after payment, never manually. An order in `status: 'processing'` is a valid paid order.

### Enrollment Collection

**File:** `src/collections/Enrollments.ts`

```typescript
{
  slug: 'enrollments',
  fields: [
    { name: 'user',       type: 'relationship', relationTo: 'users',    required: true },
    { name: 'courseSlug', type: 'text',         required: true },
    { name: 'orderId',    type: 'text' },
    { name: 'enrolledAt', type: 'date',         required: true },
  ]
}
```

Access: users can read their own; admins read/write all.

### Course Progress Collection

**File:** `src/collections/CourseProgress.ts` (or similar)

One doc per `{ user, courseSlug, lessonId }`. Tracks lesson completion.  
API: `GET/POST /api/courses/[courseSlug]/progress` — returns completed lesson IDs, marks lessons done.

### User Flow (End-to-End)

```
1. DISCOVER
   /courses (listing page)
      └─ Shows course overview, previews first 2 lessons (free, no auth needed)
      └─ "Buy Now" button → /products/basic-fermentation-course

2. LEARN (free preview, no auth)
   /courses/basic-fermentation
      └─ First 2 lessons playable via LessonList video modal
      └─ "Get This Course" → /products/basic-fermentation-course

3. PURCHASE PAGE
   /products/basic-fermentation-course  (CourseProductPage component)
      └─ Renders when product.courseSlug is set (bypasses generic product layout)
      └─ Shows: hero + price, what you'll learn, curriculum preview, testimonials
      └─ "Add to Cart" button → cart popover opens
      └─ "Preview before you buy" → /courses/basic-fermentation

4. CHECKOUT
   /checkout  (CheckoutPage component)
      └─ isAllDigital = true (product slug contains 'course')
      └─ Address section: shows "Digital product — no shipping address required"
      └─ canGoToPayment = (user || email) — no address needed
      └─ "Go to payment" → Stripe Elements form appears
      └─ User completes card payment

5. PAYMENT & ENROLLMENT
   Stripe webhook → /api/[...slug]/stripe-webhook
      └─ Creates Order doc in Payload (status: 'processing')
      └─ afterChange hook: autoEnrollOnPurchase fires
      └─ Creates Enrollment doc: { user, courseSlug: 'basic-fermentation', orderId }

6. ACCESS COURSE
   /account/learning
      └─ Queries enrollments for current user
      └─ Shows enrolled courses with progress bar
      └─ "Continue" → /courses/basic-fermentation

7. WATCH & TRACK
   /courses/basic-fermentation
      └─ Fetches enrollment (isEnrolled = true → all lessons unlocked)
      └─ CurriculumWithProgress: click lesson → marks progress via API
      └─ Progress stored in courseProgress collection
      └─ Progress bar updates in real-time (client-side optimistic + server sync)
```

### Key Files

| File | Role |
|------|------|
| `src/app/(app)/courses/page.tsx` | Course listing — first 2 lessons always unlocked for preview |
| `src/app/(app)/courses/basic-fermentation/page.tsx` | Full course page — checks enrollment, renders CurriculumWithProgress |
| `src/app/(app)/courses/basic-fermentation/CurriculumWithProgress.tsx` | Client component — lesson list, progress tracking, video modal |
| `src/app/(app)/products/[slug]/page.tsx` | Product page — routes to `CourseProductPage` when `product.courseSlug` is set |
| `src/components/product/CourseProductPage.tsx` | Beautiful course landing page with hero, curriculum, CTA |
| `src/components/checkout/CheckoutPage.tsx` | Checkout — skips address for digital (isAllDigital check) |
| `src/app/(app)/account/learning/page.tsx` | User's enrolled courses dashboard |
| `src/collections/Enrollments.ts` | Enrollment records |
| `src/collections/Orders/autoEnrollOnPurchase.ts` | Hook: creates enrollment after order |
| `src/app/api/courses/[courseSlug]/progress/route.ts` | GET/POST lesson progress |
| `src/scripts/seed-courses-page.ts` | Seeds `/courses` page CMS fields (hero text, modules list, button URL) |

### Lesson Preview Logic (courses listing page)

In `src/app/(app)/courses/page.tsx`, after assembling modules from CMS or defaults, the first 2 lessons across all modules are **always forced to be unlocked** with a fallback `videoUrl`. This allows visitors to preview without purchasing.

```typescript
let previewCount = 0
const modules = rawModules.map((mod) => ({
  ...mod,
  lessons: mod.lessons.map((lesson) => {
    if (previewCount < 2) {
      previewCount++
      return { ...lesson, locked: false, videoUrl: lesson.videoUrl ?? FALLBACK_URL }
    }
    return lesson
  }),
}))
```

### Adding Future Courses

1. Create a new `Product` with `courseSlug: 'your-course-slug'` → `/products/[slug]` auto-renders `CourseProductPage`
2. Create a new `Global` for the course content (copy `BasicFermentationCourse` pattern)
3. Create `/courses/[your-slug]/page.tsx` using the same pattern as `basic-fermentation/page.tsx`
4. Add `your-course-slug` to the `COURSE_SLUGS` allowlist in the progress API route
5. The enrollment hook already handles any `courseSlug` — no changes needed there
6. Seed the product with `courseSlug` set (never seed `courseSlug` as empty string)
7. Update `src/scripts/seed-courses-page.ts` with the new course module list (or add a separate seed script)
8. Run `pnpm seed courses-page --force` to refresh the CMS `onlineCoursesModules` and button URL

### Courses Page CMS Fields & Seed

The `/courses` page uses an `onlineCourses` group in the Pages collection (not layout blocks).
Key field: `onlineCoursesModulesButtonUrl` — **must point to `/courses/basic-fermentation#curriculum`** (the course viewer).
Visitors land on the curriculum, see locked lessons, and a banner with **"Get This Course"** linking to `/products/basic-fermentation-course` (the purchase page).

Editors can manage all text content from `/admin → Pages → courses`.
To pre-populate from code: `pnpm seed courses-page` (non-destructive) or `pnpm seed courses-page --force`.

### OrderStatus Values

`'processing' | 'completed' | 'cancelled' | 'refunded'`

- Orders are created as `'processing'` immediately after Stripe payment
- Enrollment fires on `operation === 'create'` — so `'processing'` is the normal paid state
- Do NOT check for `'completed'` as a payment gate; it's only for admin-managed fulfillment states

---

_Last Updated: March 18, 2026_
_Project: FermentFreude Digital Ecosystem_
_Stack: Next.js 15 + Payload CMS 3.x + TailwindCSS 4 + shadcn/ui + Cloudflare R2 + Stripe_
